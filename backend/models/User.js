const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  emailVerification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    },
    verificationTokenExpires: {
      type: Date,
      default: null
    }
  },
  profile: {
    displayName: {
      type: String,
      default: function() { return this.username; }
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    preferredGames: [{
      type: String,
      trim: true
    }],
    platforms: [{
      type: String,
      enum: ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile', 'VR'],
      default: []
    }],
    timezone: {
      type: String,
      default: 'UTC'
    },
    region: {
      type: String,
      default: ''
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  calendarIntegration: {
    googleCalendar: {
      connected: { type: Boolean, default: false },
      accessToken: { type: String, default: '' },
      refreshToken: { type: String, default: '' },
      calendarIds: [{ type: String }]
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for username lookup (profile URLs)
userSchema.index({ username: 1 });
userSchema.index({ 'profile.isPublic': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile data
userSchema.methods.getPublicProfile = function() {
  return {
    username: this.username,
    profile: {
      displayName: this.profile.displayName,
      bio: this.profile.bio,
      avatar: this.profile.avatar,
      preferredGames: this.profile.preferredGames,
      platforms: this.profile.platforms,
      timezone: this.profile.timezone,
      region: this.profile.region
    },
    lastActive: this.lastActive
  };
};

module.exports = mongoose.model('User', userSchema);
