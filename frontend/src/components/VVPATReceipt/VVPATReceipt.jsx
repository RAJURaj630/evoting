import React, { useRef } from 'react'
import './VVPATReceipt.css'

const VVPATReceipt = ({ receipt, onClose }) => {
  const receiptRef = useRef()

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In production, generate actual PDF
    const receiptText = `
E-VOTING SYSTEM - VVPAT RECEIPT
================================

Receipt ID: ${receipt.receiptId}
Verification Code: ${receipt.verificationCode}

Candidate: ${receipt.candidateName}
Party: ${receipt.candidateParty}

Timestamp: ${new Date(receipt.timestamp).toLocaleString()}

Digital Signature: ${receipt.digitalSignature}

This receipt confirms your vote was recorded.
Keep this for verification purposes.
    `
    
    const blob = new Blob([receiptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `VVPAT-Receipt-${receipt.receiptId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="vvpat-overlay">
      <div className="vvpat-modal" ref={receiptRef}>
        <div className="vvpat-header">
          <h2>🎫 VVPAT Receipt</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="vvpat-content">
          <div className="receipt-paper">
            <div className="receipt-header">
              <div className="receipt-logo">🗳️</div>
              <h3>E-VOTING SYSTEM</h3>
              <p className="receipt-subtitle">Voter Verifiable Paper Audit Trail</p>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-section">
              <div className="receipt-field">
                <label>Receipt ID:</label>
                <span className="receipt-value">{receipt.receiptId}</span>
              </div>
              <div className="receipt-field">
                <label>Verification Code:</label>
                <span className="receipt-value verification-code">{receipt.verificationCode}</span>
              </div>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-section vote-details">
              <h4>Vote Cast For:</h4>
              <div className="candidate-info">
                <div className="candidate-name">{receipt.candidateName}</div>
                <div className="candidate-party">{receipt.candidateParty}</div>
              </div>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-section">
              <div className="receipt-field">
                <label>Timestamp:</label>
                <span className="receipt-value">
                  {new Date(receipt.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {receipt.qrCode && (
              <div className="receipt-section qr-section">
                <div className="qr-code-placeholder">
                  <div className="qr-icon">📱</div>
                  <p>QR Code</p>
                  <small>Scan to verify</small>
                </div>
              </div>
            )}

            <div className="receipt-divider"></div>

            <div className="receipt-footer">
              <div className="digital-signature">
                <label>Digital Signature:</label>
                <span className="signature-hash">{receipt.digitalSignature?.substring(0, 32)}...</span>
              </div>
              <div className="receipt-notice">
                <p>✅ Your vote has been recorded securely</p>
                <p>🔒 This receipt is cryptographically signed</p>
                <p>⚠️ Keep this receipt for verification</p>
              </div>
            </div>
          </div>
        </div>

        <div className="vvpat-actions">
          <button className="btn btn-secondary" onClick={handlePrint}>
            🖨️ Print Receipt
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            💾 Download Receipt
          </button>
          <button className="btn btn-success" onClick={onClose}>
            ✓ Done
          </button>
        </div>

        <div className="vvpat-info">
          <p>
            <strong>Note:</strong> You can verify your vote later using the Receipt ID and Verification Code.
            This receipt does not reveal your vote to others, maintaining ballot secrecy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default VVPATReceipt
