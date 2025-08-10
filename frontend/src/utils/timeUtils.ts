// Time formatting utilities for turbulence step action time
// Converts between seconds (storage format) and HH:MM:SS (display format)

/**
 * Formats seconds into HH:MM:SS string format
 * @param seconds - Total seconds (0 to 3600)
 * @returns Formatted time string like "00:02:30"
 */
export const formatSecondsToTime = (seconds: number): string => {
  // Clamp to valid range (0 to 3600 seconds = 1 hour)
  const clampedSeconds = Math.max(0, Math.min(3600, Math.floor(seconds)));
  
  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const remainingSeconds = clampedSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Parses HH:MM:SS time string into total seconds
 * @param timeString - Time in format "HH:MM:SS" or "MM:SS" or "SS"
 * @returns Total seconds, or 1 if invalid input
 */
export const parseTimeToSeconds = (timeString: string): number => {
  if (!timeString || typeof timeString !== 'string') {
    return 1; // Default to 1 second
  }
  
  const parts = timeString.split(':').map(part => parseInt(part.trim(), 10));
  
  // Handle different formats
  if (parts.length === 1) {
    // SS format
    const seconds = parts[0] || 0;
    return Math.max(1, Math.min(3600, seconds));
  } else if (parts.length === 2) {
    // MM:SS format
    const [minutes, seconds] = parts;
    const totalSeconds = (minutes || 0) * 60 + (seconds || 0);
    return Math.max(1, Math.min(3600, totalSeconds));
  } else if (parts.length === 3) {
    // HH:MM:SS format
    const [hours, minutes, seconds] = parts;
    const totalSeconds = (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
    return Math.max(1, Math.min(3600, totalSeconds));
  }
  
  return 1; // Default fallback
};

/**
 * Validates if a time string is in correct format
 * @param timeString - Time string to validate
 * @returns true if valid format, false otherwise
 */
export const validateTimeInput = (timeString: string): boolean => {
  if (!timeString || typeof timeString !== 'string') {
    return false;
  }
  
  // Check if it matches HH:MM:SS format
  const timeRegex = /^([0-5]?\d):([0-5]?\d):([0-5]?\d)$/;
  const match = timeString.match(timeRegex);
  
  if (!match) {
    return false;
  }
  
  const [, hours, minutes, seconds] = match;
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  const s = parseInt(seconds, 10);
  
  // Validate ranges
  return h >= 0 && h <= 1 && // Max 1 hour
         m >= 0 && m <= 59 &&
         s >= 0 && s <= 59 &&
         (h > 0 || m > 0 || s > 0); // At least 1 second total
};

/**
 * Breaks down seconds into hours, minutes, seconds components
 * @param seconds - Total seconds
 * @returns Object with hours, minutes, seconds properties
 */
export const secondsToComponents = (seconds: number): { hours: number; minutes: number; seconds: number } => {
  const clampedSeconds = Math.max(0, Math.min(3600, Math.floor(seconds)));
  
  return {
    hours: Math.floor(clampedSeconds / 3600),
    minutes: Math.floor((clampedSeconds % 3600) / 60),
    seconds: clampedSeconds % 60
  };
};

/**
 * Converts time components to total seconds
 * @param hours - Hours component (0-1)
 * @param minutes - Minutes component (0-59)
 * @param seconds - Seconds component (0-59)
 * @returns Total seconds
 */
export const componentsToSeconds = (hours: number, minutes: number, seconds: number): number => {
  const totalSeconds = (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
  return Math.max(1, Math.min(3600, totalSeconds));
};

/**
 * Formats seconds for display in step summary
 * Shows seconds only if under 1 minute, otherwise shows MM:SS or HH:MM:SS
 * @param seconds - Total seconds
 * @returns Formatted string for display
 */
export const formatTimeForSummary = (seconds: number): string => {
  const clampedSeconds = Math.max(0, Math.min(3600, Math.floor(seconds)));
  
  if (clampedSeconds < 60) {
    return `${clampedSeconds}s`;
  } else if (clampedSeconds < 3600) {
    const minutes = Math.floor(clampedSeconds / 60);
    const remainingSeconds = clampedSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return formatSecondsToTime(clampedSeconds);
  }
};

// Constants for time picker ranges
export const TIME_PICKER_RANGES = {
  HOURS: Array.from({ length: 2 }, (_, i) => ({ value: i, label: i.toString().padStart(2, '0') })), // 0-1 hours
  MINUTES: Array.from({ length: 60 }, (_, i) => ({ value: i, label: i.toString().padStart(2, '0') })), // 0-59 minutes
  SECONDS: Array.from({ length: 60 }, (_, i) => ({ value: i, label: i.toString().padStart(2, '0') })) // 0-59 seconds
};