import { ApiClient } from './apiClient';
import { 
  BrewRecord, 
  CreateBrewRequest, 
  UpdateBrewRequest,
  SCAEvaluation,
  BrewListResponse,
  BrewListFilters,
  BrewError,
  BrewValidationError,
  calculateBrewRatio
} from '../types/brew';
import { ApiError } from '../types/api';

export class BrewService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Create a new brew record
   * @param brewData - The brew data to create
   * @returns Promise<BrewRecord> - The created brew record
   */
  async createBrew(brewData: CreateBrewRequest): Promise<BrewRecord> {
    try {
      // Client-side validation
      this.validateBrewData(brewData);

      // Calculate ratio on client side for validation
      const calculatedRatio = calculateBrewRatio(
        brewData.measurements.waterWeight,
        brewData.measurements.coffeeBeansWeight
      );

      // Add the calculated ratio to the request
      const brewDataWithRatio = {
        ...brewData,
        measurements: {
          ...brewData.measurements,
          coffeeToWaterRatio: calculatedRatio
        }
      };

      const response = await this.apiClient.post('/api/v1/brews', brewDataWithRatio);
      
      if (!response.success || !response.data?.brew) {
        throw new BrewError('Invalid response from server', 500);
      }

      return response.data.brew as BrewRecord;
    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }
      
      if (error instanceof ApiError) {
        throw new BrewError(`Failed to create brew: ${error.message}`, error.status);
      }

      // Handle axios errors
      if ((error as any).response?.data) {
        const errorData = (error as any).response.data;
        throw new BrewError(
          errorData.message || 'Failed to create brew',
          (error as any).response.status || 400,
          errorData.details
        );
      }

      throw new BrewError('Failed to create brew', 500);
    }
  }

  /**
   * Get a specific brew by ID
   * @param brewId - The ID of the brew to fetch
   * @returns Promise<BrewRecord> - The brew record
   */
  async getBrew(brewId: string): Promise<BrewRecord> {
    try {
      if (!brewId) {
        throw new BrewError('Brew ID is required', 400);
      }

      const response = await this.apiClient.get(`/api/v1/brews/${brewId}`);
      
      if (!response.success || !response.data?.brew) {
        throw new BrewError('Brew not found', 404);
      }

      return response.data.brew as BrewRecord;
    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }

      if ((error as any).response?.status === 404) {
        throw new BrewError('Brew not found', 404);
      }

      if (error instanceof ApiError) {
        throw new BrewError(`Failed to fetch brew: ${error.message}`, error.status);
      }

      throw new BrewError('Failed to fetch brew', 500);
    }
  }

  /**
   * Get a list of brews with filtering and pagination
   * @param filters - Optional filtering and pagination parameters
   * @returns Promise<BrewListResponse> - The list of brews with metadata
   */
  async getBrews(filters: BrewListFilters = {}): Promise<BrewListResponse> {
    try {
      // Set defaults
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 20,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
        ...filters
      };

      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.apiClient.get(`/api/v1/brews?${queryParams.toString()}`);
      
      if (!response.success || !response.data) {
        throw new BrewError('Invalid response from server', 500);
      }

      return response.data as BrewListResponse;
    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }

      if (error instanceof ApiError) {
        throw new BrewError(`Failed to fetch brews: ${error.message}`, error.status);
      }

      throw new BrewError('Failed to fetch brews', 500);
    }
  }

  /**
   * Update an existing brew record
   * @param brewId - The ID of the brew to update
   * @param updateData - The data to update
   * @returns Promise<BrewRecord> - The updated brew record
   */
  async updateBrew(brewId: string, updateData: UpdateBrewRequest): Promise<BrewRecord> {
    try {
      if (!brewId) {
        throw new BrewError('Brew ID is required', 400);
      }

      // If measurements are being updated, recalculate ratio
      if (updateData.measurements) {
        const { coffeeBeansWeight, waterWeight } = updateData.measurements;
        if (coffeeBeansWeight && waterWeight) {
          // Cast to include calculated ratio since it's being calculated
          (updateData.measurements as any).coffeeToWaterRatio = calculateBrewRatio(waterWeight, coffeeBeansWeight);
        }
      }

      const response = await this.apiClient.put(`/api/v1/brews/${brewId}`, updateData);
      
      if (!response.success || !response.data?.brew) {
        throw new BrewError('Invalid response from server', 500);
      }

      return response.data.brew as BrewRecord;
    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }

      if ((error as any).response?.status === 404) {
        throw new BrewError('Brew not found', 404);
      }

      if (error instanceof ApiError) {
        throw new BrewError(`Failed to update brew: ${error.message}`, error.status);
      }

      throw new BrewError('Failed to update brew', 500);
    }
  }

  /**
   * Delete a brew record
   * @param brewId - The ID of the brew to delete
   * @returns Promise<void>
   */
  async deleteBrew(brewId: string): Promise<void> {
    try {
      if (!brewId) {
        throw new BrewError('Brew ID is required', 400);
      }

      const response = await this.apiClient.delete(`/api/v1/brews/${brewId}`);
      
      if (!response.success) {
        throw new BrewError('Failed to delete brew', 500);
      }
    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }

      if ((error as any).response?.status === 404) {
        throw new BrewError('Brew not found', 404);
      }

      if (error instanceof ApiError) {
        throw new BrewError(`Failed to delete brew: ${error.message}`, error.status);
      }

      throw new BrewError('Failed to delete brew', 500);
    }
  }

  /**
   * Duplicate an existing brew as a template for a new brew
   * @param brewId - The ID of the brew to duplicate
   * @returns Promise<BrewRecord> - The new brew record created from the template
   */
  async duplicateBrew(brewId: string): Promise<BrewRecord> {
    try {
      if (!brewId) {
        throw new BrewError('Brew ID is required', 400);
      }

      const response = await this.apiClient.post(`/api/v1/brews/${brewId}/duplicate`);
      
      if (!response.success || !response.data?.brew) {
        throw new BrewError('Invalid response from server', 500);
      }

      return response.data.brew as BrewRecord;
    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }

      if ((error as any).response?.status === 404) {
        throw new BrewError('Brew not found', 404);
      }

      if (error instanceof ApiError) {
        throw new BrewError(`Failed to duplicate brew: ${error.message}`, error.status);
      }

      throw new BrewError('Failed to duplicate brew', 500);
    }
  }

  /**
   * Toggle the favorite status of a brew
   * @param brewId - The ID of the brew
   * @param isFavorite - Whether to mark as favorite or not
   * @returns Promise<BrewRecord> - The updated brew record
   */
  async toggleFavorite(brewId: string, isFavorite: boolean): Promise<BrewRecord> {
    return this.updateBrew(brewId, { isFavorite });
  }

  /**
   * Share or unshare a brew publicly
   * @param brewId - The ID of the brew
   * @param isShared - Whether to share the brew publicly
   * @returns Promise<BrewRecord> - The updated brew record
   */
  async toggleShare(brewId: string, isShared: boolean): Promise<BrewRecord> {
    return this.updateBrew(brewId, { isShared });
  }

  /**
   * Get brews marked as favorites
   * @param filters - Optional filtering parameters
   * @returns Promise<BrewListResponse> - The list of favorite brews
   */
  async getFavoriteBrews(filters: Omit<BrewListFilters, 'favorites'> = {}): Promise<BrewListResponse> {
    return this.getBrews({ ...filters, favorites: true });
  }

  /**
   * Search brews by text query
   * @param query - The search query
   * @param filters - Optional additional filters
   * @returns Promise<BrewListResponse> - The matching brews
   */
  async searchBrews(query: string, filters: Omit<BrewListFilters, 'search'> = {}): Promise<BrewListResponse> {
    if (!query.trim()) {
      throw new BrewError('Search query is required', 400);
    }

    return this.getBrews({ ...filters, search: query.trim() });
  }

  /**
   * Client-side validation for brew data
   * @param brewData - The brew data to validate
   * @throws BrewError if validation fails
   */
  private validateBrewData(brewData: CreateBrewRequest): void {
    const errors: BrewValidationError[] = [];

    // Validate beans
    if (!brewData.beans) {
      errors.push({ field: 'beans', message: 'Coffee bean information is required' });
    } else {
      if (!brewData.beans.brand?.trim()) {
        errors.push({ field: 'beans.brand', message: 'Coffee brand is required' });
      }
      if (!brewData.beans.origin?.trim()) {
        errors.push({ field: 'beans.origin', message: 'Coffee origin is required' });
      }
      if (!brewData.beans.processingMethod) {
        errors.push({ field: 'beans.processingMethod', message: 'Processing method is required' });
      }
    }

    // Validate parameters
    if (!brewData.parameters) {
      errors.push({ field: 'parameters', message: 'Brewing parameters are required' });
    } else {
      if (!brewData.parameters.brewingMethod) {
        errors.push({ field: 'parameters.brewingMethod', message: 'Brewing method is required' });
      }
      if (!brewData.parameters.grinderModel?.trim()) {
        errors.push({ field: 'parameters.grinderModel', message: 'Grinder model is required' });
      }
      if (!brewData.parameters.grinderSetting || brewData.parameters.grinderSetting < 1 || brewData.parameters.grinderSetting > 40) {
        errors.push({ field: 'parameters.grinderSetting', message: 'Grinder setting must be between 1 and 40' });
      }
      if (!brewData.parameters.waterTemperature || brewData.parameters.waterTemperature < 70 || brewData.parameters.waterTemperature > 100) {
        errors.push({ field: 'parameters.waterTemperature', message: 'Water temperature must be between 70-100°C' });
      }
    }

    // Validate measurements
    if (!brewData.measurements) {
      errors.push({ field: 'measurements', message: 'Measurements are required' });
    } else {
      if (!brewData.measurements.coffeeBeansWeight || brewData.measurements.coffeeBeansWeight <= 0) {
        errors.push({ field: 'measurements.coffeeBeansWeight', message: 'Coffee weight must be greater than 0' });
      }
      if (!brewData.measurements.waterWeight || brewData.measurements.waterWeight <= 0) {
        errors.push({ field: 'measurements.waterWeight', message: 'Water weight must be greater than 0' });
      }
      if (brewData.measurements.coffeeBeansWeight > 100) {
        errors.push({ field: 'measurements.coffeeBeansWeight', message: 'Coffee weight seems unusually high (>100g)' });
      }
      if (brewData.measurements.waterWeight > 2000) {
        errors.push({ field: 'measurements.waterWeight', message: 'Water weight seems unusually high (>2000g)' });
      }
    }

    // Validate turbulence steps if provided
    if (brewData.turbulenceSteps) {
      brewData.turbulenceSteps.forEach((step, index) => {
        if (step.stepOrder <= 0) {
          errors.push({ 
            field: `turbulenceSteps[${index}].stepOrder`, 
            message: 'Step order must be greater than 0' 
          });
        }
        if (step.actionTime && step.actionTime < 0) {
          errors.push({ 
            field: `turbulenceSteps[${index}].actionTime`, 
            message: 'Action time cannot be negative' 
          });
        }
        if (step.volume && step.volume <= 0) {
          errors.push({ 
            field: `turbulenceSteps[${index}].volume`, 
            message: 'Volume must be greater than 0' 
          });
        }
      });
    }

    // Validate evaluation if provided
    if (brewData.evaluation) {
      switch (brewData.evaluation.type) {
        case 'quick':
          if (brewData.evaluation.overallQuality < 1 || brewData.evaluation.overallQuality > 10) {
            errors.push({ field: 'evaluation.overallQuality', message: 'Overall quality must be between 1-10' });
          }
          break;
        case 'sca':
          const scaEval = brewData.evaluation as SCAEvaluation;
          const scores = scaEval.scores;
          
          // Validate SCAA score range (6.00-9.00 in quarter-point increments)
          Object.entries(scores).forEach(([key, value]) => {
            const numValue = Number(value);
            if (numValue < 6.0 || numValue > 9.0) {
              errors.push({ field: `evaluation.scores.${key}`, message: `${key} score must be between 6.00-9.00` });
            }
            if ((numValue * 4) % 1 !== 0) {
              errors.push({ field: `evaluation.scores.${key}`, message: `${key} score must be in quarter-point increments` });
            }
          });
          
          // Validate SCAA defects structure
          if (scaEval.defects) {
            if (scaEval.defects.taints.count < 0 || scaEval.defects.taints.count > 10) {
              errors.push({ field: 'evaluation.defects.taints', message: 'Taints count must be between 0-10' });
            }
            if (scaEval.defects.faults.count < 0 || scaEval.defects.faults.count > 10) {
              errors.push({ field: 'evaluation.defects.faults', message: 'Faults count must be between 0-10' });
            }
          }
          break;
      }
    }

    if (errors.length > 0) {
      throw new BrewError('Validation failed', 400, errors);
    }
  }
}

// Singleton pattern for global brew service
let brewServiceInstance: BrewService | null = null;

export const createBrewService = (apiClient: ApiClient): BrewService => {
  brewServiceInstance = new BrewService(apiClient);
  return brewServiceInstance;
};

export const getBrewService = (): BrewService => {
  if (!brewServiceInstance) {
    throw new Error('Brew service not initialized. Call createBrewService first.');
  }
  return brewServiceInstance;
};