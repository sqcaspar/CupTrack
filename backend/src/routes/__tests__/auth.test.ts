// Mock Supabase client first
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

// Mock auth service
jest.mock('../../services/auth', () => ({
  generateAuthTokens: jest.fn(),
  validateOAuthCallback: jest.fn(),
  refreshTokens: jest.fn(),
  revokeTokens: jest.fn()
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true))
}));

import request from 'supertest';
import express from 'express';
import authRoutes from '../auth';
import * as authService from '../../services/auth';

// Create test app
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Authentication Endpoints (TDD)', () => {
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

  describe('POST /auth/register (TDD Cycle 1)', () => {
    test('should register user with email and password', async () => {
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      };

      (authService.generateAuthTokens as jest.Mock).mockResolvedValue(mockTokens);

      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'User registered successfully',
        user: {
          id: expect.any(String),
          email: userData.email,
          provider: 'email'
        },
        tokens: mockTokens
      });

      expect(authService.generateAuthTokens).toHaveBeenCalledWith({
        id: expect.any(String),
        email: userData.email,
        provider: 'email'
      });
    });

    test('should validate required fields for registration', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidData)
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Validation failed');
      expect(authService.generateAuthTokens).not.toHaveBeenCalled();
    });

    test('should handle password confirmation mismatch', async () => {
      const mismatchData = {
        email: 'user@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(mismatchData)
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body.details).toContain('Passwords do not match');
    });

    test('should handle registration errors', async () => {
      (authService.generateAuthTokens as jest.Mock).mockRejectedValue(
        new Error('Email already exists')
      );

      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(409)
        .expect('Content-Type', /json/);

      expect(response.body.error).toContain('Email already exists');
    });
  });

  describe('POST /auth/login (TDD Cycle 2)', () => {
    test('should login user with valid credentials', async () => {
      // Mock successful user lookup
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: { 
                  id: 'user-123', 
                  email: 'user@example.com', 
                  password_hash: 'hashed-password',
                  auth_provider: 'email'
                }, 
                error: null 
              })
            })
          })
        })
      });
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      };

      (authService.generateAuthTokens as jest.Mock).mockResolvedValue(mockTokens);

      const loginData = {
        email: 'user@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'Login successful',
        user: {
          id: expect.any(String),
          email: loginData.email,
          provider: 'email'
        },
        tokens: mockTokens
      });
    });

    test('should reject invalid credentials', async () => {
      // Mock successful user lookup but failed password comparison
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: { 
                  id: 'user-123', 
                  email: 'user@example.com', 
                  password_hash: 'hashed-password',
                  auth_provider: 'email'
                }, 
                error: null 
              })
            })
          })
        })
      });
      
      // Mock bcrypt to return false for invalid password
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(false);
      const invalidCredentials = {
        email: 'user@example.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidCredentials)
        .expect(401)
        .expect('Content-Type', /json/);

      expect(response.body.error).toBe('Invalid email or password');
      expect(authService.generateAuthTokens).not.toHaveBeenCalled();
    });

    test('should validate login fields', async () => {
      const invalidData = {
        email: '',
        password: ''
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidData)
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body.error).toContain('Email and password are required');
    });
  });

  describe('POST /auth/oauth/google (TDD Cycle 3)', () => {
    test('should handle Google OAuth callback', async () => {
      const mockAuthResult = {
        success: true,
        user: {
          id: 'google-user-123',
          email: 'google@example.com',
          provider: 'google' as const
        },
        tokens: {
          accessToken: 'google-access-token',
          refreshToken: 'google-refresh-token',
          expiresIn: 3600
        }
      };

      (authService.validateOAuthCallback as jest.Mock).mockResolvedValue(mockAuthResult);

      const oauthData = {
        code: 'google-auth-code',
        state: 'secure-csrf-token',
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const response = await request(app)
        .post('/auth/oauth/google')
        .send(oauthData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'Google OAuth successful',
        user: mockAuthResult.user,
        tokens: mockAuthResult.tokens
      });

      expect(authService.validateOAuthCallback).toHaveBeenCalledWith({
        provider: 'google',
        code: oauthData.code,
        state: oauthData.state,
        redirectUri: oauthData.redirectUri
      });
    });

    test('should handle Google OAuth failures', async () => {
      const mockAuthResult = {
        success: false,
        error: 'Invalid authorization code'
      };

      (authService.validateOAuthCallback as jest.Mock).mockResolvedValue(mockAuthResult);

      const oauthData = {
        code: 'invalid-code',
        state: 'csrf-token',
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const response = await request(app)
        .post('/auth/oauth/google')
        .send(oauthData)
        .expect(401)
        .expect('Content-Type', /json/);

      expect(response.body.error).toBe('Invalid authorization code');
    });
  });

  describe('POST /auth/oauth/apple (TDD Cycle 4)', () => {
    test('should handle Apple OAuth callback', async () => {
      const mockAuthResult = {
        success: true,
        user: {
          id: 'apple-user-456',
          email: 'apple@example.com',
          provider: 'apple' as const
        },
        tokens: {
          accessToken: 'apple-access-token',
          refreshToken: 'apple-refresh-token',
          expiresIn: 3600
        }
      };

      (authService.validateOAuthCallback as jest.Mock).mockResolvedValue(mockAuthResult);

      const oauthData = {
        code: 'apple-auth-code',
        state: 'apple-csrf-token',
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const response = await request(app)
        .post('/auth/oauth/apple')
        .send(oauthData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'Apple OAuth successful',
        user: mockAuthResult.user,
        tokens: mockAuthResult.tokens
      });

      expect(authService.validateOAuthCallback).toHaveBeenCalledWith({
        provider: 'apple',
        code: oauthData.code,
        state: oauthData.state,
        redirectUri: oauthData.redirectUri
      });
    });
  });

  describe('POST /auth/refresh (TDD Cycle 5)', () => {
    test('should refresh tokens with valid refresh token', async () => {
      const mockRefreshResult = {
        success: true,
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600
        }
      };

      (authService.refreshTokens as jest.Mock).mockResolvedValue(mockRefreshResult);

      const refreshData = {
        refreshToken: 'a'.repeat(128) // Valid 128-char hex string
      };

      const response = await request(app)
        .post('/auth/refresh')
        .send(refreshData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'Tokens refreshed successfully',
        tokens: mockRefreshResult.tokens
      });

      expect(authService.refreshTokens).toHaveBeenCalledWith(refreshData.refreshToken);
    });

    test('should handle invalid refresh tokens', async () => {
      const mockRefreshResult = {
        success: false,
        error: 'Invalid refresh token format'
      };

      (authService.refreshTokens as jest.Mock).mockResolvedValue(mockRefreshResult);

      const refreshData = {
        refreshToken: 'invalid-short-token'
      };

      const response = await request(app)
        .post('/auth/refresh')
        .send(refreshData)
        .expect(401)
        .expect('Content-Type', /json/);

      expect(response.body.error).toBe('Invalid refresh token format');
    });
  });

  describe('POST /auth/logout (TDD Cycle 6)', () => {
    test('should logout user and revoke tokens', async () => {
      const mockRevokeResult = {
        success: true,
        message: 'Tokens revoked successfully'
      };

      (authService.revokeTokens as jest.Mock).mockResolvedValue(mockRevokeResult);

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'Logout successful'
      });

      expect(authService.revokeTokens).toHaveBeenCalledWith('valid-access-token');
    });

    test('should handle logout without token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(401)
        .expect('Content-Type', /json/);

      expect(response.body.error).toContain('No token provided');
      expect(authService.revokeTokens).not.toHaveBeenCalled();
    });

    test('should handle token revocation errors', async () => {
      const mockRevokeResult = {
        success: false,
        error: 'Invalid session'
      };

      (authService.revokeTokens as jest.Mock).mockResolvedValue(mockRevokeResult);

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect('Content-Type', /json/);

      expect(response.body.error).toBe('Invalid session');
    });
  });
});