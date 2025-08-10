import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseConfig, ConnectionResult } from '../types/database';

let supabaseClient: SupabaseClient | null = null;

async function attemptConnection(config: DatabaseConfig, attempt: number = 1): Promise<ConnectionResult> {
  const timestamp = new Date();
  const maxRetries = 3;
  
  try {
    // Create client with provided config
    const client = createClient(config.url, config.anonKey);
    
    // Test connection with a simple query
    const { error } = await client.from('users').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is ok for now
      // Check if it's a retryable error and we haven't exceeded max retries
      const isRetryableError = error.code === 'CONNECTION_ERROR' || error.message.includes('network') || error.message.includes('timeout');
      
      if (isRetryableError && attempt < maxRetries) {
        // Wait with exponential backoff before retrying
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptConnection(config, attempt + 1);
      }
      
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        timestamp
      };
    }
    
    return {
      success: true,
      message: 'Connection successful',
      timestamp
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    };
  }
}

export async function validateDatabaseConnection(config: DatabaseConfig): Promise<ConnectionResult> {
  const timestamp = new Date();
  
  // Check for missing required configuration
  if (!config.url || !config.anonKey) {
    return {
      success: false,
      message: 'Invalid configuration: URL and anon key are required',
      timestamp
    };
  }

  return attemptConnection(config);
}

export function switchEnvironment(): 'development' | 'staging' | 'production' {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    return 'production';
  } else if (env === 'staging') {
    return 'staging';
  }
  
  return 'development';
}

export async function connectToDatabase(): Promise<SupabaseClient> {
  if (supabaseClient) {
    return supabaseClient;
  }

  const config: DatabaseConfig = {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    ...(process.env.SUPABASE_SERVICE_KEY && { serviceKey: process.env.SUPABASE_SERVICE_KEY })
  };

  const connectionResult = await validateDatabaseConnection(config);
  
  if (!connectionResult.success) {
    throw new Error(`Database connection failed: ${connectionResult.message}`);
  }

  supabaseClient = createClient(config.url, config.anonKey);
  return supabaseClient;
}