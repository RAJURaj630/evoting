const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const voterSchema = new mongoose.Schema({
  voterId: {
    type: String,
    required: [true, 'Voter ID is required'],
    unique: true,
    trim: true,
    match: [/^VOTER\d{6}$/, 'Please enter a valid voter ID format (VOTER000001)']
  },
  // Aadhaar verification
  aadhaarNumber: {
    type: String,
    required: false, // Made optional for registration
    unique: true,
    sparse: true, // Allow multiple null values
    match: [/^\d{12}$/, 'Please enter a valid 12-digit Aadhaar number'],
    select: false // Hide for security
  },
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  aadhaarVerificationDate: {
    type: Date
  },
  // EPIC (Voter ID Card) verification
  epicNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^[A-Z]{3}\d{7}$/, 'Please enter a valid EPIC number (e.g., ABC1234567)']
  },
  epicVerified: {
    type: Boolean,
    default: false
  },
  // Biometric verification
  faceImageHash: {
    type: String,
    select: false // Hash of face image for matching
  },
  faceVerified: {
    type: Boolean,
    default: false
  },
  livelinessCheckPassed: {
    type: Boolean,
    default: false
  },
  biometricVerificationDate: {
    type: Date
  },
  // Device binding
  boundDevices: [{
    deviceId: {
      type: String,
      required: true
    },
    deviceFingerprint: {
      type: String,
      required: true
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop']
    },
    userAgent: String,
    ipAddress: String,
    boundAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  // Maharashtra-specific fields
  constituency: {
    type: String,
    required: [true, 'Constituency is required'],
    enum: [
      'Mumbai South', 'Mumbai North', 'Mumbai North-East', 'Mumbai North-West',
      'Mumbai North-Central', 'Mumbai South-Central', 'Pune', 'Baramati',
      'Nagpur', 'Wardha', 'Nashik', 'Maval', 'Thane', 'Kalyan',
      'Aurangabad', 'Jalna', 'Solapur', 'Madha', 'Kolhapur', 'Hatkanangle',
      'Sangli', 'Satara', 'Ratnagiri-Sindhudurg', 'Raigad', 'Ahmednagar',
      'Shirdi', 'Beed', 'Osmanabad', 'Latur', 'Nanded', 'Hingoli',
      'Parbhani', 'Jalgaon', 'Raver', 'Buldhana', 'Akola', 'Amravati',
      'Yavatmal-Washim', 'Chandrapur', 'Gadchiroli-Chimur', 'Bhandara-Gondiya',
      'Gondia', 'Dhule', 'Nandurbar'
    ]
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter'
  },
  // OTP verification
  otpSecret: {
    type: String,
    select: false
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  otpVerifiedAt: {
    type: Date
  },
  // Election participation
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election'
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false
  },
  hasVoted: {
    type: Boolean,
    default: false
  },
  voteTimestamp: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEligible: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'partial', 'verified', 'rejected'],
    default: 'pending'
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa'],
    default: 'en'
  },
  accessibilityNeeds: {
    screenReader: { type: Boolean, default: false },
    highContrast: { type: Boolean, default: false },
    largeText: { type: Boolean, default: false },
    keyboardOnly: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
voterSchema.index({ voterId: 1 });
voterSchema.index({ email: 1 });
voterSchema.index({ hasVoted: 1 });
voterSchema.index({ aadhaarNumber: 1 });
voterSchema.index({ epicNumber: 1 });
voterSchema.index({ verificationStatus: 1 });
voterSchema.index({ 'boundDevices.deviceId': 1 });

// Method to check password
voterSchema.methods.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Static method to hash password
voterSchema.statics.hashPassword = async function(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Method to check if voter is fully verified
voterSchema.methods.isFullyVerified = function() {
  return this.aadhaarVerified && 
         (this.epicVerified || !this.epicNumber) && 
         this.faceVerified && 
         this.livenessCheckPassed &&
         this.verificationStatus === 'verified';
};

// Method to check if device is bound
voterSchema.methods.isDeviceBound = function(deviceId) {
  return this.boundDevices.some(device => 
    device.deviceId === deviceId && device.isActive
  );
};

// Method to bind a new device
voterSchema.methods.bindDevice = function(deviceData) {
  // Limit to 3 active devices
  const activeDevices = this.boundDevices.filter(d => d.isActive);
  if (activeDevices.length >= 3) {
    throw new Error('Maximum number of devices reached. Please unbind a device first.');
  }
  
  this.boundDevices.push({
    deviceId: deviceData.deviceId,
    deviceFingerprint: deviceData.fingerprint,
    deviceType: deviceData.type,
    userAgent: deviceData.userAgent,
    ipAddress: deviceData.ipAddress
  });
};

// Method to check if account is locked
voterSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
voterSchema.methods.incLoginAttempts = async function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
voterSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

module.exports = mongoose.model('Voter', voterSchema);