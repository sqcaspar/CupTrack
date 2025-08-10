// Brew-related TypeScript type definitions
// Based on comprehensive specification in spec.md

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

// SCAA Cupping Protocols 2005 - Official SCA Protocol Implementation
export interface SCAEvaluation {
  type: 'sca';
  
  // Official SCAA 11 Flavor Attributes (6.00-9.00 scale in quarter-point increments)
  scores: {
    // Dry fragrance evaluation (missing in previous implementation)
    fragrance: number;              // 6.00-9.00 scale (quarter-point increments)
    
    // Wet aroma evaluation after crust breaking
    aroma: number;                  // 6.00-9.00 scale (quarter-point increments)
    
    // Core flavor attributes
    flavor: number;                 // 6.00-9.00 scale (quarter-point increments)
    aftertaste: number;             // 6.00-9.00 scale (quarter-point increments)
    acidity: number;                // 6.00-9.00 scale (quarter-point increments)
    body: number;                   // 6.00-9.00 scale (quarter-point increments)
    
    // Balance and quality attributes
    balance: number;                // 6.00-9.00 scale (quarter-point increments)
    uniformity: number;             // 6.00-9.00 scale (quarter-point increments) - NEW
    cleanCup: number;               // 6.00-9.00 scale (quarter-point increments) - NEW
    sweetness: number;              // 6.00-9.00 scale (quarter-point increments) - NEW
    
    // Overall impression
    overall: number;                // 6.00-9.00 scale (quarter-point increments)
  };
  
  // Official SCAA Defects System (replaces simple number)
  defects: {
    taints: {                       // 2-point penalty each
      count: number;                // Number of taint defects (0-10)
      types: string[];              // Types of taints identified
      descriptions: string[];       // Detailed defect descriptions
    };
    faults: {                       // 4-point penalty each
      count: number;                // Number of fault defects (0-10)  
      types: string[];              // Types of faults identified
      descriptions: string[];       // Detailed defect descriptions
    };
    totalPenalty: number;           // Calculated total penalty (2×taints + 4×faults)
  };
  
  // Official SCAA evaluation procedure tracking
  procedure: {
    evaluationTemperature: {
      start: number;                // Starting temperature (°F) - typically 200°F
      end: number;                  // Ending temperature (°F) - typically 70°F
      current?: number;             // Current temperature during evaluation
    };
    evaluationTime: {
      startTime?: string;           // ISO timestamp when evaluation started
      crustBreakTime?: string;      // When crust was broken for aroma
      tastingStartTime?: string;    // When tasting phase began
      completionTime?: string;      // When evaluation was completed
    };
    cupsEvaluated: number;          // Number of cups in cupping set (typically 5)
    cupperName?: string;            // Name of certified cupper (optional)
  };
  
  finalScore: number;               // Calculated final score (sum of 11 attributes - defect penalties)
  qualityClassification?: string;   // SCAA quality classification (e.g., "Specialty Grade", "Premium", etc.)
  notes?: string;                   // General cupping notes
}

export interface CVAAffectiveEvaluation {
  type: 'cva_affective';
  // SCA Standard 104-2024: 8 cupping sections with 1-9 scale for impression of quality
  sections: {
    fragrance: number;              // 1-9 scale - orthonasal smell of dry grounds
    aroma: number;                  // 1-9 scale - orthonasal smell of wet brew
    flavor: number;                 // 1-9 scale - taste + retronasal while in mouth
    aftertaste: number;             // 1-9 scale - taste + smell after swallowing
    acidity: number;                // 1-9 scale - sour taste perception
    sweetness: number;              // 1-9 scale - gustatory/retronasal sweetness
    mouthfeel: number;              // 1-9 scale - tactile perception (excluding temperature)
    overall: number;                // 1-9 scale - general impression including balance
  };
  // Defects and Uniformity tracking per SCA standard
  nonUniformCups: number;           // Number of non-uniform cups (0-5)
  defectiveCups: number;            // Number of defective cups (0-5)
  defectType?: 'moldy' | 'phenolic' | 'potato'; // SCA recognized defect types
  // SCA calculated score using official formula
  scaScore?: number;                // Calculated: S = 0.65625 × Σ(hi) + 52.75 - 2u - 4d
  notes?: string;                   // Affective notes (justification of scores)
}

// SCA Standard 103-P/2024: CVA Descriptive Assessment
export interface CVADescriptiveEvaluation {
  type: 'cva_descriptive';
  
  // Official SCA 6 Cupping Sections with 15-point intensity scales (0-15)
  fragrance: {
    intensity: number;              // 0-15 scale - total intensity of dry grounds
    orthonasal: string[];           // CATA descriptors (up to 5)
    notes?: string;                 // Freely elicited descriptors
  };
  
