import { User, LoginRequest, RegisterRequest, OAuthRequest } from './auth';

export interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;

  // Authentication methods
  login: (loginRequest: LoginRequest) => Promise<void>;
  register: (registerRequest: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  googleOAuth: (oauthRequest: OAuthRequest) => Promise<void>;
  appleOAuth: (oauthRequest: OAuthRequest) => Promise<void>;

  // Token management
  refreshAuth: () => Promise<boolean>;
  clearAuth: () => void;
}