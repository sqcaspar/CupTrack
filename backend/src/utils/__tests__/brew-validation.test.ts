// TDD tests for brew data validation and calculations
// Following TDD methodology for critical business logic

import {
  validateCoffeeBeans,
  validateBrewingParameters,
  validateTurbulenceSteps,
  validateBrewMeasurements,
  validateBrewEvaluation,
  validateCreateBrewRequest,
  calculateBrewRatio,
  calculateSCAFinalScore,
  calculateExtractionYield,
  generateBrewNumber,
  BrewError
} from '../brew-validation';
import { 
  CoffeeBeans, 
  BrewingParameters, 
  TurbulenceStep, 
  BrewMeasurements,
  BrewEvaluation,
  CreateBrewRequest,
  SCAEvaluation
} from '../../types/brew';

describe('Brew Data Validation', () => {
  
  // RED: Test coffee beans validation
  describe('validateCoffeeBeans', () => {
    test('should accept valid coffee beans data', () => {
      const validBeans: CoffeeBeans = {
        brand: 'Ethiopian Coffee Co',
        origin: 'Yirgacheffe',
        processingMethod: 'washed'
      };

      const result = validateCoffeeBeans(validBeans);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject missing required fields', () => {
      const invalidBeans = {
        brand: 'Ethiopian Coffee Co',
        // missing origin and processingMethod
      } as CoffeeBeans;

      const result = validateCoffeeBeans(invalidBeans);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.find(e => e.field === 'origin')).toBeDefined();
      expect(result.errors.find(e => e.field === 'processingMethod')).toBeDefined();
    });

    test('should reject empty string fields', () => {
      const invalidBeans: CoffeeBeans = {
        brand: '',
        origin: '   ',
        processingMethod: 'washed'
      };

      const result = validateCoffeeBeans(invalidBeans);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.find(e => e.field === 'brand' && e.message.includes('required'))).toBeDefined();
      expect(result.errors.find(e => e.field === 'origin' && e.message.includes('required'))).toBeDefined();
    });

    test('should reject invalid processing method', () => {
      const invalidBeans = {
        brand: 'Test Coffee',
        origin: 'Test Origin',
        processingMethod: 'invalid-method'
      } as any;

      const result = validateCoffeeBeans(invalidBeans);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.field === 'processingMethod')).toBeDefined();
    });

    test('should reject negative altitude', () => {
      const invalidBeans: CoffeeBeans = {
        brand: 'Test Coffee',
        origin: 'Test Origin',
        processingMethod: 'washed',
        altitude: -100
      };

      const result = validateCoffeeBeans(invalidBeans);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.field === 'altitude' && e.message.includes('positive'))).toBeDefined();
    });

    test('should reject invalid roasting date format', () => {
      const invalidBeans: CoffeeBeans = {
        brand: 'Test Coffee',
        origin: 'Test Origin',
        processingMethod: 'washed',
        roastingDate: 'invalid-date'
      };

      const result = validateCoffeeBeans(invalidBeans);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.field === 'roastingDate')).toBeDefined();
    });

    test('should accept valid optional fields', () => {
      const validBeans: CoffeeBeans = {
        brand: 'Ethiopian Coffee Co',
        origin: 'Yirgacheffe',
        processingMethod: 'natural',
        altitude: 1800,
        roastingDate: '2023-11-15',
        roastingLevel: 'medium'
      };

      const result = validateCoffeeBeans(validBeans);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // RED: Test brewing parameters validation
  describe('validateBrewingParameters', () => {
    test('should accept valid brewing parameters', () => {
      const validParams: BrewingParameters = {
        brewingMethod: 'pour-over',
        grinderModel: 'Baratza Encore',
        grinderSetting: '15',
        waterTemperature: 93
      };

      const result = validateBrewingParameters(validParams);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject missing required fields', () => {
      const invalidParams = {
        brewingMethod: 'pour-over',
        // missing grinderModel, grinderSetting, waterTemperature
      } as BrewingParameters;

      const result = validateBrewingParameters(invalidParams);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject invalid water temperature range', () => {
      const invalidParams: BrewingParameters = {
        brewingMethod: 'pour-over',
        grinderModel: 'Test Grinder',
        grinderSetting: '10',
        waterTemperature: 120 // Too hot
      };

      const result = validateBrewingParameters(invalidParams);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.field === 'waterTemperature')).toBeDefined();
    });

    test('should reject water temperature too low', () => {
      const invalidParams: BrewingParameters = {
        brewingMethod: 'pour-over',
        grinderModel: 'Test Grinder',
        grinderSetting: '10',
        waterTemperature: 50 // Too cold
      };

      const result = validateBrewingParameters(invalidParams);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.field === 'waterTemperature')).toBeDefined();
    });

    test('should accept valid optional fields', () => {
      const validParams: BrewingParameters = {
        brewingMethod: 'french-press',
        grinderModel: 'Hand Grinder',
        grinderSetting: 'Coarse',
        waterTemperature: 94,
        filteringTools: 'Metal filter',
        waterQuality: 'Filtered tap water'
      };

      const result = validateBrewingParameters(validParams);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // RED: Test turbulence steps validation
  describe('validateTurbulenceSteps', () => {
    test('should accept valid turbulence steps', () => {
      const validSteps: TurbulenceStep[] = [
        {
          stepOrder: 1,
          actionType: 'bloom',
          actionTime: 30,
          volume: 50,
          technique: 'Gentle circular pour',
          description: 'Bloom pour to wet all grounds'
        },
        {
          stepOrder: 2,
          actionType: 'main-pour',
          actionTime: 120,
          volume: 200,
          technique: 'Steady center pour',
          description: 'Main pour in steady stream'
        }
      ];

      const result = validateTurbulenceSteps(validSteps);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept empty array (optional)', () => {
      const result = validateTurbulenceSteps([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject duplicate step orders', () => {
      const invalidSteps: TurbulenceStep[] = [
        {
          stepOrder: 1,
          actionType: 'bloom',
          actionTime: 30,
          volume: 50,
          technique: 'Pour',
          description: 'First step'
        },
        {
          stepOrder: 1, // Duplicate
          actionType: 'main-pour',
          actionTime: 60,
          volume: 100,
          technique: 'Pour',
          description: 'Second step'
        }
      ];

      const result = validateTurbulenceSteps(invalidSteps);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.message.includes('Duplicate'))).toBeDefined();
    });

    test('should reject negative values', () => {
      const invalidSteps: TurbulenceStep[] = [
        {
          stepOrder: 1,
          actionType: 'bloom',
          actionTime: -30, // Invalid
          volume: 50,
          technique: 'Pour',
          description: 'Test step'
        }
      ];

      const result = validateTurbulenceSteps(invalidSteps);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.field.includes('actionTime'))).toBeDefined();
    });
  });

  // RED: Test measurements validation
  describe('validateBrewMeasurements', () => {
    test('should accept valid measurements', () => {
      const validMeasurements: Omit<BrewMeasurements, 'coffeeToWaterRatio'> = {
        coffeeBeansWeight: 22,
        waterWeight: 350
      };

      const result = validateBrewMeasurements(validMeasurements);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject missing required fields', () => {
      const invalidMeasurements = {
        coffeeBeansWeight: 22
        // missing waterWeight
      } as Omit<BrewMeasurements, 'coffeeToWaterRatio'>;

      const result = validateBrewMeasurements(invalidMeasurements);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.field === 'waterWeight')).toBeDefined();
    });

    test('should reject zero or negative weights', () => {
      const invalidMeasurements: Omit<BrewMeasurements, 'coffeeToWaterRatio'> = {
        coffeeBeansWeight: 0,
        waterWeight: -100
      };

      const result = validateBrewMeasurements(invalidMeasurements);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    test('should reject unrealistic weight values', () => {
      const invalidMeasurements: Omit<BrewMeasurements, 'coffeeToWaterRatio'> = {
        coffeeBeansWeight: 200, // Too much coffee
        waterWeight: 10000 // Too much water
      };

      const result = validateBrewMeasurements(invalidMeasurements);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should accept valid optional fields', () => {
      const validMeasurements: Omit<BrewMeasurements, 'coffeeToWaterRatio'> = {
        coffeeBeansWeight: 22,
        waterWeight: 350,
        brewedCoffeeWeight: 320,
        tdsPercentage: 1.35
      };

      const result = validateBrewMeasurements(validMeasurements);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid TDS percentage', () => {
      const invalidMeasurements: Omit<BrewMeasurements, 'coffeeToWaterRatio'> = {
        coffeeBeansWeight: 22,
        waterWeight: 350,
        tdsPercentage: 5.0 // Too high
      };

      const result = validateBrewMeasurements(invalidMeasurements);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.field === 'tdsPercentage')).toBeDefined();
    });
  });

  // RED: Test evaluation validation
  describe('validateBrewEvaluation', () => {
    test('should accept valid quick evaluation', () => {
      const validEvaluation: BrewEvaluation = {
        type: 'quick',
        overallQuality: 8,
        notes: 'Great coffee!'
      };

      const result = validateBrewEvaluation(validEvaluation);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept valid SCA evaluation', () => {
      const validEvaluation: SCAEvaluation = {
        type: 'sca',
        scores: {
          aroma: 8,
          flavor: 8,
          aftertaste: 7,
          acidity: 8,
          body: 7,
          balance: 8,
          overall: 8
        },
        defects: 0,
        notes: 'Excellent cup'
      };

      const result = validateBrewEvaluation(validEvaluation);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid score ranges', () => {
      const invalidEvaluation: BrewEvaluation = {
        type: 'quick',
        overallQuality: 15, // Out of range
        notes: 'Test'
      };

      const result = validateBrewEvaluation(invalidEvaluation);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.field === 'overallQuality')).toBeDefined();
    });

    test('should reject negative defects in SCA', () => {
      const invalidEvaluation: SCAEvaluation = {
        type: 'sca',
        scores: {
          aroma: 8, flavor: 8, aftertaste: 7,
          acidity: 8, body: 7, balance: 8, overall: 8
        },
        defects: -2 // Invalid
      };

      const result = validateBrewEvaluation(invalidEvaluation);
      expect(result.isValid).toBe(false);
      expect(result.errors.find(e => e.field === 'defects')).toBeDefined();
    });
  });
});

