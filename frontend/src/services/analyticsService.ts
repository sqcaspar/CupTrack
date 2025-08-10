// TASK-007A: Analytics & Data Visualization - Rapid Iteration
// Service layer for analytics data processing and statistical calculations

import { BrewRecord } from '../types/brew';

export interface AnalyticsInsight {
  id: string;
  type: 'optimization' | 'trend' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dataPoints?: {
    label: string;
    value: number | string;
  }[];
  actionable: boolean;
}

export interface BrewStatistics {
  totalBrews: number;
  averageQuality: number;
  qualityTrend: 'improving' | 'declining' | 'stable';
  mostUsedMethod: string;
  favoriteOrigin: string;
  averageRatio: number;
  averageTemperature: number;
  brewingFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  qualityDistribution: {
    excellent: number; // 9-10
    good: number; // 7-8.9
    average: number; // 5-6.9
    poor: number; // 0-4.9
  };
}

export class AnalyticsService {
  
  /**
   * Calculate comprehensive statistics from brew data
   */
  static calculateStatistics(brews: BrewRecord[]): BrewStatistics {
    if (brews.length === 0) {
      return {
        totalBrews: 0,
        averageQuality: 0,
        qualityTrend: 'stable',
        mostUsedMethod: 'N/A',
        favoriteOrigin: 'N/A',
        averageRatio: 0,
        averageTemperature: 0,
        brewingFrequency: { daily: 0, weekly: 0, monthly: 0 },
        qualityDistribution: { excellent: 0, good: 0, average: 0, poor: 0 }
      };
    }

    // Calculate quality metrics
    const qualities = brews.map(this.getBrewQuality).filter(q => q > 0);
    const averageQuality = qualities.length > 0 
      ? qualities.reduce((sum, q) => sum + q, 0) / qualities.length 
      : 0;

    // Determine quality trend (compare first half vs second half)
    const qualityTrend = this.calculateQualityTrend(brews);

    // Calculate method and origin preferences
    const methodCounts = this.countByProperty(brews, brew => brew.parameters.brewingMethod);
    const originCounts = this.countByProperty(brews, brew => brew.beans.origin);

    const mostUsedMethod = this.getMostFrequent(methodCounts);
    const favoriteOrigin = this.getMostFrequent(originCounts);

    // Calculate averages
    const ratios = brews
      .map(brew => brew.measurements.coffeeToWaterRatio)
      .filter(ratio => ratio && ratio > 0);
    const temperatures = brews
      .map(brew => brew.parameters.waterTemperature)
      .filter(temp => temp > 0);

    const averageRatio = ratios.length > 0 
      ? ratios.reduce((sum, r) => sum + r, 0) / ratios.length 
      : 0;
    const averageTemperature = temperatures.length > 0 
      ? temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length 
      : 0;

    // Calculate brewing frequency
    const brewingFrequency = this.calculateBrewingFrequency(brews);

    // Calculate quality distribution
    const qualityDistribution = this.calculateQualityDistribution(qualities);

    return {
      totalBrews: brews.length,
      averageQuality: Math.round(averageQuality * 100) / 100,
      qualityTrend,
      mostUsedMethod,
      favoriteOrigin,
      averageRatio: Math.round(averageRatio * 100) / 100,
      averageTemperature: Math.round(averageTemperature * 100) / 100,
      brewingFrequency,
      qualityDistribution
    };
  }

