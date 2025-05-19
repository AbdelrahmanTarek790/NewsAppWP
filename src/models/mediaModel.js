const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, 'A media file must have a file name']
  },
  originalName: {
    type: String,
    required: [true, 'A media file must have an original name']
  },
  mimeType: {
    type: String,
    required: [true, 'A media file must have a mime type']
  },
  size: {
    type: Number,
    required: [true, 'A media file must have a size']
  },
  url: {
    type: String,
    required: [true, 'A media file must have a URL']
  },
  alt: {
    type: String,
    default: ''
  },
  title: String,
  caption: String,
  description: String,
  dimensions: {
    width: Number,
    height: Number
  },
  thumbnails: {
    small: String,
    medium: String,
    large: String
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A media file must have an uploader']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// INDEXES
mediaSchema.index({ fileName: 1 });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ mimeType: 1 });

// QUERY MIDDLEWARE
mediaSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'uploadedBy',
    select: 'name username'
  });
  next();
});

// Set updatedAt on update
mediaSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;