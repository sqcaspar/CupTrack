import { Request, Response, NextFunction } from 'express';
import { authenticateUser, validateSupabaseToken, extractUserFromToken } from '../auth';

// Mock Supabase client
const mockGetUser = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser
    }
  }))
}));

describe('Authentication Middleware (TDD)', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    } as Partial<Request>;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('JWT Token Validation (TDD Cycle 1)', () => {
    test('should accept valid Supabase JWT token', async () => {
      // Mock successful token validation
      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            role: 'authenticated'
          }
        },
        error: null
      });

      mockReq.headers = {
        authorization: 'Bearer valid-jwt-token'
      };

      await authenticateUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.id).toBe('user-123');
      expect(mockReq.user?.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should reject invalid JWT token', async () => {
      // Mock failed token validation
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      mockReq.headers = {
        authorization: 'Bearer invalid-token'
      };

      await authenticateUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject request without authorization header', async () => {
      mockReq.headers = {};

      await authenticateUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No valid authorization header'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject malformed authorization header', async () => {
      mockReq.headers = {
        authorization: 'InvalidFormat token'
      };

      await authenticateUser(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No valid authorization header'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('User Extraction (TDD Cycle 2)', () => {
    test('should extract user data from valid token', async () => {
      const validToken = 'valid-jwt-token';
      const expectedUser = {
        id: 'user-456',
        email: 'user@example.com',
        role: 'authenticated'
      };

      // Mock successful user extraction
      mockGetUser.mockResolvedValue({
        data: { user: expectedUser },
        error: null
      });

      const result = await extractUserFromToken(validToken);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(expectedUser);
      expect(result.error).toBeNull();
    });

    test('should handle token extraction failure', async () => {
      const invalidToken = 'invalid-token';

      // Mock failed user extraction
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' }
      });

      const result = await extractUserFromToken(invalidToken);

      expect(result.success).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Token expired');
    });

    test('should handle missing token', async () => {
      const result = await extractUserFromToken('');

      expect(result.success).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('No token provided');
    });
  });

  describe('Token Refresh Logic (TDD Cycle 3)', () => {
    test('should detect expired tokens and suggest refresh', async () => {
      const expiredToken = 'expired-jwt-token';

      // Mock expired token response
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' }
      });

      const result = await validateSupabaseToken(expiredToken);

      expect(result.success).toBe(false);
      expect(result.shouldRefresh).toBe(true);
      expect(result.error).toContain('expired');
    });

    test('should handle non-expired token errors normally', async () => {
      const invalidToken = 'malformed-token';

      // Mock invalid token response
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT format' }
      });

      const result = await validateSupabaseToken(invalidToken);

      expect(result.success).toBe(false);
      expect(result.shouldRefresh).toBe(false);
      expect(result.error).toBe('Invalid JWT format');
    });

    test('should validate successful tokens correctly', async () => {
      const validToken = 'valid-jwt-token';
      const userData = {
        id: 'user-789',
        email: 'valid@example.com',
        role: 'authenticated'
      };

      // Mock successful token validation
      mockGetUser.mockResolvedValue({
        data: { user: userData },
        error: null
      });

      const result = await validateSupabaseToken(validToken);

      expect(result.success).toBe(true);
      expect(result.shouldRefresh).toBe(false);
      expect(result.user).toEqual(userData);
      expect(result.error).toBeNull();
    });
  });
});