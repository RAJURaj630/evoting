import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { MaharashtraAuthProvider } from './contexts/MaharashtraAuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import MaharashtraNavbar from './components/Layout/MaharashtraNavbar'
import Home from './pages/Maharashtra/Home'
import Login from './pages/Maharashtra/Auth/Login'
import Register from './pages/Maharashtra/Auth/Register'
import OTPVerification from './pages/Maharashtra/Auth/OTPVerification'
import Dashboard from './pages/Maharashtra/Dashboard/Dashboard'
import Voting from './pages/Maharashtra/Voting/Voting'
import Results from './pages/Maharashtra/Results/Results'
import Profile from './pages/Maharashtra/Profile/Profile'
import AdminDashboard from './pages/Maharashtra/Admin/AdminDashboard'
import ProtectedRoute from './components/Routes/ProtectedRoute'
import AdminRoute from './components/Routes/AdminRoute'
import './styles/maharashtra-theme.css'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <MaharashtraAuthProvider>
        <Router>
          <div className="App">
            <MaharashtraNavbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                <Route path="/results" element={<Results />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/vote" element={
                  <ProtectedRoute>
                    <Voting />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--primary-green)',
                    secondary: 'var(--primary-white)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--error)',
                    secondary: 'var(--primary-white)',
                  },
                },
              }}
            />
          </div>
        </Router>
      </MaharashtraAuthProvider>
    </ThemeProvider>
  )
}

export default App
