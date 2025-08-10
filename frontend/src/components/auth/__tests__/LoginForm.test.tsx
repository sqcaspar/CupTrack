import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock the auth service dependencies
jest.mock('../../../services/authService', () => ({
  AuthService: jest.fn(),
  createAuthService: jest.fn(),
}));

jest.mock('../../../services/apiClient', () => ({
  ApiClient: jest.fn(),
  createApiClient: jest.fn(),
}));

const { createAuthService } = require('../../../services/authService');
const { createApiClient } = require('../../../services/apiClient');

describe('LoginForm', () => {
  let mockAuthService: any;
  let mockApiClient: any;

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
    };

    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(false),
      getCurrentToken: jest.fn().mockReturnValue(null),
      clearAuth: jest.fn(),
      googleOAuth: jest.fn(),
      appleOAuth: jest.fn(),
      refreshToken: jest.fn(),
    };

    (createApiClient as jest.Mock).mockReturnValue(mockApiClient);
    (createAuthService as jest.Mock).mockReturnValue(mockAuthService);
  });

  const renderWithAuthProvider = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        {component}
      </AuthProvider>
    );
  };

  test('renders login form with all required fields', () => {
    renderWithAuthProvider(<LoginForm />);

    expect(screen.getByText('Sign in to CupTrack')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    renderWithAuthProvider(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email', async () => {
    renderWithAuthProvider(<LoginForm />);

    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });

  test('shows validation error for short password', async () => {
    renderWithAuthProvider(<LoginForm />);

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  test('calls login function with valid credentials', async () => {
    mockAuthService.login.mockResolvedValue({
      user: { id: '1', email: 'test@example.com', provider: 'email' },
      tokens: { accessToken: 'token', refreshToken: 'refresh', expiresIn: 3600 }
    });

    renderWithAuthProvider(<LoginForm />);

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  test('shows switch to register option when callback provided', () => {
    const mockSwitchToRegister = jest.fn();
    renderWithAuthProvider(<LoginForm onSwitchToRegister={mockSwitchToRegister} />);

    const switchButton = screen.getByRole('button', { name: 'Sign up' });
    expect(switchButton).toBeInTheDocument();

    fireEvent.click(switchButton);
    expect(mockSwitchToRegister).toHaveBeenCalled();
  });

  test('disables form when loading', () => {
    // We'll simulate loading by making login take time
    let resolveLogin: any;
    mockAuthService.login.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );

    renderWithAuthProvider(<LoginForm />);

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Form should be disabled during loading
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeInTheDocument();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });
});