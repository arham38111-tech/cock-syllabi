import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/api';
import { motion } from 'framer-motion';
import AdminLogin from './AdminLogin';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container-main">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            {[
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Total Teachers', value: stats.totalTeachers },
              { label: 'Total Students', value: stats.totalStudents },
              { label: 'Total Courses', value: stats.totalCourses },
              { label: 'Approved Courses', value: stats.approvedCourses },
              { label: 'Pending Courses', value: stats.pendingCourses }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-premium"
              >
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Teacher Requests', path: 'requests' },
            { label: 'Pending Courses', path: 'pending-courses' },
            { label: 'Users', path: 'users' },
            { label: 'Categories', path: 'categories' }
          ].map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="p-6 bg-white rounded-xl shadow-premium hover:shadow-lift transition-shadow text-center"
            >
              <p className="font-semibold text-gray-900">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await apiClient.get('/teachers/requests');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await apiClient.patch(`/teachers/requests/${requestId}/approve`);
      fetchRequests();
      alert('Request approved!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;

    try {
      await apiClient.patch(`/teachers/requests/${requestId}/reject`, { rejectionReason: reason });
      fetchRequests();
      alert('Request rejected!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) {
    return <div className="pt-32 text-center">Loading...</div>;
  }

  return (
    <main className="pt-24 pb-20 bg-white">
      <div className="container-main">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Teacher Requests</h2>

        {requests.length === 0 ? (
          <p className="text-gray-600">No requests</p>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{req.teacherId?.name}</h3>
                    <p className="text-sm text-gray-600">{req.teacherId?.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{req.message}</p>
                {req.status === 'pending' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(req._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

const AdminPendingCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get('/courses/admin/pending-courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      await apiClient.patch(`/courses/${courseId}/approve`);
      fetchCourses();
      alert('Course approved!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (courseId) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;

    try {
      await apiClient.patch(`/courses/${courseId}/reject`, { rejectionReason: reason });
      fetchCourses();
      alert('Course rejected!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <main className="pt-24 pb-20 bg-white">
      <div className="container-main">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Pending Courses</h2>

        {courses.length === 0 ? (
          <p className="text-gray-600">No pending courses</p>
        ) : (
          <div className="space-y-4">
            {courses.map(course => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(course._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(course._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

const AdminPortal = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const path = location.pathname.split('/')[2];

  if (!isAdmin && path !== 'login') {
    return <AdminLogin />;
  }

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/requests" element={<AdminRequests />} />
      <Route path="/pending-courses" element={<AdminPendingCourses />} />
    </Routes>
  );
};

export default AdminPortal;
