const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const userController = require('../controllers/userController');

// Get current user profile (protected route)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (protected route)
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get any user's profile by ID
router.get('/:id', userController.getUserProfile);

// Follow a user (protected route)
router.post('/:id/follow', auth, userController.followUser);

// Unfollow a user (protected route)
router.post('/:id/unfollow', auth, userController.unfollowUser);

module.exports = router;