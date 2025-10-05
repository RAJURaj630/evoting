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
                <Link to="/register-enhanced" className="btn btn-primary btn-large">
                  🔐 Enhanced Registration
                </Link>
                <Link to="/register" className="btn btn-secondary btn-large">
                  Standard Registration
                </Link>
                <Link to="/login" className="btn btn-outline btn-large">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">🚀 Enhanced Security Features</h2>
          <div className="features-grid">
            <div className="feature-card enhanced">
              <div className="feature-icon">🆔</div>
              <h3>Aadhaar Verification</h3>
              <p>Secure voter verification using Aadhaar with Verhoeff algorithm</p>
            </div>
            <div className="feature-card enhanced">
              <div className="feature-icon">👤</div>
              <h3>AI Biometrics</h3>
              <p>Liveness detection and face matching for enhanced security</p>
            </div>
            <div className="feature-card enhanced">
              <div className="feature-icon">🔗</div>
              <h3>Blockchain Storage</h3>
              <p>Immutable vote recording with SHA-256 proof of work</p>
            </div>
            <div className="feature-card enhanced">
              <div className="feature-icon">🎫</div>
              <h3>VVPAT Receipt</h3>
              <p>Digital audit trail with QR code and cryptographic signature</p>
            </div>
            <div className="feature-card enhanced">
              <div className="feature-icon">📱</div>
              <h3>Device Binding</h3>
              <p>Secure device fingerprinting prevents unauthorized access</p>
            </div>
            <div className="feature-card enhanced">
              <div className="feature-icon">🌐</div>
              <h3>Multi-Language</h3>
              <p>Support for 10 Indian languages with WCAG 2.0 AA compliance</p>
            </div>
          </div>
          
          <div className="enhanced-badge">
            <span className="badge-icon">✨</span>
            <span className="badge-text">All features follow international standards for secure electronic voting</span>
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
