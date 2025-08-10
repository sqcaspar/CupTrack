import React from 'react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  isOptionalStep: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps,
  canProceed,
  isLastStep,
  isSubmitting,
  isOptionalStep,
  onNext,
  onPrevious,
  onSkip,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="wizard-navigation">
      <div className="nav-left">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        
        {currentStep > 0 && (
          <button
            type="button"
            onClick={onPrevious}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Previous
          </button>
        )}
      </div>
      
      <div className="nav-center">
        <span className="step-counter">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>
      
      <div className="nav-right">
        {isOptionalStep && !isLastStep && (
          <button
            type="button"
            onClick={onSkip}
            className="btn btn-ghost"
            disabled={isSubmitting}
          >
            Skip
          </button>
        )}
        
        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            className="btn btn-primary"
            disabled={!canProceed || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="btn btn-primary"
            disabled={!canProceed || isSubmitting}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};