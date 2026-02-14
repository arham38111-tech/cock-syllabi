import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../utils/api';

const VideoCallModal = ({ onSelectUser, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      // Fallback mock data
      setUsers([
        { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'teacher' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'student' },
        { _id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'teacher' },
        { _id: '4', name: 'Sarah Williams', email: 'sarah@example.com', role: 'student' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Start Video Call</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* User List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No users found</p>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => onSelectUser(user)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                
                {/* User info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role || 'user'}</p>
                </div>

                {/* Call icon */}
                <div className="text-blue-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoCallModal;
