const crypto = require('crypto');

/**
 * VVPAT (Voter Verifiable Paper Audit Trail) Service
 * Digital audit trail for vote verification and transparency
 */

class VVPATService {
  /**
   * Generate VVPAT receipt for voter
   */
  generateReceipt(voteData, voter) {
    const receiptId = this.generateReceiptId();
    const timestamp = new Date();
    
    const receipt = {
      receiptId,
      voterId: voter.voterId,
      voterName: voter.name,
      candidateId: voteData.candidateId,
      candidateName: voteData.candidateName,
      candidateParty: voteData.candidateParty,
      candidateSymbol: voteData.candidateSymbol,
      timestamp: timestamp.toISOString(),
      electionRound: voteData.electionRound || '2024-GENERAL',
      pollingStation: voteData.pollingStation || 'ONLINE',
      verificationCode: this.generateVerificationCode(receiptId, voter.voterId),
      qrCode: this.generateQRCode(receiptId),
      digitalSignature: this.generateDigitalSignature(voteData, voter, timestamp)
    };

    return receipt;
  }

  /**
   * Generate unique receipt ID
   */
  generateReceiptId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `VVPAT-${timestamp}-${random}`;
  }

  /**
   * Generate verification code for receipt
   */
  generateVerificationCode(receiptId, voterId) {
    const hash = crypto.createHash('sha256');
    hash.update(receiptId + voterId + process.env.ENCRYPTION_KEY);
    return hash.digest('hex').substring(0, 12).toUpperCase();
  }

  /**
   * Generate QR code data for receipt
   */
  generateQRCode(receiptId) {
    // In production, use a QR code library
    // For now, return base64 encoded data
    const qrData = {
      receiptId,
      verifyUrl: `${process.env.CLIENT_URL}/verify-vote`,
      timestamp: new Date().toISOString()
    };
    
    return Buffer.from(JSON.stringify(qrData)).toString('base64');
  }

  /**
   * Generate digital signature for receipt
   */
  generateDigitalSignature(voteData, voter, timestamp) {
    const signatureData = [
      voteData.candidateId,
      voter.voterId,
      timestamp.toISOString(),
      voteData.electionRound
    ].join('|');

    const signature = crypto
      .createHmac('sha256', process.env.ENCRYPTION_KEY)
      .update(signatureData)
      .digest('hex');

    return signature;
  }

  /**
   * Verify receipt authenticity
   */
  verifyReceipt(receipt) {
    try {
      // Verify verification code
      const expectedCode = this.generateVerificationCode(
        receipt.receiptId,
        receipt.voterId
      );

      if (receipt.verificationCode !== expectedCode) {
        return {
          valid: false,
          message: 'Invalid verification code. Receipt may be tampered.',
          reason: 'VERIFICATION_CODE_MISMATCH'
        };
      }

      // Verify digital signature
      const signatureData = [
        receipt.candidateId,
        receipt.voterId,
        receipt.timestamp,
        receipt.electionRound
      ].join('|');

      const expectedSignature = crypto
        .createHmac('sha256', process.env.ENCRYPTION_KEY)
        .update(signatureData)
        .digest('hex');

      if (receipt.digitalSignature !== expectedSignature) {
        return {
          valid: false,
          message: 'Invalid digital signature. Receipt may be forged.',
          reason: 'SIGNATURE_MISMATCH'
        };
      }

      return {
        valid: true,
        message: 'Receipt is authentic and verified',
        verifiedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Receipt verification failed',
        error: error.message
      };
    }
  }

  /**
   * Create audit trail entry
   */
  createAuditEntry(voteData, voter, receipt) {
    return {
      auditId: crypto.randomBytes(16).toString('hex'),
      receiptId: receipt.receiptId,
      voterId: voter._id,
      voterIdNumber: voter.voterId,
      candidateId: voteData.candidateId,
      timestamp: new Date(),
      action: 'VOTE_CAST',
      verificationCode: receipt.verificationCode,
      ipAddress: voteData.ipAddress,
      deviceId: voteData.deviceId,
      blockchainHash: voteData.blockchainHash,
      status: 'VERIFIED',
      electionRound: voteData.electionRound || '2024-GENERAL'
    };
  }

  /**
   * Generate voter confirmation slip (printable/downloadable)
   */
  generateConfirmationSlip(receipt) {
    return {
      type: 'VOTE_CONFIRMATION',
      title: 'Vote Confirmation Receipt',
      header: {
        electionName: '2024 General Election',
        electionCommission: 'Election Commission of India',
        logo: 'ECI_LOGO'
      },
      voterDetails: {
        receiptId: receipt.receiptId,
        voterId: receipt.voterId,
        voterName: receipt.voterName,
        timestamp: receipt.timestamp
      },
      voteDetails: {
        candidateName: receipt.candidateName,
        candidateParty: receipt.candidateParty,
        candidateSymbol: receipt.candidateSymbol
      },
      verification: {
        verificationCode: receipt.verificationCode,
        qrCode: receipt.qrCode,
        digitalSignature: receipt.digitalSignature.substring(0, 16) + '...'
      },
      instructions: [
        'This is your official vote confirmation receipt',
        'Keep this receipt for your records',
        'You can verify your vote using the verification code',
        'Do not share this receipt with anyone',
        'For queries, contact Election Commission helpline'
      ],
      footer: {
        message: 'Thank you for participating in the democratic process',
        helpline: '1950',
        website: 'www.eci.gov.in'
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Batch verify multiple receipts (for auditing)
   */
  batchVerifyReceipts(receipts) {
    const results = receipts.map(receipt => ({
      receiptId: receipt.receiptId,
      verification: this.verifyReceipt(receipt)
    }));

    const validCount = results.filter(r => r.verification.valid).length;
    const invalidCount = results.length - validCount;

    return {
      total: results.length,
      valid: validCount,
      invalid: invalidCount,
      validityRate: ((validCount / results.length) * 100).toFixed(2) + '%',
      results,
      auditedAt: new Date().toISOString()
    };
  }

  /**
   * Generate audit report
   */
  generateAuditReport(startDate, endDate) {
    return {
      reportId: crypto.randomBytes(16).toString('hex'),
      reportType: 'VVPAT_AUDIT',
      period: {
        startDate,
        endDate
      },
      summary: {
        totalVotes: 0,
        verifiedVotes: 0,
        pendingVerification: 0,
        discrepancies: 0
      },
      generatedAt: new Date().toISOString(),
      generatedBy: 'SYSTEM'
    };
  }
}

module.exports = new VVPATService();
