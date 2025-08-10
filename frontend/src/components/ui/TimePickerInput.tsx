import React, { useState, useEffect, useRef, useCallback } from 'react';
import { secondsToComponents, componentsToSeconds, TIME_PICKER_RANGES } from '../../utils/timeUtils';

interface TimePickerInputProps {
  value: number; // Total seconds
  onChange: (seconds: number) => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

interface WheelProps {
  options: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const ScrollWheel: React.FC<WheelProps> = ({ options, value, onChange, label }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const itemHeight = 40; // Height of each option in pixels
  const visibleItems = 3; // Number of visible items (center one is selected)

  // Calculate the scroll position for the current value
  const getScrollPosition = useCallback((selectedValue: number) => {
    const index = options.findIndex(option => option.value === selectedValue);
    return Math.max(0, (index - Math.floor(visibleItems / 2)) * itemHeight);
  }, [options, visibleItems]);

  // Update scroll position when value changes
  useEffect(() => {
    if (containerRef.current && !isDragging) {
      const scrollPosition = getScrollPosition(value);
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [value, getScrollPosition, isDragging]);

  // Handle scroll to select closest option
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isDragging) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const selectedIndex = Math.round(scrollTop / itemHeight) + Math.floor(visibleItems / 2);
    const clampedIndex = Math.max(0, Math.min(options.length - 1, selectedIndex));
    
    if (options[clampedIndex] && options[clampedIndex].value !== value) {
      onChange(options[clampedIndex].value);
    }

    // Smooth snap to the nearest option
    const targetScrollTop = (clampedIndex - Math.floor(visibleItems / 2)) * itemHeight;
    if (Math.abs(targetScrollTop - scrollTop) > 1) {
      container.scrollTop = targetScrollTop;
    }
  }, [options, value, onChange, isDragging, visibleItems]);

  // Mouse/touch drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setScrollTop(containerRef.current?.scrollTop || 0);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const deltaY = e.clientY - startY;
    containerRef.current.scrollTop = scrollTop - deltaY;
  }, [isDragging, startY, scrollTop]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Trigger snap after drag ends
    setTimeout(handleScroll, 0);
  }, [handleScroll]);

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setScrollTop(containerRef.current?.scrollTop || 0);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const deltaY = e.touches[0].clientY - startY;
    containerRef.current.scrollTop = scrollTop - deltaY;
  }, [isDragging, startY, scrollTop]);

  // Add global event listeners for mouse/touch
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = options.findIndex(option => option.value === value);
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(options.length - 1, currentIndex + 1);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = options.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex && options[newIndex]) {
      onChange(options[newIndex].value);
    }
  };

  return (
    <div className="time-wheel">
      <div 
        className="wheel-container"
        ref={containerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="listbox"
        aria-label={`${label} selector`}
        style={{ 
          height: `${visibleItems * itemHeight}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div className="wheel-padding" style={{ height: `${itemHeight}px` }} />
        {options.map((option) => (
          <div
            key={option.value}
            className={`wheel-option ${option.value === value ? 'selected' : ''}`}
            style={{ height: `${itemHeight}px` }}
            onClick={() => onChange(option.value)}
            role="option"
            aria-selected={option.value === value}
          >
            {option.label}
          </div>
        ))}
        <div className="wheel-padding" style={{ height: `${itemHeight}px` }} />
      </div>
      <div className="wheel-selection-overlay" />
      <div className="wheel-label">{label}</div>
    </div>
  );
};

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  value,
  onChange,
  className = '',
  disabled = false,
  'aria-label': ariaLabel = 'Action time picker'
}) => {
  const { hours, minutes, seconds } = secondsToComponents(value);

  const handleComponentChange = useCallback((component: 'hours' | 'minutes' | 'seconds', newValue: number) => {
    let newHours = hours;
    let newMinutes = minutes;
    let newSeconds = seconds;

    switch (component) {
      case 'hours':
        newHours = newValue;
        break;
      case 'minutes':
        newMinutes = newValue;
        break;
      case 'seconds':
        newSeconds = newValue;
        break;
    }

    const totalSeconds = componentsToSeconds(newHours, newMinutes, newSeconds);
    onChange(totalSeconds);
  }, [hours, minutes, seconds, onChange]);

  return (
    <div 
      className={`time-picker-input ${className} ${disabled ? 'disabled' : ''}`}
      aria-label={ariaLabel}
      role="group"
    >
      <ScrollWheel
        options={TIME_PICKER_RANGES.HOURS}
        value={hours}
        onChange={(value) => handleComponentChange('hours', value)}
        label="Hours"
      />
      <div className="time-separator">:</div>
      <ScrollWheel
        options={TIME_PICKER_RANGES.MINUTES}
        value={minutes}
        onChange={(value) => handleComponentChange('minutes', value)}
        label="Minutes"
      />
      <div className="time-separator">:</div>
      <ScrollWheel
        options={TIME_PICKER_RANGES.SECONDS}
        value={seconds}
        onChange={(value) => handleComponentChange('seconds', value)}
        label="Seconds"
      />
    </div>
  );
};