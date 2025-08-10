import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '../RegisterForm';
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

describe('RegisterForm', () => {
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

  test('renders register form with all required fields', () => {
    renderWithAuthProvider(<RegisterForm />);

    expect(screen.getByText('Create your CupTrack account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up with Apple' })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    renderWithAuthProvider(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });

  test('shows validation error for weak password', async () => {
    renderWithAuthProvider(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  test('shows validation error for password without complexity', async () => {
    renderWithAuthProvider(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must contain uppercase, lowercase, and number')).toBeInTheDocument();
    });
  });

  test('shows validation error when passwords do not match', async () => {
    renderWithAuthProvider(<RegisterForm />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('calls register function with valid credentials', async () => {
    mockAuthService.register.mockResolvedValue({
      user: { id: '1', email: 'test@example.com', provider: 'email' },
      tokens: { accessToken: 'token', refreshToken: 'refresh', expiresIn: 3600 }
    });

    renderWithAuthProvider(<RegisterForm />);

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    });
  });

  test('shows switch to login option when callback provided', () => {
    const mockSwitchToLogin = jest.fn();
    renderWithAuthProvider(<RegisterForm onSwitchToLogin={mockSwitchToLogin} />);

    const switchButton = screen.getByRole('button', { name: 'Sign in' });
    expect(switchButton).toBeInTheDocument();

    fireEvent.click(switchButton);
    expect(mockSwitchToLogin).toHaveBeenCalled();
  });

  test('shows terms of service and privacy policy links', () => {
    renderWithAuthProvider(<RegisterForm />);

    expect(screen.getByText(/Terms of Service/)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/)).toBeInTheDocument();
  });

  test('disables form when loading', () => {
    // We'll simulate loading by making register take time
    let resolveRegister: any;
    mockAuthService.register.mockReturnValue(
      new Promise((resolve) => {
        resolveRegister = resolve;
      })
    );

    renderWithAuthProvider(<RegisterForm />);

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    // Form should be disabled during loading
    expect(screen.getByRole('button', { name: 'Creating account...' })).toBeInTheDocument();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
  });
});