// TASK-008B: Collections & Organization - Collection Data Service
// Rapid Iteration: Build-first approach with mock data for UI development

import { 
  Collection, 
  CollectionWithBrews, 
  CollectionSummary, 
  CreateCollectionRequest, 
  UpdateCollectionRequest,
  CollectionFilters,
  FavoriteOperation,
  BulkCollectionOperation,
  CollectionStats,
  SYSTEM_COLLECTIONS
} from '../types/collections';
import { BrewRecord, CVADescriptiveEvaluation } from '../types/brew';

// Mock data for development - will be replaced with API calls
const mockCollections: Collection[] = [
  {
    id: '1',
    userId: 'user-123',
    name: 'Ethiopian Experiments',
    description: 'Various Ethiopian coffee brewing attempts',
    color: '#6B8E23',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    brewIds: ['brew-1', 'brew-2', 'brew-7']
  },
  {
    id: '2',
    userId: 'user-123',
    name: 'Weekend Brewing',
    description: 'Relaxed weekend coffee sessions',
    color: '#9370DB',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-22T11:15:00Z',
    brewIds: ['brew-3', 'brew-4']
  },
  {
    id: '3',
    userId: 'user-123',
    name: 'Pour Over Masters',
    description: 'Perfecting the pour over technique',
    color: '#4682B4',
    createdAt: '2024-01-18T07:30:00Z',
    updatedAt: '2024-01-23T09:45:00Z',
    brewIds: ['brew-1', 'brew-5', 'brew-8']
  }
];

// Mock favorites - in real implementation this would be stored separately
const mockFavorites = new Set(['brew-1', 'brew-3', 'brew-7']);

export class CollectionsService {
  
