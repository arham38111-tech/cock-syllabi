const User = require('../models/User');
const Course = require('../models/Course');
const TeacherAccountsPool = require('../models/TeacherAccountsPool');
const CourseProgress = require('../models/CourseProgress');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};

    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      users
    });
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Get teachers
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      $or: [{ role: 'teacher' }, { isApproved: true }]
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      teachers
    });
  } catch (error) {
    console.error('Get teachers error:', error.message);
    res.status(500).json({ message: 'Failed to fetch teachers', error: error.message });
  }
};

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const approvedCourses = await Course.countDocuments({ approved: true });
    const pendingCourses = await Course.countDocuments({ approved: false });

    const totalRevenue = await CourseProgress.aggregate([
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
        totalUsers,
        totalTeachers,
        totalStudents,
        totalCourses,
        approvedCourses,
        pendingCourses,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

// Get teacher accounts pool status
const getTeacherPoolStatus = async (req, res) => {
  try {
    const totalAccounts = await TeacherAccountsPool.countDocuments();
    const allocatedAccounts = await TeacherAccountsPool.countDocuments({ allocated: true });
    const availableAccounts = totalAccounts - allocatedAccounts;

    res.status(200).json({
      poolStatus: {
        totalAccounts,
        allocatedAccounts,
        availableAccounts
      }
    });
  } catch (error) {
    console.error('Get pool status error:', error.message);
    res.status(500).json({ message: 'Failed to fetch pool status', error: error.message });
  }
};

// Get course sales analytics
const getCourseAnalytics = async (req, res) => {
  try {
    const analytics = await Course.aggregate([
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          enrollmentCount: { $first: '$enrollmentCount' },
          finalPrice: { $first: '$finalPrice' },
          revenue: {
            $multiply: ['$enrollmentCount', '$finalPrice']
          }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error.message);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getTeachers,
  getDashboardStats,
  getTeacherPoolStatus,
  getCourseAnalytics
};
