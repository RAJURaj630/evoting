import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, RefreshCw, ArrowRight, Mail, Phone } from 'lucide-react';
import { useMaharashtraAuth } from '../../../contexts/MaharashtraAuthContext';
import toast from 'react-hot-toast';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { verifyOTP, resendOTP } = useMaharashtraAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { email, phone, registrationData, message } = location.state || {};

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOTP({
        email,
        otp: otpString
      });
      
      if (response.success) {
        toast.success('OTP verified successfully!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Invalid OTP');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (error) {
      toast.error('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const response = await resendOTP({ email });
      
      if (response.success) {
        toast.success('OTP sent successfully!');
        setCountdown(60);
        setCanResend(false);
        
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('An error occurred while resending OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-saffron to-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Verify Your Identity
          </h2>
          <p className="text-gray-200">
            Enter the 6-digit OTP sent to your registered contact
          </p>
        </div>

        {/* OTP Form */}
        <div className="card">
          {/* Contact Info */}
          <div className="mb-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Mail className="w-5 h-5 text-primary-saffron" />
              <span className="text-sm text-secondary">
                {email}
              </span>
            </div>
            {phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-green" />
                <span className="text-sm text-secondary">
                  {phone.replace(/(\d{2})(\d{4})(\d{4})/, '+91 $1****$3')}
                </span>
              </div>
            )}
          </div>

          {message && (
            <div className="mb-6 p-4 bg-primary-saffron/10 border border-primary-saffron/20 rounded-lg">
              <p className="text-sm text-secondary">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="form-group">
              <label className="form-label text-center block mb-4">
                Enter 6-Digit OTP
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-secondary rounded-lg focus:border-primary-navy focus:outline-none transition-colors"
                    maxLength="1"
                    pattern="\d"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-secondary text-sm mb-3">
              Didn't receive the OTP?
            </p>
            
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="btn btn-ghost flex items-center space-x-2 mx-auto"
              >
                {resendLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend OTP</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-tertiary">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">
                  Resend available in {formatTime(countdown)}
                </span>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-tertiary/10 border border-tertiary/20 rounded-lg">
            <h4 className="font-medium text-primary mb-2">Having trouble?</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Check your email inbox and spam folder</li>
              <li>• Ensure you have network connectivity</li>
              <li>• OTP is valid for 10 minutes only</li>
              <li>• Contact support if issues persist</li>
            </ul>
          </div>
        </div>

        {/* Back to Registration */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-gray-200 hover:text-white text-sm transition-colors"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
