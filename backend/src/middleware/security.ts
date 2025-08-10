import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (req: Request) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Export for testing
export function clearRateLimitStore(): void {
  Object.keys(rateLimitStore).forEach(key => {
    delete rateLimitStore[key];
  });
}

export function rateLimitMiddleware(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = options.keyGenerator(req);
    const now = Date.now();
    
    // Clean up expired entries
    Object.keys(rateLimitStore).forEach(k => {
      if (rateLimitStore[k].resetTime <= now) {
        delete rateLimitStore[k];
      }
    });
    
    // Check if key exists and is within window
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime <= now) {
      // Create new entry or reset expired one
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + options.windowMs
      };
      next();
      return;
    }
    
    // Check if over limit before incrementing
    if (rateLimitStore[key].count >= options.maxRequests) {
      const retryAfter = Math.ceil((rateLimitStore[key].resetTime - now) / 1000);
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter
      });
      return;
    }
    
    // Increment count
    rateLimitStore[key].count++;
    next();
  };
}

function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bUNION\b)/gi,
    /('|(\\\\)|(;)|(--)|(\bOR\b\s*\d*\s*=\s*\d*))/gi,
    /(\bEXEC\b|\bEXECUTE\b|\bSP_\b)/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

function detectXss(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*src[^>]*onerror[^>]*>/gi,
    /<[^>]*onclick[^>]*>/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

function sanitizeInput(input: string): string {
  // Remove script tags and event handlers
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

function validateInputRecursively(obj: any, path: string = ''): { isValid: boolean; field?: string; reason?: string } {
  if (typeof obj === 'string') {
    // Check size limit (10KB)
    if (obj.length > 10000) {
      return {
        isValid: false,
        field: path,
        reason: 'Input size limit exceeded'
      };
    }
    
    // Check for malicious patterns
    if (detectSqlInjection(obj) || detectXss(obj)) {
      return {
        isValid: false,
        field: path,
        reason: 'Malicious input detected'
      };
    }
    
    return { isValid: true };
  }
  
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      const result = validateInputRecursively(value, currentPath);
      
      if (!result.isValid) {
        return result;
      }
    }
  }
  
  return { isValid: true };
}

function sanitizeObjectRecursively(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectRecursively(value);
    }
    return sanitized;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectRecursively(item));
  }
  
  return obj;
}

export async function inputValidationMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate request body
    if (req.body && Object.keys(req.body).length > 0) {
      const validation = validateInputRecursively(req.body);
      
      if (!validation.isValid) {
        res.status(400).json({
          error: validation.reason,
          field: validation.field
        });
        return;
      }
      
      // Sanitize the input
      req.body = sanitizeObjectRecursively(req.body);
    }
    
    next();
  } catch (error) {
    console.error('Input validation error:', error);
    res.status(500).json({
      error: 'Input validation failed'
    });
  }
}

export async function securityHeaders(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()');
  
  // Content Security Policy for API
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'none'; object-src 'none'; style-src 'self'; img-src 'self' data:; connect-src 'self'");
  
  // HSTS for HTTPS requests
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (isHttps) {
    res.setHeader('Strict-Transport-Security', 
      'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
}