import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType } from '../types/context';
import { User, LoginRequest, RegisterRequest, OAuthRequest } from '../types/auth';
import { AuthService, createAuthService } from '../services/authService';
import { createApiClient } from '../services/apiClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Demo users now use identical authentication flow - no special token generation needed

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
        // Check for persisted authentication (tokens in localStorage)
        // This enables authentication state to survive page refreshes and navigation
        if (authService.isAuthenticated()) {
          setIsAuthenticated(true);
          console.log('✅ Authentication restored from persisted tokens');
          
          // TODO: In future, we might decode token to get user info
          // For now, we'll just mark as authenticated since token validation happens on API calls
        } else {
          // No persisted authentication found
          console.log('ℹ️ No persisted authentication found');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        // Clear any invalid persisted tokens
        authService.clearAuth();
        setIsAuthenticated(false);
      }
    };

    initializeAuth();
  }, [authService]);

  const login = async (loginRequest: LoginRequest): Promise<void> => {
    setLoading(true);
    try {
      // All users (including demo@cuptrack.com) now use identical authentication flow
      // Demo user is a real Supabase account that goes through regular backend authentication
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
      // All users now use identical registration flow
      // Demo users register through regular backend just like any other user
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
      console.log('✅ Logout successful - tokens cleared');
    } catch (error) {
      console.error('Logout failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear any legacy demo authentication data from localStorage  
      localStorage.removeItem('cuptrack_demo_auth');
      
      // The authService.logout() already clears persisted tokens via clearAuth()
      // but let's be explicit about the state cleanup
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