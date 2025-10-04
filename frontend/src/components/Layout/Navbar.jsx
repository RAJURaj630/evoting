import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🗳️ E-Voting System
        </Link>
        
        <div className="navbar-menu">
          <div className="navbar-nav">
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/vote" className="nav-link">Vote</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
              </>
            )}
            <Link to="/results" className="nav-link">Results</Link>
          </div>
          
          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                <span className="welcome-text">
                  Welcome, {user?.name}
                </span>
                <button className="btn btn-outline" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
