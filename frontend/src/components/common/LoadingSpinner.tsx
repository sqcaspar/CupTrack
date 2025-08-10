import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#007bff',
  message
}) => {
  return (
    <div className="loading-spinner-container">
      <div 
        className={`loading-spinner ${size}`}
        style={{ borderTopColor: color, borderLeftColor: color }}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="loading-message">{message}</p>
      )}
    </div>
  );
};