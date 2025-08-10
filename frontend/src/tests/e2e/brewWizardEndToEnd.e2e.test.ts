// TASK-006C: Brew Entry Integration Testing - TDD Core
// End-to-end tests validating complete wizard to backend integration
// Tests real API calls, data persistence, and cross-platform functionality

import { ApiClient } from '../../services/apiClient';
import { BrewService, createBrewService } from '../../services/brewService';
import { CreateBrewRequest, BrewRecord, BrewError } from '../../types/brew';

// Mock the actual HTTP client for controlled testing
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

jest.mock('axios', () => ({
  create: () => mockHttpClient,
  isAxiosError: jest.fn()
}));

describe('Brew Wizard End-to-End Integration Tests - TDD Core', () => {
  let apiClient: ApiClient;
  let brewService: BrewService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create API client and service instances
    apiClient = new ApiClient('http://localhost:3001', 'test-token');
    brewService = createBrewService(apiClient);
  });

  describe('Complete Brew Creation Workflow', () => {
    test('should create brew with complete data through full API flow', async () => {
      const validBrewData: CreateBrewRequest = {
        userName: 'Integration Test Brew',
        beans: {
          brand: 'Ethiopian Coffee Co',
          origin: 'Yirgacheffe', 
          processingMethod: 'washed',
          altitude: 1800,
          roastingDate: '2024-01-15',
          roastingLevel: 'medium'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Baratza Encore',
          grinderSetting: '15',
          waterTemperature: 93,
          filteringTools: 'Hario V60',
          waterQuality: 'filtered'
        },
        turbulenceSteps: [
          {
            stepOrder: 1,
            actionType: 'bloom',
            actionTime: 30,
            volume: 60,
            technique: 'circular pour',
            description: 'Initial bloom with circular motion'
          },
          {
            stepOrder: 2,
            actionType: 'main-pour',
            actionTime: 180,
            volume: 290,
            technique: 'steady center pour',
            description: 'Main pour in steady stream'
          }
        ],
        measurements: {
          coffeeBeansWeight: 22,
          waterWeight: 350,
          brewedCoffeeWeight: 310,
          tdsPercentage: 1.35
        },
        evaluation: {
          type: 'quick',
          overallQuality: 8,
          notes: 'Bright acidity, floral aroma, clean finish'
        }
      };

      const expectedBrewRecord: BrewRecord = {
        id: 'brew-integration-123',
        userId: 'user-integration-123',
        brewNumber: 'B-2024-001',
        userName: validBrewData.userName!,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: validBrewData.beans,
        parameters: validBrewData.parameters,
        turbulenceSteps: validBrewData.turbulenceSteps!,
        measurements: {
          ...validBrewData.measurements,
          coffeeToWaterRatio: 15.91 // 350/22 = 15.91
        },
        evaluation: validBrewData.evaluation
      };

      // Mock successful API response
      mockHttpClient.post.mockResolvedValue({
        data: {
          success: true,
          data: expectedBrewRecord
        },
        status: 201
      });

      // Execute the service call
      const result = await brewService.createBrew(validBrewData);

      // Verify API call was made correctly
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/brews',
        expect.objectContaining({
          userName: 'Integration Test Brew',
          beans: expect.objectContaining({
            brand: 'Ethiopian Coffee Co',
            origin: 'Yirgacheffe',
            processingMethod: 'washed'
          }),
          parameters: expect.objectContaining({
            brewingMethod: 'pour-over',
            grinderModel: 'Baratza Encore',
            waterTemperature: 93
          }),
          measurements: expect.objectContaining({
            coffeeBeansWeight: 22,
            waterWeight: 350,
            coffeeToWaterRatio: 15.91
          }),
          turbulenceSteps: expect.arrayContaining([
            expect.objectContaining({
              stepOrder: 1,
              actionType: 'bloom',
              description: 'Initial bloom with circular motion'
            }),
            expect.objectContaining({
              stepOrder: 2,
              actionType: 'main-pour',
              description: 'Main pour in steady stream'
            })
          ]),
          evaluation: expect.objectContaining({
            type: 'quick',
            overallQuality: 8
          })
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          })
        })
      );

      // Verify returned data matches expected structure
      expect(result).toEqual(expectedBrewRecord);
      expect(result.measurements.coffeeToWaterRatio).toBe(15.91);
      expect(result.turbulenceSteps).toHaveLength(2);
      expect(result.evaluation?.type).toBe('quick');
    });

    test('should create brew with minimal required data', async () => {
      const minimalBrewData: CreateBrewRequest = {
        beans: {
          brand: 'Simple Coffee',
          origin: 'Brazil',
          processingMethod: 'natural'
        },
        parameters: {
          brewingMethod: 'french-press',
          grinderModel: 'Manual Grinder',
          grinderSetting: 'coarse',
          waterTemperature: 92
        },
        measurements: {
          coffeeBeansWeight: 30,
          waterWeight: 450
        }
        // No userName, turbulenceSteps, evaluation
      };

      const expectedMinimalRecord: BrewRecord = {
        id: 'brew-minimal-123',
        userId: 'user-123',
        brewNumber: 'B-2024-002',
        userName: undefined,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: minimalBrewData.beans,
        parameters: minimalBrewData.parameters,
        turbulenceSteps: [],
        measurements: {
          ...minimalBrewData.measurements,
          coffeeToWaterRatio: 15.0 // 450/30 = 15.0
        },
        evaluation: undefined
      };

      mockHttpClient.post.mockResolvedValue({
        data: {
          success: true,
          data: expectedMinimalRecord
        },
        status: 201
      });

      const result = await brewService.createBrew(minimalBrewData);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/brews',
        expect.objectContaining({
          beans: minimalBrewData.beans,
          parameters: minimalBrewData.parameters,
          measurements: expect.objectContaining({
            coffeeToWaterRatio: 15.0
          }),
          turbulenceSteps: [],
          // userName and evaluation should be undefined
        }),
        expect.any(Object)
      );

      expect(result.turbulenceSteps).toEqual([]);
      expect(result.evaluation).toBeUndefined();
      expect(result.measurements.coffeeToWaterRatio).toBe(15.0);
    });

    test('should handle SCA evaluation with score calculation', async () => {
      const scaBrewData: CreateBrewRequest = {
        beans: {
          brand: 'Specialty Coffee',
          origin: 'Colombia',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Professional Grinder',
          grinderSetting: '12',
          waterTemperature: 94
        },
        measurements: {
          coffeeBeansWeight: 18,
          waterWeight: 270
        },
        evaluation: {
          type: 'sca',
          scores: {
            aroma: 8.5,
            flavor: 8.0,
            aftertaste: 7.5,
            acidity: 8.0,
            body: 7.0,
            balance: 8.0,
            overall: 8.0
          },
          defects: 1,
          notes: 'Professional cupping evaluation'
        }
      };

      const expectedSCARecord: BrewRecord = {
        id: 'brew-sca-123',
        userId: 'user-123',
        brewNumber: 'B-2024-003',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: scaBrewData.beans,
        parameters: scaBrewData.parameters,
        turbulenceSteps: [],
        measurements: {
          ...scaBrewData.measurements,
          coffeeToWaterRatio: 15.0 // 270/18 = 15.0
        },
        evaluation: scaBrewData.evaluation
      };

      mockHttpClient.post.mockResolvedValue({
        data: {
          success: true,
          data: expectedSCARecord
        },
        status: 201
      });

      const result = await brewService.createBrew(scaBrewData);

      // Verify SCA evaluation data is preserved
      expect(result.evaluation?.type).toBe('sca');
      if (result.evaluation?.type === 'sca') {
        expect(result.evaluation.scores.aroma).toBe(8.5);
        expect(result.evaluation.defects).toBe(1);
        expect(result.evaluation.notes).toBe('Professional cupping evaluation');
        
        // Total score should be sum of all scores: 55.0
        const totalScore = Object.values(result.evaluation.scores).reduce((sum, score) => sum + score, 0);
        expect(totalScore).toBe(55.0);
      }
    });
  });

  describe('Error Handling and Validation', () => {
    test('should handle backend validation errors', async () => {
      const invalidBrewData: CreateBrewRequest = {
        beans: {
          brand: '', // Invalid: empty brand
          origin: 'Test Origin',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test Grinder',
          grinderSetting: '10',
          waterTemperature: 150 // Invalid: too high
        },
        measurements: {
          coffeeBeansWeight: 0, // Invalid: zero weight
          waterWeight: 300
        }
      };

      // Mock backend validation error response
      mockHttpClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            success: false,
            error: 'Brew validation failed',
            validationErrors: [
              { field: 'beans.brand', message: 'Brand is required', value: '' },
              { field: 'parameters.waterTemperature', message: 'Water temperature must be between 80-100°C', value: 150 },
              { field: 'measurements.coffeeBeansWeight', message: 'Coffee weight must be greater than 0', value: 0 }
            ]
          }
        }
      });

      // Should throw BrewError with validation details
      await expect(brewService.createBrew(invalidBrewData)).rejects.toThrow(BrewError);

      try {
        await brewService.createBrew(invalidBrewData);
      } catch (error) {
        expect(error).toBeInstanceOf(BrewError);
        if (error instanceof BrewError) {
          expect(error.message).toContain('Brew validation failed');
          expect(error.statusCode).toBe(400);
          expect(error.validationErrors).toHaveLength(3);
          expect(error.validationErrors).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'beans.brand',
                message: 'Brand is required'
              }),
              expect.objectContaining({
                field: 'parameters.waterTemperature',
                message: 'Water temperature must be between 80-100°C'
              }),
              expect.objectContaining({
                field: 'measurements.coffeeBeansWeight',
                message: 'Coffee weight must be greater than 0'
              })
            ])
          );
        }
      }
    });

    test('should handle network connectivity errors', async () => {
      const validBrewData: CreateBrewRequest = {
        beans: {
          brand: 'Network Test Coffee',
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

      // Mock network error
      mockHttpClient.post.mockRejectedValue(new Error('Network Error: Connection failed'));

      await expect(brewService.createBrew(validBrewData)).rejects.toThrow('Failed to create brew');
    });

    test('should handle server errors gracefully', async () => {
      const validBrewData: CreateBrewRequest = {
        beans: {
          brand: 'Server Error Test',
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

      // Mock server error response
      mockHttpClient.post.mockRejectedValue({
        response: {
          status: 500,
          data: {
            success: false,
            error: 'Internal server error'
          }
        }
      });

      await expect(brewService.createBrew(validBrewData)).rejects.toThrow('Failed to create brew');
    });

    test('should handle authentication errors', async () => {
      const validBrewData: CreateBrewRequest = {
        beans: {
          brand: 'Auth Test Coffee',
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

      // Mock authentication error
      mockHttpClient.post.mockRejectedValue({
        response: {
          status: 401,
          data: {
            success: false,
            error: 'Authentication required'
          }
        }
      });

      await expect(brewService.createBrew(validBrewData)).rejects.toThrow('Failed to create brew');
    });
  });

  describe('Data Persistence and Retrieval Integration', () => {
    test('should create brew and then retrieve it successfully', async () => {
      const brewData: CreateBrewRequest = {
        userName: 'Persistence Test Brew',
        beans: {
          brand: 'Test Coffee Brand',
          origin: 'Test Origin',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test Grinder',
          grinderSetting: '12',
          waterTemperature: 92
        },
        measurements: {
          coffeeBeansWeight: 25,
          waterWeight: 400
        }
      };

      const createdBrew: BrewRecord = {
        id: 'brew-persistence-123',
        userId: 'user-123',
        brewNumber: 'B-2024-004',
        userName: brewData.userName!,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: brewData.beans,
        parameters: brewData.parameters,
        turbulenceSteps: [],
        measurements: {
          ...brewData.measurements,
          coffeeToWaterRatio: 16.0 // 400/25 = 16.0
        },
        evaluation: undefined
      };

      // Mock successful creation
      mockHttpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: createdBrew
        },
        status: 201
      });

      // Mock successful retrieval
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: createdBrew
        },
        status: 200
      });

      // Create the brew
      const createResult = await brewService.createBrew(brewData);
      expect(createResult.id).toBe('brew-persistence-123');

      // Retrieve the brew
      const retrieveResult = await brewService.getBrew('brew-persistence-123');
      expect(retrieveResult).toEqual(createdBrew);
      expect(retrieveResult.userName).toBe('Persistence Test Brew');
      expect(retrieveResult.measurements.coffeeToWaterRatio).toBe(16.0);

      // Verify API calls
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/v1/brews',
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/brews/brew-persistence-123');
    });

    test('should create multiple brews and list them with pagination', async () => {
      const brew1Data: CreateBrewRequest = {
        userName: 'First Test Brew',
        beans: { brand: 'Coffee A', origin: 'Origin A', processingMethod: 'washed' },
        parameters: { brewingMethod: 'pour-over', grinderModel: 'Grinder A', grinderSetting: '10', waterTemperature: 90 },
        measurements: { coffeeBeansWeight: 20, waterWeight: 300 }
      };

      const brew2Data: CreateBrewRequest = {
        userName: 'Second Test Brew', 
        beans: { brand: 'Coffee B', origin: 'Origin B', processingMethod: 'natural' },
        parameters: { brewingMethod: 'french-press', grinderModel: 'Grinder B', grinderSetting: 'coarse', waterTemperature: 92 },
        measurements: { coffeeBeansWeight: 30, waterWeight: 450 }
      };

      const brew1Record: BrewRecord = {
        id: 'brew-list-1',
        userId: 'user-123',
        brewNumber: 'B-2024-005',
        userName: brew1Data.userName!,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: brew1Data.beans,
        parameters: brew1Data.parameters,
        turbulenceSteps: [],
        measurements: { ...brew1Data.measurements, coffeeToWaterRatio: 15.0 }
      };

      const brew2Record: BrewRecord = {
        id: 'brew-list-2', 
        userId: 'user-123',
        brewNumber: 'B-2024-006',
        userName: brew2Data.userName!,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: brew2Data.beans,
        parameters: brew2Data.parameters,
        turbulenceSteps: [],
        measurements: { ...brew2Data.measurements, coffeeToWaterRatio: 15.0 }
      };

      // Mock successful creation of both brews
      mockHttpClient.post
        .mockResolvedValueOnce({
          data: { success: true, data: brew1Record },
          status: 201
        })
        .mockResolvedValueOnce({
          data: { success: true, data: brew2Record },
          status: 201
        });

      // Mock successful list retrieval
      mockHttpClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            brews: [brew2Record, brew1Record], // Newest first
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalRecords: 2,
              hasNextPage: false,
              hasPreviousPage: false
            },
            filters: {
              appliedFilters: {},
              availableFilters: {
                methods: ['pour-over', 'french-press'],
                dateRange: {
                  earliest: '2024-01-15T09:00:00Z',
                  latest: '2024-01-15T10:00:00Z'
                }
              }
            }
          }
        },
        status: 200
      });

      // Create both brews
      const result1 = await brewService.createBrew(brew1Data);
      const result2 = await brewService.createBrew(brew2Data);

      expect(result1.userName).toBe('First Test Brew');
      expect(result2.userName).toBe('Second Test Brew');

      // List brews
      const listResult = await brewService.getBrews({ page: 1, limit: 20 });

      expect(listResult.brews).toHaveLength(2);
      expect(listResult.brews[0].userName).toBe('Second Test Brew'); // Newest first
      expect(listResult.brews[1].userName).toBe('First Test Brew');
      expect(listResult.pagination.totalRecords).toBe(2);
      expect(listResult.filters.availableFilters.methods).toContain('pour-over');
      expect(listResult.filters.availableFilters.methods).toContain('french-press');

      // Verify API calls
      expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/brews?')
      );
    });
  });

  describe('Advanced Features Integration', () => {
    test('should handle duplicate brew functionality', async () => {
      const originalBrew: BrewRecord = {
        id: 'original-brew-123',
        userId: 'user-123',
        brewNumber: 'B-2024-007',
        userName: 'Original Brew',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: {
          brand: 'Duplicate Test Coffee',
          origin: 'Test Origin',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test Grinder',
          grinderSetting: '12',
          waterTemperature: 92
        },
        turbulenceSteps: [
          {
            stepOrder: 1,
            actionType: 'bloom',
            actionTime: 30,
            volume: 50,
            technique: 'center pour',
            description: 'Initial bloom'
          }
        ],
        measurements: {
          coffeeBeansWeight: 22,
          waterWeight: 330,
          coffeeToWaterRatio: 15.0
        },
        evaluation: {
          type: 'quick',
          overallQuality: 7,
          notes: 'Original evaluation'
        }
      };

      const duplicatedBrew: BrewRecord = {
        ...originalBrew,
        id: 'duplicated-brew-456',
        brewNumber: 'B-2024-008',
        userName: 'Copy of Original Brew',
        createdAt: '2024-01-15T11:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z',
        evaluation: undefined // Evaluation should not be duplicated
      };

      // Mock duplicate API call
      mockHttpClient.post.mockResolvedValue({
        data: {
          success: true,
          data: duplicatedBrew,
          message: 'Brew duplicated successfully'
        },
        status: 201
      });

      const result = await brewService.duplicateBrew('original-brew-123');

      // Verify API call
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/brews/original-brew-123/duplicate');

      // Verify duplicated data
      expect(result.id).toBe('duplicated-brew-456');
      expect(result.userName).toBe('Copy of Original Brew');
      expect(result.beans).toEqual(originalBrew.beans);
      expect(result.parameters).toEqual(originalBrew.parameters);
      expect(result.turbulenceSteps).toEqual(originalBrew.turbulenceSteps);
      expect(result.measurements).toEqual(originalBrew.measurements);
      expect(result.evaluation).toBeUndefined(); // Should not duplicate evaluation
    });

    test('should handle favorite toggle functionality', async () => {
      const brewRecord: BrewRecord = {
        id: 'favorite-test-123',
        userId: 'user-123',
        brewNumber: 'B-2024-009',
        userName: 'Favorite Test Brew',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: {
          brand: 'Favorite Coffee',
          origin: 'Test Origin',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test Grinder',
          grinderSetting: '12',
          waterTemperature: 92
        },
        turbulenceSteps: [],
        measurements: {
          coffeeBeansWeight: 20,
          waterWeight: 300,
          coffeeToWaterRatio: 15.0
        }
      };

      const favoritedBrew = { ...brewRecord, isFavorite: true };

      // Mock favorite toggle API call
      mockHttpClient.put.mockResolvedValue({
        data: {
          success: true,
          data: favoritedBrew
        },
        status: 200
      });

      const result = await brewService.toggleFavorite('favorite-test-123', true);

      // Verify API call
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/api/v1/brews/favorite-test-123',
        { isFavorite: true }
      );

      // Verify result
      expect(result.isFavorite).toBe(true);
      expect(result.id).toBe('favorite-test-123');
    });

    test('should handle search functionality with filters', async () => {
      const searchResults = {
        brews: [
          {
            id: 'search-result-1',
            userId: 'user-123',
            brewNumber: 'B-2024-010',
            userName: 'Ethiopian Search Result',
            beans: {
              brand: 'Ethiopian Coffee Co',
              origin: 'Yirgacheffe',
              processingMethod: 'washed'
            },
            parameters: {
              brewingMethod: 'pour-over',
              grinderModel: 'Baratza',
              grinderSetting: '15',
              waterTemperature: 93
            },
            measurements: {
              coffeeBeansWeight: 22,
              waterWeight: 350,
              coffeeToWaterRatio: 15.91
            },
            turbulenceSteps: [],
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
            isShared: false,
            isFavorite: false
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 1,
          hasNextPage: false,
          hasPreviousPage: false
        },
        filters: {
          appliedFilters: { 
            search: 'Ethiopian',
            brewingMethod: 'pour-over'
          },
          availableFilters: {
            methods: ['pour-over'],
            dateRange: {
              earliest: '2024-01-15T10:00:00Z',
              latest: '2024-01-15T10:00:00Z'
            }
          }
        }
      };

      // Mock search API call
      mockHttpClient.get.mockResolvedValue({
        data: {
          success: true,
          data: searchResults
        },
        status: 200
      });

      const result = await brewService.searchBrews('Ethiopian', { 
        method: 'pour-over',
        page: 1,
        limit: 20 
      });

      // Verify API call with search parameters
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=Ethiopian')
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('method=pour-over')
      );

      // Verify results
      expect(result.brews).toHaveLength(1);
      expect(result.brews[0].beans.brand).toBe('Ethiopian Coffee Co');
      expect(result.filters.appliedFilters.search).toBe('Ethiopian');
    });
  });

  describe('Performance and Scalability Tests', () => {
    test('should handle large brew data efficiently', async () => {
      const largeTurbulenceSteps: TurbulenceStepType[] = Array.from({ length: 10 }, (_, i) => ({
        stepOrder: i + 1,
        actionType: i % 2 === 0 ? 'pour' : 'wait',
        actionTime: 30 + i * 10,
        volume: 50 + i * 20,
        technique: `Technique ${i + 1}`,
        description: `Detailed description for step ${i + 1} with comprehensive notes about the pouring technique and expected outcomes`
      }));

      const largeBrewData: CreateBrewRequest = {
        userName: 'Large Brew Data Test with extensive details and comprehensive brewing notes',
        beans: {
          brand: 'Premium Ethiopian Single Origin Coffee from Yirgacheffe Region',
          origin: 'Yirgacheffe, Gedeo Zone, Southern Nations, Nationalities and Peoples Region, Ethiopia',
          processingMethod: 'washed',
          altitude: 1800,
          roastingDate: '2024-01-15',
          roastingLevel: 'medium'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Baratza Forte AP with ceramic burr set and precision grinding capability',
          grinderSetting: '15 (medium-fine for optimal extraction)',
          waterTemperature: 93,
          filteringTools: 'Hario V60 ceramic dripper with #02 white paper filters',
          waterQuality: 'Third Wave Water mineral profile for optimal extraction'
        },
        turbulenceSteps: largeTurbulenceSteps,
        measurements: {
          coffeeBeansWeight: 22,
          waterWeight: 350,
          brewedCoffeeWeight: 310,
          tdsPercentage: 1.35
        },
        evaluation: {
          type: 'quick',
          overallQuality: 8,
          notes: 'Exceptionally complex brew with bright acidity, floral aromatics, and a clean finish. Notes of bergamot, jasmine, and stone fruit. Excellent clarity and balance. Recommended for light breakfast pastries or enjoyed black to appreciate the nuanced flavor profile.'
        }
      };

      const expectedLargeRecord: BrewRecord = {
        id: 'large-brew-123',
        userId: 'user-123',
        brewNumber: 'B-2024-011',
        userName: largeBrewData.userName!,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: largeBrewData.beans,
        parameters: largeBrewData.parameters,
        turbulenceSteps: largeBrewData.turbulenceSteps!,
        measurements: {
          ...largeBrewData.measurements,
          coffeeToWaterRatio: 15.91
        },
        evaluation: largeBrewData.evaluation
      };

      mockHttpClient.post.mockResolvedValue({
        data: {
          success: true,
          data: expectedLargeRecord
        },
        status: 201
      });

      const startTime = performance.now();
      const result = await brewService.createBrew(largeBrewData);
      const endTime = performance.now();

      // Should complete within reasonable time (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000);

      // Verify data integrity
      expect(result.turbulenceSteps).toHaveLength(10);
      expect(result.beans.brand).toContain('Premium Ethiopian');
      expect(result.evaluation?.notes).toContain('Exceptionally complex');
      expect(result.measurements.coffeeToWaterRatio).toBe(15.91);
    });

    test('should handle concurrent brew operations', async () => {
      const brewPromises = Array.from({ length: 5 }, (_, i) => {
        const brewData: CreateBrewRequest = {
          userName: `Concurrent Brew ${i + 1}`,
          beans: {
            brand: `Coffee Brand ${i + 1}`,
            origin: `Origin ${i + 1}`,
            processingMethod: 'washed'
          },
          parameters: {
            brewingMethod: 'pour-over',
            grinderModel: `Grinder ${i + 1}`,
            grinderSetting: `${10 + i}`,
            waterTemperature: 90 + i
          },
          measurements: {
            coffeeBeansWeight: 20 + i,
            waterWeight: 300 + i * 10
          }
        };

        const expectedRecord: BrewRecord = {
          id: `concurrent-brew-${i + 1}`,
          userId: 'user-123',
          brewNumber: `B-2024-${String(12 + i).padStart(3, '0')}`,
          userName: brewData.userName!,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          isShared: false,
          isFavorite: false,
          beans: brewData.beans,
          parameters: brewData.parameters,
          turbulenceSteps: [],
          measurements: {
            ...brewData.measurements,
            coffeeToWaterRatio: Math.round(((300 + i * 10) / (20 + i)) * 100) / 100
          }
        };

        return { brewData, expectedRecord };
      });

      // Mock all API calls
      brewPromises.forEach(({ expectedRecord }) => {
        mockHttpClient.post.mockResolvedValueOnce({
          data: {
            success: true,
            data: expectedRecord
          },
          status: 201
        });
      });

      const startTime = performance.now();
      
      // Execute all brew creations concurrently
      const results = await Promise.all(
        brewPromises.map(({ brewData }) => brewService.createBrew(brewData))
      );
      
      const endTime = performance.now();

      // Should complete all operations efficiently
      expect(endTime - startTime).toBeLessThan(2000); // Allow more time for concurrent operations
      expect(results).toHaveLength(5);

      // Verify all brews were created correctly
      results.forEach((result, i) => {
        expect(result.userName).toBe(`Concurrent Brew ${i + 1}`);
        expect(result.beans.brand).toBe(`Coffee Brand ${i + 1}`);
      });

      // Verify all API calls were made
      expect(mockHttpClient.post).toHaveBeenCalledTimes(5);
    });
  });
});