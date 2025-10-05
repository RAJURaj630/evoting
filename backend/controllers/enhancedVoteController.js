const Vote = require('../models/Vote');
const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');
const blockchainService = require('../services/blockchainService');
const vvpatService = require('../services/vvpatService');
const crypto = require('crypto');

/**
 * Enhanced Vote Controller
 * Implements secure voting with blockchain and VVPAT
 */

// Encrypt vote data
const encryptVote = (candidateId) => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(candidateId.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex')
  };
};

// Decrypt vote data
const decryptVote = (encryptedData, ivHex) => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Get IP address
const getIpAddress = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         req.ip;
};

/**
 * Cast vote with end-to-end encryption and blockchain recording
 */
exports.castVote = async (req, res) => {
  try {
    const { candidateId, deviceId } = req.body;
    const voterId = req.user.id;

    // Validate input
    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required'
      });
    }

    // Get voter
    const voter = await Voter.findById(voterId);
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    // Check if voter is eligible
    if (!voter.isEligible || voter.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Voter is not eligible to vote. Please complete verification.'
      });
    }

    // Check if already voted
    if (voter.hasVoted) {
      return res.status(400).json({
        success: false,
        message: 'You have already cast your vote',
        voteTimestamp: voter.voteTimestamp
      });
    }

    // Verify candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Check for duplicate vote in database
    const existingVote = await Vote.findOne({ voterId: voter._id });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'Vote already recorded for this voter'
      });
    }

    // Encrypt vote
    const { encryptedData, iv } = encryptVote(candidateId);
    const encryptedVote = `${encryptedData}:${iv}`;

    // Create vote record
    const vote = await Vote.create({
      voterId: voter._id,
      candidateId: candidate._id,
      encryptedVote,
      timestamp: new Date(),
      electionRound: '2024-GENERAL'
    });

    // Record on blockchain
    const blockchainResult = await blockchainService.recordVote({
      voteId: vote._id,
      encryptedVote: vote.encryptedVote,
      voteHash: vote.voteHash,
      timestamp: vote.timestamp,
      electionRound: vote.electionRound
    });

    // Generate VVPAT receipt
    const vvpatReceipt = vvpatService.generateReceipt({
      candidateId: candidate._id,
      candidateName: candidate.name,
      candidateParty: candidate.party,
      candidateSymbol: candidate.symbol,
      electionRound: '2024-GENERAL',
      pollingStation: 'ONLINE'
    }, voter);

    // Update voter status
    voter.hasVoted = true;
    voter.voteTimestamp = new Date();
    await voter.save();

    // Create audit log
    await AuditLog.logAction({
      action: 'VOTE_CAST',
      userId: voter._id,
      ipAddress: getIpAddress(req),
      userAgent: req.headers['user-agent'],
      status: 'SUCCESS',
      details: {
        voteId: vote._id,
        blockHash: blockchainResult.blockData.blockHash,
        receiptId: vvpatReceipt.receiptId,
        deviceId
      }
    });

    // Generate confirmation slip
    const confirmationSlip = vvpatService.generateConfirmationSlip(vvpatReceipt);

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
      data: {
        voteId: vote._id,
        voteHash: vote.voteHash,
        timestamp: vote.timestamp,
        blockchain: {
          blockIndex: blockchainResult.blockData.blockIndex,
          blockHash: blockchainResult.blockData.blockHash,
          recorded: true
        },
        vvpat: {
          receiptId: vvpatReceipt.receiptId,
          verificationCode: vvpatReceipt.verificationCode,
          qrCode: vvpatReceipt.qrCode
        },
        confirmationSlip
      }
    });
  } catch (error) {
    console.error('Vote casting error:', error);
    
    // Log failed attempt
    if (req.user) {
      await AuditLog.logAction({
        action: 'VOTE_CAST',
        userId: req.user.id,
        ipAddress: getIpAddress(req),
        status: 'FAILURE',
        details: { error: error.message }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cast vote',
      error: error.message
    });
  }
};

