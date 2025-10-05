const crypto = require('crypto');

/**
 * Aadhaar Verification Service
 * Integrates with UIDAI (Unique Identification Authority of India)
 */

class AadhaarService {
  /**
   * Verify Aadhaar number with UIDAI database
   * In production, integrate with UIDAI API
   */
  async verifyAadhaar(aadhaarNumber, name, dob) {
    try {
      // Validate Aadhaar format
      if (!this.validateAadhaarFormat(aadhaarNumber)) {
        return {
          success: false,
          message: 'Invalid Aadhaar number format'
        };
      }

      // In production, this would:
      // 1. Connect to UIDAI API
      // 2. Send OTP to registered mobile
      // 3. Verify OTP
      // 4. Retrieve demographic data
      // 5. Match with provided details
      
      // Simulate API call
      const isValid = this.simulateAadhaarVerification(aadhaarNumber);
      
      if (!isValid) {
        return {
          success: false,
          message: 'Aadhaar verification failed. Number not found in database.'
        };
      }

      return {
        success: true,
        message: 'Aadhaar verified successfully',
        data: {
          aadhaarNumber: this.maskAadhaar(aadhaarNumber),
          name: name,
          verified: true,
          verifiedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Aadhaar verification error: ${error.message}`);
    }
  }

  /**
   * Validate Aadhaar number format
   */
  validateAadhaarFormat(aadhaarNumber) {
    // Must be 12 digits
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaarNumber)) {
      return false;
    }

    // Verhoeff algorithm for Aadhaar validation
    return this.verhoeffCheck(aadhaarNumber);
  }

  /**
   * Verhoeff algorithm for Aadhaar checksum validation
   */
  verhoeffCheck(num) {
    const d = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];

    const p = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];

    let c = 0;
    const myArray = num.split('').reverse();

    for (let i = 0; i < myArray.length; i++) {
      c = d[c][p[(i % 8)][parseInt(myArray[i])]];
    }

    return c === 0;
  }

  /**
   * Send OTP to Aadhaar registered mobile
   */
  async sendOTP(aadhaarNumber) {
    try {
      // In production: Call UIDAI OTP API
      const otp = this.generateOTP();
      
      // Store OTP with expiry (in production, use Redis)
      // For now, return mock response
      
      return {
        success: true,
        message: 'OTP sent to registered mobile number',
        otpSent: true,
        expiresIn: 300, // 5 minutes
        maskedMobile: 'XXXXXX' + Math.floor(1000 + Math.random() * 9000)
      };
    } catch (error) {
      throw new Error(`OTP send failed: ${error.message}`);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(aadhaarNumber, otp) {
    try {
      // In production: Verify with UIDAI
      // For now, accept any 6-digit OTP
      
      if (!/^\d{6}$/.test(otp)) {
        return {
          success: false,
          message: 'Invalid OTP format'
        };
      }

      return {
        success: true,
        message: 'OTP verified successfully',
        verified: true
      };
    } catch (error) {
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  }

  /**
   * Mask Aadhaar number for display (XXXX XXXX 1234)
   */
  maskAadhaar(aadhaarNumber) {
    return 'XXXX XXXX ' + aadhaarNumber.slice(-4);
  }

  /**
   * Generate 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Simulate Aadhaar verification (for development)
   */
  simulateAadhaarVerification(aadhaarNumber) {
    // In development, accept valid format Aadhaar numbers
    return this.validateAadhaarFormat(aadhaarNumber);
  }

  /**
   * Hash Aadhaar number for storage
   */
  hashAadhaar(aadhaarNumber) {
    const hash = crypto.createHash('sha256');
    hash.update(aadhaarNumber + process.env.ENCRYPTION_KEY);
    return hash.digest('hex');
  }
}

module.exports = new AadhaarService();
