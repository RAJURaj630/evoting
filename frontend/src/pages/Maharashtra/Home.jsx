import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Vote, 
  Shield, 
  Users, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useMaharashtraAuth } from '../../contexts/MaharashtraAuthContext';
import { resultsAPI } from '../../services/maharashtraApi';

const Home = () => {
  const { isAuthenticated, user } = useMaharashtraAuth();
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchLiveStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveStats = async () => {
    try {
      const response = await resultsAPI.getLiveStats();
      if (response.success) {
        setLiveStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch live stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure Voting',
      description: 'Advanced encryption and security measures protect your vote',
      color: 'text-primary-navy'
    },
    {
      icon: Users,
      title: 'Constituency-Based',
      description: 'Vote for candidates in your specific constituency',
      color: 'text-primary-saffron'
    },
    {
      icon: CheckCircle,
      title: 'OTP Verification',
      description: 'Multi-factor authentication ensures voter identity',
      color: 'text-primary-green'
    },
    {
      icon: BarChart3,
      title: 'Real-time Results',
      description: 'Live election results and statistics',
      color: 'text-primary-navy'
    }
  ];

  const constituencies = [
    'Mumbai South', 'Mumbai North', 'Pune', 'Nagpur', 'Nashik', 
    'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Baramati'
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="maharashtra-gradient absolute inset-0 opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center text-white">
            <div className="mb-8">
              <Vote className="w-20 h-20 mx-auto mb-6 text-white" />
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Maharashtra E-Voting System
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-2">
                Legislative Assembly Elections 2024
              </p>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Cast your vote securely with our advanced electronic voting platform. 
                Your privacy is protected and every vote counts.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="btn btn-secondary btn-lg flex items-center space-x-2 min-w-48"
                  >
                    <Users className="w-5 h-5" />
                    <span>Register to Vote</span>
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-outline btn-lg flex items-center space-x-2 min-w-48"
                  >
                    <Vote className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/vote"
                    className="btn btn-success btn-lg flex items-center space-x-2 min-w-48"
                  >
                    <Vote className="w-5 h-5" />
                    <span>Cast Your Vote</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="btn btn-outline btn-lg flex items-center space-x-2 min-w-48"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                </>
              )}
            </div>

            {/* Live Stats */}
            {liveStats && liveStats.hasActiveElection && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold mb-4 flex items-center justify-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Live Election Statistics</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-saffron">
                      {liveStats.liveStats.totalVotes.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-200">Total Votes Cast</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-green">
                      {liveStats.liveStats.turnoutPercentage}%
                    </div>
                    <div className="text-sm text-gray-200">Voter Turnout</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {liveStats.liveStats.recentVotes}
                    </div>
                    <div className="text-sm text-gray-200">Recent Votes (10 min)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Why Choose Our E-Voting System?
            </h2>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              Built with cutting-edge technology to ensure secure, transparent, and accessible elections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card text-center hover:scale-105 transition-transform">
                  <Icon className={`w-12 h-12 mx-auto mb-4 ${feature.color}`} />
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Constituencies Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Major Constituencies
            </h2>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto">
              Participating constituencies in the Maharashtra Legislative Assembly Elections 2024
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {constituencies.map((constituency, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors">
                <MapPin className="w-5 h-5 mx-auto mb-2 text-primary-saffron" />
                <p className="text-white font-medium text-sm">{constituency}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/results"
              className="btn btn-outline btn-lg flex items-center space-x-2 mx-auto max-w-xs"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View All Results</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Election Info Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary mb-4">
                Election Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card">
                <Calendar className="w-8 h-8 text-primary-saffron mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Election Schedule
                </h3>
                <div className="space-y-2 text-secondary">
                  <p><strong>Voting Date:</strong> November 15, 2024</p>
                  <p><strong>Voting Hours:</strong> 7:00 AM - 6:00 PM</p>
                  <p><strong>Results:</strong> Available after voting ends</p>
                </div>
              </div>

              <div className="card">
                <Clock className="w-8 h-8 text-primary-green mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  How to Vote
                </h3>
                <div className="space-y-2 text-secondary">
                  <p>1. Register with valid documents</p>
                  <p>2. Verify your identity with OTP</p>
                  <p>3. Select your constituency candidate</p>
                  <p>4. Cast your secure vote</p>
                </div>
              </div>
            </div>

            {isAuthenticated && user && (
              <div className="mt-8 bg-primary-green/10 border border-primary-green/20 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-primary-green" />
                  <h3 className="text-lg font-semibold text-primary">
                    You're Registered!
                  </h3>
                </div>
                <div className="text-secondary">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Constituency:</strong> {user.constituency}</p>
                  <p><strong>Status:</strong> {user.hasVoted ? 'Vote Cast ✓' : 'Ready to Vote'}</p>
                </div>
                {!user.hasVoted && (
                  <Link
                    to="/vote"
                    className="btn btn-success mt-4 flex items-center space-x-2 w-fit"
                  >
                    <Vote className="w-4 h-4" />
                    <span>Cast Your Vote Now</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
