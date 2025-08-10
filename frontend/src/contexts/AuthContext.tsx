import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType } from '../types/context';
import { User, LoginRequest, RegisterRequest, OAuthRequest } from '../types/auth';
import { AuthService, createAuthService } from '../services/authService';
import { createApiClient } from '../services/apiClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to create a demo JWT token
const createDemoToken = (user: User): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.id,
    email: user.email,
    provider: user.provider,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  // Base64 encode (demo token, not cryptographically secure)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa('demo-signature-not-secure');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authService] = useState<AuthService>(() => {
    // Initialize API client and auth service
    const apiClient = createApiClient({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1',
      timeout: 10000,
      retries: 3
    });
    
    return createAuthService(apiClient);
  });

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for demo authentication first
        const demoAuth = localStorage.getItem('cuptrack_demo_auth');
        if (demoAuth) {
          try {
            const demoData = JSON.parse(demoAuth);
            // Restore demo token to API client
            authService.getCurrentApiClient().setAuthToken(demoData.token);
            setUser(demoData.user);
            setIsAuthenticated(true);
            console.log('Demo authentication restored from localStorage');
            return;
          } catch (error) {
            console.warn('Invalid demo auth data, clearing:', error);
            localStorage.removeItem('cuptrack_demo_auth');
          }
        }

        // Check for regular authentication
        if (authService.isAuthenticated()) {
          setIsAuthenticated(true);
          // Note: In a real app, we might need to fetch user info from token
          // For now, we'll just mark as authenticated
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        authService.clearAuth();
      }
    };

    initializeAuth();
  }, [authService]);

  const login = async (loginRequest: LoginRequest): Promise<void> => {
    setLoading(true);
    try {
      // Demo mode - bypass API for demo credentials
      if (loginRequest.email === 'demo@cuptrack.com' && loginRequest.password === 'demo123') {
        const demoUser: User = {
          id: 'demo-user-123',
          email: 'demo@cuptrack.com',
          provider: 'email'
        };
        
        // Create demo token and set it in API client
        const demoToken = createDemoToken(demoUser);
        authService.getCurrentApiClient().setAuthToken(demoToken);
        
        // Store demo authentication in localStorage for persistence
        const demoAuthData = {
          user: demoUser,
          token: demoToken,
          timestamp: Date.now()
        };
        localStorage.setItem('cuptrack_demo_auth', JSON.stringify(demoAuthData));
        
        setUser(demoUser);
        setIsAuthenticated(true);
        console.log('Demo login successful - token created and persisted');
        return;
      }

      // Normal authentication flow
      const response = await authService.login(loginRequest);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      // Don't re-throw - let the UI handle the error state
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerRequest: RegisterRequest): Promise<void> => {
    setLoading(true);
    try {
      // Demo mode - bypass API for demo email domain
      if (registerRequest.email.includes('@demo.cuptrack')) {
        const demoUser: User = {
          id: `demo-user-${Date.now()}`,
          email: registerRequest.email,
          provider: 'email'
        };
        
        // Create demo token and set it in API client
        const demoToken = createDemoToken(demoUser);
        authService.getCurrentApiClient().setAuthToken(demoToken);
        
        // Store demo authentication in localStorage for persistence
        const demoAuthData = {
          user: demoUser,
          token: demoToken,
          timestamp: Date.now()
        };
        localStorage.setItem('cuptrack_demo_auth', JSON.stringify(demoAuthData));
        
        setUser(demoUser);
        setIsAuthenticated(true);
        console.log('Demo registration successful - token created and persisted');
        return;
      }

      // Normal registration flow
      const response = await authService.register(registerRequest);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      // Don't re-throw - let the UI handle the error state
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear demo authentication from localStorage
      localStorage.removeItem('cuptrack_demo_auth');
      
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const googleOAuth = async (oauthRequest: OAuthRequest): Promise<void> => {
    setLoading(true);
    try {
      const response = await authService.googleOAuth(oauthRequest);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Google OAuth failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      // Don't re-throw - let the UI handle the error state
    } finally {
      setLoading(false);
    }
  };

  const appleOAuth = async (oauthRequest: OAuthRequest): Promise<void> => {
    setLoading(true);
    try {
      const response = await authService.appleOAuth(oauthRequest);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Apple OAuth failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      // Don't re-throw - let the UI handle the error state
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      const currentToken = authService.getCurrentToken();
      if (!currentToken) {
        return false;
      }

      // In a real implementation, we might need to decode the token
      // and check expiration, then call refresh if needed
      const isStillAuthenticated = authService.isAuthenticated();
      setIsAuthenticated(isStillAuthenticated);
      
      return isStillAuthenticated;
    } catch (error) {
      console.error('Auth refresh failed:', error);
      clearAuth();
      return false;
    }
  };

  const clearAuth = (): void => {
    authService.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    googleOAuth,
    appleOAuth,
    refreshAuth,
    clearAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};