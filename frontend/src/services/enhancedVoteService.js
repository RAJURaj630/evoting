import api from './api';

/**
 * Enhanced Vote Service for v2 API
 * Includes blockchain and VVPAT features
 */
class EnhancedVoteService {
  // Cast vote with blockchain and VVPAT
  async castVote(candidateId, deviceId) {
    const response = await api.post('/api/v2/votes/cast', {
      candidateId,
      deviceId
    });
    return response.data;
  }

  // Verify vote using VVPAT receipt
  async verifyVote(receiptId, verificationCode) {
    const response = await api.post('/api/v2/votes/verify', {
      receiptId,
      verificationCode
    });
    return response.data;
  }

  // Get voting statistics with blockchain info
  async getStats() {
    const response = await api.get('/api/v2/votes/stats');
    return response.data;
  }

  // Get election results with blockchain validation
  async getResults() {
    const response = await api.get('/api/v2/votes/results');
    return response.data;
  }

  // Export audit trail (admin)
  async exportAuditTrail() {
    const response = await api.get('/api/v2/votes/audit-trail');
    return response.data;
  }
}

export default new EnhancedVoteService();
