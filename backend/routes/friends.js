const express = require('express');
const Friend = require('../models/Friend');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendPushNotification } = require('../services/pushNotificationService');

const router = express.Router();

// @route   POST /api/friends/request/:userId
// @desc    Send friend request
// @access  Private
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const requesterId = req.user.id;
    const recipientId = req.params.userId;

    // Check if user exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if users are the same
    if (requesterId === recipientId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if friendship already exists
    const existingFriendship = await Friend.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship already exists' });
    }

    // Create friend request
    const friendship = new Friend({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    await friendship.save();

    // Send push notification to recipient
    await sendPushNotification(
      recipientId,
      'Friend Request',
      `${req.user.username} sent you a friend request`,
      'friend_request',
      { friendshipId: friendship._id }
    );

    res.status(201).json({
      message: 'Friend request sent',
      friendship
    });

  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/friends/accept/:friendshipId
// @desc    Accept friend request
// @access  Private
router.post('/accept/:friendshipId', auth, async (req, res) => {
  try {
    const friendship = await Friend.findById(req.params.friendshipId)
      .populate('requester', 'username')
      .populate('recipient', 'username');

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Check if user is the recipient
    if (friendship.recipient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    // Check if request is still pending
    if (friendship.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }

    friendship.status = 'accepted';
    friendship.acceptedAt = new Date();
    await friendship.save();

    // Send push notification to requester
    await sendPushNotification(
      friendship.requester._id,
      'Friend Request Accepted',
      `${req.user.username} accepted your friend request`,
      'friend_accepted',
      { friendshipId: friendship._id }
    );

    res.json({
      message: 'Friend request accepted',
      friendship
    });

  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/friends/decline/:friendshipId
// @desc    Decline friend request
// @access  Private
router.post('/decline/:friendshipId', auth, async (req, res) => {
  try {
    const friendship = await Friend.findById(req.params.friendshipId);

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Check if user is the recipient
    if (friendship.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to decline this request' });
    }

    // Check if request is still pending
    if (friendship.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }

    friendship.status = 'declined';
    await friendship.save();

    res.json({
      message: 'Friend request declined',
      friendship
    });

  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/friends/cancel/:friendshipId
// @desc    Cancel sent friend request
// @access  Private
router.delete('/cancel/:friendshipId', auth, async (req, res) => {
  try {
    const friendship = await Friend.findById(req.params.friendshipId);

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Check if user is the requester
    if (friendship.requester.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    // Check if request is still pending
    if (friendship.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel non-pending request' });
    }

    await Friend.findByIdAndDelete(req.params.friendshipId);

    res.json({ message: 'Friend request cancelled' });

  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/friends/remove/:friendshipId
// @desc    Remove friend
// @access  Private
router.delete('/remove/:friendshipId', auth, async (req, res) => {
  try {
    const friendship = await Friend.findById(req.params.friendshipId);

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Check if user is part of the friendship
    if (friendship.requester.toString() !== req.user.id && 
        friendship.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to remove this friendship' });
    }

    await Friend.findByIdAndDelete(req.params.friendshipId);

    res.json({ message: 'Friend removed' });

  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/friends/block/:userId
// @desc    Block user
// @access  Private
router.post('/block/:userId', auth, async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.userId;

    // Check if user exists
    const blockedUser = await User.findById(blockedId);
    if (!blockedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if users are the same
    if (blockerId === blockedId) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    // Remove any existing friendship
    await Friend.findOneAndDelete({
      $or: [
        { requester: blockerId, recipient: blockedId },
        { requester: blockedId, recipient: blockerId }
      ]
    });

    // Create block relationship
    const blockRelationship = new Friend({
      requester: blockerId,
      recipient: blockedId,
      status: 'blocked'
    });

    await blockRelationship.save();

    res.json({
      message: 'User blocked',
      friendship: blockRelationship
    });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/friends/unblock/:userId
// @desc    Unblock user
// @access  Private
router.post('/unblock/:userId', auth, async (req, res) => {
  try {
    const unblockerId = req.user.id;
    const unblockedId = req.params.userId;

    // Find and remove block relationship
    const blockRelationship = await Friend.findOneAndDelete({
      requester: unblockerId,
      recipient: unblockedId,
      status: 'blocked'
    });

    if (!blockRelationship) {
      return res.status(404).json({ message: 'Block relationship not found' });
    }

    res.json({ message: 'User unblocked' });

  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/friends/status/:userId
// @desc    Get friendship status with user
// @access  Private
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const friendship = await Friend.findOne({
      $or: [
        { requester: currentUserId, recipient: otherUserId },
        { requester: otherUserId, recipient: currentUserId }
      ]
    });

    if (!friendship) {
      return res.json({
        status: 'none',
        friendship: null,
        isRequester: false
      });
    }

    const isRequester = friendship.requester.toString() === currentUserId;

    res.json({
      status: friendship.status,
      friendship: friendship,
      isRequester: isRequester
    });

  } catch (error) {
    console.error('Get friendship status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/friends
// @desc    Get user's friends and blocked users
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get accepted friendships
    const friendships = await Friend.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    }).populate('requester recipient', 'username email profile.avatar profile.bio');

    const friends = friendships.map(friendship => {
      return friendship.requester._id.toString() === userId 
        ? friendship.recipient 
        : friendship.requester;
    });

    // Get blocked users
    const blockedRelationships = await Friend.find({
      requester: userId,
      status: 'blocked'
    }).populate('recipient', 'username email profile.avatar profile.bio');

    const blocked = blockedRelationships.map(rel => rel.recipient);

    res.json({
      friends,
      blocked
    });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/friends/requests
// @desc    Get friend requests (sent and received)
// @access  Private
router.get('/requests', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get received requests
    const receivedRequests = await Friend.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester', 'username email profile.avatar profile.bio');

    // Get sent requests
    const sentRequests = await Friend.find({
      requester: userId,
      status: 'pending'
    }).populate('recipient', 'username email profile.avatar profile.bio');

    res.json({
      received: receivedRequests,
      sent: sentRequests
    });

  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;