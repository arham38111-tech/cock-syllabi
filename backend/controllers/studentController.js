const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const Schedule = require('../models/Schedule');
const User = require('../models/User');

// Enroll student in course (Purchase course)
const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.approved) {
      return res.status(400).json({ message: 'This course is not available' });
    }

    // Check if already enrolled
    const alreadyEnrolled = await CourseProgress.findOne({
      studentId,
      courseId
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Create progress record
    const progress = new CourseProgress({
      studentId,
      courseId,
      progressPercentage: 0
    });

    await progress.save();

    // Update course enrollment count
    course.studentsEnrolled.push(studentId);
    course.enrollmentCount = course.studentsEnrolled.length;
    await course.save();

    res.status(200).json({
      message: 'Course enrolled successfully',
      progress
    });
  } catch (error) {
    console.error('Enroll course error:', error.message);
    res.status(500).json({ message: 'Failed to enroll course', error: error.message });
  }
};

// Get student's courses
const getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const courses = await CourseProgress.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title description subject class price finalPrice'
      })
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      courses
    });
  } catch (error) {
    console.error('Get student courses error:', error.message);
    res.status(500).json({ message: 'Failed to fetch your courses', error: error.message });
  }
};

// Get course progress
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const progress = await CourseProgress.findOne({
      studentId,
      courseId
    }).populate('courseId');

    if (!progress) {
      return res.status(404).json({ message: 'Course not found in your library' });
    }

    res.status(200).json({
      progress
    });
  } catch (error) {
    console.error('Get progress error:', error.message);
    res.status(500).json({ message: 'Failed to fetch progress', error: error.message });
  }
};

// Update video as watched
const markVideoWatched = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { videoId, videoDuration } = req.body;
    const studentId = req.user.id;

    const progress = await CourseProgress.findOne({
      studentId,
      courseId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Course not found in your library' });
    }

    // Check if video already watched
    const watched = progress.videosWatched.find(v => v.videoId === videoId);
    if (!watched) {
      progress.videosWatched.push({
        videoId,
        watchedAt: new Date(),
        duration: videoDuration || 0
      });
    }

    // Calculate progress percentage
    const course = await Course.findById(courseId);
    if (course && course.videos.length > 0) {
      progress.progressPercentage = Math.round(
        (progress.videosWatched.length / course.videos.length) * 100
      );

      if (progress.progressPercentage === 100) {
        progress.completed = true;
        progress.completedAt = new Date();
      }
    }

    await progress.save();

    res.status(200).json({
      message: 'Progress updated',
      progress
    });
  } catch (error) {
    console.error('Mark video watched error:', error.message);
    res.status(500).json({ message: 'Failed to update progress', error: error.message });
  }
};

// Generate schedule (AI-based)
const generateSchedule = async (req, res) => {
  try {
    const { subjects } = req.body;
    const studentId = req.user.id;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'Please select at least one subject' });
    }

    // Remove any existing schedule
    await Schedule.deleteOne({ studentId });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = ['morning', 'afternoon', 'evening'];
    const scheduleData = [];

    // Distribute subjects evenly across week
    let dayIndex = 0;
    let slotIndex = 0;

    subjects.forEach((subject, index) => {
      scheduleData.push({
        day: days[dayIndex % days.length],
        timeSlot: timeSlots[slotIndex % timeSlots.length],
        subject: subject.trim(),
        duration: 60
      });

      slotIndex++;
      if (slotIndex >= timeSlots.length) {
        slotIndex = 0;
        dayIndex++;
      }
    });

    const newSchedule = new Schedule({
      studentId,
      scheduleData,
      selectedSubjects: subjects
    });

    await newSchedule.save();

    res.status(201).json({
      message: 'Schedule generated successfully',
      schedule: newSchedule
    });
  } catch (error) {
    console.error('Generate schedule error:', error.message);
    res.status(500).json({ message: 'Failed to generate schedule', error: error.message });
  }
};

// Get schedule
const getSchedule = async (req, res) => {
  try {
    const studentId = req.user.id;

    const schedule = await Schedule.findOne({ studentId });

    if (!schedule) {
      return res.status(404).json({ message: 'No schedule found' });
    }

    res.status(200).json({
      schedule
    });
  } catch (error) {
    console.error('Get schedule error:', error.message);
    res.status(500).json({ message: 'Failed to fetch schedule', error: error.message });
  }
};

// Get dashboard statistics
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const totalCourses = await CourseProgress.countDocuments({ studentId });
    const completedCourses = await CourseProgress.countDocuments({
      studentId,
      completed: true
    });
    const totalSpent = await CourseProgress.aggregate([
      { $match: { studentId: require('mongoose').Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $arrayElemAt: ['$course.finalPrice', 0] } }
        }
      }
    ]);

    res.status(200).json({
      stats: {
        totalCourses,
        completedCourses,
        enrollmentRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
        totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

module.exports = {
  enrollCourse,
  getStudentCourses,
  getCourseProgress,
  markVideoWatched,
  generateSchedule,
  getSchedule,
  getStudentStats
};
