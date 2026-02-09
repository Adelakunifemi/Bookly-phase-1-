const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bookController = require('../controllers/bookController');

// Search books (public route)
router.get('/search', bookController.searchBooks);

// Get all books (public route)
router.get('/', bookController.getAllBooks);

// Get single book by ID (public route)
router.get('/:id', bookController.getBookById);

// Add a book (protected route)
router.post('/', auth, bookController.addBook);

// Update a book (protected route)
router.put('/:id', auth, bookController.updateBook);

// Delete a book (protected route)
router.delete('/:id', auth, bookController.deleteBook);

module.exports = router;