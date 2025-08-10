import React, { useState } from 'react';
import { TurbulenceStep as TurbulenceStepType } from '../../../types/brew';
import { TimePickerInput } from '../../ui/TimePickerInput';
import { formatTimeForSummary } from '../../../utils/timeUtils';

interface TurbulenceStepProps {
  data: TurbulenceStepType[];
  errors: Record<string, string>;
  onChange: (data: TurbulenceStepType[]) => void;
  overallTechnique?: string;
  overallDescription?: string;
  onOverallTechniqueChange?: (technique: string) => void;
  onOverallDescriptionChange?: (description: string) => void;
}

export const TurbulenceStep: React.FC<TurbulenceStepProps> = ({
  data,
  errors,
  onChange,
  overallTechnique = '',
  overallDescription = '',
  onOverallTechniqueChange,
  onOverallDescriptionChange
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [isTechniqueExpanded, setIsTechniqueExpanded] = useState(false);
  const [isCommonTechniquesExpanded, setIsCommonTechniquesExpanded] = useState(false);
  const [isTipsExpanded, setIsTipsExpanded] = useState(false);

  const addStep = () => {
    const newStep: TurbulenceStepType = {
      stepOrder: data.length + 1,
      actionType: 'pour',
      actionTime: 30,
      volume: 100
    };
    onChange([...data, newStep]);
    setExpandedStep(data.length);
  };

  const updateStep = (index: number, field: keyof TurbulenceStepType, value: string | number) => {
    const updatedSteps = data.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    );
    onChange(updatedSteps);
  };

  const removeStep = (index: number) => {
    const updatedSteps = data
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepOrder: i + 1 }));
    onChange(updatedSteps);
    setExpandedStep(null);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedSteps = [...data];
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    
    // Update step orders
    updatedSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    
    onChange(updatedSteps);
    setExpandedStep(newIndex);
  };

  return (
    <div className="turbulence-step">
      <div className="step-description">
        <p>
          <strong>Optional:</strong> Document your pouring technique and agitation methods. 
          This helps track how different techniques affect extraction.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌊</div>
          <h3>No turbulence steps added yet</h3>
          <p>Add steps to track your pouring technique and timing.</p>
          <button 
            type="button" 
            onClick={addStep}
            className="btn btn-primary"
          >
            Add First Step
          </button>
        </div>
      ) : (
        <div className="turbulence-steps-list">
          {data.map((step, index) => (
            <div 
              key={index} 
              className={`turbulence-step-item ${expandedStep === index ? 'expanded' : ''}`}
            >
              <div className="step-header" onClick={() => setExpandedStep(expandedStep === index ? null : index)}>
                <div className="step-info">
                  <span className="step-number">Step {step.stepOrder}</span>
                  <span className="step-summary">
                    {step.actionType} - {formatTimeForSummary(step.actionTime)} - {step.volume}ml
                  </span>
                </div>
                <div className="step-controls">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveStep(index, 'up');
                    }}
                    disabled={index === 0}
                    className="btn-icon"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveStep(index, 'down');
                    }}
                    disabled={index === data.length - 1}
                    className="btn-icon"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStep(index);
                    }}
                    className="btn-icon btn-danger"
                    title="Remove step"
                  >
                    ×
                  </button>
                </div>
              </div>

              {expandedStep === index && (
                <div className="step-details">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Action Type</label>
                      <select
                        className="form-select"
                        value={step.actionType}
                        onChange={(e) => updateStep(index, 'actionType', e.target.value)}
                      >
                        <option value="pour">Pour</option>
                        <option value="bloom">Bloom</option>
                        <option value="main-pour">Main Pour</option>
                        <option value="stir">Stir</option>
                        <option value="agitation">Agitation</option>
                        <option value="wait">Wait</option>
                        <option value="final-pour">Final Pour</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Action Time</label>
                      <TimePickerInput
                        value={step.actionTime}
                        onChange={(seconds) => updateStep(index, 'actionTime', seconds)}
                        aria-label={`Action time for step ${step.stepOrder}`}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Volume ({step.volume}ml)</label>
                      <div className="range-input-container">
                        <input
                          type="range"
                          className="range-input"
                          value={step.volume}
                          onChange={(e) => updateStep(index, 'volume', parseInt(e.target.value))}
                          min="1"
                          max="500"
                          step="1"
                        />
                        <div className="range-labels">
                          <span>1ml</span>
                          <span>250ml</span>
                          <span>500ml</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}

          <button 
            type="button" 
            onClick={addStep}
            className="btn btn-outline add-step-btn"
          >
            + Add Another Step
          </button>
        </div>
      )}

      {/* Overall Technique & Description Section - Collapsible */}
      <div className="form-section optional-section">
        <div 
          className="collapsible-header"
          onClick={() => setIsTechniqueExpanded(!isTechniqueExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsTechniqueExpanded(!isTechniqueExpanded);
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={isTechniqueExpanded}
          aria-controls="technique-description-content"
        >
          <h3>📝 Overall Technique & Description</h3>
          <span className={`expand-icon ${isTechniqueExpanded ? 'expanded' : ''}`}>
            {isTechniqueExpanded ? '−' : '+'}
          </span>
        </div>
        
        <div 
          id="technique-description-content"
          className={`collapsible-content ${isTechniqueExpanded ? 'expanded' : 'collapsed'}`}
        >
          <div className="form-group">
            <label htmlFor="overallTechnique" className="form-label">
              Overall Brewing Technique
            </label>
            <textarea
              id="overallTechnique"
              className="form-textarea"
              value={overallTechnique}
              onChange={(e) => onOverallTechniqueChange?.(e.target.value)}
              placeholder="Describe your overall brewing technique (e.g., circular pours, aggressive agitation, center-focused technique)..."
              rows={3}
              maxLength={300}
            />
            <div className="form-hint">
              Capture the general approach used across all steps
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="overallDescription" className="form-label">
              Overall Description & Notes
            </label>
            <textarea
              id="overallDescription"
              className="form-textarea"
              value={overallDescription}
              onChange={(e) => onOverallDescriptionChange?.(e.target.value)}
              placeholder="Any additional notes about this brewing session, observations, or modifications made..."
              rows={4}
              maxLength={500}
            />
            <div className="form-hint">
              Record observations, adjustments, or anything noteworthy about this session
            </div>
          </div>
        </div>
      </div>

      {/* Common Techniques Section - Make Collapsible */}
      <div className="form-section optional-section">
        <div 
          className="collapsible-header"
          onClick={() => setIsCommonTechniquesExpanded(!isCommonTechniquesExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsCommonTechniquesExpanded(!isCommonTechniquesExpanded);
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={isCommonTechniquesExpanded}
          aria-controls="common-techniques-content"
        >
          <h3>🎯 Common Techniques</h3>
          <span className={`expand-icon ${isCommonTechniquesExpanded ? 'expanded' : ''}`}>
            {isCommonTechniquesExpanded ? '−' : '+'}
          </span>
        </div>
        
        <div 
          id="common-techniques-content"
          className={`collapsible-content ${isCommonTechniquesExpanded ? 'expanded' : 'collapsed'}`}
        >
          <div className="examples-grid">
            <div className="example-item">
              <h5>Bloom Phase</h5>
              <ul>
                <li>30-45 seconds</li>
                <li>2x coffee weight in water</li>
                <li>Gentle circular pour</li>
              </ul>
            </div>
            <div className="example-item">
              <h5>Main Pour</h5>
              <ul>
                <li>Steady spiral motion</li>
                <li>Keep water level consistent</li>
                <li>Pour in center or pulses</li>
              </ul>
            </div>
            <div className="example-item">
              <h5>Agitation</h5>
              <ul>
                <li>Gentle swirl or stir</li>
                <li>Break up any channeling</li>
                <li>Even extraction</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Tips Section - Make Collapsible */}
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
          aria-controls="tracking-tips-content"
        >
          <h3>💡 Turbulence Tracking Tips</h3>
          <span className={`expand-icon ${isTipsExpanded ? 'expanded' : ''}`}>
            {isTipsExpanded ? '−' : '+'}
          </span>
        </div>
        
        <div 
          id="tracking-tips-content"
          className={`collapsible-content ${isTipsExpanded ? 'expanded' : 'collapsed'}`}
        >
          <ul>
            <li>Document timing precisely - it affects extraction significantly</li>
            <li>Note the specific technique used (circular, center, pulse)</li>
            <li>Track water volume per step for consistency</li>
            <li>Different beans may require different agitation levels</li>
          </ul>
        </div>
      </div>
    </div>
  );
};