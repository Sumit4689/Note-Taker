import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  useEffect(() => {
    console.log('AuthCallbackPage mounted, checking params...');
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    console.log('Auth callback params:', { token: token?.substring(0, 10) + '...', error });
    
    if (error) {
      console.error('Google auth error:', error);
      // Use the exact error message from the backend
      navigate('/login', { state: { error: error } });
      return;
    }
    
    if (token) {
      console.log('Token found, storing in localStorage');
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Fetch user info with the token
      const fetchUser = async () => {
        try {
          console.log('Fetching user profile...');
          // Get the user profile - the cookie should be sent automatically
          const response = await fetch('http://localhost:3000/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include' // Include cookies
          });
          
          if (response.ok) {
            const userData = await response.json();
            console.log('User data fetched:', userData.name);
            setUser(userData);
            
            // Show toast message or some notification
            console.log('Successfully logged in with Google');
            
            // Redirect to dashboard
            navigate('/dashboard');
          } else {
            const errorData = await response.text();
            console.error('Profile API error:', response.status, errorData);
            throw new Error(`Failed to fetch user profile: ${response.status}`);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          navigate('/login', { state: { error: 'Failed to complete Google authentication' } });
        }
      };
      
      fetchUser();
    } else {
      console.error('No token found in URL parameters');
      // No token found, redirect to login
      navigate('/login', { state: { error: 'Missing authentication token' } });
    }
  }, [searchParams, navigate, setUser]);
  
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-white">
      <div className="mb-8">
        <svg className="w-16 h-16 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Almost there!</h2>
      <p className="text-lg text-gray-600 mb-8">We're finalizing your secure login...</p>
      
      <div className="w-full max-w-md px-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{width: '70%'}}></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
