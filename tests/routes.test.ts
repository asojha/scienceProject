import request from 'supertest';
import express from 'express';
import routes from '../src/routes';

const app = express();
app.use(express.json());
app.use('/api', routes);

describe('API Routes', () => {
  const testSessionId = 'test-session-api';

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('UP');
    });
  });

  describe('GET /api/categories', () => {
    it('should return list of categories', async () => {
      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return categories with correct structure', async () => {
      const response = await request(app).get('/api/categories');
      const category = response.body.data[0];

      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('emoji');
      expect(category).toHaveProperty('description');
    });
  });

  describe('GET /api/question', () => {
    it('should return a question', async () => {
      const response = await request(app)
        .get('/api/question')
        .query({ sessionId: testSessionId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('question');
      expect(response.body.data).toHaveProperty('options');
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/question')
        .query({ sessionId: testSessionId, category: 'space' });

      expect(response.status).toBe(200);
      expect(response.body.data.category).toBe('space');
    });

    it('should use default session if not provided', async () => {
      const response = await request(app).get('/api/question');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/answer', () => {
    it('should accept an answer and return result', async () => {
      // First get a question
      const questionResponse = await request(app)
        .get('/api/question')
        .query({ sessionId: testSessionId });

      const questionId = questionResponse.body.data.id;

      // Submit answer
      const response = await request(app)
        .post('/api/answer')
        .query({
          sessionId: testSessionId,
          questionId,
          answerIndex: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('correct');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('funFact');
      expect(response.body.data).toHaveProperty('correctAnswer');
    });

    it('should return error for missing questionId', async () => {
      const response = await request(app)
        .post('/api/answer')
        .query({ sessionId: testSessionId, answerIndex: 0 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for missing answerIndex', async () => {
      const response = await request(app)
        .post('/api/answer')
        .query({ sessionId: testSessionId, questionId: 'q1' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/score', () => {
    it('should return score data', async () => {
      const response = await request(app)
        .get('/api/score')
        .query({ sessionId: testSessionId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('score');
      expect(response.body.data).toHaveProperty('streak');
      expect(response.body.data).toHaveProperty('accuracy');
    });

    it('should return zero for new session', async () => {
      const response = await request(app)
        .get('/api/score')
        .query({ sessionId: 'brand-new-session' });

      expect(response.status).toBe(200);
      expect(response.body.data.score).toBe(0);
      expect(response.body.data.streak).toBe(0);
    });
  });

  describe('POST /api/reset', () => {
    it('should reset session successfully', async () => {
      const response = await request(app)
        .post('/api/reset')
        .query({ sessionId: testSessionId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset');
    });

    it('should clear score after reset', async () => {
      // Answer a question first
      const questionResponse = await request(app)
        .get('/api/question')
        .query({ sessionId: 'reset-test-session' });

      await request(app)
        .post('/api/answer')
        .query({
          sessionId: 'reset-test-session',
          questionId: questionResponse.body.data.id,
          answerIndex: 0,
        });

      // Reset
      await request(app)
        .post('/api/reset')
        .query({ sessionId: 'reset-test-session' });

      // Check score is zero
      const scoreResponse = await request(app)
        .get('/api/score')
        .query({ sessionId: 'reset-test-session' });

      expect(scoreResponse.body.data.score).toBe(0);
      expect(scoreResponse.body.data.totalAnswered).toBe(0);
    });
  });

  describe('GET /api/count', () => {
    it('should return total question count', async () => {
      const response = await request(app).get('/api/count');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBeGreaterThan(0);
    });

    it('should return filtered count by category', async () => {
      const totalResponse = await request(app).get('/api/count');
      const spaceResponse = await request(app)
        .get('/api/count')
        .query({ category: 'space' });

      expect(spaceResponse.body.data.count).toBeLessThanOrEqual(
        totalResponse.body.data.count
      );
    });
  });
});
