const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bookController = require('../controllers/bookController');

// Search books (public route)
router.get('/search', bookController.searchBooks);

// Get personalized recommendations (protected route)
router.get('/recommendations/feed', auth, bookController.getRecommendations);

// Get all books (public route)
router.get('/', bookController.getAllBooks);

// Get single book by ID (public route)
router.get('/:id', bookController.getBookById);

// Add a book (protected route)
router.post('/', auth, bookController.addBook);

// Rate a book (protected route)
router.post('/:id/rate', auth, bookController.rateBook);

// Like a book (protected route)
router.post('/:id/like', auth, bookController.likeBook);

// Add comment to a book (protected route)
router.post('/:id/comment', auth, bookController.addComment);

// Update a book (protected route)
router.put('/:id', auth, bookController.updateBook);

// Delete a book (protected route)
router.delete('/:id', auth, bookController.deleteBook);

module.exports = router;