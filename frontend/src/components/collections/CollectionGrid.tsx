// TASK-008B: Collections & Organization - Collection Grid Component
// Rapid Iteration: Build-first approach with responsive grid layout

import React, { useState, useEffect } from 'react';
import { CollectionSummary } from '../../types/collections';
import { CollectionCard } from './CollectionCard';
import { EmptyState } from '../common/EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './CollectionGrid.css';

interface CollectionGridProps {
  collections: CollectionSummary[];
  loading?: boolean;
  error?: string;
  viewMode?: 'grid' | 'list';
  selectionMode?: boolean;
  selectedCollections?: string[];
  showAddCard?: boolean;
  showActions?: boolean;
  showSelectAll?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onCollectionClick?: (collectionId: string) => void;
  onCollectionEdit?: (collectionId: string) => void;
  onCollectionDelete?: (collectionId: string) => void;
  onCollectionSelect?: (collectionId: string) => void;
  onSelectAll?: (collectionIds: string[]) => void;
  onClearSelection?: () => void;
  onBulkAction?: (action: 'delete' | 'export', collectionIds: string[]) => void;
  onRetry?: () => void;
}

export const CollectionGrid: React.FC<CollectionGridProps> = ({
  collections,
  loading = false,
  error,
  viewMode = 'grid',
  selectionMode = false,
  selectedCollections = [],
  showAddCard = false,
  showActions = true,
  showSelectAll = false,
  emptyMessage = 'No collections found',
  emptyDescription = 'Create your first collection to organize your brews',
  onCollectionClick,
  onCollectionEdit,
  onCollectionDelete,
  onCollectionSelect,
  onSelectAll,
  onClearSelection,
  onBulkAction,
  onRetry
}) => {
  const [animationDelay, setAnimationDelay] = useState(0);

  useEffect(() => {
    setAnimationDelay(0);
  }, [collections]);

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(collections.map(c => c.id));
    } else if (onCollectionSelect) {
      if (selectedCollections.length === collections.length) {
        // Deselect all
        selectedCollections.forEach(id => onCollectionSelect(id));
      } else {
        // Select all not currently selected
        collections.forEach(collection => {
          if (!selectedCollections.includes(collection.id)) {
            onCollectionSelect(collection.id);
          }
        });
      }
    }
  };

  const handleClearSelection = () => {
    if (onClearSelection) {
      onClearSelection();
    } else if (onCollectionSelect) {
      selectedCollections.forEach(id => onCollectionSelect(id));
    }
  };

  const handleBulkDelete = () => {
    if (onBulkAction && selectedCollections.length > 0) {
      onBulkAction('delete', selectedCollections);
    }
  };

  const handleBulkExport = () => {
    if (onBulkAction && selectedCollections.length > 0) {
      onBulkAction('export', selectedCollections);
    }
  };

  if (loading) {
    return (
      <div className="collection-grid-container">
        <div className="collection-grid-loading" role="status" aria-live="polite">
          <LoadingSpinner size="large" />
          <p className="loading-text">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="collection-grid-container">
        <div className="collection-grid-error">
          <p>{error}</p>
          {onRetry && (
            <button className="btn btn-secondary" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (collections.length === 0 && !showAddCard) {
    return (
      <div className="collection-grid-container">
        <EmptyState
          icon="📚"
          title={emptyMessage}
          message={emptyDescription}
          actionButton={onCollectionEdit ? {
            text: "Create Collection",
            action: () => onCollectionEdit('new')
          } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="collection-grid-container">
      {selectionMode && showSelectAll && (
        <div className="collection-grid-bulk-actions">
          <div className="bulk-actions-left">
            <button 
              className="bulk-action-button"
              onClick={handleSelectAll}
            >
              Select All
            </button>
            <button 
              className="bulk-action-button"
              onClick={handleClearSelection}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {selectionMode && selectedCollections.length > 0 && (
        <div className="collection-selection-status" role="status" aria-live="polite">
          <span>{selectedCollections.length} collections selected</span>
        </div>
      )}

      {selectionMode && selectedCollections.length > 0 && (
        <div className="collection-grid-bulk-actions">
          <div className="bulk-actions-right">
            <button 
              className="bulk-action-button bulk-action-export"
              onClick={handleBulkExport}
            >
              Export Selected
            </button>
            <button 
              className="bulk-action-button bulk-action-delete"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div 
        className={`collection-grid ${viewMode === 'list' ? 'collections-list' : ''}`}
        role="region"
        aria-label="Collections grid"
      >
        {showAddCard && (
          <div 
            className="collection-card-add"
            data-testid="add-collection-card"
            onClick={() => onCollectionEdit?.('new')}
          >
            <div className="add-collection-content">
              <div className="add-icon">➕</div>
              <h3 className="add-title">Create New Collection</h3>
              <p className="add-description">
                Organize your brews into meaningful groups
              </p>
            </div>
          </div>
        )}

        {collections.map((collection, index) => (
          <div
            key={collection.id}
            className="collection-grid-item"
            role="article"
            style={{
              animationDelay: `${(animationDelay + index) * 0.1}s`
            }}
          >
            <CollectionCard
              collection={collection}
              isSelected={selectedCollections.includes(collection.id)}
              onSelect={onCollectionSelect}
              onClick={onCollectionClick}
              onEdit={onCollectionEdit}
              onDelete={onCollectionDelete}
              showActions={showActions}
              selectionMode={selectionMode}
            />
          </div>
        ))}
      </div>

      {collections.length > 0 && (
        <div className="collection-grid-footer">
          <div className="collection-count">
            Showing {collections.length} collection{collections.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};