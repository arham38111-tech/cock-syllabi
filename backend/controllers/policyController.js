const Policy = require('../models/Policy');

// Get all policies
exports.getAllPolicies = async (req, res, next) => {
  try {
    const policies = await Policy.find().sort({ createdAt: 1 });
    res.json({ policies });
  } catch (err) {
    next(err);
  }
};

// Get single policy by type
exports.getPolicyByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const policy = await Policy.findOne({ policyType: type });
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    res.json({ policy });
  } catch (err) {
    next(err);
  }
};

// Update policy (admin only)
exports.updatePolicy = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { content, title } = req.body;
    
    // Verify user is admin
    const user = req.user;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update policies' });
    }
    
    let policy = await Policy.findOne({ policyType: type });
    
    if (!policy) {
      // Create new policy if it doesn't exist
      policy = new Policy({
        policyType: type,
        title: title || type.charAt(0).toUpperCase() + type.slice(1),
        content: content || '',
        updatedBy: user.name || user.email
      });
    } else {
      // Update existing policy
      policy.content = content || policy.content;
      if (title) policy.title = title;
      policy.updatedBy = user.name || user.email;
      policy.updatedAt = Date.now();
    }
    
    await policy.save();
    
    res.json({ 
      message: 'Policy updated successfully',
      policy 
    });
  } catch (err) {
    next(err);
  }
};

// Initialize default policies
exports.initializeDefaultPolicies = async (req, res, next) => {
  try {
    const defaultPolicies = [
      {
        policyType: 'terms',
        title: 'Terms of Service',
        content: 'Our Terms of Service will be updated here. This section outlines the legal agreement between the user and our platform.'
      },
      {
        policyType: 'privacy',
        title: 'Privacy Policy',
        content: 'Our Privacy Policy will be updated here. This section explains how we collect, use, and protect your personal information.'
      },
      {
        policyType: 'refund',
        title: 'Return & Refund Policy',
        content: 'Our Return & Refund Policy will be updated here. This section outlines the terms for returns and refunds of courses and products.'
      }
    ];
    
    for (const policyData of defaultPolicies) {
      const exists = await Policy.findOne({ policyType: policyData.policyType });
      if (!exists) {
        await Policy.create(policyData);
      }
    }
    
    res.json({ message: 'Default policies initialized' });
  } catch (err) {
    next(err);
  }
};
