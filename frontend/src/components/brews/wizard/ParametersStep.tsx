import React, { useState } from 'react';
import { BrewingParameters, GRINDER_MODEL_OPTIONS } from '../../../types/brew';

interface ParametersStepProps {
  data?: BrewingParameters;
  errors: Record<string, string>;
  onChange: (data: BrewingParameters) => void;
}

export const ParametersStep: React.FC<ParametersStepProps> = ({
  data = {
    brewingMethod: 'pour-over',
    grinderModel: '',
    grinderSetting: 15,
    waterTemperature: 92
  },
  errors,
  onChange
}) => {
  // State for collapsible sections
  const [isOptionalExpanded, setIsOptionalExpanded] = useState(false);
  const [isGuidelinesExpanded, setIsGuidelinesExpanded] = useState(false);
  const [isTipsExpanded, setIsTipsExpanded] = useState(false);

  const toggleOptionalSection = () => setIsOptionalExpanded(!isOptionalExpanded);
  const toggleGuidelinesSection = () => setIsGuidelinesExpanded(!isGuidelinesExpanded);
  const toggleTipsSection = () => setIsTipsExpanded(!isTipsExpanded);

  const handleChange = (field: keyof BrewingParameters, value: string | number) => {
    const newData = {
      ...data,
      [field]: value
    };
    
    // Clear custom grinder model if grinder model is not 'other'
    if (field === 'grinderModel' && value !== 'other') {
      newData.customGrinderModel = undefined;
    }
    
    onChange(newData);
  };

  return (
    <div className="parameters-step">
      <div className="step-description">
        <p>Define the brewing parameters that will affect your coffee's extraction.</p>
      </div>
      
      <div className="form-grid">
        {/* Required Parameters */}
        <div className="form-section">
          <h3>Required Parameters</h3>
          
          <div className="form-group">
            <label htmlFor="brewingMethod" className="form-label required">
              Brewing Method *
            </label>
            <select
              id="brewingMethod"
              className={`form-select ${errors.brewingMethod ? 'error' : ''}`}
              value={data.brewingMethod}
              onChange={(e) => handleChange('brewingMethod', e.target.value)}
            >
              <option value="pour-over">Pour Over</option>
              <option value="french-press">French Press</option>
              <option value="aeropress">AeroPress</option>
              <option value="espresso">Espresso</option>
              <option value="moka-pot">Moka Pot</option>
              <option value="cold-brew">Cold Brew</option>
              <option value="chemex">Chemex</option>
              <option value="v60">V60</option>
              <option value="kalita">Kalita Wave</option>
              <option value="other">Other</option>
            </select>
            {errors.brewingMethod && (
              <div className="form-error">{errors.brewingMethod}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="grinderModel" className="form-label required">
              Grinder Model *
            </label>
            <select
              id="grinderModel"
              className={`form-select ${errors.grinderModel ? 'error' : ''}`}
              value={data.grinderModel}
              onChange={(e) => handleChange('grinderModel', e.target.value)}
            >
              <option value="">Select grinder model...</option>
              {GRINDER_MODEL_OPTIONS.map((grinder) => (
                <option key={grinder.value} value={grinder.value}>
                  {grinder.label}
                </option>
              ))}
            </select>
            {errors.grinderModel && (
              <div className="form-error">{errors.grinderModel}</div>
            )}
            <div className="form-hint">
              The specific grinder model affects consistency and particle size distribution
            </div>
          </div>

          {/* Conditional custom grinder model input */}
          {data.grinderModel === 'other' && (
            <div className="form-group conditional-input">
              <label htmlFor="customGrinderModel" className="form-label required">
                Enter Custom Grinder Model *
              </label>
              <input
                type="text"
                id="customGrinderModel"
                className={`form-input ${errors.customGrinderModel ? 'error' : ''}`}
                placeholder="Enter grinder model..."
                value={data.customGrinderModel || ''}
                onChange={(e) => handleChange('customGrinderModel', e.target.value)}
                maxLength={100}
              />
              {errors.customGrinderModel && (
                <div className="form-error">{errors.customGrinderModel}</div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="grinderSetting" className="form-label required">
              Grinder Setting * ({data.grinderSetting})
            </label>
            <div className="range-input-container">
              <input
                id="grinderSetting"
                type="range"
                className={`range-input ${errors.grinderSetting ? 'error' : ''}`}
                value={data.grinderSetting}
                onChange={(e) => handleChange('grinderSetting', parseInt(e.target.value))}
                min="1"
                max="40"
                step="1"
              />
              <div className="range-labels">
                <span>Fine (1)</span>
                <span>Medium (20)</span>
                <span>Coarse (40)</span>
              </div>
            </div>
            {errors.grinderSetting && (
              <div className="form-error">{errors.grinderSetting}</div>
            )}
            <div className="form-hint">
              Adjust the grind size from fine (1) to coarse (40). Different brewing methods require different settings.
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="waterTemperature" className="form-label required">
              Water Temperature (°C) *
            </label>
            <input
              id="waterTemperature"
              type="number"
              className={`form-input ${errors.waterTemperature ? 'error' : ''}`}
              value={data.waterTemperature}
              onChange={(e) => handleChange('waterTemperature', parseInt(e.target.value))}
              placeholder="92"
              min="80"
              max="100"
              step="1"
            />
            {errors.waterTemperature && (
              <div className="form-error">{errors.waterTemperature}</div>
            )}
            <div className="form-hint">
              Typical range: 80-100°C. Lower temperatures for lighter roasts, higher for darker roasts.
            </div>
          </div>
        </div>

        {/* Optional Parameters - Collapsible Section */}
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
            aria-controls="optional-parameters"
          >
            <h3>Optional Parameters</h3>
            <span className={`expand-icon ${isOptionalExpanded ? 'expanded' : ''}`}>
              {isOptionalExpanded ? '−' : '+'}
            </span>
          </div>
          
          <div 
            id="optional-parameters"
            className={`collapsible-content ${isOptionalExpanded ? 'expanded' : 'collapsed'}`}
          >
            <div className="form-group">
            <label htmlFor="filteringTools" className="form-label">
              Filtering Tools
            </label>
            <input
              id="filteringTools"
              type="text"
              className="form-input"
              value={data.filteringTools || ''}
              onChange={(e) => handleChange('filteringTools', e.target.value)}
              placeholder="e.g., Hario V60 02, Chemex filters"
              maxLength={100}
            />
            <div className="form-hint">
              Specific filter type and brand can affect extraction
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="waterQuality" className="form-label">
              Water Quality
            </label>
            <select
              id="waterQuality"
              className="form-select"
              value={data.waterQuality || ''}
              onChange={(e) => handleChange('waterQuality', e.target.value)}
            >
              <option value="">Select water quality</option>
              <option value="tap">Tap Water</option>
              <option value="filtered">Filtered</option>
              <option value="bottled">Bottled</option>
              <option value="distilled">Distilled</option>
              <option value="mineral">Mineral Water</option>
              <option value="reverse-osmosis">Reverse Osmosis</option>
            </select>
            <div className="form-hint">
              Water quality significantly impacts extraction and taste
            </div>
          </div>
          </div>
        </div>
      </div>
      
      {/* Parameter Guidelines - Collapsible Section */}
      <div className="form-section optional-section">
        <div 
          className="collapsible-header"
          onClick={toggleGuidelinesSection}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleGuidelinesSection();
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={isGuidelinesExpanded}
          aria-controls="parameter-guidelines-content"
        >
          <h3>📏 Brewing Parameter Guidelines</h3>
          <span className={`expand-icon ${isGuidelinesExpanded ? 'expanded' : ''}`}>
            {isGuidelinesExpanded ? '−' : '+'}
          </span>
        </div>
        
        <div 
          id="parameter-guidelines-content"
          className={`collapsible-content ${isGuidelinesExpanded ? 'expanded' : 'collapsed'}`}
        >
        <div className="guidelines-grid">
          <div className="guideline-item">
            <h5>Pour Over</h5>
            <ul>
              <li>Temperature: 90-96°C</li>
              <li>Grind: Medium-fine</li>
              <li>Time: 3-4 minutes</li>
            </ul>
          </div>
          <div className="guideline-item">
            <h5>French Press</h5>
            <ul>
              <li>Temperature: 92-96°C</li>
              <li>Grind: Coarse</li>
              <li>Time: 4 minutes</li>
            </ul>
          </div>
          <div className="guideline-item">
            <h5>AeroPress</h5>
            <ul>
              <li>Temperature: 80-85°C</li>
              <li>Grind: Fine-medium</li>
              <li>Time: 1-2 minutes</li>
            </ul>
          </div>
        </div>
        </div>
      </div>
      
      {/* Consistency Tips - Collapsible Section */}
      <div className="form-section optional-section">
        <div 
          className="collapsible-header"
          onClick={toggleTipsSection}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTipsSection();
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={isTipsExpanded}
          aria-controls="consistency-tips-content"
        >
          <h3>💡 Consistency Tips</h3>
          <span className={`expand-icon ${isTipsExpanded ? 'expanded' : ''}`}>
            {isTipsExpanded ? '−' : '+'}
          </span>
        </div>
        
        <div 
          id="consistency-tips-content"
          className={`collapsible-content ${isTipsExpanded ? 'expanded' : 'collapsed'}`}
        >
        <ul>
          <li>Use the same grinder setting as a baseline for experimentation</li>
          <li>Measure water temperature with a thermometer for accuracy</li>
          <li>Different brewing methods require different grind sizes</li>
          <li>Water quality can be as important as coffee quality</li>
        </ul>
        </div>
      </div>
    </div>
  );
};