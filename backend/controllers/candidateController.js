const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');

class CandidateController {
  // Get all active candidates
  async getCandidates(req, res) {
    try {
      const candidates = await Candidate.find({ isActive: true })
        .select('name party symbol description voteCount')
        .sort({ name: 1 });

      await AuditLog.logAction({
        action: 'CANDIDATE_VIEW',
        userId: req.voter?._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { count: candidates.length },
        status: 'SUCCESS',
        resource: 'CANDIDATE'
      });

      res.json({
        success: true,
        data: {
          candidates,
          count: candidates.length
        }
      });
    } catch (error) {
      await AuditLog.logAction({
        action: 'CANDIDATE_VIEW',
        userId: req.voter?._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { error: error.message },
        status: 'FAILURE',
        resource: 'CANDIDATE'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to fetch candidates',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  // Get candidate by ID
  async getCandidateById(req, res) {
    try {
      const candidate = await Candidate.findOne({
        _id: req.params.id,
        isActive: true
      }).select('name party symbol description voteCount');

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }

      res.json({
        success: true,
        data: { candidate }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch candidate',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  // Add new candidate (admin function)
  async addCandidate(req, res) {
    try {
      const { name, party, symbol, description } = req.body;

      const candidate = await Candidate.create({
        name,
        party,
        symbol,
        description
      });

      res.status(201).json({
        success: true,
        message: 'Candidate added successfully',
        data: { candidate }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add candidate',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }
}

module.exports = new CandidateController();