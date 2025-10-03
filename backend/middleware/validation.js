const validator = require('validator');

const validateVoterRegistration = (req, res, next) => {
  const { voterId, name, email, password } = req.body;

  // Validate voter ID format
  if (!voterId || !/^VOTER\d{6}$/.test(voterId)) {
    return res.status(400).json({
      success: false,
      message: 'Voter ID must be in format VOTER000001'
    });
  }

  // Validate name
  if (!name || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name must be between 2 and 100 characters'
    });
  }

  // Validate email
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  // Validate password
  if (!password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    });
  }

  next();
};

const validateVote = (req, res, next) => {
  const { candidateId } = req.body;

  if (!candidateId) {
    return res.status(400).json({
      success: false,
      message: 'Candidate ID is required'
    });
  }

  if (!validator.isMongoId(candidateId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid candidate ID format'
    });
  }

  next();
};

module.exports = {
  validateVoterRegistration,
  validateVote
};