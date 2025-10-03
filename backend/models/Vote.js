const mongoose = require('mongoose');
const crypto = require('crypto');

const voteSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voter',
    required: [true, 'Voter ID is required'],
    unique: true // Ensures one vote per voter
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: [true, 'Candidate ID is required']
  },
  encryptedVote: {
    type: String,
    required: [true, 'Encrypted vote is required']
  },
  voteHash: {
    type: String,
    required: [true, 'Vote hash is required'],
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  electionRound: {
    type: String,
    default: '2024-GENERAL',
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
voteSchema.index({ voterId: 1, electionRound: 1 });
voteSchema.index({ candidateId: 1, electionRound: 1 });
voteSchema.index({ timestamp: 1 });

// Pre-save middleware to generate vote hash
voteSchema.pre('save', function(next) {
  if (this.isModified('encryptedVote') || this.isNew) {
    const hash = crypto.createHash('sha256');
    hash.update(this.encryptedVote + this.timestamp.toString() + this.voterId.toString());
    this.voteHash = hash.digest('hex');
  }
  next();
});

// Static method to check if voter has already voted
voteSchema.statics.hasVoted = async function(voterId, electionRound = '2024-GENERAL') {
  const vote = await this.findOne({ voterId, electionRound });
  return !!vote;
};

module.exports = mongoose.model('Vote', voteSchema);