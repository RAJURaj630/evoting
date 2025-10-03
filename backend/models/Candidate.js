const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  party: {
    type: String,
    required: [true, 'Party name is required'],
    trim: true,
    maxlength: [100, 'Party name cannot exceed 100 characters']
  },
  symbol: {
    type: String,
    required: [true, 'Party symbol is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  voteCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries and sorting
candidateSchema.index({ party: 1 });
candidateSchema.index({ voteCount: -1 });

// Pre-save middleware to ensure voteCount doesn't go negative
candidateSchema.pre('save', function(next) {
  if (this.voteCount < 0) {
    this.voteCount = 0;
  }
  next();
});

module.exports = mongoose.model('Candidate', candidateSchema);