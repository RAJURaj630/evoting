import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  
  return (
    <>
      <div className="App">
      <header className="App-header">
        <h1>E-Voting System</h1>
        <p>Secure Electronic Voting Platform</p>
        <div className="features">
          <div className="feature-card">
            <h3>🗳️ Secure Voting</h3>
            <p>Cast your vote securely with blockchain technology</p>
          </div>
          <div className="feature-card">
            <h3>📊 Real-time Results</h3>
            <p>View election results in real-time</p>
          </div>
          <div className="feature-card">
            <h3>🔒 Privacy Protected</h3>
            <p>Your vote remains anonymous and secure</p>
          </div>
        </div>
      </header>
    </div>
    </>
  )
}

export default App
