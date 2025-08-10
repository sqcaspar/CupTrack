import React from 'react';

interface Step {
  id: string;
  title: string;
  required: boolean;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  return (
    <div className="wizard-progress">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      
      <div className="steps-container">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isAccessible = index <= currentStep;
          
          return (
            <div
              key={step.id}
              className={`step-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isAccessible ? 'accessible' : ''}`}
              onClick={() => isAccessible && onStepClick(index)}
            >
              <div className="step-indicator">
                {isCompleted ? (
                  <span className="step-check">✓</span>
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>
              
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                {!step.required && (
                  <div className="step-optional">Optional</div>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className="step-connector" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};