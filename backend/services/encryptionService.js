const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    
    // Use environment variable for encryption key or generate one
    this.encryptionKey = process.env.VOTE_ENCRYPTION_KEY 
      ? Buffer.from(process.env.VOTE_ENCRYPTION_KEY, 'hex')
      : crypto.randomBytes(this.keyLength);
  }

  // Generate a secure encryption key
  generateKey() {
    return crypto.randomBytes(this.keyLength);
  }

  // Encrypt vote data
  encryptVote(voteData) {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('vote-data'));

      let encrypted = cipher.update(JSON.stringify(voteData), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: this.algorithm
      };
    } catch (error) {
      console.error('Vote encryption error:', error);
      throw new Error('Failed to encrypt vote data');
    }
  }

  // Decrypt vote data
  decryptVote(encryptedVote) {
    try {
      const { encryptedData, iv, tag } = encryptedVote;
      
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAAD(Buffer.from('vote-data'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Vote decryption error:', error);
      throw new Error('Failed to decrypt vote data');
    }
  }

  // Generate vote hash for integrity verification
  generateVoteHash(voteData, timestamp, voterId) {
    const dataString = JSON.stringify(voteData) + timestamp + voterId;
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  // Verify vote integrity
  verifyVoteIntegrity(voteData, timestamp, voterId, expectedHash) {
    const calculatedHash = this.generateVoteHash(voteData, timestamp, voterId);
    return calculatedHash === expectedHash;
  }

  // Generate secure voter token
  generateVoterToken(voterId, electionId, timestamp) {
    const data = `${voterId}-${electionId}-${timestamp}`;
    const hash = crypto.createHmac('sha256', this.encryptionKey).update(data).digest('hex');
    return hash;
  }

  // Anonymize voter data for storage
  anonymizeVoterData(voterId, electionId) {
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(voterId.toString(), salt, 10000, 32, 'sha256');
    
    return {
      anonymizedId: hash.toString('hex'),
      salt: salt.toString('hex')
    };
  }

  // Generate device fingerprint
  generateDeviceFingerprint(userAgent, ipAddress, additionalData = {}) {
    const fingerprintData = {
      userAgent,
      ipAddress,
      timestamp: Date.now(),
      ...additionalData
    };
    
    return crypto.createHash('sha256')
      .update(JSON.stringify(fingerprintData))
      .digest('hex');
  }

  // Encrypt sensitive voter information
  encryptSensitiveData(data) {
    try {
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        encryptedData: encrypted
      };
    } catch (error) {
      console.error('Data encryption error:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  // Decrypt sensitive voter information
  decryptSensitiveData(encryptedInfo) {
    try {
      const { encryptedData } = encryptedInfo;
      
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Data decryption error:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }
}

module.exports = new EncryptionService();
