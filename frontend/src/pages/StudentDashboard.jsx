import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import VideoCall from '../components/VideoCall';
import VideoCallModal from '../components/VideoCallModal';

const StudentHome = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [activeVideoCall, setActiveVideoCall] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const coursesRes = await apiClient.get('/students/my-courses');
      setCourses(coursesRes.data.courses || []);

      const statsRes = await apiClient.get('/students/stats');
      setStats(statsRes.data.stats);
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
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-4 gap-8 mb-12"
          >
            {[
              { label: 'Courses Enrolled', value: stats.totalCourses },
              { label: 'Completed', value: stats.completedCourses },
              { label: 'Progress', value: stats.enrollmentRate + '%' },
              { label: 'Total Spent', value: '$' + stats.totalSpent?.toFixed(2) }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-premium"
              >
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Link
            to="/courses"
            className="p-6 bg-blue-600 text-white rounded-xl shadow-premium hover:shadow-lift transition-shadow text-center"
          >
            <p className="font-semibold">Browse More Courses</p>
          </Link>
          <Link
            to="schedule"
            className="p-6 bg-green-600 text-white rounded-xl shadow-premium hover:shadow-lift transition-shadow text-center"
          >
            <p className="font-semibold">My Schedule</p>
          </Link>
          <button
            onClick={() => setShowVideoCallModal(true)}
            className="p-6 bg-purple-600 text-white rounded-xl shadow-premium hover:shadow-lift transition-shadow text-center"
          >
            <p className="font-semibold">Start Video Call</p>
          </button>
        </div>

        {/* My Courses */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses ({courses.length})</h2>
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet</p>
            <Link
              to="/courses"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Learning
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(progress => (
              <motion.div
                key={progress._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-premium"
              >
                <h3 className="font-bold text-gray-900 mb-4 line-clamp-2">
                  {progress.courseId?.title}
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-semibold text-gray-900">{progress.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-blue-600 font-semibold mb-4">
                  ${progress.courseId?.finalPrice}
                </p>
                {progress.completed && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Completed
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      <AnimatePresence>
        {showVideoCallModal && (
          <VideoCallModal
            onSelectUser={(user) => {
              setActiveVideoCall(user);
              setShowVideoCallModal(false);
            }}
            onClose={() => setShowVideoCallModal(false)}
          />
        )}

        {activeVideoCall && (
          <VideoCall
            selectedUser={activeVideoCall}
            onClose={() => setActiveVideoCall(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

const StudentSchedule = () => {
  const [schedule, setSchedule] = useState(null);
  const [subjects, setSubjects] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await apiClient.get('/students/schedule');
      setSchedule(response.data.schedule);
    } catch (error) {
      console.log('No schedule found');
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    const subjectList = subjects.split(',').map(s => s.trim()).filter(s => s);
    if (subjectList.length === 0) {
      alert('Please enter at least one subject');
      return;
    }

    setGenerating(true);
    try {
      const response = await apiClient.post('/students/schedule/generate', {
        subjects: subjectList
      });
      setSchedule(response.data.schedule);
      alert('Schedule generated!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <main className="pt-24 pb-20 bg-white">
      <div className="container-main">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Weekly Schedule</h2>

        <div className="mb-12 max-w-2xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter subjects (comma separated)
          </label>
          <input
            type="text"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            placeholder="e.g., Mathematics, English, Science"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:border-blue-600"
          />
          <button
            onClick={generateSchedule}
            disabled={generating}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Schedule'}
          </button>
        </div>

        {schedule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 p-8 rounded-xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Timetable</h3>
            <div className="space-y-4">
              {schedule.scheduleData?.map((slot, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{slot.subject}</p>
                    <p className="text-sm text-gray-600">
                      {slot.day} - {slot.timeSlot} ({slot.duration} mins)
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {slot.day}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
};

const StudentDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentHome />} />
      <Route path="/schedule" element={<StudentSchedule />} />
    </Routes>
  );
};

export default StudentDashboard;
