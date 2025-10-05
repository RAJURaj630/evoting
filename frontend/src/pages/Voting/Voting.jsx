import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import voteService from '../../services/voteService'
import enhancedVoteService from '../../services/enhancedVoteService'
import enhancedAuthService from '../../services/enhancedAuthService'
import VVPATReceipt from '../../components/VVPATReceipt/VVPATReceipt'

const Voting = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [hasVoted, setHasVoted] = useState(user?.hasVoted || false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [vvpatReceipt, setVvpatReceipt] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [useEnhancedMode, setUseEnhancedMode] = useState(true)

  useEffect(() => {
    fetchCandidates()
    checkVoteStatus()
  }, [])

  const fetchCandidates = async () => {
    try {
      const response = await voteService.getCandidates()
      if (response.success) {
        setCandidates(response.data.candidates)
      }
    } catch (error) {
      setError('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }

  const checkVoteStatus = async () => {
    setHasVoted(user?.hasVoted || false)
  }

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate to vote for')
      return
    }

    setVoting(true)
    setError('')
    try {
      let response
      
      if (useEnhancedMode) {
        // Use enhanced v2 API with blockchain and VVPAT
        const deviceInfo = enhancedAuthService.getDeviceFingerprint()
        response = await enhancedVoteService.castVote(selectedCandidate, deviceInfo.deviceId)
        
        if (response.success && response.data.vvpatReceipt) {
          setVvpatReceipt(response.data.vvpatReceipt)
          setShowReceipt(true)
          setSuccess('✅ Vote cast successfully with blockchain & VVPAT!')
          setHasVoted(true)
        } else {
          setError(response.message || 'Failed to cast vote')
        }
      } else {
        // Use legacy v1 API
        response = await voteService.castVote(selectedCandidate)
        if (response.success) {
          setSuccess('Vote cast successfully!')
          setHasVoted(true)
          setTimeout(() => {
            navigate('/results')
          }, 2000)
        } else {
          setError(response.message || 'Failed to cast vote')
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cast vote')
    } finally {
      setVoting(false)
    }
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    setTimeout(() => {
      navigate('/results')
    }, 500)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading candidates...</p>
        </div>
      </div>
    )
  }

  if (hasVoted || success) {
    return (
      <div className="voting-container">
        <div className="container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>Thank You for Voting!</h2>
            <p>You have successfully cast your vote. Your participation in the democratic process is appreciated.</p>
            <p>You can view the election results on the results page.</p>
            <button onClick={() => navigate('/results')} className="btn btn-primary">
              View Results
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="voting-container">
      <div className="container">
        <div className="voting-card">
          <div className="voting-header">
            <div className="header-top">
              <h2>🗳️ Cast Your Vote</h2>
              <div className="mode-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={useEnhancedMode}
                    onChange={(e) => setUseEnhancedMode(e.target.checked)}
                  />
                  <span className="toggle-text">
                    {useEnhancedMode ? '🔐 Enhanced Mode (Blockchain + VVPAT)' : '📝 Standard Mode'}
                  </span>
                </label>
              </div>
            </div>
            <div className="alert alert-info">
              <strong>Important:</strong> You can only vote once. Your vote is anonymous and encrypted.
              {useEnhancedMode && ' You will receive a VVPAT receipt for verification.'}
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="candidates-grid">
            {candidates.map((candidate) => (
              <div 
                key={candidate.id} 
                className={`candidate-vote-card ${selectedCandidate === candidate.id ? 'selected' : ''}`}
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <div className="candidate-symbol-large">
                  {candidate.symbol}
                </div>
                <h3 className="candidate-name">{candidate.name}</h3>
                <p className="candidate-party">{candidate.party}</p>
                <p className="candidate-description">{candidate.description}</p>
                {selectedCandidate === candidate.id && (
                  <div className="selected-indicator">
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {candidates.length === 0 && (
            <div className="alert alert-warning">
              No candidates available for voting at this time.
            </div>
          )}

          <div className="voting-actions">
            <button
              onClick={handleVote}
              disabled={!selectedCandidate || voting || hasVoted}
              className="btn btn-primary btn-large"
            >
              {voting ? (
                <>
                  <span className="spinner"></span>
                  {useEnhancedMode ? 'Recording on Blockchain...' : 'Casting Vote...'}
                </>
              ) : (
                useEnhancedMode ? '🔐 Cast Vote (Blockchain + VVPAT)' : 'Cast Vote'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* VVPAT Receipt Modal */}
      {showReceipt && vvpatReceipt && (
        <VVPATReceipt receipt={vvpatReceipt} onClose={handleCloseReceipt} />
      )}
    </div>
  )
}

export default Voting