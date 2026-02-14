import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const Books = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.maxPrice) params.append('priceMax', filters.maxPrice);

      const response = await apiClient.get(`/books?${params.toString()}`);
      setBooks(response.data.books || []);
    } catch (error) {
      console.error('Failed to fetch books', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Textbook', 'Reference', 'Workbook', 'Study Guide', 'Practice Book'];

  const handlePurchase = async (bookId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await apiClient.post(`/books/${bookId}/purchase`);
      alert('Book purchased successfully!');
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to purchase book');
    }
  };

  return (
    <main className="pt-20 md:pt-24 pb-12 md:pb-20 bg-white">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
            Course Books & Study Materials
          </h1>
          <p className="text-gray-600 text-sm md:text-lg">
            {books.length} {books.length === 1 ? 'book' : 'books'} available
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 md:mb-12 space-y-4">
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search books by title, author, or description..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full px-4 md:px-6 py-3 md:py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-sm md:text-base"
          />

          {/* Category Filter */}
          <div className="overflow-x-auto pb-2 -mx-5 md:mx-0 px-5 md:px-0">
            <div className="flex gap-2 min-w-min md:min-w-0 md:flex-wrap">
              <button
                onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all text-sm ${
                  filters.category === ''
                    ? 'bg-blue-600 text-white shadow-premium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                  className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all text-sm ${
                    filters.category === cat
                      ? 'bg-blue-600 text-white shadow-premium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price: ${filters.maxPrice || 'All'}
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={filters.maxPrice || 0}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value === '0' ? '' : e.target.value }))}
              className="w-full"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm md:text-base">Loading books...</p>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-600 text-lg mb-2">No books found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {books.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-premium transition-all duration-300 flex flex-col"
              >
                {/* Book Cover */}
                <div className="relative h-48 md:h-56 bg-gradient-to-br from-blue-400 to-purple-400 overflow-hidden flex items-center justify-center">
                  {book.isFree && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg">
                      FREE
                    </div>
                  )}
                  <div className="text-6xl">📖</div>
                </div>

                {/* Book Info */}
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  {/* Category */}
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                      {book.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {book.title}
                  </h3>

                  {/* Author */}
                  <p className="text-xs md:text-sm text-gray-500 mb-3">
                    by {book.author}
                  </p>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                    {book.description}
                  </p>

                  {/* Course Info */}
                  {book.courseId && (
                    <p className="text-xs text-blue-600 mb-4">
                      📚 {book.courseId.title}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 text-xs text-gray-500 pb-4 border-b border-gray-200 mb-4">
                    {book.pages && (
                      <span>📄 {book.pages} pages</span>
                    )}
                    <span>⭐ {book.rating || 'N/A'}</span>
                    <span>📥 {book.purchaseCount || 0} sales</span>
                  </div>

                  {/* Price and Button */}
                  <div className="flex justify-between items-center">
                    <div>
                      {book.isFree ? (
                        <span className="text-xl md:text-2xl font-bold text-green-600">FREE</span>
                      ) : (
                        <span className="text-lg md:text-xl font-bold text-blue-600">
                          ${book.price}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handlePurchase(book._id)}
                      className="px-4 md:px-5 py-2 md:py-3 bg-blue-600 text-white text-sm md:text-base rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-premium hover:shadow-lift"
                    >
                      {book.isFree ? '✓ Get' : 'Buy'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Books;
