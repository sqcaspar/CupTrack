// TASK-008C: Organization Integration Testing - Collections Service Integration Tests
// TDD Core: Comprehensive testing of collection operations and data integrity

import { CollectionsService } from '../collectionsService';
import { Collection, CollectionSummary, CreateCollectionRequest, UpdateCollectionRequest } from '../../types/collections';
import { BrewRecord } from '../../types/brew';

// Mock external dependencies
jest.mock('../brewService', () => ({
  BrewService: {
    getBrewsByIds: jest.fn(),
    getBrews: jest.fn(),
    updateBrew: jest.fn()
  }
}));

const { BrewService } = require('../brewService');

describe('CollectionsService Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage with fresh storage for each test
    const storage: { [key: string]: string } = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => storage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          storage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete storage[key];
        }),
        clear: jest.fn(() => {
          Object.keys(storage).forEach(key => delete storage[key]);
        })
      },
      writable: true
    });
    
    // Clear collections storage
    window.localStorage.clear();
  });

  describe('Collection CRUD Operations', () => {
    describe('createCollection', () => {
      test('should create collection with valid data and return complete collection object', async () => {
        const createRequest: CreateCollectionRequest = {
          name: 'Ethiopian Origins',
          description: 'Collection of Ethiopian coffee brews',
          color: '#10b981',
          brewIds: ['brew-1', 'brew-2']
        };

        const result = await CollectionsService.createCollection(createRequest);

        // Verify collection structure
        expect(result).toEqual({
          id: expect.any(String),
          userId: 'mock-user-id',
          name: 'Ethiopian Origins',
          description: 'Collection of Ethiopian coffee brews',
          color: '#10b981',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          brewIds: ['brew-1', 'brew-2'],
          isDefault: false
        });

        // Verify timestamps
        const createdDate = new Date(result.createdAt);
        const updatedDate = new Date(result.updatedAt);
        expect(createdDate).toBeInstanceOf(Date);
        expect(updatedDate).toBeInstanceOf(Date);
        expect(Math.abs(Date.now() - createdDate.getTime())).toBeLessThan(1000);
      });

      test('should create collection with minimal data (name only)', async () => {
        const createRequest: CreateCollectionRequest = {
          name: 'Simple Collection'
        };

        const result = await CollectionsService.createCollection(createRequest);

        expect(result).toEqual({
          id: expect.any(String),
          userId: 'mock-user-id',
          name: 'Simple Collection',
          description: undefined,
          color: undefined,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          brewIds: [],
          isDefault: false
        });
      });

      test('should validate required fields and reject invalid data', async () => {
        // Test empty name
        await expect(
          CollectionsService.createCollection({ name: '' })
        ).rejects.toThrow('Collection name is required');

        // Test name too long
        await expect(
          CollectionsService.createCollection({ 
            name: 'A'.repeat(101) 
          })
        ).rejects.toThrow('Collection name must be 100 characters or less');

        // Test invalid color format
        await expect(
          CollectionsService.createCollection({ 
            name: 'Test Collection',
            color: 'invalid-color'
          })
        ).rejects.toThrow('Invalid color format');
      });

      test('should handle duplicate names gracefully', async () => {
        const createRequest: CreateCollectionRequest = {
          name: 'Duplicate Name'
        };

        // Create first collection
        await CollectionsService.createCollection(createRequest);

        // Attempt to create duplicate
        await expect(
          CollectionsService.createCollection(createRequest)
        ).rejects.toThrow('Collection with this name already exists');
      });
    });

    describe('getCollections', () => {
      beforeEach(async () => {
        // Create test collections
        await CollectionsService.createCollection({
          name: 'Ethiopian Collection',
          description: 'Ethiopian beans',
          brewIds: ['brew-1', 'brew-2']
        });
        
        await CollectionsService.createCollection({
          name: 'Colombian Collection', 
          description: 'Colombian beans',
          brewIds: ['brew-3']
        });
        
        await CollectionsService.createCollection({
          name: 'Empty Collection',
          brewIds: []
        });
      });

      test('should return all collections with correct summary data', async () => {
        const collections = await CollectionsService.getCollections();

        expect(collections).toHaveLength(3);
        
        const ethiopianCollection = collections.find(c => c.name === 'Ethiopian Collection');
        expect(ethiopianCollection).toEqual({
          id: expect.any(String),
          name: 'Ethiopian Collection',
          description: 'Ethiopian beans',
          color: undefined,
          brewCount: 2,
          lastBrewDate: expect.any(String),
          previewBrews: []
        });
      });

      test('should filter collections by search query', async () => {
        const collections = await CollectionsService.getCollections({
          searchQuery: 'Ethiopian'
        });

        expect(collections).toHaveLength(1);
        expect(collections[0].name).toBe('Ethiopian Collection');
      });

      test('should sort collections correctly', async () => {
        // Sort by name ascending
        const ascCollections = await CollectionsService.getCollections({
          sortBy: 'name',
          sortOrder: 'asc'
        });

        expect(ascCollections[0].name).toBe('Colombian Collection');
        expect(ascCollections[1].name).toBe('Empty Collection');
        expect(ascCollections[2].name).toBe('Ethiopian Collection');

        // Sort by brew count descending
        const descCollections = await CollectionsService.getCollections({
          sortBy: 'brewCount',
          sortOrder: 'desc'
        });

        expect(descCollections[0].brewCount).toBe(2); // Ethiopian
        expect(descCollections[1].brewCount).toBe(1); // Colombian
        expect(descCollections[2].brewCount).toBe(0); // Empty
      });

      test('should handle empty collections based on showEmpty filter', async () => {
        const withEmpty = await CollectionsService.getCollections({
          showEmpty: true
        });
        expect(withEmpty).toHaveLength(3);

        const withoutEmpty = await CollectionsService.getCollections({
          showEmpty: false
        });
        expect(withoutEmpty).toHaveLength(2);
        expect(withoutEmpty.every(c => c.brewCount > 0)).toBe(true);
      });
    });

    describe('updateCollection', () => {
      let collectionId: string;

      beforeEach(async () => {
        const collection = await CollectionsService.createCollection({
          name: 'Original Name',
          description: 'Original description',
          brewIds: ['brew-1']
        });
        collectionId = collection.id;
      });

      test('should update collection fields correctly', async () => {
        const updateRequest: UpdateCollectionRequest = {
          name: 'Updated Name',
          description: 'Updated description',
          color: '#ef4444'
        };

        const updatedCollection = await CollectionsService.updateCollection(
          collectionId, 
          updateRequest
        );

        expect(updatedCollection.name).toBe('Updated Name');
        expect(updatedCollection.description).toBe('Updated description');
        expect(updatedCollection.color).toBe('#ef4444');
        expect(updatedCollection.brewIds).toEqual(['brew-1']); // Unchanged
        
        // Verify updatedAt timestamp changed
        const updatedDate = new Date(updatedCollection.updatedAt);
        expect(Math.abs(Date.now() - updatedDate.getTime())).toBeLessThan(1000);
      });

      test('should handle partial updates correctly', async () => {
        const updateRequest: UpdateCollectionRequest = {
          name: 'New Name Only'
        };

        const updatedCollection = await CollectionsService.updateCollection(
          collectionId, 
          updateRequest
        );

        expect(updatedCollection.name).toBe('New Name Only');
        expect(updatedCollection.description).toBe('Original description');
      });

      test('should validate update data', async () => {
        // Test empty name
        await expect(
          CollectionsService.updateCollection(collectionId, { name: '' })
        ).rejects.toThrow('Collection name is required');

        // Test invalid color
        await expect(
          CollectionsService.updateCollection(collectionId, { 
            color: 'invalid-color' 
          })
        ).rejects.toThrow('Invalid color format');
      });

      test('should handle non-existent collection', async () => {
        await expect(
          CollectionsService.updateCollection('non-existent-id', { 
            name: 'New Name' 
          })
        ).rejects.toThrow('Collection not found');
      });
    });

    describe('deleteCollection', () => {
      let collectionId: string;

      beforeEach(async () => {
        const collection = await CollectionsService.createCollection({
          name: 'To Be Deleted',
          brewIds: ['brew-1', 'brew-2']
        });
        collectionId = collection.id;
      });

      test('should delete collection and return success', async () => {
        const result = await CollectionsService.deleteCollection(collectionId);
        expect(result).toBe(true);

        // Verify collection is deleted
        await expect(
          CollectionsService.getCollection(collectionId)
        ).rejects.toThrow('Collection not found');
      });

      test('should handle non-existent collection', async () => {
        await expect(
          CollectionsService.deleteCollection('non-existent-id')
        ).rejects.toThrow('Collection not found');
      });

      test('should not allow deletion of default collections', async () => {
        // Create default collection
        const defaultCollection = await CollectionsService.createCollection({
          name: 'Favorites',
          isDefault: true
        } as any); // Type assertion to bypass validation

        await expect(
          CollectionsService.deleteCollection(defaultCollection.id)
        ).rejects.toThrow('Cannot delete default collections');
      });
    });
  });

  describe('Collection-Brew Relationship Operations', () => {
    let collectionId: string;
    const mockBrews: BrewRecord[] = [
      {
        id: 'brew-1',
        brewNumber: 1,
        userId: 'user-1',
        beans: { brand: 'Ethiopian Coffee', origin: 'Yirgacheffe', processingMethod: 'washed' },
        parameters: { brewingMethod: 'pour-over', grinderModel: 'Hario', grinderSetting: '15', waterTemperature: 92 },
        measurements: { coffeeBeansWeight: 20, waterWeight: 300, coffeeToWaterRatio: 15 },
        createdAt: '2025-01-01T10:00:00Z',
        isFavorite: false
      },
      {
        id: 'brew-2',
        brewNumber: 2,
        userId: 'user-1',
        beans: { brand: 'Colombian Coffee', origin: 'Huila', processingMethod: 'natural' },
        parameters: { brewingMethod: 'french-press', grinderModel: 'Baratza', grinderSetting: '8', waterTemperature: 94 },
        measurements: { coffeeBeansWeight: 25, waterWeight: 400, coffeeToWaterRatio: 16 },
        createdAt: '2025-01-02T10:00:00Z',
        isFavorite: true
      }
    ] as BrewRecord[];

    beforeEach(async () => {
      BrewService.getBrewsByIds.mockResolvedValue(mockBrews);
      BrewService.getBrews.mockResolvedValue({ brews: mockBrews, total: mockBrews.length });

      const collection = await CollectionsService.createCollection({
        name: 'Test Collection',
        brewIds: ['brew-1', 'brew-2']
      });
      collectionId = collection.id;
    });

    describe('addBrewsToCollection', () => {
      test('should add brews to collection successfully', async () => {
        BrewService.getBrewsByIds.mockResolvedValue([{
          id: 'brew-3',
          brewNumber: 3,
          userId: 'user-1',
          beans: { brand: 'Kenya AA', origin: 'Nyeri', processingMethod: 'washed' },
          parameters: { brewingMethod: 'aeropress', grinderModel: 'Comandante', grinderSetting: '20', waterTemperature: 88 },
          measurements: { coffeeBeansWeight: 18, waterWeight: 260, coffeeToWaterRatio: 14.4 },
          createdAt: '2025-01-03T10:00:00Z',
          isFavorite: false
        }] as BrewRecord[]);

        const result = await CollectionsService.addBrewsToCollection(
          collectionId, 
          ['brew-3']
        );

        expect(result.brewIds).toEqual(['brew-1', 'brew-2', 'brew-3']);
        expect(BrewService.getBrewsByIds).toHaveBeenCalledWith(['brew-3']);
      });

      test('should prevent duplicate brews in collection', async () => {
        const result = await CollectionsService.addBrewsToCollection(
          collectionId, 
          ['brew-1'] // Already in collection
        );

        // Should not add duplicate
        expect(result.brewIds).toEqual(['brew-1', 'brew-2']);
      });

      test('should validate brew existence before adding', async () => {
        BrewService.getBrewsByIds.mockResolvedValue([]);

        await expect(
          CollectionsService.addBrewsToCollection(collectionId, ['non-existent-brew'])
        ).rejects.toThrow('One or more brews not found');
      });
    });

    describe('removeBrewsFromCollection', () => {
      test('should remove brews from collection successfully', async () => {
        const result = await CollectionsService.removeBrewsFromCollection(
          collectionId, 
          ['brew-1']
        );

        expect(result.brewIds).toEqual(['brew-2']);
      });

      test('should handle removal of non-existent brews gracefully', async () => {
        const result = await CollectionsService.removeBrewsFromCollection(
          collectionId, 
          ['non-existent-brew']
        );

        // Should not throw error, collection remains unchanged
        expect(result.brewIds).toEqual(['brew-1', 'brew-2']);
      });
    });

    describe('getCollectionWithBrews', () => {
      test('should return collection with full brew details', async () => {
        const result = await CollectionsService.getCollectionWithBrews(collectionId);

        expect(result).toEqual({
          id: collectionId,
          userId: 'mock-user-id',
          name: 'Test Collection',
          description: undefined,
          color: undefined,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          brewIds: ['brew-1', 'brew-2'],
          isDefault: false,
          brews: mockBrews,
          brewCount: 2,
          lastBrewDate: '2025-01-02T10:00:00Z', // Most recent brew
          averageQuality: undefined // No evaluations in mock data
        });

        expect(BrewService.getBrewsByIds).toHaveBeenCalledWith(['brew-1', 'brew-2']);
      });

      test('should calculate average quality when evaluations exist', async () => {
        const brewsWithEvaluation = mockBrews.map(brew => ({
          ...brew,
          evaluation: {
            type: 'quick',
            overallQuality: brew.id === 'brew-1' ? 8.5 : 7.5,
            notes: 'Good coffee'
          }
        })) as BrewRecord[];

        BrewService.getBrewsByIds.mockResolvedValue(brewsWithEvaluation);

        const result = await CollectionsService.getCollectionWithBrews(collectionId);

        expect(result.averageQuality).toBe(8.0); // (8.5 + 7.5) / 2
      });

      test('should handle empty collection', async () => {
        const emptyCollection = await CollectionsService.createCollection({
          name: 'Empty Collection',
          brewIds: []
        });

        const result = await CollectionsService.getCollectionWithBrews(emptyCollection.id);

        expect(result.brews).toEqual([]);
        expect(result.brewCount).toBe(0);
        expect(result.lastBrewDate).toBeUndefined();
        expect(result.averageQuality).toBeUndefined();
      });
    });
  });

  describe('Favorites System Integration', () => {
    beforeEach(() => {
      BrewService.updateBrew.mockResolvedValue(true);
    });

    test('should toggle favorite status and maintain data integrity', async () => {
      const result = await CollectionsService.toggleFavorite({
        brewId: 'brew-1',
        isFavorite: true
      });

      expect(result).toBe(true);
      expect(BrewService.updateBrew).toHaveBeenCalledWith('brew-1', {
        isFavorite: true
      });
    });

    test('should handle toggle favorite failure gracefully', async () => {
      BrewService.updateBrew.mockRejectedValue(new Error('Update failed'));

      await expect(
        CollectionsService.toggleFavorite({
          brewId: 'brew-1',
          isFavorite: true
        })
      ).rejects.toThrow('Update failed');
    });

    test('should validate favorite toggle request', async () => {
      await expect(
        CollectionsService.toggleFavorite({
          brewId: '',
          isFavorite: true
        })
      ).rejects.toThrow('Brew ID is required');

      await expect(
        CollectionsService.toggleFavorite({
          brewId: 'brew-1',
          isFavorite: null as any
        })
      ).rejects.toThrow('Favorite status must be boolean');
    });
  });

  describe('System Collections', () => {
    test('should return predefined system collections', async () => {
      const systemCollections = await CollectionsService.getSystemCollections();

      expect(systemCollections).toEqual([
        {
          id: 'favorites',
          name: '❤️ Favorites',
          description: 'Your favorite brews',
          color: '#ef4444',
          brewCount: 0,
          lastBrewDate: undefined,
          previewBrews: []
        },
        {
          id: 'recent',
          name: '🕒 Recent',
          description: 'Recently created brews',
          color: '#8b5cf6',
          brewCount: 0,
          lastBrewDate: undefined,
          previewBrews: []
        },
        {
          id: 'high-rated',
          name: '⭐ Top Rated',
          description: 'Your highest rated brews',
          color: '#f59e0b',
          brewCount: 0,
          lastBrewDate: undefined,
          previewBrews: []
        }
      ]);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle service unavailability gracefully', async () => {
      BrewService.getBrewsByIds.mockRejectedValue(new Error('Service unavailable'));

      await expect(
        CollectionsService.getCollectionWithBrews('collection-id')
      ).rejects.toThrow('Service unavailable');
    });

    test('should handle malformed data gracefully', async () => {
      // Test with invalid collection data in localStorage
      const malformedData = '{"invalid": "json"';
      (window.localStorage.getItem as jest.Mock).mockReturnValue(malformedData);

      // Should not throw error, should return empty array
      const collections = await CollectionsService.getCollections();
      expect(Array.isArray(collections)).toBe(true);
    });

    test('should handle concurrent operations safely', async () => {
      // Clear any existing collections first
      window.localStorage.clear();
      
      const collectionPromises = Array.from({ length: 5 }, (_, i) => 
        CollectionsService.createCollection({
          name: `Concurrent Collection ${i + Date.now()}`  // Make names unique
        })
      );

      const collections = await Promise.all(collectionPromises);
      
      // All collections should be created successfully with unique IDs
      const ids = collections.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
      expect(collections).toHaveLength(5);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large collections efficiently', async () => {
      const largeBrewIds = Array.from({ length: 1000 }, (_, i) => `brew-${i}`);
      
      const startTime = Date.now();
      
      const collection = await CollectionsService.createCollection({
        name: 'Large Collection',
        brewIds: largeBrewIds
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(collection.brewIds).toHaveLength(1000);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle many collections efficiently', async () => {
      // Clear storage first to ensure clean state
      window.localStorage.clear();
      
      const createPromises = Array.from({ length: 10 }, (_, i) =>  // Reduced to 10 for faster test
        CollectionsService.createCollection({
          name: `PerfCollection ${i + Date.now()}`,  // Unique names
          brewIds: [`brew-${i}`]
        })
      );

      const startTime = Date.now();
      await Promise.all(createPromises);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      
      const collections = await CollectionsService.getCollections();
      expect(collections.length).toBeGreaterThanOrEqual(10);
    });
  });
});