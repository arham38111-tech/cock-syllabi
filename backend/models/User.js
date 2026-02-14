const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student'
    },
    allocatedTeacherAccount: {
      type: String,
      default: null
    },
    bankAccount: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      routingNumber: { type: String, default: '' },
      country: { type: String, default: '' },
      currency: { type: String, default: 'USD' }
    },
    autoPayoutToAdmin: {
      type: Boolean,
      default: false
    },
    bio: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: null
    },
    pictureUrl: {
      type: String,
      default: null
    },
    documentUrl: {
      type: String,
      default: null
    },
    certificates: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    isApproved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
