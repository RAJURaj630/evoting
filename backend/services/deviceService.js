const crypto = require('crypto');

/**
 * Device Fingerprinting and Binding Service
 * Prevents unauthorized access and device tampering
 */

class DeviceService {
  /**
   * Generate device fingerprint from request data
   */
  generateDeviceFingerprint(deviceData) {
    const {
      userAgent,
      screenResolution,
      timezone,
      language,
      platform,
      plugins,
      canvas,
      webgl
    } = deviceData;

    const fingerprintData = [
      userAgent || '',
      screenResolution || '',
      timezone || '',
      language || '',
      platform || '',
      JSON.stringify(plugins || []),
      canvas || '',
      webgl || ''
    ].join('|');

    return crypto
      .createHash('sha256')
      .update(fingerprintData)
      .digest('hex');
  }

  /**
   * Generate unique device ID
   */
  generateDeviceId() {
    return 'DEV_' + crypto.randomBytes(16).toString('hex');
  }

  /**
   * Detect device type from user agent
   */
  detectDeviceType(userAgent) {
    const ua = userAgent.toLowerCase();
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Validate device binding
   */
  async validateDevice(voter, deviceData) {
    try {
      const deviceFingerprint = this.generateDeviceFingerprint(deviceData);
      
      // Check if device is bound
      const boundDevice = voter.boundDevices.find(device => 
        device.deviceFingerprint === deviceFingerprint && device.isActive
      );

      if (!boundDevice) {
        return {
          valid: false,
          message: 'Device not recognized. Please bind this device first.',
          requiresBinding: true
        };
      }

      // Update last used timestamp
      boundDevice.lastUsed = new Date();
      await voter.save();

      return {
        valid: true,
        message: 'Device validated successfully',
        device: {
          deviceId: boundDevice.deviceId,
          deviceType: boundDevice.deviceType,
          boundAt: boundDevice.boundAt,
          lastUsed: boundDevice.lastUsed
        }
      };
    } catch (error) {
      throw new Error(`Device validation failed: ${error.message}`);
    }
  }

  /**
   * Bind new device to voter account
   */
  async bindDevice(voter, deviceData, ipAddress) {
    try {
      const deviceFingerprint = this.generateDeviceFingerprint(deviceData);
      
      // Check if device already bound
      const existingDevice = voter.boundDevices.find(device => 
        device.deviceFingerprint === deviceFingerprint
      );

      if (existingDevice) {
        if (existingDevice.isActive) {
          return {
            success: true,
            message: 'Device already bound',
            device: existingDevice
          };
        } else {
          // Reactivate device
          existingDevice.isActive = true;
          existingDevice.lastUsed = new Date();
          await voter.save();
          
          return {
            success: true,
            message: 'Device reactivated',
            device: existingDevice
          };
        }
      }

      // Check device limit
      const activeDevices = voter.boundDevices.filter(d => d.isActive);
      if (activeDevices.length >= 3) {
        return {
          success: false,
          message: 'Maximum device limit reached (3 devices). Please unbind a device first.',
          activeDevices: activeDevices.length
        };
      }

      // Bind new device
      const deviceId = this.generateDeviceId();
      const deviceType = this.detectDeviceType(deviceData.userAgent);

      voter.boundDevices.push({
        deviceId,
        deviceFingerprint,
        deviceType,
        userAgent: deviceData.userAgent,
        ipAddress,
        boundAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      await voter.save();

      return {
        success: true,
        message: 'Device bound successfully',
        device: {
          deviceId,
          deviceType,
          boundAt: new Date()
        }
      };
    } catch (error) {
      throw new Error(`Device binding failed: ${error.message}`);
    }
  }

  /**
   * Unbind device from voter account
   */
  async unbindDevice(voter, deviceId) {
    try {
      const device = voter.boundDevices.find(d => d.deviceId === deviceId);
      
      if (!device) {
        return {
          success: false,
          message: 'Device not found'
        };
      }

      device.isActive = false;
      await voter.save();

      return {
        success: true,
        message: 'Device unbound successfully'
      };
    } catch (error) {
      throw new Error(`Device unbinding failed: ${error.message}`);
    }
  }

  /**
   * Get all bound devices for a voter
   */
  getBoundDevices(voter) {
    return voter.boundDevices
      .filter(d => d.isActive)
      .map(device => ({
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        boundAt: device.boundAt,
        lastUsed: device.lastUsed,
        ipAddress: device.ipAddress
      }));
  }

  /**
   * Detect suspicious device activity
   */
  detectSuspiciousActivity(voter, currentIp) {
    const recentDevices = voter.boundDevices
      .filter(d => d.isActive)
      .sort((a, b) => b.lastUsed - a.lastUsed);

    const suspiciousIndicators = [];

    // Check for multiple devices from different locations
    const uniqueIps = [...new Set(recentDevices.map(d => d.ipAddress))];
    if (uniqueIps.length > 3) {
      suspiciousIndicators.push('Multiple IP addresses detected');
    }

    // Check for rapid device switching
    if (recentDevices.length > 0) {
      const lastUsed = recentDevices[0].lastUsed;
      const timeDiff = Date.now() - new Date(lastUsed).getTime();
      if (timeDiff < 60000) { // Less than 1 minute
        suspiciousIndicators.push('Rapid device switching detected');
      }
    }

    return {
      suspicious: suspiciousIndicators.length > 0,
      indicators: suspiciousIndicators,
      riskLevel: suspiciousIndicators.length === 0 ? 'low' : 
                 suspiciousIndicators.length === 1 ? 'medium' : 'high'
    };
  }
}

module.exports = new DeviceService();
