const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

// Template processing function
const processTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    let template = await fs.readFile(templatePath, 'utf8');
    
    // Replace placeholders in template
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, data[key]);
    });
    
    return template;
  } catch (error) {
    logger.error('Error processing email template', { error });
    throw error;
  }
};

// Create a transport for sending email
const createTransport = () => {
  if (process.env.NODE_ENV === 'development') {
    // In development, use a testing service or log to console
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // In production, use configured email service
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send email using NodeMailer
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Plain text message
 * @param {String} options.template - Template name (optional)
 * @param {Object} options.templateData - Data for template (optional)
 */
const sendEmail = async options => {
  try {
    const transport = createTransport();
    
    // Email configuration
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: options.email,
      subject: options.subject,
      text: options.message || ''
    };
    
    // If template is provided, use it for HTML
    if (options.template && options.templateData) {
      const html = await processTemplate(options.template, options.templateData);
      mailOptions.html = html;
    }
    
    // Send email
    const info = await transport.sendMail(mailOptions);
    logger.info('Email sent successfully', { messageId: info.messageId });
    
    return info;
  } catch (error) {
    logger.error('Error sending email', { error });
    throw error;
  }
};

module.exports = sendEmail;