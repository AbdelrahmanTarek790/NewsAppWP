const cron = require('node-cron');
const mongoose = require('mongoose');
const Distribution = require('../models/distributionModel');
const logger = require('./logger');

// Handle distribution of a specific item
const processDistribution = async (distribution) => {
  try {
    logger.info(`Processing scheduled distribution: ${distribution._id}`, {
      title: distribution.title,
      channel: distribution.channel
    });
    
    // Update distribution status
    distribution.status = 'sent';
    distribution.lastSentAt = new Date();
    await distribution.save();
    
    // Create a new distribution if this is recurring
    if (
      distribution.recurrence && 
      distribution.recurrence.pattern !== 'none' && 
      (!distribution.recurrence.endDate || new Date(distribution.recurrence.endDate) > new Date())
    ) {
      // Calculate next date based on recurrence pattern
      const nextDate = new Date(distribution.scheduledFor);
      const interval = distribution.recurrence.interval || 1;
      
      switch (distribution.recurrence.pattern) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + interval);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + (7 * interval));
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + interval);
          break;
      }
      
      // Create new distribution
      const newDistribution = new Distribution({
        title: distribution.title,
        content: distribution.content,
        channel: distribution.channel,
        scheduledFor: nextDate,
        status: 'scheduled',
        message: distribution.message,
        mediaAttachments: distribution.mediaAttachments,
        recurrence: distribution.recurrence,
        createdBy: distribution.createdBy
      });
      
      await newDistribution.save();
      
      logger.info(`Created recurring distribution: ${newDistribution._id}`, {
        title: newDistribution.title,
        scheduledFor: newDistribution.scheduledFor
      });
    }
    
    return true;
  } catch (error) {
    logger.error(`Error processing distribution: ${distribution._id}`, { error });
    
    try {
      // Update status to failed
      distribution.status = 'failed';
      await distribution.save();
    } catch (err) {
      logger.error(`Error updating distribution status: ${distribution._id}`, { error: err });
    }
    
    return false;
  }
};

// Check for distributions that need to be sent
const checkScheduledDistributions = async () => {
  try {
    const now = new Date();
    
    // Find distributions that are scheduled and due
    const distributions = await Distribution.find({
      status: 'scheduled',
      scheduledFor: { $lte: now }
    });
    
    logger.info(`Found ${distributions.length} distributions to process`);
    
    // Process each distribution
    for (const distribution of distributions) {
      await processDistribution(distribution);
    }
  } catch (error) {
    logger.error('Error checking scheduled distributions', { error });
  }
};

// Initialize the scheduler
const initScheduler = () => {
  // Check for distributions every minute
  cron.schedule('* * * * *', checkScheduledDistributions);
  
  logger.info('Distribution scheduler initialized');
};

module.exports = {
  initScheduler,
  processDistribution
};