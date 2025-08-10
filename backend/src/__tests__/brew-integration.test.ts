// Integration tests for brew functionality
// Tests the complete flow from API endpoints through to database operations

// Set up environment variables before any imports
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
process.env.JWT_SECRET = 'test-jwt-secret';

import request from 'supertest';
import app from '../index';
import { CreateBrewRequest, BrewRecord } from '../types/brew';

// Mock authentication middleware for testing
jest.mock('../middleware/auth', () => ({
  authenticateUser: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-user-123', email: 'test@example.com' };
    next();
  }
}));

// Mock BrewService
jest.mock('../services/brew', () => {
  return {
    BrewService: jest.fn().mockImplementation(() => ({
      createBrew: jest.fn(),
      getBrewById: jest.fn(),
      getBrews: jest.fn(),
      updateBrew: jest.fn(),
      deleteBrew: jest.fn(),
      getUserBrewStats: jest.fn()
    }))
  };
});

const mockBrewService = require('../services/brew').BrewService;
const mockBrewServiceInstance = new mockBrewService();

describe('Brew API Integration Tests', () => {
  
  const mockBrewData: CreateBrewRequest = {
    userName: 'Test Brew',
    beans: {
      brand: 'Test Coffee',
      origin: 'Test Origin',
      processingMethod: 'washed'
    },
    parameters: {
      brewingMethod: 'pour-over',
      grinderModel: 'Test Grinder',
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
      notes: 'Great coffee!'
    }
  };

  const mockBrewRecord: BrewRecord = {
    id: 'brew-123',
    user_id: 'test-user-123',
    brew_number: 'B-2023-001',
    user_name: 'Test Brew',
    created_at: '2023-11-15T10:00:00Z',
    updated_at: '2023-11-15T10:00:00Z',
    is_shared: false,
    is_favorite: false,
    beans: mockBrewData.beans,
    parameters: mockBrewData.parameters,
    turbulence_steps: [],
    measurements: {
      coffeeBeansWeight: 22,
      waterWeight: 350,
      coffeeToWaterRatio: 15.91
    },
    evaluation: mockBrewData.evaluation!
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/brews', () => {
    test('should create a new brew successfully', async () => {
      mockBrewServiceInstance.createBrew.mockResolvedValue(mockBrewRecord);

      const response = await request(app)
        .post('/api/v1/brews')
        .send(mockBrewData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockBrewRecord);
      expect(mockBrewServiceInstance.createBrew).toHaveBeenCalledWith(
        mockBrewData,
        'test-user-123'
      );
    });

    test('should handle validation errors', async () => {
      const validationError = new (require('../types/brew').BrewError)(
        'Validation failed',
        400,
        [{ field: 'brand', message: 'Brand is required', value: '' }]
      );
      
      mockBrewServiceInstance.createBrew.mockRejectedValue(validationError);

      const response = await request(app)
        .post('/api/v1/brews')
        .send({ ...mockBrewData, beans: { ...mockBrewData.beans, brand: '' } })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.validationErrors).toBeDefined();
    });
  });

  describe('GET /api/v1/brews', () => {
    test('should get brews with pagination', async () => {
      const mockResponse = {
        brews: [mockBrewRecord],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 1,
          hasNextPage: false,
          hasPreviousPage: false
        },
        filters: {
          appliedFilters: {},
          availableFilters: {
            methods: ['pour-over'],
            dateRange: {
              earliest: '2023-11-15T10:00:00Z',
              latest: '2023-11-15T10:00:00Z'
            }
          }
        }
      };

      mockBrewServiceInstance.getBrews.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/v1/brews')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.brews).toHaveLength(1);
      expect(mockBrewServiceInstance.getBrews).toHaveBeenCalledWith({
        userId: 'test-user-123',
        page: 1,
        limit: 20,
        favorites: false,
        method: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        search: undefined
      });
    });

    test('should handle query parameters correctly', async () => {
      const mockResponse = {
        brews: [],
        pagination: {
          currentPage: 2,
          totalPages: 3,
          totalRecords: 50,
          hasNextPage: true,
          hasPreviousPage: true
        },
        filters: {
          appliedFilters: { method: 'pour-over', favorites: true },
          availableFilters: {
            methods: ['pour-over'],
            dateRange: {
              earliest: '2023-11-01T00:00:00Z',
              latest: '2023-11-30T23:59:59Z'
            }
          }
        }
      };

      mockBrewServiceInstance.getBrews.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/v1/brews?page=2&limit=10&method=pour-over&favorites=true&search=Ethiopian')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockBrewServiceInstance.getBrews).toHaveBeenCalledWith({
        userId: 'test-user-123',
        page: 2,
        limit: 10,
        method: 'pour-over',
        favorites: true,
        search: 'Ethiopian',
        dateFrom: undefined,
        dateTo: undefined,
        sortBy: undefined,
        sortOrder: undefined
      });
    });
  });

  describe('GET /api/v1/brews/:id', () => {
    test('should get a specific brew', async () => {
      mockBrewServiceInstance.getBrewById.mockResolvedValue(mockBrewRecord);

      const response = await request(app)
        .get('/api/v1/brews/brew-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockBrewRecord);
      expect(mockBrewServiceInstance.getBrewById).toHaveBeenCalledWith(
        'brew-123',
        'test-user-123'
      );
    });

    test('should handle brew not found', async () => {
      const notFoundError = new (require('../types/brew').BrewError)(
        'Brew not found',
        404
      );
      
      mockBrewServiceInstance.getBrewById.mockRejectedValue(notFoundError);

      const response = await request(app)
        .get('/api/v1/brews/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Brew not found');
    });
  });

  describe('PUT /api/v1/brews/:id', () => {
    test('should update a brew successfully', async () => {
      const updatedBrew = { ...mockBrewRecord, user_name: 'Updated Brew Name' };
      mockBrewServiceInstance.updateBrew.mockResolvedValue(updatedBrew);

      const updateData = { userName: 'Updated Brew Name' };

      const response = await request(app)
        .put('/api/v1/brews/brew-123')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user_name).toBe('Updated Brew Name');
      expect(mockBrewServiceInstance.updateBrew).toHaveBeenCalledWith(
        'brew-123',
        updateData,
        'test-user-123'
      );
    });
  });

  describe('DELETE /api/v1/brews/:id', () => {
    test('should delete a brew successfully', async () => {
      mockBrewServiceInstance.deleteBrew.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/v1/brews/brew-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Brew deleted successfully');
      expect(mockBrewServiceInstance.deleteBrew).toHaveBeenCalledWith(
        'brew-123',
        'test-user-123'
      );
    });
  });

  describe('POST /api/v1/brews/:id/duplicate', () => {
    test('should duplicate a brew successfully', async () => {
      mockBrewServiceInstance.getBrewById.mockResolvedValue(mockBrewRecord);
      
      const duplicatedBrew = {
        ...mockBrewRecord,
        id: 'brew-456',
        user_name: 'Copy of Test Brew',
        brew_number: 'B-2023-002'
      };
      mockBrewServiceInstance.createBrew.mockResolvedValue(duplicatedBrew);

      const response = await request(app)
        .post('/api/v1/brews/brew-123/duplicate')
        .send({ userName: 'Copy of Test Brew' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user_name).toBe('Copy of Test Brew');
      expect(response.body.message).toBe('Brew duplicated successfully');
      
      // Should get the original brew first
      expect(mockBrewServiceInstance.getBrewById).toHaveBeenCalledWith(
        'brew-123',
        'test-user-123'
      );
      
      // Should create new brew without evaluation
      expect(mockBrewServiceInstance.createBrew).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: 'Copy of Test Brew',
          beans: mockBrewData.beans,
          parameters: mockBrewData.parameters,
          measurements: expect.objectContaining({
            coffeeBeansWeight: 22,
            waterWeight: 350
          })
        }),
        'test-user-123'
      );
      
      // Should not include evaluation in duplicate
      const createCall = mockBrewServiceInstance.createBrew.mock.calls[0][0];
      expect(createCall.evaluation).toBeUndefined();
    });
  });

  describe('GET /api/v1/brews/stats/user', () => {
    test('should get user brew statistics', async () => {
      const mockStats = {
        totalBrews: 10,
        favoriteBrews: 3,
        averageQuality: 8.2,
        mostUsedMethod: 'pour-over',
        brewsThisMonth: 5
      };

      mockBrewServiceInstance.getUserBrewStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/v1/brews/stats/user')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats);
      expect(mockBrewServiceInstance.getUserBrewStats).toHaveBeenCalledWith(
        'test-user-123'
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected service errors', async () => {
      mockBrewServiceInstance.createBrew.mockRejectedValue(
        new Error('Unexpected database error')
      );

      const response = await request(app)
        .post('/api/v1/brews')
        .send(mockBrewData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(
        'An unexpected error occurred while creating the brew'
      );
    });
  });
});