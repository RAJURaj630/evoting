
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'LOGIN',
      'LOGOUT',
      'REGISTRATION_ATTEMPT',
      'REGISTRATION_SUCCESS',
      'REGISTRATION_FAILED',
      'OTP_SENT',
      'OTP_VERIFIED',
      'OTP_FAILED',
      'VOTE_CAST',
      'VOTE_VIEW',
      'CANDIDATE_VIEW',
      'RESULTS_VIEW',
      'PROFILE_UPDATE',
      'ADMIN_ACTION',
      'SYSTEM_ERROR'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voter',
    required: function() {
      return !['SYSTEM_ERROR', 'REGISTRATION_ATTEMPT', 'REGISTRATION_FAILED'].includes(this.action);
    }
  },
  userAgent: {
    type: String,
    maxlength: 500
  },
  ipAddress: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'WARNING'],
    default: 'SUCCESS'
  },
  resource: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Index for efficient querying and reporting
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });

// Static method for logging actions
auditLogSchema.statics.logAction = async function(logData) {
  try {
    const auditLog = new this(logData);
    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw error to avoid breaking main functionality
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);