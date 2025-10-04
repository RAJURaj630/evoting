import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsResponse, candidatesResponse] = await Promise.all([
        api.get('/stats'),
        api.get('/candidates')
      ])

      if (statsResponse.data.success) setStats(statsResponse.data.data)
      if (candidatesResponse.data.success) setCandidates(candidatesResponse.data.data.candidates)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-card">
            <h1 className="welcome-title">
              🗳️ Welcome to E-Voting System
            </h1>
            <p className="welcome-subtitle">
              {user ? `Hello ${user.name}, ` : ''}
              Participate in the 2024 General Election
            </p>
            {user && !user.hasVoted && (
              <Link to="/vote" className="btn btn-primary btn-large">
                Cast Your Vote Now
              </Link>
            )}
            {user && user.hasVoted && (
              <div className="alert alert-success">
                ✅ You have already voted. Thank you for participating!
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="stats-section">
            <h2 className="section-title">Election Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-number">{stats.totalVoters?.toLocaleString()}</div>
                <div className="stat-label">Total Voters</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-number">{stats.voted?.toLocaleString()}</div>
                <div className="stat-label">Votes Cast</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-number">{stats.pending?.toLocaleString()}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-number">{stats.turnout}</div>
                <div className="stat-label">Turnout</div>
              </div>
            </div>
          </div>
        )}

        {/* Candidates Preview */}
        <div className="candidates-section">
          <h2 className="section-title">Candidates</h2>
          <div className="candidates-grid">
            {candidates.slice(0, 4).map((candidate) => (
              <div key={candidate.id} className="candidate-card">
                <div className="candidate-symbol">{candidate.symbol}</div>
                <h3 className="candidate-name">{candidate.name}</h3>
                <p className="candidate-party">{candidate.party}</p>
                <p className="candidate-description">{candidate.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions-section">
          <div className="actions-grid">
            <Link to="/vote" className="btn btn-primary btn-large">
              🗳️ Vote Now
            </Link>
            <Link to="/results" className="btn btn-secondary btn-large">
              📊 View Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
