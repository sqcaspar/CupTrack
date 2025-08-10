// TASK-007A: Analytics & Data Visualization - Rapid Iteration
// Comprehensive chart component for brew analytics with multiple visualization types

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { BrewRecord } from '../../types/brew';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export type ChartType = 'line' | 'bar' | 'radar' | 'doughnut';
export type AnalyticsMetric = 
  | 'quality_trend' 
  | 'brewing_methods' 
  | 'coffee_origins' 
  | 'ratio_distribution'
  | 'temperature_analysis'
  | 'grinder_performance'
  | 'monthly_brewing_frequency';

interface BrewAnalyticsChartProps {
  brews: BrewRecord[];
  chartType: ChartType;
  metric: AnalyticsMetric;
  className?: string;
  title?: string;
  height?: number;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: {
    brewingMethod?: string[];
    origins?: string[];
    qualityRange?: [number, number];
  };
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

interface ProcessedChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export const BrewAnalyticsChart: React.FC<BrewAnalyticsChartProps> = ({
  brews,
  chartType,
  metric,
  className = '',
  title,
  height = 400,
  dateRange,
  filters
}) => {
  // Filter brews based on date range and other filters
  const filteredBrews = useMemo(() => {
    let filtered = [...brews];

    // Apply date range filter
    if (dateRange) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      filtered = filtered.filter(brew => {
        const brewDate = new Date(brew.createdAt);
        return brewDate >= startDate && brewDate <= endDate;
      });
    }

    // Apply brewing method filter
    if (filters?.brewingMethod && filters.brewingMethod.length > 0) {
      filtered = filtered.filter(brew => 
        filters.brewingMethod!.includes(brew.parameters.brewingMethod)
      );
    }

    // Apply origin filter
    if (filters?.origins && filters.origins.length > 0) {
      filtered = filtered.filter(brew => 
        filters.origins!.includes(brew.beans.origin)
      );
    }

    // Apply quality range filter
    if (filters?.qualityRange) {
      const [minQuality, maxQuality] = filters.qualityRange;
      filtered = filtered.filter(brew => {
        const quality = getBrewQuality(brew);
        return quality >= minQuality && quality <= maxQuality;
      });
    }

    return filtered;
  }, [brews, dateRange, filters]);

  // Process data based on selected metric
  const chartData: ProcessedChartData = useMemo(() => {
    switch (metric) {
      case 'quality_trend':
        return processQualityTrendData(filteredBrews);
      case 'brewing_methods':
        return processBrewingMethodsData(filteredBrews);
      case 'coffee_origins':
        return processCoffeeOriginsData(filteredBrews);
      case 'ratio_distribution':
        return processRatioDistributionData(filteredBrews);
      case 'temperature_analysis':
        return processTemperatureAnalysisData(filteredBrews);
      case 'grinder_performance':
        return processGrinderPerformanceData(filteredBrews);
      case 'monthly_brewing_frequency':
        return processMonthlyFrequencyData(filteredBrews);
      default:
        return { labels: [], datasets: [] };
    }
  }, [filteredBrews, metric]);

