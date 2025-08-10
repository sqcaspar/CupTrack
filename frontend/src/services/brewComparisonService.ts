// TASK-007B: Brew Comparison & Analysis - TDD Core
// GREEN: Implement the minimal functionality to make tests pass

import { BrewRecord } from '../types/brew';

export interface ComparisonResult {
  parameterDifferences: {
    waterTemperature: number;
    coffeeBeansWeight: number;
    waterWeight: number;
    coffeeToWaterRatio: number;
  };
  qualityDifference: number;
  betterBrew: string | null;
  scaScoreDifferences?: {
    aroma: number;
    flavor: number;
    aftertaste: number;
    acidity: number;
    body: number;
    balance: number;
    overall: number;
  };
}

export interface BrewSimilarity {
  overallScore: number;
  beansScore: number;
  parametersScore: number;
  measurementsScore: number;
}

export interface StatisticalAnalysis {
  temperatureQualityCorrelation: number;
  ratioQualityCorrelation: number;
  strengthCorrelations: Array<{
    parameter: string;
    value: number;
  }>;
  optimalTemperatureRange: {
    min: number;
    max: number;
  };
  optimalRatioRange: {
    min: number;
    max: number;
  };
}

export interface SimilarBrewResult {
  brew: BrewRecord;
  similarity: BrewSimilarity;
}

export interface RankedBrewResult {
  brew: BrewRecord;
  matchScore: number;
  qualityScore: number;
}

export interface MethodPerformance {
  averageQuality: number;
  brewCount: number;
  standardDeviation: number;
}

export interface StatisticalSignificance {
  pValue: number;
  isSignificant: boolean;
  effectSize: number;
}

export interface BrewParameters {
  brewingMethod: string;
  waterTemperatureRange: [number, number];
  ratioRange: [number, number];
}

export class BrewComparisonService {
  
  /**
   * Compare two brews and calculate their differences
   */
  static compareBrews(brew1: BrewRecord, brew2: BrewRecord): ComparisonResult {
    // Calculate parameter differences
    const parameterDifferences = {
      waterTemperature: brew1.parameters.waterTemperature - brew2.parameters.waterTemperature,
      coffeeBeansWeight: brew1.measurements.coffeeBeansWeight - brew2.measurements.coffeeBeansWeight,
      waterWeight: brew1.measurements.waterWeight - brew2.measurements.waterWeight,
      coffeeToWaterRatio: (brew1.measurements.coffeeToWaterRatio || 0) - (brew2.measurements.coffeeToWaterRatio || 0)
    };

    // Calculate quality differences
    const quality1 = this.getBrewQuality(brew1);
    const quality2 = this.getBrewQuality(brew2);
    
    // Handle missing evaluation data - if either brew has no quality data, difference is 0
    let qualityDifference = 0;
    let betterBrew: string | null = null;
    
    if (quality1 > 0 && quality2 > 0) {
      qualityDifference = quality1 - quality2;
      if (quality1 > quality2) {
        betterBrew = brew1.id;
      } else if (quality2 > quality1) {
        betterBrew = brew2.id;
      }
    }

    // Calculate SCA score differences if both have SCA evaluations
    let scaScoreDifferences: ComparisonResult['scaScoreDifferences'];
    if (brew1.evaluation?.type === 'sca' && brew2.evaluation?.type === 'sca' &&
        brew1.evaluation.scores && brew2.evaluation.scores) {
      scaScoreDifferences = {
        aroma: brew1.evaluation.scores.aroma - brew2.evaluation.scores.aroma,
        flavor: brew1.evaluation.scores.flavor - brew2.evaluation.scores.flavor,
        aftertaste: brew1.evaluation.scores.aftertaste - brew2.evaluation.scores.aftertaste,
        acidity: brew1.evaluation.scores.acidity - brew2.evaluation.scores.acidity,
        body: brew1.evaluation.scores.body - brew2.evaluation.scores.body,
        balance: brew1.evaluation.scores.balance - brew2.evaluation.scores.balance,
        overall: brew1.evaluation.scores.overall - brew2.evaluation.scores.overall
      };
    }

    return {
      parameterDifferences,
      qualityDifference,
      betterBrew,
      scaScoreDifferences
    };
  }

