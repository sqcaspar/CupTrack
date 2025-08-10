// TASK-007B: Brew Comparison & Analysis - TDD Core
// REFACTOR: Additional utility functions and optimized algorithms

import { BrewRecord } from '../types/brew';
import { BrewComparisonService } from '../services/brewComparisonService';

/**
 * Advanced utilities for brew comparison and analysis
 */
export class BrewComparisonUtils {
  
  /**
   * Find the most influential parameters for brew quality
   */
  static findMostInfluentialParameters(brews: BrewRecord[]): {
    parameter: string;
    correlation: number;
    influence: 'positive' | 'negative' | 'neutral';
    confidence: 'high' | 'medium' | 'low';
  }[] {
    const analysis = BrewComparisonService.analyzeCorrelations(brews);
    
    return analysis.strengthCorrelations
      .map(correlation => ({
        parameter: correlation.parameter,
        correlation: Math.abs(correlation.value),
        influence: (correlation.value > 0.1 ? 'positive' : 
                  correlation.value < -0.1 ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral',
        confidence: (Math.abs(correlation.value) > 0.7 ? 'high' :
                   Math.abs(correlation.value) > 0.3 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
      }))
      .sort((a, b) => b.correlation - a.correlation);
  }

  /**
   * Generate brewing recommendations based on comparison analysis
   */
  static generateBrewingRecommendations(
    userBrews: BrewRecord[], 
    targetQuality: number = 8.5
  ): {
    recommendation: string;
    parameter: string;
    currentAverage: number;
    suggestedRange: [number, number];
    expectedImprovement: number;
    confidence: number;
  }[] {
    if (userBrews.length < 5) {
      return [{
        recommendation: 'Log more brews to get personalized recommendations',
        parameter: 'data_collection',
        currentAverage: 0,
        suggestedRange: [5, 10] as [number, number],
        expectedImprovement: 0,
        confidence: 0
      }];
    }

    const analysis = BrewComparisonService.analyzeCorrelations(userBrews);
    const currentQuality = this.getAverageQuality(userBrews);
    const recommendations = [];

    // Temperature recommendations
    if (Math.abs(analysis.temperatureQualityCorrelation) > 0.3) {
      const currentTemp = this.getAverageTemperature(userBrews);
      const optimalRange = analysis.optimalTemperatureRange;
      
      if (currentTemp < optimalRange.min || currentTemp > optimalRange.max) {
        recommendations.push({
          recommendation: `Adjust water temperature to ${optimalRange.min}°C - ${optimalRange.max}°C range`,
          parameter: 'waterTemperature',
          currentAverage: currentTemp,
          suggestedRange: [optimalRange.min, optimalRange.max] as [number, number],
          expectedImprovement: Math.abs(analysis.temperatureQualityCorrelation) * 2,
          confidence: Math.abs(analysis.temperatureQualityCorrelation)
        });
      }
    }

    // Ratio recommendations  
    if (Math.abs(analysis.ratioQualityCorrelation) > 0.3) {
      const currentRatio = this.getAverageRatio(userBrews);
      const optimalRange = analysis.optimalRatioRange;
      
      if (currentRatio < optimalRange.min || currentRatio > optimalRange.max) {
        recommendations.push({
          recommendation: `Adjust coffee-to-water ratio to ${optimalRange.min}:1 - ${optimalRange.max}:1 range`,
          parameter: 'coffeeToWaterRatio',
          currentAverage: currentRatio,
          suggestedRange: [optimalRange.min, optimalRange.max] as [number, number],
          expectedImprovement: Math.abs(analysis.ratioQualityCorrelation) * 1.5,
          confidence: Math.abs(analysis.ratioQualityCorrelation)
        });
      }
    }

    // Method recommendations
    const methodPerformance = BrewComparisonService.compareBrewingMethods(userBrews);
    const methodEntries = Object.entries(methodPerformance);
    
    if (methodEntries.length > 1) {
      const bestMethod = methodEntries.reduce((a, b) => 
        a[1].averageQuality > b[1].averageQuality ? a : b
      );
      
      const currentMethod = this.getMostUsedMethod(userBrews);
      
      if (bestMethod[0] !== currentMethod && bestMethod[1].averageQuality > currentQuality + 0.5) {
        recommendations.push({
          recommendation: `Try ${bestMethod[0]} brewing method more often`,
          parameter: 'brewingMethod',
          currentAverage: methodPerformance[currentMethod]?.averageQuality || currentQuality,
          suggestedRange: [bestMethod[1].averageQuality - 0.5, bestMethod[1].averageQuality + 0.5] as [number, number],
          expectedImprovement: bestMethod[1].averageQuality - currentQuality,
          confidence: bestMethod[1].brewCount >= 3 ? 0.8 : 0.5
        });
      }
    }

    return recommendations.sort((a, b) => b.expectedImprovement - a.expectedImprovement);
  }

  /**
   * Identify brewing patterns and consistency issues
   */
  static analyzeBrewingConsistency(brews: BrewRecord[]): {
    consistencyScore: number;
    variabilityFactors: {
      parameter: string;
      standardDeviation: number;
      coefficient: number;
    }[];
    recommendations: string[];
  } {
    if (brews.length < 3) {
      return {
        consistencyScore: 0,
        variabilityFactors: [],
        recommendations: ['Need more brews to analyze consistency']
      };
    }

    // Calculate variability for different parameters
    const temperatures = brews.map(b => b.parameters.waterTemperature);
    const ratios = brews.map(b => b.measurements.coffeeToWaterRatio || 0).filter(r => r > 0);
    const coffeeWeights = brews.map(b => b.measurements.coffeeBeansWeight);
    const qualities = brews.map(b => this.getBrewQuality(b)).filter(q => q > 0);

    const variabilityFactors = [
      {
        parameter: 'waterTemperature',
        standardDeviation: this.calculateStandardDeviation(temperatures),
        coefficient: this.calculateCoefficientOfVariation(temperatures)
      },
      {
        parameter: 'coffeeToWaterRatio', 
        standardDeviation: this.calculateStandardDeviation(ratios),
        coefficient: this.calculateCoefficientOfVariation(ratios)
      },
      {
        parameter: 'coffeeBeansWeight',
        standardDeviation: this.calculateStandardDeviation(coffeeWeights),
        coefficient: this.calculateCoefficientOfVariation(coffeeWeights)
      },
      {
        parameter: 'quality',
        standardDeviation: this.calculateStandardDeviation(qualities),
        coefficient: this.calculateCoefficientOfVariation(qualities)
      }
    ].sort((a, b) => b.coefficient - a.coefficient);

    // Calculate overall consistency score (lower variability = higher score)
    const avgCoefficient = variabilityFactors.reduce((sum, f) => sum + f.coefficient, 0) / variabilityFactors.length;
    const consistencyScore = Math.max(0, 1 - (avgCoefficient / 0.5)); // Normalize to 0-1

    // Generate recommendations
    const recommendations = [];
    if (variabilityFactors[0].coefficient > 0.15) {
      recommendations.push(`Focus on ${variabilityFactors[0].parameter} consistency - it varies the most`);
    }
    if (consistencyScore < 0.6) {
      recommendations.push('Work on maintaining more consistent brewing parameters');
    }
    if (qualities.length > 0 && this.calculateStandardDeviation(qualities) > 1.5) {
      recommendations.push('Quality varies significantly - focus on process consistency');
    }

    return {
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      variabilityFactors,
      recommendations
    };
  }

  /**
   * Find optimal parameter combinations using clustering analysis
   */
  static findOptimalParameterCombinations(brews: BrewRecord[], minQuality: number = 8.0): {
    combination: {
      brewingMethod: string;
      temperatureRange: [number, number];
      ratioRange: [number, number];
    };
    averageQuality: number;
    brewCount: number;
    consistency: number;
  }[] {
    // Filter high-quality brews
    const highQualityBrews = brews.filter(brew => this.getBrewQuality(brew) >= minQuality);
    
    if (highQualityBrews.length < 3) {
      return [];
    }

    // Group by brewing method
    const methodGroups: Record<string, BrewRecord[]> = {};
    highQualityBrews.forEach(brew => {
      const method = brew.parameters.brewingMethod;
      if (!methodGroups[method]) {
        methodGroups[method] = [];
      }
      methodGroups[method].push(brew);
    });

    // Analyze each method group
    const combinations = Object.entries(methodGroups)
      .filter(([, brews]) => brews.length >= 2) // Need at least 2 brews
      .map(([method, methodBrews]) => {
        const qualities = methodBrews.map(b => this.getBrewQuality(b));
        const temperatures = methodBrews.map(b => b.parameters.waterTemperature);
        const ratios = methodBrews.map(b => b.measurements.coffeeToWaterRatio || 0).filter(r => r > 0);

        const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
        const consistency = 1 - this.calculateCoefficientOfVariation(qualities);

        return {
          combination: {
            brewingMethod: method,
            temperatureRange: [Math.min(...temperatures), Math.max(...temperatures)] as [number, number],
            ratioRange: ratios.length > 0 ? [Math.min(...ratios), Math.max(...ratios)] as [number, number] : [15, 16] as [number, number]
          },
          averageQuality: Math.round(avgQuality * 100) / 100,
          brewCount: methodBrews.length,
          consistency: Math.round(consistency * 100) / 100
        };
      });

    return combinations.sort((a, b) => b.averageQuality - a.averageQuality);
  }

  // Helper methods
  private static getBrewQuality(brew: BrewRecord): number {
    if (!brew.evaluation) return 0;
    
    if (brew.evaluation.type === 'quick') {
      return brew.evaluation.overallQuality || 0;
    }
    
    if (brew.evaluation.type === 'sca' && brew.evaluation.scores) {
      const totalScore = Object.values(brew.evaluation.scores).reduce((sum, score) => sum + score, 0);
      const defects = (brew.evaluation as any).defects?.totalPenalty || 0 || 0;
      return Math.max(0, totalScore - defects);
    }
    
    return 0;
  }

  private static getAverageQuality(brews: BrewRecord[]): number {
    const qualities = brews.map(b => this.getBrewQuality(b)).filter(q => q > 0);
    return qualities.length > 0 ? qualities.reduce((sum, q) => sum + q, 0) / qualities.length : 0;
  }

  private static getAverageTemperature(brews: BrewRecord[]): number {
    const temps = brews.map(b => b.parameters.waterTemperature);
    return temps.reduce((sum, t) => sum + t, 0) / temps.length;
  }

  private static getAverageRatio(brews: BrewRecord[]): number {
    const ratios = brews.map(b => b.measurements.coffeeToWaterRatio || 0).filter(r => r > 0);
    return ratios.length > 0 ? ratios.reduce((sum, r) => sum + r, 0) / ratios.length : 0;
  }

  private static getMostUsedMethod(brews: BrewRecord[]): string {
    const methodCounts: Record<string, number> = {};
    brews.forEach(brew => {
      const method = brew.parameters.brewingMethod;
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    
    return Object.keys(methodCounts).reduce((a, b) => 
      methodCounts[a] > methodCounts[b] ? a : b, ''
    );
  }

  private static calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private static calculateCoefficientOfVariation(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = this.calculateStandardDeviation(values);
    
    return mean === 0 ? 0 : stdDev / Math.abs(mean);
  }
}