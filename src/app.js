const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const commentRoutes = require('./routes/commentRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const importRoutes = require('./routes/importRoutes');
const distributionRoutes = require('./routes/distributionRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Initialize express app
const app = express();

// GLOBAL MIDDLEWARES
// Enable CORS
app.use(cors());
app.options('*', cors());

// Serving static files
app.use(express.static('public'));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  max: process.env.RATE_LIMIT_MAX || 100,
  windowMs: (process.env.RATE_LIMIT_WINDOW_MS || 15) * 60 * 1000,
  message: 'Too many requests from this IP, please try again later!'
});
app.use('/api', limiter);

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
    'trending'
  ]
}));

// Compression middleware
app.use(compression());

// API VERSION PREFIX
const API_PREFIX = process.env.API_PREFIX || '/api';
const API_VERSION = process.env.API_VERSION || 'v1';
const BASE_PATH = `${API_PREFIX}/${API_VERSION}`;

// ROUTES
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/users`, userRoutes);
app.use(`${BASE_PATH}/posts`, postRoutes);
app.use(`${BASE_PATH}/categories`, categoryRoutes);
app.use(`${BASE_PATH}/comments`, commentRoutes);
app.use(`${BASE_PATH}/media`, mediaRoutes);
app.use(`${BASE_PATH}/import/wordpress`, importRoutes);
app.use(`${BASE_PATH}/distribution`, distributionRoutes);
app.use(`${BASE_PATH}/search`, searchRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to NewsPress API',
    version: API_VERSION,
    documentation: '/api-docs'
  });
});

// Handle non-existent routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;