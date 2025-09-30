const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users by username or email
// @access  Private (requires authentication)
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      _id: { $ne: req.user.id }, // Exclude current user
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('_id username email profile.bio profile.avatar profile.preferredGames')
    .limit(parseInt(limit))
    .sort({ lastActive: -1 });

    const results = users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.profile?.bio || '',
      avatar: user.profile?.avatar || null,
      preferredGames: user.profile?.preferredGames?.slice(0, 3) || []
    }));

    res.json({ users: results });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user profile by ID
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('_id username email profile createdAt lastActive');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.profile?.bio || '',
      avatar: user.profile?.avatar || null,
      preferredGames: user.profile?.preferredGames || [],
      platforms: user.profile?.platforms || [],
      availability: user.profile?.availability || {},
      isPublic: user.profile?.isPublic || false,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    };

    res.json({ user: userProfile });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get platform statistics for explore page
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ 'profile.isPublic': true });
    
    const platformStats = await User.aggregate([
      { $match: { 'profile.isPublic': true } },
      { $unwind: '$profile.platforms' },
      { $group: { _id: '$profile.platforms', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const topGames = await User.aggregate([
      { $match: { 'profile.isPublic': true } },
      { $unwind: '$profile.preferredGames' },
      { $group: { _id: '$profile.preferredGames', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalUsers,
      platforms: platformStats,
      topGames: topGames
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
