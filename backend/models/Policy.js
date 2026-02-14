const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyType: {
    type: String,
    enum: ['terms', 'privacy', 'refund'],
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  updatedBy: {
    type: String,
    default: 'admin'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

policySchema.index({ policyType: 1 });

module.exports = mongoose.model('Policy', policySchema);
