const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    classLevel: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    isFree: {
      type: Boolean,
      default: false
    },
    approved: {
      type: Boolean,
      default: false
    },
    rejectionReason: {
      type: String,
      default: null
    },
    thumbnail: {
      type: String,
      default: null
    },
    videos: [String],
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    enrollmentCount: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Pre-save middleware to calculate finalPrice
courseSchema.pre('save', function(next) {
  if (this.isFree) {
    this.price = 0;
    this.finalPrice = 0;
    this.approved = true;
  } else if (this.price) {
    this.finalPrice = this.price + (this.price * 0.03);
    this.finalPrice = Math.round(this.finalPrice * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