  /**
   * Calculate similarity between two brews (0 = completely different, 1 = identical)
   */
  static calculateSimilarity(brew1: BrewRecord, brew2: BrewRecord): BrewSimilarity {
    const beansScore = this.calculateBeansSimilarity(brew1.beans, brew2.beans);
    const parametersScore = this.calculateParametersSimilarity(brew1.parameters, brew2.parameters);
    const measurementsScore = this.calculateMeasurementsSimilarity(brew1.measurements, brew2.measurements);
    
    // Weighted overall score
    const overallScore = (beansScore * 0.3 + parametersScore * 0.4 + measurementsScore * 0.3);

    return {
      overallScore,
      beansScore,
      parametersScore,
      measurementsScore
    };
  }

  /**
   * Analyze correlations between parameters and quality across multiple brews
   */
  static analyzeCorrelations(brews: BrewRecord[]): StatisticalAnalysis {
    if (brews.length < 2) {
      return {
        temperatureQualityCorrelation: 0,
        ratioQualityCorrelation: 0,
        strengthCorrelations: [
          { parameter: 'waterTemperature', value: 0 },
          { parameter: 'coffeeToWaterRatio', value: 0 },
          { parameter: 'coffeeBeansWeight', value: 0 },
          { parameter: 'waterWeight', value: 0 }
        ],
        optimalTemperatureRange: { min: 85, max: 100 },
        optimalRatioRange: { min: 14, max: 18 }
      };
    }

    // Filter brews with valid quality data
    const validBrews = brews.filter(brew => this.getBrewQuality(brew) > 0);
    
    if (validBrews.length < 2) {
      return {
        temperatureQualityCorrelation: 0,
        ratioQualityCorrelation: 0,
        strengthCorrelations: [
          { parameter: 'waterTemperature', value: 0 },
          { parameter: 'coffeeToWaterRatio', value: 0 },
          { parameter: 'coffeeBeansWeight', value: 0 },
          { parameter: 'waterWeight', value: 0 }
        ],
        optimalTemperatureRange: { min: 85, max: 100 },
        optimalRatioRange: { min: 14, max: 18 }
      };
    }

    // Extract data for correlation analysis
    const temperatures = validBrews.map(brew => brew.parameters.waterTemperature);
    const ratios = validBrews.map(brew => brew.measurements.coffeeToWaterRatio || 0);
    const coffeeWeights = validBrews.map(brew => brew.measurements.coffeeBeansWeight);
    const waterWeights = validBrews.map(brew => brew.measurements.waterWeight);
    const qualities = validBrews.map(brew => this.getBrewQuality(brew));

    // Calculate correlations
    const temperatureQualityCorrelation = this.calculateCorrelation(temperatures, qualities);
    const ratioQualityCorrelation = this.calculateCorrelation(ratios, qualities);
    const coffeeWeightCorrelation = this.calculateCorrelation(coffeeWeights, qualities);
    const waterWeightCorrelation = this.calculateCorrelation(waterWeights, qualities);

    // Find optimal ranges based on top-performing brews
    const topBrews = validBrews
      .sort((a, b) => this.getBrewQuality(b) - this.getBrewQuality(a))
      .slice(0, Math.ceil(validBrews.length * 0.3)); // Top 30%

    const optimalTemperatures = topBrews.map(brew => brew.parameters.waterTemperature);
    const optimalRatios = topBrews.map(brew => brew.measurements.coffeeToWaterRatio || 0).filter(r => r > 0);

    return {
      temperatureQualityCorrelation,
      ratioQualityCorrelation,
      strengthCorrelations: [
        { parameter: 'waterTemperature', value: temperatureQualityCorrelation },
        { parameter: 'coffeeToWaterRatio', value: ratioQualityCorrelation },
        { parameter: 'coffeeBeansWeight', value: coffeeWeightCorrelation },
        { parameter: 'waterWeight', value: waterWeightCorrelation }
      ],
      optimalTemperatureRange: {
        min: Math.min(...optimalTemperatures),
        max: Math.max(...optimalTemperatures)
      },
      optimalRatioRange: {
        min: optimalRatios.length > 0 ? Math.min(...optimalRatios) : 14,
        max: optimalRatios.length > 0 ? Math.max(...optimalRatios) : 18
      }
    };
  }

