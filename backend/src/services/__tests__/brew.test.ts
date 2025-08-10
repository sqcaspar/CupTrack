// TDD tests for BrewService - data persistence and business logic
// Following TDD methodology for critical database operations

import { BrewService } from '../brew';
import { 
  CreateBrewRequest, 
  BrewRecord, 
  BrewListFilters,
  UpdateBrewRequest,
  BrewError 
} from '../../types/brew';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js');
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  eq: jest.fn(),
  order: jest.fn(),
  range: jest.fn(),
  ilike: jest.fn(),
  gte: jest.fn(),
  lte: jest.fn(),
  single: jest.fn(),
  limit: jest.fn()
};

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_KEY: 'test-service-key'
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
};

const mockBrewRequest: CreateBrewRequest = {
  userName: 'Morning Brew',
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
    notes: 'Excellent cup!'
  }
};

const mockBrewRecord: BrewRecord = {
  id: 'brew-123',
  user_id: 'user-123',
  brew_number: 'B-2023-001',
  user_name: 'Morning Brew',
  created_at: '2023-11-15T10:00:00Z',
  updated_at: '2023-11-15T10:00:00Z',
  is_shared: false,
  is_favorite: false,
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
  turbulence_steps: [],
  measurements: {
    coffeeBeansWeight: 22,
    waterWeight: 350,
    coffeeToWaterRatio: 15.91
  },
  evaluation: {
    type: 'quick',
    overallQuality: 8,
    notes: 'Excellent cup!'
  }
};

