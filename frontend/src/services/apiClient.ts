import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiConfig, ApiError } from '../types/api';

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private config: ApiConfig;
  private authToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: ApiConfig) {
    this.config = config;
    
    // Initialize tokens from localStorage if available
    this.authToken = localStorage.getItem('cuptrack_auth_token');
    this.refreshToken = localStorage.getItem('cuptrack_refresh_token');
    
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 errors and try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry && this.getRefreshToken()) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await this.axiosInstance.request({
              method: 'POST',
              url: '/auth/refresh',
              data: { refreshToken: this.getRefreshToken() }
            });

            const { tokens } = refreshResponse.data;
            this.setAuthToken(tokens.accessToken);
            this.setRefreshToken(tokens.refreshToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return this.axiosInstance.request(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and reject
            this.clearAuthToken();
            this.clearRefreshToken();
            throw new ApiError('Authentication failed', 401);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  getConfig(): ApiConfig {
    return this.config;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    // Persist token to localStorage for authentication state persistence
    localStorage.setItem('cuptrack_auth_token', token);
  }

  getAuthToken(): string | null {
    // Check memory first, then localStorage if memory is empty
    if (!this.authToken) {
      this.authToken = localStorage.getItem('cuptrack_auth_token');
    }
    return this.authToken;
  }

  clearAuthToken(): void {
    this.authToken = null;
    // Clear persisted token
    localStorage.removeItem('cuptrack_auth_token');
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
    // Persist refresh token to localStorage
    localStorage.setItem('cuptrack_refresh_token', token);
  }

  getRefreshToken(): string | null {
    // Check memory first, then localStorage if memory is empty
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('cuptrack_refresh_token');
    }
    return this.refreshToken;
  }

  clearRefreshToken(): void {
    this.refreshToken = null;
    // Clear persisted refresh token
    localStorage.removeItem('cuptrack_refresh_token');
  }

  async request(method: RequestConfig['method'], url: string, data?: any, headers: Record<string, string> = {}): Promise<any> {
    const config: RequestConfig = {
      method,
      url,
      headers,
    };

    if (data) {
      config.data = data;
    }

    // Add auth token to headers if available
    if (this.authToken && !headers.Authorization) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.authToken}`
      };
    }

    return this.executeWithRetry(config, 0);
  }

  private async executeWithRetry(config: RequestConfig, attempt: number): Promise<any> {
    try {
      const response: AxiosResponse = await this.axiosInstance.request(config);
      return response.data;
    } catch (error) {
      if (attempt < this.config.retries && this.shouldRetry(error as AxiosError)) {
        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000);
        return this.executeWithRetry(config, attempt + 1);
      }
      
      throw this.handleError(error as AxiosError);
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (!error.response) return true; // Network error
    if (error.code === 'ECONNABORTED') return true; // Timeout
    if (error.response.status >= 500) return true; // Server error
    return false;
  }

  private delay(ms: number): Promise<void> {
    // In test environment, don't actually delay
    if (process.env.NODE_ENV === 'test') {
      return Promise.resolve();
    }
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(error: AxiosError): ApiError {
    if (error.code === 'ECONNABORTED') {
      throw new ApiError('Request timeout', 408);
    }

    if (!error.response) {
      throw new ApiError('Network request failed', 0);
    }

    const { status, data } = error.response;
    const errorData = data as any;
    
    const apiError = new ApiError(
      errorData?.error || errorData?.message || 'Request failed',
      status,
      errorData?.details
    );

    throw apiError;
  }

  // Convenience methods
  async get(url: string, headers?: Record<string, string>): Promise<any> {
    return this.request('GET', url, undefined, headers);
  }

  async post(url: string, data?: any, headers?: Record<string, string>): Promise<any> {
    return this.request('POST', url, data, headers);
  }

  async put(url: string, data?: any, headers?: Record<string, string>): Promise<any> {
    return this.request('PUT', url, data, headers);
  }

  async delete(url: string, headers?: Record<string, string>): Promise<any> {
    return this.request('DELETE', url, undefined, headers);
  }
}

// Singleton pattern for global API client
let apiClientInstance: ApiClient | null = null;

export const createApiClient = (config: ApiConfig): ApiClient => {
  apiClientInstance = new ApiClient(config);
  return apiClientInstance;
};

export const getApiClient = (): ApiClient => {
  if (!apiClientInstance) {
    throw new Error('API client not initialized. Call createApiClient first.');
  }
  return apiClientInstance;
};