import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  Vote, 
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { useMaharashtraAuth } from '../../../contexts/MaharashtraAuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    constituency: '',
    voterId: '',
    aadhaarNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [constituencies, setConstituencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingConstituencies, setLoadingConstituencies] = useState(true);

  const { register, getConstituencies } = useMaharashtraAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConstituencies();
  }, []);

  const fetchConstituencies = async () => {
    try {
      const response = await getConstituencies();
      if (response.success) {
        setConstituencies(response.data.constituencies);
      }
    } catch (error) {
      toast.error('Failed to load constituencies');
    } finally {
      setLoadingConstituencies(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (!/^VOTER\d{6}$/.test(formData.voterId)) {
      toast.error('Voter ID must be in format VOTER000001');
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
      toast.error('Aadhaar number must be exactly 12 digits');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await register(registrationData);
      
      if (response.success) {
        toast.success('Registration successful! Please verify your OTP.');
        navigate('/verify-otp', { 
          state: { 
            email: formData.email,
            phone: formData.phone,
            registrationData 
          }
        });
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-saffron to-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Register to Vote
          </h2>
          <p className="text-gray-200">
            Join Maharashtra's digital democracy
          </p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="name" className="form-label required">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label required">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label required">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Enter 10-digit phone number"
                    pattern="[6-9][0-9]{9}"
                    required
                  />
                </div>
                <p className="form-help">
                  Used for OTP verification
                </p>
              </div>

              {/* Voter ID */}
              <div className="form-group">
                <label htmlFor="voterId" className="form-label required">
                  Voter ID
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="text"
                    id="voterId"
                    name="voterId"
                    value={formData.voterId}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="VOTER000001"
                    pattern="VOTER\d{6}"
                    required
                  />
                </div>
                <p className="form-help">
                  Format: VOTER followed by 6 digits
                </p>
              </div>

              {/* Aadhaar Number */}
              <div className="form-group">
                <label htmlFor="aadhaarNumber" className="form-label">
                  Aadhaar Number (Optional)
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="text"
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="123456789012"
                    pattern="\d{12}"
                    maxLength="12"
                  />
                </div>
                <p className="form-help">
                  12-digit Aadhaar number (optional for registration)
                </p>
              </div>
            </div>

            {/* Constituency */}
            <div className="form-group">
              <label htmlFor="constituency" className="form-label required">
                Constituency
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
                <select
                  id="constituency"
                  name="constituency"
                  value={formData.constituency}
                  onChange={handleChange}
                  className="form-input form-select pl-10"
                  required
                  disabled={loadingConstituencies}
                >
                  <option value="">
                    {loadingConstituencies ? 'Loading constituencies...' : 'Select your constituency'}
                  </option>
                  {constituencies.map((constituency) => (
                    <option key={constituency} value={constituency}>
                      {constituency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label required">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pl-10 pr-10"
                    placeholder="Create password"
                    minLength="6"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label required">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input pl-10 pr-10"
                    placeholder="Confirm password"
                    minLength="6"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-tertiary/10 border border-tertiary/20 rounded-lg p-4">
              <p className="text-sm text-secondary">
                By registering, you agree to the terms and conditions of the Maharashtra E-Voting System. 
                Your information will be used solely for election purposes and will be kept secure.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || loadingConstituencies}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-secondary"></div>
            <span className="px-4 text-tertiary text-sm">or</span>
            <div className="flex-1 border-t border-secondary"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-navy hover:text-navy-light font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
