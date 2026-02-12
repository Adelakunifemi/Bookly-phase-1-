const Book = require('../models/Book');
const axios = require('axios');

// Search books using Google Books API
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
    const books = response.data.items?.map(item => ({
      googleId: item.id,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.join(', ') || 'Unknown',
      description: item.volumeInfo.description || 'No description available',
      coverImage: item.volumeInfo.imageLinks?.thumbnail || '',
      publishedDate: item.volumeInfo.publishedDate,
      categories: item.volumeInfo.categories || []
    })) || [];
    res.json(books);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching for books' });
  }
};

exports.addBook = async (req, res) => {
  try {
    const { title, author, genre, description, rating, coverImage } = req.body;
    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }
    const book = new Book({ title, author, genre, description, rating: rating || 0, coverImage, addedBy: req.user.id });
    await book.save();
    res.status(201).json({ message: 'Book added successfully', book });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ message: 'Error adding book' });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('addedBy', 'username email');
    res.json(books);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'username email');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Error fetching book' });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { title, author, genre, description, rating, coverImage } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }
    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description || book.description;
    book.rating = rating !== undefined ? rating : book.rating;
    book.coverImage = coverImage || book.coverImage;
    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Error updating book' });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }
    await book.deleteOne();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Error deleting book' });
  }
};

exports.rateBook = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (!book.userRatings) {
      book.userRatings = [];
    }
    const existingRatingIndex = book.userRatings.findIndex(r => r.user.toString() === req.user.id);
    if (existingRatingIndex !== -1) {
      book.userRatings[existingRatingIndex].rating = rating;
    } else {
      book.userRatings.push({ user: req.user.id, rating: rating });
    }
    if (book.userRatings.length === 0) {
      book.rating = 0;
    } else {
      const sum = book.userRatings.reduce((acc, curr) => acc + curr.rating, 0);
      book.rating = sum / book.userRatings.length;
    }
    await book.save();
    res.json({ message: 'Book rated successfully', book });
  } catch (error) {
    console.error('Rate book error:', error);
    res.status(500).json({ message: 'Error rating book' });
  }
};

exports.likeBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const likeIndex = book.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      book.likes.splice(likeIndex, 1);
      await book.save();
      return res.json({ message: 'Book unliked', liked: false, likesCount: book.likes.length });
    } else {
      book.likes.push(req.user.id);
      await book.save();
      return res.json({ message: 'Book liked', liked: true, likesCount: book.likes.length });
    }
  } catch (error) {
    console.error('Like book error:', error);
    res.status(500).json({ message: 'Error liking book' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    book.comments.push({ user: req.user.id, text: text.trim() });
    await book.save();
    await book.populate('comments.user', 'username');
    res.json({ message: 'Comment added', comments: book.comments });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userBooks = await Book.find({ $or: [{ 'userRatings.user': userId }, { likes: userId }] });
    const userGenres = [...new Set(userBooks.map(b => b.genre).filter(Boolean))];
    const recommendations = await Book.find({ genre: { $in: userGenres }, 'userRatings.user': { $ne: userId }, likes: { $ne: userId } }).sort({ rating: -1, createdAt: -1 }).limit(10).populate('addedBy', 'username');
    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
};