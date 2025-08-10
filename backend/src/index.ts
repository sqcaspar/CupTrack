import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import responseTime from 'response-time';
import dotenv from 'dotenv';
import { performHealthCheck, validateEnvironment } from './utils/environment';
// import { authenticateUser } from './middleware/auth'; // Used in routes
import { rateLimitMiddleware, inputValidationMiddleware, securityHeaders } from './middleware/security';
import { validateCorsOrigin } from './utils/platform-integration';
import { ensureDemoUserExists } from './utils/demo-user';
import { performDatabaseMigrations } from './utils/database-migration';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ''].filter(Boolean)
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false
}));

// Dynamic CORS configuration with validation
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      return callback(null, true);
    }
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'https://cuptrack.vercel.app',
      'https://cuptrack-staging.vercel.app'
    ];
    
    const corsResult = validateCorsOrigin(origin, allowedOrigins);
    
    if (corsResult.isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Security middleware
app.use(securityHeaders);

// Rate limiting
app.use(rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  keyGenerator: (req) => req.user?.id || req.ip || 'anonymous'
}));

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Input validation
app.use(inputValidationMiddleware);

// Response time logging
app.use(responseTime((req, res, time) => {
  const logData = {
    method: req.method,
    url: req.url,
    responseTime: `${time}ms`,
    statusCode: res.statusCode,
    userAgent: (req as any).get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  
  console.log('API Performance:', JSON.stringify(logData));
  
  // Alert if response time is too high
  if (time > 2000) {
    console.warn('⚠️ Slow API response:', logData);
  }
}));

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const healthResult = await performHealthCheck();
    const statusCode = healthResult.status === 'ok' ? 200 : 500;
    
    res.status(statusCode).json(healthResult);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      database: {
        success: false,
        message: 'Health check failed',
        timestamp: new Date()
      },
      timestamp: new Date()
    });
  }
});

// Environment validation endpoint
app.get('/env-check', (_req, res) => {
  const validation = validateEnvironment();
  
  if (validation.isValid) {
    res.json({
      status: 'ok',
      message: '✅ Environment validation passed',
      environment: process.env.NODE_ENV || 'development'
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Missing environment variables',
      missing: validation.missing
    });
  }
});

// API routes
import apiRoutes from './routes/index';
app.use('/api/v1', apiRoutes);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /env-check',
      'GET /api/v1/health',
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/login',
      'GET /api/v1/brews (requires auth)',
      'POST /api/v1/brews (requires auth)'
    ]
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Validate environment for non-test environments
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    console.error('❌ Environment validation failed. Missing variables:', envValidation.missing);
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  app.listen(PORT, async () => {
    console.log(`✅ CupTrack backend server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    
    // Initialize database and demo user for identical authentication experience
    console.log('\n🗄️ Database Migration:');
    const migrationSuccess = await performDatabaseMigrations();
    if (migrationSuccess) {
      console.log('✅ Database schema ready for authentication system');
      
      console.log('\n🎭 Demo User Initialization:');
      const demoUserCreated = await ensureDemoUserExists();
      if (demoUserCreated) {
        console.log('✅ Demo user ready for identical authentication experience');
      } else {
        console.warn('⚠️ Demo user setup failed - demo authentication may not work');
      }
    } else {
      console.warn('⚠️ Database migration failed - authentication system may not work properly');
    }
  });
}

export default app;