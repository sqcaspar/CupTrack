import { AuthService } from '../authService';
import { ApiClient } from '../apiClient';
import { ApiError } from '../../types/api';
import { LoginRequest, RegisterRequest, OAuthRequest, RefreshTokenRequest } from '../../types/auth';

// Mock ApiClient
jest.mock('../apiClient');
const MockedApiClient = ApiClient as jest.MockedClass<typeof ApiClient>;

describe('AuthService (TDD)', () => {
  let authService: AuthService;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient = {
      post: jest.fn(),
      get: jest.fn(),
      setAuthToken: jest.fn(),
      getAuthToken: jest.fn(),
      clearAuthToken: jest.fn(),
      setRefreshToken: jest.fn(),
      clearRefreshToken: jest.fn(),
    } as any;

    MockedApiClient.mockImplementation(() => mockApiClient);
    authService = new AuthService(mockApiClient);
  });

  describe('User Registration (TDD Cycle 1)', () => {
    test('should register user with valid credentials', async () => {
      const registerRequest: RegisterRequest = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      };

      const mockResponse = {
        message: 'User registered successfully',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          provider: 'email' as const
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.register(registerRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', registerRequest);
      expect(result).toEqual(mockResponse);
    });

    test('should handle registration validation errors', async () => {
      const registerRequest: RegisterRequest = {
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different'
      };

      const mockError = new ApiError('Validation failed', 400, [
        'Valid email is required',
        'Password must be at least 8 characters',
        'Passwords do not match'
      ]);

      mockApiClient.post.mockRejectedValue(mockError);

      await expect(authService.register(registerRequest)).rejects.toThrow('Validation failed');
    });

    test('should handle duplicate email errors', async () => {
      const registerRequest: RegisterRequest = {
        email: 'existing@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      };

      const mockError = new ApiError('Email already exists', 409);
      mockApiClient.post.mockRejectedValue(mockError);

      await expect(authService.register(registerRequest)).rejects.toThrow('Email already exists');
    });
  });

  describe('User Login (TDD Cycle 2)', () => {
    test('should login user with valid credentials', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const mockResponse = {
        message: 'Login successful',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          provider: 'email' as const
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.login(loginRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', loginRequest);
      expect(result).toEqual(mockResponse);
    });

    test('should handle invalid credentials', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const mockError = new ApiError('Invalid email or password', 401);
      mockApiClient.post.mockRejectedValue(mockError);

      await expect(authService.login(loginRequest)).rejects.toThrow('Invalid email or password');
    });

    test('should set tokens in API client after successful login', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const mockResponse = {
        message: 'Login successful',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          provider: 'email' as const
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      await authService.login(loginRequest);

      expect(mockApiClient.setAuthToken).toHaveBeenCalledWith('access-token');
      expect(mockApiClient.setRefreshToken).toHaveBeenCalledWith('refresh-token');
    });
  });

  describe('OAuth Authentication (TDD Cycle 3)', () => {
    test('should handle Google OAuth callback', async () => {
      const oauthRequest: OAuthRequest = {
        code: 'google-auth-code',
        state: 'csrf-state-token',
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const mockResponse = {
        message: 'Google OAuth successful',
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

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.googleOAuth(oauthRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/oauth/google', oauthRequest);
      expect(result).toEqual(mockResponse);
      expect(mockApiClient.setAuthToken).toHaveBeenCalledWith('google-access-token');
      expect(mockApiClient.setRefreshToken).toHaveBeenCalledWith('google-refresh-token');
    });

    test('should handle Apple OAuth callback', async () => {
      const oauthRequest: OAuthRequest = {
        code: 'apple-auth-code',
        state: 'apple-csrf-state',
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const mockResponse = {
        message: 'Apple OAuth successful',
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

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.appleOAuth(oauthRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/oauth/apple', oauthRequest);
      expect(result).toEqual(mockResponse);
      expect(mockApiClient.setAuthToken).toHaveBeenCalledWith('apple-access-token');
      expect(mockApiClient.setRefreshToken).toHaveBeenCalledWith('apple-refresh-token');
    });

    test('should handle OAuth failures', async () => {
      const oauthRequest: OAuthRequest = {
        code: 'invalid-code',
        state: 'invalid-state',
        redirectUri: 'https://cuptrack.vercel.app/auth/callback'
      };

      const mockError = new ApiError('Invalid authorization code', 401);
      mockApiClient.post.mockRejectedValue(mockError);

      await expect(authService.googleOAuth(oauthRequest)).rejects.toThrow('Invalid authorization code');
    });
  });

  describe('Token Management (TDD Cycle 4)', () => {
    test('should refresh access token', async () => {
      const refreshRequest: RefreshTokenRequest = {
        refreshToken: 'valid-refresh-token'
      };

      const mockResponse = {
        message: 'Tokens refreshed successfully',
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken(refreshRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', refreshRequest);
      expect(result).toEqual(mockResponse);
      expect(mockApiClient.setAuthToken).toHaveBeenCalledWith('new-access-token');
      expect(mockApiClient.setRefreshToken).toHaveBeenCalledWith('new-refresh-token');
    });

    test('should handle expired refresh token', async () => {
      const refreshRequest: RefreshTokenRequest = {
        refreshToken: 'expired-refresh-token'
      };

      const mockError = new ApiError('Refresh token expired', 401);
      mockApiClient.post.mockRejectedValue(mockError);

      await expect(authService.refreshToken(refreshRequest)).rejects.toThrow('Refresh token expired');
    });

    test('should logout user and clear tokens', async () => {
      const mockResponse = {
        message: 'Logout successful'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse);
      expect(mockApiClient.clearAuthToken).toHaveBeenCalled();
      expect(mockApiClient.clearRefreshToken).toHaveBeenCalled();
    });

    test('should clear tokens even if logout API fails', async () => {
      const mockError = new ApiError('Server error', 500);
      mockApiClient.post.mockRejectedValue(mockError);

      try {
        await authService.logout();
      } catch (error) {
        // Error is expected
      }

      expect(mockApiClient.clearAuthToken).toHaveBeenCalled();
      expect(mockApiClient.clearRefreshToken).toHaveBeenCalled();
    });
  });

  describe('Authentication State (TDD Cycle 5)', () => {
    test('should check if user is authenticated', () => {
      mockApiClient.getAuthToken.mockReturnValue('valid-token');

      const isAuthenticated = authService.isAuthenticated();

      expect(isAuthenticated).toBe(true);
      expect(mockApiClient.getAuthToken).toHaveBeenCalled();
    });

    test('should return false when no token exists', () => {
      mockApiClient.getAuthToken.mockReturnValue(null);

      const isAuthenticated = authService.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });

    test('should get current auth token', () => {
      const token = 'current-access-token';
      mockApiClient.getAuthToken.mockReturnValue(token);

      const currentToken = authService.getCurrentToken();

      expect(currentToken).toBe(token);
      expect(mockApiClient.getAuthToken).toHaveBeenCalled();
    });

    test('should clear all authentication state', () => {
      authService.clearAuth();

      expect(mockApiClient.clearAuthToken).toHaveBeenCalled();
      expect(mockApiClient.clearRefreshToken).toHaveBeenCalled();
    });
  });
});