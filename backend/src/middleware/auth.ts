import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { User, TokenValidationResult, UserExtractionResult } from '../types/auth';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

// Helper function to detect demo tokens
function isDemoToken(token: string): boolean {
  try {
    // Demo tokens have a specific signature we can detect
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode the payload to check for demo signature
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub && payload.sub.startsWith('demo-user') && payload.email && payload.email.includes('@cuptrack.com');
  } catch (error) {
    return false;
  }
}

// Validate demo tokens
function validateDemoToken(token: string): TokenValidationResult {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        success: false,
        user: null,
        error: 'Invalid demo token format',
        shouldRefresh: false
      };
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return {
        success: false,
        user: null,
        error: 'Demo token expired',
        shouldRefresh: false
      };
    }
    
    // Create demo user object
    const user: User = {
      id: payload.sub,
      email: payload.email,
      role: 'authenticated'
    };
    
    console.log('✅ Demo token validation successful:', {
      userId: user.id,
      email: user.email,
      tokenExpiry: new Date(payload.exp * 1000).toISOString()
    });
    
    return {
      success: true,
      user,
      error: null,
      shouldRefresh: false
    };
  } catch (error) {
    console.error('❌ Demo token validation failed:', error);
    return {
      success: false,
      user: null,
      error: 'Invalid demo token',
      shouldRefresh: false
    };
  }
}

export async function validateSupabaseToken(token: string): Promise<TokenValidationResult> {
  if (!token) {
    return {
      success: false,
      user: null,
      error: 'No token provided',
      shouldRefresh: false
    };
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getUser(token);

    if (error) {
      // Check if token is expired and should be refreshed
      const shouldRefresh = error.message.toLowerCase().includes('expired') || 
                           error.message.toLowerCase().includes('jwt expired');

      return {
        success: false,
        user: null,
        error: error.message,
        shouldRefresh
      };
    }

    if (!data.user) {
      return {
        success: false,
        user: null,
        error: 'No user found',
        shouldRefresh: false
      };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      role: data.user.role || 'authenticated'
    };

    return {
      success: true,
      user,
      error: null,
      shouldRefresh: false
    };
  } catch (error) {
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      shouldRefresh: false
    };
  }
}

export async function extractUserFromToken(token: string): Promise<UserExtractionResult> {
  if (!token) {
    return {
      success: false,
      user: null,
      error: 'No token provided'
    };
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getUser(token);

    if (error) {
      return {
        success: false,
        user: null,
        error: error.message
      };
    }

    if (!data.user) {
      return {
        success: false,
        user: null,
        error: 'No user found'
      };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      role: data.user.role || 'authenticated'
    };

    return {
      success: true,
      user,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No valid authorization header' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    let result: TokenValidationResult;
    
    // Check if this is a demo token first
    if (isDemoToken(token)) {
      console.log('🎭 Detected demo token, using demo validation');
      result = validateDemoToken(token);
    } else {
      console.log('🔑 Detected regular token, using Supabase validation');
      result = await validateSupabaseToken(token);
    }
    
    if (!result.success || !result.user) {
      if (result.shouldRefresh) {
        res.status(401).json({ 
          error: result.error,
          shouldRefresh: true
        });
      } else {
        res.status(401).json({ error: result.error || 'Authentication failed' });
      }
      return;
    }
    
    req.user = result.user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}