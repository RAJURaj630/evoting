import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useMaharashtraAuth } from '../../contexts/MaharashtraAuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useMaharashtraAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
