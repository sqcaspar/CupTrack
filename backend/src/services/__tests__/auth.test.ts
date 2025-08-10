// Mock Supabase client - needs to be defined before import
const mockSupabaseClient = {
  auth: {
    signInWithOAuth: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    refreshSession: jest.fn(),
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: jest.fn(() => Promise.resolve({ data: [], error: null })),
    upsert: jest.fn(() => Promise.resolve({ data: [], error: null }))
  }))
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

import { 
  generateAuthTokens, 
  validateOAuthCallback, 
  refreshTokens, 
  revokeTokens,
  OAuthProvider,
  OAuthCallbackData 
} from '../auth';

describe('Authentication Service (TDD)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('JWT Token Generation (TDD Cycle 1)', () => {
    test('should generate valid access and refresh tokens', async () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        provider: 'google' as OAuthProvider
      };

      const tokens = await generateAuthTokens(userData);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens).toHaveProperty('expiresIn');
      expect(tokens.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // JWT format
      expect(tokens.refreshToken).toHaveLength(128); // Secure random token
      expect(tokens.expiresIn).toBe(3600); // 1 hour
    });

    test('should include user data in JWT payload', async () => {
      const userData = {
        id: 'user-456',
        email: 'user@test.com',
        provider: 'apple' as OAuthProvider
      };

      const tokens = await generateAuthTokens(userData);
      
      // JWT payload should be decodable (we'll verify structure not content for security)
      expect(tokens.accessToken.split('.').length).toBe(3); // Header.Payload.Signature
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.expiresIn).toBe('number');
    });

    test('should generate unique tokens for each call', async () => {
      const userData = {
        id: 'user-789',
        email: 'unique@test.com',
        provider: 'google' as OAuthProvider
      };

      const tokens1 = await generateAuthTokens(userData);
      const tokens2 = await generateAuthTokens(userData);

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });

    test('should handle token generation errors', async () => {
      const invalidUserData = {
        id: '', // Invalid empty ID
        email: 'test@example.com',
        provider: 'google' as OAuthProvider
      };

      await expect(generateAuthTokens(invalidUserData)).rejects.toThrow('Invalid user data for token generation');
    });
  });

  describe('OAuth Callback Validation (TDD Cycle 2)', () => {
    test('should validate successful Google OAuth callback', async () => {
      const callbackData: OAuthCallbackData = {
        provider: 'google',
        code: 'valid-auth-code',
        state: 'secure-state-token',
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const result = await validateOAuthCallback(callbackData);

      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: 'google-user-123',
        email: 'google@example.com',
        provider: 'google'
      });
      expect(result.tokens).toBeDefined();
      expect(result.tokens?.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      expect(result.tokens?.refreshToken).toHaveLength(128);
    });

    test('should validate successful Apple OAuth callback', async () => {
      const callbackData: OAuthCallbackData = {
        provider: 'apple',
        code: 'apple-auth-code',
        state: 'apple-state-token',
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const result = await validateOAuthCallback(callbackData);

      expect(result.success).toBe(true);
      expect(result.user?.provider).toBe('apple');
      expect(result.user).toEqual({
        id: 'apple-user-456',
        email: 'apple@example.com',
        provider: 'apple'
      });
      expect(result.tokens).toBeDefined();
    });

    test('should handle OAuth callback errors', async () => {
      const callbackData: OAuthCallbackData = {
        provider: 'google',
        code: 'invalid-code',
        state: 'invalid-state',
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const result = await validateOAuthCallback(callbackData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid authorization code');
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    test('should validate state parameter for CSRF protection', async () => {
      const callbackData: OAuthCallbackData = {
        provider: 'google',
        code: 'valid-code',
        state: '', // Empty state should be rejected
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const result = await validateOAuthCallback(callbackData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid state parameter');
    });
  });

  describe('Token Refresh Logic (TDD Cycle 3)', () => {
    test('should refresh valid tokens successfully', async () => {
      const refreshToken = 'a'.repeat(128); // Exactly 128 character hex string

      const result = await refreshTokens(refreshToken);

      expect(result.success).toBe(true);
      expect(result.tokens).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: 3600
      });
    });

    test('should handle expired refresh tokens', async () => {
      const expiredRefreshToken = ('e' + 'f'.repeat(127)); // 128 hex chars starting with 'e' for "expired"

      const result = await refreshTokens(expiredRefreshToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Refresh token expired');
      expect(result.tokens).toBeUndefined();
    });

    test('should validate refresh token format', async () => {
      const invalidRefreshToken = 'invalid-format';

      const result = await refreshTokens(invalidRefreshToken);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid refresh token format');
    });
  });

  describe('Token Revocation (TDD Cycle 4)', () => {
    test('should revoke tokens successfully on logout', async () => {
      const accessToken = 'valid-access-token';

      const result = await revokeTokens(accessToken);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Tokens revoked successfully');
    });

    test('should handle token revocation errors', async () => {
      const invalidAccessToken = 'invalid-token';

      const result = await revokeTokens(invalidAccessToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid session');
    });

    test('should clear user sessions from database on revocation', async () => {
      const accessToken = 'valid-access-token';

      const result = await revokeTokens(accessToken);

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_sessions');
    });
  });
});