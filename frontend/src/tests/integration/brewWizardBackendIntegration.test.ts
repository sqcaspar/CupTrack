// TASK-006C: Brew Entry Integration Testing - TDD Core
// Simplified backend integration tests focusing on API communication
// Tests complete data flow from frontend service through to backend

import { BrewService } from '../../services/brewService';
import { ApiClient } from '../../services/apiClient';
import { CreateBrewRequest, BrewRecord, BrewError, calculateBrewRatio } from '../../types/brew';

// Mock the ApiClient
jest.mock('../../services/apiClient');

describe('Brew Wizard Backend Integration Tests - TDD Core', () => {
  let brewService: BrewService;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({ baseURL: 'http://localhost:3001', timeout: 5000, retries: 3 }) as jest.Mocked<ApiClient>;
    brewService = new BrewService(mockApiClient);
    jest.clearAllMocks();
  });

  describe('Complete Brew Creation Workflow', () => {
    test('should create brew with complete wizard data', async () => {
      // Complete brew data as would come from completed wizard
      const wizardData: CreateBrewRequest = {
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
            description: 'Initial bloom'
          },
          {
            stepOrder: 2,
            actionType: 'main-pour',
            actionTime: 180,
            volume: 290,
            technique: 'center pour',
            description: 'Main extraction'
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
          notes: 'Excellent brew with bright acidity'
        }
      };

      const expectedCreatedBrew: BrewRecord = {
        id: 'brew-integration-123',
        userId: 'user-integration-123',
        brewNumber: 'B-2024-001',
        userName: wizardData.userName!,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: wizardData.beans,
        parameters: wizardData.parameters,
        turbulenceSteps: wizardData.turbulenceSteps!,
        measurements: {
          ...wizardData.measurements,
          coffeeToWaterRatio: calculateBrewRatio(350, 22) // Auto-calculated
        },
        evaluation: wizardData.evaluation
      };

      // Mock successful backend response
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          brew: expectedCreatedBrew
        }
      });

      // Execute the API call through service
      const result = await brewService.createBrew(wizardData);

      // Verify correct API request was made
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/brews',
        expect.objectContaining({
          userName: 'Integration Test Brew',
          beans: expect.objectContaining({
            brand: 'Ethiopian Coffee Co',
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
              actionType: 'bloom'
            }),
            expect.objectContaining({
              stepOrder: 2,
              actionType: 'main-pour'
            })
          ]),
          evaluation: expect.objectContaining({
            type: 'quick',
            overallQuality: 8
          })
        })
      );

      // Verify response data
      expect(result).toEqual(expectedCreatedBrew);
      expect(result.measurements.coffeeToWaterRatio).toBe(15.91);
      expect(result.turbulenceSteps).toHaveLength(2);
    });

    test('should create brew with minimal wizard data', async () => {
      // Minimal data (only required fields from wizard)
      const minimalWizardData: CreateBrewRequest = {
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
        // No optional fields: userName, turbulenceSteps, evaluation
      };

      const expectedMinimalBrew: BrewRecord = {
        id: 'brew-minimal-456',
        userId: 'user-123',
        brewNumber: 'B-2024-002',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: minimalWizardData.beans,
        parameters: minimalWizardData.parameters,
        turbulenceSteps: [],
        measurements: {
          ...minimalWizardData.measurements,
          coffeeToWaterRatio: 15.0 // 450/30
        }
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          brew: expectedMinimalBrew
        }
      });

      const result = await brewService.createBrew(minimalWizardData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/brews',
        expect.objectContaining({
          beans: minimalWizardData.beans,
          parameters: minimalWizardData.parameters,
          measurements: expect.objectContaining({
            coffeeToWaterRatio: 15.0
          }),
          turbulenceSteps: []
        })
      );

      expect(result.turbulenceSteps).toEqual([]);
      expect(result.userName).toBeUndefined();
      expect(result.evaluation).toBeUndefined();
    });

    test('should handle SCA evaluation data correctly', async () => {
      const scaWizardData: CreateBrewRequest = {
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

      const expectedSCABrew: BrewRecord = {
        id: 'brew-sca-789',
        userId: 'user-123',
        brewNumber: 'B-2024-003',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: scaWizardData.beans,
        parameters: scaWizardData.parameters,
        turbulenceSteps: [],
        measurements: {
          ...scaWizardData.measurements,
          coffeeToWaterRatio: 15.0
        },
        evaluation: scaWizardData.evaluation
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          brew: expectedSCABrew
        },
        status: 201
      });

      const result = await brewService.createBrew(scaWizardData);

      expect(result.evaluation?.type).toBe('sca');
      if (result.evaluation?.type === 'sca') {
        expect(result.evaluation.scores.aroma).toBe(8.5);
        expect(result.evaluation.defects).toBe(1);
        
        // Verify total score calculation would be correct
        const totalScore = Object.values(result.evaluation.scores).reduce((sum, score) => sum + score, 0);
        expect(totalScore).toBe(55.0);
      }
    });
  });

  describe('Wizard Validation Integration', () => {
    test('should handle frontend validation errors before API call', async () => {
      // Invalid data that should be caught by frontend validation
      const invalidData: CreateBrewRequest = {
        beans: {
          brand: '', // Empty brand
          origin: 'Test Origin',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test Grinder',
          grinderSetting: '10',
          waterTemperature: 150 // Too hot
        },
        measurements: {
          coffeeBeansWeight: 0, // Invalid weight
          waterWeight: 300
        }
      };

      // Should throw validation error before making API call
      await expect(brewService.createBrew(invalidData)).rejects.toThrow(BrewError);

      // API should not be called due to frontend validation
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    test('should handle backend validation errors gracefully', async () => {
      const validFrontendData: CreateBrewRequest = {
        beans: {
          brand: 'Valid Coffee',
          origin: 'Valid Origin',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Valid Grinder',
          grinderSetting: '10',
          waterTemperature: 92
        },
        measurements: {
          coffeeBeansWeight: 20,
          waterWeight: 300
        }
      };

      // Mock backend validation error
      mockApiClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            success: false,
            error: 'Brew validation failed',
            validationErrors: [
              { field: 'beans.brand', message: 'Brand contains invalid characters', value: 'Valid Coffee' },
              { field: 'parameters.grinderSetting', message: 'Setting not compatible with grinder model', value: '10' }
            ]
          }
        }
      });

      let caughtError: BrewError | null = null;
      try {
        await brewService.createBrew(validFrontendData);
      } catch (error) {
        caughtError = error as BrewError;
      }

      expect(caughtError).toBeInstanceOf(BrewError);
      expect(caughtError?.message).toContain('Brew validation failed');
      expect(caughtError?.statusCode).toBe(400);
      expect(caughtError?.validationErrors).toHaveLength(2);
      expect(caughtError?.validationErrors?.[0].field).toBe('beans.brand');
      expect(caughtError?.validationErrors?.[1].field).toBe('parameters.grinderSetting');
    });

    test('should handle network errors during wizard submission', async () => {
      const validData: CreateBrewRequest = {
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
      mockApiClient.post.mockRejectedValue({
        code: 'NETWORK_ERROR',
        message: 'Network Error'
      });

      await expect(brewService.createBrew(validData)).rejects.toThrow('Failed to create brew');
    });

    test('should handle server errors during wizard submission', async () => {
      const validData: CreateBrewRequest = {
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

      // Mock server error
      mockApiClient.post.mockRejectedValue({
        response: {
          status: 500,
          data: {
            success: false,
            error: 'Internal server error'
          }
        }
      });

      await expect(brewService.createBrew(validData)).rejects.toThrow('Failed to create brew');
    });
  });

  describe('Calculation Integration', () => {
    test('should correctly calculate coffee-to-water ratio', async () => {
      const testCases = [
        { coffee: 20, water: 300, expectedRatio: 15.0 },
        { coffee: 22, water: 350, expectedRatio: 15.91 },
        { coffee: 30, water: 450, expectedRatio: 15.0 },
        { coffee: 25, water: 400, expectedRatio: 16.0 },
        { coffee: 18, water: 270, expectedRatio: 15.0 }
      ];

      for (const testCase of testCases) {
        const wizardData: CreateBrewRequest = {
          beans: {
            brand: 'Test Coffee',
            origin: 'Test Origin',
            processingMethod: 'washed'
          },
          parameters: {
            brewingMethod: 'pour-over',
            grinderModel: 'Test Grinder',
            grinderSetting: '10',
            waterTemperature: 92
          },
          measurements: {
            coffeeBeansWeight: testCase.coffee,
            waterWeight: testCase.water
          }
        };

        const expectedBrew: BrewRecord = {
          id: `brew-calc-${testCase.coffee}-${testCase.water}`,
          userId: 'user-123',
          brewNumber: 'B-2024-CALC',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          isShared: false,
          isFavorite: false,
          beans: wizardData.beans,
          parameters: wizardData.parameters,
          turbulenceSteps: [],
          measurements: {
            ...wizardData.measurements,
            coffeeToWaterRatio: testCase.expectedRatio
          }
        };

        mockApiClient.post.mockResolvedValueOnce({
          data: {
            success: true,
            data: expectedBrew
          },
          status: 201
        });

        const result = await brewService.createBrew(wizardData);

        // Verify the ratio calculation was included in the API call
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/brews',
          expect.objectContaining({
            measurements: expect.objectContaining({
              coffeeToWaterRatio: testCase.expectedRatio
            })
          })
        );

        expect(result.measurements.coffeeToWaterRatio).toBe(testCase.expectedRatio);
      }
    });

    test('should handle edge cases in calculations', async () => {
      // Test very small amounts
      const smallAmountData: CreateBrewRequest = {
        beans: {
          brand: 'Small Test',
          origin: 'Test',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test',
          grinderSetting: '10',
          waterTemperature: 92
        },
        measurements: {
          coffeeBeansWeight: 1,
          waterWeight: 15
        }
      };

      const expectedSmallBrew: BrewRecord = {
        id: 'brew-small-test',
        userId: 'user-123',
        brewNumber: 'B-2024-SMALL',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: smallAmountData.beans,
        parameters: smallAmountData.parameters,
        turbulenceSteps: [],
        measurements: {
          ...smallAmountData.measurements,
          coffeeToWaterRatio: 15.0 // 15/1 = 15
        }
      };

      mockApiClient.post.mockResolvedValue({
        data: {
          success: true,
          data: expectedSmallBrew
        },
        status: 201
      });

      const result = await brewService.createBrew(smallAmountData);
      expect(result.measurements.coffeeToWaterRatio).toBe(15.0);
    });
  });

  describe('Data Persistence Integration', () => {
    test('should create and then retrieve brew data', async () => {
      const createData: CreateBrewRequest = {
        userName: 'Persistence Test',
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
        id: 'brew-persistence-test',
        userId: 'user-123',
        brewNumber: 'B-2024-PERSIST',
        userName: createData.userName!,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: createData.beans,
        parameters: createData.parameters,
        turbulenceSteps: [],
        measurements: {
          ...createData.measurements,
          coffeeToWaterRatio: 16.0 // 400/25
        }
      };

      // Mock creation
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: createdBrew
        },
        status: 201
      });

      // Mock retrieval
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: createdBrew
        },
        status: 200
      });

      // Create brew
      const createResult = await brewService.createBrew(createData);
      expect(createResult.id).toBe('brew-persistence-test');

      // Retrieve brew
      const retrieveResult = await brewService.getBrew('brew-persistence-test');
      expect(retrieveResult).toEqual(createdBrew);
      expect(retrieveResult.userName).toBe('Persistence Test');

      // Verify API calls
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/brews', expect.any(Object));
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/brews/brew-persistence-test');
    });

    test('should create multiple brews and list them', async () => {
      const brew1: CreateBrewRequest = {
        userName: 'First Brew',
        beans: { brand: 'Coffee A', origin: 'Origin A', processingMethod: 'washed' },
        parameters: { brewingMethod: 'pour-over', grinderModel: 'Grinder A', grinderSetting: '10', waterTemperature: 90 },
        measurements: { coffeeBeansWeight: 20, waterWeight: 300 }
      };

      const brew2: CreateBrewRequest = {
        userName: 'Second Brew',
        beans: { brand: 'Coffee B', origin: 'Origin B', processingMethod: 'natural' },
        parameters: { brewingMethod: 'french-press', grinderModel: 'Grinder B', grinderSetting: 'coarse', waterTemperature: 92 },
        measurements: { coffeeBeansWeight: 30, waterWeight: 450 }
      };

      const brew1Record: BrewRecord = {
        id: 'brew-list-1',
        userId: 'user-123',
        brewNumber: 'B-2024-LIST1',
        userName: brew1.userName!,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: brew1.beans,
        parameters: brew1.parameters,
        turbulenceSteps: [],
        measurements: { ...brew1.measurements, coffeeToWaterRatio: 15.0 }
      };

      const brew2Record: BrewRecord = {
        id: 'brew-list-2',
        userId: 'user-123',
        brewNumber: 'B-2024-LIST2',
        userName: brew2.userName!,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: brew2.beans,
        parameters: brew2.parameters,
        turbulenceSteps: [],
        measurements: { ...brew2.measurements, coffeeToWaterRatio: 15.0 }
      };

      // Mock creation responses
      mockApiClient.post
        .mockResolvedValueOnce({ data: { success: true, data: brew1Record }, status: 201 })
        .mockResolvedValueOnce({ data: { success: true, data: brew2Record }, status: 201 });

      // Mock list response
      mockApiClient.get.mockResolvedValueOnce({
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
      const result1 = await brewService.createBrew(brew1);
      const result2 = await brewService.createBrew(brew2);

      expect(result1.userName).toBe('First Brew');
      expect(result2.userName).toBe('Second Brew');

      // List brews
      const listResult = await brewService.getBrews();
      expect(listResult.brews).toHaveLength(2);
      expect(listResult.brews[0].userName).toBe('Second Brew'); // Newest first
      expect(listResult.pagination.totalRecords).toBe(2);
    });
  });
});