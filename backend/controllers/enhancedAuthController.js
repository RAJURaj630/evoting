const Voter = require('../models/Voter');
const jwt = require('jsonwebtoken');
const aadhaarService = require('../services/aadhaarService');
const biometricService = require('../services/biometricService');
const deviceService = require('../services/deviceService');
const AuditLog = require('../models/AuditLog');

/**
 * Enhanced Authentication Controller
 * Implements multi-factor authentication with Aadhaar, biometrics, and device binding
 */

// Generate JWT token
const generateToken = (voterId) => {
  return jwt.sign({ id: voterId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30m'
  });
};

// Extract IP address from request
const getIpAddress = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         req.ip;
};

/**
 * Step 1: Initial Registration with Aadhaar
 */
exports.registerWithAadhaar = async (req, res) => {
  try {
    const { voterId, name, email, phone, password, aadhaarNumber, epicNumber } = req.body;

    // Validate required fields
    if (!voterId || !name || !email || !password || !aadhaarNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if voter already exists
    const existingVoter = await Voter.findOne({ 
      $or: [{ voterId }, { email }, { aadhaarNumber }] 
    });

    if (existingVoter) {
      return res.status(400).json({
        success: false,
        message: 'Voter with this ID, email, or Aadhaar already exists'
      });
    }

    // Verify Aadhaar
    const aadhaarVerification = await aadhaarService.verifyAadhaar(aadhaarNumber, name);
    
    if (!aadhaarVerification.success) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar verification failed',
        details: aadhaarVerification.message
      });
    }

    // Hash password
    const passwordHash = await Voter.hashPassword(password);

    // Create voter
    const voter = await Voter.create({
      voterId,
      name,
      email,
      phone,
      passwordHash,
      aadhaarNumber,
      epicNumber,
      aadhaarVerified: true,
      aadhaarVerificationDate: new Date(),
      verificationStatus: 'partial'
    });

    // Log action
    await AuditLog.logAction({
      action: 'REGISTER',
      userId: voter._id,
      ipAddress: getIpAddress(req),
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { step: 'aadhaar_verified' }
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please complete biometric verification.',
      data: {
        voterId: voter.voterId,
        name: voter.name,
        email: voter.email,
        verificationStatus: voter.verificationStatus,
        nextStep: 'biometric_verification'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * Step 2: Biometric Verification (Face + Liveness)
 */
exports.verifyBiometrics = async (req, res) => {
  try {
    const { voterId, faceImageData } = req.body;

    if (!voterId || !faceImageData) {
      return res.status(400).json({
        success: false,
        message: 'Voter ID and face image are required'
      });
    }

    // Find voter
    const voter = await Voter.findOne({ voterId });
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    // Perform biometric verification
    const biometricResult = await biometricService.verifyBiometrics(
      faceImageData,
      voter.faceImageHash
    );

    if (!biometricResult.success) {
      await AuditLog.logAction({
        action: 'BIOMETRIC_VERIFICATION',
        userId: voter._id,
        ipAddress: getIpAddress(req),
        status: 'FAILURE',
        details: { reason: biometricResult.message }
      });

      return res.status(400).json({
        success: false,
        message: biometricResult.message
      });
    }

    // Update voter
    voter.faceImageHash = biometricResult.faceHash;
    voter.faceVerified = true;
    voter.livenessCheckPassed = true;
    voter.biometricVerificationDate = new Date();
    voter.verificationStatus = 'verified';
    voter.isEligible = true;
    await voter.save();

    // Log action
    await AuditLog.logAction({
      action: 'BIOMETRIC_VERIFICATION',
      userId: voter._id,
      ipAddress: getIpAddress(req),
      status: 'SUCCESS',
      details: { 
        livenessScore: biometricResult.livenessResult.score,
        matchScore: biometricResult.matchResult.score
      }
    });

    res.json({
      success: true,
      message: 'Biometric verification successful',
      data: {
        verificationStatus: voter.verificationStatus,
        isEligible: voter.isEligible,
        nextStep: 'device_binding'
      }
    });
  } catch (error) {
    console.error('Biometric verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Biometric verification failed',
      error: error.message
    });
  }
};

/**
 * Step 3: Device Binding
 */
exports.bindDevice = async (req, res) => {
  try {
    const { voterId, deviceData } = req.body;

    if (!voterId || !deviceData) {
      return res.status(400).json({
        success: false,
        message: 'Voter ID and device data are required'
      });
    }

    const voter = await Voter.findOne({ voterId });
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    const ipAddress = getIpAddress(req);
    const bindResult = await deviceService.bindDevice(voter, deviceData, ipAddress);

    if (!bindResult.success) {
      return res.status(400).json(bindResult);
    }

    await AuditLog.logAction({
      action: 'DEVICE_BIND',
      userId: voter._id,
      ipAddress,
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: { deviceId: bindResult.device.deviceId }
    });

    res.json({
      success: true,
      message: 'Device bound successfully',
      data: bindResult.device
    });
  } catch (error) {
    console.error('Device binding error:', error);
    res.status(500).json({
      success: false,
      message: 'Device binding failed',
      error: error.message
    });
  }
};

/**
 * Enhanced Login with Multi-Factor Authentication
 */
exports.login = async (req, res) => {
  try {
    const { voterId, password, deviceData } = req.body;

    if (!voterId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Voter ID and password are required'
      });
    }

    // Find voter with password
    const voter = await Voter.findOne({ voterId }).select('+passwordHash');
    if (!voter) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (voter.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Verify password
    const isPasswordValid = await voter.checkPassword(password);
    if (!isPasswordValid) {
      await voter.incLoginAttempts();
      
      await AuditLog.logAction({
        action: 'LOGIN',
        userId: voter._id,
        ipAddress: getIpAddress(req),
        status: 'FAILURE',
        details: { reason: 'invalid_password' }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check verification status
    if (!voter.isFullyVerified()) {
      return res.status(403).json({
        success: false,
        message: 'Please complete verification process',
        verificationStatus: voter.verificationStatus,
        nextStep: !voter.aadhaarVerified ? 'aadhaar_verification' :
                  !voter.faceVerified ? 'biometric_verification' :
                  'device_binding'
      });
    }

    // Validate device if provided
    if (deviceData) {
      const deviceValidation = await deviceService.validateDevice(voter, deviceData);
      
      if (!deviceValidation.valid) {
        return res.status(403).json({
          success: false,
          message: deviceValidation.message,
          requiresBinding: deviceValidation.requiresBinding
        });
      }
    }

    // Reset login attempts
    await voter.resetLoginAttempts();

    // Update last login
    voter.lastLogin = new Date();
    await voter.save();

    // Generate token
    const token = generateToken(voter._id);

    // Log successful login
    await AuditLog.logAction({
      action: 'LOGIN',
      userId: voter._id,
      ipAddress: getIpAddress(req),
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS'
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
          hasVoted: voter.hasVoted,
          verificationStatus: voter.verificationStatus,
          preferredLanguage: voter.preferredLanguage
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Get voter profile
 */
exports.getProfile = async (req, res) => {
  try {
    const voter = await Voter.findById(req.user.id);
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    res.json({
      success: true,
      data: {
        voterId: voter.voterId,
        name: voter.name,
        email: voter.email,
        phone: voter.phone,
        hasVoted: voter.hasVoted,
        voteTimestamp: voter.voteTimestamp,
        verificationStatus: voter.verificationStatus,
        aadhaarVerified: voter.aadhaarVerified,
        faceVerified: voter.faceVerified,
        preferredLanguage: voter.preferredLanguage,
        accessibilityNeeds: voter.accessibilityNeeds,
        boundDevices: deviceService.getBoundDevices(voter),
        createdAt: voter.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update accessibility preferences
 */
exports.updateAccessibility = async (req, res) => {
  try {
    const { preferredLanguage, accessibilityNeeds } = req.body;

    const voter = await Voter.findById(req.user.id);
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    if (preferredLanguage) {
      voter.preferredLanguage = preferredLanguage;
    }

    if (accessibilityNeeds) {
      voter.accessibilityNeeds = {
        ...voter.accessibilityNeeds,
        ...accessibilityNeeds
      };
    }

    await voter.save();

    res.json({
      success: true,
      message: 'Accessibility preferences updated',
      data: {
        preferredLanguage: voter.preferredLanguage,
        accessibilityNeeds: voter.accessibilityNeeds
      }
    });
  } catch (error) {
    console.error('Update accessibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

module.exports = exports;
