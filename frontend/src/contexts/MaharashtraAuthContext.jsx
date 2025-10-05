import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, apiUtils } from '../services/maharashtraApi';
import toast from 'react-hot-toast';

const MaharashtraAuthContext = createContext();

export const useMaharashtraAuth = () => {
  const context = useContext(MaharashtraAuthContext);
  if (!context) {
    throw new Error('useMaharashtraAuth must be used within a MaharashtraAuthProvider');
  }
  return context;
};

export const MaharashtraAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = apiUtils.getAuthToken();
      const savedUser = apiUtils.getUser();

      if (token && savedUser) {
        // Verify token is still valid by fetching profile
        const response = await authAPI.getProfile();
        if (response.success) {
          setUser(response.data.voter);
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear auth data
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    apiUtils.removeAuthToken();
  };

  // Register new voter
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        toast.success(response.message);
        return { success: true, data: response.data };
      } else {
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorResponse = apiUtils.handleError(error);
      toast.error(errorResponse.message);
      return errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (otpData) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyOTP(otpData);
      
      if (response.success) {
        const { voter, token } = response.data;
        
        // Set auth data
        apiUtils.setAuthToken(token);
        apiUtils.setUser(voter);
        setUser(voter);
        setIsAuthenticated(true);
        
        toast.success(response.message);
        return { success: true, data: response.data };
      } else {
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorResponse = apiUtils.handleError(error);
      toast.error(errorResponse.message);
      return errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async (resendData) => {
    try {
      setLoading(true);
      const response = await authAPI.resendOTP(resendData);
      
      if (response.success) {
        toast.success(response.message);
        return { success: true, data: response.data };
      } else {
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorResponse = apiUtils.handleError(error);
      toast.error(errorResponse.message);
      return errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { voter, token } = response.data;
        
        // Set auth data
        apiUtils.setAuthToken(token);
        apiUtils.setUser(voter);
        setUser(voter);
        setIsAuthenticated(true);
        
        toast.success(response.message);
        return { success: true, data: response.data };
      } else {
        if (response.requiresVerification) {
          return { 
            success: false, 
            requiresVerification: true, 
            message: response.message 
          };
        }
        toast.error(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorResponse = apiUtils.handleError(error);
      toast.error(errorResponse.message);
      return errorResponse;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      clearAuth();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear auth data even if API call fails
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // Get constituencies
  const getConstituencies = async () => {
    try {
      const response = await authAPI.getConstituencies();
      return response;
    } catch (error) {
      const errorResponse = apiUtils.handleError(error);
      toast.error(errorResponse.message);
      return errorResponse;
    }
  };

  // Update user profile
  const updateProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setUser(response.data.voter);
        apiUtils.setUser(response.data.voter);
      }
      return response;
    } catch (error) {
      const errorResponse = apiUtils.handleError(error);
      return errorResponse;
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user is eligible to vote
  const isEligible = () => {
    return user?.isEligible && user?.otpVerified;
  };

  // Check if user has voted
  const hasVoted = () => {
    return user?.hasVoted;
  };

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Actions
    register,
    verifyOTP,
    resendOTP,
    login,
    logout,
    getConstituencies,
    updateProfile,
    
    // Utility functions
    isAdmin,
    isEligible,
    hasVoted,
    clearAuth,
  };

  return (
    <MaharashtraAuthContext.Provider value={value}>
      {children}
    </MaharashtraAuthContext.Provider>
  );
};