describe('Brew Calculations', () => {
  
  // RED: Test ratio calculation
  describe('calculateBrewRatio', () => {
    test('should calculate correct coffee to water ratio', () => {
      const ratio = calculateBrewRatio(350, 22);
      expect(ratio).toBeCloseTo(15.91, 2);
    });

    test('should throw error for zero coffee weight', () => {
      expect(() => calculateBrewRatio(350, 0)).toThrow(BrewError);
    });

    test('should throw error for negative coffee weight', () => {
      expect(() => calculateBrewRatio(350, -22)).toThrow(BrewError);
    });

    test('should handle edge cases correctly', () => {
      const ratio = calculateBrewRatio(200, 10);
      expect(ratio).toBe(20);
    });
  });

  // RED: Test SCA score calculation
  describe('calculateSCAFinalScore', () => {
    test('should calculate correct SCA final score without defects', () => {
      const scores = {
        aroma: 8, flavor: 8, aftertaste: 7,
        acidity: 8, body: 7, balance: 8, overall: 8
      };
      const finalScore = calculateSCAFinalScore(scores, 0);
      expect(finalScore).toBe(54); // 8+8+7+8+7+8+8 = 54
    });

    test('should calculate correct SCA final score with defects', () => {
      const scores = {
        aroma: 8, flavor: 8, aftertaste: 7,
        acidity: 8, body: 7, balance: 8, overall: 8
      };
      const finalScore = calculateSCAFinalScore(scores, 2);
      expect(finalScore).toBe(52); // 54 - 2 = 52
    });

    test('should not return negative scores', () => {
      const scores = {
        aroma: 5, flavor: 5, aftertaste: 5,
        acidity: 5, body: 5, balance: 5, overall: 5
      };
      const finalScore = calculateSCAFinalScore(scores, 50);
      expect(finalScore).toBe(0); // Should not go negative
    });
  });

  // RED: Test extraction yield calculation
  describe('calculateExtractionYield', () => {
    test('should calculate extraction yield correctly', () => {
      const extractionYield = calculateExtractionYield(1.35, 320, 22);
      expect(extractionYield).toBeCloseTo(19.64, 2); // (1.35 * 320 / 22) = ~19.64%
    });

    test('should throw error for invalid inputs', () => {
      expect(() => calculateExtractionYield(0, 320, 22)).toThrow(BrewError);
      expect(() => calculateExtractionYield(1.35, 0, 22)).toThrow(BrewError);
      expect(() => calculateExtractionYield(1.35, 320, 0)).toThrow(BrewError);
    });

    test('should handle edge cases', () => {
      const extractionYield = calculateExtractionYield(2.0, 300, 20);
      expect(extractionYield).toBe(30); // (2.0 * 300 / 20) = 30%
    });
  });

  // RED: Test brew number generation
  describe('generateBrewNumber', () => {
    test('should generate correct brew number format', () => {
      const brewNumber = generateBrewNumber('user-123', 1);
      const currentYear = new Date().getFullYear();
      expect(brewNumber).toBe(`B-${currentYear}-001`);
    });

    test('should pad sequence numbers correctly', () => {
      const brewNumber = generateBrewNumber('user-123', 42);
      const currentYear = new Date().getFullYear();
      expect(brewNumber).toBe(`B-${currentYear}-042`);
    });

    test('should handle large sequence numbers', () => {
      const brewNumber = generateBrewNumber('user-123', 999);
      const currentYear = new Date().getFullYear();
      expect(brewNumber).toBe(`B-${currentYear}-999`);
    });
  });
});

