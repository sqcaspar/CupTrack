export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UserData {
  email: string;
  role: string;
}

export interface BrewData {
  beans: {
    brand: string;
    origin?: string;
    processing_method?: string;
  };
  parameters: {
    brewing_method?: string;
    grinder_model?: string;
    grinder_setting?: string;
    water_temperature?: number;
  };
  measurements: {
    coffee_beans_weight?: number;
    water_weight?: number;
  };
}

export function validateUserData(userData: UserData): ValidationResult {
  const errors: string[] = [];

  // Email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!userData.email || userData.email.trim() === '' || !emailRegex.test(userData.email) || userData.email.includes('..')) {
    errors.push('Invalid email format');
  }

  // Role validation
  const validRoles = ['user', 'admin'];
  if (!userData.role || !validRoles.includes(userData.role)) {
    errors.push('Invalid role');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateBrewData(brewData: BrewData): ValidationResult {
  const errors: string[] = [];

  // Validate beans data
  if (!brewData.beans.brand) {
    errors.push('Brand is required');
  }
  if (!brewData.beans.origin) {
    errors.push('Origin is required');
  }
  if (!brewData.beans.processing_method) {
    errors.push('Processing method is required');
  } else {
    const validProcessingMethods = ['washed', 'natural', 'honey'];
    if (!validProcessingMethods.includes(brewData.beans.processing_method)) {
      errors.push('Processing method must be washed, natural, or honey');
    }
  }

  // Validate parameters
  if (!brewData.parameters.brewing_method) {
    errors.push('Brewing method is required');
  } else {
    const validBrewingMethods = ['pour-over', 'french-press', 'aeropress'];
    if (!validBrewingMethods.includes(brewData.parameters.brewing_method)) {
      errors.push('Brewing method must be pour-over, french-press, or aeropress');
    }
  }

  if (!brewData.parameters.grinder_model) {
    errors.push('Grinder model is required');
  }

  if (!brewData.parameters.grinder_setting) {
    errors.push('Grinder setting is required');
  }

  if (brewData.parameters.water_temperature === undefined) {
    errors.push('Water temperature is required');
  } else if (brewData.parameters.water_temperature < 80 || brewData.parameters.water_temperature > 100) {
    errors.push('Water temperature must be between 80°C and 100°C');
  }

  // Validate measurements
  if (brewData.measurements.coffee_beans_weight === undefined) {
    errors.push('Coffee beans weight is required');
  } else if (brewData.measurements.coffee_beans_weight <= 0) {
    errors.push('Coffee beans weight must be positive');
  }

  if (brewData.measurements.water_weight === undefined) {
    errors.push('Water weight is required');
  } else if (brewData.measurements.water_weight <= 0) {
    errors.push('Water weight must be positive');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function generateBrewNumber(_userId: string, existingBrewNumbers: string[]): string {
  if (existingBrewNumbers.length === 0) {
    return 'BREW-0001';
  }

  // Extract numbers from existing brew numbers and find the highest
  const numbers = existingBrewNumbers
    .map(brewNumber => {
      const match = brewNumber.match(/BREW-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => num > 0);

  const maxNumber = Math.max(...numbers);
  const nextNumber = maxNumber + 1;

  return `BREW-${nextNumber.toString().padStart(4, '0')}`;
}