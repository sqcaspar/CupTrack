import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { AuthService } from '../../services/authService';
import { ApiClient } from '../../services/apiClient';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../types/auth';

// Mock dependencies
jest.mock('../../services/authService', () => ({
  AuthService: jest.fn(),
  createAuthService: jest.fn(),
}));

jest.mock('../../services/apiClient', () => ({
  ApiClient: jest.fn(),
  createApiClient: jest.fn(),
}));

const { createAuthService } = require('../../services/authService');
const { createApiClient } = require('../../services/apiClient');

// Test component to access context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{auth.user ? auth.user.email : 'no-user'}</div>
      <button data-testid="login" onClick={() => auth.login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button data-testid="register" onClick={() => auth.register({ email: 'test@example.com', password: 'password', confirmPassword: 'password' })}>
        Register
      </button>
      <button data-testid="logout" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext (TDD)', () => {
  let mockAuthService: jest.Mocked<AuthService>;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockApiClient = {
      setAuthToken: jest.fn(),
      getAuthToken: jest.fn(),
      clearAuthToken: jest.fn(),
      setRefreshToken: jest.fn(),
      clearRefreshToken: jest.fn(),
      request: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      getConfig: jest.fn(),
    } as any;

    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: jest.fn(),
      getCurrentToken: jest.fn(),
      clearAuth: jest.fn(),
      googleOAuth: jest.fn(),
      appleOAuth: jest.fn(),
      refreshToken: jest.fn(),
    } as any;

    (createApiClient as jest.Mock).mockReturnValue(mockApiClient);
    (createAuthService as jest.Mock).mockReturnValue(mockAuthService);
  });

  describe('AuthProvider Initialization (TDD Cycle 1)', () => {
    test('should provide initial unauthenticated state', () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);
      mockAuthService.getCurrentToken.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    test('should restore authenticated state from stored token', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentToken.mockReturnValue('existing-token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });
    });

    test('should throw error when useAuth is used outside provider', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      spy.mockRestore();
    });
  });

  describe('User Authentication (TDD Cycle 2)', () => {
    test('should handle successful login', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password'
      };

      const mockResponse: AuthResponse = {
        message: 'Login successful',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          provider: 'email'
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600
        }
      };

      mockAuthService.login.mockResolvedValue(mockResponse);
      mockAuthService.isAuthenticated.mockReturnValue(true);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login');
      
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(mockAuthService.login).toHaveBeenCalledWith(loginRequest);
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });

    test('should handle login errors', async () => {
      const loginError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(loginError);

      // Mock console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login');
      
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(mockAuthService.login).toHaveBeenCalled();
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      consoleSpy.mockRestore();
    });

    test('should handle successful registration', async () => {
      const registerRequest: RegisterRequest = {
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password'
      };

      const mockResponse: AuthResponse = {
        message: 'Registration successful',
        user: {
          id: 'user-456',
          email: 'test@example.com',
          provider: 'email'
        },
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600
        }
      };

      mockAuthService.register.mockResolvedValue(mockResponse);
      mockAuthService.isAuthenticated.mockReturnValue(true);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByTestId('register');
      
      await act(async () => {
        registerButton.click();
      });

      await waitFor(() => {
        expect(mockAuthService.register).toHaveBeenCalledWith(registerRequest);
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });
  });

  describe('User Logout (TDD Cycle 3)', () => {
    test('should handle successful logout', async () => {
      // Start with authenticated state
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentToken.mockReturnValue('existing-token');
      mockAuthService.logout.mockResolvedValue({ message: 'Logout successful' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial auth state
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      // Update mock to return false after logout
      mockAuthService.isAuthenticated.mockReturnValue(false);
      mockAuthService.getCurrentToken.mockReturnValue(null);

      const logoutButton = screen.getByTestId('logout');
      
      await act(async () => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(mockAuthService.logout).toHaveBeenCalled();
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });
    });

    test('should handle logout errors gracefully', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getCurrentToken.mockReturnValue('existing-token');
      const logoutError = new Error('Logout failed');
      mockAuthService.logout.mockRejectedValue(logoutError);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Update mock to simulate cleared state even on error
      mockAuthService.isAuthenticated.mockReturnValue(false);
      mockAuthService.getCurrentToken.mockReturnValue(null);

      const logoutButton = screen.getByTestId('logout');
      
      await act(async () => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(mockAuthService.logout).toHaveBeenCalled();
        // Should clear local state even if API call fails
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      });
    });
  });

  describe('Loading States (TDD Cycle 4)', () => {
    test('should show loading state during login', async () => {
      let loginResolve: (value: AuthResponse) => void;
      const loginPromise = new Promise<AuthResponse>((resolve) => {
        loginResolve = resolve;
      });

      mockAuthService.login.mockReturnValue(loginPromise);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login');
      
      act(() => {
        loginButton.click();
      });

      // Should show loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Resolve the promise
      const mockResponse: AuthResponse = {
        message: 'Login successful',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          provider: 'email'
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600
        }
      };

      await act(async () => {
        loginResolve!(mockResponse);
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });

    test('should show loading state during registration', async () => {
      let registerResolve: (value: AuthResponse) => void;
      const registerPromise = new Promise<AuthResponse>((resolve) => {
        registerResolve = resolve;
      });

      mockAuthService.register.mockReturnValue(registerPromise);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByTestId('register');
      
      act(() => {
        registerButton.click();
      });

      // Should show loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Resolve the promise
      const mockResponse: AuthResponse = {
        message: 'Registration successful',
        user: {
          id: 'user-456',
          email: 'test@example.com',
          provider: 'email'
        },
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600
        }
      };

      await act(async () => {
        registerResolve!(mockResponse);
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });
  });

  describe('Error Handling (TDD Cycle 5)', () => {
    test('should clear loading state on login error', async () => {
      const loginError = new Error('Login failed');
      mockAuthService.login.mockRejectedValue(loginError);

      // Mock console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByTestId('login');
      
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      });

      consoleSpy.mockRestore();
    });

    test('should clear loading state on registration error', async () => {
      const registerError = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(registerError);

      // Mock console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByTestId('register');
      
      await act(async () => {
        registerButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      });

      consoleSpy.mockRestore();
    });
  });
});