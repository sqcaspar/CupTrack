// TASK-006C: Brew Entry Integration Testing - TDD Core
// Core integration tests for brew wizard to backend workflow
// Validates the essential data flow and error handling

import { BrewService } from '../../services/brewService';
import { ApiClient } from '../../services/apiClient';
import { CreateBrewRequest, BrewRecord, BrewError, calculateBrewRatio } from '../../types/brew';

// Mock the ApiClient
jest.mock('../../services/apiClient');

describe('Brew Wizard Core Integration Tests - TDD Core', () => {
  let brewService: BrewService;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({ baseURL: 'http://localhost:3001', timeout: 5000, retries: 3 }) as jest.Mocked<ApiClient>;
    brewService = new BrewService(mockApiClient);
    jest.clearAllMocks();
  });

  describe('Essential Wizard Integration', () => {
    test('should create brew with complete wizard data following TDD methodology', async () => {
      // RED: Test failing case first
      const wizardData: CreateBrewRequest = {
        userName: 'TDD Integration Test',
        beans: {
          brand: 'Ethiopian Coffee Co',
          origin: 'Yirgacheffe',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Baratza Encore',
          grinderSetting: '15',
          waterTemperature: 93
        },
        measurements: {
          coffeeBeansWeight: 22,
          waterWeight: 350
        },
        evaluation: {
          type: 'quick',
          overallQuality: 8,
          notes: 'Excellent integration test'
        }
      };

      const expectedBrew: BrewRecord = {
        id: 'brew-tdd-123',
        userId: 'user-123',
        brewNumber: 'B-2024-TDD',
        userName: wizardData.userName!,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: wizardData.beans,
        parameters: wizardData.parameters,
        turbulenceSteps: [],
        measurements: {
          ...wizardData.measurements,
          coffeeToWaterRatio: calculateBrewRatio(350, 22) // 15.91
        },
        evaluation: wizardData.evaluation
      };

      // GREEN: Mock successful response to make test pass
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          brew: expectedBrew
        }
      });

      // Execute the integration
      const result = await brewService.createBrew(wizardData);

      // REFACTOR: Verify the integration works as expected
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/brews',
        expect.objectContaining({
          userName: 'TDD Integration Test',
          beans: expect.objectContaining({
            brand: 'Ethiopian Coffee Co',
            processingMethod: 'washed'
          }),
          parameters: expect.objectContaining({
            brewingMethod: 'pour-over',
            waterTemperature: 93
          }),
          measurements: expect.objectContaining({
            coffeeBeansWeight: 22,
            waterWeight: 350,
            coffeeToWaterRatio: 15.91
          })
        })
      );

      expect(result).toEqual(expectedBrew);
      expect(result.measurements.coffeeToWaterRatio).toBe(15.91);
    });

    test('should create brew with minimal wizard data', async () => {
      // RED: Start with minimum viable data
      const minimalData: CreateBrewRequest = {
        beans: {
          brand: 'Simple Coffee',
          origin: 'Brazil',
          processingMethod: 'natural'
        },
        parameters: {
          brewingMethod: 'french-press',
          grinderModel: 'Manual',
          grinderSetting: 'coarse',
          waterTemperature: 92
        },
        measurements: {
          coffeeBeansWeight: 30,
          waterWeight: 450
        }
      };

      const expectedMinimal: BrewRecord = {
        id: 'brew-minimal-456',
        userId: 'user-123',
        brewNumber: 'B-2024-MIN',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: minimalData.beans,
        parameters: minimalData.parameters,
        turbulenceSteps: [],
        measurements: {
          ...minimalData.measurements,
          coffeeToWaterRatio: 15.0
        }
      };

      // GREEN: Mock successful response
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          brew: expectedMinimal
        }
      });

      const result = await brewService.createBrew(minimalData);

      expect(result.measurements.coffeeToWaterRatio).toBe(15.0);
      expect(result.userName).toBeUndefined();
      expect(result.evaluation).toBeUndefined();
      expect(result.turbulenceSteps).toEqual([]);
    });

    test('should handle validation errors in TDD style', async () => {
      // RED: Test validation failure first
      const invalidData: CreateBrewRequest = {
        beans: {
          brand: '', // Invalid: empty brand
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
          coffeeBeansWeight: 0, // Invalid: zero weight
          waterWeight: 300
        }
      };

      // GREEN: This should throw validation error (frontend validation)
      await expect(brewService.createBrew(invalidData)).rejects.toThrow(BrewError);

      // REFACTOR: Verify API not called due to validation
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    test('should handle backend errors gracefully', async () => {
      const validData: CreateBrewRequest = {
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

      // RED: Mock backend error
      mockApiClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Backend validation failed',
            validationErrors: [
              { field: 'beans.brand', message: 'Invalid brand format' }
            ]
          }
        }
      });

      // GREEN: Should handle error gracefully
      let caughtError: BrewError | null = null;
      try {
        await brewService.createBrew(validData);
      } catch (error) {
        caughtError = error as BrewError;
      }

      // REFACTOR: Verify error handling
      expect(caughtError).toBeInstanceOf(BrewError);
      expect(caughtError?.statusCode).toBe(400);
      expect(caughtError?.message).toContain('validation failed');
    });
  });

  describe('Calculation Integration - TDD Core', () => {
    test('should correctly calculate coffee-to-water ratios', async () => {
      const testCases = [
        { coffee: 20, water: 300, expectedRatio: 15.0 },
        { coffee: 22, water: 350, expectedRatio: 15.91 },
        { coffee: 30, water: 450, expectedRatio: 15.0 }
      ];

      for (const testCase of testCases) {
        // RED: Start with test case
        const testData: CreateBrewRequest = {
          beans: {
            brand: 'Ratio Test Coffee',
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

        const expectedResult: BrewRecord = {
          id: `brew-calc-${testCase.coffee}`,
          userId: 'user-123',
          brewNumber: 'B-2024-CALC',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          isShared: false,
          isFavorite: false,
          beans: testData.beans,
          parameters: testData.parameters,
          turbulenceSteps: [],
          measurements: {
            ...testData.measurements,
            coffeeToWaterRatio: testCase.expectedRatio
          }
        };

        // GREEN: Mock successful calculation
        mockApiClient.post.mockResolvedValue({
          success: true,
          data: {
            brew: expectedResult
          }
        });

        const result = await brewService.createBrew(testData);

        // REFACTOR: Verify calculation integration
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/brews',
          expect.objectContaining({
            measurements: expect.objectContaining({
              coffeeToWaterRatio: testCase.expectedRatio
            })
          })
        );

        expect(result.measurements.coffeeToWaterRatio).toBe(testCase.expectedRatio);

        // Clear mock for next iteration
        jest.clearAllMocks();
      }
    });
  });

  describe('Data Persistence Integration - TDD Core', () => {
    test('should create and retrieve brew data', async () => {
      // RED: Test the complete create -> retrieve cycle
      const createData: CreateBrewRequest = {
        userName: 'Persistence Test',
        beans: {
          brand: 'Persistence Coffee',
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
        id: 'brew-persist-123',
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
          coffeeToWaterRatio: 16.0
        }
      };

      // GREEN: Mock successful create and get
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          brew: createdBrew
        }
      });

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: {
          brew: createdBrew
        }
      });

      // Create brew
      const createResult = await brewService.createBrew(createData);
      expect(createResult.id).toBe('brew-persist-123');

      // Retrieve brew
      const retrieveResult = await brewService.getBrew('brew-persist-123');
      expect(retrieveResult).toEqual(createdBrew);

      // REFACTOR: Verify both operations
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/brews', expect.any(Object));
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/brews/brew-persist-123');
    });
  });

  describe('Complete Wizard Workflow Integration', () => {
    test('should validate complete wizard-to-backend workflow', async () => {
      // This test represents the complete flow from wizard completion to backend storage
      
      // Step 1: User completes all wizard steps
      const completeWizardData: CreateBrewRequest = {
        userName: 'Complete Workflow Test',
        beans: {
          brand: 'Ethiopian Coffee Co',
          origin: 'Yirgacheffe',
          processingMethod: 'washed',
          altitude: 1800,
          roastingLevel: 'medium'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Baratza Encore',
          grinderSetting: '15',
          waterTemperature: 93,
          filteringTools: 'Hario V60'
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
          notes: 'Complete workflow test brew'
        }
      };

      const expectedWorkflowResult: BrewRecord = {
        id: 'brew-workflow-123',
        userId: 'user-123',
        brewNumber: 'B-2024-WORKFLOW',
        userName: completeWizardData.userName!,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        isShared: false,
        isFavorite: false,
        beans: completeWizardData.beans,
        parameters: completeWizardData.parameters,
        turbulenceSteps: completeWizardData.turbulenceSteps!,
        measurements: {
          ...completeWizardData.measurements,
          coffeeToWaterRatio: 15.91
        },
        evaluation: completeWizardData.evaluation
      };

      // Step 2: Mock backend success
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          brew: expectedWorkflowResult
        }
      });

      // Step 3: Execute complete workflow
      const result = await brewService.createBrew(completeWizardData);

      // Step 4: Verify complete data integrity
      expect(result).toEqual(expectedWorkflowResult);
      expect(result.beans.brand).toBe('Ethiopian Coffee Co');
      expect(result.parameters.brewingMethod).toBe('pour-over');
      expect(result.turbulenceSteps).toHaveLength(1);
      expect(result.turbulenceSteps[0].actionType).toBe('bloom');
      expect(result.measurements.coffeeToWaterRatio).toBe(15.91);
      expect(result.evaluation?.type).toBe('quick');
      expect(result.evaluation?.overallQuality).toBe(8);

      // Step 5: Verify API integration
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/brews',
        expect.objectContaining({
          userName: 'Complete Workflow Test',
          beans: expect.objectContaining({
            brand: 'Ethiopian Coffee Co',
            altitude: 1800
          }),
          parameters: expect.objectContaining({
            brewingMethod: 'pour-over',
            filteringTools: 'Hario V60'
          }),
          turbulenceSteps: expect.arrayContaining([
            expect.objectContaining({
              stepOrder: 1,
              actionType: 'bloom',
              description: 'Initial bloom'
            })
          ]),
          measurements: expect.objectContaining({
            coffeeBeansWeight: 22,
            waterWeight: 350,
            brewedCoffeeWeight: 310,
            tdsPercentage: 1.35,
            coffeeToWaterRatio: 15.91
          }),
          evaluation: expect.objectContaining({
            type: 'quick',
            overallQuality: 8,
            notes: 'Complete workflow test brew'
          })
        })
      );
    });
  });
});