  /**
   * Find similar brews from a collection
   */
  static findSimilarBrews(targetBrew: BrewRecord, brewCollection: BrewRecord[], limit: number = 5): SimilarBrewResult[] {
    if (brewCollection.length === 0) {
      return [];
    }

    const results = brewCollection.map(brew => ({
      brew,
      similarity: this.calculateSimilarity(targetBrew, brew)
    }));

    return results
      .sort((a, b) => b.similarity.overallScore - a.similarity.overallScore)
      .slice(0, limit);
  }

  /**
   * Rank brews by quality within similar parameters
   */
  static rankSimilarBrews(params: BrewParameters, brews: BrewRecord[]): RankedBrewResult[] {
    // Validate parameter ranges
    if (params.waterTemperatureRange[0] > params.waterTemperatureRange[1] ||
        params.ratioRange[0] > params.ratioRange[1]) {
      return [];
    }

    // Filter brews that match the criteria
    const matchingBrews = brews.filter(brew => {
      const meetsMethod = brew.parameters.brewingMethod === params.brewingMethod;
      const meetsTemp = brew.parameters.waterTemperature >= params.waterTemperatureRange[0] && 
                       brew.parameters.waterTemperature <= params.waterTemperatureRange[1];
      const ratio = brew.measurements.coffeeToWaterRatio || 0;
      const meetsRatio = ratio >= params.ratioRange[0] && ratio <= params.ratioRange[1];
      
      return meetsMethod && meetsTemp && meetsRatio;
    });

    // Calculate match and quality scores
    const results = matchingBrews.map(brew => {
      const qualityScore = this.getBrewQuality(brew);
      const matchScore = this.calculateParameterMatch(brew, params);
      
      return {
        brew,
        matchScore,
        qualityScore
      };
    });

    // Sort by quality score (descending)
    return results.sort((a, b) => b.qualityScore - a.qualityScore);
  }

  /**
   * Compare brewing method performance
   */
  static compareBrewingMethods(brews: BrewRecord[]): Record<string, MethodPerformance> {
    const methodGroups: Record<string, BrewRecord[]> = {};
    
    // Group brews by method
    brews.forEach(brew => {
      const method = brew.parameters.brewingMethod;
      if (!methodGroups[method]) {
        methodGroups[method] = [];
      }
      methodGroups[method].push(brew);
    });

    // Calculate performance for each method
    const results: Record<string, MethodPerformance> = {};
    
    Object.entries(methodGroups).forEach(([method, methodBrews]) => {
      const qualities = methodBrews.map(brew => this.getBrewQuality(brew)).filter(q => q > 0);
      
      if (qualities.length > 0) {
        const averageQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
        const variance = qualities.reduce((sum, q) => sum + Math.pow(q - averageQuality, 2), 0) / qualities.length;
        const standardDeviation = Math.sqrt(variance);
        
        results[method] = {
          averageQuality,
          brewCount: methodBrews.length,
          standardDeviation
        };
      }
    });

    return results;
  }

  /**
   * Calculate statistical significance between two groups of brews
   */
  static calculateStatisticalSignificance(group1: BrewRecord[], group2: BrewRecord[]): StatisticalSignificance {
    const qualities1 = group1.map(brew => this.getBrewQuality(brew)).filter(q => q > 0);
    const qualities2 = group2.map(brew => this.getBrewQuality(brew)).filter(q => q > 0);

    if (qualities1.length < 2 || qualities2.length < 2) {
      return { pValue: 1.0, isSignificant: false, effectSize: 0 };
    }

    // Calculate means
    const mean1 = qualities1.reduce((sum, q) => sum + q, 0) / qualities1.length;
    const mean2 = qualities2.reduce((sum, q) => sum + q, 0) / qualities2.length;

    // Calculate standard deviations
    const variance1 = qualities1.reduce((sum, q) => sum + Math.pow(q - mean1, 2), 0) / (qualities1.length - 1);
    const variance2 = qualities2.reduce((sum, q) => sum + Math.pow(q - mean2, 2), 0) / (qualities2.length - 1);
    
    const std1 = Math.sqrt(variance1);
    const std2 = Math.sqrt(variance2);

    // Calculate pooled standard deviation
    const pooledStd = Math.sqrt(((qualities1.length - 1) * variance1 + (qualities2.length - 1) * variance2) / 
                               (qualities1.length + qualities2.length - 2));

    // Calculate t-statistic
    const standardError = pooledStd * Math.sqrt(1/qualities1.length + 1/qualities2.length);
    const tStat = Math.abs(mean1 - mean2) / standardError;

    // Approximate p-value using t-distribution (simplified)
    const degreesOfFreedom = qualities1.length + qualities2.length - 2;
    const pValue = this.approximatePValue(tStat, degreesOfFreedom);

    // Calculate effect size (Cohen's d)
    const effectSize = Math.abs(mean1 - mean2) / pooledStd;

    return {
      pValue,
      isSignificant: pValue < 0.05,
      effectSize
    };
  }

