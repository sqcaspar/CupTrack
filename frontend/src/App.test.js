import { render, screen } from '@testing-library/react';
import App from './App';

// Mock React Router
jest.mock('react-router-dom');

// Mock the auth service dependencies
jest.mock('./services/authService', () => ({
  AuthService: jest.fn(),
  createAuthService: jest.fn(),
}));

jest.mock('./services/apiClient', () => ({
  ApiClient: jest.fn(),
  createApiClient: jest.fn(),
}));

const { createAuthService } = require('./services/authService');
const { createApiClient } = require('./services/apiClient');

describe('App', () => {
  let mockAuthService;
  let mockApiClient;

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

    (createApiClient).mockReturnValue(mockApiClient);
    (createAuthService).mockReturnValue(mockAuthService);
  });

  test('renders login form when not authenticated', () => {
    render(<App />);
    // With our routing structure, we expect at least one login form to be rendered
    expect(screen.getAllByText('Sign in to CupTrack').length).toBeGreaterThanOrEqual(1);
  });

  test('renders app with routing structure', () => {
    const { container } = render(<App />);
    // Just verify the app renders without errors
    expect(container).toBeInTheDocument();
  });
});
