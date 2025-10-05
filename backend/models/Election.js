const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Election name is required'],
    trim: true,
    default: 'Maharashtra Legislative Assembly Elections 2024'
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: 'Elections for the Maharashtra Legislative Assembly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalVoters: {
    type: Number,
    default: 0
  },
  totalVotesCast: {
    type: Number,
    default: 0
  },
  turnoutPercentage: {
    type: Number,
    default: 0
  },
  constituencies: [{
    type: String,
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
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voter',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
electionSchema.index({ status: 1 });
electionSchema.index({ startDate: 1, endDate: 1 });
electionSchema.index({ isActive: 1 });

// Virtual for checking if election is currently active
electionSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now && 
         this.isActive;
});

// Method to calculate turnout percentage
electionSchema.methods.calculateTurnout = function() {
  if (this.totalVoters > 0) {
    this.turnoutPercentage = (this.totalVotesCast / this.totalVoters) * 100;
  }
  return this.turnoutPercentage;
};

// Pre-save middleware to update status based on dates
electionSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.startDate > now) {
    this.status = 'upcoming';
  } else if (this.startDate <= now && this.endDate >= now) {
    this.status = 'active';
  } else if (this.endDate < now) {
    this.status = 'completed';
  }
  
  next();
});

module.exports = mongoose.model('Election', electionSchema);
