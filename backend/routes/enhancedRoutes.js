const express = require('express');
const router = express.Router();
const enhancedAuthController = require('../controllers/enhancedAuthController');
const enhancedVoteController = require('../controllers/enhancedVoteController');
const i18nService = require('../services/i18nService');
const { protect } = require('../middleware/auth');

/**
 * Enhanced Routes for E-Voting System
 * Includes Aadhaar verification, biometrics, device binding, blockchain, and VVPAT
 */

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

/**
 * @route   POST /api/v2/auth/register
 * @desc    Register voter with Aadhaar verification
 * @access  Public
 */
router.post('/auth/register', enhancedAuthController.registerWithAadhaar);

/**
 * @route   POST /api/v2/auth/verify-biometrics
 * @desc    Verify voter biometrics (face + liveness)
 * @access  Public
 */
router.post('/auth/verify-biometrics', enhancedAuthController.verifyBiometrics);

/**
 * @route   POST /api/v2/auth/bind-device
 * @desc    Bind device to voter account
 * @access  Public
 */
router.post('/auth/bind-device', enhancedAuthController.bindDevice);

/**
 * @route   POST /api/v2/auth/login
 * @desc    Login with multi-factor authentication
 * @access  Public
 */
router.post('/auth/login', enhancedAuthController.login);

/**
 * @route   GET /api/v2/auth/profile
 * @desc    Get voter profile
 * @access  Private
 */
router.get('/auth/profile', protect, enhancedAuthController.getProfile);

/**
 * @route   PUT /api/v2/auth/accessibility
 * @desc    Update accessibility preferences
 * @access  Private
 */
router.put('/auth/accessibility', protect, enhancedAuthController.updateAccessibility);

// ==========================================
// VOTING ROUTES
// ==========================================

/**
 * @route   POST /api/v2/votes/cast
 * @desc    Cast vote with blockchain and VVPAT
 * @access  Private
 */
router.post('/votes/cast', protect, enhancedVoteController.castVote);

/**
 * @route   POST /api/v2/votes/verify
 * @desc    Verify vote using VVPAT receipt
 * @access  Private
 */
router.post('/votes/verify', protect, enhancedVoteController.verifyVote);

/**
 * @route   GET /api/v2/votes/stats
 * @desc    Get voting statistics with blockchain info
 * @access  Public
 */
router.get('/votes/stats', enhancedVoteController.getStats);

/**
 * @route   GET /api/v2/votes/results
 * @desc    Get election results with blockchain validation
 * @access  Public
 */
router.get('/votes/results', enhancedVoteController.getResults);

/**
 * @route   GET /api/v2/votes/audit-trail
 * @desc    Export audit trail for election commission
 * @access  Private (Admin only in production)
 */
router.get('/votes/audit-trail', protect, enhancedVoteController.exportAuditTrail);

// ==========================================
// INTERNATIONALIZATION ROUTES
// ==========================================

/**
 * @route   GET /api/v2/i18n/languages
 * @desc    Get supported languages
 * @access  Public
 */
router.get('/i18n/languages', (req, res) => {
  res.json({
    success: true,
    data: i18nService.getSupportedLanguages()
  });
});

/**
 * @route   GET /api/v2/i18n/translations/:lang
 * @desc    Get translations for a language
 * @access  Public
 */
router.get('/i18n/translations/:lang', (req, res) => {
  const { lang } = req.params;
  res.json({
    success: true,
    data: i18nService.getTranslations(lang)
  });
});

// ==========================================
// SYSTEM INFO ROUTES
// ==========================================

/**
 * @route   GET /api/v2/system/info
 * @desc    Get enhanced system information
 * @access  Public
 */
router.get('/system/info', (req, res) => {
  res.json({
    success: true,
    data: {
      system: 'Enhanced E-Voting System',
      version: '2.0.0',
      description: 'Secure electronic voting with Aadhaar, biometrics, blockchain, and VVPAT',
      features: [
        'Aadhaar-based voter verification',
        'AI-powered liveness detection and face matching',
        'Device binding for security',
        'Blockchain for immutable vote storage',
        'VVPAT digital audit trail',
        'End-to-end vote encryption (AES-256)',
        'Multi-language support (10 Indian languages)',
        'WCAG 2.0 AA accessibility compliance',
        'Real-time results with blockchain validation',
        'Comprehensive audit logging'
      ],
      security: {
        authentication: 'Multi-factor (Aadhaar + Biometric + Device)',
        encryption: 'AES-256-CBC',
        blockchain: 'SHA-256 Proof of Work',
        vvpat: 'Digital receipt with QR code',
        https: 'Required in production'
      },
      accessibility: {
        languages: 10,
        screenReader: true,
        highContrast: true,
        keyboardNavigation: true,
        wcagCompliance: 'AA'
      },
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
