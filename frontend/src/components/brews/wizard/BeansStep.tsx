import React, { useState } from 'react';
import { CoffeeBeans, COFFEE_ORIGIN_OPTIONS, PROCESSING_METHOD_OPTIONS } from '../../../types/brew';

interface BeansStepProps {
  data?: CoffeeBeans;
  errors: Record<string, string>;
  onChange: (data: CoffeeBeans) => void;
}

export const BeansStep: React.FC<BeansStepProps> = ({
  data = {
    brand: '',
    origin: '',
    processingMethod: 'washed'
  },
  errors,
  onChange
}) => {
  // State for collapsible optional information section
  const [isOptionalExpanded, setIsOptionalExpanded] = useState(false);

  const toggleOptionalSection = () => {
    setIsOptionalExpanded(!isOptionalExpanded);
  };

  const handleChange = (field: keyof CoffeeBeans, value: string | number | undefined) => {
    const newData = {
      ...data,
      [field]: value
    };
    
    // Clear custom processing method if processing method is not 'other'
    if (field === 'processingMethod' && value !== 'other') {
      newData.customProcessingMethod = undefined;
    }
    
    // Clear custom origin if origin is not 'other'
    if (field === 'origin' && value !== 'other') {
      newData.customOrigin = undefined;
    }
    
    onChange(newData);
  };

  return (
    <div className="beans-step">
      <div className="step-description">
        <p>Tell us about the coffee beans you're using for this brew.</p>
      </div>
      
      <div className="form-grid">
        {/* Required Fields */}
        <div className="form-section">
          <h3>Required Information</h3>
          
          <div className="form-group">
            <label htmlFor="brand" className="form-label required">
              Coffee Brand *
            </label>
            <input
              id="brand"
              type="text"
              className={`form-input ${errors.brand ? 'error' : ''}`}
              value={data.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              placeholder="e.g., Blue Bottle, Stumptown, Local Roaster"
              maxLength={100}
            />
            {errors.brand && (
              <div className="form-error">{errors.brand}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="origin" className="form-label required">
              Origin *
            </label>
            <select
              id="origin"
              className={`form-select ${errors.origin ? 'error' : ''}`}
              value={data.origin}
              onChange={(e) => handleChange('origin', e.target.value)}
            >
              <option value="">Select coffee origin...</option>
              {Object.entries(COFFEE_ORIGIN_OPTIONS).map(([continent, countries]) => (
                <optgroup key={continent} label={continent}>
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.origin && (
              <div className="form-error">{errors.origin}</div>
            )}
          </div>

          {/* Conditional custom origin input */}
          {data.origin === 'other' && (
            <div className="form-group conditional-input">
              <label htmlFor="customOrigin" className="form-label required">
                Enter Custom Origin *
              </label>
              <input
                type="text"
                id="customOrigin"
                className={`form-input ${errors.customOrigin ? 'error' : ''}`}
                placeholder="Enter coffee origin..."
                value={data.customOrigin || ''}
                onChange={(e) => handleChange('customOrigin', e.target.value)}
              />
              {errors.customOrigin && (
                <div className="form-error">{errors.customOrigin}</div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="processingMethod" className="form-label required">
              Processing Method *
            </label>
            <select
              id="processingMethod"
              className={`form-select ${errors.processingMethod ? 'error' : ''}`}
              value={data.processingMethod}
              onChange={(e) => handleChange('processingMethod', e.target.value)}
            >
              {PROCESSING_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.processingMethod && (
              <div className="form-error">{errors.processingMethod}</div>
            )}
            
            {/* Conditional custom processing method input */}
            {data.processingMethod === 'other' && (
              <div className="form-group conditional-input">
                <label htmlFor="customProcessingMethod" className="form-label required">
                  Specify Processing Method *
                </label>
                <input
                  id="customProcessingMethod"
                  type="text"
                  className={`form-input ${errors.customProcessingMethod ? 'error' : ''}`}
                  value={data.customProcessingMethod || ''}
                  onChange={(e) => handleChange('customProcessingMethod', e.target.value)}
                  placeholder="e.g., Carbonic Maceration, Extended Fermentation"
                  maxLength={50}
                />
                {errors.customProcessingMethod && (
                  <div className="form-error">{errors.customProcessingMethod}</div>
                )}
                <div className="form-hint">
                  Please specify the processing method (max 50 characters)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Optional Fields - Collapsible Section */}
        <div className="form-section optional-section">
          <div 
            className="collapsible-header"
            onClick={toggleOptionalSection}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleOptionalSection();
              }
            }}
            tabIndex={0}
            role="button"
            aria-expanded={isOptionalExpanded}
            aria-controls="optional-fields"
          >
            <h3>Optional Information</h3>
            <span className={`expand-icon ${isOptionalExpanded ? 'expanded' : ''}`}>
              {isOptionalExpanded ? '−' : '+'}
            </span>
          </div>
          
          <div 
            id="optional-fields"
            className={`collapsible-content ${isOptionalExpanded ? 'expanded' : 'collapsed'}`}
          >
            <div className="form-group">
            <label htmlFor="altitude" className="form-label">
              Altitude (meters)
            </label>
            <input
              id="altitude"
              type="number"
              className="form-input"
              value={data.altitude || ''}
              onChange={(e) => handleChange('altitude', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 1800"
              min="0"
              max="3000"
            />
            <div className="form-hint">
              Growing altitude in meters above sea level
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="roastingDate" className="form-label">
              Roasting Date
            </label>
            <input
              id="roastingDate"
              type="date"
              className="form-input"
              value={data.roastingDate || ''}
              onChange={(e) => handleChange('roastingDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <div className="form-hint">
              When were these beans roasted?
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="roastingLevel" className="form-label">
              Roasting Level
            </label>
            <select
              id="roastingLevel"
              className="form-select"
              value={data.roastingLevel || ''}
              onChange={(e) => handleChange('roastingLevel', e.target.value)}
            >
              <option value="">Select roasting level</option>
              <option value="light">Light</option>
              <option value="light-medium">Light-Medium</option>
              <option value="medium">Medium</option>
              <option value="medium-dark">Medium-Dark</option>
              <option value="dark">Dark</option>
              <option value="very-dark">Very Dark</option>
            </select>
            <div className="form-hint">
              How dark were the beans roasted?
            </div>
          </div>

          {/* Tips section moved inside collapsible content */}
          <div className="step-tips">
            <h4>💡 Tips for Better Tracking</h4>
            <ul>
              <li>Record the exact coffee brand and origin country for better analysis</li>
              <li>Processing method significantly affects flavor profile - choose carefully</li>
              <li>Use "Other" processing method to describe unique or experimental processes</li>
              <li>Roasting date helps track bean freshness impact on taste</li>
              <li>Altitude information can correlate with acidity and complexity</li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};