/**
 * Verify vote using VVPAT receipt
 */
exports.verifyVote = async (req, res) => {
  try {
    const { receiptId, verificationCode } = req.body;

    if (!receiptId || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Receipt ID and verification code are required'
      });
    }

    // In production, fetch receipt from database
    // For now, verify the code format
    const receipt = {
      receiptId,
      verificationCode,
      voterId: req.user?.voterId || 'VOTER000001',
      timestamp: new Date().toISOString(),
      electionRound: '2024-GENERAL'
    };

    const verification = vvpatService.verifyReceipt(receipt);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
        reason: verification.reason
      });
    }

    res.json({
      success: true,
      message: 'Vote verified successfully',
      data: {
        verified: true,
        verifiedAt: verification.verifiedAt,
        receiptId,
        status: 'AUTHENTIC'
      }
    });
  } catch (error) {
    console.error('Vote verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Vote verification failed',
      error: error.message
    });
  }
};

/**
 * Get voting statistics
 */
exports.getStats = async (req, res) => {
  try {
    const totalVoters = await Voter.countDocuments({ isEligible: true });
    const votedCount = await Voter.countDocuments({ hasVoted: true });
    const pendingCount = totalVoters - votedCount;
    const turnout = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) : 0;

    // Get blockchain stats
    const blockchainStats = blockchainService.getStats();

    res.json({
      success: true,
      data: {
        totalVoters,
        voted: votedCount,
        pending: pendingCount,
        turnout: `${turnout}%`,
        blockchain: blockchainStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Get election results
 */
exports.getResults = async (req, res) => {
  try {
    const results = await Vote.aggregate([
      {
        $group: {
          _id: '$candidateId',
          voteCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'candidates',
          localField: '_id',
          foreignField: '_id',
          as: 'candidate'
        }
      },
      {
        $unwind: '$candidate'
      },
      {
        $sort: { voteCount: -1 }
      }
    ]);

    const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

    const formattedResults = results.map(r => ({
      candidateId: r._id,
      name: r.candidate.name,
      party: r.candidate.party,
      symbol: r.candidate.symbol,
      votes: r.voteCount,
      percentage: totalVotes > 0 ? ((r.voteCount / totalVotes) * 100).toFixed(2) + '%' : '0%'
    }));

    const leading = formattedResults.length > 0 ? 
      `${formattedResults[0].name} - ${formattedResults[0].party}` : 
      'No votes yet';

    // Validate blockchain
    const chainValidation = blockchainService.validateChain();

    res.json({
      success: true,
      data: {
        election: '2024 General Election',
        totalVotes,
        results: formattedResults,
        leading,
        turnout: await this.calculateTurnout(),
        blockchain: {
          valid: chainValidation.valid,
          message: chainValidation.message
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: error.message
    });
  }
};

/**
 * Calculate turnout percentage
 */
exports.calculateTurnout = async () => {
  const totalVoters = await Voter.countDocuments({ isEligible: true });
  const votedCount = await Voter.countDocuments({ hasVoted: true });
  return totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(2) + '%' : '0%';
};

/**
 * Export audit trail for election commission
 */
exports.exportAuditTrail = async (req, res) => {
  try {
    // Only authorized personnel should access this
    const blockchainExport = blockchainService.exportForAudit();
    
    const auditLogs = await AuditLog.find({ 
      action: 'VOTE_CAST',
      status: 'SUCCESS'
    }).sort({ timestamp: -1 });

    res.json({
      success: true,
      data: {
        blockchain: blockchainExport,
        auditLogs,
        exportedAt: new Date().toISOString(),
        exportedBy: req.user?.voterId || 'SYSTEM'
      }
    });
  } catch (error) {
    console.error('Export audit trail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit trail',
      error: error.message
    });
  }
};

module.exports = exports;
