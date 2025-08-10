export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface TokenValidationResult {
  success: boolean;
  user: User | null;
  error: string | null;
  shouldRefresh: boolean;
}

export interface UserExtractionResult {
  success: boolean;
  user: User | null;
  error: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}