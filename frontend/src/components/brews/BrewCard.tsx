import React from 'react';
import { BrewRecord } from '../../types/brew';
import { FavoriteButton } from '../collections/FavoriteButton';
import './BrewCard.css';

interface BrewCardProps {
  brew: BrewRecord;
  onViewDetails: (brewId: string) => void;
  onDuplicate: (brewId: string) => void;
  onToggleFavorite: (brewId: string, isFavorite: boolean) => void;
  onEdit?: (brewId: string) => void;
  onDelete?: (brewId: string) => void;
  compact?: boolean;
}

export const BrewCard: React.FC<BrewCardProps> = ({
  brew,
  onViewDetails,
  onDuplicate,
  onToggleFavorite,
  onEdit,
  onDelete,
  compact = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getQualityScore = () => {
    if (!brew.evaluation) return null;
    
    switch (brew.evaluation.type) {
      case 'quick':
        return brew.evaluation.overallQuality;
      case 'sca':
        const scaEval = brew.evaluation as any; // SCAEvaluation
        return scaEval.finalScore || 0;
      case 'cva_affective':
        return brew.evaluation.scaScore || null;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'excellent';
    if (score >= 7.5) return 'good';
    if (score >= 6.0) return 'fair';
    return 'poor';
  };

  const qualityScore = getQualityScore();

  return (
    <div className={`brew-card ${compact ? 'compact' : ''}`}>
      <div className="brew-card-header">
        <div className="brew-card-meta">
          <span className="brew-number">{brew.brewNumber}</span>
          <span className="brew-date">{formatDate(brew.createdAt)}</span>
        </div>
        <div className="brew-card-actions">
          <FavoriteButton
            brewId={brew.id}
            isFavorite={brew.isFavorite}
            onToggle={onToggleFavorite}
            size="small"
          />
          {qualityScore && (
            <div className={`quality-score ${getScoreColor(qualityScore)}`}>
              {qualityScore.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <div className="brew-card-content" onClick={() => onViewDetails(brew.id)}>
        <div className="brew-card-title">
          <h3 className="coffee-brand">{brew.beans.brand}</h3>
          {brew.userName && (
            <span className="user-name">{brew.userName}</span>
          )}
        </div>
        
        <div className="brew-details">
          <div className="origin-info">
            <span className="origin">{brew.beans.origin}</span>
            <span className="processing">
              {brew.beans.processingMethod === 'other' && brew.beans.customProcessingMethod 
                ? brew.beans.customProcessingMethod
                : brew.beans.processingMethod}
            </span>
          </div>
          
          <div className="brewing-info">
            <span className="method">{brew.parameters.brewingMethod}</span>
            <span className="ratio">1:{brew.measurements.coffeeToWaterRatio}</span>
            <span className="temperature">{brew.parameters.waterTemperature}°C</span>
          </div>

          {!compact && brew.evaluation?.notes && (
            <div className="brew-notes">
              <p>{brew.evaluation.notes}</p>
            </div>
          )}
        </div>

        {!compact && (
          <div className="brew-measurements">
            <div className="measurement">
              <span className="label">Coffee</span>
              <span className="value">{brew.measurements.coffeeBeansWeight}g</span>
            </div>
            <div className="measurement">
              <span className="label">Water</span>
              <span className="value">{brew.measurements.waterWeight}g</span>
            </div>
            {brew.measurements.tdsPercentage && (
              <div className="measurement">
                <span className="label">TDS</span>
                <span className="value">{brew.measurements.tdsPercentage}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="brew-card-footer">
        <div className="card-actions">
          <button 
            className="action-button primary"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(brew.id);
            }}
          >
            View Details
          </button>
          <button 
            className="action-button secondary"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(brew.id);
            }}
          >
            Duplicate
          </button>
          {onEdit && (
            <button 
              className="action-button secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(brew.id);
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button 
              className="action-button danger"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this brew? This action cannot be undone.')) {
                  onDelete(brew.id);
                }
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {brew.isShared && (
        <div className="shared-indicator" title="This brew is shared publicly">
          🌍
        </div>
      )}
    </div>
  );
};