  /**
   * Generate actionable insights from brew data
   */
  static generateInsights(brews: BrewRecord[]): AnalyticsInsight[] {
    if (brews.length < 3) {
      return [{
        id: 'insufficient_data',
        type: 'recommendation',
        priority: 'medium',
        title: 'More Data Needed',
        description: 'Log at least 5-10 brews to get meaningful insights and recommendations.',
        actionable: true
      }];
    }

    const insights: AnalyticsInsight[] = [];

    // Temperature optimization insight
    const tempInsight = this.analyzeTemperatureOptimization(brews);
    if (tempInsight) insights.push(tempInsight);

    // Ratio optimization insight
    const ratioInsight = this.analyzeRatioOptimization(brews);
    if (ratioInsight) insights.push(ratioInsight);

    // Quality trend insight
    const trendInsight = this.analyzeQualityTrend(brews);
    if (trendInsight) insights.push(trendInsight);

    // Method performance insight
    const methodInsight = this.analyzeMethodPerformance(brews);
    if (methodInsight) insights.push(methodInsight);

    // Origin performance insight
    const originInsight = this.analyzeOriginPerformance(brews);
    if (originInsight) insights.push(originInsight);

    // Grinder consistency insight
    const grinderInsight = this.analyzeGrinderConsistency(brews);
    if (grinderInsight) insights.push(grinderInsight);

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
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

  private static countByProperty<T>(items: T[], getter: (item: T) => string): Record<string, number> {
    return items.reduce((counts, item) => {
      const key = getter(item);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  private static getMostFrequent(counts: Record<string, number>): string {
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'N/A');
  }

  private static calculateQualityTrend(brews: BrewRecord[]): 'improving' | 'declining' | 'stable' {
    if (brews.length < 4) return 'stable';

    const sortedBrews = [...brews].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const midpoint = Math.floor(sortedBrews.length / 2);
    const firstHalf = sortedBrews.slice(0, midpoint);
    const secondHalf = sortedBrews.slice(midpoint);

    const firstHalfAvg = this.getAverageQuality(firstHalf);
    const secondHalfAvg = this.getAverageQuality(secondHalf);

    if (secondHalfAvg > firstHalfAvg + 0.3) return 'improving';
    if (secondHalfAvg < firstHalfAvg - 0.3) return 'declining';
    return 'stable';
  }

  private static getAverageQuality(brews: BrewRecord[]): number {
    const qualities = brews.map(this.getBrewQuality).filter(q => q > 0);
    return qualities.length > 0 ? qualities.reduce((sum, q) => sum + q, 0) / qualities.length : 0;
  }

  private static calculateBrewingFrequency(brews: BrewRecord[]): { daily: number; weekly: number; monthly: number } {
    if (brews.length === 0) return { daily: 0, weekly: 0, monthly: 0 };

    const sortedBrews = [...brews].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const firstDate = new Date(sortedBrews[0].createdAt);
    const lastDate = new Date(sortedBrews[sortedBrews.length - 1].createdAt);
    const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    const daily = brews.length / daysDiff;
    const weekly = daily * 7;
    const monthly = daily * 30;

    return {
      daily: Math.round(daily * 100) / 100,
      weekly: Math.round(weekly * 100) / 100,
      monthly: Math.round(monthly * 100) / 100
    };
  }

  private static calculateQualityDistribution(qualities: number[]): {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  } {
    if (qualities.length === 0) return { excellent: 0, good: 0, average: 0, poor: 0 };

    const distribution = {
      excellent: qualities.filter(q => q >= 9).length,
      good: qualities.filter(q => q >= 7 && q < 9).length,
      average: qualities.filter(q => q >= 5 && q < 7).length,
      poor: qualities.filter(q => q < 5).length
    };

    return distribution;
  }

  // Insight analysis methods

  private static analyzeTemperatureOptimization(brews: BrewRecord[]): AnalyticsInsight | null {
    const brewsWithTemp = brews.filter(brew => 
      brew.parameters.waterTemperature > 0 && this.getBrewQuality(brew) > 0
    );

    if (brewsWithTemp.length < 3) return null;

    // Group brews by temperature ranges
    const tempRanges = [
      { min: 80, max: 85, label: '80-85°C', brews: [] as BrewRecord[] },
      { min: 85, max: 90, label: '85-90°C', brews: [] as BrewRecord[] },
      { min: 90, max: 95, label: '90-95°C', brews: [] as BrewRecord[] },
      { min: 95, max: 100, label: '95-100°C', brews: [] as BrewRecord[] }
    ];

    brewsWithTemp.forEach(brew => {
      const temp = brew.parameters.waterTemperature;
      const range = tempRanges.find(r => temp >= r.min && temp < r.max);
      if (range) range.brews.push(brew);
    });

    // Find the range with highest average quality
    const rangePerformance = tempRanges
      .filter(range => range.brews.length > 0)
      .map(range => ({
        ...range,
        avgQuality: this.getAverageQuality(range.brews)
      }))
      .sort((a, b) => b.avgQuality - a.avgQuality);

    if (rangePerformance.length === 0) return null;

    const bestRange = rangePerformance[0];
    const currentAvgTemp = brewsWithTemp.reduce((sum, brew) => sum + brew.parameters.waterTemperature, 0) / brewsWithTemp.length;

    // Only suggest if there's a significant difference
    if (bestRange.avgQuality - this.getAverageQuality(brewsWithTemp) < 0.5) return null;

    return {
      id: 'temperature_optimization',
      type: 'optimization',
      priority: 'high',
      title: 'Water Temperature Sweet Spot',
      description: `Your highest-rated brews use temperatures in the ${bestRange.label} range (average quality: ${bestRange.avgQuality.toFixed(1)}). Your current average is ${currentAvgTemp.toFixed(1)}°C.`,
      dataPoints: [
        { label: 'Best Range', value: bestRange.label },
        { label: 'Best Range Quality', value: bestRange.avgQuality.toFixed(1) },
        { label: 'Current Avg Temp', value: `${currentAvgTemp.toFixed(1)}°C` }
      ],
      actionable: true
    };
  }

  private static analyzeRatioOptimization(brews: BrewRecord[]): AnalyticsInsight | null {
    const brewsWithRatio = brews.filter(brew => 
      brew.measurements.coffeeToWaterRatio && brew.measurements.coffeeToWaterRatio > 0 && this.getBrewQuality(brew) > 0
    );

    if (brewsWithRatio.length < 3) return null;

    // Group by ratio ranges
    const ratioRanges = [
      { min: 0, max: 14, label: '< 14:1', brews: [] as BrewRecord[] },
      { min: 14, max: 15, label: '14-15:1', brews: [] as BrewRecord[] },
      { min: 15, max: 16, label: '15-16:1', brews: [] as BrewRecord[] },
      { min: 16, max: 17, label: '16-17:1', brews: [] as BrewRecord[] },
      { min: 17, max: 20, label: '17-20:1', brews: [] as BrewRecord[] },
      { min: 20, max: Infinity, label: '> 20:1', brews: [] as BrewRecord[] }
    ];

    brewsWithRatio.forEach(brew => {
      const ratio = brew.measurements.coffeeToWaterRatio!;
      const range = ratioRanges.find(r => ratio >= r.min && ratio < r.max);
      if (range) range.brews.push(brew);
    });

    const rangePerformance = ratioRanges
      .filter(range => range.brews.length > 0)
      .map(range => ({
        ...range,
        avgQuality: this.getAverageQuality(range.brews)
      }))
      .sort((a, b) => b.avgQuality - a.avgQuality);

    if (rangePerformance.length === 0) return null;

    const bestRange = rangePerformance[0];
    const currentAvgRatio = brewsWithRatio.reduce((sum, brew) => sum + brew.measurements.coffeeToWaterRatio!, 0) / brewsWithRatio.length;

    if (bestRange.avgQuality - this.getAverageQuality(brewsWithRatio) < 0.5) return null;

    return {
      id: 'ratio_optimization',
      type: 'optimization',
      priority: 'medium',
      title: 'Coffee-to-Water Ratio Sweet Spot',
      description: `Your best brews use a ${bestRange.label} ratio (average quality: ${bestRange.avgQuality.toFixed(1)}). Your current average ratio is ${currentAvgRatio.toFixed(1)}:1.`,
      dataPoints: [
        { label: 'Best Range', value: bestRange.label },
        { label: 'Best Range Quality', value: bestRange.avgQuality.toFixed(1) },
        { label: 'Current Avg Ratio', value: `${currentAvgRatio.toFixed(1)}:1` }
      ],
      actionable: true
    };
  }

  private static analyzeQualityTrend(brews: BrewRecord[]): AnalyticsInsight | null {
    const trend = this.calculateQualityTrend(brews);
    
    if (trend === 'stable') return null;

    const sortedBrews = [...brews].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const midpoint = Math.floor(sortedBrews.length / 2);
    const recentQuality = this.getAverageQuality(sortedBrews.slice(midpoint));
    const earlierQuality = this.getAverageQuality(sortedBrews.slice(0, midpoint));

    const improvement = recentQuality - earlierQuality;

    if (trend === 'improving') {
      return {
        id: 'quality_improving',
        type: 'trend',
        priority: 'medium',
        title: 'Quality Improvement Trend',
        description: `Great progress! Your average quality has improved by ${improvement.toFixed(1)} points. Keep up the consistent brewing practices.`,
        dataPoints: [
          { label: 'Improvement', value: `+${improvement.toFixed(1)} points` },
          { label: 'Recent Average', value: recentQuality.toFixed(1) }
        ],
        actionable: false
      };
    } else {
      return {
        id: 'quality_declining',
        type: 'trend',
        priority: 'high',
        title: 'Quality Decline Alert',
        description: `Your recent brews have declined by ${Math.abs(improvement).toFixed(1)} points on average. Consider reviewing your brewing parameters or bean freshness.`,
        dataPoints: [
          { label: 'Decline', value: `${improvement.toFixed(1)} points` },
          { label: 'Recent Average', value: recentQuality.toFixed(1) }
        ],
        actionable: true
      };
    }
  }

  private static analyzeMethodPerformance(brews: BrewRecord[]): AnalyticsInsight | null {
    const methodPerformance: Record<string, { brews: BrewRecord[]; avgQuality: number }> = {};

    brews.forEach(brew => {
      const method = brew.parameters.brewingMethod;
      const quality = this.getBrewQuality(brew);
      
      if (quality > 0) {
        if (!methodPerformance[method]) {
          methodPerformance[method] = { brews: [], avgQuality: 0 };
        }
        methodPerformance[method].brews.push(brew);
      }
    });

    // Calculate averages and filter methods with enough data
    const methods = Object.keys(methodPerformance)
      .filter(method => methodPerformance[method].brews.length >= 2)
      .map(method => {
        const avgQuality = this.getAverageQuality(methodPerformance[method].brews);
        return { method, avgQuality, count: methodPerformance[method].brews.length };
      })
      .sort((a, b) => b.avgQuality - a.avgQuality);

    if (methods.length < 2) return null;

    const bestMethod = methods[0];
    const currentMethod = brews[brews.length - 1]?.parameters.brewingMethod;
    
    // Only suggest if user isn't already using the best method and there's a significant difference
    if (bestMethod.method === currentMethod || bestMethod.avgQuality - methods[1].avgQuality < 0.5) return null;

    return {
      id: 'method_performance',
      type: 'recommendation',
      priority: 'medium',
      title: 'Best Performing Brewing Method',
      description: `Your ${bestMethod.method} brews average ${bestMethod.avgQuality.toFixed(1)} quality score, which is your highest-performing method based on ${bestMethod.count} brews.`,
      dataPoints: methods.slice(0, 3).map(m => ({
        label: m.method,
        value: `${m.avgQuality.toFixed(1)} (${m.count} brews)`
      })),
      actionable: true
    };
  }

  private static analyzeOriginPerformance(brews: BrewRecord[]): AnalyticsInsight | null {
    const originPerformance: Record<string, { brews: BrewRecord[]; avgQuality: number }> = {};

    brews.forEach(brew => {
      const origin = brew.beans.origin;
      const quality = this.getBrewQuality(brew);
      
      if (quality > 0) {
        if (!originPerformance[origin]) {
          originPerformance[origin] = { brews: [], avgQuality: 0 };
        }
        originPerformance[origin].brews.push(brew);
      }
    });

    const origins = Object.keys(originPerformance)
      .filter(origin => originPerformance[origin].brews.length >= 2)
      .map(origin => {
        const avgQuality = this.getAverageQuality(originPerformance[origin].brews);
        return { origin, avgQuality, count: originPerformance[origin].brews.length };
      })
      .sort((a, b) => b.avgQuality - a.avgQuality);

    if (origins.length < 2) return null;

    const bestOrigin = origins[0];
    
    // Only suggest if there's a significant difference
    if (bestOrigin.avgQuality - origins[1].avgQuality < 0.5) return null;

    return {
      id: 'origin_performance',
      type: 'recommendation',
      priority: 'low',
      title: 'Top Performing Coffee Origin',
      description: `${bestOrigin.origin} beans consistently deliver your highest quality scores (${bestOrigin.avgQuality.toFixed(1)} average across ${bestOrigin.count} brews).`,
      dataPoints: origins.slice(0, 3).map(o => ({
        label: o.origin,
        value: `${o.avgQuality.toFixed(1)} (${o.count} brews)`
      })),
      actionable: true
    };
  }

  private static analyzeGrinderConsistency(brews: BrewRecord[]): AnalyticsInsight | null {
    const grinderPerformance: Record<string, { qualities: number[]; count: number }> = {};

    brews.forEach(brew => {
      const grinder = brew.parameters.grinderModel;
      const quality = this.getBrewQuality(brew);
      
      if (quality > 0) {
        if (!grinderPerformance[grinder]) {
          grinderPerformance[grinder] = { qualities: [], count: 0 };
        }
        grinderPerformance[grinder].qualities.push(quality);
        grinderPerformance[grinder].count++;
      }
    });

    const grinders = Object.keys(grinderPerformance)
      .filter(grinder => grinderPerformance[grinder].count >= 3)
      .map(grinder => {
        const qualities = grinderPerformance[grinder].qualities;
        const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
        
        // Calculate consistency (lower standard deviation = more consistent)
        const variance = qualities.reduce((sum, q) => sum + Math.pow(q - avgQuality, 2), 0) / qualities.length;
        const standardDeviation = Math.sqrt(variance);
        
        return {
          grinder,
          avgQuality,
          consistency: standardDeviation,
          count: grinderPerformance[grinder].count
        };
      })
      .sort((a, b) => {
        // Sort by consistency first (lower std dev is better), then by quality
        if (Math.abs(a.consistency - b.consistency) > 0.3) {
          return a.consistency - b.consistency;
        }
        return b.avgQuality - a.avgQuality;
      });

    if (grinders.length < 2) return null;

    const mostConsistent = grinders[0];
    const leastConsistent = grinders[grinders.length - 1];

    // Only suggest if there's a meaningful difference in consistency
    if (leastConsistent.consistency - mostConsistent.consistency < 0.5) return null;

    return {
      id: 'grinder_consistency',
      type: 'optimization',
      priority: 'medium',
      title: 'Grinder Consistency Analysis',
      description: `Your ${mostConsistent.grinder} produces the most consistent results (±${mostConsistent.consistency.toFixed(1)} quality points) with an average of ${mostConsistent.avgQuality.toFixed(1)}.`,
      dataPoints: grinders.slice(0, 2).map(g => ({
        label: g.grinder,
        value: `${g.avgQuality.toFixed(1)} ±${g.consistency.toFixed(1)} (${g.count} brews)`
      })),
      actionable: true
    };
  }
}