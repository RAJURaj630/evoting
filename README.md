# 🗳️ Enhanced E-Voting System v2.0

A secure, transparent, and accessible electronic voting system with **enterprise-grade security features** including Aadhaar verification, AI biometrics, blockchain, and VVPAT digital audit trail.

## 🌟 Version 2.0 Features

### Core Security Features
- 🆔 **Aadhaar-based voter verification** with Verhoeff algorithm
- 👤 **AI-powered biometric authentication** (liveness detection + face matching)
- 📱 **Device binding** with fingerprinting (max 3 devices)
- ⛓️ **Blockchain vote storage** with SHA-256 proof of work
- 🧾 **VVPAT digital receipts** with QR codes and verification codes
- 🔐 **End-to-end encryption** (AES-256-CBC)
- 🔒 **Multi-factor authentication** (Password + Biometric + Device)

### Accessibility & Inclusivity
- 🌍 **Multi-language support** (10 Indian languages)
- ♿ **WCAG 2.0 AA compliant** accessibility
- 🎨 **High contrast mode** and large text options
- ⌨️ **Keyboard navigation** and screen reader support

### Transparency & Auditability
- 📊 **Real-time results** with blockchain validation
- 📝 **Comprehensive audit logging** (MongoDB + Blockchain)
- 🔍 **Vote verification** using VVPAT receipts
- 📈 **Live statistics** and turnout tracking

### Additional Features
- 🚫 **Double voting prevention** (4-layer protection)
- 🔄 **Account lockout** after failed attempts
- ⚡ **Rate limiting** (100 requests per 15 minutes)
- 🛡️ **Tamper detection** with digital signatures

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm start