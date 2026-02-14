import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/api';
import { motion } from 'framer-motion';
import TeacherBank from './TeacherBank';

const TeacherHome = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const coursesRes = await apiClient.get('/courses/teacher/my-courses');
      setCourses(coursesRes.data.courses || []);

      const requestRes = await apiClient.get('/teachers/my-request');
      setRequest(requestRes.data.request);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="pt-32 text-center">Loading...</div>;
  }

  return (
    <main className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container-main">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Teacher Dashboard</h1>

        {/* Request Status */}
        {request && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-6 rounded-xl"
            style={{
              backgroundColor: request.status === 'approved' ? '#dcfce7' : request.status === 'rejected' ? '#fee2e2' : '#fef3c7'
            }}
          >
            <p className="font-semibold mb-2">Teacher Request Status: {request.status.toUpperCase()}</p>
            {request.status === 'approved' && request.allocatedUsername && (
              <p className="text-sm">Your allocated account: {request.allocatedUsername}</p>
            )}
            {request.status === 'rejected' && request.rejectionReason && (
              <p className="text-sm">Reason: {request.rejectionReason}</p>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {user?.isApproved && (
            <Link
              to="create-course"
              className="p-6 bg-greenwhite rounded-xl shadow-premium hover:shadow-lift transition-shadow text-center"
            >
              <p className="font-semibold text-gray-900">Create New Course</p>
            </Link>
          )}
          {!request && (
            <Link
              to="submit-request"
              className="p-6 bg-white rounded-xl shadow-premium hover:shadow-lift transition-shadow text-center"
            >
              <p className="font-semibold text-gray-900">Submit Teacher Request</p>
            </Link>
          )}
        </div>

        {/* Courses */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses ({courses.length})</h2>
        {courses.length === 0 ? (
          <p className="text-gray-600">No courses yet</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-premium"
              >
                <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">${course.finalPrice}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  course.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {course.approved ? 'Approved' : 'Pending'}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    classLevel: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/courses', {
        ...formData,
        price: parseFloat(formData.price)
      });
      alert('Course created successfully!');
      navigate('/teacher');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 pb-20 bg-white">
      <div className="container-main max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Create New Course</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600"
            ></textarea>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class Level</label>
              <input
                type="text"
                name="classLevel"
                value={formData.classLevel}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-600">$</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            {formData.price && (
              <p className="text-sm text-gray-600 mt-2">
                Final price: ${(parseFloat(formData.price) * 1.03).toFixed(2)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>
    </main>
  );
};

const SubmitRequest = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/teachers/request', { message });
      alert('Request submitted successfully!');
      navigate('/teacher');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 pb-20 bg-white">
      <div className="container-main max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Submit Teacher Request</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Why do you want to teach?</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-600"
              placeholder="Tell us about your teaching experience and qualifications..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </main>
  );
};

const TeacherDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<TeacherHome />} />
      <Route path="/create-course" element={<CreateCourse />} />
      <Route path="/submit-request" element={<SubmitRequest />} />
      <Route path="/bank-account" element={<TeacherBank />} />
    </Routes>
  );
};

export default TeacherDashboard;
