const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A post must have a title'],
    trim: true,
    maxlength: [100, 'A post title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'A post must have content']
  },
  excerpt: {
    type: String,
    maxlength: [200, 'An excerpt cannot be more than 200 characters']
  },
  featuredImage: {
    type: mongoose.Schema.ObjectId,
    ref: 'Media'
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A post must have an author']
  },
  categories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  }],
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  scheduledFor: Date,
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  readTime: Number,
  viewCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  metadata: {
    seoTitle: String,
    seoDescription: String,
    keywords: [String],
    canonical: String
  },
  revisions: [{
    content: String,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
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
postSchema.index({ slug: 1 });
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ status: 1, scheduledFor: 1 });
postSchema.index({ author: 1 });
postSchema.index({ categories: 1 });
postSchema.index({ featured: 1 });
postSchema.index({ trending: 1 });
postSchema.index({ viewCount: -1 });

// VIRTUAL POPULATE
postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
postSchema.pre('save', function(next) {
  // Generate slug from title
  if (this.isNew || this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true }) + 
      '-' + 
      Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
      .substring(0, 197) + '...';
  }

  // Calculate read time (average reading speed: 200 words per minute)
  if (this.content) {
    const wordCount = this.content
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
      .split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  // Store revision on update
  if (!this.isNew && this.isModified('content')) {
    if (!this.revisions) this.revisions = [];
    this.revisions.push({
      content: this.content,
      updatedAt: Date.now(),
      updatedBy: this.updatedBy // This should be set before saving
    });
  }

  // Update status based on scheduling
  if (
    this.status === 'scheduled' && 
    this.scheduledFor && 
    this.scheduledFor <= new Date()
  ) {
    this.status = 'published';
    this.publishedAt = this.scheduledFor;
    this.scheduledFor = undefined;
  }

  // Set publishedAt date if publishing
  if (
    this.status === 'published' && 
    (!this.publishedAt || this.isModified('status'))
  ) {
    this.publishedAt = Date.now();
  }

  next();
});

// Set updatedAt on update
postSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// QUERY MIDDLEWARE
postSchema.pre(/^find/, function(next) {
  // Populate references
  this.populate({
    path: 'author',
    select: 'name username photo'
  }).populate({
    path: 'categories',
    select: 'name slug'
  }).populate({
    path: 'featuredImage',
    select: 'url alt'
  });

  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;