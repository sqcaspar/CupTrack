// TASK-007A: Analytics & Data Visualization - Rapid Iteration
// Main analytics dashboard component with multiple chart views and filters

import React, { useState, useMemo } from 'react';
import { BrewAnalyticsChart, ChartType, AnalyticsMetric } from '../charts/BrewAnalyticsChart';
import { BrewComparisonChart } from '../charts/BrewComparisonChart';
import { BrewRecord } from '../../types/brew';

interface AnalyticsDashboardProps {
  brews: BrewRecord[];
  className?: string;
}

interface FilterState {
  dateRange: {
    startDate: string;
    endDate: string;
  } | null;
  brewingMethods: string[];
  origins: string[];
  qualityRange: [number, number] | undefined;
}

interface ChartView {
  id: string;
  title: string;
  metric: AnalyticsMetric;
  chartType: ChartType;
  description: string;
}

const chartViews: ChartView[] = [
  {
    id: 'quality_trend',
    title: 'Quality Trend Over Time',
    metric: 'quality_trend',
    chartType: 'line',
    description: 'Track your brewing quality improvement over time'
  },
  {
    id: 'brewing_methods',
    title: 'Brewing Methods Distribution',
    metric: 'brewing_methods',
    chartType: 'doughnut',
    description: 'See which brewing methods you use most frequently'
  },
  {
    id: 'coffee_origins',
    title: 'Coffee Origins',
    metric: 'coffee_origins',
    chartType: 'bar',
    description: 'Explore your coffee origin preferences'
  },
  {
    id: 'ratio_distribution',
    title: 'Coffee-to-Water Ratio Distribution',
    metric: 'ratio_distribution',
    chartType: 'bar',
    description: 'Analyze your brewing ratio patterns'
  },
  {
    id: 'temperature_analysis',
    title: 'Water Temperature Analysis',
    metric: 'temperature_analysis',
    chartType: 'bar',
    description: 'Review your water temperature preferences'
  },
  {
    id: 'grinder_performance',
    title: 'Grinder Performance Comparison',
    metric: 'grinder_performance',
    chartType: 'bar',
    description: 'Compare quality results across different grinders'
  },
  {
    id: 'monthly_frequency',
    title: 'Monthly Brewing Frequency',
    metric: 'monthly_brewing_frequency',
    chartType: 'line',
    description: 'Track your brewing consistency over months'
  }
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  brews,
  className = ''
}) => {
  const [activeView, setActiveView] = useState<string>('quality_trend');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: null,
    brewingMethods: [],
    origins: [],
    qualityRange: undefined
  });
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedBrews, setSelectedBrews] = useState<[BrewRecord | null, BrewRecord | null]>([null, null]);

  // Get available filter options from data
  const filterOptions = useMemo(() => {
    const methods = Array.from(new Set(brews.map(brew => brew.parameters.brewingMethod))).sort();
    const origins = Array.from(new Set(brews.map(brew => brew.beans.origin))).sort();
    const dateRange = brews.length > 0 ? {
      earliest: brews.reduce((earliest, brew) => 
        new Date(brew.createdAt) < new Date(earliest.createdAt) ? brew : earliest
      ).createdAt.split('T')[0],
      latest: brews.reduce((latest, brew) => 
        new Date(brew.createdAt) > new Date(latest.createdAt) ? brew : latest
      ).createdAt.split('T')[0]
    } : null;

    return { methods, origins, dateRange };
  }, [brews]);

  // Apply filters to brews
  const filteredBrews = useMemo(() => {
    let filtered = [...brews];

    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.startDate);
      const endDate = new Date(filters.dateRange.endDate);
      filtered = filtered.filter(brew => {
        const brewDate = new Date(brew.createdAt);
        return brewDate >= startDate && brewDate <= endDate;
      });
    }

    if (filters.brewingMethods.length > 0) {
      filtered = filtered.filter(brew => 
        filters.brewingMethods.includes(brew.parameters.brewingMethod)
      );
    }

    if (filters.origins.length > 0) {
      filtered = filtered.filter(brew => 
        filters.origins.includes(brew.beans.origin)
      );
    }

    if (filters.qualityRange) {
      const [minQuality, maxQuality] = filters.qualityRange;
      filtered = filtered.filter(brew => {
        const quality = getBrewQuality(brew);
        return quality >= minQuality && quality <= maxQuality;
      });
    }

    return filtered;
  }, [brews, filters]);

  const currentView = chartViews.find(view => view.id === activeView);

  const handleBrewSelect = (brew: BrewRecord, slot: 0 | 1) => {
    const newSelection = [...selectedBrews] as [BrewRecord | null, BrewRecord | null];
    newSelection[slot] = brew;
    setSelectedBrews(newSelection);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Analyze your brewing patterns and track your improvement over time
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                comparisonMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {comparisonMode ? 'Exit Comparison' : 'Compare Brews'}
            </button>
            
            <div className="text-sm text-gray-500">
              {filteredBrews.length} of {brews.length} brews
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.dateRange?.startDate || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: {
                    startDate: e.target.value,
                    endDate: prev.dateRange?.endDate || e.target.value
                  }
                }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.dateRange?.endDate || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: {
                    startDate: prev.dateRange?.startDate || e.target.value,
                    endDate: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End date"
              />
            </div>
          </div>

          {/* Brewing Methods Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brewing Methods
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filterOptions.methods.map(method => (
                <label key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.brewingMethods.includes(method)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({
                          ...prev,
                          brewingMethods: [...prev.brewingMethods, method]
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          brewingMethods: prev.brewingMethods.filter(m => m !== method)
                        }));
                      }
                    }}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Origins Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coffee Origins
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filterOptions.origins.map(origin => (
                <label key={origin} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.origins.includes(origin)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({
                          ...prev,
                          origins: [...prev.origins, origin]
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          origins: prev.origins.filter(o => o !== origin)
                        }));
                      }
                    }}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{origin}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quality Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Range
            </label>
            <div className="space-y-2">
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={filters.qualityRange?.[0] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  qualityRange: [
                    parseFloat(e.target.value) || 0,
                    prev.qualityRange?.[1] || 10
                  ]
                }))}
                placeholder="Min quality"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={filters.qualityRange?.[1] || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  qualityRange: [
                    prev.qualityRange?.[0] || 0,
                    parseFloat(e.target.value) || 10
                  ]
                }))}
                placeholder="Max quality"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({
              dateRange: null,
              brewingMethods: [],
              origins: [],
              qualityRange: undefined
            })}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {comparisonMode ? (
        /* Comparison Mode */
        <div className="space-y-6">
          {/* Brew Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Brews to Compare</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BrewSelector
                brews={filteredBrews}
                selectedBrew={selectedBrews[0]}
                onSelect={(brew) => handleBrewSelect(brew, 0)}
                label="First Brew"
                color="blue"
              />
              <BrewSelector
                brews={filteredBrews}
                selectedBrew={selectedBrews[1]}
                onSelect={(brew) => handleBrewSelect(brew, 1)}
                label="Second Brew"
                color="green"
              />
            </div>
          </div>

          {/* Comparison Charts */}
          {selectedBrews[0] && selectedBrews[1] && (
            <div className="space-y-6">
              <BrewComparisonChart
                brew1={selectedBrews[0]}
                brew2={selectedBrews[1]}
                comparisonType="brewing_parameters"
                height={400}
              />
              
              {selectedBrews[0].evaluation?.type === 'sca' && selectedBrews[1].evaluation?.type === 'sca' && (
                <BrewComparisonChart
                  brew1={selectedBrews[0]}
                  brew2={selectedBrews[1]}
                  comparisonType="sca_scores"
                  height={400}
                />
              )}
              
              <BrewComparisonChart
                brew1={selectedBrews[0]}
                brew2={selectedBrews[1]}
                comparisonType="measurements"
                height={400}
              />
            </div>
          )}
        </div>
      ) : (
        /* Analytics Mode */
        <div className="space-y-6">
          {/* Chart View Selector */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {chartViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`p-4 rounded-lg text-left transition-colors ${
                    activeView === view.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <h3 className={`font-medium mb-2 ${
                    activeView === view.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {view.title}
                  </h3>
                  <p className={`text-sm ${
                    activeView === view.id ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {view.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chart */}
          {currentView && (
            <BrewAnalyticsChart
              brews={filteredBrews}
              chartType={currentView.chartType}
              metric={currentView.metric}
              title={currentView.title}
              height={500}
              dateRange={filters.dateRange || undefined}
              filters={filters}
            />
          )}
        </div>
      )}

      {/* Analytics Summary */}
      <AnalyticsSummary brews={filteredBrews} />
    </div>
  );
};

// Helper Components

interface BrewSelectorProps {
  brews: BrewRecord[];
  selectedBrew: BrewRecord | null;
  onSelect: (brew: BrewRecord) => void;
  label: string;
  color: 'blue' | 'green';
}

const BrewSelector: React.FC<BrewSelectorProps> = ({
  brews,
  selectedBrew,
  onSelect,
  label,
  color
}) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50'
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {brews.map((brew) => (
          <button
            key={brew.id}
            onClick={() => onSelect(brew)}
            className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
              selectedBrew?.id === brew.id
                ? colorClasses[color]
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-gray-900">
              {brew.userName || `Brew ${brew.brewNumber}`}
            </div>
            <div className="text-sm text-gray-600">
              {brew.beans.brand} • {brew.beans.origin}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(brew.createdAt).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

interface AnalyticsSummaryProps {
  brews: BrewRecord[];
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ brews }) => {
  const summary = useMemo(() => {
    if (brews.length === 0) {
      return {
        totalBrews: 0,
        avgQuality: 0,
        mostUsedMethod: 'N/A',
        favoriteOrigin: 'N/A'
      };
    }

    const qualities = brews.map(getBrewQuality).filter(q => q > 0);
    const avgQuality = qualities.length > 0 ? qualities.reduce((sum, q) => sum + q, 0) / qualities.length : 0;

    const methodCounts: Record<string, number> = {};
    const originCounts: Record<string, number> = {};

    brews.forEach(brew => {
      const method = brew.parameters.brewingMethod;
      const origin = brew.beans.origin;
      
      methodCounts[method] = (methodCounts[method] || 0) + 1;
      originCounts[origin] = (originCounts[origin] || 0) + 1;
    });

    const mostUsedMethod = Object.keys(methodCounts).reduce((a, b) => 
      methodCounts[a] > methodCounts[b] ? a : b, 'N/A'
    );

    const favoriteOrigin = Object.keys(originCounts).reduce((a, b) => 
      originCounts[a] > originCounts[b] ? a : b, 'N/A'
    );

    return {
      totalBrews: brews.length,
      avgQuality,
      mostUsedMethod,
      favoriteOrigin
    };
  }, [brews]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.totalBrews}</div>
          <div className="text-sm text-gray-600">Total Brews</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{summary.avgQuality.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Avg Quality</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{summary.mostUsedMethod}</div>
          <div className="text-sm text-gray-600">Most Used Method</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-orange-600">{summary.favoriteOrigin}</div>
          <div className="text-sm text-gray-600">Favorite Origin</div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
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