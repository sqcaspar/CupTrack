import React, { useState, useRef, useEffect } from 'react';

interface SCASliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const SCASlider: React.FC<SCASliderProps> = ({
  label,
  value,
  onChange,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(value);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update dragValue when value prop changes
  useEffect(() => {
    setDragValue(value);
  }, [value]);

  const getColorForValue = (val: number) => {
    if (val <= 3) return '#e74c3c'; // Red for low quality
    if (val === 4) return '#f39c12'; // Orange for slightly low
    if (val === 5) return '#95a5a6'; // Gray for neutral
    if (val === 6) return '#f1c40f'; // Yellow for slightly high
    if (val >= 7) return '#27ae60'; // Green for high quality
    return '#95a5a6';
  };

  const calculatePositionFromValue = (val: number) => {
    // Convert 1-9 scale to 0-100% position
    return ((val - 1) / 8) * 100;
  };

  const calculateValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return value;

    const rect = sliderRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    
    // Convert percentage to 1-9 scale and round to nearest integer
    const rawValue = 1 + (percentage * 8);
    return Math.max(1, Math.min(9, Math.round(rawValue)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const newValue = calculateValueFromPosition(e.clientX);
    setDragValue(newValue);
    onChange(newValue);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newValue = calculateValueFromPosition(e.clientX);
    setDragValue(newValue);
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const newValue = calculateValueFromPosition(touch.clientX);
    setDragValue(newValue);
    onChange(newValue);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const newValue = calculateValueFromPosition(touch.clientX);
    setDragValue(newValue);
    onChange(newValue);
  };

  // Keyboard support for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newValue = dragValue;
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = Math.max(1, dragValue - 1);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = Math.min(9, dragValue + 1);
        break;
      case 'Home':
        e.preventDefault();
        newValue = 1;
        break;
      case 'End':
        e.preventDefault();
        newValue = 9;
        break;
      default:
        return;
    }
    
    setDragValue(newValue);
    onChange(newValue);
  };

  const currentValue = isDragging ? dragValue : value;
  const sliderColor = getColorForValue(currentValue);
  const thumbPosition = calculatePositionFromValue(currentValue);

  return (
    <div className={`sca-slider-container ${className}`}>
      <div className="sca-slider-header">
        <label className="sca-slider-label">{label}</label>
        <div className="sca-slider-value" style={{ color: sliderColor }}>
          {currentValue}/9
        </div>
      </div>
      
      <div 
        ref={sliderRef}
        className={`sca-slider-track ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={9}
        aria-valuenow={currentValue}
        aria-orientation="horizontal"
      >
        {/* Background track */}
        <div className="sca-slider-background"></div>
        
        {/* Filled portion */}
        <div 
          className="sca-slider-fill"
          style={{ 
            width: `${thumbPosition}%`,
            backgroundColor: sliderColor + '40' // 40 for transparency
          }}
        ></div>
        
        {/* Scale markers */}
        <div className="sca-slider-markers">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(markerValue => (
            <div
              key={markerValue}
              className={`sca-slider-marker ${markerValue === 5 ? 'neutral' : ''} ${markerValue === currentValue ? 'active' : ''}`}
              style={{ left: `${calculatePositionFromValue(markerValue)}%` }}
            >
              <div className="marker-dot"></div>
              <div className="marker-label">{markerValue}</div>
            </div>
          ))}
        </div>
        
        {/* Draggable thumb */}
        <div 
          className={`sca-slider-thumb ${isDragging ? 'dragging' : ''}`}
          style={{ 
            left: `${thumbPosition}%`,
            backgroundColor: sliderColor,
            borderColor: sliderColor
          }}
        >
          <div className="thumb-inner"></div>
        </div>
      </div>
      
      {/* Quality indicator */}
      <div className="sca-slider-quality">
        <span className="quality-text" style={{ color: sliderColor }}>
          {currentValue <= 3 ? 'Low Quality' : 
           currentValue === 4 ? 'Slightly Low' :
           currentValue === 5 ? 'Neutral' :
           currentValue === 6 ? 'Slightly High' :
           'High Quality'}
        </span>
      </div>
    </div>
  );
};