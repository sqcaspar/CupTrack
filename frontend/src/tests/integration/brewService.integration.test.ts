import { BrewService } from '../../services/brewService';
import { ApiClient } from '../../services/apiClient';
import { BrewRecord, CreateBrewRequest } from '../../types/brew';

// Mock API client for integration testing
const mockApiClient: jest.Mocked<ApiClient> = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

const createMockBrewData = (): CreateBrewRequest => ({
  beans: {
    brand: 'Ethiopian Coffee Co.',
    origin: 'Yirgacheffe',
    processingMethod: 'washed',
    altitude: 1800,
    roastingDate: '2024-01-10',
    roastingLevel: 'medium'
  },
  parameters: {
    brewingMethod: 'pour-over',
    grinderModel: 'Baratza Encore',
    grinderSetting: '15',
    waterTemperature: 92,
    filteringTools: 'Hario V60',
    waterQuality: 'filtered'
  },
  measurements: {
    coffeeBeansWeight: 20,
    waterWeight: 320,
    brewedCoffeeWeight: 280,
    tdsPercentage: 1.2
  },
  evaluation: {
    type: 'quick',
    overallQuality: 8,
    notes: 'Bright and fruity'
  }
});

const createMockBrewResponse = (): BrewRecord => ({
  id: 'brew-123',
  userId: 'user-123',
  brewNumber: '001',
  userName: 'Test User',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  isShared: false,
  isFavorite: false,
  turbulenceSteps: [],
  ...createMockBrewData(),
  measurements: {
    ...createMockBrewData().measurements,
    coffeeToWaterRatio: 16 // Auto-calculated
  }
});

