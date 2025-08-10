// TASK-007C: Analytics Integration Testing - TDD Core
// RED: Write failing tests first for chart data accuracy and comparison validation

import { AnalyticsService } from '../analyticsService';
import { BrewComparisonService } from '../brewComparisonService';
import { BrewComparisonUtils } from '../../utils/brewComparisonUtils';
import { BrewRecord } from '../../types/brew';

// Mock data factory for comprehensive testing
const createTestBrewDataset = (): BrewRecord[] => {
  return [
    // High-quality Ethiopian pour-overs with consistent parameters
    {
      id: 'ethiopia-1',
      userId: 'test-user',
      brewNumber: 'B-001',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
      isShared: false,
      isFavorite: true,
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
        overallQuality: 8.8,
        notes: 'Excellent floral notes'
      }
    },
    {
      id: 'ethiopia-2',
      userId: 'test-user',
      brewNumber: 'B-002',
      createdAt: '2024-01-16T08:00:00Z',
      updatedAt: '2024-01-16T08:00:00Z',
      isShared: false,
      isFavorite: true,
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
        waterTemperature: 94,
        filteringTools: 'V60'
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 22,
        waterWeight: 352,
        coffeeToWaterRatio: 16.0,
        brewedCoffeeWeight: 322,
        tdsPercentage: 1.32
      },
      evaluation: {
        type: 'quick',
        overallQuality: 9.1,
        notes: 'Perfect balance'
      }
    },
    // Medium-quality Colombian french press brews
    {
      id: 'colombia-1',
      userId: 'test-user',
      brewNumber: 'B-003',
      createdAt: '2024-01-17T08:00:00Z',
      updatedAt: '2024-01-17T08:00:00Z',
      isShared: false,
      isFavorite: false,
      beans: {
        brand: 'Colombian Coffee',
        origin: 'Huila',
        processingMethod: 'natural',
        altitude: 1600,
        roastingLevel: 'medium'
      },
      parameters: {
        brewingMethod: 'french-press',
        grinderModel: 'Manual Grinder',
        grinderSetting: 'coarse',
        waterTemperature: 85,
        filteringTools: 'Metal filter'
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 30,
        waterWeight: 450,
        coffeeToWaterRatio: 15.0,
        brewedCoffeeWeight: 400,
        tdsPercentage: 1.45
      },
      evaluation: {
        type: 'quick',
        overallQuality: 7.2,
        notes: 'Good but missing complexity'
      }
    },
    {
      id: 'colombia-2',
      userId: 'test-user',
      brewNumber: 'B-004',
      createdAt: '2024-01-18T08:00:00Z',
      updatedAt: '2024-01-18T08:00:00Z',
      isShared: false,
      isFavorite: false,
      beans: {
        brand: 'Colombian Coffee',
        origin: 'Huila',
        processingMethod: 'natural',
        altitude: 1600,
        roastingLevel: 'medium'
      },
      parameters: {
        brewingMethod: 'french-press',
        grinderModel: 'Manual Grinder',
        grinderSetting: 'coarse',
        waterTemperature: 87,
        filteringTools: 'Metal filter'
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 32,
        waterWeight: 480,
        coffeeToWaterRatio: 15.0,
        brewedCoffeeWeight: 420,
        tdsPercentage: 1.50
      },
      evaluation: {
        type: 'quick',
        overallQuality: 7.5,
        notes: 'Better extraction'
      }
    },
    // SCA evaluated brews for comprehensive testing
    {
      id: 'sca-brew-1',
      userId: 'test-user',
      brewNumber: 'B-005',
      createdAt: '2024-01-19T08:00:00Z',
      updatedAt: '2024-01-19T08:00:00Z',
      isShared: false,
      isFavorite: true,
      beans: {
        brand: 'Specialty Roasters',
        origin: 'Kenya',
        processingMethod: 'washed',
        altitude: 2000,
        roastingLevel: 'medium-light'
      },
      parameters: {
        brewingMethod: 'pour-over',
        grinderModel: 'Comandante C40',
        grinderSetting: '18',
        waterTemperature: 92,
        filteringTools: 'Chemex'
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 24,
        waterWeight: 384,
        coffeeToWaterRatio: 16.0,
        brewedCoffeeWeight: 350,
        tdsPercentage: 1.28
      },
      evaluation: {
        type: 'sca',
        scores: {
          aroma: 1.2,
          flavor: 1.3,
          aftertaste: 1.1,
          acidity: 1.2,
          body: 1.0,
          balance: 1.2,
          overall: 1.2
        },
        defects: 0,
        notes: 'Professional SCA evaluation - exceptional'
      }
    },
    // Lower quality brew for contrast
    {
      id: 'poor-brew-1',
      userId: 'test-user',
      brewNumber: 'B-006',
      createdAt: '2024-01-20T08:00:00Z',
      updatedAt: '2024-01-20T08:00:00Z',
      isShared: false,
      isFavorite: false,
      beans: {
        brand: 'Budget Coffee',
        origin: 'Brazil',
        processingMethod: 'natural',
        roastingLevel: 'dark'
      },
      parameters: {
        brewingMethod: 'drip',
        grinderModel: 'Blade Grinder',
        grinderSetting: 'medium',
        waterTemperature: 98,
        filteringTools: 'Paper filter'
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 18,
        waterWeight: 300,
        coffeeToWaterRatio: 16.67,
        brewedCoffeeWeight: 280,
        tdsPercentage: 1.15
      },
      evaluation: {
        type: 'quick',
        overallQuality: 5.5,
        notes: 'Over-extracted and bitter'
      }
    },
    // Additional high-quality brews for statistical significance testing
    {
      id: 'high-quality-2',
      userId: 'test-user',
      brewNumber: 'B-007',
      createdAt: '2024-01-21T08:00:00Z',
      updatedAt: '2024-01-21T08:00:00Z',
      isShared: false,
      isFavorite: true,
      beans: {
        brand: 'Premium Ethiopian',
        origin: 'Sidamo',
        processingMethod: 'washed',
        altitude: 1900,
        roastingLevel: 'light'
      },
      parameters: {
        brewingMethod: 'pour-over',
        grinderModel: 'Baratza Virtuoso',
        grinderSetting: '14',
        waterTemperature: 92,
        filteringTools: 'V60'
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 21,
        waterWeight: 336,
        coffeeToWaterRatio: 16.0,
        brewedCoffeeWeight: 310,
        tdsPercentage: 1.40
      },
      evaluation: {
        type: 'quick',
        overallQuality: 9.2,
        notes: 'Exceptional clarity and sweetness'
      }
    },
    {
      id: 'high-quality-3',
      userId: 'test-user',
      brewNumber: 'B-008',
      createdAt: '2024-01-22T08:00:00Z',
      updatedAt: '2024-01-22T08:00:00Z',
      isShared: false,
      isFavorite: true,
      beans: {
        brand: 'Premium Ethiopian',
        origin: 'Yirgacheffe',
        processingMethod: 'natural',
        altitude: 1850,
        roastingLevel: 'light'
      },
      parameters: {
        brewingMethod: 'pour-over',
        grinderModel: 'Comandante C40',
        grinderSetting: '17',
        waterTemperature: 91,
        filteringTools: 'Chemex'
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 23,
        waterWeight: 368,
        coffeeToWaterRatio: 16.0,
        brewedCoffeeWeight: 340,
        tdsPercentage: 1.38
      },
      evaluation: {
        type: 'quick',
        overallQuality: 8.9,
        notes: 'Beautiful fruit notes'
      }
    },
    // Additional low-quality brews for statistical testing
    {
      id: 'low-quality-2',
      userId: 'test-user',
      brewNumber: 'B-009',
      createdAt: '2024-01-23T08:00:00Z',
      updatedAt: '2024-01-23T08:00:00Z',
      isShared: false,
      isFavorite: false,
      beans: {
        brand: 'Budget Coffee',
        origin: 'Brazil',
        processingMethod: 'natural',
        roastingLevel: 'dark'
      },
      parameters: {
        brewingMethod: 'drip',
        grinderModel: 'Blade Grinder',
        grinderSetting: 'fine',
        waterTemperature: 100,
        filteringTools: 'Paper filter'
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 16,
        waterWeight: 250,
        coffeeToWaterRatio: 15.6,
        brewedCoffeeWeight: 220,
        tdsPercentage: 1.60
      },
      evaluation: {
        type: 'quick',
        overallQuality: 4.8,
        notes: 'Burned and over-extracted'
      }
    },
    {
      id: 'low-quality-3',
      userId: 'test-user',
      brewNumber: 'B-010',
      createdAt: '2024-01-24T08:00:00Z',
      updatedAt: '2024-01-24T08:00:00Z',
      isShared: false,
      isFavorite: false,
      beans: {
        brand: 'Budget Coffee',
        origin: 'Brazil',
        processingMethod: 'natural',
        roastingLevel: 'dark'
      },
      parameters: {
        brewingMethod: 'instant',
        grinderModel: 'Pre-ground',
        grinderSetting: 'fine',
        waterTemperature: 95,
        filteringTools: 'None'
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 15,
        waterWeight: 240,
        coffeeToWaterRatio: 16.0,
        brewedCoffeeWeight: 240,
        tdsPercentage: 1.20
      },
      evaluation: {
        type: 'quick',
        overallQuality: 4.2,
        notes: 'Weak and lacking complexity'
      }
    }
  ];
};

