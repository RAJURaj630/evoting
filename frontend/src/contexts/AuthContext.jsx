import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored token and user on app load
    const token = localStorage.getItem('evoting_token');
    const storedUser = localStorage.getItem('evoting_user');
    
    if (token && storedUser) {
      authService.setToken(token);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async () => {
    // Profile fetching not needed for mock backend
    setLoading(false);
  };

  const login = async (voterId, password) => {
    try {
      setLoading(true);
      const response = await authService.login(voterId, password);
      
      if (response.success) {
        const { voter, token } = response.data;
        localStorage.setItem('evoting_token', token);
        localStorage.setItem('evoting_user', JSON.stringify(voter));
        authService.setToken(token);
        
        setUser(voter);
        setIsAuthenticated(true);
        return { success: true, message: response.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        const { voter, token } = response.data;
        localStorage.setItem('evoting_token', token);
        localStorage.setItem('evoting_user', JSON.stringify(voter));
        authService.setToken(token);
        
        setUser(voter);
        setIsAuthenticated(true);
        return { success: true, message: response.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('evoting_token');
      localStorage.removeItem('evoting_user');
      authService.setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser: fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};