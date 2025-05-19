const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/userModel');
const mongoose = require('mongoose');

// Connect to test database before running tests
beforeAll(async () => {
  const testDB = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/news-press-api-test';
  await mongoose.connect(testDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Clear test database between tests
beforeEach(async () => {
  await User.deleteMany({});
});

// Disconnect from test database after tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication', () => {
  describe('User Registration', () => {
    test('Should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        passwordConfirm: 'password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
      
      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('name', userData.name);
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body.data.user).toHaveProperty('username', userData.username);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('token');
    });
    
    test('Should not register a user with an existing email', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'password123',
        passwordConfirm: 'password123'
      });
      
      // Try to register with the same email
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        username: 'testuser',
        password: 'password123',
        passwordConfirm: 'password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
    });
    
    test('Should not register a user with mismatched passwords', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        passwordConfirm: 'password456'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
    });
  });
  
  describe('User Login', () => {
    test('Should login a user with correct credentials', async () => {
      // Create a user first
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        passwordConfirm: 'password123'
      });
      
      // Login with credentials
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('name', 'Test User');
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('token');
    });
    
    test('Should not login a user with incorrect password', async () => {
      // Create a user first
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        passwordConfirm: 'password123'
      });
      
      // Try to login with wrong password
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe('fail');
    });
    
    test('Should not login a user that does not exist', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);
      
      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe('fail');
    });
  });
});