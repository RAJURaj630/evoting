import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import enhancedAuthService from '../../services/enhancedAuthService'
import './EnhancedRegister.css'

const EnhancedRegister = () => {
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Biometrics, 3: Device Binding
  const [formData, setFormData] = useState({
    voterId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    aadhaarNumber: '',
    epicNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [registeredVoterId, setRegisteredVoterId] = useState('')
  const [biometricData, setBiometricData] = useState(null)
  const [deviceData, setDeviceData] = useState(null)

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  // Step 1: Register with Aadhaar
  const handleBasicRegistration = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (formData.aadhaarNumber.length !== 12) {
      setError('Aadhaar number must be 12 digits')
      setLoading(false)
      return
    }

    try {
      const result = await enhancedAuthService.registerWithAadhaar({
        voterId: formData.voterId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        aadhaarNumber: formData.aadhaarNumber,
        epicNumber: formData.epicNumber || undefined
      })

      if (result.success) {
        setRegisteredVoterId(formData.voterId)
        setSuccess('✅ Aadhaar verification successful!')
        setTimeout(() => {
          setStep(2)
          setSuccess('')
        }, 1500)
      } else {
        setError(result.message || 'Registration failed')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Biometric Verification
  const handleBiometricVerification = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate face capture (in production, use actual camera API)
      const simulatedFaceData = 'base64_encoded_face_image_' + Date.now()
      
      const result = await enhancedAuthService.verifyBiometrics(
        registeredVoterId,
        simulatedFaceData
      )

      if (result.success) {
        setBiometricData(result.data)
        setSuccess('✅ Biometric verification successful!')
        setTimeout(() => {
          setStep(3)
          setSuccess('')
        }, 1500)
      } else {
        setError(result.message || 'Biometric verification failed')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Biometric verification failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Device Binding
  const handleDeviceBinding = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const deviceInfo = enhancedAuthService.getDeviceFingerprint()
      
      const result = await enhancedAuthService.bindDevice(
        registeredVoterId,
        deviceInfo
      )

      if (result.success) {
        setDeviceData(result.data)
        setSuccess('✅ Device binding successful! Registration complete!')
        
        // Store token and redirect
        if (result.data.token) {
          localStorage.setItem('evoting_token', result.data.token)
          localStorage.setItem('evoting_user', JSON.stringify(result.data.voter))
        }
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setError(result.message || 'Device binding failed')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Device binding failed')
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
        <div className="step-number">1</div>
        <div className="step-label">Aadhaar Verification</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
        <div className="step-number">2</div>
        <div className="step-label">Biometric Scan</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${step >= 3 ? 'active' : ''}`}>
        <div className="step-number">3</div>
        <div className="step-label">Device Binding</div>
      </div>
    </div>
  )

  return (
    <div className="auth-container enhanced-register">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>Enhanced Voter Registration</h2>
          <p>Secure registration with Aadhaar & Biometric verification</p>
        </div>

        {renderStepIndicator()}

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Step 1: Basic Registration with Aadhaar */}
        {step === 1 && (
          <form onSubmit={handleBasicRegistration} className="auth-form">
            <div className="form-section">
              <h3>📋 Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="voterId">Voter ID *</label>
                  <input
                    type="text"
                    id="voterId"
                    name="voterId"
                    value={formData.voterId}
                    onChange={handleChange}
                    placeholder="e.g., VOTER000001"
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="As per Aadhaar"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>🆔 Identity Verification</h3>
              <div className="form-group">
                <label htmlFor="aadhaarNumber">Aadhaar Number * (12 digits)</label>
                <input
                  type="text"
                  id="aadhaarNumber"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="123456789012"
                  required
                  maxLength="12"
                  pattern="[0-9]{12}"
                  className="form-input"
                />
                <small className="form-hint">Your Aadhaar will be securely verified</small>
              </div>

              <div className="form-group">
                <label htmlFor="epicNumber">EPIC Number (Optional)</label>
                <input
                  type="text"
                  id="epicNumber"
                  name="epicNumber"
                  value={formData.epicNumber}
                  onChange={handleChange}
                  placeholder="ABC1234567"
                  maxLength="10"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>🔒 Security</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying Aadhaar...
                </>
              ) : (
                'Continue to Biometric Verification →'
              )}
            </button>
          </form>
        )}

        {/* Step 2: Biometric Verification */}
        {step === 2 && (
          <form onSubmit={handleBiometricVerification} className="auth-form">
            <div className="biometric-section">
              <div className="biometric-icon">📸</div>
              <h3>Face Recognition & Liveness Detection</h3>
              <p>We'll verify your identity using facial recognition</p>
              
              <div className="biometric-info">
                <div className="info-item">
                  <span className="icon">👁️</span>
                  <span>Liveness Detection</span>
                </div>
                <div className="info-item">
                  <span className="icon">🔍</span>
                  <span>Face Matching</span>
                </div>
                <div className="info-item">
                  <span className="icon">🛡️</span>
                  <span>Anti-Spoofing</span>
                </div>
              </div>

              <div className="camera-placeholder">
                <div className="camera-frame">
                  <div className="scan-line"></div>
                  <p>📷 Camera will activate here</p>
                  <small>In production, this will use your device camera</small>
                </div>
              </div>

              <div className="instructions">
                <h4>Instructions:</h4>
                <ul>
                  <li>Position your face in the center</li>
                  <li>Ensure good lighting</li>
                  <li>Remove glasses if possible</li>
                  <li>Look directly at the camera</li>
                </ul>
              </div>
            </div>

            <div className="button-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Capture & Verify →'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Device Binding */}
        {step === 3 && (
          <form onSubmit={handleDeviceBinding} className="auth-form">
            <div className="device-section">
              <div className="device-icon">📱</div>
              <h3>Device Binding</h3>
              <p>Secure your account by binding this device</p>
              
              <div className="device-info-box">
                <h4>Device Information:</h4>
                <div className="device-details">
                  <div className="detail-item">
                    <strong>Browser:</strong>
                    <span>{navigator.userAgent.split(' ').slice(-1)[0]}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Platform:</strong>
                    <span>{navigator.platform}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Screen:</strong>
                    <span>{window.screen.width}x{window.screen.height}</span>
                  </div>
                </div>
              </div>

              <div className="security-features">
                <h4>Security Benefits:</h4>
                <ul>
                  <li>✅ Prevents unauthorized access</li>
                  <li>✅ Tracks device usage</li>
                  <li>✅ Detects suspicious activity</li>
                  <li>✅ Maximum 3 devices allowed</li>
                </ul>
              </div>
            </div>

            <div className="button-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Binding Device...
                  </>
                ) : (
                  'Complete Registration ✓'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
          <p className="security-note">
            🔒 Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  )
}

export default EnhancedRegister
