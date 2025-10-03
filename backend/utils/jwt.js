const jwt = require('jsonwebtoken');
const Voter = require('../models/Voter');

class JWTService {
  // Generate JWT token
  generateToken(payload, expiresIn = process.env.JWT_EXPIRE || '30m') {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Extract token from request
  extractToken(req) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return req.headers.authorization.substring(7);
    }
    return null;
  }

  // Middleware to protect routes
  async protect(req, res, next) {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      const decoded = this.verifyToken(token);
      
      // Check if voter still exists
      const voter = await Voter.findById(decoded.id).select('-passwordHash');
      if (!voter) {
        return res.status(401).json({
          success: false,
          message: 'Voter no longer exists.'
        });
      }

      if (!voter.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated.'
        });
      }

      req.voter = voter;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  }

  // Middleware to check if voter has not voted
  async requireNotVoted(req, res, next) {
    try {
      if (req.voter.hasVoted) {
        return res.status(403).json({
          success: false,
          message: 'You have already cast your vote.'
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error while checking vote status.'
      });
    }
  }
}

module.exports = new JWTService();