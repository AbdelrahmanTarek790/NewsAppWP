const fs = require('fs');
const path = require('path');
const { parseString } = require('xml2js');
const mongoose = require('mongoose');
const https = require('https');
const sharp = require('sharp');
const slugify = require('slugify');
const logger = require('./logger');

// Import models
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const Media = require('../models/mediaModel');

// Create a class to handle WordPress import
class WordPressImport {
  constructor(xmlFilePath, options = {}) {
    this.xmlFilePath = xmlFilePath;
    this.options = {
      importUsers: true,
      importCategories: true,
      importTags: true,
      importPosts: true,
      importPages: true,
      importComments: true,
      importMedia: true,
      ...options
    };
    this.parsedData = null;
    this.stats = {
      users: { total: 0, imported: 0, skipped: 0, failed: 0 },
      categories: { total: 0, imported: 0, skipped: 0, failed: 0 },
      tags: { total: 0, imported: 0, skipped: 0, failed: 0 },
      posts: { total: 0, imported: 0, skipped: 0, failed: 0 },
      pages: { total: 0, imported: 0, skipped: 0, failed: 0 },
      comments: { total: 0, imported: 0, skipped: 0, failed: 0 },
      media: { total: 0, imported: 0, skipped: 0, failed: 0 }
    };
    this.mappings = {
      users: {}, // old ID -> new ID
      categories: {},
      tags: {},
      posts: {},
      pages: {},
      media: {}
    };
    this.mediaDir = path.join(process.env.FILE_UPLOAD_PATH || 'public/uploads', 'wp-import');
    this.defaultUserId = null; // Will be set before import
  }

