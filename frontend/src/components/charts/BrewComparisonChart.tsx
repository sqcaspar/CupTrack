// TASK-007A: Analytics & Data Visualization - Rapid Iteration
// Specialized chart component for comparing two brews side by side

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { BrewRecord } from '../../types/brew';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface BrewComparisonChartProps {
  brew1: BrewRecord;
  brew2: BrewRecord;
  className?: string;
  height?: number;
  comparisonType?: 'sca_scores' | 'brewing_parameters' | 'measurements';
}

interface ComparisonMetric {
  label: string;
  brew1Value: number;
  brew2Value: number;
  maxValue: number;
}

export const BrewComparisonChart: React.FC<BrewComparisonChartProps> = ({
  brew1,
  brew2,
  className = '',
  height = 400,
  comparisonType = 'brewing_parameters'
}) => {
  // Process comparison data based on type
  const comparisonMetrics: ComparisonMetric[] = useMemo(() => {
    switch (comparisonType) {
      case 'sca_scores':
        return processSCAScoresComparison(brew1, brew2);
      case 'brewing_parameters':
        return processBrewingParametersComparison(brew1, brew2);
      case 'measurements':
        return processMeasurementsComparison(brew1, brew2);
      default:
        return [];
    }
  }, [brew1, brew2, comparisonType]);

  // Create chart data
  const chartData = useMemo(() => {
    if (comparisonMetrics.length === 0) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: comparisonMetrics.map(metric => metric.label),
      datasets: [
        {
          label: brew1.userName || `Brew ${brew1.brewNumber}`,
          data: comparisonMetrics.map(metric => metric.brew1Value),
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 5
        },
        {
          label: brew2.userName || `Brew ${brew2.brewNumber}`,
          data: comparisonMetrics.map(metric => metric.brew2Value),
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10B981',
          borderWidth: 2,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 5
        }
      ]
    };
  }, [comparisonMetrics, brew1, brew2]);

  // Chart options
  const chartOptions: ChartOptions<'radar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: 500
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: 'Inter, sans-serif',
          size: 12,
          weight: 600
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 11
        },
        callbacks: {
          label: (context) => {
            const metric = comparisonMetrics[context.dataIndex];
            const value = context.parsed.r;
            const percentage = ((value / metric.maxValue) * 100).toFixed(1);
            return `${context.dataset.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: Math.max(...comparisonMetrics.map(m => m.maxValue)),
        grid: {
          color: 'rgba(156, 163, 175, 0.3)',
          circular: true
        },
        angleLines: {
          color: 'rgba(156, 163, 175, 0.3)'
        },
        pointLabels: {
          font: {
            family: 'Inter, sans-serif',
            size: 11,
            weight: 500
          },
          color: '#374151'
        },
        ticks: {
          display: false, // Hide radial ticks for cleaner look
          stepSize: Math.max(...comparisonMetrics.map(m => m.maxValue)) / 5
        }
      }
    },
    elements: {
      line: {
        tension: 0.1
      }
    }
  }), [comparisonMetrics]);

  if (comparisonMetrics.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Comparison data not available</p>
            <p className="text-xs text-gray-400 mt-1">
              {comparisonType === 'sca_scores' && 'Both brews need SCA evaluation data'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Chart Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Brew Comparison: {getComparisonTitle(comparisonType)}
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="font-medium">{brew1.userName || `Brew ${brew1.brewNumber}`}</span>
            <span className="text-gray-400">•</span>
            <span>{brew1.beans.brand}</span>
            <span className="text-gray-400">•</span>
            <span>{brew1.beans.origin}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="font-medium">{brew2.userName || `Brew ${brew2.brewNumber}`}</span>
            <span className="text-gray-400">•</span>
            <span>{brew2.beans.brand}</span>
            <span className="text-gray-400">•</span>
            <span>{brew2.beans.origin}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        <Radar data={chartData} options={chartOptions} />
      </div>

      {/* Comparison Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            {brew1.userName || `Brew ${brew1.brewNumber}`}
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Method:</span>
              <span className="text-blue-900 font-medium">{brew1.parameters.brewingMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Grinder:</span>
              <span className="text-blue-900 font-medium">{brew1.parameters.grinderModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Date:</span>
              <span className="text-blue-900 font-medium">
                {new Date(brew1.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">
            {brew2.userName || `Brew ${brew2.brewNumber}`}
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Method:</span>
              <span className="text-green-900 font-medium">{brew2.parameters.brewingMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Grinder:</span>
              <span className="text-green-900 font-medium">{brew2.parameters.grinderModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Date:</span>
              <span className="text-green-900 font-medium">
                {new Date(brew2.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions

function getComparisonTitle(type: string): string {
  switch (type) {
    case 'sca_scores':
      return 'SCA Cupping Scores';
    case 'brewing_parameters':
      return 'Brewing Parameters';
    case 'measurements':
      return 'Measurements & Ratios';
    default:
      return 'Comparison';
  }
}

function processSCAScoresComparison(brew1: BrewRecord, brew2: BrewRecord): ComparisonMetric[] {
  const evaluation1 = brew1.evaluation;
  const evaluation2 = brew2.evaluation;

  if (!evaluation1 || evaluation1.type !== 'sca' || !evaluation1.scores ||
      !evaluation2 || evaluation2.type !== 'sca' || !evaluation2.scores) {
    return [];
  }

  const scaCategories = [
    'aroma',
    'flavor', 
    'aftertaste',
    'acidity',
    'body',
    'balance',
    'overall'
  ];

  return scaCategories.map(category => ({
    label: category.charAt(0).toUpperCase() + category.slice(1),
    brew1Value: evaluation1.scores[category as keyof typeof evaluation1.scores] || 0,
    brew2Value: evaluation2.scores[category as keyof typeof evaluation2.scores] || 0,
    maxValue: 10
  }));
}

function processBrewingParametersComparison(brew1: BrewRecord, brew2: BrewRecord): ComparisonMetric[] {
  // Normalize different parameters to comparable scales
  return [
    {
      label: 'Water Temp (°C)',
      brew1Value: brew1.parameters.waterTemperature,
      brew2Value: brew2.parameters.waterTemperature,
      maxValue: 100
    },
    {
      label: 'Coffee Weight (g)',
      brew1Value: brew1.measurements.coffeeBeansWeight,
      brew2Value: brew2.measurements.coffeeBeansWeight,
      maxValue: 50
    },
    {
      label: 'Water Weight (g)',
      brew1Value: brew1.measurements.waterWeight / 10, // Scale down for radar chart
      brew2Value: brew2.measurements.waterWeight / 10,
      maxValue: 60 // 600g scaled down
    },
    {
      label: 'Coffee:Water Ratio',
      brew1Value: brew1.measurements.coffeeToWaterRatio || 0,
      brew2Value: brew2.measurements.coffeeToWaterRatio || 0,
      maxValue: 20
    },
    {
      label: 'Grind Setting',
      brew1Value: brew1.parameters.grinderSetting || 0,
      brew2Value: brew2.parameters.grinderSetting || 0,
      maxValue: 40
    }
  ].filter(metric => 
    !isNaN(metric.brew1Value) && !isNaN(metric.brew2Value) &&
    metric.brew1Value > 0 && metric.brew2Value > 0
  );
}

function processMeasurementsComparison(brew1: BrewRecord, brew2: BrewRecord): ComparisonMetric[] {
  const metrics: ComparisonMetric[] = [
    {
      label: 'Coffee Weight (g)',
      brew1Value: brew1.measurements.coffeeBeansWeight,
      brew2Value: brew2.measurements.coffeeBeansWeight,
      maxValue: 50
    },
    {
      label: 'Water Weight (g)',
      brew1Value: brew1.measurements.waterWeight / 10, // Scale for radar
      brew2Value: brew2.measurements.waterWeight / 10,
      maxValue: 60 // 600g scaled
    },
    {
      label: 'Ratio',
      brew1Value: brew1.measurements.coffeeToWaterRatio || 0,
      brew2Value: brew2.measurements.coffeeToWaterRatio || 0,
      maxValue: 20
    }
  ];

  // Add brewed coffee weight if available
  if (brew1.measurements.brewedCoffeeWeight && brew2.measurements.brewedCoffeeWeight) {
    metrics.push({
      label: 'Brewed Weight (g)',
      brew1Value: brew1.measurements.brewedCoffeeWeight / 10, // Scale for radar
      brew2Value: brew2.measurements.brewedCoffeeWeight / 10,
      maxValue: 50 // 500g scaled
    });
  }

  // Add TDS if available
  if (brew1.measurements.tdsPercentage && brew2.measurements.tdsPercentage) {
    metrics.push({
      label: 'TDS %',
      brew1Value: brew1.measurements.tdsPercentage,
      brew2Value: brew2.measurements.tdsPercentage,
      maxValue: 3
    });
  }

  // Add extraction yield if calculable
  if (brew1.measurements.brewedCoffeeWeight && brew1.measurements.tdsPercentage &&
      brew2.measurements.brewedCoffeeWeight && brew2.measurements.tdsPercentage) {
    const extraction1 = (brew1.measurements.brewedCoffeeWeight * brew1.measurements.tdsPercentage) / brew1.measurements.coffeeBeansWeight;
    const extraction2 = (brew2.measurements.brewedCoffeeWeight * brew2.measurements.tdsPercentage) / brew2.measurements.coffeeBeansWeight;
    
    metrics.push({
      label: 'Extraction %',
      brew1Value: extraction1,
      brew2Value: extraction2,
      maxValue: 25
    });
  }

  return metrics.filter(metric => 
    !isNaN(metric.brew1Value) && !isNaN(metric.brew2Value) &&
    metric.brew1Value > 0 && metric.brew2Value > 0
  );
}