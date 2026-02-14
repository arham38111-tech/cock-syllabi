const Category = require('../models/Category');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

// Get category by ID or slug
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      $or: [{ _id: id }, { slug: id }]
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({
      category
    });
  } catch (error) {
    console.error('Get category error:', error.message);
    res.status(500).json({ message: 'Failed to fetch category', error: error.message });
  }
};

// Create category (Admin only)
const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      slug: name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = new Category({
      name: name.trim(),
      description: description ? description.trim() : '',
      icon: icon || null
    });

    await newCategory.save();

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory
    });
  } catch (error) {
    console.error('Create category error:', error.message);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name.trim();
    if (description) category.description = description.trim();
    if (icon) category.icon = icon;

    await category.save();

    res.status(200).json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error.message);
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error.message);
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
