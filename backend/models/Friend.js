const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending',
    required: true
  },
  acceptedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });
friendSchema.index({ recipient: 1, status: 1 });
friendSchema.index({ requester: 1, status: 1 });

// Static method to get friendship status between two users
friendSchema.statics.getFriendshipStatus = async function(user1Id, user2Id) {
  const friendship = await this.findOne({
    $or: [
      { requester: user1Id, recipient: user2Id },
      { requester: user2Id, recipient: user1Id }
    ]
  });

  if (!friendship) {
    return { status: 'none', friendship: null, isRequester: false };
  }

  const isRequester = friendship.requester.toString() === user1Id.toString();
  return {
    status: friendship.status,
    friendship: friendship,
    isRequester: isRequester
  };
};

// Static method to get user's friends
friendSchema.statics.getFriends = async function(userId, status = 'accepted') {
  const friendships = await this.find({
    $or: [
      { requester: userId, status: status },
      { recipient: userId, status: status }
    ]
  }).populate('requester recipient', 'username email profile');

  return friendships.map(friendship => {
    return friendship.requester._id.toString() === userId.toString()
      ? friendship.recipient
      : friendship.requester;
  });
};

// Static method to get pending friend requests
friendSchema.statics.getPendingRequests = async function(userId, type = 'both') {
  const query = { status: 'pending' };
  
  if (type === 'received') {
    query.recipient = userId;
  } else if (type === 'sent') {
    query.requester = userId;
  } else {
    // both
    query.$or = [
      { recipient: userId },
      { requester: userId }
    ];
  }

  const requests = await this.find(query)
    .populate('requester recipient', 'username email profile');

  if (type === 'both') {
    return {
      received: requests.filter(req => req.recipient._id.toString() === userId.toString()),
      sent: requests.filter(req => req.requester._id.toString() === userId.toString())
    };
  }

  return requests;
};

// Prevent duplicate friendships and self-friendship
friendSchema.pre('save', function(next) {
  if (this.requester.toString() === this.recipient.toString()) {
    next(new Error('Cannot create friendship with yourself'));
  }
  next();
});

module.exports = mongoose.model('Friend', friendSchema);