import { validateDatabaseConnection, switchEnvironment } from '../database';
import { DatabaseConfig, ConnectionResult } from '../../types/database';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }))
}));

describe('Database Connection Utilities', () => {
  describe('Connection Testing (TDD Cycle 1)', () => {
    test('should validate database connection successfully with valid config', async () => {
      const validConfig: DatabaseConfig = {
        url: 'https://test.supabase.co',
        anonKey: 'valid-anon-key',
        serviceKey: 'valid-service-key'
      };

      const result: ConnectionResult = await validateDatabaseConnection(validConfig);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Connection successful');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('should fail validation with invalid database config', async () => {
      // Mock createClient to throw an error
      const { createClient } = require('@supabase/supabase-js');
      createClient.mockImplementationOnce(() => {
        throw new Error('Invalid URL');
      });

      const invalidConfig: DatabaseConfig = {
        url: 'invalid-url',
        anonKey: 'invalid-key'
      };

      const result: ConnectionResult = await validateDatabaseConnection(invalidConfig);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Connection failed');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('should fail validation with missing required config', async () => {
      const incompleteConfig: DatabaseConfig = {
        url: '',
        anonKey: ''
      };

      const result: ConnectionResult = await validateDatabaseConnection(incompleteConfig);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid configuration');
    });
  });

  describe('Environment Switching (TDD Cycle 2)', () => {
    test('should detect development environment correctly', () => {
      process.env.NODE_ENV = 'development';
      
      const environment = switchEnvironment();
      
      expect(environment).toBe('development');
    });

    test('should detect production environment correctly', () => {
      process.env.NODE_ENV = 'production';
      
      const environment = switchEnvironment();
      
      expect(environment).toBe('production');
    });

    test('should default to development when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      
      const environment = switchEnvironment();
      
      expect(environment).toBe('development');
    });
  });

  describe('Connection Failure Handling (TDD Cycle 3)', () => {
    test('should retry connection on transient failures', async () => {
      const { createClient } = require('@supabase/supabase-js');
      
      // Mock to fail first two times, succeed on third
      let callCount = 0;
      createClient.mockImplementation(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            limit: jest.fn(() => {
              callCount++;
              if (callCount < 3) {
                return Promise.resolve({ data: null, error: { code: 'CONNECTION_ERROR', message: 'Network error' } });
              }
              return Promise.resolve({ data: null, error: null });
            })
          }))
        }))
      }));

      const config: DatabaseConfig = {
        url: 'https://test.supabase.co',
        anonKey: 'valid-key'
      };

      const result = await validateDatabaseConnection(config);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Connection successful');
    });

    test('should fail after maximum retry attempts', async () => {
      const { createClient } = require('@supabase/supabase-js');
      
      // Mock to always fail
      createClient.mockImplementation(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ 
              data: null, 
              error: { code: 'CONNECTION_ERROR', message: 'Persistent network error' } 
            }))
          }))
        }))
      }));

      const config: DatabaseConfig = {
        url: 'https://test.supabase.co',
        anonKey: 'valid-key'
      };

      const result = await validateDatabaseConnection(config);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Connection failed');
    });
  });
});