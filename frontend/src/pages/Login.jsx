import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import SocialButton from '../components/SocialButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Clean up login state when leaving login page
  useEffect(() => {
    return () => {
      // Only keep login state if redirect was successful
      if (window.location.pathname !== '/login') {
        // We've redirected successfully, keep the state
        return;
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      const user = response.user;
      
      // Determine redirect path
      const redirectPath = user?.role === 'admin' ? '/admin' 
                          : user?.role === 'teacher' ? '/teacher' 
                          : '/student';
      
      // Save login state before redirect
      localStorage.setItem('userLoggedIn', 'true');
      sessionStorage.setItem('loginTime', Date.now());
      sessionStorage.setItem('userRole', user?.role || 'student');
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // Single redirect - React Router first, then hard redirect as backup
      navigate(redirectPath);
      
      // Hard redirect as backup (after React Router has a chance)
      setTimeout(() => {
        window.location.href = window.location.origin + redirectPath;
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <main className="pt-20 min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to your Cock Syllabi account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Register here
          </Link>
        </p>
        {/* Social login */}
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <div className="w-full sm:w-auto">
              <SocialButton 
                provider="google" 
                onClick={() => {
                  window.location.href = 'http://localhost:5000/api/auth/oauth/google';
                }} 
              />
            </div>
            <div className="w-full sm:w-auto">
              <SocialButton 
                provider="apple" 
                onClick={() => {
                  window.location.href = 'http://localhost:5000/api/auth/oauth/apple';
                }} 
              />
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default Login;
