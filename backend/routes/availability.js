const express = require('express');
const { body, validationResult } = require('express-validator');
const Availability = require('../models/Availability');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/availability/user/:username
// @desc    Get user's availability for public viewing
// @access  Public
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { start, end } = req.query;

    // Find user by username
    const User = require('../models/User');
    const user = await User.findOne({ 
      username: username.toLowerCase(),
      'profile.isPublic': true 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Default to current week if no dates provided
    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const availability = await Availability.findUserAvailability(
      user._id,
      startDate,
      endDate
    );

    res.json({
      user: {
        username: user.username,
        displayName: user.profile.displayName,
        timezone: user.profile.timezone
      },
      availability,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error('Get user availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/availability/me
// @desc    Get current user's availability
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const { start, end } = req.query;

    // Default to current week if no dates provided
    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const availability = await Availability.findUserAvailability(
      req.user._id,
      startDate,
      endDate
    );

    res.json({
      availability,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error('Get my availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/availability
// @desc    Create new availability entry
// @access  Private
router.post('/', [
  auth,
  body('type').isIn(['available', 'busy', 'override']),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('title').optional().isLength({ max: 100 }),
  body('isRecurring').optional().isBoolean()
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
      type,
      title,
      startTime,
      endTime,
      isRecurring,
      recurrenceRule
    } = req.body;

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const availability = new Availability({
      userId: req.user._id,
      type,
      title: title || (type === 'available' ? 'Available for games' : 'Busy'),
      startTime: start,
      endTime: end,
      isRecurring: isRecurring || false,
      recurrenceRule: isRecurring ? recurrenceRule : undefined,
      source: 'manual'
    });

    await availability.save();

    res.status(201).json({
      message: 'Availability created successfully',
      availability
    });

  } catch (error) {
    console.error('Create availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/availability/:id
// @desc    Update availability entry
// @access  Private
router.put('/:id', [
  auth,
  body('type').optional().isIn(['available', 'busy', 'override']),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('title').optional().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const updates = req.body;

    const availability = await Availability.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!availability) {
      return res.status(404).json({ message: 'Availability entry not found' });
    }

    // Don't allow updating external calendar events
    if (availability.source !== 'manual') {
      return res.status(400).json({ 
        message: 'Cannot edit calendar sync entries. Use override instead.' 
      });
    }

    // Validate time range if both times are provided
    if (updates.startTime && updates.endTime) {
      const start = new Date(updates.startTime);
      const end = new Date(updates.endTime);
      
      if (start >= end) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }
    }

    Object.assign(availability, updates);
    await availability.save();

    res.json({
      message: 'Availability updated successfully',
      availability
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/availability/:id
// @desc    Delete availability entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await Availability.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!availability) {
      return res.status(404).json({ message: 'Availability entry not found' });
    }

    // Don't allow deleting external calendar events
    if (availability.source !== 'manual') {
      return res.status(400).json({ 
        message: 'Cannot delete calendar sync entries. Use override instead.' 
      });
    }

    await Availability.findByIdAndDelete(id);

    res.json({ message: 'Availability deleted successfully' });

  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/availability/find-overlap
// @desc    Find overlapping availability between users
// @access  Public
router.post('/find-overlap', [
  body('usernames').isArray().isLength({ min: 2, max: 10 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { usernames, startDate, endDate } = req.body;

    // Find users by username
    const User = require('../models/User');
    const users = await User.find({ 
      username: { $in: usernames.map(u => u.toLowerCase()) },
      'profile.isPublic': true 
    }).select('_id username profile.displayName profile.timezone');

    if (users.length !== usernames.length) {
      return res.status(404).json({ message: 'One or more users not found' });
    }

    const userIds = users.map(u => u._id);
    const overlaps = await Availability.findOverlappingAvailability(
      userIds,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      users: users.map(u => ({
        username: u.username,
        displayName: u.profile.displayName,
        timezone: u.profile.timezone
      })),
      overlaps,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error('Find overlap error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
