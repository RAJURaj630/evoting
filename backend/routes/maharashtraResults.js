const express = require('express');
const router = express.Router();
const maharashtraResultsController = require('../controllers/maharashtraResultsController');
const authMiddleware = require('../middleware/auth');
const rateLimitMiddleware = require('../middleware/rateLimit');

// Public routes (results visible after election completion)
router.get('/live-stats', 
  rateLimitMiddleware.apiLimiter,
  maharashtraResultsController.getLiveStats
);

// Protected routes
router.use(authMiddleware.protect);

// Get overall election results
router.get('/:electionId?', 
  rateLimitMiddleware.apiLimiter,
  maharashtraResultsController.getElectionResults
);

// Get constituency-specific results
router.get('/constituency/:constituency', 
  rateLimitMiddleware.apiLimiter,
  maharashtraResultsController.getConstituencyResult
);

// Export results (admin only)
router.get('/export/:electionId', 
  rateLimitMiddleware.apiLimiter,
  maharashtraResultsController.exportResults
);

module.exports = router;
