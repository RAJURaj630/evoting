const Voter = require('../models/Voter');
const AuditLog = require('../models/AuditLog');
const JWTService = require('../utils/jwt');
const encryption = require('../utils/encryption');

class AuthController {
  // Register new voter
  async register(req, res) {
    try {
      const { voterId, name, email, password } = req.body;

      // Check if voter already exists
      const existingVoter = await Voter.findOne({
        $or: [{ voterId }, { email }]
      });

      if (existingVoter) {
        return res.status(400).json({
          success: false,
          message: 'Voter ID or email already exists'
        });
      }

      // Hash password
      const passwordHash = await Voter.hashPassword(password);

      // Create voter
      const voter = await Voter.create({
        voterId,
        name,
        email,
        passwordHash
      });

      // Generate token
      const token = JWTService.generateToken({ id: voter._id });

      // Log registration
      await AuditLog.logAction({
        action: 'LOGIN',
        userId: voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { action: 'REGISTRATION' },
        status: 'SUCCESS',
        resource: 'AUTH'
      });

      res.status(201).json({
        success: true,
        message: 'Voter registered successfully',
        data: {
          voter: {
            id: voter._id,
            voterId: voter.voterId,
            name: voter.name,
            email: voter.email,
            hasVoted: voter.hasVoted
          },
          token
        }
      });

    } catch (error) {
      await AuditLog.logAction({
        action: 'LOGIN',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          action: 'REGISTRATION',
          error: error.message 
        },
        status: 'FAILURE',
        resource: 'AUTH'
      });

      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  // Login voter
  async login(req, res) {
    try {
      const { voterId, password } = req.body;

      // Find voter and include password hash for verification
      const voter = await Voter.findOne({ voterId }).select('+passwordHash');

      if (!voter || !(await voter.checkPassword(password))) {
        await AuditLog.logAction({
          action: 'LOGIN',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { voterId, reason: 'Invalid credentials' },
          status: 'FAILURE',
          resource: 'AUTH'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid voter ID or password'
        });
      }

      if (!voter.isActive) {
        await AuditLog.logAction({
          action: 'LOGIN',
          userId: voter._id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { reason: 'Account deactivated' },
          status: 'FAILURE',
          resource: 'AUTH'
        });

        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      // Update last login
      voter.lastLogin = new Date();
      await voter.save();

      // Generate token
      const token = JWTService.generateToken({ id: voter._id });

      await AuditLog.logAction({
        action: 'LOGIN',
        userId: voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { hasVoted: voter.hasVoted },
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
            hasVoted: voter.hasVoted
          },
          token
        }
      });

    } catch (error) {
      await AuditLog.logAction({
        action: 'LOGIN',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { error: error.message },
        status: 'FAILURE',
        resource: 'AUTH'
      });

      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  // Get current voter profile
  async getProfile(req, res) {
    try {
      res.json({
        success: true,
        data: {
          voter: {
            id: req.voter._id,
            voterId: req.voter.voterId,
            name: req.voter.name,
            email: req.voter.email,
            hasVoted: req.voter.hasVoted,
            createdAt: req.voter.createdAt
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  // Logout (client-side token destruction)
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
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
}

module.exports = new AuthController();