const User = require('../models/User');

exports.followUser = async (req, res) => {
  try {
    const userIdToFollow = req.params.id;
    const currentUserId = req.user.id;
    if (userIdToFollow === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(currentUserId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (currentUser.following && currentUser.following.includes(userIdToFollow)) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    if (!currentUser.following) currentUser.following = [];
    if (!userToFollow.followers) userToFollow.followers = [];
    currentUser.following.push(userIdToFollow);
    userToFollow.followers.push(currentUserId);
    await currentUser.save();
    await userToFollow.save();
    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Error following user' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const userIdToUnfollow = req.params.id;
    const currentUserId = req.user.id;
    const userToUnfollow = await User.findById(userIdToUnfollow);
    const currentUser = await User.findById(currentUserId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (currentUser.following) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== userIdToUnfollow);
    }
    if (userToUnfollow.followers) {
      userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);
    }
    await currentUser.save();
    await userToUnfollow.save();
    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Error unfollowing user' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};