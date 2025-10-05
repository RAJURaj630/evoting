import React, { useState, useEffect } from 'react'
import voteService from '../../services/voteService'
import enhancedVoteService from '../../services/enhancedVoteService'

const Results = () => {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [useEnhancedMode, setUseEnhancedMode] = useState(true)
  const [blockchainStatus, setBlockchainStatus] = useState(null)

  useEffect(() => {
    fetchResults()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchResults, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchResults = async () => {
    try {
      let response
      if (useEnhancedMode) {
        response = await enhancedVoteService.getResults()
        if (response.success) {
          setResults(response.data)
          setBlockchainStatus(response.data.blockchain)
          setError('')
        }
      } else {
        response = await voteService.getResults()
        if (response.success) {
          setResults(response.data)
          setError('')
        }
      }
      
      if (!response.success) {
        setError('Failed to load results')
      }
    } catch (error) {
      console.error('Error fetching results:', error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="results-container">
        <div className="container">
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="results-container">
      <div className="container">
        {/* Header */}
        <div className="results-header">
          <div className="results-title-card">
            <h1 className="results-title">
              📊 Election Results
            </h1>
            <p className="results-subtitle">{results?.election || '2024 General Election'}</p>
            <div className="results-stats">
              <div className="result-stat">
                <div className="stat-number">{results?.totalVotes?.toLocaleString() || '0'}</div>
                <div className="stat-label">Total Votes</div>
              </div>
              <div className="result-stat">
                <div className="stat-number">{results?.turnout || '0%'}</div>
                <div className="stat-label">Turnout</div>
              </div>
              <div className="result-stat">
                <div className="stat-number">{results?.leading || 'TBD'}</div>
                <div className="stat-label">Leading</div>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Status */}
        {useEnhancedMode && blockchainStatus && (
          <div className={`blockchain-status ${blockchainStatus.valid ? 'valid' : 'invalid'}`}>
            <div className="blockchain-icon">
              {blockchainStatus.valid ? '✅' : '⚠️'}
            </div>
            <div className="blockchain-info">
              <h3>Blockchain Validation</h3>
              <p>{blockchainStatus.message}</p>
              {blockchainStatus.valid && (
                <div className="blockchain-details">
                  <span className="detail-badge">🔗 Immutable</span>
                  <span className="detail-badge">🔒 Encrypted</span>
                  <span className="detail-badge">✓ Verified</span>
                </div>
              )}
            </div>
            <button 
              className="toggle-mode-btn"
              onClick={() => setUseEnhancedMode(!useEnhancedMode)}
            >
              Switch to {useEnhancedMode ? 'Standard' : 'Enhanced'} Mode
            </button>
          </div>
        )}

        {/* Live Results Header */}
        <div className="results-section">
          <h2 className="section-title">
            {useEnhancedMode ? '🔐 Blockchain-Verified Results' : 'Live Results'}
            <span className="update-time">
              🔄 Last updated: {results?.lastUpdated ? new Date(results.lastUpdated).toLocaleTimeString() : 'Now'}
            </span>
          </h2>

          {results?.results && (
            <div className="results-grid">
              {results.results.map((candidate, index) => (
                <div key={candidate.candidateId} className={`result-card ${index === 0 ? 'leading' : ''}`}>
                  <div className="result-header">
                    <div className="candidate-symbol-result">
                      {candidate.symbol || ['🌹', '⭐', '🌿', '🕊️'][index]}
                    </div>
                    <div className="candidate-info">
                      <h3 className="candidate-name">
                        {candidate.name}
                        {index === 0 && (
                          <span className="leading-badge">Leading</span>
                        )}
                      </h3>
                      <p className="candidate-party">{candidate.party}</p>
                    </div>
                  </div>

                  <div className="vote-stats">
                    <div className="vote-count">
                      <span className="votes-label">Votes: </span>
                      <span className="votes-number">{candidate.votes?.toLocaleString()}</span>
                      <span className="percentage">{candidate.percentage}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${index === 0 ? 'leading' : ''}`}
                        style={{ width: candidate.percentage }}
                      ></div>
                    </div>
                  </div>

                  <div className="result-footer">
                    📈 {candidate.percentage} of total votes
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Info */}
          <div className="results-footer">
            <div className="alert alert-info">
              ℹ️ Results are updated in real-time. Final results will be announced after voting closes.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results
