const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { upload, deleteOldAvatar } = require('../config/cloudinary');

const router = express.Router();

// @route   GET /api/profiles/:username
// @desc    Get public profile by username
// @access  Public
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ 
      username: username.toLowerCase(),
      'profile.isPublic': true 
    });

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get public profile data
    const profileData = user.getPublicProfile();
    
    // Add additional info if user is viewing their own profile
    if (req.user && req.user._id.toString() === user._id.toString()) {
      profileData.isOwner = true;
      profileData.email = user.email;
    }

    res.json(profileData);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/profiles/me
// @desc    Update user profile
// @access  Private
router.put('/me', [
  auth,
  body('displayName').optional().isLength({ min: 1, max: 50 }),
  body('bio').optional().isLength({ max: 500 }),
  body('preferredGames').optional().isArray(),
  body('platforms').optional().isArray(),
  body('timezone').optional().isString(),
  body('region').optional().isString(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      displayName,
      bio,
      preferredGames,
      platforms,
      timezone,
      region,
      isPublic
    } = req.body;

    // Update profile fields
    if (displayName !== undefined) req.user.profile.displayName = displayName;
    if (bio !== undefined) req.user.profile.bio = bio;
    if (preferredGames !== undefined) req.user.profile.preferredGames = preferredGames;
    if (platforms !== undefined) req.user.profile.platforms = platforms;
    if (timezone !== undefined) req.user.profile.timezone = timezone;
    if (region !== undefined) req.user.profile.region = region;
    if (isPublic !== undefined) req.user.profile.isPublic = isPublic;

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      profile: req.user.profile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/profiles
// @desc    Get all public profiles (explore page)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      game,
      platform,
      region,
      timezone,
      page = 1,
      limit = 20,
      search
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { 'profile.isPublic': true };

    if (game) {
      query['profile.preferredGames'] = { $regex: game, $options: 'i' };
    }

    if (platform) {
      query['profile.platforms'] = platform;
    }

    if (region) {
      query['profile.region'] = { $regex: region, $options: 'i' };
    }

    if (timezone) {
      query['profile.timezone'] = timezone;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { 'profile.displayName': { $regex: search, $options: 'i' } },
        { 'profile.preferredGames': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('username profile lastActive')
      .sort({ lastActive: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    const profiles = users.map(user => user.getPublicProfile());

    res.json({
      profiles,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalProfiles: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/profiles/avatar
// @desc    Upload profile avatar
// @access  Private
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Delete old avatar if it exists
    if (req.user.profile.avatar) {
      await deleteOldAvatar(req.user.profile.avatar);
    }

    // Update user profile with new avatar URL
    req.user.profile.avatar = req.file.path;
    await req.user.save();

    res.json({
      message: 'Avatar updated successfully',
      avatar: req.user.profile.avatar
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    
    // Handle multer errors
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB' });
    }
    
    res.status(500).json({ message: 'Server error during avatar upload' });
  }
});

// @route   DELETE /api/profiles/avatar
// @desc    Delete profile avatar
// @access  Private
router.delete('/avatar', auth, async (req, res) => {
  try {
    // Delete avatar from Cloudinary if it exists
    if (req.user.profile.avatar) {
      await deleteOldAvatar(req.user.profile.avatar);
    }

    // Remove avatar from user profile
    req.user.profile.avatar = '';
    await req.user.save();

    res.json({
      message: 'Avatar deleted successfully'
    });

  } catch (error) {
    console.error('Avatar deletion error:', error);
    res.status(500).json({ message: 'Server error during avatar deletion' });
  }
});

// @route   GET /api/profiles/check-username/:username
// @desc    Check if username is available
// @access  Public
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username) || username.length < 3 || username.length > 30) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores' 
      });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    
    res.json({
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    });

  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
