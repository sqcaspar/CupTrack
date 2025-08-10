import React, { useState, useEffect, useCallback } from 'react';
import { BrewRecord, BrewListFilters, BrewListResponse } from '../../types/brew';
import { useBrewService } from '../../contexts/ServiceContext';
import { BrewCard } from './BrewCard';
import { BrewFilters } from './BrewFilters';
import { Pagination } from '../common/Pagination';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import './BrewsList.css';

interface BrewsListProps {
  onViewBrew?: (brewId: string) => void;
  onEditBrew?: (brewId: string) => void;
  onNewBrew?: () => void;
  compact?: boolean;
  showFilters?: boolean;
  initialFilters?: BrewListFilters;
}

export const BrewsList: React.FC<BrewsListProps> = ({
  onViewBrew = () => {},
  onEditBrew,
  onNewBrew,
  compact = false,
  showFilters = true,
  initialFilters = {}
}) => {
  const [brews, setBrews] = useState<BrewRecord[]>([]);
  const [filters, setFilters] = useState<BrewListFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });
  const [brewListResponse, setBrewListResponse] = useState<BrewListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brewService = useBrewService();

  // Load brews based on current filters
  const loadBrews = useCallback(async (newFilters: BrewListFilters = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await brewService.getBrews(newFilters);
      setBrewListResponse(response);
      setBrews(response.brews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brews');
      console.error('Failed to load brews:', err);
    } finally {
      setLoading(false);
    }
  }, [brewService, filters]);

  // Load brews when filters change
  useEffect(() => {
    loadBrews(filters);
  }, [filters, loadBrews]);

  const handleFiltersChange = (newFilters: BrewListFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewBrew = (brewId: string) => {
    onViewBrew(brewId);
  };

  const handleDuplicate = async (brewId: string) => {
    try {
      setLoading(true);
      await brewService.duplicateBrew(brewId);
      
      // Refresh the list to show the new duplicate
      await loadBrews();
      
      // Show success message (could be implemented with a toast notification)
      console.log('Brew duplicated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate brew');
      console.error('Failed to duplicate brew:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (brewId: string, isFavorite: boolean) => {
    try {
      await brewService.toggleFavorite(brewId, isFavorite);
      
      // Update the local state immediately for better UX
      setBrews(prevBrews => 
        prevBrews.map(brew => 
          brew.id === brewId ? { ...brew, isFavorite } : brew
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDelete = async (brewId: string) => {
    try {
      setLoading(true);
      await brewService.deleteBrew(brewId);
      
      // Remove from local state
      setBrews(prevBrews => prevBrews.filter(brew => brew.id !== brewId));
      
      // If this was the last item on the page, go to previous page
      if (brews.length === 1 && filters.page && filters.page > 1) {
        setFilters(prev => ({ ...prev, page: prev.page! - 1 }));
      } else {
        // Refresh to get accurate counts
        await loadBrews();
      }
      
      console.log('Brew deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete brew');
      console.error('Failed to delete brew:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadBrews();
  };

  // Error state
  if (error && !brews.length) {
    return (
      <div className="brews-list-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Brews</h3>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={handleRetry}
            disabled={loading}
          >
            {loading ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  // Empty state for new users
  if (!loading && brews.length === 0 && !Object.values(filters).some(v => v && v !== 1 && v !== 20 && v !== 'createdAt' && v !== 'desc')) {
    return (
      <div className="brews-list-container">
        <EmptyState
          icon="☕"
          title="No brews yet"
          message="Start tracking your coffee brewing journey!"
          actionButton={onNewBrew && {
            text: 'Add Your First Brew',
            action: onNewBrew
          }}
        />
      </div>
    );
  }

  // Empty state for filtered results
  if (!loading && brews.length === 0) {
    return (
      <div className="brews-list-container">
        {showFilters && (
          <BrewFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableFilters={brewListResponse?.filters.availableFilters}
            totalRecords={brewListResponse?.pagination.totalRecords}
            isLoading={loading}
          />
        )}
        
        <EmptyState
          icon="🔍"
          title="No brews found"
          message="Try adjusting your search or filters"
          actionButton={{
            text: 'Clear Filters',
            action: () => setFilters({
              page: 1,
              limit: 20,
              sortBy: 'createdAt',
              sortOrder: 'desc'
            })
          }}
        />
      </div>
    );
  }

  return (
    <div className="brews-list-container">
      {/* Error banner for non-critical errors */}
      {error && brews.length > 0 && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <BrewFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableFilters={brewListResponse?.filters.availableFilters}
          totalRecords={brewListResponse?.pagination.totalRecords}
          isLoading={loading}
        />
      )}

      {/* Loading state */}
      {loading && brews.length === 0 && (
        <div className="loading-state">
          <LoadingSpinner />
          <p>Loading your brews...</p>
        </div>
      )}

      {/* Brews grid */}
      {brews.length > 0 && (
        <>
          <div className={`brews-grid ${compact ? 'compact' : ''}`}>
            {brews.map((brew) => (
              <BrewCard
                key={brew.id}
                brew={brew}
                onViewDetails={handleViewBrew}
                onDuplicate={handleDuplicate}
                onToggleFavorite={handleToggleFavorite}
                onEdit={onEditBrew}
                onDelete={handleDelete}
                compact={compact}
              />
            ))}
          </div>

          {/* Pagination */}
          {brewListResponse?.pagination && brewListResponse.pagination.totalPages > 1 && (
            <Pagination
              currentPage={brewListResponse.pagination.currentPage}
              totalPages={brewListResponse.pagination.totalPages}
              totalRecords={brewListResponse.pagination.totalRecords}
              onPageChange={handlePageChange}
              disabled={loading}
            />
          )}
        </>
      )}

      {/* Loading overlay for updates */}
      {loading && brews.length > 0 && (
        <div className="loading-overlay">
          <LoadingSpinner size="small" />
        </div>
      )}
    </div>
  );
};