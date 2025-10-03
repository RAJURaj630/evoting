const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const JWTService = require('../utils/jwt');
const { validateVoterRegistration } = require('../middleware/validation');
const auditLogger = require('../middleware/auditLogger');

// Public routes
router.post('/register', 
  validateVoterRegistration, 
  auditLogger('LOGIN', { resource: 'AUTH', details: { action: 'REGISTRATION' } }),
  authController.register
);

router.post('/login', 
  auditLogger('LOGIN', { resource: 'AUTH' }),
  authController.login
);

// Protected routes
router.get('/profile', 
  JWTService.protect, 
  auditLogger('PROFILE_UPDATE', { resource: 'AUTH' }),
  authController.getProfile
);

router.post('/logout', 
  JWTService.protect, 
  auditLogger('LOGOUT', { resource: 'AUTH' }),
  authController.logout
);

module.exports = router;