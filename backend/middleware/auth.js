const jwt = require('jsonwebtoken');
const Voter = require('../models/Voter');

/**
 * Authentication Middleware
 * Protects routes requiring authentication
 */

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get voter from token
      req.user = await Voter.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Voter not found. Token invalid.'
        });
      }

      // Check if voter is active
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive. Please contact support.'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired. Please login again.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Check if voter has completed verification
 */
exports.requireVerification = async (req, res, next) => {
  try {
    if (!req.user.isFullyVerified()) {
      return res.status(403).json({
        success: false,
        message: 'Please complete verification process',
        verificationStatus: req.user.verificationStatus,
        nextStep: !req.user.aadhaarVerified ? 'aadhaar_verification' :
                  !req.user.faceVerified ? 'biometric_verification' :
                  'device_binding'
      });
    }
    next();
  } catch (error) {
    console.error('Verification check error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification check failed',
      error: error.message
    });
  }
};

/**
 * Check if voter has not voted yet
 */
exports.requireNotVoted = async (req, res, next) => {
  try {
    if (req.user.hasVoted) {
      return res.status(400).json({
        success: false,
        message: 'You have already cast your vote',
        voteTimestamp: req.user.voteTimestamp
      });
    }
    next();
  } catch (error) {
    console.error('Vote check error:', error);
    res.status(500).json({
      success: false,
      message: 'Vote check failed',
      error: error.message
    });
  }
};

/**
 * Admin authorization (for future use)
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    next();
  };
};

module.exports = exports;