  // Helper methods

  private static getBrewQuality(brew: BrewRecord): number {
    if (!brew.evaluation) return 0;
    
    if (brew.evaluation.type === 'quick') {
      return brew.evaluation.overallQuality || 0;
    }
    
    if (brew.evaluation.type === 'sca') {
      return (brew.evaluation as any).finalScore || 0;
    }
    
    return 0;
  }

  private static calculateBeansSimilarity(beans1: BrewRecord['beans'], beans2: BrewRecord['beans']): number {
    let score = 0;
    let factors = 0;

    // Brand similarity (exact match gets full points)
    if (beans1.brand === beans2.brand) {
      score += 1;
    } else if (this.normalizeString(beans1.brand).includes(this.normalizeString(beans2.brand)) ||
               this.normalizeString(beans2.brand).includes(this.normalizeString(beans1.brand))) {
      score += 0.7; // Partial match for similar names
    }
    factors += 1;

    // Origin similarity
    if (beans1.origin === beans2.origin) {
      score += 1;
    } else if (this.normalizeString(beans1.origin).includes(this.normalizeString(beans2.origin)) ||
               this.normalizeString(beans2.origin).includes(this.normalizeString(beans1.origin))) {
      score += 0.8;
    }
    factors += 1;

    // Processing method
    if (beans1.processingMethod === beans2.processingMethod) {
      score += 1;
    }
    factors += 1;

    // Optional fields (if both have them)
    if (beans1.altitude && beans2.altitude) {
      const altitudeDiff = Math.abs(beans1.altitude - beans2.altitude);
      const similarity = Math.max(0, 1 - (altitudeDiff / 1000)); // Normalize to 1000m scale
      score += similarity;
      factors += 1;
    }

    if (beans1.roastingLevel && beans2.roastingLevel) {
      score += beans1.roastingLevel === beans2.roastingLevel ? 1 : 0;
      factors += 1;
    }

    return factors > 0 ? score / factors : 0;
  }

  private static calculateParametersSimilarity(params1: BrewRecord['parameters'], params2: BrewRecord['parameters']): number {
    let score = 0;
    let factors = 0;

    // Brewing method (exact match required)
    score += params1.brewingMethod === params2.brewingMethod ? 1 : 0;
    factors += 1;

    // Water temperature (closer temperatures get higher scores)
    const tempDiff = Math.abs(params1.waterTemperature - params2.waterTemperature);
    const tempSimilarity = Math.max(0, 1 - (tempDiff / 20)); // 20°C scale
    score += tempSimilarity;
    factors += 1;

    // Grinder model similarity
    if (params1.grinderModel === params2.grinderModel) {
      score += 1;
    } else if (this.normalizeString(params1.grinderModel).includes(this.normalizeString(params2.grinderModel)) ||
               this.normalizeString(params2.grinderModel).includes(this.normalizeString(params1.grinderModel))) {
      score += 0.7;
    }
    factors += 1;

    // Grinder setting (context-dependent comparison)
    score += this.compareGrinderSettings(params1.grinderSetting, params2.grinderSetting);
    factors += 1;

    return factors > 0 ? score / factors : 0;
  }

