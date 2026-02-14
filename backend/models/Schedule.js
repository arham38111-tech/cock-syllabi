const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    scheduleData: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          required: true
        },
        timeSlot: {
          type: String,
          enum: ['morning', 'afternoon', 'evening'],
          required: true
        },
        subject: {
          type: String,
          required: true
        },
        duration: {
          type: Number,
          default: 60
        }
      }
    ],
    selectedSubjects: [
      {
        type: String
      }
    ],
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
