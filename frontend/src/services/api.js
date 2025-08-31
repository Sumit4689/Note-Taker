import axios from 'axios';

const API_URL = 'https://note-taker-backend-km6o.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Helper function to get cookie by name
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  const cookieValue = match ? match[2] : '';
  return cookieValue;
};

// Add a request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    // Check localStorage first, then cookies
    const localToken = localStorage.getItem('token');
    const cookieToken = getCookie('jwt');
    
    const token = localToken || cookieToken;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // If token exists in cookie but not in localStorage, sync it
      if (cookieToken && !localToken) {
        localStorage.setItem('token', cookieToken);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  signup: async (userData) => {
    try {
      const response = await api.post('/users/signup', userData);
      return response.data;
    } catch (error) {
      // Handle network errors gracefully
      if (error.message === 'Network Error') {
        console.warn('Server connection failed during signup');
        throw new Error('Server unavailable. Please check if the backend server is running.');
      }
      throw error;
    }
  },
  
  verifyOtp: async (verificationData) => {
    try {
      const response = await api.post('/users/verify-otp', verificationData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        console.warn('Server connection failed during OTP verification');
        throw new Error('Server unavailable. Please check if the backend server is running.');
      }
      throw error;
    }
  },
  
  resendOtp: async (userData) => {
    try {
      const response = await api.post('/users/resend-otp', userData);
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        console.warn('Server connection failed during OTP resend');
        throw new Error('Server unavailable. Please check if the backend server is running.');
      }
      throw error;
    }
  },
  
  login: async (email) => {
    try {
      const response = await api.post('/users/login', { email });
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        console.warn('Server connection failed during login');
        throw new Error('Server unavailable. Please check if the backend server is running.');
      }
      throw error;
    }
  },
  
  verifyLoginOtp: async (verificationData) => {
    try {
      const response = await api.post('/users/verify-login-otp', verificationData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        console.warn('Server connection failed during login OTP verification');
        throw new Error('Server unavailable. Please check if the backend server is running.');
      }
      throw error;
    }
  },
  
  googleAuth: () => {
    // Open the Google auth URL in the same window
    window.location.href = `${API_URL}/users/google`;
  },
  
  logout: async () => {
    try {
      // Call the backend logout endpoint to clear the cookie
      await api.post('/users/logout');
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Clear the JWT cookie from browser
      document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      
      // Still remove from localStorage and clear cookie even if API call fails
      localStorage.removeItem('token');
      document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      return { success: false, error };
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        console.warn('Server connection failed while fetching profile');
        throw new Error('Server unavailable. Please check if the backend server is running.');
      }
      throw error;
    }
  },
};

// Note services
export const noteService = {
  getAllNotes: async () => {
    const response = await api.get('/notes');
    return response.data;
  },
  
  createNote: async (noteData) => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },
  
  getNote: async (noteId) => {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  },
  
  updateNote: async (noteId, noteData) => {
    const response = await api.put(`/notes/${noteId}`, noteData);
    return response.data;
  },
  
  deleteNote: async (noteId) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  },
};

export default api;
