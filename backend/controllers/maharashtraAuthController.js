const Voter = require('../models/Voter');
const AuditLog = require('../models/AuditLog');
const Election = require('../models/Election');
const JWTService = require('../utils/jwt');
const otpService = require('../services/otpService');
const encryptionService = require('../services/encryptionService');

class MaharashtraAuthController {
  // Register new voter with OTP verification
  async register(req, res) {
    try {
      const { 
        voterId, 
        name, 
        email, 
        phone, 
        password, 
        constituency,
        aadhaarNumber 
      } = req.body;

      // Validate required fields
      if (!voterId || !name || !email || !phone || !password || !constituency) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided'
        });
      }

      // Check if voter already exists
      const existingVoter = await Voter.findOne({
        $or: [{ voterId }, { email }, { phone }]
      });

      if (existingVoter) {
        return res.status(400).json({
          success: false,
          message: 'Voter ID, email, or phone number already exists'
        });
      }

      // Hash password
      const passwordHash = await Voter.hashPassword(password);

      // Create voter (initially unverified)
      const voter = await Voter.create({
        voterId,
        name,
        email,
        phone,
        constituency,
        passwordHash,
        aadhaarNumber: aadhaarNumber || undefined,
        verificationStatus: 'pending',
        isEligible: false
      });

      // Generate and send OTP
      const otpResult = await otpService.generateAndSendOTP(email, phone, name, 'email');
      
      if (!otpResult.success) {
        // Delete the voter if OTP sending fails
        await Voter.findByIdAndDelete(voter._id);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification OTP'
        });
      }

      // Store OTP secret temporarily
      voter.otpSecret = otpResult.secret;
      await voter.save();

      // Log registration success
      await AuditLog.logAction({
        action: 'REGISTRATION_SUCCESS',
        userId: voter._id,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent'),
        details: {
          email,
          constituency,
          timestamp: new Date()
        },
        status: 'SUCCESS',
        resource: 'AUTH'
      });

      res.status(201).json({
        success: true,
        message: 'Registration initiated. Please verify OTP sent to your email.',
        data: {
          voterId: voter.voterId,
          email: voter.email,
          otpSent: true,
          expiresAt: otpResult.expiresAt
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      await AuditLog.logAction({
        action: 'REGISTRATION_ATTEMPT',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          error: error.message 
        },
        status: 'FAILURE',
        resource: 'AUTH'
      });

      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Verify OTP and complete registration
  async verifyOTP(req, res) {
    try {
      const { voterId, otp } = req.body;

      if (!voterId || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Voter ID and OTP are required'
        });
      }

      // Find voter
      const voter = await Voter.findOne({ voterId }).select('+otpSecret');
      
      if (!voter) {
        return res.status(404).json({
          success: false,
          message: 'Voter not found'
        });
      }

      if (voter.otpVerified) {
        return res.status(400).json({
          success: false,
          message: 'OTP already verified'
        });
      }

      // Verify OTP
      const isValidOTP = otpService.verifyOTP(otp, voter.otpSecret);
      
      if (!isValidOTP) {
        await AuditLog.logAction({
          action: 'OTP_VERIFICATION',
          userId: voter._id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { reason: 'Invalid OTP' },
          status: 'FAILURE',
          resource: 'AUTH'
        });

        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Mark as verified and eligible
      voter.otpVerified = true;
      voter.otpVerifiedAt = new Date();
      voter.verificationStatus = 'verified';
      voter.isEligible = true;
      voter.isActive = true;
      voter.otpSecret = undefined; // Remove OTP secret
      await voter.save();

      // Generate JWT token
      const token = JWTService.generateToken({ 
        id: voter._id,
        role: voter.role,
        constituency: voter.constituency
      });

      await AuditLog.logAction({
        action: 'OTP_VERIFICATION',
        userId: voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          registrationCompleted: true,
          constituency: voter.constituency
        },
        status: 'SUCCESS',
        resource: 'AUTH'
      });

      res.json({
        success: true,
        message: 'Registration completed successfully',
        data: {
          voter: {
            id: voter._id,
            voterId: voter.voterId,
            name: voter.name,
            email: voter.email,
            constituency: voter.constituency,
            role: voter.role,
            hasVoted: voter.hasVoted,
            isEligible: voter.isEligible
          },
          token
        }
      });

    } catch (error) {
      console.error('OTP verification error:', error);
      
      res.status(500).json({
        success: false,
        message: 'OTP verification failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Resend OTP
  async resendOTP(req, res) {
    try {
      const { voterId, method = 'email' } = req.body;

      const voter = await Voter.findOne({ voterId });
      
      if (!voter) {
        return res.status(404).json({
          success: false,
          message: 'Voter not found'
        });
      }

      if (voter.otpVerified) {
        return res.status(400).json({
          success: false,
          message: 'Account already verified'
        });
      }

      // Check rate limiting
      const lastOTPTime = voter.updatedAt;
      const otpResult = await otpService.resendOTP(
        voter.email, 
        voter.phone, 
        voter.name, 
        method, 
        lastOTPTime
      );

      if (!otpResult.success) {
        return res.status(429).json({
          success: false,
          message: otpResult.message
        });
      }

      // Update OTP secret
      voter.otpSecret = otpResult.secret;
      await voter.save();

      await AuditLog.logAction({
        action: 'OTP_RESEND',
        userId: voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { method },
        status: 'SUCCESS',
        resource: 'AUTH'
      });

      res.json({
        success: true,
        message: otpResult.message,
        data: {
          expiresAt: otpResult.expiresAt
        }
      });

    } catch (error) {
      console.error('Resend OTP error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Enhanced login with security checks
  async login(req, res) {
    try {
      const { voterId, password } = req.body;

      if (!voterId || !password) {
        return res.status(400).json({
          success: false,
          message: 'Voter ID and password are required'
        });
      }

      // Find voter and include password hash
      const voter = await Voter.findOne({ voterId }).select('+passwordHash');

      if (!voter) {
        await AuditLog.logAction({
          action: 'LOGIN_ATTEMPT',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { voterId, reason: 'Voter not found' },
          status: 'FAILURE',
          resource: 'AUTH'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid voter ID or password'
        });
      }

      // Check if account is locked
      if (voter.isLocked()) {
        await AuditLog.logAction({
          action: 'LOGIN_ATTEMPT',
          userId: voter._id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { reason: 'Account locked' },
          status: 'FAILURE',
          resource: 'AUTH'
        });

        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts'
        });
      }

      // Verify password
      const isValidPassword = await voter.checkPassword(password);
      
      if (!isValidPassword) {
        await voter.incLoginAttempts();
        
        await AuditLog.logAction({
          action: 'LOGIN_ATTEMPT',
          userId: voter._id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { reason: 'Invalid password', attempts: voter.loginAttempts + 1 },
          status: 'FAILURE',
          resource: 'AUTH'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid voter ID or password'
        });
      }

      // Check if voter is verified and eligible
      if (!voter.otpVerified || !voter.isEligible) {
        return res.status(403).json({
          success: false,
          message: 'Account not verified. Please complete OTP verification.',
          requiresVerification: true
        });
      }

      if (!voter.isActive) {
        await AuditLog.logAction({
          action: 'LOGIN_ATTEMPT',
          userId: voter._id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { reason: 'Account deactivated' },
          status: 'FAILURE',
          resource: 'AUTH'
        });

        return res.status(403).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      // Reset login attempts on successful login
      await voter.resetLoginAttempts();
      
      // Update last login
      voter.lastLogin = new Date();
      await voter.save();

      // Generate device fingerprint
      const deviceFingerprint = encryptionService.generateDeviceFingerprint(
        req.get('User-Agent'),
        req.ip
      );

      // Generate JWT token with additional claims
      const token = JWTService.generateToken({ 
        id: voter._id,
        role: voter.role,
        constituency: voter.constituency,
        deviceFingerprint
      });

      await AuditLog.logAction({
        action: 'LOGIN_SUCCESS',
        userId: voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          constituency: voter.constituency,
          hasVoted: voter.hasVoted,
          deviceFingerprint
        },
        status: 'SUCCESS',
        resource: 'AUTH'
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          voter: {
            id: voter._id,
            voterId: voter.voterId,
            name: voter.name,
            email: voter.email,
            constituency: voter.constituency,
            role: voter.role,
            hasVoted: voter.hasVoted,
            isEligible: voter.isEligible,
            lastLogin: voter.lastLogin
          },
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      
      await AuditLog.logAction({
        action: 'LOGIN_ATTEMPT',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { error: error.message },
        status: 'FAILURE',
        resource: 'AUTH'
      });

      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get constituencies list
  async getConstituencies(req, res) {
    try {
      const constituencies = [
        'Mumbai South', 'Mumbai North', 'Mumbai North-East', 'Mumbai North-West',
        'Mumbai North-Central', 'Mumbai South-Central', 'Pune', 'Baramati',
        'Nagpur', 'Wardha', 'Nashik', 'Maval', 'Thane', 'Kalyan',
        'Aurangabad', 'Jalna', 'Solapur', 'Madha', 'Kolhapur', 'Hatkanangle',
        'Sangli', 'Satara', 'Ratnagiri-Sindhudurg', 'Raigad', 'Ahmednagar',
        'Shirdi', 'Beed', 'Osmanabad', 'Latur', 'Nanded', 'Hingoli',
        'Parbhani', 'Jalgaon', 'Raver', 'Buldhana', 'Akola', 'Amravati',
        'Yavatmal-Washim', 'Chandrapur', 'Gadchiroli-Chimur', 'Bhandara-Gondiya',
        'Gondia', 'Dhule', 'Nandurbar'
      ];

      res.json({
        success: true,
        data: { constituencies }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch constituencies'
      });
    }
  }

  // Get current voter profile
  async getProfile(req, res) {
    try {
      const voter = req.voter;
      
      res.json({
        success: true,
        data: {
          voter: {
            id: voter._id,
            voterId: voter.voterId,
            name: voter.name,
            email: voter.email,
            phone: voter.phone,
            constituency: voter.constituency,
            role: voter.role,
            hasVoted: voter.hasVoted,
            isEligible: voter.isEligible,
            verificationStatus: voter.verificationStatus,
            createdAt: voter.createdAt,
            lastLogin: voter.lastLogin
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      await AuditLog.logAction({
        action: 'LOGOUT',
        userId: req.voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'SUCCESS',
        resource: 'AUTH'
      });

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new MaharashtraAuthController();