  // Parse the WordPress XML file
  async parseXML() {
    try {
      const xmlData = await fs.promises.readFile(this.xmlFilePath, 'utf8');
      return new Promise((resolve, reject) => {
        parseString(xmlData, { explicitArray: false }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    } catch (error) {
      logger.error('Error parsing WordPress XML file', { error });
      throw error;
    }
  }

  // Extract content from CDATA
  extractContent(item) {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item._ || '';
  }

  // Process item metadata (wp:postmeta)
  processItemMeta(item) {
    const meta = {};
    if (!item.wp_postmeta) return meta;
    
    const metaItems = Array.isArray(item.wp_postmeta) 
      ? item.wp_postmeta 
      : [item.wp_postmeta];
    
    metaItems.forEach(metaItem => {
      const key = metaItem.wp_meta_key;
      const value = metaItem.wp_meta_value;
      if (key && value) {
        meta[key] = value;
      }
    });
    
    return meta;
  }

  // Download an image from a URL and save it locally
  async downloadImage(url, filename) {
    // Create media directory if it doesn't exist
    if (!fs.existsSync(this.mediaDir)) {
      await fs.promises.mkdir(this.mediaDir, { recursive: true });
    }
    
    const filePath = path.join(this.mediaDir, filename);
    
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      
      https.get(url, response => {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });
      }).on('error', error => {
        fs.unlink(filePath, () => {}); // Delete the file if there was an error
        reject(error);
      });
    });
  }

  // Process WordPress authors
  async processAuthors(authors) {
    if (!this.options.importUsers || !authors) return;
    
    const items = Array.isArray(authors.wp_author) 
      ? authors.wp_author 
      : [authors.wp_author];
    
    this.stats.users.total = items.length;
    
    for (const author of items) {
      try {
        const email = author.wp_author_email || `${author.wp_author_login}@imported.com`;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        
        if (user) {
          this.mappings.users[author.wp_author_id] = user._id;
          this.stats.users.skipped++;
          continue;
        }
        
        // Create new user
        user = await User.create({
          name: author.wp_author_display_name,
          email,
          username: author.wp_author_login,
          password: 'TemporaryPassword123', // This should be changed by the user
          passwordConfirm: 'TemporaryPassword123',
          role: 'author',
          bio: this.extractContent(author.wp_author_description),
          emailVerified: true
        });
        
        this.mappings.users[author.wp_author_id] = user._id;
        this.stats.users.imported++;
      } catch (error) {
        logger.error('Error importing WordPress author', { 
          author: author.wp_author_login,
          error
        });
        this.stats.users.failed++;
      }
    }
  }

  // Process WordPress categories
  async processCategories(channel) {
    if (!this.options.importCategories || !channel.wp_category) return;
    
    const items = Array.isArray(channel.wp_category) 
      ? channel.wp_category 
      : [channel.wp_category];
    
    this.stats.categories.total = items.length;
    
    for (const category of items) {
      try {
        const name = this.extractContent(category.wp_cat_name);
        const slug = slugify(name, { lower: true });
        
        // Check if category already exists
        let cat = await Category.findOne({ slug });
        
        if (cat) {
          this.mappings.categories[category.wp_category_nicename] = cat._id;
          this.stats.categories.skipped++;
          continue;
        }
        
        // Create new category
        cat = await Category.create({
          name,
          description: this.extractContent(category.wp_category_description)
        });
        
        this.mappings.categories[category.wp_category_nicename] = cat._id;
        this.stats.categories.imported++;
      } catch (error) {
        logger.error('Error importing WordPress category', { 
          category: category.wp_cat_name,
          error
        });
        this.stats.categories.failed++;
      }
    }
  }

  // Process WordPress tags
  async processTags(channel) {
    if (!this.options.importTags || !channel.wp_tag) return;
    
    const items = Array.isArray(channel.wp_tag) 
      ? channel.wp_tag 
      : [channel.wp_tag];
    
    this.stats.tags.total = items.length;
    
    // Store tags for later use with posts
    this.tags = {};
    
    for (const tag of items) {
      try {
        const name = this.extractContent(tag.wp_tag_name);
        this.tags[tag.wp_tag_slug] = name;
        this.stats.tags.imported++;
      } catch (error) {
        logger.error('Error processing WordPress tag', { 
          tag: tag.wp_tag_name,
          error
        });
        this.stats.tags.failed++;
      }
    }
  }

  // Process WordPress media
  async processMedia(items) {
    if (!this.options.importMedia) return;
    
    const mediaItems = items.filter(item => 
      item.wp_post_type === 'attachment' && 
      item.wp_attachment_url
    );
    
    this.stats.media.total = mediaItems.length;
    
    for (const item of mediaItems) {
      try {
        const url = item.wp_attachment_url;
        const filename = path.basename(url);
        const mimeType = item.wp_post_mime_type || 'image/jpeg';
        
        // Skip if not an image
        if (!mimeType.startsWith('image/')) {
          this.stats.media.skipped++;
          continue;
        }
        
        // Check if media already exists
        let media = await Media.findOne({ originalName: filename });
        
        if (media) {
          this.mappings.media[item.wp_post_id] = media._id;
          this.stats.media.skipped++;
          continue;
        }
        
        // Download the image
        const filePath = await this.downloadImage(url, filename);
        
        // Get file info
        const stats = await fs.promises.stat(filePath);
        
        // Process with sharp for thumbnails if it's an image
        let dimensions = {};
        let thumbnails = {};
        
        if (mimeType.startsWith('image/')) {
          try {
            const image = sharp(filePath);
            const metadata = await image.metadata();
            
            dimensions = {
              width: metadata.width,
              height: metadata.height
            };
            
            // Generate thumbnails
            const thumbnailSizes = {
              small: 300,
              medium: 600,
              large: 1200
            };
            
            for (const [size, width] of Object.entries(thumbnailSizes)) {
              const thumbnailFilename = `thumb_${size}_${filename}`;
              const thumbnailPath = path.join(this.mediaDir, thumbnailFilename);
              
              await image
                .resize({ width, withoutEnlargement: true })
                .toFile(thumbnailPath);
              
              thumbnails[size] = `/uploads/wp-import/${thumbnailFilename}`;
            }
          } catch (err) {
            logger.error('Error processing image with sharp', { 
              filename,
              error: err
            });
          }
        }
        
        // Create media record
        media = await Media.create({
          fileName: filename,
          originalName: filename,
          mimeType,
          size: stats.size,
          url: `/uploads/wp-import/${filename}`,
          alt: this.extractContent(item.title),
          title: this.extractContent(item.title),
          caption: this.extractContent(item.excerpt),
          description: this.extractContent(item.content),
          dimensions,
          thumbnails,
          uploadedBy: this.defaultUserId // Use default admin user
        });
        
        this.mappings.media[item.wp_post_id] = media._id;
        this.stats.media.imported++;
      } catch (error) {
        logger.error('Error importing WordPress media', { 
          media: item.title,
          error
        });
        this.stats.media.failed++;
      }
    }
  }

  // Process WordPress posts
  async processPosts(items) {
    if (!this.options.importPosts) return;
    
    const postItems = items.filter(item => item.wp_post_type === 'post');
    
    this.stats.posts.total = postItems.length;
    
    for (const item of postItems) {
      try {
        const title = this.extractContent(item.title);
        const slug = slugify(title, { lower: true }) + 
          '-' + Math.floor(1000 + Math.random() * 9000).toString();
        
        // Check if post already exists
        let post = await Post.findOne({ slug });
        
        if (post) {
          this.mappings.posts[item.wp_post_id] = post._id;
          this.stats.posts.skipped++;
          continue;
        }
        
        // Get categories
        const categories = [];
        if (item.category) {
          const cats = Array.isArray(item.category) ? item.category : [item.category];
          cats.forEach(cat => {
            if (cat.$ && cat.$.domain === 'category' && cat.$.nicename) {
              const categoryId = this.mappings.categories[cat.$.nicename];
              if (categoryId) categories.push(categoryId);
            }
          });
        }
        
        // Get tags
        const tags = [];
        if (item.category) {
          const tagItems = Array.isArray(item.category) ? item.category : [item.category];
          tagItems.forEach(tag => {
            if (tag.$ && tag.$.domain === 'post_tag' && tag.$.nicename) {
              const tagName = this.tags[tag.$.nicename];
              if (tagName) tags.push(tagName);
            }
          });
        }
        
        // Get author
        let authorId = this.defaultUserId;
        if (item.dc_creator && this.mappings.users[item.wp_creator]) {
          authorId = this.mappings.users[item.wp_creator];
        }
        
        // Get featured image
        let featuredImage = undefined;
        const postMeta = this.processItemMeta(item);
        if (postMeta._thumbnail_id && this.mappings.media[postMeta._thumbnail_id]) {
          featuredImage = this.mappings.media[postMeta._thumbnail_id];
        }
        
        // Create post
        const content = this.extractContent(item.content);
        const excerpt = this.extractContent(item.excerpt) || 
          content.substring(0, 197) + '...';
        
        // Determine status
        let status = 'published';
        switch (item.wp_status) {
          case 'draft':
            status = 'draft';
            break;
          case 'future':
            status = 'scheduled';
            break;
          case 'private':
          case 'publish':
            status = 'published';
            break;
          default:
            status = 'draft';
        }
        
        post = await Post.create({
          title,
          slug,
          content,
          excerpt,
          featuredImage,
          author: authorId,
          categories,
          tags,
          status,
          publishedAt: new Date(item.pubDate),
          createdAt: new Date(item.wp_post_date),
          updatedAt: new Date(item.wp_post_date_gmt)
        });
        
        this.mappings.posts[item.wp_post_id] = post._id;
        this.stats.posts.imported++;
      } catch (error) {
        logger.error('Error importing WordPress post', { 
          post: item.title,
          error
        });
        this.stats.posts.failed++;
      }
    }
  }

  // Process WordPress pages
  async processPages(items) {
    if (!this.options.importPages) return;
    
    const pageItems = items.filter(item => item.wp_post_type === 'page');
    
    this.stats.pages.total = pageItems.length;
    
    for (const item of pageItems) {
      try {
        const title = this.extractContent(item.title);
        const slug = slugify(title, { lower: true }) + 
          '-' + Math.floor(1000 + Math.random() * 9000).toString();
        
        // Pages are handled as posts with a category of "Page"
        let pageCategory = await Category.findOne({ name: 'Page' });
        
        if (!pageCategory) {
          pageCategory = await Category.create({
            name: 'Page',
            description: 'WordPress imported pages'
          });
        }
        
        // Check if page already exists
        let page = await Post.findOne({ slug });
        
        if (page) {
          this.mappings.pages[item.wp_post_id] = page._id;
          this.stats.pages.skipped++;
          continue;
        }
        
        // Get author
        let authorId = this.defaultUserId;
        if (item.dc_creator && this.mappings.users[item.wp_creator]) {
          authorId = this.mappings.users[item.wp_creator];
        }
        
        // Get featured image
        let featuredImage = undefined;
        const postMeta = this.processItemMeta(item);
        if (postMeta._thumbnail_id && this.mappings.media[postMeta._thumbnail_id]) {
          featuredImage = this.mappings.media[postMeta._thumbnail_id];
        }
        
        // Create page as post
        const content = this.extractContent(item.content);
        const excerpt = this.extractContent(item.excerpt) || 
          content.substring(0, 197) + '...';
        
        // Determine status
        let status = 'published';
        switch (item.wp_status) {
          case 'draft':
            status = 'draft';
            break;
          case 'future':
            status = 'scheduled';
            break;
          case 'private':
          case 'publish':
            status = 'published';
            break;
          default:
            status = 'draft';
        }
        
        page = await Post.create({
          title,
          slug,
          content,
          excerpt,
          featuredImage,
          author: authorId,
          categories: [pageCategory._id],
          tags: ['page', 'wordpress-import'],
          status,
          publishedAt: new Date(item.pubDate),
          createdAt: new Date(item.wp_post_date),
          updatedAt: new Date(item.wp_post_date_gmt)
        });
        
        this.mappings.pages[item.wp_post_id] = page._id;
        this.stats.pages.imported++;
      } catch (error) {
        logger.error('Error importing WordPress page', { 
          page: item.title,
          error
        });
        this.stats.pages.failed++;
      }
    }
  }

  // Process WordPress comments
  async processComments(items) {
    if (!this.options.importComments) return;
    
    // Get all comments
    const comments = [];
    
    items.forEach(item => {
      if (item.wp_comment) {
        const itemComments = Array.isArray(item.wp_comment) 
          ? item.wp_comment 
          : [item.wp_comment];
        
        itemComments.forEach(comment => {
          comment.post_id = item.wp_post_id;
          comments.push(comment);
        });
      }
    });
    
    this.stats.comments.total = comments.length;
    
    // Process comments
    for (const comment of comments) {
      try {
        // Skip if parent post doesn't exist in our mappings
        const postId = this.mappings.posts[comment.post_id] || this.mappings.pages[comment.post_id];
        if (!postId) {
          this.stats.comments.skipped++;
          continue;
        }
        
        // Create comment
        const newComment = await Comment.create({
          content: this.extractContent(comment.wp_comment_content),
          post: postId,
          user: this.defaultUserId, // Use default user for imported comments
          status: comment.wp_comment_approved === '1' ? 'approved' : 'pending',
          createdAt: new Date(comment.wp_comment_date),
          updatedAt: new Date(comment.wp_comment_date)
        });
        
        // Store mapping for parent/child comment relationships
        this.mappings.comments = this.mappings.comments || {};
        this.mappings.comments[comment.wp_comment_id] = newComment._id;
        
        this.stats.comments.imported++;
      } catch (error) {
        logger.error('Error importing WordPress comment', { error });
        this.stats.comments.failed++;
      }
    }
    
    // Process comment parent relationships
    for (const comment of comments) {
      if (
        comment.wp_comment_parent && 
        comment.wp_comment_parent !== '0' && 
        this.mappings.comments[comment.wp_comment_parent] && 
        this.mappings.comments[comment.wp_comment_id]
      ) {
        try {
          await Comment.findByIdAndUpdate(
            this.mappings.comments[comment.wp_comment_id],
            { parent: this.mappings.comments[comment.wp_comment_parent] }
          );
        } catch (error) {
          logger.error('Error setting comment parent relationship', { error });
        }
      }
    }
  }

  // Main import function
  async import(userId) {
    try {
      this.defaultUserId = userId;
      
      // Parse WordPress XML
      this.parsedData = await this.parseXML();
      
      const channel = this.parsedData.rss.channel;
      
      // Process elements in sequence
      await this.processAuthors(channel);
      await this.processCategories(channel);
      await this.processTags(channel);
      
      // Process items
      const items = Array.isArray(channel.item) ? channel.item : [channel.item];
      
      // First process media (needed for posts with featured images)
      await this.processMedia(items);
      
      // Then process posts and pages
      await this.processPosts(items);
      await this.processPages(items);
      
      // Finally process comments
      await this.processComments(items);
      
      return {
        status: 'success',
        stats: this.stats
      };
    } catch (error) {
      logger.error('WordPress import failed', { error });
      return {
        status: 'error',
        message: error.message,
        stats: this.stats
      };
    } finally {
      // Clean up the uploaded file
      try {
        await fs.promises.unlink(this.xmlFilePath);
      } catch (err) {
        logger.error('Error deleting WordPress XML file', { error: err });
      }
    }
  }

  // Get import preview (count items without importing)
  async getPreview() {
    try {
      // Parse WordPress XML
      this.parsedData = await this.parseXML();
      
      const channel = this.parsedData.rss.channel;
      
      // Count items
      const preview = {
        site: {
          title: channel.title,
          description: channel.description,
          link: channel.link
        },
        counts: {
          authors: channel.wp_author ? 
            (Array.isArray(channel.wp_author) ? channel.wp_author.length : 1) : 0,
          categories: channel.wp_category ? 
            (Array.isArray(channel.wp_category) ? channel.wp_category.length : 1) : 0,
          tags: channel.wp_tag ? 
            (Array.isArray(channel.wp_tag) ? channel.wp_tag.length : 1) : 0
        }
      };
      
      // Count items
      const items = Array.isArray(channel.item) ? channel.item : [channel.item];
      
      preview.counts.posts = items.filter(item => item.wp_post_type === 'post').length;
      preview.counts.pages = items.filter(item => item.wp_post_type === 'page').length;
      preview.counts.media = items.filter(item => 
        item.wp_post_type === 'attachment' && 
        item.wp_attachment_url
      ).length;
      
      // Count comments
      let commentCount = 0;
      items.forEach(item => {
        if (item.wp_comment) {
          const itemComments = Array.isArray(item.wp_comment) 
            ? item.wp_comment 
            : [item.wp_comment];
          commentCount += itemComments.length;
        }
      });
      preview.counts.comments = commentCount;
      
      return {
        status: 'success',
        preview
      };
    } catch (error) {
      logger.error('WordPress preview failed', { error });
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}

module.exports = WordPressImport;