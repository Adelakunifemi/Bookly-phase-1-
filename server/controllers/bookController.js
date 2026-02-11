const Book = require('../models/Book');
const axios = require('axios');

// Search books using Google Books API
exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`
    );

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

// Add a book recommendation
exports.addBook = async (req, res) => {
  try {
    const { title, author, genre, description, rating, coverImage } = req.body;

    // Validate required fields
    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }

    // Create new book
    const book = new Book({
      title,
      author,
      genre,
      description,
      rating: rating || 0,
      coverImage,
      addedBy: req.user.id
    });

    await book.save();

    res.status(201).json({ message: 'Book added successfully', book });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ message: 'Error adding book' });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('addedBy', 'username email');
    res.json(books);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
};

// Get a single book by ID
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

// Update a book
exports.updateBook = async (req, res) => {
  try {
    const { title, author, genre, description, rating, coverImage } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user is the one who added the book
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

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user is the one who added the book
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

// Rate a book
exports.rateBook = async (req, res) => {
  try {
    const { rating } = req.body;

    // Validate rating
    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Initialize userRatings if it doesn't exist
    if (!book.userRatings) {
      book.userRatings = [];
    }

    // Check if user has already rated this book
    const existingRatingIndex = book.userRatings.findIndex(
      r => r.user.toString() === req.user.id
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      book.userRatings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      book.userRatings.push({
        user: req.user.id,
        rating: rating
      });
    }

    // Calculate average rating
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