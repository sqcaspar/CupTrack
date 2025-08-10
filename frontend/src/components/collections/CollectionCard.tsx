// TASK-008B: Collections & Organization - Collection Card Component
// Rapid Iteration: Build-first approach with focus on visual appeal

import React from 'react';
import { CollectionSummary } from '../../types/collections';
import './CollectionCard.css';

interface CollectionCardProps {
  collection: CollectionSummary;
  isSelected?: boolean;
  onSelect?: (collectionId: string) => void;
  onClick?: (collectionId: string) => void;
  onEdit?: (collectionId: string) => void;
  onDelete?: (collectionId: string) => void;
  showActions?: boolean;
  selectionMode?: boolean;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  isSelected = false,
  onSelect,
  onClick,
  onEdit,
  onDelete,
  showActions = true,
  selectionMode = false
}) => {
  const handleCardClick = () => {
    if (selectionMode && onSelect) {
      onSelect(collection.id);
    } else if (onClick) {
      onClick(collection.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(collection.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(collection.id);
    }
  };

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'No activity';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className={`collection-card ${isSelected ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`}
      onClick={handleCardClick}
      style={{ '--collection-color': collection.color } as React.CSSProperties}
    >
      {selectionMode && (
        <div className="collection-card-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect && onSelect(collection.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      <div className="collection-card-header">
        <div 
          className="collection-card-color" 
          style={{ backgroundColor: collection.color }}
        />
        <div className="collection-card-info">
          <h3 className="collection-card-name">{collection.name}</h3>
          {collection.description && (
            <p className="collection-card-description">{collection.description}</p>
          )}
        </div>
        
        {showActions && !selectionMode && (
          <div className="collection-card-actions">
            <button 
              className="action-button action-button-small"
              onClick={handleEditClick}
              title="Edit collection"
            >
              ✏️
            </button>
            <button 
              className="action-button action-button-small action-button-danger"
              onClick={handleDeleteClick}
              title="Delete collection"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      
      <div className="collection-card-preview">
        {collection.previewBrews && collection.previewBrews.length > 0 ? (
          <div className="collection-brew-previews">
            {collection.previewBrews.slice(0, 3).map((brew, index) => (
              <div key={brew.id} className="brew-preview-item">
                <div className="brew-preview-icon">☕</div>
                <span className="brew-preview-name">{brew.beans.brand}</span>
              </div>
            ))}
            {collection.previewBrews.length > 3 && (
              <div className="brew-preview-more">
                +{collection.previewBrews.length - 3} more
              </div>
            )}
          </div>
        ) : (
          <div className="collection-empty-state">
            <div className="empty-collection-icon">📁</div>
            <span className="empty-collection-text">No brews yet</span>
          </div>
        )}
      </div>
      
      <div className="collection-card-stats">
        <div className="collection-stat">
          <span className="stat-icon">☕</span>
          <span className="stat-value">{collection.brewCount}</span>
          <span className="stat-label">brews</span>
        </div>
        
        <div className="collection-stat">
          <span className="stat-icon">📅</span>
          <span className="stat-value">{formatLastActivity(collection.lastBrewDate)}</span>
        </div>
      </div>
      
      <div className="collection-card-indicator" />
    </div>
  );
};