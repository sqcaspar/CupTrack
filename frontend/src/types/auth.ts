export interface User {
  id: string;
  email: string;
  provider: 'email' | 'google' | 'apple';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OAuthRequest {
  code: string;
  state: string;
  redirectUri: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthError {
  error: string;
  details?: string[];
}

export type AuthProvider = 'email' | 'google' | 'apple';