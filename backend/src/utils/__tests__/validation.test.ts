import { validateUserData, validateBrewData, generateBrewNumber } from '../validation';

describe('Data Validation Rules (TDD)', () => {
  describe('User Data Validation (TDD Cycle 1)', () => {
    test('should validate correct email format', () => {
      const validEmails = [
        'user@example.com',
        'test.user+123@domain.co.uk',
        'admin@cuptrack.io'
      ];

      validEmails.forEach(email => {
        const result = validateUserData({ email, role: 'user' });
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..user@domain.com',
        ''
      ];

      invalidEmails.forEach(email => {
        const result = validateUserData({ email, role: 'user' });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid email format');
      });
    });

    test('should validate user roles correctly', () => {
      const validRoles = ['user', 'admin'];
      
      validRoles.forEach(role => {
        const result = validateUserData({ email: 'test@example.com', role });
        expect(result.isValid).toBe(true);
      });
    });

    test('should reject invalid user roles', () => {
      const invalidRoles = ['superuser', 'guest', '', 'ADMIN'];
      
      invalidRoles.forEach(role => {
        const result = validateUserData({ email: 'test@example.com', role });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid role');
      });
    });
  });

  describe('Brew Data Validation (TDD Cycle 2)', () => {
    test('should validate required brew fields', () => {
      const validBrewData = {
        beans: {
          brand: 'Ethiopian Coffee Co',
          origin: 'Yirgacheffe',
          processing_method: 'washed'
        },
        parameters: {
          brewing_method: 'pour-over',
          grinder_model: 'Baratza Encore',
          grinder_setting: '15',
          water_temperature: 92.5
        },
        measurements: {
          coffee_beans_weight: 22.0,
          water_weight: 350.0
        }
      };

      const result = validateBrewData(validBrewData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject missing required fields', () => {
      const incompleteBrewData = {
        beans: {
          brand: 'Ethiopian Coffee Co',
          // Missing origin and processing_method
        },
        parameters: {
          brewing_method: 'pour-over',
          // Missing grinder info and temperature
        },
        measurements: {
          // Missing weights
        }
      };

      const result = validateBrewData(incompleteBrewData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Origin is required');
      expect(result.errors).toContain('Processing method is required');
      expect(result.errors).toContain('Grinder model is required');
      expect(result.errors).toContain('Water temperature is required');
      expect(result.errors).toContain('Coffee beans weight is required');
      expect(result.errors).toContain('Water weight is required');
    });

    test('should validate business rule ranges', () => {
      const brewWithInvalidRanges = {
        beans: {
          brand: 'Test Coffee',
          origin: 'Test Origin',
          processing_method: 'washed'
        },
        parameters: {
          brewing_method: 'pour-over',
          grinder_model: 'Test Grinder',
          grinder_setting: '10',
          water_temperature: 75.0 // Too low
        },
        measurements: {
          coffee_beans_weight: -5.0, // Negative
          water_weight: 0 // Zero
        }
      };

      const result = validateBrewData(brewWithInvalidRanges);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Water temperature must be between 80°C and 100°C');
      expect(result.errors).toContain('Coffee beans weight must be positive');
      expect(result.errors).toContain('Water weight must be positive');
    });

    test('should validate enum values', () => {
      const brewWithInvalidEnums = {
        beans: {
          brand: 'Test Coffee',
          origin: 'Test Origin',
          processing_method: 'invalid_method'
        },
        parameters: {
          brewing_method: 'invalid_method',
          grinder_model: 'Test Grinder',
          grinder_setting: '10',
          water_temperature: 90.0
        },
        measurements: {
          coffee_beans_weight: 20.0,
          water_weight: 300.0
        }
      };

      const result = validateBrewData(brewWithInvalidEnums);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Processing method must be washed, natural, or honey');
      expect(result.errors).toContain('Brewing method must be pour-over, french-press, or aeropress');
    });
  });

  describe('Brew Number Generation (TDD Cycle 3)', () => {
    test('should generate unique brew numbers for user', () => {
      const userId = 'user-123';
      const existingBrewNumbers = ['BREW-0001', 'BREW-0002', 'BREW-0005'];
      
      const nextNumber = generateBrewNumber(userId, existingBrewNumbers);
      
      expect(nextNumber).toBe('BREW-0006');
    });

    test('should start with BREW-0001 for new users', () => {
      const userId = 'new-user';
      const existingBrewNumbers: string[] = [];
      
      const nextNumber = generateBrewNumber(userId, existingBrewNumbers);
      
      expect(nextNumber).toBe('BREW-0001');
    });

    test('should handle gaps in brew numbers correctly', () => {
      const userId = 'user-456';
      const existingBrewNumbers = ['BREW-0001', 'BREW-0003', 'BREW-0007'];
      
      const nextNumber = generateBrewNumber(userId, existingBrewNumbers);
      
      expect(nextNumber).toBe('BREW-0008');
    });
  });
});