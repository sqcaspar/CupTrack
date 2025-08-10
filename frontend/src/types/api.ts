export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: string[];
  message?: string;
}

export class ApiError extends Error {
  public status: number;
  public details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}