  aroma: {
    intensity: number;              // 0-15 scale - total intensity of brewed coffee
    // Shares orthonasal CATA with fragrance section
    notes?: string;                 // Freely elicited descriptors
  };
  
  flavor: {
    intensity: number;              // 0-15 scale - total intensity while in mouth
    retronasal: string[];           // CATA descriptors for olfactory (up to 5)
    mainTastes: string[];           // CATA descriptors for gustatory (up to 2)
    notes?: string;                 // Freely elicited descriptors
  };
  
  aftertaste: {
    intensity: number;              // 0-15 scale - total intensity after swallow/eject
    // Shares retronasal and mainTastes CATA with flavor section
    notes?: string;                 // Freely elicited descriptors
  };
  
  acidity: {
    intensity: number;              // 0-15 scale - perception of sour taste
    descriptors: string[];          // Freely elicited terms only (no CATA)
    notes?: string;                 // Additional freely elicited descriptors
  };
  
  sweetness: {
    intensity: number;              // 0-15 scale - gustatory or retronasal sweetness
    descriptors: string[];          // Freely elicited terms only (no CATA)
    notes?: string;                 // Additional freely elicited descriptors
  };
  
  mouthfeel: {
    intensity: number;              // 0-15 scale - tactile perception (body level)
    characteristics: string[];      // CATA descriptors (up to 2)
    notes?: string;                 // Freely elicited descriptors
  };
  
  // SCA Assessment Metadata
  roastLevel?: string;              // Visual estimation when applicable
  sampleNumber?: string;            // For tracking purposes
  notes?: string;                   // General assessment notes
}

// SCA Standard 103-P/2024: Official CATA Descriptor Systems
export const SCA_ORTHONASAL_DESCRIPTORS = {
  // Primary categories with sub-descriptors
  floral: ['Floral'],
  fruity: ['Fruity', 'Berry', 'Dried Fruit', 'Citrus Fruit'],
  sourFermented: ['Sour/Fermented', 'Sour', 'Fermented'],
  greenVegetative: ['Green/Vegetative'],
  other: ['Other', 'Chemical', 'Musty/Earthy', 'Woody'],
  roasted: ['Roasted', 'Cereal', 'Burnt', 'Tobacco'],
  nuttyCocoa: ['Nutty/Cocoa', 'Nutty', 'Cocoa'],
  spice: ['Spice'],
  sweet: ['Sweet', 'Vanilla/Vanillin', 'Brown Sugar']
} as const;

export const SCA_MAIN_TASTES = ['Salty', 'Sour', 'Sweet', 'Bitter', 'Umami'] as const;

export const SCA_MOUTHFEEL_DESCRIPTORS = [
  'Rough (Gritty, Chalky, Sandy)',
  'Smooth (Velvety, Silky, Syrupy)', 
  'Oily',
  'Mouth-Drying',
  'Metallic'
] as const;

// Flattened list for easier access
export const SCA_ALL_ORTHONASAL_OPTIONS = [
  'Floral',
  'Fruity', 'Berry', 'Dried Fruit', 'Citrus Fruit',
  'Sour/Fermented', 'Sour', 'Fermented',
  'Green/Vegetative',
  'Other', 'Chemical', 'Musty/Earthy', 'Woody',
  'Roasted', 'Cereal', 'Burnt', 'Tobacco',
  'Nutty/Cocoa', 'Nutty', 'Cocoa',
  'Spice',
  'Sweet', 'Vanilla/Vanillin', 'Brown Sugar'
] as const;

// SCAA Cupping Protocols 2005 - Official Defect Types
export const SCAA_TAINT_DEFECTS = [
  'Musty/Moldy',
  'Sour/Fermented', 
  'Phenolic/Medicinal',
  'Meaty/Brothy',
  'Onion/Garlic',
  'Petroleum/Gasoline',
  'Rubber',
  'Skunk-like',
  'Other Taint'
] as const;

export const SCAA_FAULT_DEFECTS = [
  'Dirty/Earthy',
  'Fungal/Musty', 
  'Sour/Rancid',
  'Chemical/Petroleum',
  'Stinker/Phenolic',
  'Foreign Matter',
  'Severe Process Defect',
  'Other Fault'
] as const;

// SCAA Evaluation Constants
export const SCAA_CONSTANTS = {
  SCORE_RANGE: {
    MIN: 6.0,
    MAX: 9.0,
    INCREMENT: 0.25
  },
  TEMPERATURE: {
    INITIAL: 200, // °F for initial fragrance evaluation
    CRUST_BREAK: 200, // °F when breaking crust for aroma
    TASTE_START: 160, // °F when tasting begins
    TASTE_END: 70     // °F when evaluation ends
  },
  DEFECT_PENALTIES: {
    TAINT: 2,  // points deducted per taint
    FAULT: 4   // points deducted per fault
  },
  QUALITY_THRESHOLDS: {
    SPECIALTY: 80,
    PREMIUM: 70,
    EXCHANGE: 60,
    STANDARD: 50
  }
} as const;

