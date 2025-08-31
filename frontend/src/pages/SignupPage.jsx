import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, verifyOtp, resendOtp, googleLogin, user, loading: authLoading, serverAvailable } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Initial signup, 2: OTP verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    otp: '',
  });
  
  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);
  const [userId, setUserId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGetOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const response = await signup({
        name: formData.name,
        email: formData.email,
      });
      
      setUserId(response.userId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.otp) {
      setError('Please enter the OTP');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Verifying OTP with data:', {
        userId,
        otp: formData.otp
      });
      
      const result = await verifyOtp({
        userId,
        otp: formData.otp
      });
      
      console.log('OTP verification result:', result);
      navigate('/dashboard');
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Failed to verify OTP. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    if (!userId) {
      setError('Session expired. Please start the signup process again.');
      setStep(1);
      return;
    }
    
    try {
      setResending(true);
      setError('');
      setSuccess('');
      
      await resendOtp(userId);
      setSuccess('OTP has been resent to your email address');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center mb-6">
            <Logo />
            <span className="ml-2 text-xl font-bold text-primary">HD</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Sign up</h1>
          <p className="text-gray-600 mb-8">Sign up to enjoy the features of HD Notes</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {!serverAvailable && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-bold">Server Unavailable</p>
                  <p>The backend server at http://localhost:3000 is not running. Please start the server to use the application.</p>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex mb-4">
              <div className={`flex-1 border-b-2 pb-2 text-center font-medium ${step === 1 ? 'border-primary text-primary' : 'border-gray-300 text-gray-400'}`}>
                1. Enter Details
              </div>
              <div className={`flex-1 border-b-2 pb-2 text-center font-medium ${step === 2 ? 'border-primary text-primary' : 'border-gray-300 text-gray-400'}`}>
                2. Verify Email
              </div>
            </div>
          </div>
          
          {step === 1 ? (
            <form onSubmit={handleGetOTP}>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending code...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Verification Code
                  </span>
                )}
              </button>
              
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-medium">OR</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={googleLogin}
                    className="flex justify-center items-center w-full border border-gray-300 rounded-lg py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>
              
              <div className="text-center mt-8 border-t border-gray-100 pt-6">
                <span className="text-gray-600">Already have an account?</span>{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-blue-800 mb-2">Email Verification</h3>
                <p className="text-sm text-blue-700 mb-2">
                  We've sent a 6-digit verification code to <span className="font-semibold">{formData.email}</span>
                </p>
                <p className="text-xs text-blue-600">
                  Can't find the email? Check your spam folder or request a new code.
                </p>
              </div>
            
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Enter Verification Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    className="input-field flex-grow text-center tracking-widest text-lg font-semibold"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="flex items-center justify-center text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending new code...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Resend verification code
                    </>
                  )}
                </button>
              </div>
              
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : 'Complete Sign Up'}
              </button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-primary font-medium flex items-center justify-center mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to previous step
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Right side - Blue Wave Image */}
      <div className="hidden lg:block lg:w-1/2 bg-secondary">
        <div className="h-full w-full flex items-center justify-center p-8">
          <img 
            src="https://cdn.dribbble.com/users/702789/screenshots/16900790/media/625da3339f153578b58333bcd9256043.png"
            alt="Blue wave pattern"
            className="max-w-full max-h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
