const crypto = require('crypto');

class KeyGenerator {
  static generateJWTSecret(length = 64) {
    return crypto.randomBytes(length).toString('base64');
  }

  static generateEncryptionKey() {
    // For AES-256, we need exactly 32 bytes
    return crypto.randomBytes(32).toString('base64');
  }

  static generateKeys() {
    const keys = {
      JWT_SECRET: this.generateJWTSecret(),
      ENCRYPTION_KEY: this.generateEncryptionKey()
    };

    console.log('🔐 Generated Secure Keys:');
    console.log('JWT_SECRET=', keys.JWT_SECRET);
    console.log('ENCRYPTION_KEY=', keys.ENCRYPTION_KEY);
    
    return keys;
  }

  // Validate key formats
  static validateJWTSecret(secret) {
    return secret && secret.length >= 32;
  }

  static validateEncryptionKey(key) {
    try {
      const keyBuffer = Buffer.from(key, 'base64');
      return keyBuffer.length === 32;
    } catch {
      return false;
    }
  }
}

module.exports = KeyGenerator;