export type BrewEvaluation = QuickEvaluation | SCAEvaluation | CVAAffectiveEvaluation | CVADescriptiveEvaluation;

// Complete brew record structure
export interface BrewRecord {
  id: string;                       // UUID
  userId: string;                   // UUID - owner of the brew
  brewNumber: string;               // Auto-generated (B-YYYY-XXX format)
  userName?: string;                // Optional user-defined name
  createdAt: string;                // ISO timestamp
  updatedAt: string;                // ISO timestamp
  isShared: boolean;                // Whether brew is publicly shared
  isFavorite: boolean;              // Whether user marked as favorite
  
  // Core brew data
  beans: CoffeeBeans;
  parameters: BrewingParameters;
  turbulenceSteps: TurbulenceStep[];
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
}

export interface UpdateBrewRequest extends Partial<CreateBrewRequest> {
  isFavorite?: boolean;
  isShared?: boolean;
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

export interface BrewListFilters {
  page?: number;
  limit?: number;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
  favorites?: boolean;
  sortBy?: 'createdAt' | 'quality' | 'brewNumber';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  ids?: string[];
  includeCollections?: boolean;
}

// Utility types for calculated values
export interface BrewCalculations {
  coffeeToWaterRatio: number;
  extractionYield?: number;         // If TDS is provided
  strengthTDS?: number;             // Calculated TDS
}

// Collection-related types
export interface BrewCollection {
  id: string;
  userId: string;
  name: string;
  brewIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionRequest {
  name: string;
  brewIds?: string[];
}

// Comparison types
export interface BrewComparisonData {
  brew1: BrewRecord;
  brew2: BrewRecord;
  differences: {
    parameter: string;
    brew1Value: any;
    brew2Value: any;
    difference: number | string;
    impact?: string;
  }[];
  chartData?: {
    polygonChart: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        borderColor: string;
      }[];
    };
  };
}

// Error types specific to brew operations
export interface BrewValidationError {
  field: string;
  message: string;
  value?: any;
}

export class BrewError extends Error {
  public validationErrors?: BrewValidationError[];
  public statusCode: number;

  constructor(message: string, statusCode: number = 400, validationErrors?: BrewValidationError[]) {
    super(message);
    this.name = 'BrewError';
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
  }
}

// Utility functions for calculations
export const calculateBrewRatio = (waterWeight: number, coffeeWeight: number): number => {
  if (coffeeWeight <= 0) {
    throw new BrewError('Coffee weight must be greater than 0');
  }
  return Math.round((waterWeight / coffeeWeight) * 100) / 100;
};

// Official SCAA Cupping Protocols 2005 Final Score Calculation
export const calculateSCAFinalScore = (scores: SCAEvaluation['scores'], defects: SCAEvaluation['defects']): number => {
  // Sum all 11 SCAA flavor attribute scores (6.00-9.00 scale each)
  const attributeScores = [
    scores.fragrance,
    scores.aroma, 
    scores.flavor,
    scores.aftertaste,
    scores.acidity,
    scores.body,
    scores.balance,
    scores.uniformity,
    scores.cleanCup,
    scores.sweetness,
    scores.overall
  ];
  
  const totalAttributeScore = attributeScores.reduce((sum, score) => sum + score, 0);
  
  // Apply SCAA defect penalties: Taints = 2 points each, Faults = 4 points each
  const defectPenalty = (defects.taints.count * 2) + (defects.faults.count * 4);
  
  // Final score = Sum of attributes - defect penalties
  const finalScore = Math.max(0, totalAttributeScore - defectPenalty);
  
  // Round to quarter-point precision (0.25 increments)
  return Math.round(finalScore * 4) / 4;
};

// SCAA Quality Classification based on final score
export const getSCAAQualityClassification = (finalScore: number): string => {
  if (finalScore >= 80) return 'Specialty Grade';
  if (finalScore >= 70) return 'Premium Grade';  
  if (finalScore >= 60) return 'Exchange Grade';
  if (finalScore >= 50) return 'Standard Grade';
  return 'Off Grade';
};

// SCAA Defect Calculation Helper
export const calculateSCAADefectPenalty = (taints: number, faults: number): number => {
  return (taints * 2) + (faults * 4);
};

// Validate SCAA Score Range (6.00-9.00 in quarter-point increments)
export const isValidSCAAScore = (score: number): boolean => {
  return score >= 6.0 && score <= 9.0 && (score * 4) % 1 === 0;
};

