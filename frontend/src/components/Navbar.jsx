import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleAdminLogin = () => {
    navigate('/admin-login');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-premium z-50">
      <div className="container-main flex justify-between items-center h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">CS</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline">Cock Syllabi</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
            Home
          </Link>
          <Link to="/courses" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
            Courses
          </Link>
          <Link to="/books" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
            Books
          </Link>
          <a href="#subjects" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
            Subjects
          </a>
          <a href="#classes" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
            Classes
          </a>
          <a href="#teachers" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
            Teachers
          </a>
        </div>

        {/* Auth Section */}
        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-block px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Register
              </Link>
              <button
                onClick={handleAdminLogin}
                className="hidden sm:inline-block px-3 py-2 text-xs text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Admin
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline-block text-sm font-medium text-gray-700">
                {user?.name}
              </span>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                >
                  Admin Panel
                </Link>
              )}
              {user?.role === 'teacher' && (
                <Link
                  to="/teacher"
                  className="hidden sm:inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                >
                  Teacher Portal
                </Link>
              )}
              {user?.role === 'student' && (
                <Link
                  to="/student"
                  className="hidden sm:inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                >
                  My Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="hidden sm:inline-block px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-t"
        >
          <div className="container-main py-4 space-y-3">
            <Link to="/" className="block text-gray-700 hover:text-blue-600 py-2">
              Home
            </Link>
            <Link to="/courses" className="block text-gray-700 hover:text-blue-600 py-2">
              Courses
            </Link>
            <Link to="/books" className="block text-gray-700 hover:text-blue-600 py-2">
              Books
            </Link>
            <a href="#subjects" className="block text-gray-700 hover:text-blue-600 py-2">
              Subjects
            </a>
            <a href="#classes" className="block text-gray-700 hover:text-blue-600 py-2">
              Classes
            </a>
            <a href="#teachers" className="block text-gray-700 hover:text-blue-600 py-2">
              Teachers
            </a>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-blue-600 py-2">
                  Login
                </Link>
                <Link to="/register" className="block text-gray-700 hover:text-blue-600 py-2">
                  Register
                </Link>
                <button
                  onClick={handleAdminLogin}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 py-2"
                >
                  Admin Login
                </button>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Link to="/admin" className="block text-red-600 py-2 font-medium">
                    Admin Panel
                  </Link>
                )}
                {user?.role === 'teacher' && (
                  <Link to="/teacher" className="block text-green-600 py-2 font-medium">
                    Teacher Portal
                  </Link>
                )}
                {user?.role === 'student' && (
                  <Link to="/student" className="block text-blue-600 py-2 font-medium">
                    My Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-gray-700 hover:text-gray-800 py-2"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
