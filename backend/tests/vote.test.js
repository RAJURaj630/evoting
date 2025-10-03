const request = require('supertest');
const app = require('../server');
const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');
const Vote = require('./models/Vote');
const mongoose = require('mongoose');

describe('Voting API', () => {
  let authToken;
  let voterId;
  let candidateId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Voter.deleteMany({});
    await Candidate.deleteMany({});
    await Vote.deleteMany({});

    // Create a test voter
    const voterData = {
      voterId: 'VOTER000001',
      name: 'Test Voter',
      email: 'test@example.com',
      password: 'SecurePass123'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(voterData);

    authToken = registerResponse.body.data.token;
    voterId = registerResponse.body.data.voter.id;

    // Create a test candidate
    const candidate = await Candidate.create({
      name: 'Test Candidate',
      party: 'Test Party',
      symbol: '⚡'
    });

    candidateId = candidate._id;
  });

  describe('POST /api/votes/cast', () => {
    it('should allow voter to cast a vote', async () => {
      const voteData = {
        candidateId: candidateId.toString()
      };

      const response = await request(app)
        .post('/api/votes/cast')
        .set('Authorization', `Bearer ${authToken}`)
        .send(voteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.voteId).toBeDefined();
    });

    it('should prevent duplicate voting', async () => {
      const voteData = {
        candidateId: candidateId.toString()
      };

      // First vote
      await request(app)
        .post('/api/votes/cast')
        .set('Authorization', `Bearer ${authToken}`)
        .send(voteData);

      // Second vote attempt
      const response = await request(app)
        .post('/api/votes/cast')
        .set('Authorization', `Bearer ${authToken}`)
        .send(voteData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already');
    });
  });
});