describe('BrewService Integration Tests', () => {
  let brewService: BrewService;

  beforeEach(() => {
    jest.clearAllMocks();
    brewService = new BrewService(mockApiClient);
  });

  describe('Complete Brew Management Workflow', () => {
    test('should successfully create, retrieve, update, and delete a brew', async () => {
      const mockBrewData = createMockBrewData();
      const mockBrewResponse = createMockBrewResponse();

      // Test create brew
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: { brew: mockBrewResponse }
      });

      const createdBrew = await brewService.createBrew(mockBrewData);
      expect(createdBrew).toEqual(mockBrewResponse);
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/brews', {
        ...mockBrewData,
        measurements: {
          ...mockBrewData.measurements,
          coffeeToWaterRatio: 16 // Auto-calculated ratio
        }
      });

      // Test get brew
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: { brew: mockBrewResponse }
      });

      const retrievedBrew = await brewService.getBrew('brew-123');
      expect(retrievedBrew).toEqual(mockBrewResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/brews/brew-123');

      // Test update brew
      const updateData = { isFavorite: true };
      const updatedBrewResponse = { ...mockBrewResponse, isFavorite: true };
      
      mockApiClient.put.mockResolvedValueOnce({
        success: true,
        data: { brew: updatedBrewResponse }
      });

      const updatedBrew = await brewService.updateBrew('brew-123', updateData);
      expect(updatedBrew.isFavorite).toBe(true);
      expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/brews/brew-123', updateData);

      // Test delete brew
      mockApiClient.delete.mockResolvedValueOnce({
        success: true
      });

      await brewService.deleteBrew('brew-123');
      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/v1/brews/brew-123');
    });

    test('should handle brew listing with filtering and pagination', async () => {
      const mockBrewsList = [
        createMockBrewResponse(),
        { ...createMockBrewResponse(), id: 'brew-456', brewNumber: '002' }
      ];

      const mockListResponse = {
        brews: mockBrewsList,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 2,
          hasMore: false
        },
        filters: {
          appliedFilters: {},
          availableFilters: {
            brewingMethods: ['pour-over', 'french-press'],
            brands: ['Ethiopian Coffee Co.'],
            origins: ['Yirgacheffe']
          }
        }
      };

      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: mockListResponse
      });

      const filters = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
        search: 'Ethiopian'
      };

      const result = await brewService.getBrews(filters);
      
      expect(result).toEqual(mockListResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=Ethiopian')
      );
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page=1')
      );
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      );
    });

    test('should handle brew duplication workflow', async () => {
      const originalBrew = createMockBrewResponse();
      const duplicatedBrew = {
        ...originalBrew,
        id: 'brew-duplicate-789',
        brewNumber: '003',
        createdAt: new Date().toISOString(),
        evaluation: undefined // Duplicated brews don't copy evaluation
      };

      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: { brew: duplicatedBrew }
      });

      const result = await brewService.duplicateBrew('brew-123');
      
      expect(result).toEqual(duplicatedBrew);
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/brews/brew-123/duplicate');
    });

    test('should handle favorites workflow', async () => {
      const mockBrew = createMockBrewResponse();
      
      // Test adding to favorites
      const favoriteBrewResponse = { ...mockBrew, isFavorite: true };
      mockApiClient.put.mockResolvedValueOnce({
        success: true,
        data: { brew: favoriteBrewResponse }
      });

      const favoriteResult = await brewService.toggleFavorite('brew-123', true);
      expect(favoriteResult.isFavorite).toBe(true);

      // Test getting favorites list
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [favoriteBrewResponse],
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 1, hasMore: false },
          filters: { appliedFilters: { favorites: true }, availableFilters: {} }
        }
      });

      const favoritesResult = await brewService.getFavoriteBrews();
      expect(favoritesResult.brews).toHaveLength(1);
      expect(favoritesResult.brews[0].isFavorite).toBe(true);
    });

    test('should handle search workflow', async () => {
      const mockSearchResults = [
        createMockBrewResponse(),
        { ...createMockBrewResponse(), beans: { ...createMockBrewResponse().beans, brand: 'Ethiopian Premium' }}
      ];

      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: mockSearchResults,
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 2, hasMore: false },
          filters: { appliedFilters: { search: 'Ethiopian' }, availableFilters: {} }
        }
      });

      const searchResult = await brewService.searchBrews('Ethiopian');
      
      expect(searchResult.brews).toHaveLength(2);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=Ethiopian')
      );

      // Test empty search query validation
      await expect(brewService.searchBrews('')).rejects.toThrow('Search query is required');
      await expect(brewService.searchBrews('   ')).rejects.toThrow('Search query is required');
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle validation errors during brew creation', async () => {
      const invalidBrewData = {
        ...createMockBrewData(),
        beans: {
          ...createMockBrewData().beans,
          brand: '' // Invalid: empty brand
        }
      };

      await expect(brewService.createBrew(invalidBrewData)).rejects.toThrow('Validation failed');
    });

    test('should handle API errors gracefully', async () => {
      // Test network error
      mockApiClient.get.mockRejectedValueOnce(new Error('Network timeout'));
      
      await expect(brewService.getBrew('brew-123')).rejects.toThrow('Failed to fetch brew');

      // Test 404 error
      mockApiClient.get.mockRejectedValueOnce({
        response: { status: 404 }
      });

      await expect(brewService.getBrew('brew-nonexistent')).rejects.toThrow('Brew not found');

      // Test server error during creation
      mockApiClient.post.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      });

      await expect(brewService.createBrew(createMockBrewData())).rejects.toThrow(
        'Internal server error'
      );
    });

    test('should handle invalid server responses', async () => {
      // Test missing data in response
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {} // Missing brew data
      });

      await expect(brewService.getBrew('brew-123')).rejects.toThrow('Brew not found');

      // Test malformed response
      mockApiClient.get.mockResolvedValueOnce({
        success: false
      });

      await expect(brewService.getBrews()).rejects.toThrow('Invalid response from server');
    });
  });

  describe('Data Validation and Processing', () => {
    test('should calculate coffee-to-water ratio correctly during creation', async () => {
      const brewData = {
        ...createMockBrewData(),
        measurements: {
          coffeeBeansWeight: 25,
          waterWeight: 400,
          brewedCoffeeWeight: 350,
          tdsPercentage: 1.3
        }
      };

      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: { brew: createMockBrewResponse() }
      });

      await brewService.createBrew(brewData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/brews', {
        ...brewData,
        measurements: {
          ...brewData.measurements,
          coffeeToWaterRatio: 16 // 400/25 = 16
        }
      });
    });

    test('should recalculate ratio when measurements are updated', async () => {
      const updateData = {
        measurements: {
          coffeeBeansWeight: 30,
          waterWeight: 450,
          brewedCoffeeWeight: 400
        }
      };

      mockApiClient.put.mockResolvedValueOnce({
        success: true,
        data: { brew: createMockBrewResponse() }
      });

      await brewService.updateBrew('brew-123', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/v1/brews/brew-123', {
        measurements: {
          ...updateData.measurements,
          coffeeToWaterRatio: 15 // 450/30 = 15
        }
      });
    });

    test('should validate all required fields during creation', async () => {
      // Test missing beans
      const noBeans = { ...createMockBrewData() };
      delete (noBeans as any).beans;
      await expect(brewService.createBrew(noBeans)).rejects.toThrow('Validation failed');

      // Test missing parameters
      const noParams = { ...createMockBrewData() };
      delete (noParams as any).parameters;
      await expect(brewService.createBrew(noParams)).rejects.toThrow('Validation failed');

      // Test missing measurements
      const noMeasurements = { ...createMockBrewData() };
      delete (noMeasurements as any).measurements;
      await expect(brewService.createBrew(noMeasurements)).rejects.toThrow('Validation failed');

      // Test invalid water temperature
      const invalidTemp = {
        ...createMockBrewData(),
        parameters: {
          ...createMockBrewData().parameters,
          waterTemperature: 150 // Too high
        }
      };
      await expect(brewService.createBrew(invalidTemp)).rejects.toThrow('Validation failed');
    });

    test('should validate turbulence steps when provided', async () => {
      const invalidTurbulence = {
        ...createMockBrewData(),
        turbulenceSteps: [
          {
            stepOrder: 0, // Invalid: should be > 0
            actionType: 'bloom' as const,
            description: 'Invalid step',
            actionTime: -5, // Invalid: negative time
            volume: 0, // Invalid: should be > 0
            technique: 'pour'
          }
        ]
      };

      await expect(brewService.createBrew(invalidTurbulence)).rejects.toThrow('Validation failed');
    });

    test('should validate SCA evaluation scores when provided', async () => {
      const invalidSCAScores = {
        ...createMockBrewData(),
        evaluation: {
          type: 'sca' as const,
          scores: {
            aroma: 11, // Invalid: > 10
            flavor: 0, // Invalid: < 1
            aftertaste: 7.5,
            acidity: 8.0,
            body: 7.0,
            balance: 8.0,
            overall: 8.0
          },
          defects: -1, // Invalid: negative defects
          notes: 'Invalid scores'
        }
      };

      await expect(brewService.createBrew(invalidSCAScores)).rejects.toThrow('Validation failed');
    });
  });

  describe('Query Parameter Handling', () => {
    test('should properly encode query parameters', async () => {
      const filters = {
        page: 2,
        limit: 10,
        sortBy: 'quality' as const,
        sortOrder: 'asc' as const,
        search: 'Ethiopian Coffee & Co.',
        brewingMethod: 'pour-over',
        favorites: true
      };

      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [],
          pagination: { currentPage: 2, totalPages: 5, totalRecords: 50, hasMore: true },
          filters: { appliedFilters: filters, availableFilters: {} }
        }
      });

      await brewService.getBrews(filters);

      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('sortBy=quality');
      expect(calledUrl).toContain('sortOrder=asc');
      expect(calledUrl).toContain('search=Ethiopian+Coffee+%26+Co.');
      expect(calledUrl).toContain('brewingMethod=pour-over');
      expect(calledUrl).toContain('favorites=true');
    });

    test('should handle undefined and null filter values', async () => {
      const filters = {
        page: 1,
        limit: 20,
        search: undefined,
        brewingMethod: null,
        dateFrom: '',
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const
      };

      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [],
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, hasMore: false },
          filters: { appliedFilters: {}, availableFilters: {} }
        }
      });

      await brewService.getBrews(filters);

      const calledUrl = mockApiClient.get.mock.calls[0][0];
      expect(calledUrl).not.toContain('search=');
      expect(calledUrl).not.toContain('brewingMethod=');
      expect(calledUrl).not.toContain('dateFrom=');
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=20');
    });
  });
});