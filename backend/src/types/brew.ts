// Brew-related TypeScript type definitions for backend
// Shared types with frontend but with backend-specific additions

export interface CoffeeBeans {
  brand: string;                    // Required - Coffee Brand
  origin: string;                   // Required - Coffee origin country
  customOrigin?: string;            // Optional - custom input when origin is 'other'
  processingMethod: 'washed' | 'natural' | 'honey' | 'semi-washed' | 'anaerobic' | 'other'; // Required
  customProcessingMethod?: string;  // Optional - custom input when processingMethod is 'other'
  altitude?: number;                // Optional (meters above sea level)
  roastingDate?: string;            // Optional (ISO date string)
  roastingLevel?: 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark' | 'other'; // Optional
}

export interface BrewingParameters {
  brewingMethod: 'pour-over' | 'french-press' | 'aeropress' | 'espresso' | 'cold-brew' | 'other'; // Required
  grinderModel: string;             // Required - selected from dropdown or 'other'
  customGrinderModel?: string;      // Optional - custom input when grinderModel is 'other'
  grinderSetting: number;           // Required - numeric range 1-40
  waterTemperature: number;         // Required (Celsius)
  filteringTools?: string;          // Optional
  waterQuality?: string;            // Optional
}

export interface TurbulenceStep {
  stepOrder: number;                // Required (1, 2, 3, etc.)
  actionType: 'pour' | 'bloom' | 'main-pour' | 'stir' | 'agitation' | 'wait' | 'final-pour'; // Required
  actionTime: number;               // Required (seconds)
  volume: number;                   // Required (ml of water)
  technique?: string;               // Optional (moved to overall technique)
  description?: string;             // Optional (moved to overall description)
}

export interface BrewMeasurements {
  coffeeBeansWeight: number;        // Required (grams)
  waterWeight: number;              // Required (grams)
  coffeeToWaterRatio: number;       // Calculated (waterWeight / coffeeBeansWeight)
  brewedCoffeeWeight?: number;      // Optional (grams)
  tdsPercentage?: number;           // Optional (Total Dissolved Solids percentage)
}

export interface QuickEvaluation {
  type: 'quick';
  overallQuality: number;           // 1-10 scale
  notes?: string;
}

export interface SCAEvaluation {
  type: 'sca';
  scores: {
    aroma: number;                  // 1-10 scale
    flavor: number;                 // 1-10 scale
    aftertaste: number;             // 1-10 scale
    acidity: number;                // 1-10 scale
    body: number;                   // 1-10 scale
    balance: number;                // 1-10 scale
    overall: number;                // 1-10 scale
  };
  defects: number;                  // Number of defects
  notes?: string;
}

export interface CVAAffectiveEvaluation {
  type: 'cva_affective';
  overallLiking: number;            // 1-10 scale
  aromaLiking: number;              // 1-10 scale
  flavorLiking: number;             // 1-10 scale
  notes?: string;
}

export interface CVADescriptiveEvaluation {
  type: 'cva_descriptive';
  attributes: {
    sweetness: number;              // 1-10 scale
    acidity: number;                // 1-10 scale
    bitterness: number;             // 1-10 scale
    roastedness: number;            // 1-10 scale
    astringency: number;            // 1-10 scale
  };
  notes?: string;
}

export type BrewEvaluation = QuickEvaluation | SCAEvaluation | CVAAffectiveEvaluation | CVADescriptiveEvaluation;

// Database model structure (what gets stored in Supabase)
export interface BrewRecord {
  id: string;                       // UUID
  user_id: string;                  // UUID - owner of the brew (snake_case for database)
  brew_number: string;              // Auto-generated (B-YYYY-XXX format)
  user_name?: string;               // Optional user-defined name
  created_at: string;               // ISO timestamp
  updated_at: string;               // ISO timestamp
  is_shared: boolean;               // Whether brew is publicly shared
  is_favorite: boolean;             // Whether user marked as favorite
  
  // Core brew data (stored as JSONB in database)
  beans: CoffeeBeans;
  parameters: BrewingParameters;
  turbulence_steps: TurbulenceStep[];
  measurements: BrewMeasurements;
  evaluation?: BrewEvaluation;      // Optional - user might save without evaluation
}

// API request/response types
export interface CreateBrewRequest {
  userName?: string;
  beans: CoffeeBeans;
  parameters: BrewingParameters;
  turbulenceSteps?: TurbulenceStep[];
  overallTechnique?: string;          // Overall brewing technique description
  overallDescription?: string;        // Overall brewing notes and observations
  measurements: Omit<BrewMeasurements, 'coffeeToWaterRatio'>; // Ratio is calculated
  evaluation?: BrewEvaluation;
  isShared?: boolean;
}

export interface UpdateBrewRequest extends Partial<CreateBrewRequest> {
  isFavorite?: boolean;
  isShared?: boolean;
}

// Validation error types
export interface BrewValidationError {
  field: string;
  message: string;
  value?: any;
}

export class BrewError extends Error {
  public validationErrors: BrewValidationError[] | undefined;
  public statusCode: number;

  constructor(message: string, statusCode: number = 400, validationErrors?: BrewValidationError[]) {
    super(message);
    this.name = 'BrewError';
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
  }
}

// Business logic calculation types
export interface BrewCalculations {
  coffeeToWaterRatio: number;
  extractionYield?: number;         // If TDS and brewed weight are provided
  strengthTDS?: number;             // If TDS is provided
  brewingEfficiency?: number;       // Brewed weight / water weight ratio
}

// Database query types
export interface BrewListFilters {
  page?: number;
  limit?: number;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
  favorites?: boolean;
  sortBy?: 'created_at' | 'brew_number' | 'evaluation_quality';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  userId: string;                   // Always required for backend queries
}

export interface BrewListResponse {
  brews: BrewRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    appliedFilters: Record<string, any>;
    availableFilters: {
      methods: string[];
      dateRange: {
        earliest: string;
        latest: string;
      };
    };
  };
}