  // Chart configuration options
  const chartOptions: ChartOptions<any> = useMemo(() => {
    const baseOptions: ChartOptions<any> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            font: {
              family: 'Inter, sans-serif',
              size: 12
            },
            color: '#374151'
          }
        },
        title: {
          display: !!title,
          text: title,
          font: {
            family: 'Inter, sans-serif',
            size: 16,
            weight: '600'
          },
          color: '#111827',
          padding: 20
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
            weight: '600'
          },
          bodyFont: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      }
    };

    // Add specific options based on chart type
    if (chartType === 'line' || chartType === 'bar') {
      baseOptions.scales = {
        x: {
          grid: {
            color: '#F3F4F6',
            drawBorder: false
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 11
            },
            color: '#6B7280'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#F3F4F6',
            drawBorder: false
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 11
            },
            color: '#6B7280'
          }
        }
      };
    }

    if (chartType === 'radar') {
      baseOptions.scales = {
        r: {
          beginAtZero: true,
          grid: {
            color: '#F3F4F6'
          },
          pointLabels: {
            font: {
              family: 'Inter, sans-serif',
              size: 11
            },
            color: '#374151'
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 10
            },
            color: '#6B7280'
          }
        }
      };
    }

    return baseOptions;
  }, [chartType, title]);

  // Render appropriate chart component
  const renderChart = () => {
    const commonProps = {
      data: chartData as any,
      options: chartOptions,
      height
    };

    switch (chartType) {
      case 'line':
        return <Line {...commonProps} />;
      case 'bar':
        return <Bar {...commonProps} />;
      case 'radar':
        return <Radar {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      default:
        return <div className="text-gray-500">Unsupported chart type</div>;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div style={{ height: `${height}px` }}>
        {chartData.labels.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">No data available for the selected filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions for data processing

function getBrewQuality(brew: BrewRecord): number {
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

function processQualityTrendData(brews: BrewRecord[]): ProcessedChartData {
  // Sort by date
  const sortedBrews = [...brews].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return {
    labels: sortedBrews.map(brew => 
      new Date(brew.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [{
      label: 'Quality Score',
      data: sortedBrews.map(getBrewQuality),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };
}

function processBrewingMethodsData(brews: BrewRecord[]): ProcessedChartData {
  const methodCounts: Record<string, number> = {};
  
  brews.forEach(brew => {
    const method = brew.parameters.brewingMethod;
    methodCounts[method] = (methodCounts[method] || 0) + 1;
  });

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  
  return {
    labels: Object.keys(methodCounts),
    datasets: [{
      label: 'Number of Brews',
      data: Object.values(methodCounts),
      backgroundColor: colors.slice(0, Object.keys(methodCounts).length),
      borderWidth: 0
    }]
  };
}

function processCoffeeOriginsData(brews: BrewRecord[]): ProcessedChartData {
  const originCounts: Record<string, number> = {};
  
  brews.forEach(brew => {
    const origin = brew.beans.origin;
    originCounts[origin] = (originCounts[origin] || 0) + 1;
  });

  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
  
  return {
    labels: Object.keys(originCounts),
    datasets: [{
      label: 'Number of Brews',
      data: Object.values(originCounts),
      backgroundColor: colors.slice(0, Object.keys(originCounts).length),
      borderWidth: 0
    }]
  };
}

function processRatioDistributionData(brews: BrewRecord[]): ProcessedChartData {
  const ratioRanges = [
    { min: 0, max: 14, label: '< 14:1' },
    { min: 14, max: 15, label: '14-15:1' },
    { min: 15, max: 16, label: '15-16:1' },
    { min: 16, max: 17, label: '16-17:1' },
    { min: 17, max: 18, label: '17-18:1' },
    { min: 18, max: Infinity, label: '> 18:1' }
  ];

  const counts = ratioRanges.map(range => {
    return brews.filter(brew => {
      const ratio = brew.measurements.coffeeToWaterRatio || 0;
      return ratio >= range.min && ratio < range.max;
    }).length;
  });

  return {
    labels: ratioRanges.map(range => range.label),
    datasets: [{
      label: 'Number of Brews',
      data: counts,
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      borderWidth: 1
    }]
  };
}

function processTemperatureAnalysisData(brews: BrewRecord[]): ProcessedChartData {
  const temperatureRanges = [
    { min: 0, max: 85, label: '< 85°C' },
    { min: 85, max: 90, label: '85-90°C' },
    { min: 90, max: 95, label: '90-95°C' },
    { min: 95, max: 100, label: '95-100°C' },
    { min: 100, max: Infinity, label: '> 100°C' }
  ];

  const counts = temperatureRanges.map(range => {
    return brews.filter(brew => {
      const temp = brew.parameters.waterTemperature;
      return temp >= range.min && temp < range.max;
    }).length;
  });

  return {
    labels: temperatureRanges.map(range => range.label),
    datasets: [{
      label: 'Number of Brews',
      data: counts,
      backgroundColor: '#F59E0B',
      borderColor: '#D97706',
      borderWidth: 1
    }]
  };
}

function processGrinderPerformanceData(brews: BrewRecord[]): ProcessedChartData {
  const grinderData: Record<string, { quality: number[], count: number }> = {};

  brews.forEach(brew => {
    const grinder = brew.parameters.grinderModel;
    const quality = getBrewQuality(brew);
    
    if (!grinderData[grinder]) {
      grinderData[grinder] = { quality: [], count: 0 };
    }
    
    grinderData[grinder].quality.push(quality);
    grinderData[grinder].count++;
  });

  // Calculate average quality for each grinder
  const avgQualities = Object.entries(grinderData).map(([grinder, data]) => ({
    grinder,
    avgQuality: data.quality.reduce((sum, q) => sum + q, 0) / data.quality.length,
    count: data.count
  }));

  return {
    labels: avgQualities.map(item => item.grinder),
    datasets: [{
      label: 'Average Quality Score',
      data: avgQualities.map(item => item.avgQuality),
      backgroundColor: '#10B981',
      borderColor: '#059669',
      borderWidth: 1
    }]
  };
}

function processMonthlyFrequencyData(brews: BrewRecord[]): ProcessedChartData {
  const monthlyData: Record<string, number> = {};
  
  brews.forEach(brew => {
    const date = new Date(brew.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
  });

  // Sort by month
  const sortedMonths = Object.keys(monthlyData).sort();
  
  return {
    labels: sortedMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    }),
    datasets: [{
      label: 'Brews per Month',
      data: sortedMonths.map(month => monthlyData[month]),
      backgroundColor: '#8B5CF6',
      borderColor: '#7C3AED',
      borderWidth: 1
    }]
  };
}