describe('Complete Brew Request Validation', () => {
  
  // RED: Test complete request validation
  describe('validateCreateBrewRequest', () => {
    test('should accept valid complete brew request', () => {
      const validRequest: CreateBrewRequest = {
        userName: 'Morning Brew',
        beans: {
          brand: 'Ethiopian Coffee Co',
          origin: 'Yirgacheffe',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Baratza Encore',
          grinderSetting: '15',
          waterTemperature: 93
        },
        measurements: {
          coffeeBeansWeight: 22,
          waterWeight: 350
        },
        evaluation: {
          type: 'quick',
          overallQuality: 8,
          notes: 'Excellent cup!'
        }
      };

      const result = validateCreateBrewRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should collect all validation errors from all sections', () => {
      const invalidRequest = {
        beans: {
          brand: '',
          origin: 'Test Origin'
          // missing processingMethod
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test Grinder',
          grinderSetting: '10'
          // missing waterTemperature
        },
        measurements: {
          coffeeBeansWeight: 0,
          waterWeight: 350
        }
      } as CreateBrewRequest;

      const result = validateCreateBrewRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3); // At least 3 errors from different sections
    });

    test('should accept request without evaluation', () => {
      const validRequest: CreateBrewRequest = {
        beans: {
          brand: 'Test Coffee',
          origin: 'Test Origin',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test Grinder',
          grinderSetting: '10',
          waterTemperature: 90
        },
        measurements: {
          coffeeBeansWeight: 20,
          waterWeight: 300
        }
        // No evaluation
      };

      const result = validateCreateBrewRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept request without turbulence steps', () => {
      const validRequest: CreateBrewRequest = {
        beans: {
          brand: 'Test Coffee',
          origin: 'Test Origin',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'french-press',
          grinderModel: 'Test Grinder',
          grinderSetting: '10',
          waterTemperature: 90
        },
        measurements: {
          coffeeBeansWeight: 20,
          waterWeight: 300
        }
        // No turbulenceSteps
      };

      const result = validateCreateBrewRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});