  /**
   * Get all collections for the current user
   */
  static async getCollections(filters?: CollectionFilters): Promise<CollectionSummary[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let collections = [...mockCollections];
    
    // Apply search filter
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      collections = collections.filter(collection => 
        collection.name.toLowerCase().includes(query) ||
        collection.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (filters?.sortBy) {
      collections.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'brewCount':
            aValue = a.brewIds.length;
            bValue = b.brewIds.length;
            break;
          case 'lastActivity':
            aValue = new Date(a.updatedAt);
            bValue = new Date(b.updatedAt);
            break;
          default:
            return 0;
        }
        
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    // Convert to summary format
    return collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      color: collection.color,
      brewCount: collection.brewIds.length,
      lastBrewDate: collection.updatedAt,
      previewBrews: [] // Mock - would fetch first few brews
    }));
  }
  
  /**
   * Get a specific collection with full brew data
   */
  static async getCollection(id: string): Promise<CollectionWithBrews | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const collection = mockCollections.find(c => c.id === id);
    if (!collection) return null;
    
    // Mock brew data - in real implementation would fetch from brew service
    const mockBrews: BrewRecord[] = collection.brewIds.map(brewId => ({
      id: brewId,
      userId: 'user-123',
      brewNumber: `B-${brewId.slice(-3).padStart(3, '0')}`,
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
      isShared: false,
      isFavorite: mockFavorites.has(brewId),
      beans: {
        brand: `Test Coffee ${brewId}`,
        origin: 'Test Origin',
        processingMethod: 'washed'
      },
      parameters: {
        brewingMethod: 'pour-over',
        grinderModel: 'Test Grinder',
        grinderSetting: 15,
        waterTemperature: 92
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 22,
        waterWeight: 350,
        coffeeToWaterRatio: 15.91
      },
      evaluation: {
        type: 'quick',
        overallQuality: 8.2 + Math.random() * 1.5,
        notes: `Test brew notes for ${brewId}`
      }
    }));
    
    const qualities = mockBrews
      .map(brew => {
        if (!brew.evaluation) return 0;
        switch (brew.evaluation.type) {
          case 'quick':
            return brew.evaluation.overallQuality || 0;
          case 'cva_affective':
            return brew.evaluation.scaScore || 0;
          case 'sca':
            return brew.evaluation.finalScore || 0;
          case 'cva_descriptive':
            // Use average intensity across all sections as overall quality measure
            const descEval = brew.evaluation as CVADescriptiveEvaluation;
            const intensities = [
              descEval.fragrance?.intensity || 0,
              descEval.aroma?.intensity || 0,
              descEval.flavor?.intensity || 0,
              descEval.aftertaste?.intensity || 0,
              descEval.acidity?.intensity || 0,
              descEval.sweetness?.intensity || 0,
              descEval.mouthfeel?.intensity || 0
            ];
            return intensities.reduce((sum, int) => sum + int, 0) / intensities.length;
          default:
            return 0;
        }
      })
      .filter(q => q > 0);
    
    return {
      ...collection,
      brews: mockBrews,
      brewCount: mockBrews.length,
      lastBrewDate: Math.max(...mockBrews.map(b => new Date(b.createdAt).getTime())).toString(),
      averageQuality: qualities.length > 0 
        ? qualities.reduce((sum, q) => sum + q, 0) / qualities.length 
        : undefined
    };
  }
  
  /**
   * Create a new collection
   */
  static async createCollection(request: CreateCollectionRequest): Promise<Collection> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCollection: Collection = {
      id: `collection-${Date.now()}`,
      userId: 'user-123',
      name: request.name,
      description: request.description,
      color: request.color || '#4682B4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      brewIds: request.brewIds || []
    };
    
    mockCollections.push(newCollection);
    return newCollection;
  }
  
  /**
   * Update an existing collection
   */
  static async updateCollection(id: string, request: UpdateCollectionRequest): Promise<Collection | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const collectionIndex = mockCollections.findIndex(c => c.id === id);
    if (collectionIndex === -1) return null;
    
    const updatedCollection = {
      ...mockCollections[collectionIndex],
      ...request,
      updatedAt: new Date().toISOString()
    };
    
    mockCollections[collectionIndex] = updatedCollection;
    return updatedCollection;
  }
  
  /**
   * Delete a collection
   */
  static async deleteCollection(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const collectionIndex = mockCollections.findIndex(c => c.id === id);
    if (collectionIndex === -1) return false;
    
    mockCollections.splice(collectionIndex, 1);
    return true;
  }
  
  /**
   * Add brews to a collection
   */
  static async addBrewsToCollection(collectionId: string, brewIds: string[]): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const collection = mockCollections.find(c => c.id === collectionId);
    if (!collection) return false;
    
    // Add new brew IDs, avoiding duplicates
    const newBrewIds = brewIds.filter(id => !collection.brewIds.includes(id));
    collection.brewIds.push(...newBrewIds);
    collection.updatedAt = new Date().toISOString();
    
    return true;
  }
  
  /**
   * Remove brews from a collection
   */
  static async removeBrewsFromCollection(collectionId: string, brewIds: string[]): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const collection = mockCollections.find(c => c.id === collectionId);
    if (!collection) return false;
    
    collection.brewIds = collection.brewIds.filter(id => !brewIds.includes(id));
    collection.updatedAt = new Date().toISOString();
    
    return true;
  }
  
  /**
   * Bulk collection operations
   */
  static async bulkCollectionOperation(operation: BulkCollectionOperation): Promise<boolean> {
    if (operation.action === 'add') {
      return await this.addBrewsToCollection(operation.collectionId, operation.brewIds);
    } else {
      return await this.removeBrewsFromCollection(operation.collectionId, operation.brewIds);
    }
  }
  
  /**
   * Get collections that contain a specific brew
   */
  static async getBrewCollections(brewId: string): Promise<CollectionSummary[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const collections = mockCollections
      .filter(collection => collection.brewIds.includes(brewId))
      .map(collection => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        color: collection.color,
        brewCount: collection.brewIds.length,
        lastBrewDate: collection.updatedAt,
        previewBrews: []
      }));
    
    return collections;
  }
  
  /**
   * Toggle favorite status for a brew
   */
  static async toggleFavorite(operation: FavoriteOperation): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (operation.isFavorite) {
      mockFavorites.add(operation.brewId);
    } else {
      mockFavorites.delete(operation.brewId);
    }
    
    return true;
  }
  
  /**
   * Get all favorite brews
   */
  static async getFavorites(): Promise<BrewRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock implementation - would fetch actual brews
    return Array.from(mockFavorites).map(brewId => ({
      id: brewId,
      userId: 'user-123',
      brewNumber: `B-${brewId.slice(-3).padStart(3, '0')}`,
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
      isShared: false,
      isFavorite: true,
      beans: {
        brand: `Favorite Coffee ${brewId}`,
        origin: 'Premium Origin',
        processingMethod: 'washed'
      },
      parameters: {
        brewingMethod: 'pour-over',
        grinderModel: 'Premium Grinder',
        grinderSetting: 15,
        waterTemperature: 92
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 22,
        waterWeight: 350,
        coffeeToWaterRatio: 15.91
      },
      evaluation: {
        type: 'quick',
        overallQuality: 8.5 + Math.random() * 1.0,
        notes: `Favorite brew notes for ${brewId}`
      }
    }));
  }
  
  /**
   * Check if a brew is favorited
   */
  static async isFavorite(brewId: string): Promise<boolean> {
    return mockFavorites.has(brewId);
  }
  
  /**
   * Get collection statistics
   */
  static async getCollectionStats(): Promise<CollectionStats> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const totalBrews = mockCollections.reduce((sum, collection) => sum + collection.brewIds.length, 0);
    const nonEmptyCollections = mockCollections.filter(c => c.brewIds.length > 0);
    const mostUsedCollection = mockCollections.reduce((max, collection) => 
      collection.brewIds.length > max.brewIds.length ? collection : max,
      mockCollections[0]
    );
    
    return {
      totalCollections: mockCollections.length,
      totalFavorites: mockFavorites.size,
      averageBrewsPerCollection: nonEmptyCollections.length > 0 ? totalBrews / nonEmptyCollections.length : 0,
      mostUsedCollection: {
        id: mostUsedCollection.id,
        name: mostUsedCollection.name,
        brewCount: mostUsedCollection.brewIds.length
      },
      recentActivity: {
        collectionsCreated: 2, // Mock data
        brewsAddedToCollections: 8,
        favoritesChanged: 3
      }
    };
  }
  
  /**
   * Get system collections (Favorites, Recent, etc.)
   */
  static async getSystemCollections(): Promise<CollectionSummary[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return [
      {
        id: SYSTEM_COLLECTIONS.FAVORITES.id,
        name: SYSTEM_COLLECTIONS.FAVORITES.name,
        description: SYSTEM_COLLECTIONS.FAVORITES.description,
        color: SYSTEM_COLLECTIONS.FAVORITES.color,
        brewCount: mockFavorites.size,
        previewBrews: []
      },
      {
        id: SYSTEM_COLLECTIONS.RECENT.id,
        name: SYSTEM_COLLECTIONS.RECENT.name,
        description: SYSTEM_COLLECTIONS.RECENT.description,
        color: SYSTEM_COLLECTIONS.RECENT.color,
        brewCount: 5, // Mock - last 30 days
        previewBrews: []
      },
      {
        id: SYSTEM_COLLECTIONS.HIGH_RATED.id,
        name: SYSTEM_COLLECTIONS.HIGH_RATED.name,
        description: SYSTEM_COLLECTIONS.HIGH_RATED.description,
        color: SYSTEM_COLLECTIONS.HIGH_RATED.color,
        brewCount: 3, // Mock - quality 8.0+
        previewBrews: []
      }
    ];
  }
  
  /**
   * Search collections by name or description
   */
  static async searchCollections(query: string): Promise<CollectionSummary[]> {
    const filters: CollectionFilters = {
      searchQuery: query,
      sortBy: 'name',
      sortOrder: 'asc'
    };
    
    return this.getCollections(filters);
  }
}