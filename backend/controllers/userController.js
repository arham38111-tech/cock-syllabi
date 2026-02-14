const User = require('../models/User');

exports.setBankAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bankName, accountNumber, routingNumber, country, currency } = req.body;
    const update = { bankAccount: { bankName, accountNumber, routingNumber, country, currency } };
    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.setPayoutRule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { autoPayoutToAdmin } = req.body;
    const user = await User.findByIdAndUpdate(userId, { autoPayoutToAdmin: !!autoPayoutToAdmin }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.getMyBankAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('bankAccount autoPayoutToAdmin role name email');
    res.json({ bankAccount: user.bankAccount, autoPayoutToAdmin: user.autoPayoutToAdmin, role: user.role });
  } catch (err) {
    next(err);
  }
};

// Update teacher profile picture and document
exports.updateTeacherProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { pictureUrl, documentUrl } = req.body;
    
    // Verify user is a teacher
    const user = await User.findById(userId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can update this profile' });
    }

    const update = {};
    if (pictureUrl !== undefined) update.pictureUrl = pictureUrl;
    if (documentUrl !== undefined) update.documentUrl = documentUrl;

    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    res.json({ 
      message: 'Teacher profile updated successfully',
      user: updatedUser 
    });
  } catch (err) {
    next(err);
  }
};

// Get teacher profile
exports.getTeacherProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name email role pictureUrl documentUrl bio createdAt');
    
    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can access this' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};
