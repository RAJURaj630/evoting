const express = require('express');
const router = express.Router();
const maharashtraVoteController = require('../controllers/maharashtraVoteController');
const authMiddleware = require('../middleware/auth');
const rateLimitMiddleware = require('../middleware/rateLimit');

// All voting routes require authentication
router.use(authMiddleware.protect);

// Get candidates for voter's constituency
router.get('/candidates', 
  rateLimitMiddleware.apiLimiter,
  maharashtraVoteController.getCandidates
);

// Cast vote
router.post('/cast', 
  rateLimitMiddleware.voteLimiter,
  maharashtraVoteController.castVote
);

// Get voting status
router.get('/status', 
  rateLimitMiddleware.apiLimiter,
  maharashtraVoteController.getVotingStatus
);

// Verify vote
router.post('/verify', 
  rateLimitMiddleware.apiLimiter,
  maharashtraVoteController.verifyVote
);

module.exports = router;
