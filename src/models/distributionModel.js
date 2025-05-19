const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A distribution must have a title'],
    trim: true,
    maxlength: [100, 'A distribution title cannot be more than 100 characters']
  },
  content: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: [true, 'A distribution must reference content']
  },
  channel: {
    type: String,
    enum: ['social-twitter', 'social-facebook', 'social-linkedin', 'social-instagram', 'email-newsletter', 'push-notification'],
    required: [true, 'A distribution must have a channel']
  },
  scheduledFor: {
    type: Date,
    required: [true, 'A distribution must have a scheduled time']
  },
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  message: {
    type: String,
    maxlength: [500, 'A distribution message cannot be more than 500 characters']
  },
  mediaAttachments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Media'
  }],
  recurrence: {
    pattern: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date
  },
  metrics: {
    opens: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  metadata: {
    customFields: mongoose.Schema.Types.Mixed
  },
  lastSentAt: Date,
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A distribution must have a creator']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// INDEXES
distributionSchema.index({ content: 1 });
distributionSchema.index({ channel: 1 });
distributionSchema.index({ scheduledFor: 1 });
distributionSchema.index({ status: 1 });
distributionSchema.index({ 'recurrence.pattern': 1 });
distributionSchema.index({ createdBy: 1 });

// QUERY MIDDLEWARE
distributionSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'content',
    select: 'title slug excerpt featuredImage'
  }).populate({
    path: 'createdBy',
    select: 'name username'
  }).populate({
    path: 'mediaAttachments',
    select: 'url alt'
  });
  next();
});

// Set updatedAt on update
distributionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Distribution = mongoose.model('Distribution', distributionSchema);

module.exports = Distribution;