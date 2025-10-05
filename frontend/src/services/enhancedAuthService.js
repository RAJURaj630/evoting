import api from './api';

/**
 * Enhanced Authentication Service for v2 API
 * Includes Aadhaar verification, biometrics, and device binding
 */
class EnhancedAuthService {
  // Register with Aadhaar verification
  async registerWithAadhaar(userData) {
    const response = await api.post('/api/v2/auth/register', userData);
    return response.data;
  }

  // Verify biometrics (face + liveness)
  async verifyBiometrics(voterId, faceImageData) {
    const response = await api.post('/api/v2/auth/verify-biometrics', {
      voterId,
      faceImageData
    });
    return response.data;
  }

  // Bind device to account
  async bindDevice(voterId, deviceData) {
    const response = await api.post('/api/v2/auth/bind-device', {
      voterId,
      deviceData
    });
    return response.data;
  }

  // Multi-factor login
  async login(voterId, password, deviceId) {
    const response = await api.post('/api/v2/auth/login', {
      voterId,
      password,
      deviceId
    });
    return response.data;
  }

  // Get voter profile
  async getProfile() {
    const response = await api.get('/api/v2/auth/profile');
    return response.data;
  }

  // Update accessibility preferences
  async updateAccessibility(preferences) {
    const response = await api.put('/api/v2/auth/accessibility', preferences);
    return response.data;
  }

  // Generate device fingerprint
  getDeviceFingerprint() {
    const deviceData = {
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio
    };

    // Create a simple hash from device data
    const dataString = JSON.stringify(deviceData);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return {
      deviceId: 'DEV_' + Math.abs(hash).toString(36),
      ...deviceData
    };
  }
}

export default new EnhancedAuthService();