// SCA Standard 104-2024 CVA Affective Score Calculation
export const calculateCVAAffectiveScore = (
  sections: CVAAffectiveEvaluation['sections'], 
  nonUniformCups: number = 0, 
  defectiveCups: number = 0
): number => {
  // SCA Formula: S = 0.65625 × Σ(hi) + 52.75 - 2u - 4d
  const sectionValues = Object.values(sections);
  const sumOfSections = sectionValues.reduce((sum, score) => sum + score, 0);
  
  const rawScore = 0.65625 * sumOfSections + 52.75 - (2 * nonUniformCups) - (4 * defectiveCups);
  
  // Round to nearest 0.25 points per SCA standard
  const roundedScore = Math.round(rawScore * 4) / 4;
  
  // Ensure score doesn't go below 0 or above 100
  return Math.max(0, Math.min(100, roundedScore));
};

export const generateBrewNumber = (userId: string, sequenceNumber: number): string => {
  const year = new Date().getFullYear();
  const paddedSequence = sequenceNumber.toString().padStart(3, '0');
  return `B-${year}-${paddedSequence}`;
};

// Default values and constants
export const DEFAULT_BREWING_PARAMETERS: Partial<BrewingParameters> = {
  waterTemperature: 92,
  brewingMethod: 'pour-over',
};

export const BREWING_METHOD_OPTIONS = [
  { value: 'pour-over', label: 'Pour Over' },
  { value: 'french-press', label: 'French Press' },
  { value: 'aeropress', label: 'Aeropress' },
  { value: 'espresso', label: 'Espresso' },
  { value: 'cold-brew', label: 'Cold Brew' },
  { value: 'other', label: 'Other' },
] as const;

// Coffee origin countries grouped by continent (top 12 filter coffee origins)
export const COFFEE_ORIGIN_OPTIONS = {
  'Africa': [
    { value: 'ethiopia', label: 'Ethiopia' },
    { value: 'kenya', label: 'Kenya' },
    { value: 'rwanda', label: 'Rwanda' },
    { value: 'uganda', label: 'Uganda' },
  ],
  'Central & South America': [
    { value: 'colombia', label: 'Colombia' },
    { value: 'guatemala', label: 'Guatemala' },
    { value: 'costa-rica', label: 'Costa Rica' },
    { value: 'brazil', label: 'Brazil' },
  ],
  'Asia & Pacific': [
    { value: 'indonesia', label: 'Indonesia' },
    { value: 'yemen', label: 'Yemen' },
    { value: 'jamaica', label: 'Jamaica' },
    { value: 'hawaii', label: 'Hawaii (USA)' },
  ],
  'Other': [
    { value: 'other', label: 'Other (specify below)' },
  ],
} as const;

// Top 6 coffee processing methods plus Other option
export const PROCESSING_METHOD_OPTIONS = [
  { value: 'washed', label: 'Washed (Wet Process)' },
  { value: 'natural', label: 'Natural (Dry Process)' },
  { value: 'honey', label: 'Honey Process' },
  { value: 'semi-washed', label: 'Semi-Washed (Pulped Natural)' },
  { value: 'anaerobic', label: 'Anaerobic Fermentation' },
  { value: 'other', label: 'Other (specify below)' },
] as const;

export const ROASTING_LEVEL_OPTIONS = [
  { value: 'light', label: 'Light Roast' },
  { value: 'medium-light', label: 'Medium-Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'medium-dark', label: 'Medium-Dark' },
  { value: 'dark', label: 'Dark Roast' },
  { value: 'other', label: 'Other' },
] as const;

// Top 12 pour-over grinder models
export const GRINDER_MODEL_OPTIONS = [
  { value: 'baratza-encore', label: 'Baratza Encore' },
  { value: 'baratza-virtuoso-plus', label: 'Baratza Virtuoso+' },
  { value: 'comandante-c40', label: 'Comandante C40' },
  { value: '1zpresso-jx-pro', label: '1Zpresso JX-Pro' },
  { value: 'timemore-c2', label: 'Timemore C2' },
  { value: 'hario-mini-mill', label: 'Hario Mini Mill' },
  { value: 'oxo-brew-conical-burr', label: 'OXO Brew Conical Burr' },
  { value: 'breville-smart-grinder-pro', label: 'Breville Smart Grinder Pro' },
  { value: 'fellow-ode', label: 'Fellow Ode' },
  { value: 'eureka-mignon', label: 'Eureka Mignon' },
  { value: 'wilfa-uniform', label: 'Wilfa Uniform' },
  { value: 'baratza-vario', label: 'Baratza Vario' },
  { value: 'other', label: 'Other (specify below)' },
] as const;