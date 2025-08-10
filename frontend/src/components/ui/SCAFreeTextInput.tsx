import React, { useState, useRef } from 'react';

interface SCAFreeTextInputProps {
  label: string;
  descriptors: string[];
  onDescriptorsChange: (descriptors: string[]) => void;
  placeholder?: string;
  maxDescriptors?: number;
  className?: string;
}

export const SCAFreeTextInput: React.FC<SCAFreeTextInputProps> = ({
  label,
  descriptors,
  onDescriptorsChange,
  placeholder = "Enter descriptors separated by commas...",
  maxDescriptors = 5,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addDescriptor();
    } else if (e.key === 'Backspace' && inputValue === '' && descriptors.length > 0) {
      // Remove last descriptor when backspace is pressed on empty input
      removeDescriptor(descriptors.length - 1);
    }
  };

  const addDescriptor = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !descriptors.includes(trimmedValue)) {
      if (descriptors.length < maxDescriptors) {
        onDescriptorsChange([...descriptors, trimmedValue]);
      } else {
        // Replace oldest descriptor if at limit
        onDescriptorsChange([...descriptors.slice(1), trimmedValue]);
      }
    }
    setInputValue('');
  };

  const removeDescriptor = (index: number) => {
    const newDescriptors = descriptors.filter((_, i) => i !== index);
    onDescriptorsChange(newDescriptors);
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addDescriptor();
    }
  };

  return (
    <div className={`sca-free-text-input ${className}`}>
      <label className="sca-free-text-label">
        {label}
        {maxDescriptors && (
          <span className="descriptor-count">
            ({descriptors.length}/{maxDescriptors})
          </span>
        )}
      </label>
      
      <div className="sca-free-text-container">
        <div className="descriptors-list">
          {descriptors.map((descriptor, index) => (
            <span key={index} className="descriptor-tag">
              {descriptor}
              <button
                type="button"
                onClick={() => removeDescriptor(index)}
                className="descriptor-remove"
                aria-label={`Remove ${descriptor}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onBlur={handleInputBlur}
          placeholder={descriptors.length === 0 ? placeholder : "Add another..."}
          className="descriptor-input"
          disabled={descriptors.length >= maxDescriptors && inputValue === ''}
        />
      </div>
      
      <div className="sca-free-text-help">
        <span className="help-text">
          Press Enter or comma to add descriptors. Use specific terms like "citric", "malic", "bright".
        </span>
        {descriptors.length >= maxDescriptors && (
          <span className="help-text limit-reached">
            Maximum descriptors reached. Remove existing ones to add new descriptors.
          </span>
        )}
      </div>
    </div>
  );
};

// Specialized components for different SCA sections
export const SCAAcidityDescriptors: React.FC<{
  descriptors: string[];
  onDescriptorsChange: (descriptors: string[]) => void;
}> = ({ descriptors, onDescriptorsChange }) => {
  return (
    <SCAFreeTextInput
      label="Acidity Descriptors"
      descriptors={descriptors}
      onDescriptorsChange={onDescriptorsChange}
      placeholder="e.g., citric, malic, bright, tart..."
      maxDescriptors={3}
      className="acidity-descriptors"
    />
  );
};

export const SCASweetnessDescriptors: React.FC<{
  descriptors: string[];
  onDescriptorsChange: (descriptors: string[]) => void;
}> = ({ descriptors, onDescriptorsChange }) => {
  return (
    <SCAFreeTextInput
      label="Sweetness Descriptors"
      descriptors={descriptors}
      onDescriptorsChange={onDescriptorsChange}
      placeholder="e.g., caramel, brown sugar, honey, floral..."
      maxDescriptors={3}
      className="sweetness-descriptors"
    />
  );
};