const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A category must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A category name cannot be more than 40 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, 'A category description cannot be more than 500 characters']
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    default: null
  },
  image: {
    type: mongoose.Schema.ObjectId,
    ref: 'Media'
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  metadata: {
    seoTitle: String,
    seoDescription: String
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
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ featured: 1 });
categorySchema.index({ order: 1 });

// VIRTUAL POPULATE
categorySchema.virtual('posts', {
  ref: 'Post',
  foreignField: 'categories',
  localField: '_id'
});

categorySchema.virtual('subcategories', {
  ref: 'Category',
  foreignField: 'parent',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
categorySchema.pre('save', function(next) {
  // Generate slug from name
  if (this.isNew || this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Set updatedAt on update
categorySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// QUERY MIDDLEWARE
categorySchema.pre(/^find/, function(next) {
  // Populate parent category and image
  this.populate({
    path: 'parent',
    select: 'name slug'
  }).populate({
    path: 'image',
    select: 'url alt'
  });
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;