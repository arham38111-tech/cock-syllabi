import React, { useState } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../utils/api';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    pictureUrl: '',
    documentUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [useDemo, setUseDemo] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('Registering user:', formData, 'Demo Mode:', useDemo);
      
      if (useDemo) {
        // Demo mode - store in localStorage
        const userData = {
          id: `user_${Date.now()}`,
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          role: formData.role,
          pictureUrl: formData.role === 'teacher' ? formData.pictureUrl : '',
          documentUrl: formData.role === 'teacher' ? formData.documentUrl : '',
          createdAt: new Date().toISOString()
        };

        // Get existing users from localStorage
        const existingUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
        
        // Check if email already exists
        if (existingUsers.some(u => u.email === userData.email)) {
          setError('Email already registered (demo mode)');
          setLoading(false);
          return;
        }

        // Add new user
        existingUsers.push(userData);
        localStorage.setItem('demo_users', JSON.stringify(existingUsers));

        console.log('Demo user registered:', userData);
        setSuccess(`✓ ${formData.name} registered as ${formData.role} successfully! (Demo Mode)`);
        setUseDemo(false);
      } else {
        // Real API mode
        const response = await apiClient.post('/auth/register', {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
          pictureUrl: formData.role === 'teacher' ? formData.pictureUrl : undefined,
          documentUrl: formData.role === 'teacher' ? formData.documentUrl : undefined
        });

        console.log('Registration response:', response.data);
        setSuccess(`✓ ${formData.name} registered as ${formData.role} successfully!`);
      }

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        pictureUrl: '',
        documentUrl: ''
      });

      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Registration error:', err);
      
      // Provide detailed error message
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      
      // If it's a database connection error, offer demo mode
      if (errorMsg.includes('connect ECONNREFUSED') || errorMsg.includes('MongoDB') || !err.response) {
        setError(`Backend Not Available: ${errorMsg}. You can use Demo Mode to test the form.`);
        setUseDemo(true);
      } else if (err.request && !err.response) {
        setError('Network Error: Cannot reach the server. Make sure the backend is running on http://localhost:5000');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-premium"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New User</h1>
          <p className="text-gray-600 mb-8">Register students, teachers, or other users directly from the admin panel</p>

          {/* Debug Info */}
          <div className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-900 font-mono">
            <div>Backend: http://localhost:5000</div>
            <div>Endpoint: POST /api/auth/register</div>
            <div>Demo Mode Available: Yes</div>
            <div>Demo Storage: Browser localStorage</div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
              {useDemo && (
                <div className="mt-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setUseDemo(true);
                      setError('');
                    }}
                    className="inline-block mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 font-semibold"
                  >
                    ✓ Use Demo Mode Instead
                  </button>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="user@example.com"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Select the role for this user</p>
            </div>

            {/* Picture URL - Only for Teachers */}
            {formData.role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Picture URL</label>
                <input
                  type="url"
                  name="pictureUrl"
                  value={formData.pictureUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Add a profile picture URL (optional)</p>
              </div>
            )}

            {/* Document URL - Only for Teachers */}
            {formData.role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document/Certificate URL</label>
                <input
                  type="url"
                  name="documentUrl"
                  value={formData.documentUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="https://example.com/certificate.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">Add a qualification document/certificate URL (optional)</p>
              </div>
            )}

            {/* Password */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : `Register User${useDemo ? ' (Demo Mode)' : ''}`}
              </button>
              <button
                type="reset"
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'student'
                  });
                  setError('');
                  setSuccess('');
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Info box */}
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">ℹ️ No approval needed:</span> Users registered here are immediately activated and can login with their credentials.
              </p>
            </div>

            {useDemo && (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <span className="font-semibold">⚠️ Demo Mode Active:</span> Users are stored in browser localStorage (demo only). No database connection needed for testing.
                </p>
              </div>
            )}

            {/* Status Info */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-700 font-mono">
                <span className="font-semibold">Backend Status:</span> 
                <br />✓ Frontend API Client: http://localhost:5000/api
                <br />✓ Route: POST /auth/register
                <br />ℹ️ If registration fails, a Demo Mode option will appear automatically.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default AdminRegister;
