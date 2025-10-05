import React from 'react';
import { 
  Settings, 
  Users, 
  Vote, 
  BarChart3, 
  Shield,
  Database,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useMaharashtraAuth } from '../../../contexts/MaharashtraAuthContext';

const AdminDashboard = () => {
  const { user } = useMaharashtraAuth();

  const adminFeatures = [
    {
      title: 'Candidate Management',
      description: 'Add, edit, and manage election candidates',
      icon: Users,
      color: 'text-primary-saffron',
      bgColor: 'bg-primary-saffron/10',
      status: 'Available'
    },
    {
      title: 'Voter Management',
      description: 'Manage voter registrations and eligibility',
      icon: Vote,
      color: 'text-primary-green',
      bgColor: 'bg-primary-green/10',
      status: 'Available'
    },
    {
      title: 'Election Control',
      description: 'Start, stop, and configure elections',
      icon: Settings,
      color: 'text-primary-navy',
      bgColor: 'bg-primary-navy/10',
      status: 'Available'
    },
    {
      title: 'Results Analytics',
      description: 'View detailed election results and analytics',
      icon: BarChart3,
      color: 'text-primary-saffron',
      bgColor: 'bg-primary-saffron/10',
      status: 'Available'
    },
    {
      title: 'Security Audit',
      description: 'Monitor system security and audit logs',
      icon: Shield,
      color: 'text-primary-green',
      bgColor: 'bg-primary-green/10',
      status: 'Available'
    },
    {
      title: 'Database Management',
      description: 'Backup and manage election data',
      icon: Database,
      color: 'text-primary-navy',
      bgColor: 'bg-primary-navy/10',
      status: 'Available'
    }
  ];

  const quickStats = [
    { label: 'Total Voters', value: '2.1M', icon: Users },
    { label: 'Active Candidates', value: '32', icon: Vote },
    { label: 'Constituencies', value: '43', icon: BarChart3 },
    { label: 'System Status', value: 'Online', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-saffron to-green rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-secondary">Welcome back, {user?.name}</p>
            </div>
          </div>
          
          <div className="bg-primary-saffron/10 border border-primary-saffron/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-primary-saffron" />
              <div>
                <p className="font-medium text-primary">Admin Panel Under Development</p>
                <p className="text-sm text-secondary">
                  Full admin functionality is being implemented. Basic election management is available through the backend API.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary">{stat.label}</p>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Features */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Administrative Functions</h2>
            <p className="card-description">
              Manage all aspects of the Maharashtra E-Voting System
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="border border-tertiary/20 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className={`p-3 ${feature.bgColor} rounded-lg w-fit mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-secondary text-sm mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-primary-green/20 text-primary-green rounded-full">
                      {feature.status}
                    </span>
                    <button className="btn btn-ghost btn-sm">
                      Configure
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">System Status</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary">Database</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                  <span className="text-primary-green text-sm">Connected</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-secondary">API Services</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                  <span className="text-primary-green text-sm">Running</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-secondary">Security</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                  <span className="text-primary-green text-sm">Secure</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-secondary">Backup</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-saffron rounded-full"></div>
                  <span className="text-primary-saffron text-sm">Scheduled</span>
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-tertiary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary-saffron" />
                <div>
                  <p className="text-sm font-medium text-primary">New voter registration</p>
                  <p className="text-xs text-secondary">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-tertiary/10 rounded-lg">
                <Vote className="w-5 h-5 text-primary-green" />
                <div>
                  <p className="text-sm font-medium text-primary">Vote cast in Mumbai South</p>
                  <p className="text-xs text-secondary">5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-tertiary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary-navy" />
                <div>
                  <p className="text-sm font-medium text-primary">Security audit completed</p>
                  <p className="text-xs text-secondary">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Information */}
        <div className="card mt-8 bg-primary-navy/10 border border-primary-navy/20">
          <div className="card-header">
            <h2 className="card-title">API Endpoints</h2>
            <p className="card-description">
              Backend API is running on localhost:5000 with the following endpoints:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-primary mb-2">Authentication</h4>
              <ul className="space-y-1 text-secondary">
                <li>• POST /api/v3/auth/register</li>
                <li>• POST /api/v3/auth/login</li>
                <li>• POST /api/v3/auth/verify-otp</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-primary mb-2">Voting</h4>
              <ul className="space-y-1 text-secondary">
                <li>• GET /api/v3/vote/candidates</li>
                <li>• POST /api/v3/vote/cast</li>
                <li>• GET /api/v3/vote/status</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-primary mb-2">Results</h4>
              <ul className="space-y-1 text-secondary">
                <li>• GET /api/v3/results/live-stats</li>
                <li>• GET /api/v3/results/:electionId</li>
                <li>• GET /api/v3/results/constituency/:name</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-primary mb-2">Admin</h4>
              <ul className="space-y-1 text-secondary">
                <li>• GET /api/v3/admin/dashboard</li>
                <li>• GET /api/v3/admin/candidates</li>
                <li>• GET /api/v3/admin/voters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
