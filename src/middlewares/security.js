const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

module.exports = (app) => {
  // Set security HTTP headers
  app.use(helmet());
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later!'
  });
  
  // Apply rate limiting to API routes
  app.use('/api', apiLimiter);
  
  // Higher rate limit for search routes
  const searchLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // Limit each IP to 50 requests per window
    message: 'Too many search requests from this IP, please try again later!'
  });
  
  app.use('/api/v1/search', searchLimiter);
  
  // Body parser, reading data from body into req.body
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  
  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());
  
  // Data sanitization against XSS
  app.use(xss());
  
  // Prevent parameter pollution
  app.use(hpp({
    whitelist: [
      'title',
      'content',
      'author',
      'category',
      'tags',
      'status',
      'featured',
      'trending',
      'sort'
    ]
  }));
  
  return app;
};