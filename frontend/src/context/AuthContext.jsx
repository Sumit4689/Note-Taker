import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverAvailable, setServerAvailable] = useState(true);
  
  // Function to get cookie by name
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    const cookieValue = match ? match[2] : '';
    return cookieValue;
  };
  
  // Function to check if user is logged in
  const checkUserLoggedIn = async () => {
    try {
      // Check if we have a token in localStorage or cookies
      const localToken = localStorage.getItem('token');
      const cookieToken = getCookie('jwt');
      const token = localToken || cookieToken;
      
      // Only try to get profile if we have a token
      if (token) {
        try {
          // If token was found in cookie but not in localStorage, sync it
          if (cookieToken && !localToken) {
            localStorage.setItem('token', cookieToken);
          }
          
          const userData = await authService.getProfile();
          setUser(userData);
          setServerAvailable(true); // Server is available if we get a valid response
        } catch (err) {
          console.error('Error fetching user profile:', err);
          
          // Check if it's a network error (server down)
          if (err.message === 'Network Error') {
            setServerAvailable(false);
            console.warn('Backend server is not available at http://localhost:3000. Please start the server.');
          }
          
          // Don't remove token on network errors - server might be temporarily down
          if (err.message !== 'Network Error') {
            localStorage.removeItem('token');
          }
        }
      }
    } catch (err) {
      console.error('Error in auth check:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial auth check on app load
  useEffect(() => {
    checkUserLoggedIn();
  }, []);
  
  // Monitor token changes in cookies
  useEffect(() => {
    // Perform an immediate check in case there's a cookie present on page load
    setTimeout(() => {
      const cookieToken = getCookie('jwt');
      if (cookieToken) {
        checkUserLoggedIn();
      }
    }, 500); // Short delay to ensure cookies are available
    
    const tokenCheckInterval = setInterval(() => {
      const localToken = localStorage.getItem('token');
      const cookieToken = getCookie('jwt');
      
      // If token exists in cookie but not in localStorage, sync it and check login
      if (cookieToken) {
        if (!localToken) {
          localStorage.setItem('token', cookieToken);
        }
        checkUserLoggedIn();
      }
    }, 2000); // Check more frequently (every 2 seconds)
    
    return () => clearInterval(tokenCheckInterval);
  }, []);

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await authService.signup(userData);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during signup');
      throw err;
    }
  };

  const verifyOtp = async (verificationData) => {
    try {
      setError(null);
      const userData = await authService.verifyOtp(verificationData);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during OTP verification');
      throw err;
    }
  };

  const login = async (email) => {
    try {
      setError(null);
      const response = await authService.login(email);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    }
  };
  
  const verifyLoginOtp = async (verificationData) => {
    try {
      setError(null);
      const userData = await authService.verifyLoginOtp(verificationData);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login OTP verification');
      throw err;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const googleLogin = () => {
    authService.googleAuth();
  };

  const resendOtp = async (userId) => {
    try {
      setError(null);
      const response = await authService.resendOtp({ userId });
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during OTP resend');
      throw err;
    }
  };

  const value = {
    user,
    setUser,
    loading,
    error,
    serverAvailable,
    signup,
    verifyOtp,
    resendOtp,
    login,
    verifyLoginOtp,
    logout,
    googleLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