describe('Analytics Integration Testing - TDD Core', () => {
  let testBrews: BrewRecord[];

  beforeEach(() => {
    testBrews = createTestBrewDataset();
  });

  describe('Chart Data Accuracy Tests', () => {
    test('should provide accurate data for quality trend analysis', () => {
      // RED: This test will initially fail - validating that analytics service 
      // provides data that matches comparison service calculations
      
      const statistics = AnalyticsService.calculateStatistics(testBrews);
      const insights = AnalyticsService.generateInsights(testBrews);

      // Validate total brews count
      expect(statistics.totalBrews).toBe(10);

      // Validate average quality calculation accuracy
      const manualQualityCalc = testBrews
        .map(brew => {
          if (brew.evaluation?.type === 'quick') {
            return brew.evaluation.overallQuality || 0;
          } else if (brew.evaluation?.type === 'sca' && brew.evaluation.scores) {
            const totalScore = Object.values(brew.evaluation.scores).reduce((sum, score) => sum + score, 0);
            const defects = brew.evaluation.defects || 0;
            return Math.max(0, totalScore - defects);
          }
          return 0;
        })
        .filter(q => q > 0)
        .reduce((sum, q) => sum + q, 0) / testBrews.filter(brew => {
          if (brew.evaluation?.type === 'quick') {
            return (brew.evaluation.overallQuality || 0) > 0;
          } else if (brew.evaluation?.type === 'sca' && brew.evaluation.scores) {
            return true;
          }
          return false;
        }).length;

      expect(Math.abs(statistics.averageQuality - manualQualityCalc)).toBeLessThan(0.01);

      // Validate method performance accuracy
      expect(statistics.mostUsedMethod).toBe('pour-over'); // 5 out of 10 brews
      expect(statistics.favoriteOrigin).toBeDefined();

      // Validate insights generation
      expect(insights).toBeDefined();
      expect(insights.length).toBeGreaterThan(0);
    });

    test('should provide accurate temperature correlation data for charts', () => {
      const correlationAnalysis = BrewComparisonService.analyzeCorrelations(testBrews);
      const insights = AnalyticsService.generateInsights(testBrews);

      // Temperature analysis should be consistent between services
      expect(correlationAnalysis.temperatureQualityCorrelation).toBeDefined();
      expect(correlationAnalysis.optimalTemperatureRange).toBeDefined();
      expect(correlationAnalysis.optimalTemperatureRange.min).toBeGreaterThanOrEqual(85);
      expect(correlationAnalysis.optimalTemperatureRange.max).toBeLessThanOrEqual(98);

      // Analytics insights should reference temperature optimization if correlation exists
      const tempInsight = insights.find(insight => insight.id === 'temperature_optimization');
      if (Math.abs(correlationAnalysis.temperatureQualityCorrelation) > 0.3) {
        expect(tempInsight).toBeDefined();
        expect(tempInsight?.dataPoints).toBeDefined();
        expect(tempInsight?.dataPoints?.length).toBeGreaterThan(0);
      }
    });

    test('should provide accurate ratio correlation data for charts', () => {
      const correlationAnalysis = BrewComparisonService.analyzeCorrelations(testBrews);
      const statistics = AnalyticsService.calculateStatistics(testBrews);

      // Ratio calculations should match
      const manualRatioCalc = testBrews
        .map(brew => brew.measurements.coffeeToWaterRatio)
        .filter(ratio => ratio && ratio > 0)
        .reduce((sum, r) => sum + r, 0) / testBrews.filter(b => b.measurements.coffeeToWaterRatio && b.measurements.coffeeToWaterRatio > 0).length;

      expect(Math.abs(statistics.averageRatio - manualRatioCalc)).toBeLessThan(0.01);

      // Optimal ranges should be reasonable
      expect(correlationAnalysis.optimalRatioRange.min).toBeGreaterThanOrEqual(14);
      expect(correlationAnalysis.optimalRatioRange.max).toBeLessThanOrEqual(18);
    });

    test('should provide accurate method performance data for comparison charts', () => {
      const methodComparison = BrewComparisonService.compareBrewingMethods(testBrews);
      const statistics = AnalyticsService.calculateStatistics(testBrews);

      // Method performance should be consistent
      expect(methodComparison['pour-over']).toBeDefined();
      expect(methodComparison['french-press']).toBeDefined();

      // Pour-over should perform better than french-press in this dataset
      expect(methodComparison['pour-over'].averageQuality).toBeGreaterThan(methodComparison['french-press'].averageQuality);

      // Statistics should reflect the best performing method
      expect(statistics.mostUsedMethod).toBe('pour-over');
    });

    test('should provide accurate quality distribution data for pie charts', () => {
      const statistics = AnalyticsService.calculateStatistics(testBrews);
      
      // Manual calculation of quality distribution
      const qualities = testBrews.map(brew => {
        if (brew.evaluation?.type === 'quick') return brew.evaluation.overallQuality || 0;
        if (brew.evaluation?.type === 'sca' && brew.evaluation.scores) {
          const totalScore = Object.values(brew.evaluation.scores).reduce((sum, score) => sum + score, 0);
          const defects = brew.evaluation.defects || 0;
          return Math.max(0, totalScore - defects);
        }
        return 0;
      }).filter(q => q > 0);

      const manualDistribution = {
        excellent: qualities.filter(q => q >= 9).length,
        good: qualities.filter(q => q >= 7 && q < 9).length,
        average: qualities.filter(q => q >= 5 && q < 7).length,
        poor: qualities.filter(q => q < 5).length
      };

      expect(statistics.qualityDistribution.excellent).toBe(manualDistribution.excellent);
      expect(statistics.qualityDistribution.good).toBe(manualDistribution.good);
      expect(statistics.qualityDistribution.average).toBe(manualDistribution.average);
      expect(statistics.qualityDistribution.poor).toBe(manualDistribution.poor);

      // Total should match
      const totalFromDistribution = Object.values(statistics.qualityDistribution).reduce((sum, count) => sum + count, 0);
      expect(totalFromDistribution).toBe(qualities.length);
    });
  });

  describe('Comparison Integration Tests', () => {
    test('should integrate comparison algorithms with analytics insights', () => {
      const insights = AnalyticsService.generateInsights(testBrews);
      const comparisons = testBrews.slice(0, 5).map(brew => 
        BrewComparisonService.findSimilarBrews(brew, testBrews.filter(b => b.id !== brew.id), 3)
      );

      // Insights should provide actionable recommendations
      const actionableInsights = insights.filter(insight => insight.actionable);
      expect(actionableInsights.length).toBeGreaterThan(0);

      // Comparison results should be consistent
      comparisons.forEach(similarBrews => {
        expect(similarBrews).toBeDefined();
        expect(Array.isArray(similarBrews)).toBe(true);
        similarBrews.forEach(result => {
          expect(result.brew).toBeDefined();
          expect(result.similarity.overallScore).toBeGreaterThanOrEqual(0);
          expect(result.similarity.overallScore).toBeLessThanOrEqual(1);
        });
      });
    });

    test('should provide consistent recommendations between services', () => {
      const insights = AnalyticsService.generateInsights(testBrews);
      const brewingRecommendations = BrewComparisonUtils.generateBrewingRecommendations(testBrews, 8.0);

      // Both services should identify similar optimization opportunities
      const tempInsight = insights.find(i => i.id === 'temperature_optimization');
      const tempRecommendation = brewingRecommendations.find(r => r.parameter === 'waterTemperature');

      if (tempInsight && tempRecommendation) {
        // Both should agree on temperature being important
        expect(tempInsight.type).toBe('optimization');
        expect(tempRecommendation.confidence).toBeGreaterThan(0);
      }

      const ratioInsight = insights.find(i => i.id === 'ratio_optimization');
      const ratioRecommendation = brewingRecommendations.find(r => r.parameter === 'coffeeToWaterRatio');

      if (ratioInsight && ratioRecommendation) {
        // Both should provide similar ratio guidance
        expect(ratioInsight.type).toBe('optimization');
        expect(ratioRecommendation.confidence).toBeGreaterThan(0);
      }
    });

    test('should provide accurate parameter optimization clusters', () => {
      const optimalCombinations = BrewComparisonUtils.findOptimalParameterCombinations(testBrews, 8.0);
      const methodComparison = BrewComparisonService.compareBrewingMethods(testBrews);

      // Optimal combinations should align with method performance
      if (optimalCombinations.length > 0) {
        const bestCombination = optimalCombinations[0];
        const methodPerf = methodComparison[bestCombination.combination.brewingMethod];
        
        expect(methodPerf).toBeDefined();
        expect(bestCombination.averageQuality).toBeGreaterThanOrEqual(8.0);
        expect(bestCombination.averageQuality).toBeCloseTo(methodPerf.averageQuality, 1);
      }
    });

    test('should provide accurate statistical significance testing', () => {
      const highQualityBrews = testBrews.filter(brew => {
        const quality = brew.evaluation?.type === 'quick' ? 
          (brew.evaluation.overallQuality || 0) : 
          (brew.evaluation?.type === 'sca' && brew.evaluation.scores ? 
            Object.values(brew.evaluation.scores).reduce((sum, score) => sum + score, 0) - (brew.evaluation.defects || 0) : 0);
        return quality >= 8.0;
      });

      const lowQualityBrews = testBrews.filter(brew => {
        const quality = brew.evaluation?.type === 'quick' ? 
          (brew.evaluation.overallQuality || 0) : 
          (brew.evaluation?.type === 'sca' && brew.evaluation.scores ? 
            Object.values(brew.evaluation.scores).reduce((sum, score) => sum + score, 0) - (brew.evaluation.defects || 0) : 0);
        return quality < 8.0 && quality > 0;
      });

      if (highQualityBrews.length >= 2 && lowQualityBrews.length >= 2) {
        const significance = BrewComparisonService.calculateStatisticalSignificance(
          highQualityBrews,
          lowQualityBrews
        );

        expect(significance.pValue).toBeDefined();
        expect(significance.isSignificant).toBeDefined();
        expect(significance.effectSize).toBeGreaterThanOrEqual(0);
        
        // With clearly different quality groups, should be significant
        expect(significance.isSignificant).toBe(true);
        expect(significance.pValue).toBeLessThan(0.05);
      }
    });
  });

  describe('Data Consistency Validation', () => {
    test('should maintain data integrity across all services', () => {
      const statistics = AnalyticsService.calculateStatistics(testBrews);
      const correlations = BrewComparisonService.analyzeCorrelations(testBrews);
      const consistencyAnalysis = BrewComparisonUtils.analyzeBrewingConsistency(testBrews);

      // All services should process the same data consistently
      expect(statistics.totalBrews).toBe(testBrews.length);
      
      // Temperature data should be consistent
      const brewsWithTemp = testBrews.filter(brew => brew.parameters.waterTemperature > 0);
      const avgTemp = brewsWithTemp.reduce((sum, brew) => sum + brew.parameters.waterTemperature, 0) / brewsWithTemp.length;
      expect(Math.abs(statistics.averageTemperature - avgTemp)).toBeLessThan(0.01);

      // Consistency analysis should reflect actual data variability
      expect(consistencyAnalysis.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(consistencyAnalysis.consistencyScore).toBeLessThanOrEqual(1);
      expect(consistencyAnalysis.variabilityFactors.length).toBeGreaterThan(0);
    });

    test('should handle edge cases consistently across all services', () => {
      // Test with minimal data
      const minimalBrews = testBrews.slice(0, 1);
      
      const minimalStats = AnalyticsService.calculateStatistics(minimalBrews);
      const minimalCorrelations = BrewComparisonService.analyzeCorrelations(minimalBrews);
      const minimalInsights = AnalyticsService.generateInsights(minimalBrews);

      expect(minimalStats).toBeDefined();
      expect(minimalCorrelations).toBeDefined();
      expect(minimalInsights).toBeDefined();
      expect(minimalInsights.length).toBeGreaterThan(0);
      expect(minimalInsights[0].id).toBe('insufficient_data');

      // Test with empty data
      const emptyStats = AnalyticsService.calculateStatistics([]);
      const emptyCorrelations = BrewComparisonService.analyzeCorrelations([]);
      const emptyInsights = AnalyticsService.generateInsights([]);

      expect(emptyStats.totalBrews).toBe(0);
      expect(emptyCorrelations.temperatureQualityCorrelation).toBe(0);
      expect(emptyInsights.length).toBeGreaterThan(0);
      expect(emptyInsights[0].id).toBe('insufficient_data');
    });

    test('should provide accurate cross-service data validation', () => {
      // Compare similar brews identified by comparison service with insights recommendations
      const targetBrew = testBrews.find(brew => brew.evaluation && 
        ((brew.evaluation.type === 'quick' && brew.evaluation.overallQuality && brew.evaluation.overallQuality > 8.5) ||
         (brew.evaluation.type === 'sca')));
      
      if (targetBrew) {
        const similarBrews = BrewComparisonService.findSimilarBrews(
          targetBrew, 
          testBrews.filter(b => b.id !== targetBrew.id), 
          3
        );

        const insights = AnalyticsService.generateInsights(testBrews);
        
        // If similar high-quality brews exist, insights should reflect optimization opportunities
        if (similarBrews.length > 0 && similarBrews[0].similarity.overallScore > 0.7) {
          const hasOptimizationInsight = insights.some(insight => 
            insight.type === 'optimization' && insight.priority === 'high'
          );
          
          // Should have actionable insights for optimization
          expect(insights.some(insight => insight.actionable)).toBe(true);
        }
      }
    });

    test('should ensure chart data accuracy for visualization components', () => {
      const statistics = AnalyticsService.calculateStatistics(testBrews);
      
      // Verify that all chart data percentages add up correctly
      const qualityTotal = Object.values(statistics.qualityDistribution).reduce((sum, count) => sum + count, 0);
      const brewsWithQuality = testBrews.filter(brew => 
        (brew.evaluation?.type === 'quick' && brew.evaluation.overallQuality && brew.evaluation.overallQuality > 0) ||
        (brew.evaluation?.type === 'sca' && brew.evaluation.scores)
      ).length;

      expect(qualityTotal).toBe(brewsWithQuality);

      // Frequency calculations should be mathematically sound (allowing for rounding differences)
      expect(statistics.brewingFrequency.weekly).toBeCloseTo(statistics.brewingFrequency.daily * 7, 1);
      expect(statistics.brewingFrequency.monthly).toBeCloseTo(statistics.brewingFrequency.daily * 30, 1);

      // All numeric values should be finite and reasonable
      expect(Number.isFinite(statistics.averageQuality)).toBe(true);
      expect(Number.isFinite(statistics.averageRatio)).toBe(true);
      expect(Number.isFinite(statistics.averageTemperature)).toBe(true);
      expect(statistics.averageQuality).toBeGreaterThanOrEqual(0);
      expect(statistics.averageQuality).toBeLessThanOrEqual(10);
    });
  });

  describe('Performance and Reliability Tests', () => {
    test('should handle large datasets efficiently', () => {
      // Create a large dataset for performance testing
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        ...testBrews[i % testBrews.length],
        id: `large-brew-${i}`,
        brewNumber: `B-${String(i + 1).padStart(3, '0')}`,
        createdAt: new Date(2024, 0, 1 + i).toISOString()
      }));

      const startTime = Date.now();
      
      const statistics = AnalyticsService.calculateStatistics(largeDataset);
      const insights = AnalyticsService.generateInsights(largeDataset);
      const correlations = BrewComparisonService.analyzeCorrelations(largeDataset);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should process large dataset in reasonable time (< 1 second)
      expect(processingTime).toBeLessThan(1000);

      // Results should still be accurate
      expect(statistics.totalBrews).toBe(100);
      expect(insights.length).toBeGreaterThan(0);
      expect(correlations).toBeDefined();
    });

    test('should maintain accuracy with mixed evaluation types', () => {
      const mixedBrews = testBrews; // Already contains both quick and SCA evaluations
      
      const statistics = AnalyticsService.calculateStatistics(mixedBrews);
      const insights = AnalyticsService.generateInsights(mixedBrews);

      // Should handle mixed evaluation types correctly
      expect(statistics.averageQuality).toBeGreaterThan(0);
      expect(insights.length).toBeGreaterThan(0);

      // Manual verification of mixed quality calculation
      const manualQualityCalc = mixedBrews.map(brew => {
        if (brew.evaluation?.type === 'quick') {
          return brew.evaluation.overallQuality || 0;
        } else if (brew.evaluation?.type === 'sca' && brew.evaluation.scores) {
          const totalScore = Object.values(brew.evaluation.scores).reduce((sum, score) => sum + score, 0);
          const defects = brew.evaluation.defects || 0;
          return Math.max(0, totalScore - defects);
        }
        return 0;
      }).filter(q => q > 0);

      const manualAvg = manualQualityCalc.reduce((sum, q) => sum + q, 0) / manualQualityCalc.length;
      expect(Math.abs(statistics.averageQuality - manualAvg)).toBeLessThan(0.1);
    });
  });
});