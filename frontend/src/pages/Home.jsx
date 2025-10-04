import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">E-Voting System</h1>
          <p className="hero-subtitle">Secure Electronic Voting Platform</p>
          <p className="hero-description">
            Cast your vote securely with our advanced electronic voting system. 
            Your privacy is protected and every vote counts.
          </p>
          
          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard
                </Link>
                <Link to="/vote" className="btn btn-secondary btn-large">
                  Cast Your Vote
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  Register to Vote
                </Link>
                <Link to="/login" className="btn btn-secondary btn-large">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our E-Voting System?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗳️</div>
              <h3>Secure Voting</h3>
              <p>Cast your vote securely with advanced encryption technology</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Results</h3>
              <p>View election results in real-time as votes are counted</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Privacy Protected</h3>
              <p>Your vote remains anonymous and secure throughout the process</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Verified Identity</h3>
              <p>Secure voter authentication ensures election integrity</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy Access</h3>
              <p>Vote from anywhere with our user-friendly interface</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Transparent</h3>
              <p>Full audit trail for complete transparency and accountability</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="container">
          <h2 className="section-title">Election Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">12,500</div>
              <div className="stat-label">Registered Voters</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">7,843</div>
              <div className="stat-label">Votes Cast</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">62.7%</div>
              <div className="stat-label">Turnout Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4</div>
              <div className="stat-label">Candidates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
