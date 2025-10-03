const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const JWTService = require('../utils/jwt');
const auditLogger = require('../middleware/auditLogger');

// Results are publicly accessible but logged
router.get('/', 
  auditLogger('RESULTS_VIEW', { resource: 'RESULTS' }),
  resultController.getResults
);

router.get('/live', 
  auditLogger('RESULTS_VIEW', { resource: 'RESULTS', details: { type: 'LIVE' } }),
  resultController.getLiveResults
);

module.exports = router;