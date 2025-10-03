import api from './api';

class AuthService {
  // Set authentication token
  setToken(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  // Login user
  async login(voterId, password) {
    const response = await api.post('/auth/login', { voterId, password });
    return response.data;
  }

  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // Get user profile
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.data.voter;
  }

  // Logout user
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }
}

export default new AuthService();