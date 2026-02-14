import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../utils/api';
import { motion } from 'framer-motion';

const CourseDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await apiClient.get(`/courses/${id}`);
      setCourse(response.data.course);
    } catch (error) {
      console.error('Failed to fetch course', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      await apiClient.post(`/students/enroll/${id}`);
      alert('Enrolled successfully!');
      navigate('/student');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <main className="pt-20 pb-12 md:pt-32 md:pb-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading course...</p>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="pt-20 pb-12 md:pt-32 md:pb-20 text-center">
        <div className="container-main">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-600 text-lg mb-6">Course not found</p>
          <button onClick={() => navigate('/courses')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Courses
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 md:pt-24 pb-12 md:pb-20 bg-white">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/courses')}
            className="mb-6 md:mb-8 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors"
          >
            ← Back to Courses
          </button>

          <div className="grid md:grid-cols-3 gap-6 md:gap-12">
            {/* Course Image */}
            <div className="md:col-span-2 order-2 md:order-1">
              <div className="h-64 md:h-96 bg-gradient-to-br from-blue-400 to-yellow-300 rounded-xl shadow-premium overflow-hidden relative">
                {/* Free Badge */}
                {course.isFree && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg text-lg">
                    ✓ FREE COURSE
                  </div>
                )}
                {/* Approved Badge */}
                {course.approved && !course.isFree && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                    ✓ Verified
                  </div>
                )}
              </div>

              {/* Course Description */}
              <div className="mt-8 md:mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                  {course.description}
                </p>

                {/* Videos Section */}
                {course.videos && course.videos.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Course Content</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {course.videos.map((video, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <p className="font-semibold text-gray-900 text-sm md:text-base">{index + 1}. {video}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Teacher Info */}
              {course.teacherId && (
                <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Instructor</h2>
                  <div className="bg-gradient-to-br from-blue-50 to-yellow-50 p-6 md:p-8 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
                        👨‍🏫
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{course.teacherId.name}</p>
                        <p className="text-blue-600 font-semibold">Expert Instructor</p>
                      </div>
                    </div>
                    {course.teacherId.bio && (
                      <p className="text-gray-600 mt-4">{course.teacherId.bio}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Course Info & Enrollment */}
            <div className="order-1 md:order-2">
              <div className="sticky top-24 space-y-6">
                {/* Course Details Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-premium">
                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
                    {course.title}
                  </h1>

                  {/* Subject & Class */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Subject</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">{course.subject}</p>
                    </div>
                    {course.classLevel && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Class Level</p>
                        <p className="font-semibold text-gray-900 text-sm md:text-base">Class {course.classLevel}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Students Enrolled</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">{course.enrollmentCount || 0} students</p>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="mb-6">
                    {course.isFree ? (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Price</p>
                        <p className="text-4xl md:text-5xl font-bold text-green-600">FREE</p>
                        <p className="text-sm text-green-600 font-semibold mt-2">No payment required - learn for free!</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Price</p>
                        <div>
                          <span className="text-3xl md:text-4xl font-bold text-blue-600">
                            ${course.finalPrice || course.price}
                          </span>
                          {course.price !== course.finalPrice && (
                            <div className="text-xs text-gray-600 mt-2">
                              <p>Base price: ${course.price}</p>
                              <p className="text-green-600 font-semibold">+3% processing fee included</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enroll Button */}
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full py-3 md:py-4 bg-blue-600 text-white rounded-lg font-bold text-base md:text-lg hover:bg-blue-700 transition-all duration-200 shadow-premium hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Enrolling...' : course.isFree ? '✓ Enroll Free' : 'Enroll Now'}
                  </button>

                  {/* Login Prompt */}
                  {!isAuthenticated && (
                    <p className="text-xs text-gray-600 text-center mt-3">
                      Log in to your account to enroll
                    </p>
                  )}
                </div>

                {/* Zoom Consultation Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🎥</span> Zoom Consultation
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Schedule 1-on-1 video call with instructor for personalized guidance
                  </p>
                  <button className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
                    Schedule Consultation
                  </button>
                </div>

                {/* Share Card */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Share Course</h3>
                  <div className="flex gap-2 flex-wrap">
                    {['Facebook', 'Twitter', 'WhatsApp'].map((social) => (
                      <button
                        key={social}
                        className="flex-1 py-2 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {social}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default CourseDetail;
