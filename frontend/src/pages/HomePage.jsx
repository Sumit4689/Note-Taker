import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, loading, serverAvailable } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Logo size={32} />
            <h1 className="ml-2 text-xl font-bold">HD Notes</h1>
          </div>
          <div className="space-x-4">
            <Link to="/login" className="text-primary hover:underline">
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>
      
      {!serverAvailable && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 max-w-7xl mx-auto mt-4" role="alert">
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

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to HD Notes</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            A simple, secure note-taking application to keep your thoughts organized.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="bg-primary text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-primary text-primary px-6 py-3 rounded-lg text-lg hover:bg-blue-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
          
          {!serverAvailable && (
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-yellow-800">Developer Instructions</h3>
              <ol className="list-decimal text-left pl-5 text-yellow-700 mt-2 space-y-2">
                <li>Open a terminal in the project's backend directory</li>
                <li>Run <code className="bg-yellow-100 px-2 py-1 rounded">cd s:/note-taker/backend</code></li>
                <li>Run <code className="bg-yellow-100 px-2 py-1 rounded">npm run dev</code></li>
                <li>Wait for the server to start, then refresh this page</li>
              </ol>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
