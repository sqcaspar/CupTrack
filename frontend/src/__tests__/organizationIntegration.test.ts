// TASK-008C: Organization Integration Testing - Core Integration Tests
// TDD Core: Essential integration tests for organization functionality

import { CollectionsService } from '../services/collectionsService';
import { exportBrews, exportCollections } from '../utils/exportUtils';
import { FavoriteButton } from '../components/collections/FavoriteButton';

// Mock dependencies
jest.mock('../services/brewService', () => ({
  getBrewService: () => ({
    getBrews: jest.fn().mockResolvedValue({
      brews: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1
    }),
    updateBrew: jest.fn().mockResolvedValue(true)
  })
}));

jest.mock('../utils/csvExport', () => ({
  exportBrewsToCSV: jest.fn().mockResolvedValue('csv-content'),
  exportCollectionsToCSV: jest.fn().mockResolvedValue('csv-content')
}));

jest.mock('../utils/pdfExport', () => ({
  exportBrewsToPDF: jest.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' })),
  exportCollectionsToPDF: jest.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
}));

describe('Organization Integration Testing', () => {
  beforeEach(() => {
    // Reset localStorage for each test
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
    
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Collections CRUD Integration', () => {
    test('should create, read, update, and delete collections', async () => {
      // CREATE - Test collection creation
      const collection = await CollectionsService.createCollection({
        name: 'Integration Test Collection',
        description: 'Test collection for integration testing',
        color: '#10b981',
        brewIds: ['brew-1', 'brew-2']
      });

      expect(collection).toBeDefined();
      expect(collection.name).toBe('Integration Test Collection');
      expect(collection.brewIds).toEqual(['brew-1', 'brew-2']);
      expect(collection.id).toBeTruthy();

      // READ - Test getting collections
      const collections = await CollectionsService.getCollections();
      expect(collections).toHaveLength(1);
      expect(collections[0].name).toBe('Integration Test Collection');

      // UPDATE - Test updating collection
      const updatedCollection = await CollectionsService.updateCollection(collection.id, {
        name: 'Updated Collection Name',
        description: 'Updated description'
      });

      expect(updatedCollection.name).toBe('Updated Collection Name');
      expect(updatedCollection.description).toBe('Updated description');

      // DELETE - Test deletion
      const deleteResult = await CollectionsService.deleteCollection(collection.id);
      expect(deleteResult).toBe(true);

      // Verify deletion
      const collectionsAfterDelete = await CollectionsService.getCollections();
      expect(collectionsAfterDelete).toHaveLength(0);
    });

    test('should handle collection validation correctly', async () => {
      // Test validation works
      await expect(
        CollectionsService.createCollection({ name: '' })
      ).rejects.toThrow();

      // Test successful creation with valid data
      const validCollection = await CollectionsService.createCollection({
        name: 'Valid Collection'
      });

      expect(validCollection.name).toBe('Valid Collection');
      expect(validCollection.brewIds).toEqual([]);
    });

    test('should handle collection filtering and sorting', async () => {
      // Create multiple collections
      await CollectionsService.createCollection({ name: 'Alpha Collection' });
      await CollectionsService.createCollection({ name: 'Beta Collection' });
      await CollectionsService.createCollection({ name: 'Gamma Collection' });

      // Test filtering by search
      const filtered = await CollectionsService.getCollections({
        searchQuery: 'Alpha'
      });
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.some(c => c.name.includes('Alpha'))).toBe(true);

      // Test sorting
      const sorted = await CollectionsService.getCollections({
        sortBy: 'name',
        sortOrder: 'asc'
      });
      expect(sorted.length).toBeGreaterThanOrEqual(3);

      // Verify collections exist
      const allCollections = await CollectionsService.getCollections();
      expect(allCollections.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Export Integration', () => {
    test('should export brews to CSV format', async () => {
      const exportResult = await exportBrews({
        format: 'csv',
        brewIds: ['brew-1', 'brew-2'],
        includeCollections: true
      });

      expect(exportResult).toBe('csv-content');
    });

    test('should export brews to PDF format', async () => {
      const exportResult = await exportBrews({
        format: 'pdf',
        brewIds: ['brew-1'],
        includeCollections: true
      });

      expect(exportResult).toBeInstanceOf(Blob);
      expect((exportResult as Blob).type).toBe('application/pdf');
    });

    test('should export collections to CSV format', async () => {
      const exportResult = await exportCollections({
        format: 'csv',
        collectionIds: ['collection-1'],
        includeBrewDetails: true
      });

      expect(exportResult).toBe('csv-content');
    });

    test('should validate export parameters', async () => {
      // Test invalid format
      await expect(
        exportBrews({ format: 'invalid' as any, brewIds: ['brew-1'] })
      ).rejects.toThrow('Unsupported export format');

      // Test empty brew IDs
      await expect(
        exportBrews({ format: 'csv', brewIds: [] })
      ).rejects.toThrow();
    });

    test('should enforce export size limits', async () => {
      const largeBrewIds = Array.from({ length: 10001 }, (_, i) => `brew-${i}`);
      
      await expect(
        exportBrews({ format: 'csv', brewIds: largeBrewIds })
      ).rejects.toThrow('Export size exceeds maximum limit');
    });
  });

  describe('Favorites System Integration', () => {
    test('should toggle favorite status', async () => {
      const result = await CollectionsService.toggleFavorite({
        brewId: 'brew-1',
        isFavorite: true
      });

      expect(result).toBe(true);
    });

    test('should handle system collections', async () => {
      const systemCollections = await CollectionsService.getSystemCollections();
      
      expect(systemCollections).toBeDefined();
      expect(Array.isArray(systemCollections)).toBe(true);
      expect(systemCollections.length).toBeGreaterThan(0);

      // Verify system collections have required fields
      systemCollections.forEach(collection => {
        expect(collection.id).toBeTruthy();
        expect(collection.name).toBeTruthy();
        expect(collection.description).toBeTruthy();
        expect(typeof collection.brewCount).toBe('number');
      });
    });
  });

  describe('Performance and Error Handling', () => {
    test('should handle multiple concurrent operations', async () => {
      const createPromises = Array.from({ length: 5 }, (_, i) => 
        CollectionsService.createCollection({
          name: `Concurrent Collection ${i + Date.now()}`
        })
      );

      const collections = await Promise.all(createPromises);
      
      expect(collections).toHaveLength(5);
      
      // Verify all collections have unique IDs
      const ids = collections.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    test('should handle errors gracefully', async () => {
      // Test handling of invalid operations
      await expect(
        CollectionsService.deleteCollection('non-existent-id')
      ).rejects.toThrow();

      await expect(
        CollectionsService.updateCollection('non-existent-id', { name: 'Test' })
      ).rejects.toThrow();
    });

    test('should handle large datasets efficiently', async () => {
      const startTime = Date.now();
      
      // Create a collection with many brew IDs
      const largeBrewIds = Array.from({ length: 100 }, (_, i) => `brew-${i}`);
      const collection = await CollectionsService.createCollection({
        name: 'Large Collection',
        brewIds: largeBrewIds
      });
      
      const endTime = Date.now();
      
      expect(collection.brewIds).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Data Integrity', () => {
    test('should maintain data consistency across operations', async () => {
      // Create collection
      const collection = await CollectionsService.createCollection({
        name: 'Data Integrity Test',
        brewIds: ['brew-1', 'brew-2']
      });

      // Update collection
      const updated = await CollectionsService.updateCollection(collection.id, {
        name: 'Updated Name'
      });

      // Verify update maintained other fields
      expect(updated.name).toBe('Updated Name');
      expect(updated.brewIds).toEqual(['brew-1', 'brew-2']);
      expect(updated.id).toBe(collection.id);

      // Verify timestamps
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
        new Date(collection.createdAt).getTime()
      );
    });

    test('should prevent data corruption during errors', async () => {
      // Create valid collection
      const collection = await CollectionsService.createCollection({
        name: 'Test Collection'
      });

      // Attempt invalid update
      try {
        await CollectionsService.updateCollection(collection.id, {
          name: '' // Invalid empty name
        });
      } catch (error) {
        // Verify original collection is still intact
        const collections = await CollectionsService.getCollections();
        const originalCollection = collections.find(c => c.id === collection.id);
        expect(originalCollection?.name).toBe('Test Collection');
      }
    });
  });

  describe('Cross-Component Integration', () => {
    test('should integrate collections with export functionality', async () => {
      // Create collection
      const collection = await CollectionsService.createCollection({
        name: 'Export Test Collection',
        brewIds: ['brew-1', 'brew-2']
      });

      // Export collection
      const exportResult = await exportCollections({
        format: 'csv',
        collectionIds: [collection.id],
        includeBrewDetails: false
      });

      expect(exportResult).toBe('csv-content');
    });

    test('should validate integration between services', async () => {
      // Test that collections service can work with brew service
      const collection = await CollectionsService.createCollection({
        name: 'Service Integration Test',
        brewIds: ['brew-1']
      });

      // Test favorites integration
      const favoriteResult = await CollectionsService.toggleFavorite({
        brewId: 'brew-1',
        isFavorite: true
      });

      expect(favoriteResult).toBe(true);
      expect(collection.brewIds).toContain('brew-1');
    });
  });
});