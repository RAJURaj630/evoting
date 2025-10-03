const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const JWTService = require('../utils/jwt');
const auditLogger = require('../middleware/auditLogger');

// All candidate routes require authentication
router.use(JWTService.protect);

router.get('/', 
  auditLogger('CANDIDATE_VIEW', { resource: 'CANDIDATE' }),
  candidateController.getCandidates
);

router.get('/:id', 
  auditLogger('CANDIDATE_VIEW', { resource: 'CANDIDATE' }),
  candidateController.getCandidateById
);

// Admin routes (protected with additional checks)
router.post('/', 
  auditLogger('CANDIDATE_VIEW', { resource: 'CANDIDATE', details: { action: 'CREATE' } }),
  candidateController.addCandidate
);

module.exports = router;