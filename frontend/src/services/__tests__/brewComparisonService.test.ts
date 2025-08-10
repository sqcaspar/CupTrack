// TASK-007B: Brew Comparison & Analysis - TDD Core
// RED: Write failing tests first for comparison algorithms and statistical calculations

import { BrewComparisonService, ComparisonResult, BrewSimilarity, StatisticalAnalysis } from '../brewComparisonService';
import { BrewRecord } from '../../types/brew';

// Mock brew data for testing
const createMockBrew = (overrides: Partial<BrewRecord> = {}): BrewRecord => ({
  id: 'brew-test-123',
  userId: 'user-123',
  brewNumber: 'B-2024-001',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  isShared: false,
  isFavorite: false,
  beans: {
    brand: 'Ethiopian Coffee Co',
    origin: 'Yirgacheffe',
    processingMethod: 'washed',
    altitude: 1800,
    roastingLevel: 'light'
  },
  parameters: {
    brewingMethod: 'pour-over',
    grinderModel: 'Baratza Encore',
    grinderSetting: '15',
    waterTemperature: 93,
    filteringTools: 'V60'
  },
  turbulenceSteps: [],
  measurements: {
    coffeeBeansWeight: 22,
    waterWeight: 350,
    coffeeToWaterRatio: 15.91,
    brewedCoffeeWeight: 320,
    tdsPercentage: 1.35
  },
  evaluation: {
    type: 'quick',
    overallQuality: 8.5,
    notes: 'Excellent balance'
  },
  ...overrides
});

