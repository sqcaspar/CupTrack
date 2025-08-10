// Brew data validation and calculation utilities
// Implements comprehensive validation and business logic for brewing data

import { 
  CoffeeBeans, 
  BrewingParameters, 
  TurbulenceStep, 
  BrewMeasurements,
  BrewEvaluation,
  CreateBrewRequest,
  SCAEvaluation,
  BrewValidationError,
  BrewError
} from '../types/brew';

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: BrewValidationError[];
}

// Coffee beans validation
export const validateCoffeeBeans = (beans: CoffeeBeans): ValidationResult => {
  const errors: BrewValidationError[] = [];

  // Required field validation
  if (!beans.brand || beans.brand.trim().length === 0) {
    errors.push({
      field: 'brand',
      message: 'Coffee Brand is required and cannot be empty',
      value: beans.brand
    });
  }

  if (!beans.origin || beans.origin.trim().length === 0) {
    errors.push({
      field: 'origin',
      message: 'Origin is required and cannot be empty',
      value: beans.origin
    });
  } else {
    // Validate custom origin when 'other' is selected
    if (beans.origin === 'other') {
      if (!beans.customOrigin || beans.customOrigin.trim().length === 0) {
        errors.push({
          field: 'customOrigin',
          message: 'Custom origin is required when "Other" is selected',
          value: beans.customOrigin
        });
      } else if (beans.customOrigin.length > 100) {
        errors.push({
          field: 'customOrigin',
          message: 'Custom origin must be 100 characters or less',
          value: beans.customOrigin
        });
      }
    }
  }

  if (!beans.processingMethod) {
    errors.push({
      field: 'processingMethod',
      message: 'Processing method is required',
      value: beans.processingMethod
    });
  } else {
    const validProcessingMethods = ['washed', 'natural', 'honey', 'semi-washed', 'anaerobic', 'other'];
    if (!validProcessingMethods.includes(beans.processingMethod)) {
      errors.push({
        field: 'processingMethod',
        message: 'Processing method must be one of: washed, natural, honey, semi-washed, anaerobic, other',
        value: beans.processingMethod
      });
    }
    
    // Validate custom processing method when 'other' is selected
    if (beans.processingMethod === 'other') {
      if (!beans.customProcessingMethod || beans.customProcessingMethod.trim().length === 0) {
        errors.push({
          field: 'customProcessingMethod',
          message: 'Custom processing method is required when "Other" is selected',
          value: beans.customProcessingMethod
        });
      } else if (beans.customProcessingMethod.length > 50) {
        errors.push({
          field: 'customProcessingMethod',
          message: 'Custom processing method must be 50 characters or less',
          value: beans.customProcessingMethod
        });
      }
    }
  }

  // Optional field validation
  if (beans.altitude !== undefined && beans.altitude < 0) {
    errors.push({
      field: 'altitude',
      message: 'Altitude must be a positive number',
      value: beans.altitude
    });
  }

  if (beans.roastingDate !== undefined) {
    const date = new Date(beans.roastingDate);
    if (isNaN(date.getTime())) {
      errors.push({
        field: 'roastingDate',
        message: 'Roasting date must be a valid ISO date string',
        value: beans.roastingDate
      });
    }
  }

  if (beans.roastingLevel !== undefined) {
    const validRoastingLevels = ['light', 'medium-light', 'medium', 'medium-dark', 'dark', 'other'];
    if (!validRoastingLevels.includes(beans.roastingLevel)) {
      errors.push({
        field: 'roastingLevel',
        message: 'Roasting level must be one of: light, medium-light, medium, medium-dark, dark, other',
        value: beans.roastingLevel
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Brewing parameters validation
export const validateBrewingParameters = (parameters: BrewingParameters): ValidationResult => {
  const errors: BrewValidationError[] = [];

  // Required field validation
  if (!parameters.brewingMethod) {
    errors.push({
      field: 'brewingMethod',
      message: 'Brewing method is required',
      value: parameters.brewingMethod
    });
  } else {
    const validBrewingMethods = ['pour-over', 'french-press', 'aeropress', 'espresso', 'cold-brew', 'other'];
    if (!validBrewingMethods.includes(parameters.brewingMethod)) {
      errors.push({
        field: 'brewingMethod',
        message: 'Brewing method must be one of: pour-over, french-press, aeropress, espresso, cold-brew, other',
        value: parameters.brewingMethod
      });
    }
  }

  if (!parameters.grinderModel || parameters.grinderModel.trim().length === 0) {
    errors.push({
      field: 'grinderModel',
      message: 'Grinder model is required and cannot be empty',
      value: parameters.grinderModel
    });
  } else {
    // Validate custom grinder model when 'other' is selected
    if (parameters.grinderModel === 'other') {
      if (!parameters.customGrinderModel || parameters.customGrinderModel.trim().length === 0) {
        errors.push({
          field: 'customGrinderModel',
          message: 'Custom grinder model is required when "Other" is selected',
          value: parameters.customGrinderModel
        });
      } else if (parameters.customGrinderModel.length > 100) {
        errors.push({
          field: 'customGrinderModel',
          message: 'Custom grinder model must be 100 characters or less',
          value: parameters.customGrinderModel
        });
      }
    }
  }

  if (parameters.grinderSetting === undefined || parameters.grinderSetting === null) {
    errors.push({
      field: 'grinderSetting',
      message: 'Grinder setting is required',
      value: parameters.grinderSetting
    });
  } else {
    if (parameters.grinderSetting < 1 || parameters.grinderSetting > 40) {
      errors.push({
        field: 'grinderSetting',
        message: 'Grinder setting must be between 1 and 40',
        value: parameters.grinderSetting
      });
    }
  }

  if (parameters.waterTemperature === undefined || parameters.waterTemperature === null) {
    errors.push({
      field: 'waterTemperature',
      message: 'Water temperature is required',
      value: parameters.waterTemperature
    });
  } else {
    if (parameters.waterTemperature < 60 || parameters.waterTemperature > 100) {
      errors.push({
        field: 'waterTemperature',
        message: 'Water temperature must be between 60°C and 100°C',
        value: parameters.waterTemperature
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Turbulence steps validation
export const validateTurbulenceSteps = (steps: TurbulenceStep[]): ValidationResult => {
  const errors: BrewValidationError[] = [];

  if (!Array.isArray(steps)) {
    errors.push({
      field: 'turbulenceSteps',
      message: 'Turbulence steps must be an array',
      value: steps
    });
    return { isValid: false, errors };
  }

  // Check for duplicate step orders
  const stepOrders = steps.map(step => step.stepOrder);
  const duplicateOrders = stepOrders.filter((order, index) => stepOrders.indexOf(order) !== index);
  if (duplicateOrders.length > 0) {
    errors.push({
      field: 'turbulenceSteps',
      message: 'Duplicate step orders are not allowed',
      value: duplicateOrders
    });
  }

  // Validate each step
  steps.forEach((step, index) => {
    const stepPrefix = `turbulenceSteps[${index}]`;

    if (!step.actionType) {
      errors.push({
        field: `${stepPrefix}.actionType`,
        message: 'Action type is required',
        value: step.actionType
      });
    } else {
      const validActionTypes = ['pour', 'bloom', 'main-pour', 'stir', 'agitation', 'wait', 'final-pour'];
      if (!validActionTypes.includes(step.actionType)) {
        errors.push({
          field: `${stepPrefix}.actionType`,
          message: 'Action type must be one of: pour, bloom, main-pour, stir, agitation, wait, final-pour',
          value: step.actionType
        });
      }
    }

    if (step.stepOrder === undefined || step.stepOrder < 1) {
      errors.push({
        field: `${stepPrefix}.stepOrder`,
        message: 'Step order must be a positive integer',
        value: step.stepOrder
      });
    }

    if (step.actionTime === undefined || step.actionTime < 0) {
      errors.push({
        field: `${stepPrefix}.actionTime`,
        message: 'Action time must be a non-negative number',
        value: step.actionTime
      });
    }

    if (step.volume === undefined || step.volume < 0) {
      errors.push({
        field: `${stepPrefix}.volume`,
        message: 'Volume must be a non-negative number',
        value: step.volume
      });
    }

    // Technique and description are now optional (moved to overall level)
    if (step.technique && step.technique.length > 100) {
      errors.push({
        field: `${stepPrefix}.technique`,
        message: 'Technique description must be 100 characters or less',
        value: step.technique
      });
    }

    if (step.description && step.description.length > 500) {
      errors.push({
        field: `${stepPrefix}.description`,
        message: 'Step description must be 500 characters or less',
        value: step.description
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Brew measurements validation
export const validateBrewMeasurements = (measurements: Omit<BrewMeasurements, 'coffeeToWaterRatio'>): ValidationResult => {
  const errors: BrewValidationError[] = [];

  // Required fields
  if (measurements.coffeeBeansWeight === undefined || measurements.coffeeBeansWeight <= 0) {
    errors.push({
      field: 'coffeeBeansWeight',
      message: 'Coffee beans weight must be greater than 0',
      value: measurements.coffeeBeansWeight
    });
  } else if (measurements.coffeeBeansWeight > 100) {
    errors.push({
      field: 'coffeeBeansWeight',
      message: 'Coffee beans weight seems unrealistic (max 100g)',
      value: measurements.coffeeBeansWeight
    });
  }

  if (measurements.waterWeight === undefined || measurements.waterWeight <= 0) {
    errors.push({
      field: 'waterWeight',
      message: 'Water weight must be greater than 0',
      value: measurements.waterWeight
    });
  } else if (measurements.waterWeight > 2000) {
    errors.push({
      field: 'waterWeight',
      message: 'Water weight seems unrealistic (max 2000g)',
      value: measurements.waterWeight
    });
  }

  // Optional fields validation
  if (measurements.brewedCoffeeWeight !== undefined) {
    if (measurements.brewedCoffeeWeight <= 0) {
      errors.push({
        field: 'brewedCoffeeWeight',
        message: 'Brewed coffee weight must be greater than 0',
        value: measurements.brewedCoffeeWeight
      });
    } else if (measurements.waterWeight && measurements.brewedCoffeeWeight > measurements.waterWeight) {
      errors.push({
        field: 'brewedCoffeeWeight',
        message: 'Brewed coffee weight cannot exceed water weight',
        value: measurements.brewedCoffeeWeight
      });
    }
  }

  if (measurements.tdsPercentage !== undefined) {
    if (measurements.tdsPercentage <= 0 || measurements.tdsPercentage > 4.0) {
      errors.push({
        field: 'tdsPercentage',
        message: 'TDS percentage must be between 0 and 4.0',
        value: measurements.tdsPercentage
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Brew evaluation validation
export const validateBrewEvaluation = (evaluation: BrewEvaluation): ValidationResult => {
  const errors: BrewValidationError[] = [];

  switch (evaluation.type) {
    case 'quick':
      if (evaluation.overallQuality === undefined || evaluation.overallQuality < 1 || evaluation.overallQuality > 10) {
        errors.push({
          field: 'overallQuality',
          message: 'Overall quality must be between 1 and 10',
          value: evaluation.overallQuality
        });
      }
      break;

    case 'sca':
      const requiredScores = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'overall'];
      requiredScores.forEach(scoreType => {
        const score = evaluation.scores[scoreType as keyof SCAEvaluation['scores']];
        if (score === undefined || score < 1 || score > 10) {
          errors.push({
            field: `scores.${scoreType}`,
            message: `${scoreType} score must be between 1 and 10`,
            value: score
          });
        }
      });

      if (evaluation.defects === undefined || evaluation.defects < 0) {
        errors.push({
          field: 'defects',
          message: 'Defects must be a non-negative number',
          value: evaluation.defects
        });
      }
      break;

    case 'cva_affective':
      if (evaluation.overallLiking === undefined || evaluation.overallLiking < 1 || evaluation.overallLiking > 10) {
        errors.push({
          field: 'overallLiking',
          message: 'overallLiking must be between 1 and 10',
          value: evaluation.overallLiking
        });
      }
      if (evaluation.aromaLiking === undefined || evaluation.aromaLiking < 1 || evaluation.aromaLiking > 10) {
        errors.push({
          field: 'aromaLiking',
          message: 'aromaLiking must be between 1 and 10',
          value: evaluation.aromaLiking
        });
      }
      if (evaluation.flavorLiking === undefined || evaluation.flavorLiking < 1 || evaluation.flavorLiking > 10) {
        errors.push({
          field: 'flavorLiking',
          message: 'flavorLiking must be between 1 and 10',
          value: evaluation.flavorLiking
        });
      }
      break;

    case 'cva_descriptive':
      const descriptiveFields = ['sweetness', 'acidity', 'bitterness', 'roastedness', 'astringency'];
      descriptiveFields.forEach(field => {
        const value = evaluation.attributes[field as keyof typeof evaluation.attributes];
        if (value === undefined || value < 1 || value > 10) {
          errors.push({
            field: `attributes.${field}`,
            message: `${field} must be between 1 and 10`,
            value
          });
        }
      });
      break;

    default:
      errors.push({
        field: 'type',
        message: 'Invalid evaluation type',
        value: (evaluation as any).type
      });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Complete brew request validation
export const validateCreateBrewRequest = (request: CreateBrewRequest): ValidationResult => {
  const allErrors: BrewValidationError[] = [];

  // Validate each section
  const beansValidation = validateCoffeeBeans(request.beans);
  allErrors.push(...beansValidation.errors);

  const parametersValidation = validateBrewingParameters(request.parameters);
  allErrors.push(...parametersValidation.errors);

  const measurementsValidation = validateBrewMeasurements(request.measurements);
  allErrors.push(...measurementsValidation.errors);

  if (request.turbulenceSteps) {
    const turbulenceValidation = validateTurbulenceSteps(request.turbulenceSteps);
    allErrors.push(...turbulenceValidation.errors);
  }

  if (request.evaluation) {
    const evaluationValidation = validateBrewEvaluation(request.evaluation);
    allErrors.push(...evaluationValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Calculation functions
export const calculateBrewRatio = (waterWeight: number, coffeeWeight: number): number => {
  if (coffeeWeight <= 0) {
    throw new BrewError('Coffee weight must be greater than 0');
  }
  return Math.round((waterWeight / coffeeWeight) * 100) / 100;
};

export const calculateSCAFinalScore = (scores: SCAEvaluation['scores'], defects: number): number => {
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const finalScore = Math.max(0, totalScore - defects);
  return Math.round(finalScore * 100) / 100;
};

export const calculateExtractionYield = (tdsPercentage: number, brewedWeight: number, coffeeWeight: number): number => {
  if (tdsPercentage <= 0 || brewedWeight <= 0 || coffeeWeight <= 0) {
    throw new BrewError('TDS percentage, brewed weight, and coffee weight must all be greater than 0');
  }
  const extractionYield = (tdsPercentage * brewedWeight / coffeeWeight);
  return Math.round(extractionYield * 100) / 100;
};

export const generateBrewNumber = (_userId: string, sequenceNumber: number): string => {
  const year = new Date().getFullYear();
  const paddedSequence = sequenceNumber.toString().padStart(3, '0');
  return `B-${year}-${paddedSequence}`;
};

// Export types for testing
export { BrewValidationError, BrewError };