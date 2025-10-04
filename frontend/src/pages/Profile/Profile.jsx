import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Profile = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="profile-container">
        <div className="container">
          <div className="alert alert-warning">
            ⚠️ Please log in to view your profile.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-icon">👤</div>
            <h2>Voter Profile</h2>
          </div>
          
          <div className="profile-content">
            <div className="profile-field">
              <label>Name:</label>
              <span>{user.name}</span>
            </div>

            <div className="profile-field">
              <label>Voter ID:</label>
              <span>{user.voterId}</span>
            </div>

            <div className="profile-field">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>

            <div className="profile-field">
              <label>Voting Status:</label>
              <span>
                {user.hasVoted ? (
                  <span className="badge badge-success">
                    ✅ Voted
                  </span>
                ) : (
                  <span className="badge badge-warning">
                    ⏳ Not Voted
                  </span>
                )}
              </span>
            </div>

            <div className="profile-field">
              <label>Registration Date:</label>
              <span>
                {user.registrationDate ? 
                  new Date(user.registrationDate).toLocaleDateString() : 
                  'N/A'
                }
              </span>
            </div>

            {user.hasVoted && (
              <div className="alert alert-success">
                ✅ <strong>Thank you for voting!</strong><br />
                Your vote has been recorded securely and will be counted in the final results.
              </div>
            )}

            {!user.hasVoted && (
              <div className="alert alert-info">
                ℹ️ <strong>Ready to vote?</strong><br />
                Visit the voting page to cast your ballot in the 2024 General Election.
                <Link to="/vote" className="btn btn-primary btn-small">
                  Vote Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
