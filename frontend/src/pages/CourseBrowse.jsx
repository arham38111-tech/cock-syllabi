import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';

const CourseBrowse = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    search: ''
  });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/courses', { params: filters });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  const subjects = [
    'All',
    'Mathematics',
    'English',
    'Science',
    'History',
    'Computer Science',
    'Languages',
    'Arts',
    'Physical Education',
    'Business Studies',
    'Social Studies'
  ];

  return (
    <main className="pt-20 md:pt-24 pb-12 md:pb-20 bg-white">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
            Explore Our Courses
          </h1>
          <p className="text-gray-600 text-sm md:text-lg">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-8 md:mb-12 space-y-4">
          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="🔍 Search courses by title or description..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-4 md:px-6 py-3 md:py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-sm md:text-base"
            />
          </div>

          {/* Subject Filter */}
          <div className="overflow-x-auto pb-2 -mx-5 md:mx-0 px-5 md:px-0">
            <div className="flex gap-2 min-w-min md:min-w-0 md:flex-wrap">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setFilters(prev => ({ ...prev, subject: subject === 'All' ? '' : subject }))}
                  className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all text-sm ${
                    (filters.subject === '' && subject === 'All') || filters.subject === subject
                      ? 'bg-blue-600 text-white shadow-premium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm md:text-base">Loading courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-600 text-base md:text-lg mb-2">No courses found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter options</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-premium transition-all duration-300 flex flex-col cursor-pointer"
                onClick={() => navigate(`/course/${course._id}`)}
              >
                {/* Course Image */}
                <div className="relative h-40 md:h-48 bg-gradient-to-br from-blue-400 to-yellow-300 overflow-hidden">
                  {/* Free Badge */}
                  {course.isFree && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg">
                      FREE
                    </div>
                  )}
                  {/* Approved Badge */}
                  {course.approved && !course.isFree && (
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ✓ Verified
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  {/* Subject & Class */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs md:text-sm text-blue-600 font-semibold">
                        {course.subject}
                      </p>
                      {course.classLevel && (
                        <p className="text-xs text-gray-500">Class {course.classLevel}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {course.enrollmentCount && (
                        <p className="text-xs text-gray-500">{course.enrollmentCount} enrolled</p>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                    {course.description}
                  </p>

                  {/* Price and Button */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div>
                      {course.isFree ? (
                        <span className="text-xl md:text-2xl font-bold text-green-600">FREE</span>
                      ) : (
                        <div>
                          <span className="text-lg md:text-xl font-bold text-blue-600">
                            ${course.finalPrice || course.price}
                          </span>
                          {course.price !== course.finalPrice && (
                            <p className="text-xs text-gray-500">+3% fee included</p>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course._id}`);
                      }}
                      className="px-4 md:px-5 py-2 md:py-3 bg-blue-600 text-white text-sm md:text-base rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-premium hover:shadow-lift"
                    >
                      View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default CourseBrowse;
