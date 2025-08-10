import { ApiClient } from './apiClient';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  OAuthRequest, 
  RefreshTokenRequest 
} from '../types/auth';

export class AuthService {
  constructor(private apiClient: ApiClient) {}

  async register(registerRequest: RegisterRequest): Promise<AuthResponse> {
    const response = await this.apiClient.post('/auth/register', registerRequest);
    
    // Set tokens in API client for future requests
    if (response.tokens) {
      this.apiClient.setAuthToken(response.tokens.accessToken);
      this.apiClient.setRefreshToken(response.tokens.refreshToken);
    }
    
    return response;
  }

  async login(loginRequest: LoginRequest): Promise<AuthResponse> {
    const response = await this.apiClient.post('/auth/login', loginRequest);
    
    // Set tokens in API client for future requests
    if (response.tokens) {
      this.apiClient.setAuthToken(response.tokens.accessToken);
      this.apiClient.setRefreshToken(response.tokens.refreshToken);
    }
    
    return response;
  }

  async googleOAuth(oauthRequest: OAuthRequest): Promise<AuthResponse> {
    const response = await this.apiClient.post('/auth/oauth/google', oauthRequest);
    
    // Set tokens in API client for future requests
    if (response.tokens) {
      this.apiClient.setAuthToken(response.tokens.accessToken);
      this.apiClient.setRefreshToken(response.tokens.refreshToken);
    }
    
    return response;
  }

  async appleOAuth(oauthRequest: OAuthRequest): Promise<AuthResponse> {
    const response = await this.apiClient.post('/auth/oauth/apple', oauthRequest);
    
    // Set tokens in API client for future requests
    if (response.tokens) {
      this.apiClient.setAuthToken(response.tokens.accessToken);
      this.apiClient.setRefreshToken(response.tokens.refreshToken);
    }
    
    return response;
  }

  async refreshToken(refreshRequest: RefreshTokenRequest): Promise<{ message: string; tokens: any }> {
    const response = await this.apiClient.post('/auth/refresh', refreshRequest);
    
    // Update tokens in API client
    if (response.tokens) {
      this.apiClient.setAuthToken(response.tokens.accessToken);
      this.apiClient.setRefreshToken(response.tokens.refreshToken);
    }
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.post('/auth/logout');
      return response;
    } finally {
      // Always clear tokens, even if logout API call fails
      this.clearAuth();
    }
  }

  isAuthenticated(): boolean {
    const token = this.apiClient.getAuthToken();
    return token !== null && token !== undefined;
  }

  getCurrentToken(): string | null {
    return this.apiClient.getAuthToken();
  }

  clearAuth(): void {
    this.apiClient.clearAuthToken();
    this.apiClient.clearRefreshToken();
  }
}

// Singleton pattern for global auth service
let authServiceInstance: AuthService | null = null;

export const createAuthService = (apiClient: ApiClient): AuthService => {
  authServiceInstance = new AuthService(apiClient);
  return authServiceInstance;
};

export const getAuthService = (): AuthService => {
  if (!authServiceInstance) {
    throw new Error('Auth service not initialized. Call createAuthService first.');
  }
  return authServiceInstance;
};