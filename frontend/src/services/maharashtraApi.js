import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v3';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  // Register new voter
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (otpData) => {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (resendData) => {
    const response = await api.post('/auth/resend-otp', resendData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get constituencies
  getConstituencies: async () => {
    const response = await api.get('/auth/constituencies');
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Voting APIs
export const voteAPI = {
  // Get candidates for voter's constituency
  getCandidates: async () => {
    const response = await api.get('/vote/candidates');
    return response.data;
  },

  // Cast vote
  castVote: async (voteData) => {
    const response = await api.post('/vote/cast', voteData);
    return response.data;
  },

  // Get voting status
  getVotingStatus: async () => {
    const response = await api.get('/vote/status');
    return response.data;
  },

  // Verify vote
  verifyVote: async (verificationData) => {
    const response = await api.post('/vote/verify', verificationData);
    return response.data;
  },
};

// Results APIs
export const resultsAPI = {
  // Get live statistics
  getLiveStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/results/live-stats`);
    return response.data;
  },

  // Get election results
  getElectionResults: async (electionId = null) => {
    const url = electionId ? `/results/${electionId}` : '/results';
    const response = await api.get(url);
    return response.data;
  },

  // Get constituency results
  getConstituencyResults: async (constituency, electionId = null) => {
    const params = electionId ? { electionId } : {};
    const response = await api.get(`/results/constituency/${constituency}`, { params });
    return response.data;
  },

  // Export results (admin only)
  exportResults: async (electionId, format = 'json') => {
    const response = await api.get(`/results/export/${electionId}`, {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  },
};

// Admin APIs
export const adminAPI = {
  // Dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Candidate management
  getCandidates: async (params = {}) => {
    const response = await api.get('/admin/candidates', { params });
    return response.data;
  },

  addCandidate: async (candidateData) => {
    const response = await api.post('/admin/candidates', candidateData);
    return response.data;
  },

  updateCandidate: async (candidateId, candidateData) => {
    const response = await api.put(`/admin/candidates/${candidateId}`, candidateData);
    return response.data;
  },

  deleteCandidate: async (candidateId) => {
    const response = await api.delete(`/admin/candidates/${candidateId}`);
    return response.data;
  },

  // Voter management
  getVoters: async (params = {}) => {
    const response = await api.get('/admin/voters', { params });
    return response.data;
  },

  updateVoterStatus: async (voterId, statusData) => {
    const response = await api.put(`/admin/voters/${voterId}/status`, statusData);
    return response.data;
  },

  // Election management
  getElections: async () => {
    const response = await api.get('/admin/elections');
    return response.data;
  },

  createElection: async (electionData) => {
    const response = await api.post('/admin/elections', electionData);
    return response.data;
  },

  updateElectionStatus: async (electionId, statusData) => {
    const response = await api.put(`/admin/elections/${electionId}/status`, statusData);
    return response.data;
  },

  // Audit logs
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        status: -1,
      };
    }
  },

  // Set auth token
  setAuthToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  // Remove auth token
  removeAuthToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get auth token
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Get user data
  getUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  // Set user data
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};

export default api;
