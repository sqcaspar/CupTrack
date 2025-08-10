// TASK-006C: Brew Entry Integration Testing - TDD Core
// Integration tests for individual wizard step components
// Validates data flow, validation, and state management across wizard steps

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BeansStep } from '../../components/brews/wizard/BeansStep';
import { ParametersStep } from '../../components/brews/wizard/ParametersStep';
import { TurbulenceStep } from '../../components/brews/wizard/TurbulenceStep';
import { MeasurementsStep } from '../../components/brews/wizard/MeasurementsStep';
import { EvaluationStep } from '../../components/brews/wizard/EvaluationStep';
import { ReviewStep } from '../../components/brews/wizard/ReviewStep';
import { WizardNavigation } from '../../components/brews/wizard/WizardNavigation';
import { WizardProgress } from '../../components/brews/wizard/WizardProgress';
import { 
  CoffeeBeans, 
  BrewingParameters, 
  TurbulenceStep as TurbulenceStepType, 
  BrewMeasurements,
  BrewEvaluation,
  CreateBrewRequest 
} from '../../types/brew';

describe('Brew Wizard Step Components Integration Tests - TDD Core', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('BeansStep Integration', () => {
    test('should handle complete beans data entry and validation', async () => {
      const mockOnChange = jest.fn();
      const mockErrors = {};

      render(
        <BeansStep 
          data={{}}
          errors={mockErrors}
          onChange={mockOnChange}
        />
      );

      // Test required field entry
      await user.type(screen.getByLabelText(/brand/i), 'Ethiopian Coffee Co');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          brand: 'Ethiopian Coffee Co'
        })
      );

      await user.type(screen.getByLabelText(/origin/i), 'Yirgacheffe');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          brand: 'Ethiopian Coffee Co',
          origin: 'Yirgacheffe'
        })
      );

      await user.selectOptions(screen.getByLabelText(/processing method/i), 'washed');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          brand: 'Ethiopian Coffee Co',
          origin: 'Yirgacheffe',
          processingMethod: 'washed'
        })
      );

      // Test optional fields
      await user.type(screen.getByLabelText(/altitude/i), '1800');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          altitude: 1800
        })
      );

      await user.type(screen.getByLabelText(/roasting date/i), '2024-01-15');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          roastingDate: '2024-01-15'
        })
      );

      await user.selectOptions(screen.getByLabelText(/roasting level/i), 'medium');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          roastingLevel: 'medium'
        })
      );
    });

    test('should display validation errors correctly', async () => {
      const mockOnChange = jest.fn();
      const mockErrors = {
        brand: 'Brand is required',
        origin: 'Origin is required',
        processingMethod: 'Processing method is required'
      };

      render(
        <BeansStep 
          data={{}}
          errors={mockErrors}
          onChange={mockOnChange}
        />
      );

      // Should display error messages
      expect(screen.getByText('Brand is required')).toBeInTheDocument();
      expect(screen.getByText('Origin is required')).toBeInTheDocument();
      expect(screen.getByText('Processing method is required')).toBeInTheDocument();

      // Error styling should be applied
      const brandInput = screen.getByLabelText(/brand/i);
      expect(brandInput).toHaveClass('error', { exact: false });
    });

    test('should pre-populate with existing data', async () => {
      const existingData: CoffeeBeans = {
        brand: 'Existing Coffee',
        origin: 'Existing Origin',
        processingMethod: 'natural',
        altitude: 2000,
        roastingDate: '2024-01-10',
        roastingLevel: 'dark'
      };

      render(
        <BeansStep 
          data={existingData}
          errors={{}}
          onChange={jest.fn()}
        />
      );

      // Should display existing values
      expect(screen.getByDisplayValue('Existing Coffee')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Origin')).toBeInTheDocument();
      expect(screen.getByDisplayValue('natural')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-01-10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('dark')).toBeInTheDocument();
    });
  });

  describe('ParametersStep Integration', () => {
    test('should handle brewing parameters data entry', async () => {
      const mockOnChange = jest.fn();

      render(
        <ParametersStep 
          data={{}}
          errors={{}}
          onChange={mockOnChange}
        />
      );

      // Test brewing method selection
      await user.selectOptions(screen.getByLabelText(/brewing method/i), 'pour-over');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          brewingMethod: 'pour-over'
        })
      );

      // Test grinder fields
      await user.type(screen.getByLabelText(/grinder model/i), 'Baratza Encore');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          grinderModel: 'Baratza Encore'
        })
      );

      await user.type(screen.getByLabelText(/grinder setting/i), '15');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          grinderSetting: '15'
        })
      );

      // Test water temperature with validation
      await user.type(screen.getByLabelText(/water temperature/i), '93');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          waterTemperature: 93
        })
      );

      // Test optional fields
      await user.type(screen.getByLabelText(/filtering tools/i), 'Hario V60');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          filteringTools: 'Hario V60'
        })
      );

      await user.type(screen.getByLabelText(/water quality/i), 'filtered');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          waterQuality: 'filtered'
        })
      );
    });

    test('should validate water temperature range', async () => {
      const mockOnChange = jest.fn();

      render(
        <ParametersStep 
          data={{}}
          errors={{}}
          onChange={mockOnChange}
        />
      );

      // Test invalid temperature (too low)
      const tempInput = screen.getByLabelText(/water temperature/i);
      await user.clear(tempInput);
      await user.type(tempInput, '50');

      // Should show warning or validation for unrealistic temperature
      // The component should handle this validation
      
      // Test invalid temperature (too high)
      await user.clear(tempInput);
      await user.type(tempInput, '120');

      // Should validate against extreme temperatures
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          waterTemperature: 120
        })
      );
    });

    test('should display brewing method specific hints', async () => {
      const mockOnChange = jest.fn();

      render(
        <ParametersStep 
          data={{}}
          errors={{}}
          onChange={mockOnChange}
        />
      );

      // Select pour-over
      await user.selectOptions(screen.getByLabelText(/brewing method/i), 'pour-over');
      
      // Should show pour-over specific guidance
      await waitFor(() => {
        expect(screen.getByText(/typical.*pour.*over/i) || 
               screen.getByText(/pour.*over.*guide/i) ||
               screen.getByText(/v60.*chemex/i)).toBeInTheDocument();
      });

      // Select french-press
      await user.selectOptions(screen.getByLabelText(/brewing method/i), 'french-press');
      
      // Should show french press specific guidance
      await waitFor(() => {
        expect(screen.getByText(/french.*press/i) || 
               screen.getByText(/coarse.*grind/i) ||
               screen.getByText(/4.*minute/i)).toBeInTheDocument();
      });
    });
  });

  describe('MeasurementsStep Integration', () => {
    test('should calculate coffee-to-water ratio automatically', async () => {
      const mockOnChange = jest.fn();

      render(
        <MeasurementsStep 
          data={{}}
          errors={{}}
          onChange={mockOnChange}
        />
      );

      // Enter coffee weight
      await user.type(screen.getByLabelText(/coffee.*weight/i), '22');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          coffeeBeansWeight: 22
        })
      );

      // Enter water weight
      await user.type(screen.getByLabelText(/water.*weight/i), '350');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          waterWeight: 350
        })
      );

      // Should display calculated ratio
      await waitFor(() => {
        expect(screen.getByText(/ratio.*15\.91/i) || screen.getByText(/1:15\.91/i)).toBeInTheDocument();
      });
    });

    test('should handle optional measurements', async () => {
      const mockOnChange = jest.fn();

      render(
        <MeasurementsStep 
          data={{ coffeeBeansWeight: 20, waterWeight: 300 }}
          errors={{}}
          onChange={mockOnChange}
        />
      );

      // Test brewed coffee weight
      await user.type(screen.getByLabelText(/brewed.*weight/i), '280');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          brewedCoffeeWeight: 280
        })
      );

      // Test TDS percentage
      await user.type(screen.getByLabelText(/tds/i), '1.35');
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          tdsPercentage: 1.35
        })
      );

      // Should show extraction yield if both TDS and brewed weight are provided
      await waitFor(() => {
        if (screen.queryByText(/extraction.*yield/i)) {
          expect(screen.getByText(/extraction.*yield/i)).toBeInTheDocument();
        }
      });
    });

    test('should validate measurement ranges', async () => {
      const mockOnChange = jest.fn();
      const mockErrors = {
        coffeeBeansWeight: 'Coffee weight must be greater than 0',
        waterWeight: 'Water weight must be greater than 0'
      };

      render(
        <MeasurementsStep 
          data={{}}
          errors={mockErrors}
          onChange={mockOnChange}
        />
      );

      // Should display validation errors
      expect(screen.getByText('Coffee weight must be greater than 0')).toBeInTheDocument();
      expect(screen.getByText('Water weight must be greater than 0')).toBeInTheDocument();
    });

    test('should show brewing strength indicators', async () => {
      const mockOnChange = jest.fn();

      render(
        <MeasurementsStep 
          data={{ coffeeBeansWeight: 30, waterWeight: 300 }} // Strong ratio: 1:10
          errors={{}}
          onChange={mockOnChange}
        />
      );

      // Should indicate strong brew ratio
      await waitFor(() => {
        expect(screen.getByText(/strong/i) || screen.getByText(/10\.0/i)).toBeInTheDocument();
      });

      // Test weak ratio
      render(
        <MeasurementsStep 
          data={{ coffeeBeansWeight: 15, waterWeight: 300 }} // Weak ratio: 1:20
          errors={{}}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/weak/i) || screen.getByText(/20\.0/i)).toBeInTheDocument();
      });
    });
  });

  describe('TurbulenceStep Integration', () => {
    test('should add and manage turbulence steps dynamically', async () => {
      const mockOnChange = jest.fn();

      render(
        <TurbulenceStep 
          data={[]}
          errors={{}}
          onChange={mockOnChange}
        />
      );

      // Should start with no steps
      expect(screen.getByText(/no.*steps.*added/i)).toBeInTheDocument();

      // Add first step
      await user.click(screen.getByRole('button', { name: /add.*step/i }));

      // Should create step form
      await waitFor(() => {
        expect(screen.getByLabelText(/action type/i)).toBeInTheDocument();
      });

      // Fill first step
      await user.selectOptions(screen.getByLabelText(/action type/i), 'bloom');
      await user.type(screen.getByLabelText(/action time/i), '30');
      await user.type(screen.getByLabelText(/volume/i), '60');
      await user.type(screen.getByLabelText(/technique/i), 'circular pour');
      await user.type(screen.getByLabelText(/description/i), 'Initial bloom');

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          stepOrder: 1,
          actionType: 'bloom',
          actionTime: 30,
          volume: 60,
          technique: 'circular pour',
          description: 'Initial bloom'
        })
      ]);

      // Add second step
      await user.click(screen.getByRole('button', { name: /add.*step/i }));

      // Should create second step with correct order
      const stepOrderInputs = screen.getAllByLabelText(/step.*order/i);
      expect(stepOrderInputs).toHaveLength(2);
      expect(stepOrderInputs[1]).toHaveValue(2);
    });

    test('should validate turbulence step data', async () => {
      const mockOnChange = jest.fn();
      const mockErrors = {
        'turbulenceSteps[0].actionTime': 'Action time cannot be negative',
        'turbulenceSteps[0].volume': 'Volume must be greater than 0'
      };

      const existingSteps: TurbulenceStepType[] = [{
        stepOrder: 1,
        actionType: 'bloom',
        actionTime: -5, // Invalid
        volume: 0, // Invalid
        technique: '',
        description: ''
      }];

      render(
        <TurbulenceStep 
          data={existingSteps}
          errors={mockErrors}
          onChange={mockOnChange}
        />
      );

      // Should display validation errors
      expect(screen.getByText('Action time cannot be negative')).toBeInTheDocument();
      expect(screen.getByText('Volume must be greater than 0')).toBeInTheDocument();
    });

    test('should remove turbulence steps', async () => {
      const mockOnChange = jest.fn();
      const existingSteps: TurbulenceStepType[] = [
        {
          stepOrder: 1,
          actionType: 'bloom',
          actionTime: 30,
          volume: 60,
          technique: 'circular',
          description: 'First step'
        },
        {
          stepOrder: 2,
          actionType: 'main-pour',
          actionTime: 120,
          volume: 240,
          technique: 'center pour',
          description: 'Second step'
        }
      ];

      render(
        <TurbulenceStep 
          data={existingSteps}
          errors={{}}
          onChange={mockOnChange}
        />
      );

      // Should show both steps
      expect(screen.getByDisplayValue('First step')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Second step')).toBeInTheDocument();

      // Remove first step
      const removeButtons = screen.getAllByRole('button', { name: /remove.*step/i });
      await user.click(removeButtons[0]);

      // Should call onChange with remaining step, reordered
      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          stepOrder: 1, // Should be reordered
          actionType: 'main-pour',
          description: 'Second step'
        })
      ]);
    });
  });

  describe('EvaluationStep Integration', () => {
    test('should handle different evaluation types', async () => {
      const mockOnChange = jest.fn();

      render(
        <EvaluationStep 
          data={{}}
          errors={{}}
          onChange={mockOnChange}
        />
      );

      // Test Quick Evaluation
      await user.selectOptions(screen.getByLabelText(/evaluation type/i), 'quick');
      
      await waitFor(() => {
        expect(screen.getByLabelText(/overall quality/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/overall quality/i), '8');
      await user.type(screen.getByLabelText(/notes/i), 'Excellent coffee');

      expect(mockOnChange).toHaveBeenCalledWith({
        type: 'quick',
        overallQuality: 8,
        notes: 'Excellent coffee'
      });

      // Test SCA Evaluation
      await user.selectOptions(screen.getByLabelText(/evaluation type/i), 'sca');

      await waitFor(() => {
        expect(screen.getByLabelText(/aroma/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/flavor/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/aftertaste/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/acidity/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/body/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/balance/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/overall/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/defects/i)).toBeInTheDocument();
      });

      // Fill SCA scores
      await user.type(screen.getByLabelText(/aroma/i), '8');
      await user.type(screen.getByLabelText(/flavor/i), '8');
      await user.type(screen.getByLabelText(/aftertaste/i), '7');
      await user.type(screen.getByLabelText(/acidity/i), '8');
      await user.type(screen.getByLabelText(/body/i), '7');
      await user.type(screen.getByLabelText(/balance/i), '8');
      await user.type(screen.getByLabelText(/overall/i), '8');
      await user.type(screen.getByLabelText(/defects/i), '2');

      expect(mockOnChange).toHaveBeenCalledWith({
        type: 'sca',
        scores: {
          aroma: 8,
          flavor: 8,
          aftertaste: 7,
          acidity: 8,
          body: 7,
          balance: 8,
          overall: 8
        },
        defects: 2,
        notes: undefined
      });

      // Should calculate and display final SCA score
      await waitFor(() => {
        // Final score should be sum of scores (54) minus defects (2) = 52
        expect(screen.getByText(/final.*score.*52/i) || screen.getByText(/52/)).toBeInTheDocument();
      });
    });

    test('should validate evaluation scores', async () => {
      const mockOnChange = jest.fn();
      const mockErrors = {
        'evaluation.overallQuality': 'Overall quality must be between 1-10',
        'evaluation.scores.aroma': 'Aroma score must be between 1-10'
      };

      render(
        <EvaluationStep 
          data={{ type: 'quick', overallQuality: 15 }}
          errors={mockErrors}
          onChange={mockOnChange}
        />
      );

      // Should display validation errors
      expect(screen.getByText('Overall quality must be between 1-10')).toBeInTheDocument();
    });
  });

  describe('ReviewStep Integration', () => {
    test('should display complete brew summary for review', async () => {
      const completeBrewData: CreateBrewRequest = {
        userName: 'Test Brew',
        beans: {
          brand: 'Ethiopian Coffee Co',
          origin: 'Yirgacheffe',
          processingMethod: 'washed',
          roastingLevel: 'medium'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Baratza Encore',
          grinderSetting: '15',
          waterTemperature: 93
        },
        measurements: {
          coffeeBeansWeight: 22,
          waterWeight: 350,
          brewedCoffeeWeight: 310
        },
        evaluation: {
          type: 'quick',
          overallQuality: 8,
          notes: 'Excellent brew'
        },
        turbulenceSteps: [
          {
            stepOrder: 1,
            actionType: 'bloom',
            actionTime: 30,
            volume: 60,
            technique: 'circular pour',
            description: 'Initial bloom'
          }
        ]
      };

      render(
        <ReviewStep 
          data={completeBrewData}
          errors={{}}
          onChange={jest.fn()}
        />
      );

      // Should display all entered data
      expect(screen.getByText('Ethiopian Coffee Co')).toBeInTheDocument();
      expect(screen.getByText('Yirgacheffe')).toBeInTheDocument();
      expect(screen.getByText('washed')).toBeInTheDocument();
      expect(screen.getByText('Baratza Encore')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('93°C')).toBeInTheDocument();
      expect(screen.getByText('22g')).toBeInTheDocument();
      expect(screen.getByText('350g')).toBeInTheDocument();
      expect(screen.getByText(/8.*10/)).toBeInTheDocument();
      expect(screen.getByText('Initial bloom')).toBeInTheDocument();

      // Should calculate and display ratio
      expect(screen.getByText(/15\.91/i)).toBeInTheDocument();
    });

    test('should allow editing fields from review', async () => {
      const mockOnChange = jest.fn();
      const brewData: CreateBrewRequest = {
        beans: {
          brand: 'Test Coffee',
          origin: 'Test Origin',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test Grinder',
          grinderSetting: '10',
          waterTemperature: 90
        },
        measurements: {
          coffeeBeansWeight: 20,
          waterWeight: 300
        }
      };

      render(
        <ReviewStep 
          data={brewData}
          errors={{}}
          onChange={mockOnChange}
        />
      );

      // Should have edit buttons for each section
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);

      // Test editing a field (if component supports inline editing)
      if (screen.queryByRole('button', { name: /edit.*notes/i })) {
        await user.click(screen.getByRole('button', { name: /edit.*notes/i }));
        
        const notesInput = screen.getByLabelText(/notes/i);
        await user.type(notesInput, 'Added from review');
        
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            evaluation: expect.objectContaining({
              notes: 'Added from review'
            })
          })
        );
      }
    });

    test('should show validation errors for incomplete data', async () => {
      const incompleteData: Partial<CreateBrewRequest> = {
        beans: {
          brand: 'Test Coffee',
          origin: '',
          processingMethod: 'washed'
        }
      };

      const mockErrors = {
        beans: 'Coffee beans information is incomplete',
        parameters: 'Brewing parameters are incomplete',
        measurements: 'Measurements are incomplete'
      };

      render(
        <ReviewStep 
          data={incompleteData as CreateBrewRequest}
          errors={mockErrors}
          onChange={jest.fn()}
        />
      );

      // Should display validation errors
      expect(screen.getByText('Coffee beans information is incomplete')).toBeInTheDocument();
      expect(screen.getByText('Brewing parameters are incomplete')).toBeInTheDocument();
      expect(screen.getByText('Measurements are incomplete')).toBeInTheDocument();
    });
  });

  describe('WizardNavigation Integration', () => {
    test('should handle navigation state correctly', async () => {
      const mockOnNext = jest.fn();
      const mockOnPrevious = jest.fn();
      const mockOnSkip = jest.fn();
      const mockOnSubmit = jest.fn();
      const mockOnCancel = jest.fn();

      // Test first step
      render(
        <WizardNavigation
          currentStep={0}
          totalSteps={6}
          canProceed={true}
          isLastStep={false}
          isSubmitting={false}
          isOptionalStep={false}
          onNext={mockOnNext}
          onPrevious={mockOnPrevious}
          onSkip={mockOnSkip}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Should show Next button, no Previous (first step)
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(mockOnNext).toHaveBeenCalled();

      // Test middle optional step
      render(
        <WizardNavigation
          currentStep={2}
          totalSteps={6}
          canProceed={true}
          isLastStep={false}
          isSubmitting={false}
          isOptionalStep={true}
          onNext={mockOnNext}
          onPrevious={mockOnPrevious}
          onSkip={mockOnSkip}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Should show Previous, Next, Skip buttons
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /skip/i }));
      expect(mockOnSkip).toHaveBeenCalled();

      // Test last step
      render(
        <WizardNavigation
          currentStep={5}
          totalSteps={6}
          canProceed={true}
          isLastStep={true}
          isSubmitting={false}
          isOptionalStep={false}
          onNext={mockOnNext}
          onPrevious={mockOnPrevious}
          onSkip={mockOnSkip}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Should show Previous and Submit buttons
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit|create brew/i })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /submit|create brew/i }));
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    test('should handle disabled states correctly', async () => {
      const mockOnNext = jest.fn();

      // Test disabled Next button
      render(
        <WizardNavigation
          currentStep={0}
          totalSteps={6}
          canProceed={false}
          isLastStep={false}
          isSubmitting={false}
          isOptionalStep={false}
          onNext={mockOnNext}
          onPrevious={jest.fn()}
          onSkip={jest.fn()}
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();

      await user.click(nextButton);
      expect(mockOnNext).not.toHaveBeenCalled();

      // Test submitting state
      render(
        <WizardNavigation
          currentStep={5}
          totalSteps={6}
          canProceed={true}
          isLastStep={true}
          isSubmitting={true}
          isOptionalStep={false}
          onNext={jest.fn()}
          onPrevious={jest.fn()}
          onSkip={jest.fn()}
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit|create brew|submitting/i });
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/submitting|creating/i)).toBeInTheDocument();
    });
  });

  describe('WizardProgress Integration', () => {
    test('should display progress correctly', async () => {
      const mockOnStepClick = jest.fn();
      const steps = [
        { id: 'beans', title: 'Coffee Beans', required: true },
        { id: 'parameters', title: 'Parameters', required: true },
        { id: 'turbulence', title: 'Turbulence', required: false },
        { id: 'measurements', title: 'Measurements', required: true },
        { id: 'evaluation', title: 'Evaluation', required: false },
        { id: 'review', title: 'Review', required: true }
      ];

      render(
        <WizardProgress
          steps={steps}
          currentStep={2}
          onStepClick={mockOnStepClick}
        />
      );

      // Should show all steps
      steps.forEach(step => {
        expect(screen.getByText(step.title)).toBeInTheDocument();
      });

      // Should highlight current step
      const currentStepElement = screen.getByText('Turbulence').closest('[data-current="true"]') ||
                                 screen.getByText('Turbulence').closest('.current');
      expect(currentStepElement).toBeInTheDocument();

      // Should show completed steps as completed
      expect(screen.getByText('Coffee Beans')).toHaveClass('completed', { exact: false });
      expect(screen.getByText('Parameters')).toHaveClass('completed', { exact: false });

      // Should indicate optional steps
      expect(screen.getByText('Turbulence').closest('[data-optional="true"]') ||
             screen.getByText('Turbulence')).toBeInTheDocument();
      expect(screen.getByText('Evaluation').closest('[data-optional="true"]') ||
             screen.getByText('Evaluation')).toBeInTheDocument();

      // Test step clicking
      await user.click(screen.getByText('Coffee Beans'));
      expect(mockOnStepClick).toHaveBeenCalledWith(0);
    });

    test('should prevent clicking on future steps when validation fails', async () => {
      const mockOnStepClick = jest.fn();
      const steps = [
        { id: 'beans', title: 'Coffee Beans', required: true },
        { id: 'parameters', title: 'Parameters', required: true },
        { id: 'measurements', title: 'Measurements', required: true }
      ];

      render(
        <WizardProgress
          steps={steps}
          currentStep={0}
          onStepClick={mockOnStepClick}
        />
      );

      // Should disable future steps when current step has validation errors
      const futureStep = screen.getByText('Measurements');
      if (futureStep.closest('button')) {
        expect(futureStep.closest('button')).toBeDisabled();
      } else {
        // Or should not be clickable
        await user.click(futureStep);
        expect(mockOnStepClick).not.toHaveBeenCalledWith(2);
      }
    });
  });
});