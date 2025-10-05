const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const Voter = require('../models/Voter');
const AuditLog = require('../models/AuditLog');

class MaharashtraResultsController {
  // Get overall election results
  async getElectionResults(req, res) {
    try {
      const { electionId } = req.params;
      
      // Find election or use active election
      let election;
      if (electionId) {
        election = await Election.findById(electionId);
      } else {
        election = await Election.findOne({ 
          status: { $in: ['active', 'completed'] },
          isActive: true 
        });
      }

      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      // Check if results should be visible
      const canViewResults = election.status === 'completed' || 
                           (req.voter && req.voter.role === 'admin');

      if (!canViewResults) {
        return res.status(403).json({
          success: false,
          message: 'Results not available until election is completed'
        });
      }

      // Get overall statistics
      const totalVotes = await Vote.countDocuments({ electionId: election._id });
      const totalEligibleVoters = await Voter.countDocuments({ isEligible: true });
      const turnoutPercentage = totalEligibleVoters > 0 ? 
        (totalVotes / totalEligibleVoters * 100).toFixed(2) : 0;

      // Get constituency-wise results
      const constituencyResults = await this.getConstituencyResults(election._id);

      // Get party-wise results
      const partyResults = await this.getPartyResults(election._id);

      // Get top candidates overall
      const topCandidates = await Candidate.find({ isActive: true })
        .sort({ voteCount: -1 })
        .limit(10)
        .select('name party constituency voteCount symbol');

      // Get voting timeline (hourly breakdown)
      const votingTimeline = await this.getVotingTimeline(election._id);

      await AuditLog.logAction({
        action: 'VIEW_RESULTS',
        userId: req.voter?._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          electionId: election._id,
          totalVotes,
          turnoutPercentage
        },
        status: 'SUCCESS',
        resource: 'RESULTS'
      });

      res.json({
        success: true,
        data: {
          election: {
            id: election._id,
            name: election.name,
            status: election.status,
            startDate: election.startDate,
            endDate: election.endDate
          },
          overview: {
            totalVotes,
            totalEligibleVoters,
            turnoutPercentage: parseFloat(turnoutPercentage),
            totalConstituencies: constituencyResults.length
          },
          constituencyResults,
          partyResults,
          topCandidates,
          votingTimeline
        }
      });

    } catch (error) {
      console.error('Get election results error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch election results',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get constituency-specific results
  async getConstituencyResults(electionId, constituency = null) {
    try {
      const matchStage = { electionId };
      if (constituency) {
        matchStage.constituency = constituency;
      }

      const results = await Vote.aggregate([
        { $match: matchStage },
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
            _id: {
              constituency: '$constituency',
              candidateId: '$candidateId',
              candidateName: '$candidate.name',
              party: '$candidate.party',
              symbol: '$candidate.symbol'
            },
            voteCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.constituency',
            candidates: {
              $push: {
                candidateId: '$_id.candidateId',
                name: '$_id.candidateName',
                party: '$_id.party',
                symbol: '$_id.symbol',
                voteCount: '$voteCount'
              }
            },
            totalVotes: { $sum: '$voteCount' }
          }
        },
        {
          $addFields: {
            candidates: {
              $map: {
                input: '$candidates',
                as: 'candidate',
                in: {
                  $mergeObjects: [
                    '$$candidate',
                    {
                      votePercentage: {
                        $round: [
                          { $multiply: [{ $divide: ['$$candidate.voteCount', '$totalVotes'] }, 100] },
                          2
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            candidates: {
              $sortArray: {
                input: '$candidates',
                sortBy: { voteCount: -1 }
              }
            },
            winner: {
              $arrayElemAt: [
                {
                  $sortArray: {
                    input: '$candidates',
                    sortBy: { voteCount: -1 }
                  }
                },
                0
              ]
            }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      return results.map(result => ({
        constituency: result._id,
        totalVotes: result.totalVotes,
        winner: result.winner,
        candidates: result.candidates
      }));

    } catch (error) {
      console.error('Get constituency results error:', error);
      throw error;
    }
  }

  // Get party-wise aggregated results
  async getPartyResults(electionId) {
    try {
      const results = await Vote.aggregate([
        { $match: { electionId } },
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
            totalVotes: { $sum: 1 },
            constituencies: { $addToSet: '$constituency' },
            candidates: {
              $push: {
                name: '$candidate.name',
                constituency: '$constituency',
                voteCount: 1
              }
            }
          }
        },
        {
          $addFields: {
            constituencyCount: { $size: '$constituencies' },
            candidateCount: { $size: '$candidates' }
          }
        },
        { $sort: { totalVotes: -1 } }
      ]);

      // Calculate vote percentages
      const totalVotes = results.reduce((sum, party) => sum + party.totalVotes, 0);
      
      return results.map(party => ({
        party: party._id,
        totalVotes: party.totalVotes,
        votePercentage: totalVotes > 0 ? 
          ((party.totalVotes / totalVotes) * 100).toFixed(2) : 0,
        constituencyCount: party.constituencyCount,
        candidateCount: party.candidateCount
      }));

    } catch (error) {
      console.error('Get party results error:', error);
      throw error;
    }
  }

  // Get voting timeline for charts
  async getVotingTimeline(electionId) {
    try {
      const timeline = await Vote.aggregate([
        { $match: { electionId } },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' },
              hour: { $hour: '$timestamp' }
            },
            voteCount: { $sum: 1 }
          }
        },
        {
          $addFields: {
            timestamp: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day',
                hour: '$_id.hour'
              }
            }
          }
        },
        { $sort: { timestamp: 1 } },
        {
          $project: {
            _id: 0,
            timestamp: 1,
            voteCount: 1,
            hour: '$_id.hour'
          }
        }
      ]);

      return timeline;

    } catch (error) {
      console.error('Get voting timeline error:', error);
      throw error;
    }
  }

  // Get specific constituency results
  async getConstituencyResult(req, res) {
    try {
      const { constituency } = req.params;
      const { electionId } = req.query;

      // Find election
      let election;
      if (electionId) {
        election = await Election.findById(electionId);
      } else {
        election = await Election.findOne({ 
          status: { $in: ['active', 'completed'] },
          isActive: true 
        });
      }

      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      // Check if results should be visible
      const canViewResults = election.status === 'completed' || 
                           (req.voter && req.voter.role === 'admin');

      if (!canViewResults) {
        return res.status(403).json({
          success: false,
          message: 'Results not available until election is completed'
        });
      }

      const constituencyResults = await this.getConstituencyResults(election._id, constituency);
      
      if (constituencyResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No results found for this constituency'
        });
      }

      const result = constituencyResults[0];

      // Get eligible voters in this constituency
      const eligibleVoters = await Voter.countDocuments({ 
        constituency,
        isEligible: true 
      });

      const turnoutPercentage = eligibleVoters > 0 ? 
        (result.totalVotes / eligibleVoters * 100).toFixed(2) : 0;

      await AuditLog.logAction({
        action: 'VIEW_CONSTITUENCY_RESULTS',
        userId: req.voter?._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          constituency,
          electionId: election._id,
          totalVotes: result.totalVotes
        },
        status: 'SUCCESS',
        resource: 'RESULTS'
      });

      res.json({
        success: true,
        data: {
          constituency,
          election: {
            id: election._id,
            name: election.name,
            status: election.status
          },
          results: {
            ...result,
            eligibleVoters,
            turnoutPercentage: parseFloat(turnoutPercentage)
          }
        }
      });

    } catch (error) {
      console.error('Get constituency result error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch constituency results',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get live statistics for real-time updates
  async getLiveStats(req, res) {
    try {
      const election = await Election.findOne({ 
        status: 'active',
        isActive: true 
      });

      if (!election) {
        return res.json({
          success: true,
          data: {
            hasActiveElection: false,
            message: 'No active election found'
          }
        });
      }

      const totalVotes = await Vote.countDocuments({ electionId: election._id });
      const totalEligibleVoters = await Voter.countDocuments({ isEligible: true });
      const turnoutPercentage = totalEligibleVoters > 0 ? 
        (totalVotes / totalEligibleVoters * 100).toFixed(2) : 0;

      // Get recent votes (last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentVotes = await Vote.countDocuments({
        electionId: election._id,
        timestamp: { $gte: tenMinutesAgo }
      });

      // Get top 5 leading candidates
      const leadingCandidates = await Candidate.find({ isActive: true })
        .sort({ voteCount: -1 })
        .limit(5)
        .select('name party constituency voteCount');

      res.json({
        success: true,
        data: {
          hasActiveElection: true,
          election: {
            id: election._id,
            name: election.name,
            endDate: election.endDate
          },
          liveStats: {
            totalVotes,
            totalEligibleVoters,
            turnoutPercentage: parseFloat(turnoutPercentage),
            recentVotes,
            lastUpdated: new Date()
          },
          leadingCandidates
        }
      });

    } catch (error) {
      console.error('Get live stats error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch live statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Export results (for admin)
  async exportResults(req, res) {
    try {
      if (!req.voter || req.voter.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { electionId, format = 'json' } = req.query;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({
          success: false,
          message: 'Election not found'
        });
      }

      const constituencyResults = await this.getConstituencyResults(election._id);
      const partyResults = await this.getPartyResults(election._id);

      const exportData = {
        election: {
          id: election._id,
          name: election.name,
          status: election.status,
          startDate: election.startDate,
          endDate: election.endDate
        },
        exportedAt: new Date(),
        exportedBy: req.voter.name,
        constituencyResults,
        partyResults
      };

      await AuditLog.logAction({
        action: 'EXPORT_RESULTS',
        userId: req.voter._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { 
          electionId: election._id,
          format
        },
        status: 'SUCCESS',
        resource: 'RESULTS'
      });

      if (format === 'csv') {
        // Convert to CSV format
        const csv = this.convertToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="election-results-${election._id}.csv"`);
        return res.send(csv);
      }

      res.json({
        success: true,
        data: exportData
      });

    } catch (error) {
      console.error('Export results error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to export results',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Helper method to convert results to CSV
  convertToCSV(data) {
    const headers = ['Constituency', 'Candidate', 'Party', 'Votes', 'Percentage', 'Winner'];
    const rows = [headers.join(',')];

    data.constituencyResults.forEach(constituency => {
      constituency.candidates.forEach(candidate => {
        const row = [
          constituency.constituency,
          candidate.name,
          candidate.party,
          candidate.voteCount,
          candidate.votePercentage + '%',
          candidate.candidateId === constituency.winner.candidateId ? 'Yes' : 'No'
        ];
        rows.push(row.join(','));
      });
    });

    return rows.join('\n');
  }
}

module.exports = new MaharashtraResultsController();
