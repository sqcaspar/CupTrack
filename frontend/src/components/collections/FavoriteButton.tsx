// TASK-008B: Collections & Organization - Favorite Button Component
// Rapid Iteration: Heart icon toggle with smooth animations

import React, { useState } from 'react';
import { CollectionsService } from '../../services/collectionsService';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  brewId: string;
  isFavorite: boolean;
  onToggle?: (brewId: string, isFavorite: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  brewId,
  isFavorite: initialFavorite,
  onToggle,
  size = 'medium',
  showLabel = false,
  disabled = false,
  className = ''
}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggleFavorite = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (disabled || isLoading) return;

    setIsLoading(true);
    setIsAnimating(true);

    try {
      const newFavoriteState = !isFavorite;
      
      // Optimistic update
      setIsFavorite(newFavoriteState);
      
      // Call service
      await CollectionsService.toggleFavorite({
        brewId,
        isFavorite: newFavoriteState
      });

      // Notify parent component
      if (onToggle) {
        onToggle(brewId, newFavoriteState);
      }

    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Revert on error
      setIsFavorite(initialFavorite);
      
      // Could show a toast notification here
    } finally {
      setIsLoading(false);
      
      // Remove animation class after animation completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'favorite-button-small';
      case 'large': return 'favorite-button-large';
      default: return 'favorite-button-medium';
    }
  };

  return (
    <button
      className={`
        favorite-button 
        ${getSizeClass()} 
        ${isFavorite ? 'favorite-active' : ''} 
        ${isAnimating ? 'favorite-animating' : ''} 
        ${disabled ? 'favorite-disabled' : ''} 
        ${className}
      `.trim()}
      onClick={handleToggleFavorite}
      disabled={disabled || isLoading}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <div className="favorite-icon-container">
        {isLoading ? (
          <div className="favorite-spinner" />
        ) : (
          <>
            <span className="favorite-icon favorite-icon-outline">♡</span>
            <span className="favorite-icon favorite-icon-filled">♥</span>
          </>
        )}
      </div>
      
      {showLabel && (
        <span className="favorite-label">
          {isFavorite ? 'Favorited' : 'Favorite'}
        </span>
      )}
      
      {/* Ripple effect */}
      <div className="favorite-ripple" />
    </button>
  );
};