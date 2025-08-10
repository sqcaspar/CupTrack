// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'User not found' } }))
        })),
        single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'User not found' } }))
      }))
    })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null }))
  }))
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true))
}));

import request from 'supertest';
import app from '../index';

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default mock behavior
    (mockSupabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'User not found' } })
          }),
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'User not found' } })
        })
      }),
      insert: jest.fn().mockResolvedValue({ data: [], error: null })
    });
  });

  describe('Authentication Endpoints Integration', () => {
    test('POST /api/v1/auth/register should work with full stack', async () => {
      const userData = {
        email: 'integration@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    test('POST /api/v1/auth/login should work with full stack', async () => {
      // Mock successful user lookup
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: { 
                  id: 'user-123', 
                  email: 'integration@test.com', 
                  password_hash: 'hashed-password',
                  auth_provider: 'email'
                }, 
                error: null 
              })
            })
          })
        })
      });

      const loginData = {
        email: 'integration@test.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(loginData.email);
    });

    test('POST /api/v1/auth/oauth/google should work with full stack', async () => {
      const oauthData = {
        code: 'google-auth-code',
        state: 'secure-csrf-token',
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const response = await request(app)
        .post('/api/v1/auth/oauth/google')
        .send(oauthData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('message', 'Google OAuth successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
    });

    test('POST /api/v1/auth/refresh should work with full stack', async () => {
      const refreshData = {
        refreshToken: 'a'.repeat(128) // Valid 128-char hex token
      };

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send(refreshData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('message', 'Tokens refreshed successfully');
      expect(response.body).toHaveProperty('tokens');
    });

    test('POST /api/v1/auth/logout should work with full stack', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('message', 'Logout successful');
    });
  });

  describe('Endpoint Authentication Requirements', () => {
    test('GET /api/v1/brews should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/brews')
        .expect(401)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/v1/brews should work with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/brews')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(501) // Not implemented yet, but authentication should pass
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Security Headers and Middleware', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    test('should handle CORS properly', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
    });

    test('should handle rate limiting gracefully', async () => {
      // Make multiple requests quickly
      const promises = Array.from({ length: 5 }, () => 
        request(app).get('/api/v1/health')
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed within rate limit
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});