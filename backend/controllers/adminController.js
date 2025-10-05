const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const AuditLog = require('../models/AuditLog');

class AdminController {
  // Middleware to check admin role
  async checkAdminRole(req, res, next) {
    if (req.voter.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  }

  // Get admin dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const activeElection = await Election.findOne({ status: 'active', isActive: true });
      
      if (!activeElection) {
        return res.json({
          success: true,
          data: {
            hasActiveElection: false,
            message: 'No active election found'
          }
        });
      }

      // Get overall statistics
      const totalVoters = await Voter.countDocuments({ isEligible: true });
      const totalCandidates = await Candidate.countDocuments({ isActive: true });
      const totalVotesCast = await Vote.countDocuments({ electionId: activeElection._id });
      const turnoutPercentage = totalVoters > 0 ? (totalVotesCast / totalVoters * 100).toFixed(2) : 0;

      // Get constituency-wise statistics
      const constituencyStats = await Vote.aggregate([
        { $match: { electionId: activeElection._id } },
        {
          $group: {
            _id: '$constituency',
            voteCount: { $sum: 1 }
          }
        },
        { $sort: { voteCount: -1 } }
      ]);

      // Get party-wise vote distribution
      const partyStats = await Vote.aggregate([
        { $match: { electionId: activeElection._id } },
        {
          $lookup: {
            from: 'candidates',
            localField: 'candidateId',
            foreignField: '_id',
            as: 'candidate'
          }
        },
        { $unwind: '$candidate' },
        {
          $group: {
            _id: '$candidate.party',
            voteCount: { $sum: 1 }
          }
        },
        { $sort: { voteCount: -1 } }
      ]);

      // Get hourly voting pattern for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const hourlyVotes = await Vote.aggregate([
        {
          $match: {
            electionId: activeElection._id,
            timestamp: { $gte: today, $lt: tomorrow }
          }
        },
        {
          $group: {
            _id: { $hour: '$timestamp' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      await AuditLog.logAction({
        action: 'ADMIN_DASHBOARD_VIEW',
        userId: req.voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          electionId: activeElection._id,
          totalVoters,
          totalVotesCast,
          turnoutPercentage
        },
        status: 'SUCCESS',
        resource: 'ADMIN'
      });

      res.json({
        success: true,
        data: {
          election: {
            id: activeElection._id,
            name: activeElection.name,
            startDate: activeElection.startDate,
            endDate: activeElection.endDate,
            status: activeElection.status
          },
          overview: {
            totalVoters,
            totalCandidates,
            totalVotesCast,
            turnoutPercentage: parseFloat(turnoutPercentage)
          },
          constituencyStats,
          partyStats,
          hourlyVotes
        }
      });

    } catch (error) {
      console.error('Admin dashboard error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Manage candidates
  async getCandidates(req, res) {
    try {
      const { constituency, party, page = 1, limit = 20 } = req.query;
      
      const filter = {};
      if (constituency) filter.constituency = constituency;
      if (party) filter.party = party;

      const candidates = await Candidate.find(filter)
        .sort({ constituency: 1, party: 1, name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Candidate.countDocuments(filter);

      res.json({
        success: true,
        data: {
          candidates,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
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

  // Add new candidate
  async addCandidate(req, res) {
    try {
      const { name, party, constituency, symbol, description } = req.body;

      if (!name || !party || !constituency || !symbol) {
        return res.status(400).json({
          success: false,
          message: 'Name, party, constituency, and symbol are required'
        });
      }

      // Check if candidate already exists in the constituency
      const existingCandidate = await Candidate.findOne({
        name,
        constituency,
        party
      });

      if (existingCandidate) {
        return res.status(400).json({
          success: false,
          message: 'Candidate already exists in this constituency'
        });
      }

      const candidate = await Candidate.create({
        name,
        party,
        constituency,
        symbol,
        description
      });

      await AuditLog.logAction({
        action: 'CANDIDATE_ADDED',
        userId: req.voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          candidateId: candidate._id,
          name,
          party,
          constituency
        },
        status: 'SUCCESS',
        resource: 'ADMIN'
      });

      res.status(201).json({
        success: true,
        message: 'Candidate added successfully',
        data: { candidate }
      });

    } catch (error) {
      console.error('Add candidate error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to add candidate',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update candidate
  async updateCandidate(req, res) {
    try {
      const { id } = req.params;
      const { name, party, constituency, symbol, description, isActive } = req.body;

      const candidate = await Candidate.findById(id);
      
      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }

      const oldData = { ...candidate.toObject() };

      // Update fields
      if (name) candidate.name = name;
      if (party) candidate.party = party;
      if (constituency) candidate.constituency = constituency;
      if (symbol) candidate.symbol = symbol;
      if (description !== undefined) candidate.description = description;
      if (isActive !== undefined) candidate.isActive = isActive;

      await candidate.save();

      await AuditLog.logAction({
        action: 'CANDIDATE_UPDATED',
        userId: req.voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          candidateId: candidate._id,
          oldData,
          newData: candidate.toObject()
        },
        status: 'SUCCESS',
        resource: 'ADMIN'
      });

      res.json({
        success: true,
        message: 'Candidate updated successfully',
        data: { candidate }
      });

    } catch (error) {
      console.error('Update candidate error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to update candidate',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete candidate
  async deleteCandidate(req, res) {
    try {
      const { id } = req.params;

      const candidate = await Candidate.findById(id);
      
      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }

      // Check if candidate has received votes
      const voteCount = await Vote.countDocuments({ candidateId: id });
      
      if (voteCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete candidate who has received votes. Consider deactivating instead.'
        });
      }

      await Candidate.findByIdAndDelete(id);

      await AuditLog.logAction({
        action: 'CANDIDATE_DELETED',
        userId: req.voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          candidateId: id,
          candidateData: candidate.toObject()
        },
        status: 'SUCCESS',
        resource: 'ADMIN'
      });

      res.json({
        success: true,
        message: 'Candidate deleted successfully'
      });

    } catch (error) {
      console.error('Delete candidate error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete candidate',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Manage voters
  async getVoters(req, res) {
    try {
      const { constituency, verified, hasVoted, page = 1, limit = 20 } = req.query;
      
      const filter = {};
      if (constituency) filter.constituency = constituency;
      if (verified !== undefined) filter.otpVerified = verified === 'true';
      if (hasVoted !== undefined) filter.hasVoted = hasVoted === 'true';

      const voters = await Voter.find(filter)
        .select('-passwordHash -otpSecret')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Voter.countDocuments(filter);

      res.json({
        success: true,
        data: {
          voters,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get voters error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch voters',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update voter status
  async updateVoterStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive, isEligible, verificationStatus } = req.body;

      const voter = await Voter.findById(id);
      
      if (!voter) {
        return res.status(404).json({
          success: false,
          message: 'Voter not found'
        });
      }

      const oldData = {
        isActive: voter.isActive,
        isEligible: voter.isEligible,
        verificationStatus: voter.verificationStatus
      };

      // Update fields
      if (isActive !== undefined) voter.isActive = isActive;
      if (isEligible !== undefined) voter.isEligible = isEligible;
      if (verificationStatus) voter.verificationStatus = verificationStatus;

      await voter.save();

      await AuditLog.logAction({
        action: 'VOTER_STATUS_UPDATED',
        userId: req.voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          targetVoterId: voter._id,
          oldData,
          newData: {
            isActive: voter.isActive,
            isEligible: voter.isEligible,
            verificationStatus: voter.verificationStatus
          }
        },
        status: 'SUCCESS',
        resource: 'ADMIN'
      });

      res.json({
        success: true,
        message: 'Voter status updated successfully',
        data: { 
          voter: {
            id: voter._id,
            voterId: voter.voterId,
            name: voter.name,
            email: voter.email,
            constituency: voter.constituency,
            isActive: voter.isActive,
            isEligible: voter.isEligible,
            verificationStatus: voter.verificationStatus
          }
        }
      });

    } catch (error) {
      console.error('Update voter status error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to update voter status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get election management
  async getElections(req, res) {
    try {
      const elections = await Election.find()
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email');

      res.json({
        success: true,
        data: { elections }
      });

    } catch (error) {
      console.error('Get elections error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch elections',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Create new election
  async createElection(req, res) {
    try {
      const { name, description, startDate, endDate, constituencies } = req.body;

      if (!name || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Name, start date, and end date are required'
        });
      }

      const election = await Election.create({
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        constituencies: constituencies || [],
        createdBy: req.voter._id
      });

      await AuditLog.logAction({
        action: 'ELECTION_CREATED',
        userId: req.voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          electionId: election._id,
          name,
          startDate,
          endDate
        },
        status: 'SUCCESS',
        resource: 'ADMIN'
      });

      res.status(201).json({
        success: true,
        message: 'Election created successfully',
        data: { election }
      });

    } catch (error) {
      console.error('Create election error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to create election',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update election status
  async updateElectionStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, isActive } = req.body;

      const election = await Election.findById(id);
      
      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      const oldStatus = election.status;

      if (status) election.status = status;
      if (isActive !== undefined) election.isActive = isActive;

      await election.save();

      await AuditLog.logAction({
        action: 'ELECTION_STATUS_UPDATED',
        userId: req.voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          electionId: election._id,
          oldStatus,
          newStatus: election.status,
          isActive: election.isActive
        },
        status: 'SUCCESS',
        resource: 'ADMIN'
      });

      res.json({
        success: true,
        message: 'Election status updated successfully',
        data: { election }
      });

    } catch (error) {
      console.error('Update election status error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to update election status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get audit logs
  async getAuditLogs(req, res) {
    try {
      const { action, resource, status, page = 1, limit = 50 } = req.query;
      
      const filter = {};
      if (action) filter.action = action;
      if (resource) filter.resource = resource;
      if (status) filter.status = status;

      const logs = await AuditLog.find(filter)
        .populate('userId', 'name email voterId')
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AuditLog.countDocuments(filter);

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get audit logs error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = new AdminController();
