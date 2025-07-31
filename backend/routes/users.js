const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users by username or display name
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      'profile.isPublic': true,
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { 'profile.displayName': { $regex: q, $options: 'i' } }
      ]
    })
    .select('username profile.displayName profile.avatar profile.preferredGames')
    .limit(parseInt(limit))
    .sort({ lastActive: -1 });

    const results = users.map(user => ({
      username: user.username,
      displayName: user.profile.displayName,
      avatar: user.profile.avatar,
      preferredGames: user.profile.preferredGames.slice(0, 3) // Limit to first 3 games
    }));

    res.json({ users: results });

  } catch (error) {
    console.error('Search users error:', error);
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
