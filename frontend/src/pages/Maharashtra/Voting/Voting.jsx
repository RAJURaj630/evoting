import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Vote, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  Users, 
  MapPin,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';
import { useMaharashtraAuth } from '../../../contexts/MaharashtraAuthContext';
import { voteAPI } from '../../../services/maharashtraApi';
import toast from 'react-hot-toast';

const Voting = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [votingStatus, setVotingStatus] = useState(null);

  const { user } = useMaharashtraAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVotingData();
  }, []);

  const fetchVotingData = async () => {
    try {
      const [candidatesResponse, statusResponse] = await Promise.all([
        voteAPI.getCandidates(),
        voteAPI.getVotingStatus()
      ]);

      if (candidatesResponse.success) {
        setCandidates(candidatesResponse.data.candidates);
      }

      if (statusResponse.success) {
        setVotingStatus(statusResponse.data);
        if (statusResponse.data.hasVoted) {
          // Redirect to dashboard if already voted
          navigate('/dashboard');
          return;
        }
      }
    } catch (error) {
      toast.error('Failed to load voting data');
      console.error('Voting data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleVoteSubmit = () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmVote = async () => {
    setVoting(true);

    try {
      const response = await voteAPI.castVote({
        candidateId: selectedCandidate._id
      });

      if (response.success) {
        toast.success('Vote cast successfully!');
        setShowConfirmation(false);
        
        // Show success message and redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        toast.error(response.message || 'Failed to cast vote');
      }
    } catch (error) {
      toast.error('An error occurred while casting vote');
      console.error('Vote casting error:', error);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (votingStatus?.hasVoted) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-primary-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Vote Already Cast</h2>
          <p className="text-secondary mb-4">You have already participated in this election.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-saffron to-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Cast Your Vote</h1>
          <p className="text-secondary">
            Maharashtra Legislative Assembly Elections 2024
          </p>
        </div>

        {/* Constituency Info */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-navy/10 rounded-lg">
                <MapPin className="w-6 h-6 text-primary-navy" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">
                  {user?.constituency}
                </h2>
                <p className="text-secondary">Your Constituency</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-secondary">Voter</p>
              <p className="font-medium text-primary">{user?.name}</p>
            </div>
          </div>
        </div>

        {/* Voting Instructions */}
        <div className="card mb-8 bg-primary-saffron/10 border border-primary-saffron/20">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-primary-saffron mt-1" />
            <div>
              <h3 className="font-semibold text-primary mb-2">Voting Instructions</h3>
              <ul className="text-sm text-secondary space-y-1">
                <li>• Select one candidate from the list below</li>
                <li>• Review your selection carefully before confirming</li>
                <li>• Your vote is secret and secure</li>
                <li>• You can only vote once in this election</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="card-title flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Select Your Candidate</span>
            </h2>
            <p className="card-description">
              {candidates.length} candidates in {user?.constituency}
            </p>
          </div>

          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div
                key={candidate._id}
                onClick={() => handleCandidateSelect(candidate)}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedCandidate?._id === candidate._id
                    ? 'border-primary-navy bg-primary-navy/10'
                    : 'border-secondary hover:border-primary-navy/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Selection Radio */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedCandidate?._id === candidate._id
                      ? 'border-primary-navy bg-primary-navy'
                      : 'border-secondary'
                  }`}>
                    {selectedCandidate?._id === candidate._id && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>

                  {/* Candidate Symbol */}
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {candidate.symbol || candidate.name.charAt(0)}
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-primary mb-1">
                      {candidate.name}
                    </h3>
                    <p className="text-primary-navy font-medium mb-1">
                      {candidate.party}
                    </p>
                    {candidate.description && (
                      <p className="text-sm text-secondary">
                        {candidate.description}
                      </p>
                    )}
                  </div>

                  {/* Symbol Label */}
                  <div className="text-right">
                    <p className="text-sm text-secondary">Symbol</p>
                    <p className="font-medium text-primary">{candidate.symbol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vote Button */}
        <div className="text-center">
          <button
            onClick={handleVoteSubmit}
            disabled={!selectedCandidate}
            className="btn btn-primary btn-lg flex items-center space-x-2 mx-auto"
          >
            <Vote className="w-5 h-5" />
            <span>Cast Vote</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {selectedCandidate && (
            <p className="text-sm text-secondary mt-3">
              Selected: <strong>{selectedCandidate.name}</strong> ({selectedCandidate.party})
            </p>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 card bg-primary-green/10 border border-primary-green/20">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-primary-green mt-1" />
            <div>
              <h3 className="font-semibold text-primary mb-2">Your Vote is Secure</h3>
              <p className="text-sm text-secondary">
                Your vote is encrypted and anonymized. No one can trace your vote back to you. 
                The system ensures complete privacy while maintaining transparency in the counting process.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary max-w-md w-full rounded-xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-saffron rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Confirm Your Vote</h3>
              <p className="text-gray-200">
                Please review your selection carefully. This action cannot be undone.
              </p>
            </div>

            {/* Selected Candidate */}
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary font-bold">
                  {selectedCandidate?.symbol || selectedCandidate?.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{selectedCandidate?.name}</h4>
                  <p className="text-gray-200">{selectedCandidate?.party}</p>
                  <p className="text-sm text-gray-300">{user?.constituency}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={voting}
                className="btn btn-ghost flex-1 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={confirmVote}
                disabled={voting}
                className="btn btn-success flex-1 flex items-center justify-center space-x-2"
              >
                {voting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Casting Vote...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Vote</span>
                  </>
                )}
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary-green" />
                <p className="text-xs text-gray-200">
                  Your vote will be encrypted and anonymized for security
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voting;
