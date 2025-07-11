const request = require('supertest');
const app = require('../src/app');

describe('Search API Integration', () => {
  describe('GET /api/v1/search', () => {
    it('should return search results when query is provided', async () => {
      const response = await request(app)
        .get('/api/v1/search')
        .query({ q: 'test' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data.results).toHaveProperty('posts');
      expect(response.body.data.results).toHaveProperty('categories');
      expect(response.body.data.results).toHaveProperty('users');
    });

    it('should return 400 when no query is provided', async () => {
      const response = await request(app)
        .get('/api/v1/search')
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/search/suggest', () => {
    it('should return suggestions when query is provided', async () => {
      const response = await request(app)
        .get('/api/v1/search/suggest')
        .query({ q: 'test' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('suggestions');
      expect(response.body.data.suggestions).toHaveProperty('posts');
      expect(response.body.data.suggestions).toHaveProperty('categories');
      expect(response.body.data.suggestions).toHaveProperty('tags');
    });

    it('should return 400 when no query is provided', async () => {
      const response = await request(app)
        .get('/api/v1/search/suggest')
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/v1/search/advanced', () => {
    it('should return advanced search results', async () => {
      const response = await request(app)
        .get('/api/v1/search/advanced')
        .query({ q: 'test' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveProperty('posts');
    });

    it('should work without query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/search/advanced')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('posts');
    });
  });
});