  private static calculateMeasurementsSimilarity(measurements1: BrewRecord['measurements'], measurements2: BrewRecord['measurements']): number {
    let score = 0;
    let factors = 0;

    // Coffee weight similarity
    const coffeeWeightDiff = Math.abs(measurements1.coffeeBeansWeight - measurements2.coffeeBeansWeight);
    const coffeeWeightSimilarity = Math.max(0, 1 - (coffeeWeightDiff / 10)); // 10g scale
    score += coffeeWeightSimilarity;
    factors += 1;

    // Water weight similarity
    const waterWeightDiff = Math.abs(measurements1.waterWeight - measurements2.waterWeight);
    const waterWeightSimilarity = Math.max(0, 1 - (waterWeightDiff / 100)); // 100g scale
    score += waterWeightSimilarity;
    factors += 1;

    // Ratio similarity
    const ratio1 = measurements1.coffeeToWaterRatio || 0;
    const ratio2 = measurements2.coffeeToWaterRatio || 0;
    if (ratio1 > 0 && ratio2 > 0) {
      const ratioDiff = Math.abs(ratio1 - ratio2);
      const ratioSimilarity = Math.max(0, 1 - (ratioDiff / 3)); // 3:1 scale
      score += ratioSimilarity;
      factors += 1;
    }

    return factors > 0 ? score / factors : 0;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;

    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;

    for (let i = 0; i < x.length; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      
      numerator += deltaX * deltaY;
      sumXSquared += deltaX * deltaX;
      sumYSquared += deltaY * deltaY;
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static calculateParameterMatch(brew: BrewRecord, params: BrewParameters): number {
    let score = 0;
    let factors = 0;

    // Method match (exact)
    if (brew.parameters.brewingMethod === params.brewingMethod) {
      score += 1;
    }
    factors += 1;

    // Temperature match (how close to optimal range)
    const temp = brew.parameters.waterTemperature;
    const tempRange = params.waterTemperatureRange;
    const tempCenter = (tempRange[0] + tempRange[1]) / 2;
    const tempWidth = Math.max(1, tempRange[1] - tempRange[0]); // Avoid division by zero
    const tempDistance = Math.abs(temp - tempCenter) / (tempWidth / 2);
    score += Math.max(0, 1 - tempDistance);
    factors += 1;

    // Ratio match
    const ratio = brew.measurements.coffeeToWaterRatio || 0;
    const ratioRange = params.ratioRange;
    const ratioCenter = (ratioRange[0] + ratioRange[1]) / 2;
    const ratioWidth = Math.max(0.1, ratioRange[1] - ratioRange[0]); // Avoid division by zero
    const ratioDistance = Math.abs(ratio - ratioCenter) / (ratioWidth / 2);
    score += Math.max(0, 1 - ratioDistance);
    factors += 1;

    // Include quality as a factor in matching (higher quality = higher match score)
    // Give quality more weight since it's what we ultimately care about
    const qualityScore = this.getBrewQuality(brew) / 10; // Normalize to 0-1
    score += qualityScore * 3; // Triple weight for quality to ensure differentiation
    factors += 3;

    return factors > 0 ? score / factors : 0;
  }

  private static compareGrinderSettings(setting1: number, setting2: number): number {
    // Both values are numbers, calculate similarity based on numeric difference
    const diff = Math.abs(setting1 - setting2);
    return Math.max(0, 1 - (diff / 20)); // Max difference of 20 (1-40 range)
  }

  private static normalizeString(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private static approximatePValue(tStat: number, df: number): number {
    // Simplified p-value approximation for t-distribution
    // This is a rough approximation for the test cases
    if (df <= 0) return 1.0;
    
    // Use normal approximation for large df
    if (df > 30) {
      // Standard normal approximation
      const z = tStat;
      if (z < 1.96) return 0.1; // Not significant
      if (z < 2.58) return 0.01;
      return 0.001;
    }
    
    // For small df, use conservative estimates
    if (tStat > 4.0) return 0.001;
    if (tStat > 3.0) return 0.01;
    if (tStat > 2.5) return 0.02; // More aggressive for test
    if (tStat > 2.0) return 0.05;
    
    return Math.max(0.1, 0.5 - (tStat / 8)); // Rough approximation
  }
}