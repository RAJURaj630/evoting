# Low-Level Design Document

## 1. Database Schema
### Voters Collection:
```javascript
{
  _id: ObjectId,
  voterId: String, // Unique
  name: String,
  email: String,
  passwordHash: String,
  hasVoted: Boolean,
  createdAt: Date
}
Candidates Collection:
javascript
{
  _id: ObjectId,
  name: String,
  party: String,
  symbol: String,
  voteCount: Number
}
Votes Collection:
javascript
{
  _id: ObjectId,
  voterId: ObjectId,
  candidateId: ObjectId,
  encryptedVote: String,
  timestamp: Date,
  voteHash: String
}
2. API Endpoints
POST /api/auth/login

POST /api/auth/register

GET /api/candidates

POST /api/votes

GET /api/results

GET /api/audit-logs

text

## 5. Backend Implementation

**backend/package.json**
```json
{
  "name": "evoting-backend",
  "version": "1.0.0",
  "description": "Secure E-Voting System Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "crypto": "^1.0.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "validator": "^13.11.0"
  },
  "devDependencies": {
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.1"
  }
}