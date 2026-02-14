const Book = require('../models/Book');
const Course = require('../models/Course');

// Add book to course
const addBook = async (req, res) => {
  try {
    const { courseId, title, description, author, price, category, pages, language, isFree } = req.body;
    const teacherId = req.user.id;

    // Validate
    if (!courseId || !title || !description || !author) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Verify course belongs to teacher
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
      return res.status(403).json({ message: 'You can only add books to your own courses' });
    }

    // Create book
    const book = new Book({
      courseId,
      teacherId,
      title: title.trim(),
      description: description.trim(),
      author: author.trim(),
      price: isFree ? 0 : price || 0,
      category: category || 'Textbook',
      pages,
      language: language || 'English',
      isFree: isFree || false
    });

    await book.save();

    res.status(201).json({
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    console.error('Error adding book:', error.message);
    res.status(500).json({ message: 'Failed to add book', error: error.message });
  }
};

// Get books for a course
const getCourseBooks = async (req, res) => {
  try {
    const { courseId } = req.params;

    const books = await Book.find({ courseId })
      .select('-purchasedBy')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Books retrieved successfully',
      books,
      count: books.length
    });
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
};

// Get all books (public)
const getAllBooks = async (req, res) => {
  try {
    const { search, category, priceMin, priceMax } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    const books = await Book.find(filter)
      .populate('teacherId', 'name email')
      .populate('courseId', 'title subject')
      .select('-purchasedBy')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      message: 'Books retrieved successfully',
      books,
      count: books.length
    });
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
};

// Get book by ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id)
      .populate('teacherId', 'name email bio')
      .populate('courseId', 'title subject description');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({
      message: 'Book retrieved successfully',
      book
    });
  } catch (error) {
    console.error('Error fetching book:', error.message);
    res.status(500).json({ message: 'Failed to fetch book', error: error.message });
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { title, description, author, price, category, pages, language, isFree } = req.body;

    // Find book
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Verify ownership
    if (book.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'You can only edit your own books' });
    }

    // Update fields
    if (title) book.title = title.trim();
    if (description) book.description = description.trim();
    if (author) book.author = author.trim();
    if (price !== undefined) book.price = isFree ? 0 : price;
    if (category) book.category = category;
    if (pages !== undefined) book.pages = pages;
    if (language) book.language = language;
    if (isFree !== undefined) book.isFree = isFree;

    await book.save();

    res.status(200).json({
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Error updating book:', error.message);
    res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    // Find book
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Verify ownership
    if (book.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'You can only delete your own books' });
    }

    await Book.deleteOne({ _id: id });

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error.message);
    res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
};

// Purchase book
const purchaseBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find book
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if already purchased
    if (book.purchasedBy.includes(userId)) {
      return res.status(400).json({ message: 'You have already purchased this book' });
    }

    // Add to purchased list
    book.purchasedBy.push(userId);
    book.purchaseCount += 1;

    await book.save();

    res.status(200).json({
      message: 'Book purchased successfully',
      book
    });
  } catch (error) {
    console.error('Error purchasing book:', error.message);
    res.status(500).json({ message: 'Failed to purchase book', error: error.message });
  }
};

// Get teacher's books
const getTeacherBooks = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const books = await Book.find({ teacherId })
      .populate('courseId', 'title subject')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Books retrieved successfully',
      books,
      count: books.length
    });
  } catch (error) {
    console.error('Error fetching teacher books:', error.message);
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
};

module.exports = {
  addBook,
  getCourseBooks,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  purchaseBook,
  getTeacherBooks
};