describe('BrewService', () => {
  let brewService: BrewService;

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    brewService = new BrewService();
    
    // Setup default chain for Supabase mocks
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
    mockSupabase.range.mockReturnValue(mockSupabase);
    mockSupabase.ilike.mockReturnValue(mockSupabase);
    mockSupabase.gte.mockReturnValue(mockSupabase);
    mockSupabase.lte.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockReturnValue(mockSupabase);
  });

  // RED: Test brew creation
  describe('createBrew', () => {
    test('should create a new brew successfully', async () => {
      const mockResponse = {
        data: mockBrewRecord,
        error: null
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const result = await brewService.createBrew(mockBrewRequest, mockUser.id);

      expect(result).toEqual(mockBrewRecord);
      expect(mockSupabase.from).toHaveBeenCalledWith('brews');
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: mockUser.id,
        user_name: mockBrewRequest.userName,
        beans: mockBrewRequest.beans,
        parameters: mockBrewRequest.parameters,
        measurements: expect.objectContaining({
          coffeeBeansWeight: mockBrewRequest.measurements.coffeeBeansWeight,
          waterWeight: mockBrewRequest.measurements.waterWeight,
          coffeeToWaterRatio: expect.any(Number)
        })
      }));
    });

    test('should calculate coffee to water ratio automatically', async () => {
      const mockResponse = {
        data: { ...mockBrewRecord, measurements: { ...mockBrewRecord.measurements, coffeeToWaterRatio: 15.91 } },
        error: null
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      await brewService.createBrew(mockBrewRequest, mockUser.id);

      const insertCall = mockSupabase.insert.mock.calls[0][0];
      expect(insertCall.measurements.coffeeToWaterRatio).toBeCloseTo(15.91, 2);
    });

    test('should generate unique brew number', async () => {
      const mockResponse = {
        data: mockBrewRecord,
        error: null
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      await brewService.createBrew(mockBrewRequest, mockUser.id);

      const insertCall = mockSupabase.insert.mock.calls[0][0];
      expect(insertCall.brew_number).toMatch(/^B-\d{4}-\d{3}$/);
    });

    test('should handle database errors', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'Database connection failed', code: 'DB_ERROR' }
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      await expect(brewService.createBrew(mockBrewRequest, mockUser.id)).rejects.toThrow(BrewError);
    });

    test('should validate brew data before insertion', async () => {
      const invalidBrewRequest = {
        ...mockBrewRequest,
        beans: {
          brand: '', // Invalid empty brand
          origin: 'Test Origin',
          processingMethod: 'washed'
        }
      } as CreateBrewRequest;

      await expect(brewService.createBrew(invalidBrewRequest, mockUser.id)).rejects.toThrow(BrewError);
      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });

    test('should set default values for optional fields', async () => {
      const requestWithoutOptional: CreateBrewRequest = {
        beans: mockBrewRequest.beans,
        parameters: mockBrewRequest.parameters,
        measurements: mockBrewRequest.measurements
        // No userName, turbulenceSteps, evaluation
      };

      const mockResponse = {
        data: mockBrewRecord,
        error: null
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      await brewService.createBrew(requestWithoutOptional, mockUser.id);

      const insertCall = mockSupabase.insert.mock.calls[0][0];
      expect(insertCall.turbulence_steps).toEqual([]);
      expect(insertCall.is_shared).toBe(false);
      expect(insertCall.is_favorite).toBe(false);
    });
  });

  // RED: Test brew retrieval
  describe('getBrewById', () => {
    test('should retrieve a brew by id successfully', async () => {
      const mockResponse = {
        data: mockBrewRecord,
        error: null
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const result = await brewService.getBrewById('brew-123', mockUser.id);

      expect(result).toEqual(mockBrewRecord);
      expect(mockSupabase.from).toHaveBeenCalledWith('brews');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'brew-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    test('should handle brew not found', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'No rows returned', code: 'PGRST116' }
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      await expect(brewService.getBrewById('nonexistent', mockUser.id)).rejects.toThrow(BrewError);
    });

    test('should handle database errors', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'Database connection failed', code: 'DB_ERROR' }
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      await expect(brewService.getBrewById('brew-123', mockUser.id)).rejects.toThrow(BrewError);
    });
  });

  // RED: Test brew listing with filters
  describe('getBrews', () => {
    const mockBrewsList = [mockBrewRecord, { ...mockBrewRecord, id: 'brew-456' }];

    test('should get brews with pagination', async () => {
      const mockResponse = {
        data: mockBrewsList,
        error: null,
        count: 2
      };
      mockSupabase.range.mockResolvedValue(mockResponse);

      const filters: BrewListFilters = {
        userId: mockUser.id,
        page: 1,
        limit: 10
      };

      const result = await brewService.getBrews(filters);

      expect(result.brews).toHaveLength(2);
      expect(result.pagination.totalRecords).toBe(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('brews');
      expect(mockSupabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9); // page 1, limit 10
    });

    test('should apply brewing method filter', async () => {
      const mockResponse = {
        data: mockBrewsList.filter(b => b.parameters.brewingMethod === 'pour-over'),
        error: null,
        count: 1
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const filters: BrewListFilters = {
        userId: mockUser.id,
        method: 'pour-over'
      };

      await brewService.getBrews(filters);

      expect(mockSupabase.eq).toHaveBeenCalledWith('parameters->>brewingMethod', 'pour-over');
    });

    test('should apply date range filters', async () => {
      const mockResponse = {
        data: mockBrewsList,
        error: null,
        count: 2
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const filters: BrewListFilters = {
        userId: mockUser.id,
        dateFrom: '2023-11-01',
        dateTo: '2023-11-30'
      };

      await brewService.getBrews(filters);

      expect(mockSupabase.gte).toHaveBeenCalledWith('created_at', '2023-11-01');
      expect(mockSupabase.lte).toHaveBeenCalledWith('created_at', '2023-11-30');
    });

    test('should apply favorites filter', async () => {
      const mockResponse = {
        data: mockBrewsList.filter(b => b.is_favorite),
        error: null,
        count: 0
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const filters: BrewListFilters = {
        userId: mockUser.id,
        favorites: true
      };

      await brewService.getBrews(filters);

      expect(mockSupabase.eq).toHaveBeenCalledWith('is_favorite', true);
    });

    test('should apply search filter', async () => {
      const mockResponse = {
        data: mockBrewsList,
        error: null,
        count: 2
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const filters: BrewListFilters = {
        userId: mockUser.id,
        search: 'Ethiopian'
      };

      await brewService.getBrews(filters);

      expect(mockSupabase.ilike).toHaveBeenCalledWith('beans->>brand', '%Ethiopian%');
    });

    test('should handle empty results', async () => {
      const mockResponse = {
        data: [],
        error: null,
        count: 0
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const filters: BrewListFilters = {
        userId: mockUser.id
      };

      const result = await brewService.getBrews(filters);

      expect(result.brews).toHaveLength(0);
      expect(result.pagination.totalRecords).toBe(0);
    });
  });

  // RED: Test brew update
  describe('updateBrew', () => {
    test('should update a brew successfully', async () => {
      const updateRequest: UpdateBrewRequest = {
        userName: 'Updated Brew Name',
        isFavorite: true,
        evaluation: {
          type: 'quick',
          overallQuality: 9,
          notes: 'Even better now!'
        }
      };

      const updatedBrew = { ...mockBrewRecord, user_name: 'Updated Brew Name', is_favorite: true };
      const mockResponse = {
        data: updatedBrew,
        error: null
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const result = await brewService.updateBrew('brew-123', updateRequest, mockUser.id);

      expect(result).toEqual(updatedBrew);
      expect(mockSupabase.from).toHaveBeenCalledWith('brews');
      expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
        user_name: 'Updated Brew Name',
        is_favorite: true,
        evaluation: updateRequest.evaluation
      }));
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'brew-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    test('should validate update data', async () => {
      const invalidUpdate: UpdateBrewRequest = {
        beans: {
          brand: '', // Invalid empty brand
          origin: 'Test',
          processingMethod: 'washed'
        }
      };

      await expect(brewService.updateBrew('brew-123', invalidUpdate, mockUser.id)).rejects.toThrow(BrewError);
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    test('should handle brew not found during update', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'No rows returned', code: 'PGRST116' }
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const updateRequest: UpdateBrewRequest = {
        userName: 'Updated Name'
      };

      await expect(brewService.updateBrew('nonexistent', updateRequest, mockUser.id)).rejects.toThrow(BrewError);
    });

    test('should recalculate ratio when measurements are updated', async () => {
      const updateRequest: UpdateBrewRequest = {
        measurements: {
          coffeeBeansWeight: 20,
          waterWeight: 300
        }
      };

      const updatedBrew = { ...mockBrewRecord, measurements: { coffeeBeansWeight: 20, waterWeight: 300, coffeeToWaterRatio: 15.0 } };
      const mockResponse = {
        data: updatedBrew,
        error: null
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      await brewService.updateBrew('brew-123', updateRequest, mockUser.id);

      const updateCall = mockSupabase.update.mock.calls[0][0];
      expect(updateCall.measurements.coffeeToWaterRatio).toBe(15);
    });
  });

  // RED: Test brew deletion
  describe('deleteBrew', () => {
    test('should delete a brew successfully', async () => {
      const mockResponse = {
        data: mockBrewRecord,
        error: null
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const result = await brewService.deleteBrew('brew-123', mockUser.id);

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('brews');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'brew-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    test('should handle brew not found during deletion', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'No rows returned', code: 'PGRST116' }
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      await expect(brewService.deleteBrew('nonexistent', mockUser.id)).rejects.toThrow(BrewError);
    });

    test('should handle database errors during deletion', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'Database connection failed', code: 'DB_ERROR' }
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      await expect(brewService.deleteBrew('brew-123', mockUser.id)).rejects.toThrow(BrewError);
    });
  });

  // RED: Test brew sequence number generation
  describe('getNextBrewSequence', () => {
    test('should get next sequence number for new user', async () => {
      const mockResponse = {
        data: [],
        error: null
      };
      mockSupabase.single.mockResolvedValue(mockResponse);

      const sequence = await brewService.getNextBrewSequence(mockUser.id);

      expect(sequence).toBe(1);
      expect(mockSupabase.from).toHaveBeenCalledWith('brews');
      expect(mockSupabase.select).toHaveBeenCalledWith('brew_number', { count: 'exact' });
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    test('should get next sequence number for existing user', async () => {
      const mockResponse = {
        data: [
          { brew_number: 'B-2023-001' },
          { brew_number: 'B-2023-002' },
          { brew_number: 'B-2023-003' }
        ],
        error: null,
        count: 3
      };
      mockSupabase.eq.mockResolvedValue(mockResponse);

      const sequence = await brewService.getNextBrewSequence(mockUser.id);

      expect(sequence).toBe(4);
    });

    test('should handle database errors in sequence generation', async () => {
      const mockResponse = {
        data: null,
        error: { message: 'Database connection failed', code: 'DB_ERROR' }
      };
      mockSupabase.eq.mockResolvedValue(mockResponse);

      await expect(brewService.getNextBrewSequence(mockUser.id)).rejects.toThrow(BrewError);
    });
  });
});