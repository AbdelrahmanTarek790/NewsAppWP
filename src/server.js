const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Import app
const app = require('./app');

// Import scheduler
const { initScheduler } = require('./utils/scheduler');
const { initTrendingUpdates } = require('./jobs/updateTrending');

// Connect to MongoDB
const DB = process.env.MONGODB_URI;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName : process.env.DB_NAME,
    
  })
  .then(() => {
    console.log('DB connection successful!');
    
    // Initialize scheduled jobs after successful DB connection
    initScheduler();
    initTrendingUpdates();
  });

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// For graceful shutdown in case of SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('💥 Process terminated!');
    });
  });
});