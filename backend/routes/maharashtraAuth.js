const express = require('express');
const router = express.Router();
const maharashtraAuthController = require('../controllers/maharashtraAuthController');
const authMiddleware = require('../middleware/auth');
const rateLimitMiddleware = require('../middleware/rateLimit');

// Public routes
router.post('/register', 
  rateLimitMiddleware.createAccountLimiter,
  maharashtraAuthController.register
);

router.post('/verify-otp', 
  rateLimitMiddleware.createAccountLimiter,
  maharashtraAuthController.verifyOTP
);

router.post('/resend-otp', 
  rateLimitMiddleware.createAccountLimiter,
  maharashtraAuthController.resendOTP
);

router.post('/login', 
  rateLimitMiddleware.loginLimiter,
  maharashtraAuthController.login
);

router.get('/constituencies', 
  maharashtraAuthController.getConstituencies
);

// Protected routes
router.use(authMiddleware.protect);

router.get('/profile', maharashtraAuthController.getProfile);
router.post('/logout', maharashtraAuthController.logout);

module.exports = router;
