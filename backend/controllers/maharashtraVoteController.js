const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Voter = require('../models/Voter');
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const encryptionService = require('../services/encryptionService');

class MaharashtraVoteController {
  // Get candidates for voter's constituency
  async getCandidates(req, res) {
    try {
      const voter = req.voter;
      
      if (!voter.constituency) {
        return res.status(400).json({
          success: false,
          message: 'Voter constituency not found'
        });
      }

      // Find active election
      const activeElection = await Election.findOne({ 
        status: 'active',
        isActive: true 
      });

      if (!activeElection) {
        return res.status(404).json({
          success: false,
          message: 'No active election found'
        });
      }

      // Get candidates for voter's constituency
      const candidates = await Candidate.find({
        constituency: voter.constituency,
        isActive: true
      }).select('name party constituency symbol description voteCount');

      // Check if voter has already voted
      const hasVoted = await Vote.findOne({
        voterId: voter._id,
        electionId: activeElection._id
      });

      await AuditLog.logAction({
        action: 'VIEW_CANDIDATES',
        userId: voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          constituency: voter.constituency,
          candidateCount: candidates.length,
          hasVoted: !!hasVoted
        },
        status: 'SUCCESS',
        resource: 'VOTING'
      });

      res.json({
        success: true,
        data: {
          candidates,
          constituency: voter.constituency,
          election: {
            id: activeElection._id,
            name: activeElection.name,
            endDate: activeElection.endDate
          },
          hasVoted: !!hasVoted,
          voterEligible: voter.isEligible
        }
      });

    } catch (error) {
      console.error('Get candidates error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch candidates',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Cast vote with encryption and security checks
  async castVote(req, res) {
    try {
      const { candidateId } = req.body;
      const voter = req.voter;

      if (!candidateId) {
        return res.status(400).json({
          success: false,
          message: 'Candidate ID is required'
        });
      }

      // Check if voter is eligible
      if (!voter.isEligible || !voter.otpVerified) {
        return res.status(403).json({
          success: false,
          message: 'Voter is not eligible to vote'
        });
      }

      // Find active election
      const activeElection = await Election.findOne({ 
        status: 'active',
        isActive: true 
      });

      if (!activeElection) {
        return res.status(404).json({
          success: false,
          message: 'No active election found'
        });
      }

      // Check if election is currently active (within time bounds)
      const now = new Date();
      if (now < activeElection.startDate || now > activeElection.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Election is not currently active'
        });
      }

      // Check if voter has already voted
      const existingVote = await Vote.findOne({
        voterId: voter._id,
        electionId: activeElection._id
      });

      if (existingVote) {
        await AuditLog.logAction({
          action: 'DUPLICATE_VOTE_ATTEMPT',
          userId: voter._id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { 
            candidateId,
            constituency: voter.constituency,
            existingVoteId: existingVote._id
          },
          status: 'FAILURE',
          resource: 'VOTING'
        });

        return res.status(400).json({
          success: false,
          message: 'You have already voted in this election'
        });
      }

      // Verify candidate exists and is in voter's constituency
      const candidate = await Candidate.findOne({
        _id: candidateId,
        constituency: voter.constituency,
        isActive: true
      });

      if (!candidate) {
        await AuditLog.logAction({
          action: 'INVALID_CANDIDATE_VOTE',
          userId: voter._id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { 
            candidateId,
            constituency: voter.constituency
          },
          status: 'FAILURE',
          resource: 'VOTING'
        });

        return res.status(400).json({
          success: false,
          message: 'Invalid candidate or candidate not in your constituency'
        });
      }

      // Generate device fingerprint
      const deviceFingerprint = encryptionService.generateDeviceFingerprint(
        req.get('User-Agent'),
        req.ip,
        { timestamp: Date.now() }
      );

      // Prepare vote data for encryption
      const voteData = {
        voterId: voter._id,
        candidateId: candidate._id,
        candidateName: candidate.name,
        candidateParty: candidate.party,
        constituency: voter.constituency,
        electionId: activeElection._id,
        timestamp: new Date(),
        deviceFingerprint
      };

      // Encrypt vote data
      const encryptedVote = encryptionService.encryptVote(voteData);

      // Create vote record
      const vote = await Vote.create({
        voterId: voter._id,
        candidateId: candidate._id,
        electionId: activeElection._id,
        constituency: voter.constituency,
        encryptedVote: JSON.stringify(encryptedVote),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceFingerprint,
        timestamp: new Date()
      });

      // Update candidate vote count
      await Candidate.findByIdAndUpdate(
        candidate._id,
        { $inc: { voteCount: 1 } }
      );

      // Update voter status
      await Voter.findByIdAndUpdate(
        voter._id,
        { 
          hasVoted: true,
          voteTimestamp: new Date()
        }
      );

      // Update election statistics
      await Election.findByIdAndUpdate(
        activeElection._id,
        { 
          $inc: { totalVotesCast: 1 }
        }
      );

      // Generate vote confirmation token
      const confirmationToken = encryptionService.generateVoterToken(
        voter._id,
        activeElection._id,
        vote.timestamp
      );

      await AuditLog.logAction({
        action: 'VOTE_CAST',
        userId: voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          candidateId: candidate._id,
          candidateName: candidate.name,
          candidateParty: candidate.party,
          constituency: voter.constituency,
          voteId: vote._id,
          confirmationToken,
          deviceFingerprint
        },
        status: 'SUCCESS',
        resource: 'VOTING'
      });

      res.json({
        success: true,
        message: 'Vote cast successfully',
        data: {
          voteConfirmation: {
            confirmationToken,
            timestamp: vote.timestamp,
            candidate: {
              name: candidate.name,
              party: candidate.party
            },
            constituency: voter.constituency,
            election: activeElection.name
          }
        }
      });

    } catch (error) {
      console.error('Cast vote error:', error);
      
      await AuditLog.logAction({
        action: 'VOTE_CAST',
        userId: req.voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          error: error.message,
          candidateId: req.body.candidateId
        },
        status: 'FAILURE',
        resource: 'VOTING'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to cast vote',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get voting status for current voter
  async getVotingStatus(req, res) {
    try {
      const voter = req.voter;

      // Find active election
      const activeElection = await Election.findOne({ 
        status: 'active',
        isActive: true 
      });

      if (!activeElection) {
        return res.json({
          success: true,
          data: {
            hasActiveElection: false,
            message: 'No active election found'
          }
        });
      }

      // Check if voter has voted
      const vote = await Vote.findOne({
        voterId: voter._id,
        electionId: activeElection._id
      });

      // Get candidate count for voter's constituency
      const candidateCount = await Candidate.countDocuments({
        constituency: voter.constituency,
        isActive: true
      });

      res.json({
        success: true,
        data: {
          hasActiveElection: true,
          hasVoted: !!vote,
          voteTimestamp: vote?.timestamp,
          election: {
            id: activeElection._id,
            name: activeElection.name,
            startDate: activeElection.startDate,
            endDate: activeElection.endDate,
            status: activeElection.status
          },
          voter: {
            constituency: voter.constituency,
            isEligible: voter.isEligible,
            candidateCount
          }
        }
      });

    } catch (error) {
      console.error('Get voting status error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch voting status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Verify vote (for transparency)
  async verifyVote(req, res) {
    try {
      const { confirmationToken } = req.body;
      const voter = req.voter;

      if (!confirmationToken) {
        return res.status(400).json({
          success: false,
          message: 'Confirmation token is required'
        });
      }

      // Find active election
      const activeElection = await Election.findOne({ 
        status: { $in: ['active', 'completed'] },
        isActive: true 
      });

      if (!activeElection) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      // Find voter's vote
      const vote = await Vote.findOne({
        voterId: voter._id,
        electionId: activeElection._id
      }).populate('candidateId', 'name party');

      if (!vote) {
        return res.status(404).json({
          success: false,
          message: 'Vote not found'
        });
      }

      // Verify confirmation token
      const expectedToken = encryptionService.generateVoterToken(
        voter._id,
        activeElection._id,
        vote.timestamp
      );

      if (confirmationToken !== expectedToken) {
        await AuditLog.logAction({
          action: 'VOTE_VERIFICATION',
          userId: voter._id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          details: { 
            reason: 'Invalid confirmation token',
            providedToken: confirmationToken
          },
          status: 'FAILURE',
          resource: 'VOTING'
        });

        return res.status(400).json({
          success: false,
          message: 'Invalid confirmation token'
        });
      }

      await AuditLog.logAction({
        action: 'VOTE_VERIFICATION',
        userId: voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          voteId: vote._id,
          verified: true
        },
        status: 'SUCCESS',
        resource: 'VOTING'
      });

      res.json({
        success: true,
        message: 'Vote verified successfully',
        data: {
          voteVerified: true,
          voteDetails: {
            timestamp: vote.timestamp,
            candidate: {
              name: vote.candidateId.name,
              party: vote.candidateId.party
            },
            constituency: vote.constituency,
            election: activeElection.name
          }
        }
      });

    } catch (error) {
      console.error('Verify vote error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to verify vote',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new MaharashtraVoteController();
