import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { 
  generateAuthTokens, 
  validateOAuthCallback, 
  refreshTokens, 
  revokeTokens,
  UserData 
} from '../services/auth';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateOAuth = [
  body('code')
    .notEmpty()
    .withMessage('Authorization code is required'),
  body('state')
    .notEmpty()
    .withMessage('State parameter is required for CSRF protection'),
  body('redirectUri')
    .isURL()
    .withMessage('Valid redirect URI is required')
];

const validateRefresh = [
  body('refreshToken')
    .isLength({ min: 128, max: 128 })
    .withMessage('Invalid refresh token format')
    .matches(/^[a-f0-9]+$/i)
    .withMessage('Refresh token must be hexadecimal')
];

// Helper function to extract token from Authorization header
const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

// POST /auth/register - User registration
router.post('/register', validateRegistration, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(err => err.msg)
      });
    }

    const { email, password } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    const userId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash: hashedPassword,
        auth_provider: 'email',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error('Failed to create user account');
    }

    // Generate tokens
    const userData: UserData = {
      id: userId,
      email,
      provider: 'email'
    };

    const tokens = await generateAuthTokens(userData);

    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    const statusCode = message.includes('already exists') ? 409 : 500;
    
    res.status(statusCode).json({
      error: message
    });
  }
});

// POST /auth/login - User login
router.post('/login', validateLogin, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const { email, password } = req.body;

    // Find user in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, auth_provider')
      .eq('email', email)
      .eq('auth_provider', 'email')
      .single();

    if (userError || !user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate tokens
    const userData: UserData = {
      id: user.id,
      email: user.email,
      provider: 'email'
    };

    const tokens = await generateAuthTokens(userData);

    res.json({
      message: 'Login successful',
      user: userData,
      tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed'
    });
  }
});

// POST /auth/oauth/google - Google OAuth callback
router.post('/oauth/google', validateOAuth, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid OAuth parameters',
        details: errors.array().map(err => err.msg)
      });
    }

    const { code, state, redirectUri } = req.body;

    const result = await validateOAuthCallback({
      provider: 'google',
      code,
      state,
      redirectUri
    });

    if (!result.success) {
      return res.status(401).json({
        error: result.error
      });
    }

    res.json({
      message: 'Google OAuth successful',
      user: result.user,
      tokens: result.tokens
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      error: 'Google OAuth failed'
    });
  }
});

// POST /auth/oauth/apple - Apple OAuth callback
router.post('/oauth/apple', validateOAuth, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid OAuth parameters',
        details: errors.array().map(err => err.msg)
      });
    }

    const { code, state, redirectUri } = req.body;

    const result = await validateOAuthCallback({
      provider: 'apple',
      code,
      state,
      redirectUri
    });

    if (!result.success) {
      return res.status(401).json({
        error: result.error
      });
    }

    res.json({
      message: 'Apple OAuth successful',
      user: result.user,
      tokens: result.tokens
    });
  } catch (error) {
    console.error('Apple OAuth error:', error);
    res.status(500).json({
      error: 'Apple OAuth failed'
    });
  }
});

// POST /auth/refresh - Refresh access token
router.post('/refresh', validateRefresh, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({
        error: 'Invalid refresh token format'
      });
    }

    const { refreshToken } = req.body;

    const result = await refreshTokens(refreshToken);

    if (!result.success) {
      return res.status(401).json({
        error: result.error
      });
    }

    res.json({
      message: 'Tokens refreshed successfully',
      tokens: result.tokens
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed'
    });
  }
});

// POST /auth/logout - User logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = extractTokenFromHeader(authHeader);

    if (!accessToken) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const result = await revokeTokens(accessToken);

    if (!result.success) {
      return res.status(401).json({
        error: result.error
      });
    }

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed'
    });
  }
});

export default router;