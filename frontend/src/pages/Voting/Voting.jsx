import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import voteService from '../../services/voteService'

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
      const response = await voteService.castVote(selectedCandidate)
      if (response.success) {
        setSuccess('Vote cast successfully!')
        setHasVoted(true)
        setTimeout(() => {
          navigate('/results')
        }, 2000)
      } else {
        setError(response.message || 'Failed to cast vote')
      }
    } catch (error) {
      setError('Failed to cast vote')
    } finally {
      setVoting(false)
    }
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
            <h2>🗳️ Cast Your Vote</h2>
            <div className="alert alert-info">
              <strong>Important:</strong> You can only vote once. Your vote is anonymous and encrypted.
              Please review your selection carefully before submitting.
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
                  Casting Vote...
                </>
              ) : (
                'Cast Vote'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Voting