export interface DatabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

export interface ConnectionResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

export interface DatabaseConnection {
  isConnected: boolean;
  lastChecked: Date;
  environment: 'development' | 'staging' | 'production';
}

export interface HealthCheckResult {
  status: 'ok' | 'error';
  database: ConnectionResult;
  timestamp: Date;
}