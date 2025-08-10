import React, { useState, useRef, useEffect } from 'react';

interface SCAIntensitySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  showArrow?: boolean;
}

export const SCAIntensitySlider: React.FC<SCAIntensitySliderProps> = ({
  label,
  value,
  onChange,
  className = '',
  showArrow = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(value);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update dragValue when value prop changes
  useEffect(() => {
    setDragValue(value);
  }, [value]);

  const calculatePositionFromValue = (val: number) => {
    // Convert 0-15 scale to 0-100% position
    return (val / 15) * 100;
  };

  const calculateValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return value;

    const rect = sliderRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
    
    // Convert percentage to 0-15 scale and round to nearest integer
    const rawValue = percentage * 15;
    return Math.max(0, Math.min(15, Math.round(rawValue)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setPreviousValue(value); // Store previous value for arrow direction
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
    setPreviousValue(value);
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
        newValue = Math.max(0, dragValue - 1);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = Math.min(15, dragValue + 1);
        break;
      case 'Home':
        e.preventDefault();
        newValue = 0;
        break;
      case 'End':
        e.preventDefault();
        newValue = 15;
        break;
      default:
        return;
    }
    
    setPreviousValue(dragValue);
    setDragValue(newValue);
    onChange(newValue);
  };

  const currentValue = isDragging ? dragValue : value;
  const thumbPosition = calculatePositionFromValue(currentValue);
  
  // Determine arrow direction if needed
  const showDirectionArrow = showArrow && previousValue !== null && previousValue !== currentValue;
  const arrowDirection = previousValue !== null && currentValue > previousValue ? 'up' : 'down';

  return (
    <div className={`sca-intensity-slider ${className}`}>
      <div className="sca-intensity-header">
        <label className="sca-intensity-label">{label}</label>
        <div className="sca-intensity-value">
          <span className="value-number">{currentValue}</span>
          {showDirectionArrow && (
            <span className={`direction-arrow arrow-${arrowDirection}`}>
              {arrowDirection === 'up' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </div>
      
      <div 
        ref={sliderRef}
        className={`sca-intensity-track ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={15}
        aria-valuenow={currentValue}
        aria-orientation="horizontal"
      >
        {/* Background track */}
        <div className="sca-intensity-background"></div>
        
        {/* Scale markers - LOW, MEDIUM, HIGH */}
        <div className="sca-intensity-markers">
          <div className="scale-marker low" style={{ left: '0%' }}>
            <div className="marker-line"></div>
            <div className="marker-label">LOW</div>
            <div className="marker-number">0</div>
          </div>
          <div className="scale-marker medium" style={{ left: '50%' }}>
            <div className="marker-line"></div>
            <div className="marker-label">MEDIUM</div>
            <div className="marker-number">7.5</div>
          </div>
          <div className="scale-marker high" style={{ left: '100%' }}>
            <div className="marker-line"></div>
            <div className="marker-label">HIGH</div>
            <div className="marker-number">15</div>
          </div>
        </div>
        
        {/* Numerical scale markers */}
        <div className="sca-intensity-numbers">
          {[0, 5, 10, 15].map(num => (
            <div
              key={num}
              className={`number-marker ${num === currentValue ? 'active' : ''}`}
              style={{ left: `${calculatePositionFromValue(num)}%` }}
            >
              {num}
            </div>
          ))}
        </div>
        
        {/* Draggable thumb */}
        <div 
          className={`sca-intensity-thumb ${isDragging ? 'dragging' : ''}`}
          style={{ 
            left: `${thumbPosition}%`
          }}
        >
          <div className="thumb-inner"></div>
        </div>
      </div>
      
      {/* Scale labels */}
      <div className="sca-intensity-scale-labels">
        <span>LOW</span>
        <span>MEDIUM</span>
        <span>HIGH</span>
      </div>
    </div>
  );
};