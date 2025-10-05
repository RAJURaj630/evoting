const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const rateLimitMiddleware = require('../middleware/rateLimit');

// All admin routes require authentication and admin role
router.use(authMiddleware.protect);
router.use(adminController.checkAdminRole);

// Dashboard and statistics
router.get('/dashboard', 
  rateLimitMiddleware.apiLimiter,
  adminController.getDashboardStats
);

// Candidate management
router.get('/candidates', 
  rateLimitMiddleware.apiLimiter,
  adminController.getCandidates
);

router.post('/candidates', 
  rateLimitMiddleware.apiLimiter,
  adminController.addCandidate
);

router.put('/candidates/:id', 
  rateLimitMiddleware.apiLimiter,
  adminController.updateCandidate
);

router.delete('/candidates/:id', 
  rateLimitMiddleware.apiLimiter,
  adminController.deleteCandidate
);

// Voter management
router.get('/voters', 
  rateLimitMiddleware.apiLimiter,
  adminController.getVoters
);

router.put('/voters/:id/status', 
  rateLimitMiddleware.apiLimiter,
  adminController.updateVoterStatus
);

// Election management
router.get('/elections', 
  rateLimitMiddleware.apiLimiter,
  adminController.getElections
);

router.post('/elections', 
  rateLimitMiddleware.apiLimiter,
  adminController.createElection
);

router.put('/elections/:id/status', 
  rateLimitMiddleware.apiLimiter,
  adminController.updateElectionStatus
);

// Audit logs
router.get('/audit-logs', 
  rateLimitMiddleware.apiLimiter,
  adminController.getAuditLogs
);

module.exports = router;
