import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionButton?: {
    text: string;
    action: () => void;
  };
  secondaryButton?: {
    text: string;
    action: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionButton,
  secondaryButton
}) => {
  return (
    <div className="empty-state">
      {icon && (
        <div className="empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      
      <div className="empty-state-content">
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-message">{message}</p>
        
        {(actionButton || secondaryButton) && (
          <div className="empty-state-actions">
            {actionButton && (
              <button 
                className="empty-state-button primary"
                onClick={actionButton.action}
              >
                {actionButton.text}
              </button>
            )}
            {secondaryButton && (
              <button 
                className="empty-state-button secondary"
                onClick={secondaryButton.action}
              >
                {secondaryButton.text}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};