// TASK-007A: Analytics & Data Visualization - Rapid Iteration
// Main analytics page component with data fetching and error handling

import React, { useState, useEffect } from 'react';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { BrewRecord } from '../types/brew';
import { getBrewService } from '../services/brewService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

interface AnalyticsState {
  brews: BrewRecord[];
  loading: boolean;
  error: string | null;
  hasData: boolean;
}

export const Analytics: React.FC = () => {
  const [state, setState] = useState<AnalyticsState>({
    brews: [],
    loading: true,
    error: null,
    hasData: false
  });

  const [refreshing, setRefreshing] = useState(false);

  // Fetch brews data on component mount
  useEffect(() => {
    fetchBrewsData();
  }, []);

  const fetchBrewsData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const brewService = getBrewService();
      
      // Fetch all brews with a large limit for analytics
      const response = await brewService.getBrews({
        page: 1,
        limit: 1000, // Large limit to get all brews for analytics
        sortBy: 'createdAt',
        sortOrder: 'asc' // Oldest first for trend analysis
      });

      setState({
        brews: response.brews,
        loading: false,
        error: null,
        hasData: response.brews.length > 0
      });
    } catch (error) {
      console.error('Failed to fetch brews for analytics:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load brewing data. Please try again.',
        hasData: false
      }));
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchBrewsData(true);
  };

  const handleRetry = () => {
    fetchBrewsData();
  };

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="text-gray-600 mt-4">Loading your brewing analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error && !state.hasData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md">
              <div className="text-red-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Load Analytics
              </h3>
              <p className="text-gray-600 mb-6">
                {state.error}
              </p>
              <button
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no brews to analyze
  if (!state.hasData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <EmptyState
              icon="chart"
              title="No Brewing Data Yet"
              description="Start logging your brews to see detailed analytics and insights about your brewing journey."
              actionLabel="Create Your First Brew"
              onAction={() => {
                // Navigate to brew creation wizard
                window.location.href = '/brews/new';
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Gain insights from your brewing data and track your improvement over time
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Data refresh indicator */}
              {refreshing && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <LoadingSpinner size="small" />
                  <span>Updating...</span>
                </div>
              )}
              
              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>

              {/* Export analytics button (future implementation) */}
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={true}
                title="Export functionality coming soon"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Report
              </button>
            </div>
          </div>

          {/* Analytics metadata */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>{state.brews.length} total brews analyzed</span>
            </div>
            
            {state.brews.length > 0 && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v2m0 0v2m0-2h2m-2 0H8m4-10h6a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h6z" />
                </svg>
                <span>
                  Date range: {new Date(state.brews[0].createdAt).toLocaleDateString()} - {' '}
                  {new Date(state.brews[state.brews.length - 1].createdAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Last updated: {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="container mx-auto px-4 py-8">
        {state.error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.112 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-yellow-800 text-sm">
                {state.error} Some analytics may be based on cached data.
              </p>
            </div>
          </div>
        )}

        <AnalyticsDashboard brews={state.brews} />
      </div>
    </div>
  );
};