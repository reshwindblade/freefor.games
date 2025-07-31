const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['available', 'busy', 'override'],
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrenceRule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1
    },
    daysOfWeek: [{
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      min: 0,
      max: 6
    }],
    endDate: {
      type: Date
    }
  },
  source: {
    type: String,
    enum: ['manual', 'google_calendar', 'outlook'],
    default: 'manual'
  },
  externalEventId: {
    type: String,
    default: ''
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
availabilitySchema.index({ userId: 1, startTime: 1, endTime: 1 });
availabilitySchema.index({ userId: 1, type: 1 });
availabilitySchema.index({ startTime: 1, endTime: 1 });

// Method to check if this availability conflicts with another
availabilitySchema.methods.conflictsWith = function(otherAvailability) {
  return (
    this.startTime < otherAvailability.endTime &&
    this.endTime > otherAvailability.startTime
  );
};

// Static method to find user's availability in a date range
availabilitySchema.statics.findUserAvailability = function(userId, startDate, endDate) {
  return this.find({
    userId,
    startTime: { $lt: endDate },
    endTime: { $gt: startDate },
    isVisible: true
  }).sort({ startTime: 1 });
};

// Static method to find overlapping availability between users
availabilitySchema.statics.findOverlappingAvailability = async function(userIds, startDate, endDate) {
  const availabilities = await this.find({
    userId: { $in: userIds },
    type: 'available',
    startTime: { $lt: endDate },
    endTime: { $gt: startDate },
    isVisible: true
  }).populate('userId', 'username profile.displayName profile.timezone');

  // Group by user and find overlaps
  const userAvailabilities = {};
  availabilities.forEach(avail => {
    const userId = avail.userId._id.toString();
    if (!userAvailabilities[userId]) {
      userAvailabilities[userId] = [];
    }
    userAvailabilities[userId].push(avail);
  });

  return userAvailabilities;
};

module.exports = mongoose.model('Availability', availabilitySchema);
