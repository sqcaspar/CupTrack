import { Request, Response, NextFunction } from 'express';
import { rateLimitMiddleware, inputValidationMiddleware, securityHeaders, clearRateLimitStore } from '../security';

describe('API Security Logic (TDD)', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      user: { id: 'user-123', email: 'test@example.com', role: 'user' },
      body: {},
      headers: {}
    } as Partial<Request>;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
    clearRateLimitStore(); // Clear rate limit store between tests
  });

  describe('Rate Limiting (TDD Cycle 1)', () => {
    test('should allow requests within rate limit', async () => {
      const rateLimiter = rateLimitMiddleware({
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        keyGenerator: (req) => req.ip || 'anonymous'
      });

      // First request should pass
      await rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should block requests exceeding rate limit per IP', async () => {
      const rateLimiter = rateLimitMiddleware({
        windowMs: 1000, // 1 second
        maxRequests: 2,
        keyGenerator: (req) => req.ip || 'anonymous'
      });

      // First two requests should pass
      await rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      await rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(2);

      // Third request should be blocked
      jest.clearAllMocks();
      await rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Too many requests. Please try again later.',
        retryAfter: expect.any(Number)
      });
    });

    test('should apply different limits per user', async () => {
      const rateLimiter = rateLimitMiddleware({
        windowMs: 60000,
        maxRequests: 5,
        keyGenerator: (req) => req.user?.id || req.ip || 'anonymous'
      });

      // User 1 requests
      mockReq.user = { id: 'user-1', email: 'user1@example.com', role: 'user' };
      for (let i = 0; i < 5; i++) {
        await rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      }
      expect(mockNext).toHaveBeenCalledTimes(5);

      // User 2 should still be able to make requests
      jest.clearAllMocks();
      mockReq.user = { id: 'user-2', email: 'user2@example.com', role: 'user' };
      await rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should reset rate limit after window expires', async () => {
      const rateLimiter = rateLimitMiddleware({
        windowMs: 50, // 50ms window
        maxRequests: 1,
        keyGenerator: (req) => req.ip || 'anonymous'
      });

      // First request should pass
      await rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request should be blocked
      jest.clearAllMocks();
      await rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(429);

      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Request after window should pass
      jest.clearAllMocks();
      await rateLimiter(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Input Validation (TDD Cycle 2)', () => {
    test('should detect and prevent SQL injection attempts', async () => {
      mockReq.body = {
        search: "'; DROP TABLE users; --",
        filter: "1' OR '1'='1"
      };

      await inputValidationMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Malicious input detected',
        field: expect.any(String)
      });
    });

    test('should detect and prevent XSS attempts', async () => {
      mockReq.body = {
        comment: '<script>alert("xss")</script>',
        description: '<img src="x" onerror="alert(1)">'
      };

      await inputValidationMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Malicious input detected',
        field: expect.any(String)
      });
    });

    test('should sanitize and allow safe input', async () => {
      mockReq.body = {
        brand: 'Ethiopian Coffee Co.',
        origin: 'Yirgacheffe Region',
        notes: 'Bright acidity with floral notes'
      };

      await inputValidationMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      
      // Input should be sanitized but preserved
      expect(mockReq.body.brand).toBe('Ethiopian Coffee Co.');
      expect(mockReq.body.origin).toBe('Yirgacheffe Region');
    });

    test('should handle nested object validation', async () => {
      mockReq.body = {
        brew: {
          beans: {
            brand: "Safe Brand",
            notes: '<script>malicious()</script>'
          },
          parameters: {
            method: 'pour-over',
            temp: 92
          }
        }
      };

      await inputValidationMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should validate input size limits', async () => {
      mockReq.body = {
        description: 'x'.repeat(10001) // Exceeds 10KB limit
      };

      await inputValidationMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Input size limit exceeded',
        field: 'description'
      });
    });
  });

  describe('Security Headers (TDD Cycle 3)', () => {
    test('should set comprehensive security headers', async () => {
      await securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Permissions-Policy', expect.stringContaining('camera=()'));
      expect(mockNext).toHaveBeenCalled();
    });

    test('should set appropriate CSP headers for API endpoints', async () => {
      await securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining("default-src 'self'")
      );
    });

    test('should set HSTS headers for HTTPS', async () => {
      mockReq = {
        ...mockReq,
        secure: true,
        headers: { 'x-forwarded-proto': 'https' }
      };

      await securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    });

    test('should not set HSTS for HTTP requests', async () => {
      mockReq = {
        ...mockReq,
        secure: false,
        headers: {}
      };

      await securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).not.toHaveBeenCalledWith(
        'Strict-Transport-Security',
        expect.any(String)
      );
    });
  });
});