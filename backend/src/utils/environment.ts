import { HealthCheckResult } from '../types/database';

interface EnvironmentVariables {
  SUPABASE_URL: string | undefined;
  SUPABASE_ANON_KEY: string | undefined;
  SUPABASE_SERVICE_KEY: string | undefined;
  JWT_SECRET: string | undefined;
  NODE_ENV: string;
  CORS_ORIGIN: string;
}

export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

export function getEnvironmentConfig(): EnvironmentVariables {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL || undefined,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || undefined,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || undefined,
    JWT_SECRET: process.env.JWT_SECRET || undefined,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
  };
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const { validateDatabaseConnection } = await import('./database');
  
  const timestamp = new Date();
  
  // Validate environment
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    return {
      status: 'error',
      database: {
        success: false,
        message: `Missing environment variables: ${envValidation.missing.join(', ')}`,
        timestamp
      },
      timestamp
    };
  }

  // Test database connection
  const config = {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    ...(process.env.SUPABASE_SERVICE_KEY && { serviceKey: process.env.SUPABASE_SERVICE_KEY })
  };

  const dbResult = await validateDatabaseConnection(config);

  return {
    status: dbResult.success ? 'ok' : 'error',
    database: dbResult,
    timestamp
  };
}