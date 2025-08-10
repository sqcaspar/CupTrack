import { 
  manageSupabaseConnection, 
  validateCorsOrigin, 
  testPlatformIntegration,
  ConnectionPoolManager 
} from '../platform-integration';

// Mock Supabase client
const mockSupabaseClient = {
  auth: { getUser: jest.fn() },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: jest.fn(() => Promise.resolve({ data: [], error: null })),
    delete: jest.fn(() => Promise.resolve({ data: [], error: null }))
  }))
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('Platform Integration Utilities (TDD)', () => {
  describe('Supabase Connection Management (TDD Cycle 1)', () => {
    test('should manage connection pool with retry logic', async () => {
      const poolManager = new ConnectionPoolManager({
        maxConnections: 5,
        retryAttempts: 3,
        retryDelay: 1000
      });

      const connectionResult = await poolManager.getConnection();

      expect(connectionResult.success).toBe(true);
      expect(connectionResult.connectionId).toBeDefined();
      expect(poolManager.getActiveConnections()).toBe(1);
    });

    test('should handle connection pool exhaustion', async () => {
      const poolManager = new ConnectionPoolManager({
        maxConnections: 1,
        retryAttempts: 1,
        retryDelay: 100
      });

      // Get the first connection
      const firstConnection = await poolManager.getConnection();
      expect(firstConnection.success).toBe(true);

      // Try to get a second connection when pool is full
      const secondConnection = await poolManager.getConnection();
      expect(secondConnection.success).toBe(false);
      expect(secondConnection.error).toContain('Connection pool exhausted');
    });

    test('should release connections properly', async () => {
      const poolManager = new ConnectionPoolManager({
        maxConnections: 2,
        retryAttempts: 1,
        retryDelay: 100
      });

      const connection = await poolManager.getConnection();
      expect(poolManager.getActiveConnections()).toBe(1);

      const released = poolManager.releaseConnection(connection.connectionId!);
      expect(released).toBe(true);
      expect(poolManager.getActiveConnections()).toBe(0);
    });

    test('should handle connection failures with retry', async () => {
      // Mock connection failure for first attempt, success for second
      let attemptCount = 0;
      (mockSupabaseClient.from as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return {
            select: () => ({
              limit: () => Promise.resolve({ data: null, error: { message: 'Connection timeout' } })
            })
          };
        }
        return {
          select: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        };
      });

      const result = await manageSupabaseConnection();
      
      expect(result.success).toBe(true);
      expect(result.retriesUsed).toBe(1);
      expect(result.connectionTime).toBeGreaterThan(0);
    });
  });

  describe('Vercel CORS Integration (TDD Cycle 2)', () => {
    test('should validate allowed CORS origins', () => {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://cuptrack.vercel.app',
        'https://cuptrack-staging.vercel.app'
      ];

      allowedOrigins.forEach(origin => {
        const result = validateCorsOrigin(origin, allowedOrigins);
        expect(result.isAllowed).toBe(true);
        expect(result.origin).toBe(origin);
      });
    });

    test('should reject unauthorized CORS origins', () => {
      const allowedOrigins = ['http://localhost:3000', 'https://cuptrack.vercel.app'];
      const unauthorizedOrigins = [
        'https://evil-site.com',
        'http://malicious.domain',
        'https://cuptrack-fake.vercel.app'
      ];

      unauthorizedOrigins.forEach(origin => {
        const result = validateCorsOrigin(origin, allowedOrigins);
        expect(result.isAllowed).toBe(false);
        expect(result.reason).toContain('not in allowed origins');
      });
    });

    test('should handle wildcard and subdomain patterns', () => {
      const allowedPatterns = [
        'https://*.vercel.app',
        'http://localhost:*',
        'https://cuptrack-*.vercel.app'
      ];

      const testCases = [
        { origin: 'https://my-app.vercel.app', shouldAllow: true },
        { origin: 'http://localhost:3000', shouldAllow: true },
        { origin: 'https://cuptrack-staging.vercel.app', shouldAllow: true },
        { origin: 'https://evil.com', shouldAllow: false },
        { origin: 'http://badactor.localhost:3000', shouldAllow: false }
      ];

      testCases.forEach(({ origin, shouldAllow }) => {
        const result = validateCorsOrigin(origin, allowedPatterns);
        expect(result.isAllowed).toBe(shouldAllow);
      });
    });

    test('should optimize CORS configuration for all environments', () => {
      const environments = ['development', 'staging', 'production'];
      
      environments.forEach(env => {
        process.env.NODE_ENV = env;
        const result = validateCorsOrigin('https://cuptrack.vercel.app', []);
        
        if (env === 'development') {
          // Development should be more permissive
          expect(result.isAllowed).toBe(true);
        } else {
          // Production should be strict
          expect(result.isAllowed).toBe(false);
        }
      });
    });
  });

  describe('End-to-End Platform Integration (TDD Cycle 3)', () => {
    test('should validate complete Vercel ↔ Railway ↔ Supabase integration', async () => {
      const integrationTest = await testPlatformIntegration({
        vercelOrigin: 'https://cuptrack.vercel.app',
        railwayEndpoint: 'https://cuptrack-backend.railway.app',
        supabaseConfig: {
          url: process.env.SUPABASE_URL || 'https://test.supabase.co',
          anonKey: process.env.SUPABASE_ANON_KEY || 'test-key'
        }
      });

      expect(integrationTest.success).toBe(true);
      expect(integrationTest.vercelToCors).toBe(true);
      expect(integrationTest.railwayToSupabase).toBe(true);
      expect(integrationTest.authenticationFlow).toBe(true);
      expect(integrationTest.responseTime).toBeLessThan(2000);
    });

    test('should handle partial platform failures gracefully', async () => {
      // Mock Supabase failure
      (mockSupabaseClient.from as jest.Mock).mockImplementation(() => ({
        select: () => ({
          limit: () => Promise.resolve({ data: null, error: { message: 'Database unavailable' } })
        })
      }));

      const integrationTest = await testPlatformIntegration({
        vercelOrigin: 'https://cuptrack.vercel.app',
        railwayEndpoint: 'https://cuptrack-backend.railway.app',
        supabaseConfig: {
          url: 'https://test.supabase.co',
          anonKey: 'test-key'
        }
      });

      expect(integrationTest.success).toBe(false);
      expect(integrationTest.railwayToSupabase).toBe(false);
      expect(integrationTest.failureReason).toContain('Database unavailable');
      expect(integrationTest.degradedMode).toBe(true);
    });

    test('should measure and validate response times', async () => {
      const startTime = Date.now();
      
      const integrationTest = await testPlatformIntegration({
        vercelOrigin: 'https://cuptrack.vercel.app',
        railwayEndpoint: 'https://cuptrack-backend.railway.app',
        supabaseConfig: {
          url: 'https://test.supabase.co',
          anonKey: 'test-key'
        }
      });

      const totalTime = Date.now() - startTime;
      
      expect(integrationTest.responseTime).toBeLessThan(5000); // 5 second max
      expect(integrationTest.responseTime).toBeGreaterThan(0);
      expect(totalTime).toBeGreaterThanOrEqual(integrationTest.responseTime - 10); // Allow small variance
    });
  });
});