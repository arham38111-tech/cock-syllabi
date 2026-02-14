import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';
import { motion } from 'framer-motion';

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

export default AdminPendingCourses;
