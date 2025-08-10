import React from 'react';
import { BrewListFilters, BREWING_METHOD_OPTIONS } from '../../types/brew';
import './BrewFilters.css';

interface BrewFiltersProps {
  filters: BrewListFilters;
  onFiltersChange: (filters: BrewListFilters) => void;
  availableFilters?: {
    methods: string[];
    dateRange: {
      earliest: string;
      latest: string;
    };
  };
  totalRecords?: number;
  isLoading?: boolean;
}

export const BrewFilters: React.FC<BrewFiltersProps> = ({
  filters,
  onFiltersChange,
  availableFilters,
  totalRecords = 0,
  isLoading = false
}) => {
  const handleFilterChange = (key: keyof BrewListFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset page to 1 when filters change
    if (key !== 'page') {
      newFilters.page = 1;
    }
    
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.method ||
      filters.favorites ||
      filters.dateFrom ||
      filters.dateTo ||
      (filters.sortBy && filters.sortBy !== 'createdAt') ||
      (filters.sortOrder && filters.sortOrder !== 'desc')
    );
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.method) count++;
    if (filters.favorites) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  };

  return (
    <div className="brew-filters">
      <div className="filters-header">
        <div className="filters-info">
          <span className="results-count">
            {totalRecords} brew{totalRecords !== 1 ? 's' : ''}
            {isLoading && ' (loading...)'}
          </span>
          {hasActiveFilters() && (
            <span className="active-filters">
              {getFilterCount()} filter{getFilterCount() !== 1 ? 's' : ''} active
            </span>
          )}
        </div>
        {hasActiveFilters() && (
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
            disabled={isLoading}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="filters-row">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search coffee brands, origins..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
              disabled={isLoading}
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="method-filter" className="filter-label">Method</label>
            <select
              id="method-filter"
              value={filters.method || ''}
              onChange={(e) => handleFilterChange('method', e.target.value || undefined)}
              className="filter-select"
              disabled={isLoading}
            >
              <option value="">All Methods</option>
              {BREWING_METHOD_OPTIONS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-filter" className="filter-label">Sort By</label>
            <select
              id="sort-filter"
              value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as ['createdAt' | 'quality' | 'brewNumber', 'asc' | 'desc'];
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="filter-select"
              disabled={isLoading}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="quality-desc">Highest Quality</option>
              <option value="quality-asc">Lowest Quality</option>
              <option value="brewNumber-desc">Latest Brew #</option>
              <option value="brewNumber-asc">Earliest Brew #</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="limit-filter" className="filter-label">Per Page</label>
            <select
              id="limit-filter"
              value={filters.limit || 20}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="filter-select"
              disabled={isLoading}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      <div className="filters-row secondary">
        <div className="toggle-filters">
          <label className="toggle-filter">
            <input
              type="checkbox"
              checked={filters.favorites || false}
              onChange={(e) => handleFilterChange('favorites', e.target.checked || undefined)}
              disabled={isLoading}
            />
            <span className="toggle-checkmark"></span>
            Show Favorites Only
          </label>
        </div>

        <div className="date-filters">
          <div className="date-filter-group">
            <label htmlFor="date-from" className="filter-label">From</label>
            <input
              type="date"
              id="date-from"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
              className="date-input"
              disabled={isLoading}
              max={filters.dateTo || availableFilters?.dateRange.latest?.split('T')[0]}
            />
          </div>
          
          <div className="date-filter-group">
            <label htmlFor="date-to" className="filter-label">To</label>
            <input
              type="date"
              id="date-to"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
              className="date-input"
              disabled={isLoading}
              min={filters.dateFrom || availableFilters?.dateRange.earliest?.split('T')[0]}
              max={availableFilters?.dateRange.latest?.split('T')[0]}
            />
          </div>
        </div>
      </div>

      {/* Quick Filter Chips */}
      {hasActiveFilters() && (
        <div className="active-filter-chips">
          {filters.search && (
            <div className="filter-chip">
              <span>Search: "{filters.search}"</span>
              <button 
                onClick={() => handleFilterChange('search', undefined)}
                aria-label="Remove search filter"
              >
                ×
              </button>
            </div>
          )}
          
          {filters.method && (
            <div className="filter-chip">
              <span>Method: {BREWING_METHOD_OPTIONS.find(m => m.value === filters.method)?.label}</span>
              <button 
                onClick={() => handleFilterChange('method', undefined)}
                aria-label="Remove method filter"
              >
                ×
              </button>
            </div>
          )}
          
          {filters.favorites && (
            <div className="filter-chip">
              <span>Favorites Only</span>
              <button 
                onClick={() => handleFilterChange('favorites', undefined)}
                aria-label="Remove favorites filter"
              >
                ×
              </button>
            </div>
          )}
          
          {(filters.dateFrom || filters.dateTo) && (
            <div className="filter-chip">
              <span>
                Date: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
              </span>
              <button 
                onClick={() => {
                  handleFilterChange('dateFrom', undefined);
                  handleFilterChange('dateTo', undefined);
                }}
                aria-label="Remove date filter"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};