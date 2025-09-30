const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscription: {
    endpoint: {
      type: String,
      required: true
    },
    keys: {
      p256dh: {
        type: String,
        required: true
      },
      auth: {
        type: String,
        required: true
      }
    }
  },
  userAgent: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  lastError: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
pushSubscriptionSchema.index({ userId: 1, isActive: 1 });
pushSubscriptionSchema.index({ 'subscription.endpoint': 1 }, { unique: true });

// Static method to find active subscriptions for a user
pushSubscriptionSchema.statics.findActiveByUserId = function(userId) {
  return this.find({ userId: userId, isActive: true });
};

// Static method to deactivate subscription by endpoint
pushSubscriptionSchema.statics.deactivateByEndpoint = function(endpoint) {
  return this.findOneAndUpdate(
    { 'subscription.endpoint': endpoint },
    { isActive: false, lastError: 'Subscription no longer valid' }
  );
};

// Update lastUsed when subscription is used successfully
pushSubscriptionSchema.methods.markAsUsed = function() {
  this.lastUsed = new Date();
  this.lastError = null;
  return this.save();
};

// Mark subscription as failed
pushSubscriptionSchema.methods.markAsFailed = function(error) {
  this.lastError = error;
  if (error && (error.includes('410') || error.includes('404'))) {
    this.isActive = false;
  }
  return this.save();
};

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);