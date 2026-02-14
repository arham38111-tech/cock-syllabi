const Course = require('../models/Course');
const User = require('../models/User');

// Create course (Teachers only)
const createCourse = async (req, res) => {
  try {
    const { title, description, subject, classLevel, price, category } = req.body;
    const teacherId = req.user.id;

    // Validation
    if (!title || !description || !subject || !classLevel || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    // Calculate final price with 3% markup
    const finalPrice = price + (price * 0.03);

    const newCourse = new Course({
      teacherId,
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      class: classLevel.trim(),
      price,
      finalPrice: Math.round(finalPrice * 100) / 100,
      category
    });

    await newCourse.save();

    res.status(201).json({
      message: 'Course created successfully',
      course: newCourse
    });
  } catch (error) {
    console.error('Create course error:', error.message);
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
};

// Get all courses (with filters)
const getAllCourses = async (req, res) => {
  try {
    const { subject, class: classLevel, approved, search } = req.query;
    const filter = { approved: true };

    if (subject) filter.subject = subject;
    if (classLevel) filter.class = classLevel;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .populate('teacherId', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error.message);
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};

// Get courses for admin approval
const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ approved: false })
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      courses
    });
  } catch (error) {
    console.error('Get pending courses error:', error.message);
    res.status(500).json({ message: 'Failed to fetch pending courses', error: error.message });
  }
};

// Get teacher's courses
const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const courses = await Course.find({ teacherId })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      courses
    });
  } catch (error) {
    console.error('Get teacher courses error:', error.message);
    res.status(500).json({ message: 'Failed to fetch your courses', error: error.message });
  }
};

// Get single course
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('teacherId', 'name email bio')
      .populate('category', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({
      course
    });
  } catch (error) {
    console.error('Get course error:', error.message);
    res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
};

// Update course (Teachers only)
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, subject, classLevel, price, category } = req.body;
    const teacherId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify ownership
    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'You can only edit your own courses' });
    }

    // Prevent editing approved courses
    if (course.approved) {
      return res.status(400).json({ message: 'Cannot edit approved courses' });
    }

    if (title) course.title = title.trim();
    if (description) course.description = description.trim();
    if (subject) course.subject = subject.trim();
    if (classLevel) course.class = classLevel.trim();
    if (price && price > 0) {
      course.price = price;
      course.finalPrice = price + (price * 0.03);
      course.finalPrice = Math.round(course.finalPrice * 100) / 100;
    }
    if (category) course.category = category;

    await course.save();

    res.status(200).json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error.message);
    res.status(500).json({ message: 'Failed to update course', error: error.message });
  }
};

// Approve course (Admin only)
const approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.approved = true;
    course.rejectionReason = null;
    await course.save();

    res.status(200).json({
      message: 'Course approved successfully',
      course
    });
  } catch (error) {
    console.error('Approve course error:', error.message);
    res.status(500).json({ message: 'Failed to approve course', error: error.message });
  }
};

// Reject course (Admin only)
const rejectCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.rejectionReason = rejectionReason.trim();
    await course.save();

    res.status(200).json({
      message: 'Course rejected',
      course
    });
  } catch (error) {
    console.error('Reject course error:', error.message);
    res.status(500).json({ message: 'Failed to reject course', error: error.message });
  }
};

// Delete course (Teachers only)
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'You can only delete your own courses' });
    }

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error.message);
    res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getPendingCourses,
  getTeacherCourses,
  getCourseById,
  updateCourse,
  approveCourse,
  rejectCourse,
  deleteCourse
};
