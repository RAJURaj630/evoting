import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  CheckCircle, 
  Clock,
  CreditCard,
  Calendar,
  Vote
} from 'lucide-react';
import { useMaharashtraAuth } from '../../../contexts/MaharashtraAuthContext';
import { voteAPI } from '../../../services/maharashtraApi';

const Profile = () => {
  const { user, updateProfile } = useMaharashtraAuth();
  const [votingStatus, setVotingStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotingStatus();
  }, []);

  const fetchVotingStatus = async () => {
    try {
      const response = await voteAPI.getVotingStatus();
      if (response.success) {
        setVotingStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch voting status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading profile...</p>
        </div>
      </div>
    );
  }

  const profileSections = [
    {
      title: 'Personal Information',
      icon: User,
      fields: [
        { label: 'Full Name', value: user?.name, icon: User },
        { label: 'Email Address', value: user?.email, icon: Mail },
        { label: 'Phone Number', value: user?.phone, icon: Phone },
        { label: 'Voter ID', value: user?.voterId, icon: CreditCard }
      ]
    },
    {
      title: 'Election Details',
      icon: Vote,
      fields: [
        { label: 'Constituency', value: user?.constituency, icon: MapPin },
        { label: 'Role', value: user?.role === 'admin' ? 'Administrator' : 'Voter', icon: Shield },
        { label: 'Registration Date', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A', icon: Calendar },
        { label: 'Verification Status', value: user?.otpVerified ? 'Verified' : 'Pending', icon: user?.otpVerified ? CheckCircle : Clock }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-saffron to-green rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">{user?.name}</h1>
          <p className="text-secondary">
            {user?.role === 'admin' ? 'Election Administrator' : 'Registered Voter'} • {user?.constituency}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {profileSections.map((section, sectionIndex) => {
              const SectionIcon = section.icon;
              return (
                <div key={sectionIndex} className="card">
                  <div className="card-header">
                    <h2 className="card-title flex items-center space-x-2">
                      <SectionIcon className="w-5 h-5" />
                      <span>{section.title}</span>
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {section.fields.map((field, fieldIndex) => {
                      const FieldIcon = field.icon;
                      return (
                        <div key={fieldIndex} className="flex items-center space-x-4 p-4 bg-tertiary/10 rounded-lg">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FieldIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-secondary">{field.label}</p>
                            <p className="font-medium text-primary">{field.value || 'Not provided'}</p>
                          </div>
                          {field.label === 'Verification Status' && user?.otpVerified && (
                            <CheckCircle className="w-5 h-5 text-primary-green" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Voting History */}
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
                      <h3 className="text-lg font-semibold text-primary">Vote Cast Successfully</h3>
                      <p className="text-secondary">Thank you for participating in the election</p>
                    </div>
                  </div>
                  
                  {votingStatus?.voteDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white/50 rounded-lg p-4">
                        <p className="text-sm text-secondary">Vote Cast On</p>
                        <p className="font-medium text-primary">
                          {new Date(votingStatus.voteDetails.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4">
                        <p className="text-sm text-secondary">Verification ID</p>
                        <p className="font-medium text-primary font-mono text-sm">
                          {votingStatus.voteDetails.verificationId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-primary-saffron/10 border border-primary-saffron/20 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-8 h-8 text-primary-saffron" />
                    <div>
                      <h3 className="text-lg font-semibold text-primary">Vote Pending</h3>
                      <p className="text-secondary">You haven't cast your vote yet</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Account Status</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Email Verified</span>
                  <CheckCircle className="w-5 h-5 text-primary-green" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Phone Verified</span>
                  {user?.otpVerified ? (
                    <CheckCircle className="w-5 h-5 text-primary-green" />
                  ) : (
                    <Clock className="w-5 h-5 text-primary-saffron" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Eligible to Vote</span>
                  {user?.isEligible ? (
                    <CheckCircle className="w-5 h-5 text-primary-green" />
                  ) : (
                    <Clock className="w-5 h-5 text-primary-saffron" />
                  )}
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security</span>
                </h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-green" />
                  <span className="text-secondary">Account secured with encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-green" />
                  <span className="text-secondary">OTP verification enabled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-green" />
                  <span className="text-secondary">Vote anonymization active</span>
                </div>
              </div>
            </div>

            {/* Election Info */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Election Information</h2>
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
                  <p className="text-sm text-secondary">Voting Period</p>
                  <p className="font-medium text-primary">Nov 15, 2024</p>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="card bg-primary-navy/10 border border-primary-navy/20">
              <div className="card-header">
                <h2 className="card-title">Need Help?</h2>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-secondary">
                  If you have any questions about your account or the voting process, 
                  contact your local election office.
                </p>
                <div className="mt-3">
                  <p className="font-medium text-primary">Election Helpline</p>
                  <p className="text-secondary">1800-XXX-VOTE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
