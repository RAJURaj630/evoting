import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Crown, 
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { resultsAPI } from '../../../services/maharashtraApi';
import { useMaharashtraAuth } from '../../../contexts/MaharashtraAuthContext';
import toast from 'react-hot-toast';

const Results = () => {
  const [results, setResults] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // overview, constituency, party

  const { isAuthenticated } = useMaharashtraAuth();

  useEffect(() => {
    fetchResults();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);

    try {
      const [resultsResponse, statsResponse] = await Promise.all([
        resultsAPI.getElectionResults(),
        resultsAPI.getLiveStats()
      ]);

      if (resultsResponse.success) {
        setResults(resultsResponse.data);
      }

      if (statsResponse.success) {
        setLiveStats(statsResponse.data);
      }
    } catch (error) {
      if (showRefreshing) {
        toast.error('Failed to refresh results');
      }
      console.error('Results fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchResults(true);
  };

  // Color scheme for parties
  const partyColors = {
    'Bharatiya Janata Party (BJP)': '#FF9933',
    'Indian National Congress (INC)': '#19AAED',
    'Nationalist Congress Party (NCP)': '#00B2A9',
    'Shiv Sena (Uddhav Balasaheb Thackeray)': '#F37020',
    'Shiv Sena (Eknath Shinde)': '#FFC107',
    'Maharashtra Navnirman Sena (MNS)': '#8B4513',
    'All India Majlis-e-Ittehadul Muslimeen (AIMIM)': '#00A651',
    'Bahujan Samaj Party (BSP)': '#22409A',
    'Independent': '#808080'
  };

  const getPartyColor = (party, index) => {
    return partyColors[party] || `hsl(${index * 45}, 70%, 50%)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading election results...</p>
        </div>
      </div>
    );
  }

  if (!results && !liveStats?.hasActiveElection) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-tertiary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">No Active Election</h2>
          <p className="text-secondary">Results will be available when an election is active.</p>
        </div>
      </div>
    );
  }

  const overviewStats = [
    {
      title: 'Total Votes',
      value: results?.overview?.totalVotes?.toLocaleString() || liveStats?.liveStats?.totalVotes?.toLocaleString() || '0',
      icon: Users,
      color: 'text-primary-saffron'
    },
    {
      title: 'Voter Turnout',
      value: `${results?.overview?.turnoutPercentage || liveStats?.liveStats?.turnoutPercentage || 0}%`,
      icon: TrendingUp,
      color: 'text-primary-green'
    },
    {
      title: 'Constituencies',
      value: results?.overview?.totalConstituencies || '43',
      icon: MapPin,
      color: 'text-primary-navy'
    },
    {
      title: 'Leading Party',
      value: results?.partyResults?.[0]?.party?.split(' ')[0] || 'TBD',
      icon: Crown,
      color: 'text-primary-saffron'
    }
  ];

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Election Results</h1>
            <p className="text-secondary">
              Maharashtra Legislative Assembly Elections 2024
              {liveStats?.hasActiveElection && (
                <span className="ml-2 px-2 py-1 bg-primary-green/20 text-primary-green text-xs rounded-full">
                  LIVE
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-outline flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex bg-tertiary/20 rounded-lg p-1">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'constituency', label: 'Constituency' },
                { key: 'party', label: 'Party' }
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setViewMode(mode.key)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === mode.key
                      ? 'bg-primary text-white'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-tertiary/20 rounded-lg">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-secondary">{stat.title}</p>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Results Content */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Party-wise Results Chart */}
            {results?.partyResults && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center space-x-2">
                    <PieChartIcon className="w-5 h-5" />
                    <span>Party-wise Vote Share</span>
                  </h2>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={results.partyResults.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="totalVotes"
                      label={({ party, votePercentage }) => `${party.split(' ')[0]} (${votePercentage}%)`}
                    >
                      {results.partyResults.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getPartyColor(entry.party, index)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value.toLocaleString()} votes (${props.payload.votePercentage}%)`,
                        props.payload.party
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Constituencies */}
            {results?.constituencyResults && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Top Constituencies by Turnout</span>
                  </h2>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={results.constituencyResults.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="constituency" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()} votes`, 'Total Votes']}
                    />
                    <Bar dataKey="totalVotes" fill="var(--primary-saffron)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Party Results Table */}
        {results?.partyResults && (
          <div className="card mt-8">
            <div className="card-header">
              <h2 className="card-title">Party-wise Results</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary">
                    <th className="text-left py-3 px-4">Party</th>
                    <th className="text-right py-3 px-4">Votes</th>
                    <th className="text-right py-3 px-4">Vote %</th>
                    <th className="text-right py-3 px-4">Constituencies</th>
                  </tr>
                </thead>
                <tbody>
                  {results.partyResults.map((party, index) => (
                    <tr key={index} className="border-b border-tertiary/20 hover:bg-tertiary/10">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getPartyColor(party.party, index) }}
                          ></div>
                          <span className="font-medium text-primary">{party.party}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {party.totalVotes.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4">
                        {party.votePercentage}%
                      </td>
                      <td className="text-right py-3 px-4">
                        {party.constituencyCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Constituency Results */}
        {results?.constituencyResults && viewMode === 'constituency' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Constituency-wise Results</h2>
            </div>
            
            <div className="space-y-6">
              {results.constituencyResults.map((constituency, index) => (
                <div key={index} className="border border-tertiary/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-primary flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>{constituency.constituency}</span>
                    </h3>
                    <div className="text-right">
                      <p className="text-sm text-secondary">Total Votes</p>
                      <p className="font-bold text-primary">{constituency.totalVotes.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Winner */}
                  {constituency.winner && (
                    <div className="bg-primary-green/10 border border-primary-green/20 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <Crown className="w-6 h-6 text-primary-green" />
                        <div>
                          <h4 className="font-semibold text-primary">{constituency.winner.name}</h4>
                          <p className="text-secondary">{constituency.winner.party}</p>
                          <p className="text-sm text-primary-green">
                            {constituency.winner.voteCount.toLocaleString()} votes ({constituency.winner.votePercentage}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* All Candidates */}
                  <div className="space-y-2">
                    {constituency.candidates.map((candidate, candidateIndex) => (
                      <div key={candidateIndex} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {candidate.symbol || candidate.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-primary">{candidate.name}</p>
                            <p className="text-sm text-secondary">{candidate.party}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{candidate.voteCount.toLocaleString()}</p>
                          <p className="text-sm text-secondary">{candidate.votePercentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center mt-8 text-sm text-tertiary">
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
