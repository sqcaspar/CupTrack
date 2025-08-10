import React from 'react';
import { CreateBrewRequest, BrewMeasurements } from '../../../types/brew';
import { formatTimeForSummary } from '../../../utils/timeUtils';

// Extended type for the review step that includes calculated fields
type ReviewBrewData = Omit<CreateBrewRequest, 'measurements'> & {
  measurements?: Omit<BrewMeasurements, 'coffeeToWaterRatio'> & { 
    coffeeToWaterRatio?: number 
  };
  isShared?: boolean;
};

interface ReviewStepProps {
  data: ReviewBrewData;
  errors: Record<string, string>;
  onChange: (data: Partial<ReviewBrewData>) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  errors,
  onChange
}) => {
  const hasErrors = Object.keys(errors).length > 0;

  const renderBeansInfo = () => (
    <div className="review-section">
      <h3>☕ Coffee Beans</h3>
      <div className="review-grid">
        <div className="review-item">
          <label>Brand:</label>
          <span>{data.beans?.brand || 'Not specified'}</span>
        </div>
        <div className="review-item">
          <label>Origin:</label>
          <span>{data.beans?.origin || 'Not specified'}</span>
        </div>
        <div className="review-item">
          <label>Processing:</label>
          <span>{data.beans?.processingMethod || 'Not specified'}</span>
        </div>
        {data.beans?.altitude && (
          <div className="review-item">
            <label>Altitude:</label>
            <span>{data.beans.altitude}m</span>
          </div>
        )}
        {data.beans?.roastingDate && (
          <div className="review-item">
            <label>Roasting Date:</label>
            <span>{new Date(data.beans.roastingDate).toLocaleDateString()}</span>
          </div>
        )}
        {data.beans?.roastingLevel && (
          <div className="review-item">
            <label>Roast Level:</label>
            <span>{data.beans.roastingLevel}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderParametersInfo = () => (
    <div className="review-section">
      <h3>⚙️ Brewing Parameters</h3>
      <div className="review-grid">
        <div className="review-item">
          <label>Method:</label>
          <span>{data.parameters?.brewingMethod || 'Not specified'}</span>
        </div>
        <div className="review-item">
          <label>Grinder:</label>
          <span>{data.parameters?.grinderModel || 'Not specified'}</span>
        </div>
        <div className="review-item">
          <label>Grind Setting:</label>
          <span>{data.parameters?.grinderSetting || 'Not specified'}</span>
        </div>
        <div className="review-item">
          <label>Water Temperature:</label>
          <span>{data.parameters?.waterTemperature || 'Not specified'}°C</span>
        </div>
        {data.parameters?.filteringTools && (
          <div className="review-item">
            <label>Filter:</label>
            <span>{data.parameters.filteringTools}</span>
          </div>
        )}
        {data.parameters?.waterQuality && (
          <div className="review-item">
            <label>Water Quality:</label>
            <span>{data.parameters.waterQuality}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderTurbulenceInfo = () => {
    if (!data.turbulenceSteps || data.turbulenceSteps.length === 0) {
      return (
        <div className="review-section">
          <h3>🌊 Turbulence Steps</h3>
          <p className="no-data">No turbulence steps recorded</p>
        </div>
      );
    }

    return (
      <div className="review-section">
        <h3>🌊 Turbulence Steps</h3>
        <div className="turbulence-timeline">
          {data.turbulenceSteps.map((step, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-marker">{step.stepOrder}</div>
              <div className="timeline-content">
                <h4>{step.actionType} - {formatTimeForSummary(step.actionTime)}</h4>
                <p>{step.volume}ml - {step.technique}</p>
                {step.description && <p className="step-description">{step.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMeasurementsInfo = () => (
    <div className="review-section">
      <h3>⚖️ Measurements</h3>
      <div className="review-grid">
        <div className="review-item highlight">
          <label>Coffee Weight:</label>
          <span>{data.measurements?.coffeeBeansWeight || 'Not specified'}g</span>
        </div>
        <div className="review-item highlight">
          <label>Water Weight:</label>
          <span>{data.measurements?.waterWeight || 'Not specified'}g</span>
        </div>
        <div className="review-item highlight">
          <label>Ratio:</label>
          <span>
            {data.measurements?.coffeeToWaterRatio 
              ? `1:${data.measurements.coffeeToWaterRatio}`
              : 'Not calculated'
            }
          </span>
        </div>
        {data.measurements?.brewedCoffeeWeight && (
          <div className="review-item">
            <label>Brewed Weight:</label>
            <span>{data.measurements.brewedCoffeeWeight}g</span>
          </div>
        )}
        {data.measurements?.tdsPercentage && (
          <div className="review-item">
            <label>TDS:</label>
            <span>{data.measurements.tdsPercentage}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderEvaluationInfo = () => {
    if (!data.evaluation) {
      return (
        <div className="review-section">
          <h3>📊 Evaluation</h3>
          <p className="no-data">No quality evaluation recorded</p>
        </div>
      );
    }

    return (
      <div className="review-section">
        <h3>📊 Evaluation</h3>
        <div className="evaluation-summary">
          <div className="evaluation-type">
            <strong>Method:</strong> {data.evaluation.type.toUpperCase()}
          </div>
          
          {data.evaluation.type === 'quick' && (
            <div className="evaluation-score">
              <strong>Overall Quality:</strong> {data.evaluation.overallQuality}/10
            </div>
          )}
          
          {data.evaluation.type === 'sca' && (
            <div className="sca-summary">
              <div className="sca-scores">
                <strong>SCA Scores:</strong>
                <ul>
                  {Object.entries(data.evaluation.scores).map(([category, score]) => (
                    <li key={category}>
                      {category}: {score}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sca-total">
                <strong>Total Score:</strong> {
                  (data.evaluation as any).finalScore || 0
                }
              </div>
            </div>
          )}
          
          {data.evaluation.notes && (
            <div className="evaluation-notes">
              <strong>Notes:</strong>
              <p>{data.evaluation.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="review-step">
      <div className="step-description">
        <p>Review all your brew details before submitting. You can go back to any step to make changes.</p>
      </div>

      {/* Error Summary */}
      {hasErrors && (
        <div className="error-summary">
          <h3>⚠️ Please Fix These Issues</h3>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field} className="error-item">
                <strong>{field}:</strong> {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="review-content">
        {renderBeansInfo()}
        {renderParametersInfo()}
        {renderTurbulenceInfo()}
        {renderMeasurementsInfo()}
        {renderEvaluationInfo()}
      </div>

      {/* Brew Summary Card */}
      <div className="brew-summary-card">
        <h3>📋 Brew Summary</h3>
        <div className="summary-highlights">
          <div className="highlight-item">
            <span className="label">Coffee:</span>
            <span className="value">
              {data.beans?.brand} - {data.beans?.origin}
            </span>
          </div>
          <div className="highlight-item">
            <span className="label">Method:</span>
            <span className="value">{data.parameters?.brewingMethod}</span>
          </div>
          <div className="highlight-item">
            <span className="label">Ratio:</span>
            <span className="value">
              {data.measurements?.coffeeToWaterRatio 
                ? `1:${data.measurements.coffeeToWaterRatio}`
                : 'Not calculated'
              }
            </span>
          </div>
          <div className="highlight-item">
            <span className="label">Temperature:</span>
            <span className="value">{data.parameters?.waterTemperature}°C</span>
          </div>
          {data.evaluation && (
            <div className="highlight-item">
              <span className="label">Quality:</span>
              <span className="value">
                {data.evaluation.type === 'quick' 
                  ? `${data.evaluation.overallQuality}/10`
                  : data.evaluation.type === 'sca'
                  ? `${(data.evaluation as any).finalScore || 0} SCA`
                  : 'Evaluated'
                }
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Data Privacy Notice */}
      <div className="privacy-notice">
        <h4>🔒 Privacy & Data</h4>
        <p>
          Your brew data is stored securely and privately. Only you can access your brewing records 
          unless you choose to share specific brews with the community.
        </p>
        <label className="privacy-option">
          <input
            type="checkbox"
            checked={data.isShared || false}
            onChange={(e) => onChange({ isShared: e.target.checked })}
          />
          <span>Share this brew with the CupTrack community (optional)</span>
        </label>
      </div>

      <div className="step-tips">
        <h4>✅ Final Checklist</h4>
        <ul>
          <li>All required information is complete and accurate</li>
          <li>Measurements are recorded correctly</li>
          <li>Brewing parameters match what you actually used</li>
          <li>Any optional information you want is included</li>
          <li>Privacy settings are as desired</li>
        </ul>
      </div>
    </div>
  );
};