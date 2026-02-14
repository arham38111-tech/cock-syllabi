const TeacherRequest = require('../models/TeacherRequest');
const TeacherAccountsPool = require('../models/TeacherAccountsPool');
const User = require('../models/User');

// Submit teacher request
const submitTeacherRequest = async (req, res) => {
  try {
    const { message } = req.body;
    const teacherId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Request message is required' });
    }

    // Check if teacher already has a pending request
    const existingRequest = await TeacherRequest.findOne({
      teacherId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending teacher request' });
    }

    const newRequest = new TeacherRequest({
      teacherId,
      message: message.trim()
    });

    await newRequest.save();

    res.status(201).json({
      message: 'Teacher request submitted successfully',
      request: newRequest
    });
  } catch (error) {
    console.error('Teacher request error:', error.message);
    res.status(500).json({ message: 'Failed to submit teacher request', error: error.message });
  }
};

// Get all teacher requests (Admin only)
const getTeacherRequests = async (req, res) => {
  try {
    const requests = await TeacherRequest.find()
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      requests
    });
  } catch (error) {
    console.error('Get requests error:', error.message);
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

// Approve teacher request (Admin only)
const approveTeacherRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user.id;

    const request = await TeacherRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Find available teacher account
    const availableAccount = await TeacherAccountsPool.findOne({ allocated: false });
    if (!availableAccount) {
      return res.status(400).json({ message: 'No available teacher accounts' });
    }

    // Mark account as allocated
    availableAccount.allocated = true;
    availableAccount.allocatedTo = request.teacherId;
    availableAccount.allocatedAt = new Date();
    await availableAccount.save();

    // Update request
    request.status = 'approved';
    request.allocatedUsername = availableAccount.username;
    request.allocatedPassword = availableAccount.password;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    // Update user to approve as teacher
    const user = await User.findById(request.teacherId);
    user.role = 'teacher';
    user.isApproved = true;
    user.allocatedTeacherAccount = availableAccount.username;
    await user.save();

    res.status(200).json({
      message: 'Teacher request approved successfully',
      request
    });
  } catch (error) {
    console.error('Approve request error:', error.message);
    res.status(500).json({ message: 'Failed to approve request', error: error.message });
  }
};

// Reject teacher request (Admin only)
const rejectTeacherRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const request = await TeacherRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';
    request.rejectionReason = rejectionReason.trim();
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    await request.save();

    res.status(200).json({
      message: 'Teacher request rejected',
      request
    });
  } catch (error) {
    console.error('Reject request error:', error.message);
    res.status(500).json({ message: 'Failed to reject request', error: error.message });
  }
};

// Get teacher's own request
const getMyTeacherRequest = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const request = await TeacherRequest.findOne({ teacherId })
      .sort({ createdAt: -1 });

    if (!request) {
      return res.status(404).json({ message: 'No teacher request found' });
    }

    res.status(200).json({
      request
    });
  } catch (error) {
    console.error('Get my request error:', error.message);
    res.status(500).json({ message: 'Failed to fetch your request', error: error.message });
  }
};

module.exports = {
  submitTeacherRequest,
  getTeacherRequests,
  approveTeacherRequest,
  rejectTeacherRequest,
  getMyTeacherRequest
};
