const request = require('supertest');
const app = require('../server');
const Voter = require('../models/Voter');
const mongoose = require('mongoose');

describe('Authentication API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Voter.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new voter successfully', async () => {
      const voterData = {
        voterId: 'VOTER000001',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(voterData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.voter.voterId).toBe(voterData.voterId);
      expect(response.body.data.voter.name).toBe(voterData.name);
      expect(response.body.data.voter.email).toBe(voterData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject duplicate voter registration', async () => {
      const voterData = {
        voterId: 'VOTER000001',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };

      // First registration
      await request(app).post('/api/auth/register').send(voterData);

      // Second registration with same data
      const response = await request(app)
        .post('/api/auth/register')
        .send(voterData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const voterData = {
        voterId: 'VOTER000001',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123'
      };
      await request(app).post('/api/auth/register').send(voterData);
    });

    it('should login voter with correct credentials', async () => {
      const loginData = {
        voterId: 'VOTER000001',
        password: 'SecurePass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.voter.voterId).toBe(loginData.voterId);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const loginData = {
        voterId: 'VOTER000001',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });
  });
});