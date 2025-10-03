const mongoose = require('mongoose');
const Vote = require('models/Vote');
const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');
const encryption = require('../utils/encryption');

class VoteController {
  // Cast a vote
  async castVote(req, res) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      const { candidateId } = req.body;
      const voter = req.voter;

      // Validate candidateId
      if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Invalid candidate ID format'
        });
      }

      // Check if voter has already voted using the static method
      const hasVoted = await Vote.hasVoted(voter._id);
      if (hasVoted) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({
          success: false,
          message: 'You have already cast your vote'
        });
      }

      // Verify candidate exists and is active
      const candidate = await Candidate.findById(candidateId).session(session);
      if (!candidate) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }

      if (!candidate.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Candidate is not active'
        });
      }

      // Encrypt the vote
      const voteData = {
        voterId: voter._id.toString(),
        candidateId: candidateId,
        timestamp: new Date().toISOString(),
        electionRound: '2024-GENERAL'
      };

      const encryptedVote = encryption.encryptVote(voteData);

      // Create vote record
      const vote = await Vote.create([{
        voterId: voter._id,
        candidateId: candidateId,
        encryptedVote: JSON.stringify(encryptedVote),
        electionRound: '2024-GENERAL'
      }], { session });

      // Update voter's hasVoted status
      await Voter.findByIdAndUpdate(
        voter._id,
        { hasVoted: true },
        { session }
      );

      // Update candidate's vote count atomically
      await Candidate.findByIdAndUpdate(
        candidateId,
        { $inc: { voteCount: 1 } },
        { session }
      );

      await session.commitTransaction();
      
      // Log successful vote
      await AuditLog.logAction({
        action: 'VOTE_CAST',
        userId: voter._id,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        details: {
          candidateId: candidateId,
          candidateName: candidate.name,
          voteId: vote[0]._id,
          electionRound: '2024-GENERAL'
        },
        status: 'SUCCESS',
        resource: 'VOTE'
      });

      res.status(201).json({
        success: true,
        message: 'Vote cast successfully',
        data: {
          voteId: vote[0]._id,
          timestamp: vote[0].timestamp,
          candidateName: candidate.name
        }
      });

    } catch (error) {
      // Safe abort transaction
      try {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      } finally {
        session.endSession();
      }

      // Log the error
      await AuditLog.logAction({
        action: 'VOTE_CAST',
        userId: req.voter?._id,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        details: {
          candidateId: req.body.candidateId,
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        status: 'FAILURE',
        resource: 'VOTE'
      });

      console.error('Vote casting error:', error);

      // Specific error handling
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error occurred',
          error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
      }

      if (error.code === 11000) { // MongoDB duplicate key error
        return res.status(409).json({
          success: false,
          message: 'Duplicate vote detected'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to cast vote',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  // Check if voter has voted
  async checkVoteStatus(req, res) {
    try {
      const hasVoted = await Vote.hasVoted(req.voter._id);
      
      res.json({
        success: true,
        data: {
          hasVoted,
          voterId: req.voter.voterId,
          voterName: req.voter.name
        }
      });
    } catch (error) {
      console.error('Vote status check error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to check vote status',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  // Get voting statistics (admin only)
  async getVotingStats(req, res) {
    try {
      const totalVoters = await Voter.countDocuments({ isActive: true });
      const votedCount = await Voter.countDocuments({ 
        hasVoted: true, 
        isActive: true 
      });
      const votePercentage = totalVoters > 0 ? 
        (votedCount / totalVoters * 100).toFixed(2) : 0;

      // Get votes per candidate for more detailed stats
      const candidateStats = await Candidate.aggregate([
        {
          $match: { isActive: true }
        },
        {
          $project: {
            name: 1,
            party: 1,
            symbol: 1,
            voteCount: 1,
            percentage: {
              $cond: {
                if: { $gt: [votedCount, 0] },
                then: { $multiply: [{ $divide: ['$voteCount', votedCount] }, 100] },
                else: 0
              }
            }
          }
        },
        {
          $sort: { voteCount: -1 }
        }
      ]);

      res.json({
        success: true,
        data: {
          totalVoters,
          votedCount,
          pendingCount: totalVoters - votedCount,
          votePercentage: parseFloat(votePercentage),
          candidateStats,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Voting stats error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch voting statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  // Get vote verification (for voter to verify their vote was recorded)
  async verifyVote(req, res) {
    try {
      const vote = await Vote.findOne({ 
        voterId: req.voter._id 
      }).select('voteHash timestamp').lean();

      if (!vote) {
        return res.status(404).json({
          success: false,
          message: 'No vote record found'
        });
      }

      // Return minimal verification info (maintains anonymity)
      res.json({
        success: true,
        data: {
          voteRecorded: true,
          timestamp: vote.timestamp,
          verificationHash: vote.voteHash.substring(0, 16) + '...' // Partial hash for verification
        }
      });
    } catch (error) {
      console.error('Vote verification error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to verify vote',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
}

module.exports = new VoteController();