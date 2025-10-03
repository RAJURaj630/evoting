const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const JWTService = require('../utils/jwt');
const { validateVote } = require('../middleware/validation');
const auditLogger = require('../middleware/auditLogger');

// All vote routes require authentication
router.use(JWTService.protect);

router.post('/cast', 
  JWTService.requireNotVoted,
  validateVote,
  auditLogger('VOTE_CAST', { resource: 'VOTE' }),
  voteController.castVote
);

router.get('/status', 
  auditLogger('VOTE_VIEW', { resource: 'VOTE' }),
  voteController.checkVoteStatus
);

router.get('/stats', 
  auditLogger('VOTE_VIEW', { resource: 'VOTE', details: { action: 'STATS' } }),
  voteController.getVotingStats
);

module.exports = router;