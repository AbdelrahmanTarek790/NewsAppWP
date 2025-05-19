const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'A comment must have content'],
    trim: true,
    maxlength: [1000, 'A comment cannot be more than 1000 characters']
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: [true, 'A comment must belong to a post']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A comment must belong to a user']
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  dislikes: {
    type: Number,
    default: 0
  },
  dislikedBy: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
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
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ parent: 1 });
commentSchema.index({ status: 1 });

// VIRTUAL POPULATE
commentSchema.virtual('replies', {
  ref: 'Comment',
  foreignField: 'parent',
  localField: '_id'
});

// QUERY MIDDLEWARE
commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name username photo'
  });
  next();
});

// Set updatedAt on update
commentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// STATICS
commentSchema.statics.calcCommentCount = async function(postId) {
  const stats = await this.aggregate([
    {
      $match: { post: postId, status: 'approved' }
    },
    {
      $group: {
        _id: '$post',
        nComments: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Post').findByIdAndUpdate(postId, {
      commentCount: stats[0].nComments
    });
  } else {
    await mongoose.model('Post').findByIdAndUpdate(postId, {
      commentCount: 0
    });
  }
};

commentSchema.post('save', function() {
  this.constructor.calcCommentCount(this.post);
});

commentSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) await doc.constructor.calcCommentCount(doc.post);
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;