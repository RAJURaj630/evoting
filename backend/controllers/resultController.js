const Candidate = require('../models/Candidate');
const Vote = require('./models/Vote');
const Voter = require('../models/Voter');
const AuditLog = require('../models/AuditLog');

class ResultController {
  // Get election results
  async getResults(req, res) {
    try {
      // Get all candidates with vote counts
      const candidates = await Candidate.find({ isActive: true })
        .select('name party symbol voteCount')
        .sort({ voteCount: -1 });

      // Calculate total votes
      const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);

      // Calculate percentages and determine winner
      let winner = null;
      let maxVotes = 0;

      const results = candidates.map(candidate => {
        const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes * 100).toFixed(2) : 0;
        
        if (candidate.voteCount > maxVotes) {
          maxVotes = candidate.voteCount;
          winner = candidate;
        }

        return {
          candidate: {
            id: candidate._id,
            name: candidate.name,
            party: candidate.party,
            symbol: candidate.symbol
          },
          votes: candidate.voteCount,
          percentage: parseFloat(percentage)
        };
      });

      // Check for tie
      const winners = candidates.filter(c => c.voteCount === maxVotes);
      const isTie = winners.length > 1;

      // Get voting statistics
      const totalVoters = await Voter.countDocuments({ isActive: true });
      const votedCount = await Voter.countDocuments({ hasVoted: true, isActive: true });
      const turnoutPercentage = totalVoters > 0 ? (votedCount / totalVoters * 100).toFixed(2) : 0;

      await AuditLog.logAction({
        action: 'RESULTS_VIEW',
        userId: req.voter?._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          totalVotes,
          totalVoters,
          turnoutPercentage: parseFloat(turnoutPercentage)
        },
        status: 'SUCCESS',
        resource: 'RESULTS'
      });

      res.json({
        success: true,
        data: {
          results,
          summary: {
            totalVotes,
            totalVoters,
            votedCount,
            turnoutPercentage: parseFloat(turnoutPercentage),
            winner: isTie ? null : winner ? {
              name: winner.name,
              party: winner.party,
              votes: winner.voteCount
            } : null,
            isTie,
            tieCandidates: isTie ? winners.map(w => ({ name: w.name, party: w.party })) : []
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      await AuditLog.logAction({
        action: 'RESULTS_VIEW',
        userId: req.voter?._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { error: error.message },
        status: 'FAILURE',
        resource: 'RESULTS'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to fetch results',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  // Get real-time results updates
  async getLiveResults(req, res) {
    try {
      const candidates = await Candidate.find({ isActive: true })
        .select('name party symbol voteCount')
        .sort({ voteCount: -1 });

      const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
      const totalVoters = await Voter.countDocuments({ isActive: true });
      const votedCount = await Voter.countDocuments({ hasVoted: true, isActive: true });

      res.json({
        success: true,
        data: {
          candidates: candidates.map(candidate => ({
            name: candidate.name,
            party: candidate.party,
            votes: candidate.voteCount,
            percentage: totalVotes > 0 ? (candidate.voteCount / totalVotes * 100).toFixed(2) : 0
          })),
          statistics: {
            totalVotes,
            totalVoters,
            votedCount,
            turnoutPercentage: totalVoters > 0 ? (votedCount / totalVoters * 100).toFixed(2) : 0
          },
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch live results',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
}

module.exports = new ResultController();