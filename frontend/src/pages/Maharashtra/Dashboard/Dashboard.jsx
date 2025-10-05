import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Vote, 
  Users, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  MapPin, 
  TrendingUp,
  AlertCircle,
  Calendar,
  Shield
} from 'lucide-react';
import { useMaharashtraAuth } from '../../../contexts/MaharashtraAuthContext';
import { voteAPI, resultsAPI } from '../../../services/maharashtraApi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin } = useMaharashtraAuth();
  const [votingStatus, setVotingStatus] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statusResponse, statsResponse, candidatesResponse] = await Promise.all([
        voteAPI.getVotingStatus(),
        resultsAPI.getLiveStats(),
        voteAPI.getCandidates()
      ]);

      if (statusResponse.success) {
        setVotingStatus(statusResponse.data);
      }

      if (statsResponse.success) {
        setLiveStats(statsResponse.data);
      }

      if (candidatesResponse.success) {
        setCandidates(candidatesResponse.data.candidates.slice(0, 3)); // Show top 3
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Your Status',
      value: user?.hasVoted ? 'Vote Cast' : 'Ready to Vote',
      icon: user?.hasVoted ? CheckCircle : Vote,
      color: user?.hasVoted ? 'text-primary-green' : 'text-primary-saffron',
      bgColor: user?.hasVoted ? 'bg-primary-green/10' : 'bg-primary-saffron/10'
    },
    {
      title: 'Your Constituency',
      value: user?.constituency || 'Not Set',
      icon: MapPin,
      color: 'text-primary-navy',
      bgColor: 'bg-primary-navy/10'
    },
    {
      title: 'Total Votes Cast',
      value: liveStats?.liveStats?.totalVotes?.toLocaleString() || '0',
      icon: Users,
      color: 'text-primary-green',
      bgColor: 'bg-primary-green/10'
    },
    {
      title: 'Voter Turnout',
      value: `${liveStats?.liveStats?.turnoutPercentage || 0}%`,
      icon: TrendingUp,
      color: 'text-primary-saffron',
      bgColor: 'bg-primary-saffron/10'
    }
  ];

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-secondary">
            Maharashtra Legislative Assembly Elections 2024
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-secondary">{stat.title}</p>
                    <p className="text-xl font-semibold text-primary">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voting Status */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center space-x-2">
                  <Vote className="w-5 h-5" />
                  <span>Voting Status</span>
                </h2>
              </div>

              {user?.hasVoted ? (
                <div className="bg-primary-green/10 border border-primary-green/20 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-primary-green" />
                    <div>
                      <h3 className="text-lg font-semibold text-primary">Vote Successfully Cast!</h3>
                      <p className="text-secondary">Thank you for participating in democracy</p>
                    </div>
                  </div>
                  
                  {votingStatus?.voteDetails && (
                    <div className="mt-4 p-4 bg-white/50 rounded-lg">
                      <p className="text-sm text-secondary">
                        <strong>Voted on:</strong> {new Date(votingStatus.voteDetails.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm text-secondary">
                        <strong>Verification ID:</strong> {votingStatus.voteDetails.verificationId}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-primary-saffron/10 border border-primary-saffron/20 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertCircle className="w-8 h-8 text-primary-saffron" />
                    <div>
                      <h3 className="text-lg font-semibold text-primary">Ready to Vote</h3>
                      <p className="text-secondary">Cast your vote for {user?.constituency}</p>
                    </div>
                  </div>
                  
                  <Link
                    to="/vote"
                    className="btn btn-primary flex items-center space-x-2 w-fit"
                  >
                    <Vote className="w-4 h-4" />
                    <span>Cast Your Vote</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Candidates Preview */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Candidates in {user?.constituency}</span>
                </h2>
                <p className="card-description">
                  Preview of candidates in your constituency
                </p>
              </div>

              <div className="space-y-4">
                {candidates.map((candidate, index) => (
                  <div key={candidate._id} className="flex items-center space-x-4 p-4 bg-tertiary/10 rounded-lg">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {candidate.symbol || candidate.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{candidate.name}</h3>
                      <p className="text-sm text-secondary">{candidate.party}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-tertiary">Symbol</p>
                      <p className="font-medium text-primary">{candidate.symbol}</p>
                    </div>
                  </div>
                ))}
                
                <Link
                  to="/vote"
                  className="btn btn-outline w-full flex items-center justify-center space-x-2"
                >
                  <span>View All Candidates</span>
                  <Vote className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Admin Quick Access */}
            {isAdmin() && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Admin Quick Access</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/admin"
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                  <Link
                    to="/results"
                    className="btn btn-outline flex items-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>View Results</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Stats */}
            {liveStats?.hasActiveElection && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Live Statistics</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-saffron">
                      {liveStats.liveStats.totalVotes.toLocaleString()}
                    </div>
                    <div className="text-sm text-secondary">Total Votes</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-green">
                      {liveStats.liveStats.turnoutPercentage}%
                    </div>
                    <div className="text-sm text-secondary">Turnout</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-navy">
                      {liveStats.liveStats.recentVotes}
                    </div>
                    <div className="text-sm text-secondary">Recent (10 min)</div>
                  </div>
                </div>

                <Link
                  to="/results"
                  className="btn btn-outline w-full mt-4 flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Full Results</span>
                </Link>
              </div>
            )}

            {/* Election Info */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Election Info</span>
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-secondary">Election</p>
                  <p className="font-medium text-primary">Maharashtra Assembly 2024</p>
                </div>
                <div>
                  <p className="text-sm text-secondary">Your Constituency</p>
                  <p className="font-medium text-primary">{user?.constituency}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary">Voting Status</p>
                  <p className="font-medium text-primary">
                    {user?.hasVoted ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Actions</h2>
              </div>

              <div className="space-y-3">
                <Link
                  to="/profile"
                  className="btn btn-ghost w-full justify-start"
                >
                  View Profile
                </Link>
                <Link
                  to="/results"
                  className="btn btn-ghost w-full justify-start"
                >
                  Election Results
                </Link>
                {!user?.hasVoted && (
                  <Link
                    to="/vote"
                    className="btn btn-primary w-full justify-start"
                  >
                    Cast Vote
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
