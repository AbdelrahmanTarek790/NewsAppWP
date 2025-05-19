const cron = require('node-cron');
const Post = require('../models/postModel');
const logger = require('../utils/logger');

// Update trending posts based on views, comments and likes
const updateTrendingPosts = async () => {
  try {
    // Calculate a trending score based on recent activity
    // First, get all published posts from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const posts = await Post.find({
      status: 'published',
      publishedAt: { $gte: thirtyDaysAgo }
    }).populate({
      path: 'comments',
      match: { createdAt: { $gte: thirtyDaysAgo } }
    });
    
    // Calculate trending score for each post
    const scoredPosts = posts.map(post => {
      // Simple trending algorithm: 
      // 1 point per view, 5 points per comment, 3 points per like
      // Weighted by recency (newer gets more weight)
      
      const daysSincePublished = Math.max(1, Math.floor(
        (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      ));
      
      const recencyFactor = 1 / Math.sqrt(daysSincePublished);
      
      const viewScore = post.viewCount || 0;
      const commentScore = (post.comments?.length || 0) * 5;
      const likeScore = (post.likes || 0) * 3;
      
      const trendingScore = (viewScore + commentScore + likeScore) * recencyFactor;
      
      return {
        postId: post._id,
        score: trendingScore
      };
    });
    
    // Sort by score
    scoredPosts.sort((a, b) => b.score - a.score);
    
    // Get top 20 posts
    const trendingPostIds = scoredPosts.slice(0, 20).map(post => post.postId);
    
    // First, reset all trending flags
    await Post.updateMany(
      { trending: true },
      { $set: { trending: false } }
    );
    
    // Then set trending flag for top posts
    await Post.updateMany(
      { _id: { $in: trendingPostIds } },
      { $set: { trending: true } }
    );
    
    logger.info(`Updated trending posts: ${trendingPostIds.length} posts marked as trending`);
  } catch (error) {
    logger.error('Error updating trending posts', { error });
  }
};

// Initialize the trending update job
const initTrendingUpdates = () => {
  // Update trending posts once per hour
  cron.schedule('0 * * * *', updateTrendingPosts);
  
  logger.info('Trending posts update job initialized');
};

module.exports = {
  updateTrendingPosts,
  initTrendingUpdates
};