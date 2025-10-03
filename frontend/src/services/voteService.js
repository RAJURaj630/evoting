import api from './api';

class VoteService {
  // Get all candidates
  async getCandidates() {
    const response = await api.get('/candidates');
    return response.data;
  }

  // Cast a vote
  async castVote(candidateId) {
    const response = await api.post('/votes/cast', { candidateId });
    return response.data;
  }

  // Check vote status
  async checkVoteStatus() {
    const response = await api.get('/votes/status');
    return response.data;
  }

  // Get voting statistics
  async getVotingStats() {
    const response = await api.get('/votes/stats');
    return response.data;
  }

  // Get election results
  async getResults() {
    const response = await api.get('/results');
    return response.data;
  }

  // Get live results
  async getLiveResults() {
    const response = await api.get('/results/live');
    return response.data;
  }
}

export default new VoteService();