describe('BrewComparisonService - TDD Core', () => {
  describe('Basic Comparison Calculations', () => {
    test('should calculate parameter differences between two brews', () => {
      // RED: This test will fail initially as the service doesn't exist yet
      const brew1 = createMockBrew({
        parameters: { 
          brewingMethod: 'pour-over', 
          grinderModel: 'Baratza Encore', 
          grinderSetting: '15', 
          waterTemperature: 93 
        },
        measurements: { 
          coffeeBeansWeight: 22, 
          waterWeight: 350, 
          coffeeToWaterRatio: 15.91 
        }
      });

      const brew2 = createMockBrew({
        id: 'brew-test-456',
        parameters: { 
          brewingMethod: 'pour-over', 
          grinderModel: 'Baratza Encore', 
          grinderSetting: '12', 
          waterTemperature: 96 
        },
        measurements: { 
          coffeeBeansWeight: 20, 
          waterWeight: 300, 
          coffeeToWaterRatio: 15.0 
        }
      });

      const result = BrewComparisonService.compareBrews(brew1, brew2);

      expect(result.parameterDifferences).toBeDefined();
      expect(result.parameterDifferences.waterTemperature).toBe(-3); // 93 - 96
      expect(result.parameterDifferences.coffeeBeansWeight).toBe(2); // 22 - 20
      expect(result.parameterDifferences.waterWeight).toBe(50); // 350 - 300
      expect(result.parameterDifferences.coffeeToWaterRatio).toBeCloseTo(0.91, 2); // 15.91 - 15.0
    });

    test('should calculate quality difference between brews', () => {
      const brew1 = createMockBrew({
        evaluation: { type: 'quick', overallQuality: 8.5, notes: 'Great' }
      });

      const brew2 = createMockBrew({
        id: 'brew-test-456',
        evaluation: { type: 'quick', overallQuality: 7.2, notes: 'Good' }
      });

      const result = BrewComparisonService.compareBrews(brew1, brew2);

      expect(result.qualityDifference).toBeCloseTo(1.3, 1); // 8.5 - 7.2
      expect(result.betterBrew).toBe(brew1.id);
    });

    test('should handle SCA evaluation differences', () => {
      const brew1 = createMockBrew({
        evaluation: {
          type: 'sca',
          scores: {
            aroma: 8.0,
            flavor: 8.5,
            aftertaste: 7.5,
            acidity: 8.0,
            body: 7.0,
            balance: 8.0,
            overall: 8.0
          },
          defects: 0,
          notes: 'Professional evaluation'
        }
      });

      const brew2 = createMockBrew({
        id: 'brew-test-456',
        evaluation: {
          type: 'sca',
          scores: {
            aroma: 7.5,
            flavor: 8.0,
            aftertaste: 7.0,
            acidity: 7.5,
            body: 6.5,
            balance: 7.5,
            overall: 7.5
          },
          defects: 2,
          notes: 'Good but with defects'
        }
      });

      const result = BrewComparisonService.compareBrews(brew1, brew2);

      // Total scores: brew1 = 55.0 - 0 = 55.0, brew2 = 51.5 - 2 = 49.5
      expect(result.qualityDifference).toBeCloseTo(5.5, 1);
      expect(result.scaScoreDifferences).toBeDefined();
      expect(result.scaScoreDifferences!.aroma).toBe(0.5);
      expect(result.scaScoreDifferences!.flavor).toBe(0.5);
    });
  });

  describe('Similarity Analysis', () => {
    test('should calculate similarity score between two brews', () => {
      const brew1 = createMockBrew();
      const brew2 = createMockBrew({
        id: 'brew-test-456',
        beans: { ...brew1.beans, brand: 'Different Coffee Co' }, // Different brand
        parameters: { ...brew1.parameters, waterTemperature: 95 }, // Different temp
        measurements: { ...brew1.measurements, coffeeBeansWeight: 20 } // Different weight
      });

      const similarity = BrewComparisonService.calculateSimilarity(brew1, brew2);

      expect(similarity.overallScore).toBeGreaterThan(0);
      expect(similarity.overallScore).toBeLessThan(1);
      expect(similarity.beansScore).toBeGreaterThan(0.7); // Same origin, processing
      expect(similarity.parametersScore).toBeGreaterThan(0.8); // Similar params
      expect(similarity.measurementsScore).toBeGreaterThan(0.8); // Similar measurements
    });

    test('should return high similarity for identical brews', () => {
      const brew1 = createMockBrew();
      const brew2 = createMockBrew({ id: 'different-id' });

      const similarity = BrewComparisonService.calculateSimilarity(brew1, brew2);

      expect(similarity.overallScore).toBeGreaterThan(0.95);
      expect(similarity.beansScore).toBeGreaterThan(0.95);
      expect(similarity.parametersScore).toBeGreaterThan(0.95);
      expect(similarity.measurementsScore).toBeGreaterThan(0.95);
    });

    test('should return low similarity for completely different brews', () => {
      const brew1 = createMockBrew();
      const brew2 = createMockBrew({
        id: 'different-brew',
        beans: {
          brand: 'Colombian Coffee',
          origin: 'Huila',
          processingMethod: 'natural'
        },
        parameters: {
          brewingMethod: 'french-press',
          grinderModel: 'Manual Grinder',
          grinderSetting: 'coarse',
          waterTemperature: 85
        },
        measurements: {
          coffeeBeansWeight: 30,
          waterWeight: 450,
          coffeeToWaterRatio: 15.0
        }
      });

      const similarity = BrewComparisonService.calculateSimilarity(brew1, brew2);

      expect(similarity.overallScore).toBeLessThan(0.3);
    });
  });

  describe('Statistical Analysis', () => {
    test('should calculate correlation between parameters and quality', () => {
      const brews = [
        createMockBrew({ 
          id: '1', 
          parameters: { ...createMockBrew().parameters, waterTemperature: 85 },
          evaluation: { type: 'quick', overallQuality: 6.0, notes: '' }
        }),
        createMockBrew({ 
          id: '2', 
          parameters: { ...createMockBrew().parameters, waterTemperature: 90 },
          evaluation: { type: 'quick', overallQuality: 7.5, notes: '' }
        }),
        createMockBrew({ 
          id: '3', 
          parameters: { ...createMockBrew().parameters, waterTemperature: 95 },
          evaluation: { type: 'quick', overallQuality: 8.5, notes: '' }
        }),
        createMockBrew({ 
          id: '4', 
          parameters: { ...createMockBrew().parameters, waterTemperature: 100 },
          evaluation: { type: 'quick', overallQuality: 7.0, notes: '' }
        })
      ];

      const analysis = BrewComparisonService.analyzeCorrelations(brews);

      expect(analysis.temperatureQualityCorrelation).toBeDefined();
      expect(analysis.ratioQualityCorrelation).toBeDefined();
      expect(analysis.strengthCorrelations).toHaveLength(4); // temp, ratio, coffee weight, water weight
      
      // Temperature should show some positive correlation up to a point
      expect(Math.abs(analysis.temperatureQualityCorrelation)).toBeGreaterThan(0);
    });

    test('should identify optimal parameter ranges', () => {
      const brews = Array.from({ length: 20 }, (_, i) => 
        createMockBrew({
          id: `brew-${i}`,
          parameters: {
            ...createMockBrew().parameters,
            waterTemperature: 85 + (i % 15), // 85-100°C range
          },
          measurements: {
            ...createMockBrew().measurements,
            coffeeToWaterRatio: 14 + (i % 4), // 14-18:1 range
          },
          evaluation: {
            type: 'quick',
            overallQuality: 5 + (i % 5) + Math.random(), // 5-10 range with variation
            notes: ''
          }
        })
      );

      const analysis = BrewComparisonService.analyzeCorrelations(brews);
      
      expect(analysis.optimalTemperatureRange).toBeDefined();
      expect(analysis.optimalTemperatureRange.min).toBeGreaterThanOrEqual(85);
      expect(analysis.optimalTemperatureRange.max).toBeLessThanOrEqual(100);
      expect(analysis.optimalRatioRange).toBeDefined();
      expect(analysis.optimalRatioRange.min).toBeGreaterThanOrEqual(14);
      expect(analysis.optimalRatioRange.max).toBeLessThanOrEqual(18);
    });

    test('should handle insufficient data gracefully', () => {
      const brews = [createMockBrew()]; // Only one brew

      const analysis = BrewComparisonService.analyzeCorrelations(brews);

      expect(analysis.temperatureQualityCorrelation).toBe(0);
      expect(analysis.ratioQualityCorrelation).toBe(0);
      expect(analysis.strengthCorrelations).toHaveLength(4);
      expect(analysis.strengthCorrelations.every(c => c.value === 0)).toBe(true);
    });
  });

  describe('Advanced Comparison Features', () => {
    test('should find similar brews in a collection', () => {
      const targetBrew = createMockBrew({
        beans: { brand: 'Ethiopian Coffee', origin: 'Yirgacheffe', processingMethod: 'washed' },
        parameters: { brewingMethod: 'pour-over', grinderModel: 'Baratza', grinderSetting: '15', waterTemperature: 93 }
      });

      const brewCollection = [
        createMockBrew({ 
          id: 'similar-1',
          beans: { brand: 'Ethiopian Specialty', origin: 'Yirgacheffe', processingMethod: 'washed' },
          parameters: { brewingMethod: 'pour-over', grinderModel: 'Baratza', grinderSetting: '14', waterTemperature: 94 }
        }),
        createMockBrew({ 
          id: 'different-1',
          beans: { brand: 'Colombian', origin: 'Huila', processingMethod: 'natural' },
          parameters: { brewingMethod: 'french-press', grinderModel: 'Manual', grinderSetting: 'coarse', waterTemperature: 85 }
        }),
        createMockBrew({ 
          id: 'similar-2',
          beans: { brand: 'Ethiopia Premium', origin: 'Yirgacheffe', processingMethod: 'washed' },
          parameters: { brewingMethod: 'pour-over', grinderModel: 'Comandante', grinderSetting: '16', waterTemperature: 92 }
        })
      ];

      const similarBrews = BrewComparisonService.findSimilarBrews(targetBrew, brewCollection, 3);

      expect(similarBrews).toHaveLength(3);
      expect(similarBrews[0].similarity.overallScore).toBeGreaterThan(similarBrews[1].similarity.overallScore);
      expect(similarBrews[1].similarity.overallScore).toBeGreaterThan(similarBrews[2].similarity.overallScore);
      
      // First two should be the Ethiopian brews
      expect(similarBrews[0].brew.id).toMatch(/similar-/);
      expect(similarBrews[1].brew.id).toMatch(/similar-/);
      expect(similarBrews[2].brew.id).toBe('different-1');
    });

    test('should rank brews by quality within similar parameters', () => {
      const referenceParams = {
        brewingMethod: 'pour-over' as const,
        waterTemperatureRange: [92, 96] as [number, number],
        ratioRange: [15, 17] as [number, number]
      };

      const brews = [
        createMockBrew({ 
          id: 'low-quality',
          parameters: { brewingMethod: 'pour-over', grinderModel: 'Test', grinderSetting: '15', waterTemperature: 94 },
          measurements: { coffeeBeansWeight: 20, waterWeight: 320, coffeeToWaterRatio: 16 },
          evaluation: { type: 'quick', overallQuality: 6.5, notes: '' }
        }),
        createMockBrew({ 
          id: 'high-quality',
          parameters: { brewingMethod: 'pour-over', grinderModel: 'Test', grinderSetting: '15', waterTemperature: 93 },
          measurements: { coffeeBeansWeight: 22, waterWeight: 352, coffeeToWaterRatio: 16 },
          evaluation: { type: 'quick', overallQuality: 9.0, notes: '' }
        }),
        createMockBrew({ 
          id: 'different-method',
          parameters: { brewingMethod: 'french-press', grinderModel: 'Test', grinderSetting: 'coarse', waterTemperature: 85 },
          measurements: { coffeeBeansWeight: 30, waterWeight: 450, coffeeToWaterRatio: 15 },
          evaluation: { type: 'quick', overallQuality: 8.0, notes: '' }
        })
      ];

      const rankedBrews = BrewComparisonService.rankSimilarBrews(referenceParams, brews);

      expect(rankedBrews).toHaveLength(2); // Only pour-over brews should match
      expect(rankedBrews[0].brew.id).toBe('high-quality');
      expect(rankedBrews[1].brew.id).toBe('low-quality');
      expect(rankedBrews[0].matchScore).toBeGreaterThan(rankedBrews[1].matchScore);
    });
  });

  describe('Performance Analysis', () => {
    test('should analyze brewing method performance differences', () => {
      const pourOverBrews = Array.from({ length: 10 }, (_, i) => 
        createMockBrew({
          id: `pour-${i}`,
          parameters: { brewingMethod: 'pour-over', grinderModel: 'Test', grinderSetting: '15', waterTemperature: 93 },
          evaluation: { type: 'quick', overallQuality: 7 + Math.random() * 2, notes: '' } // 7-9 range
        })
      );

      const frenchPressBrews = Array.from({ length: 10 }, (_, i) => 
        createMockBrew({
          id: `french-${i}`,
          parameters: { brewingMethod: 'french-press', grinderModel: 'Test', grinderSetting: 'coarse', waterTemperature: 85 },
          evaluation: { type: 'quick', overallQuality: 6 + Math.random() * 2, notes: '' } // 6-8 range
        })
      );

      const allBrews = [...pourOverBrews, ...frenchPressBrews];
      const comparison = BrewComparisonService.compareBrewingMethods(allBrews);

      expect(comparison['pour-over']).toBeDefined();
      expect(comparison['french-press']).toBeDefined();
      expect(comparison['pour-over'].averageQuality).toBeGreaterThan(comparison['french-press'].averageQuality);
      expect(comparison['pour-over'].brewCount).toBe(10);
      expect(comparison['french-press'].brewCount).toBe(10);
    });

    test('should calculate statistical significance of differences', () => {
      // Create two clearly different groups for statistical testing
      const highQualityBrews = Array.from({ length: 15 }, (_, i) => 
        createMockBrew({
          id: `high-${i}`,
          evaluation: { type: 'quick', overallQuality: 8.0 + Math.random() * 1.0, notes: '' } // 8-9 range
        })
      );

      const lowQualityBrews = Array.from({ length: 15 }, (_, i) => 
        createMockBrew({
          id: `low-${i}`,
          evaluation: { type: 'quick', overallQuality: 6.0 + Math.random() * 1.0, notes: '' } // 6-7 range
        })
      );

      const significance = BrewComparisonService.calculateStatisticalSignificance(
        highQualityBrews,
        lowQualityBrews
      );

      expect(significance.pValue).toBeLessThan(0.05); // Should be statistically significant
      expect(significance.isSignificant).toBe(true);
      expect(significance.effectSize).toBeGreaterThan(0.5); // Large effect size expected
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle brews with missing evaluation data', () => {
      const brew1 = createMockBrew();
      const brew2 = createMockBrew({ 
        id: 'no-eval', 
        evaluation: undefined 
      });

      const result = BrewComparisonService.compareBrews(brew1, brew2);

      expect(result.qualityDifference).toBe(0); // Should handle missing data gracefully
      expect(result.betterBrew).toBeNull();
    });

    test('should handle brews with different evaluation types', () => {
      const quickBrew = createMockBrew({
        evaluation: { type: 'quick', overallQuality: 8.0, notes: '' }
      });

      const scaBrew = createMockBrew({
        id: 'sca-brew',
        evaluation: {
          type: 'sca',
          scores: { aroma: 8, flavor: 8, aftertaste: 7, acidity: 8, body: 7, balance: 8, overall: 8 },
          defects: 0,
          notes: ''
        }
      });

      const result = BrewComparisonService.compareBrews(quickBrew, scaBrew);

      expect(result.qualityDifference).toBeDefined();
      expect(result.scaScoreDifferences).toBeUndefined(); // Should not compare SCA scores
    });

    test('should handle empty brew collections', () => {
      const targetBrew = createMockBrew();
      const emptyCollection: BrewRecord[] = [];

      const similarBrews = BrewComparisonService.findSimilarBrews(targetBrew, emptyCollection, 5);

      expect(similarBrews).toHaveLength(0);
    });

    test('should handle invalid parameter ranges', () => {
      const invalidRangeParams = {
        brewingMethod: 'pour-over' as const,
        waterTemperatureRange: [100, 80] as [number, number], // Invalid: max < min
        ratioRange: [20, 10] as [number, number] // Invalid: max < min
      };

      const brews = [createMockBrew()];

      const rankedBrews = BrewComparisonService.rankSimilarBrews(invalidRangeParams, brews);

      expect(rankedBrews).toHaveLength(0); // Should handle invalid ranges gracefully
    });
  });
});