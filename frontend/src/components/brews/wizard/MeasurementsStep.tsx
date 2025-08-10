import React, { useEffect, useState } from 'react';
import { BrewMeasurements } from '../../../types/brew';

type WizardMeasurements = Omit<BrewMeasurements, 'coffeeToWaterRatio'> & { coffeeToWaterRatio?: number };

interface MeasurementsStepProps {
  data?: WizardMeasurements;
  errors: Record<string, string>;
  onChange: (data: WizardMeasurements) => void;
}

export const MeasurementsStep: React.FC<MeasurementsStepProps> = ({
  data = {
    coffeeBeansWeight: 0,
    waterWeight: 0
  },
  errors,
  onChange
}) => {
  // State for collapsible sections (default closed as requested)
  const [isOptionalExpanded, setIsOptionalExpanded] = useState(false);
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const [isTipsExpanded, setIsTipsExpanded] = useState(false);
  const handleChange = (field: keyof WizardMeasurements, value: number | undefined) => {
    const updatedData = {
      ...data,
      [field]: value
    };
    onChange(updatedData);
  };

  // Auto-calculate ratio when coffee or water weights change
  useEffect(() => {
    if (data.coffeeBeansWeight && data.waterWeight) {
      const ratio = data.waterWeight / data.coffeeBeansWeight;
      if (Math.abs(ratio - (data.coffeeToWaterRatio || 0)) > 0.01) {
        onChange({
          ...data,
          coffeeToWaterRatio: Math.round(ratio * 10) / 10
        });
      }
    }
  }, [data, onChange]);

  const getRatioColor = (ratio?: number) => {
    if (!ratio) return '';
    if (ratio < 12) return 'ratio-strong';
    if (ratio > 18) return 'ratio-weak';
    return 'ratio-normal';
  };

  const getRatioDescription = (ratio?: number) => {
    if (!ratio) return '';
    if (ratio < 12) return 'Strong brew';
    if (ratio > 18) return 'Mild brew';
    if (ratio >= 15 && ratio <= 17) return 'Golden ratio';
    return 'Normal strength';
  };

  return (
    <div className="measurements-step">
      <div className="step-description">
        <p>Record the precise measurements for your brew. Accuracy here is crucial for consistency and analysis.</p>
      </div>
      
      <div className="form-grid">
        {/* Required Measurements */}
        <div className="form-section">
          <h3>Required Measurements</h3>
          
          <div className="form-group">
            <label htmlFor="coffeeBeansWeight" className="form-label required">
              Coffee Beans Weight (g) *
            </label>
            <input
              id="coffeeBeansWeight"
              type="number"
              className={`form-input ${errors.coffeeBeansWeight ? 'error' : ''}`}
              value={data.coffeeBeansWeight || ''}
              onChange={(e) => handleChange('coffeeBeansWeight', parseFloat(e.target.value) || 0)}
              placeholder="22"
              min="1"
              max="100"
              step="0.1"
            />
            {errors.coffeeBeansWeight && (
              <div className="form-error">{errors.coffeeBeansWeight}</div>
            )}
            <div className="form-hint">
              Weigh your coffee beans before grinding for best accuracy
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="waterWeight" className="form-label required">
              Water Weight (g) *
            </label>
            <input
              id="waterWeight"
              type="number"
              className={`form-input ${errors.waterWeight ? 'error' : ''}`}
              value={data.waterWeight || ''}
              onChange={(e) => handleChange('waterWeight', parseFloat(e.target.value) || 0)}
              placeholder="350"
              min="50"
              max="1000"
              step="1"
            />
            {errors.waterWeight && (
              <div className="form-error">{errors.waterWeight}</div>
            )}
            <div className="form-hint">
              Total water weight used for brewing (1ml = 1g)
            </div>
          </div>

          {/* Auto-calculated Coffee-to-Water Ratio */}
          {data.coffeeToWaterRatio && (
            <div className="form-group calculated-field">
              <label className="form-label">
                Coffee-to-Water Ratio (Auto-calculated)
              </label>
              <div className="ratio-display">
                <div className="ratio-header">
                  <span className={`ratio-badge ${getRatioColor(data.coffeeToWaterRatio)}`}>
                    1:{data.coffeeToWaterRatio.toFixed(1)}
                  </span>
                  <span className="ratio-description">
                    {getRatioDescription(data.coffeeToWaterRatio)}
                  </span>
                </div>
                <div className="ratio-scale">
                  <div className="scale-marker" style={{ left: '20%' }}>
                    <span>1:12</span>
                    <small>Strong</small>
                  </div>
                  <div className="scale-marker golden" style={{ left: '50%' }}>
                    <span>1:15</span>
                    <small>Golden</small>
                  </div>
                  <div className="scale-marker" style={{ left: '80%' }}>
                    <span>1:18</span>
                    <small>Mild</small>
                  </div>
                  <div 
                    className="scale-indicator"
                    style={{ 
                      left: `${Math.max(0, Math.min(100, ((data.coffeeToWaterRatio - 10) / 12) * 100))}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Optional Measurements - Collapsible */}
        <div className="form-section optional-section">
          <div 
            className="collapsible-header"
            onClick={() => setIsOptionalExpanded(!isOptionalExpanded)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOptionalExpanded(!isOptionalExpanded);
              }
            }}
            tabIndex={0}
            role="button"
            aria-expanded={isOptionalExpanded}
            aria-controls="optional-measurements-content"
          >
            <h3>📊 Optional Measurements</h3>
            <span className={`expand-icon ${isOptionalExpanded ? 'expanded' : ''}`}>
              {isOptionalExpanded ? '−' : '+'}
            </span>
          </div>
          
          <div 
            id="optional-measurements-content"
            className={`collapsible-content ${isOptionalExpanded ? 'expanded' : 'collapsed'}`}
          >
          
          <div className="form-group">
            <label htmlFor="brewedCoffeeWeight" className="form-label">
              Brewed Coffee Weight (g)
            </label>
            <input
              id="brewedCoffeeWeight"
              type="number"
              className="form-input"
              value={data.brewedCoffeeWeight || ''}
              onChange={(e) => handleChange('brewedCoffeeWeight', parseFloat(e.target.value) || undefined)}
              placeholder="300"
              min="30"
              max="1000"
              step="1"
            />
            <div className="form-hint">
              Final weight of brewed coffee (helps calculate extraction efficiency)
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tdsPercentage" className="form-label">
              TDS Percentage (%)
            </label>
            <input
              id="tdsPercentage"
              type="number"
              className="form-input"
              value={data.tdsPercentage || ''}
              onChange={(e) => handleChange('tdsPercentage', parseFloat(e.target.value) || undefined)}
              placeholder="1.35"
              min="0.5"
              max="3.0"
              step="0.01"
            />
            <div className="form-hint">
              Total Dissolved Solids - requires a refractometer to measure
            </div>
          </div>

          {/* Auto-calculated Extraction Percentage */}
          {data.tdsPercentage && data.brewedCoffeeWeight && data.coffeeBeansWeight && (
            <div className="form-group calculated-field">
              <label className="form-label">
                Extraction % (Auto-calculated)
              </label>
              <div className="calculated-value">
                {((data.tdsPercentage * data.brewedCoffeeWeight) / data.coffeeBeansWeight).toFixed(2)}%
              </div>
              <div className="form-hint">
                SCA Formula: (TDS% × Brewed Weight) ÷ Coffee Weight
              </div>
              <div className="extraction-range">
                <span className="range-label">Under (&lt;18%)</span>
                <span className="range-label optimal">Optimal (18-22%)</span>
                <span className="range-label">Over (&gt;22%)</span>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      
      {/* Ratio Guidelines - Collapsible */}
      <div className="form-section optional-section">
        <div 
          className="collapsible-header"
          onClick={() => setIsGuideExpanded(!isGuideExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsGuideExpanded(!isGuideExpanded);
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={isGuideExpanded}
          aria-controls="ratio-guide-content"
        >
          <h3>☕ Coffee to Water Ratio Guide</h3>
          <span className={`expand-icon ${isGuideExpanded ? 'expanded' : ''}`}>
            {isGuideExpanded ? '−' : '+'}
          </span>
        </div>
        
        <div 
          id="ratio-guide-content"
          className={`collapsible-content ${isGuideExpanded ? 'expanded' : 'collapsed'}`}
        >
        <div className="ratio-guidelines">
        <div className="guidelines-table">
          <div className="guideline-row header">
            <span>Ratio</span>
            <span>Strength</span>
            <span>Best For</span>
          </div>
          <div className="guideline-row">
            <span>1:12 - 1:14</span>
            <span>Strong</span>
            <span>Espresso-style, concentrated</span>
          </div>
          <div className="guideline-row golden">
            <span>1:15 - 1:17</span>
            <span>Balanced</span>
            <span>Pour over, most brewing methods</span>
          </div>
          <div className="guideline-row">
            <span>1:18 - 1:20</span>
            <span>Mild</span>
            <span>Light roasts, delicate flavors</span>
          </div>
        </div>
        </div>
        </div>
      </div>
      
      {/* Measurement Tips - Collapsible */}
      <div className="form-section optional-section">
        <div 
          className="collapsible-header"
          onClick={() => setIsTipsExpanded(!isTipsExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsTipsExpanded(!isTipsExpanded);
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={isTipsExpanded}
          aria-controls="tips-content"
        >
          <h3>⚖️ Measurement Tips</h3>
          <span className={`expand-icon ${isTipsExpanded ? 'expanded' : ''}`}>
            {isTipsExpanded ? '−' : '+'}
          </span>
        </div>
        
        <div 
          id="tips-content"
          className={`collapsible-content ${isTipsExpanded ? 'expanded' : 'collapsed'}`}
        >
        <ul>
          <li>Use a digital scale accurate to 0.1g for best results</li>
          <li>Measure water by weight, not volume (1ml ≈ 1g)</li>
          <li>Tare your scale with the brewing device before adding ingredients</li>
          <li>The 1:15-1:17 ratio is a good starting point for most brewing methods</li>
          <li>Track extraction yield if you have a refractometer for advanced analysis</li>
        </ul>
        </div>
      </div>
    </div>
  );
};