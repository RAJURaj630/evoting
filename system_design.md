# E-Voting System - System Design

## 1. Architecture Overview
Three-tier architecture with React frontend, Express backend, and MongoDB database.

## 2. Component Diagram
[React Frontend] ↔ [Express API] ↔ [MongoDB Atlas]
↑ ↑ ↑
[JWT Auth] [Encryption] [Audit Logs]

## 3. Database Design
### Collections:
- Voters
- Candidates  
- Votes
- AuditLogs

## 4. Security Architecture
- JWT for authentication
- bcrypt for password hashing
- AES encryption for votes
- HTTPS for transport security