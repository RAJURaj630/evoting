const crypto = require('crypto');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');

class OTPService {
  constructor() {
    // Email transporter setup
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    console.log('✅ OTP Service initialized (Email only)');
  }

  // Generate OTP using speakeasy
  generateOTP(secret = null) {
    if (!secret) {
      secret = speakeasy.generateSecret({
        name: 'Maharashtra E-Voting',
        length: 32
      }).base32;
    }

    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      time: Math.floor(Date.now() / 1000),
      step: 300, // 5 minutes validity
      window: 1
    });

    return { token, secret };
  }

  // Verify OTP
  verifyOTP(token, secret) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      time: Math.floor(Date.now() / 1000),
      step: 300, // 5 minutes validity
      window: 2 // Allow 2 time steps tolerance
    });
  }

  // Send OTP via Email
  async sendEmailOTP(email, otp, voterName) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Maharashtra E-Voting - OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF9933, #FFFFFF, #138808); padding: 20px; text-align: center;">
            <h1 style="color: #000080; margin: 0;">Maharashtra E-Voting System</h1>
            <p style="color: #000080; margin: 5px 0;">Legislative Assembly Elections 2024</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">OTP Verification Required</h2>
            <p>Dear ${voterName},</p>
            <p>Your One-Time Password (OTP) for voter verification is:</p>
            
            <div style="background-color: #000080; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0; border-radius: 8px;">
              ${otp}
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This OTP is valid for 5 minutes only</li>
              <li>Do not share this OTP with anyone</li>
              <li>Use this OTP to complete your voter verification</li>
            </ul>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated message from the Maharashtra E-Voting System. 
              If you did not request this OTP, please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #000080; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0; font-size: 12px;">
              © 2024 Maharashtra E-Voting System | Secure • Transparent • Democratic
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
      return { success: true, message: 'OTP sent successfully to email' };
    } catch (error) {
      console.error('Email OTP Error:', error);
      return { success: false, message: 'Failed to send email OTP' };
    }
  }

  // Send OTP via SMS (Simulated - Console Log)
  async sendSMSOTP(phone, otp, voterName) {
    // Simulate SMS for demo purposes
    console.log(`SMS OTP for ${phone}: ${otp} (Valid for 10 minutes)`);
    console.log(`   Message: Your Maharashtra E-Voting OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`);
    
    return {
      success: true,
      message: 'SMS OTP sent successfully (simulated - check console)',
      method: 'sms'
    };
  }

  async generateAndSendOTP(email, phone, voterName, method = 'email') {
    const { token, secret } = this.generateOTP();
    
    // DEVELOPMENT MODE - Always log OTP to console
    console.log('\n🔐 =============== OTP GENERATED ===============');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${voterName}`);
    console.log(`🔑 OTP CODE: ${token}`);
    console.log(`⏰ Valid for: 10 minutes`);
    console.log('===============================================\n');
    
    let result;
    if (method === 'email') {
      result = await this.sendEmailOTP(email, token, voterName);
    } else if (method === 'sms') {
      result = await this.sendSMSOTP(phone, token, voterName);
    } else {
      return { success: false, message: 'Invalid OTP method' };
    }

    // DEVELOPMENT MODE - Always return success for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 DEVELOPMENT MODE: OTP verification bypassed for testing');
      return { 
        success: true, 
        secret: secret, 
        message: 'OTP generated successfully (Development Mode - Check Console)',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      };
    }

    if (result.success) {
      return { 
        success: true, 
        secret: secret, 
        message: result.message,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      };
    } else {
      return { success: false, message: result.message };
    }
  }

  // Resend OTP with rate limiting
  async resendOTP(email, phone, voterName, method = 'email', lastSentTime) {
    const now = new Date();
    const timeDiff = now - new Date(lastSentTime);
    const minInterval = 60 * 1000; // 1 minute minimum interval

    if (timeDiff < minInterval) {
      const remainingTime = Math.ceil((minInterval - timeDiff) / 1000);
      return { 
        success: false, 
        message: `Please wait ${remainingTime} seconds before requesting another OTP` 
      };
    }

    return await this.generateAndSendOTP(email, phone, voterName, method);
  }
}

module.exports = new OTPService();
