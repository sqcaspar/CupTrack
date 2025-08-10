import { BrewService } from '../brewService';
import { ApiClient } from '../apiClient';
import { 
  BrewRecord, 
  CreateBrewRequest, 
  UpdateBrewRequest,
  BrewListFilters,
  BrewError,
  calculateBrewRatio,
  calculateSCAFinalScore 
} from '../../types/brew';

// Mock the ApiClient
jest.mock('../apiClient');

describe('BrewService', () => {
  let brewService: BrewService;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({ baseURL: 'http://test', timeout: 5000, retries: 3 }) as jest.Mocked<ApiClient>;
    brewService = new BrewService(mockApiClient);
    jest.clearAllMocks();
  });

  describe('createBrew', () => {
    const validCreateRequest: CreateBrewRequest = {
      userName: 'Morning Brew',
      beans: {
        brand: 'Blue Bottle Coffee',
        origin: 'Ethiopia Yirgacheffe',
        processingMethod: 'washed',
        altitude: 1800,
        roastingLevel: 'light'
      },
      parameters: {
        brewingMethod: 'pour-over',
        grinderModel: 'Baratza Encore',
        grinderSetting: '15',
        waterTemperature: 94.5,
        filteringTools: 'V60 paper filter'
      },
      measurements: {
        coffeeBeansWeight: 22.0,
        waterWeight: 350.0,
        brewedCoffeeWeight: 320.0,
        tdsPercentage: 1.35
      },
      evaluation: {
        type: 'quick',
        overallQuality: 8.5,
        notes: 'Bright acidity, floral notes'
      }
    };

    const mockBrewResponse: BrewRecord = {
      id: 'brew-123',
      userId: 'user-456',
      brewNumber: 'B-2025-001',
      userName: 'Morning Brew',
      createdAt: '2025-08-05T08:15:00Z',
      updatedAt: '2025-08-05T08:15:00Z',
      isShared: false,
      isFavorite: false,
      beans: validCreateRequest.beans,
      parameters: validCreateRequest.parameters,
      turbulenceSteps: [],
      measurements: {
        ...validCreateRequest.measurements,
        coffeeToWaterRatio: 15.91
      },
      evaluation: validCreateRequest.evaluation
    };

    it('should create a brew successfully', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: { brew: mockBrewResponse }
      });

      const result = await brewService.createBrew(validCreateRequest);

      // Expect the call to include calculated ratio
      const expectedRequest = {
        ...validCreateRequest,
        measurements: {
          ...validCreateRequest.measurements,
          coffeeToWaterRatio: 15.91
        }
      };
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/brews', expectedRequest);
      expect(result).toEqual(mockBrewResponse);
    });

    it('should handle validation errors from API', async () => {
      const validationError = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid brew data',
        details: [
          { field: 'beans.brand', message: 'Coffee brand is required' }
        ]
      };

      mockApiClient.post.mockRejectedValue({
        response: { status: 400, data: validationError }
      });

      await expect(brewService.createBrew(validCreateRequest))
        .rejects.toThrow('Invalid brew data');
    });

    it('should validate required fields locally', async () => {
      const invalidRequest: any = {
        // Missing required beans data
        parameters: validCreateRequest.parameters,
        measurements: validCreateRequest.measurements
      };

      await expect(brewService.createBrew(invalidRequest))
        .rejects.toThrow(BrewError);
    });
  });

  describe('getBrew', () => {
    const mockBrewId = 'brew-123';

    it('should fetch a specific brew successfully', async () => {
      const mockBrew: BrewRecord = {
        id: mockBrewId,
        userId: 'user-456',
        brewNumber: 'B-2025-001',
        createdAt: '2025-08-05T08:15:00Z',
        updatedAt: '2025-08-05T08:15:00Z',
        isShared: false,
        isFavorite: false,
        beans: {
          brand: 'Test Coffee',
          origin: 'Test Origin',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test Grinder',
          grinderSetting: '15',
          waterTemperature: 92
        },
        turbulenceSteps: [],
        measurements: {
          coffeeBeansWeight: 20,
          waterWeight: 300,
          coffeeToWaterRatio: 15
        }
      };

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: { brew: mockBrew }
      });

      const result = await brewService.getBrew(mockBrewId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/v1/brews/${mockBrewId}`);
      expect(result).toEqual(mockBrew);
    });

    it('should handle not found errors', async () => {
      mockApiClient.get.mockRejectedValue({
        response: { 
          status: 404, 
          data: { error: 'NOT_FOUND', message: 'Brew not found' }
        }
      });

      await expect(brewService.getBrew(mockBrewId))
        .rejects.toThrow('Brew not found');
    });
  });

  describe('getBrews', () => {
    it('should fetch brews with default pagination', async () => {
      const mockResponse = {
        success: true,
        data: {
          brews: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalRecords: 0,
            hasNextPage: false,
            hasPreviousPage: false
          },
          filters: {
            appliedFilters: {},
            availableFilters: {
              methods: ['pour-over', 'french-press', 'aeropress'],
              dateRange: {
                earliest: '2025-01-01T00:00:00Z',
                latest: '2025-08-05T23:59:59Z'
              }
            }
          }
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await brewService.getBrews();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/brews?page=1&limit=20&sortBy=createdAt&sortOrder=desc');
      expect(result).toEqual(mockResponse.data);
    });

    it('should apply filters and pagination parameters', async () => {
      const filters: BrewListFilters = {
        page: 2,
        limit: 10,
        method: 'pour-over',
        favorites: true,
        sortBy: 'quality',
        sortOrder: 'asc',
        search: 'Blue Bottle'
      };

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: { brews: [], pagination: {}, filters: {} }
      });

      await brewService.getBrews(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/brews?page=2&limit=10&sortBy=quality&sortOrder=asc&method=pour-over&favorites=true&search=Blue+Bottle'
      );
    });
  });

  describe('updateBrew', () => {
    const brewId = 'brew-123';
    const updateData: UpdateBrewRequest = {
      userName: 'Updated Morning Brew',
      isFavorite: true,
      evaluation: {
        type: 'quick',
        overallQuality: 9.0,
        notes: 'Even better after adjustment'
      }
    };

    it('should update a brew successfully', async () => {
      const updatedBrew: BrewRecord = {
        id: brewId,
        userId: 'user-456',
        brewNumber: 'B-2025-001',
        userName: 'Updated Morning Brew',
        createdAt: '2025-08-05T08:15:00Z',
        updatedAt: '2025-08-05T09:00:00Z',
        isShared: false,
        isFavorite: true,
        beans: { brand: 'Test', origin: 'Test', processingMethod: 'washed' },
        parameters: { 
          brewingMethod: 'pour-over', 
          grinderModel: 'Test', 
          grinderSetting: '15', 
          waterTemperature: 92 
        },
        turbulenceSteps: [],
        measurements: { 
          coffeeBeansWeight: 20, 
          waterWeight: 300, 
          coffeeToWaterRatio: 15 
        },
        evaluation: updateData.evaluation
      };

      mockApiClient.put.mockResolvedValue({
        success: true,
        data: { brew: updatedBrew }
      });

      const result = await brewService.updateBrew(brewId, updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/v1/brews/${brewId}`, updateData);
      expect(result).toEqual(updatedBrew);
    });
  });

  describe('deleteBrew', () => {
    it('should delete a brew successfully', async () => {
      const brewId = 'brew-123';

      mockApiClient.delete.mockResolvedValue({
        success: true,
        message: 'Brew deleted successfully'
      });

      await brewService.deleteBrew(brewId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/v1/brews/${brewId}`);
    });
  });

  describe('duplicateBrew', () => {
    it('should duplicate a brew successfully', async () => {
      const brewId = 'brew-123';
      const duplicatedBrew: BrewRecord = {
        id: 'brew-456',
        userId: 'user-456',
        brewNumber: 'B-2025-002',
        userName: 'Morning Brew (Copy)',
        createdAt: '2025-08-05T09:00:00Z',
        updatedAt: '2025-08-05T09:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: { brand: 'Test', origin: 'Test', processingMethod: 'washed' },
        parameters: { 
          brewingMethod: 'pour-over', 
          grinderModel: 'Test', 
          grinderSetting: '15', 
          waterTemperature: 92 
        },
        turbulenceSteps: [],
        measurements: { 
          coffeeBeansWeight: 20, 
          waterWeight: 300, 
          coffeeToWaterRatio: 15 
        }
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: { brew: duplicatedBrew }
      });

      const result = await brewService.duplicateBrew(brewId);

      expect(mockApiClient.post).toHaveBeenCalledWith(`/api/v1/brews/${brewId}/duplicate`);
      expect(result).toEqual(duplicatedBrew);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', async () => {
      const brewId = 'brew-123';
      const updatedBrew: BrewRecord = {
        id: brewId,
        userId: 'user-456',
        brewNumber: 'B-2025-001',
        createdAt: '2025-08-05T08:15:00Z',
        updatedAt: '2025-08-05T09:00:00Z',
        isShared: false,
        isFavorite: true,
        beans: { brand: 'Test', origin: 'Test', processingMethod: 'washed' },
        parameters: { 
          brewingMethod: 'pour-over', 
          grinderModel: 'Test', 
          grinderSetting: '15', 
          waterTemperature: 92 
        },
        turbulenceSteps: [],
        measurements: { 
          coffeeBeansWeight: 20, 
          waterWeight: 300, 
          coffeeToWaterRatio: 15 
        }
      };

      mockApiClient.put.mockResolvedValue({
        success: true,
        data: { brew: updatedBrew }
      });

      const result = await brewService.toggleFavorite(brewId, true);

      expect(mockApiClient.put).toHaveBeenCalledWith(`/api/v1/brews/${brewId}`, { isFavorite: true });
      expect(result).toEqual(updatedBrew);
    });
  });
});

describe('Brew Calculation Utilities', () => {
  describe('calculateBrewRatio', () => {
    it('should calculate correct brew ratio', () => {
      expect(calculateBrewRatio(350, 22)).toBe(15.91);
      expect(calculateBrewRatio(400, 25)).toBe(16);
      expect(calculateBrewRatio(300, 20)).toBe(15);
    });

    it('should throw error for invalid coffee weight', () => {
      expect(() => calculateBrewRatio(350, 0)).toThrow('Coffee weight must be greater than 0');
      expect(() => calculateBrewRatio(350, -5)).toThrow('Coffee weight must be greater than 0');
    });
  });

  describe('calculateSCAFinalScore', () => {
    it('should calculate correct SCA final score', () => {
      const scores = {
        aroma: 8.0,
        flavor: 8.5,
        aftertaste: 7.5,
        acidity: 8.0,
        body: 7.0,
        balance: 8.0,
        overall: 8.0
      };

      expect(calculateSCAFinalScore(scores, 0)).toBe(55);  // Sum of all scores
      expect(calculateSCAFinalScore(scores, 2)).toBe(53);  // Sum minus 2 defects
      expect(calculateSCAFinalScore(scores, 60)).toBe(0);  // Cannot go below 0
    });
  });
});