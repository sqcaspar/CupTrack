// TASK-008C: Organization Integration Testing - Export Integration with Collections
// TDD Core: Comprehensive testing of export functionality with collections data

import { exportBrews, exportCollections } from '../exportUtils';
import { CollectionsService } from '../../services/collectionsService';
import { BrewService } from '../../services/brewService';
import { BrewRecord } from '../../types/brew';
import { CollectionWithBrews } from '../../types/collections';

// Mock services
jest.mock('../../services/collectionsService');
jest.mock('../../services/brewService', () => ({
  getBrewService: jest.fn(() => ({
    getBrews: jest.fn(),
    updateBrew: jest.fn(),
    getBrewsByIds: jest.fn()
  }))
}));
jest.mock('../csvExport');
jest.mock('../pdfExport');

const mockCollectionsService = CollectionsService as jest.Mocked<typeof CollectionsService>;
const { getBrewService } = require('../../services/brewService');
const mockBrewService = getBrewService();

// Mock CSV and PDF export utilities
const mockCsvExport = require('../csvExport');
const mockPdfExport = require('../pdfExport');

describe('Export Integration with Collections', () => {
  const mockBrews: BrewRecord[] = [
    {
      id: 'brew-1',
      brewNumber: 1,
      userId: 'user-1',
      beans: { 
        brand: 'Ethiopian Coffee', 
        origin: 'Yirgacheffe', 
        processingMethod: 'washed',
        altitude: 1800,
        roastingLevel: 'light'
      },
      parameters: { 
        brewingMethod: 'pour-over', 
        grinderModel: 'Hario Mini', 
        grinderSetting: '15', 
        waterTemperature: 92,
        filteringTools: 'V60 paper filter',
        waterQuality: 'filtered'
      },
      measurements: { 
        coffeeBeansWeight: 20, 
        waterWeight: 300, 
        coffeeToWaterRatio: 15,
        brewedCoffeeWeight: 280,
        tdsPercentage: 1.35
      },
      evaluation: {
        type: 'quick',
        overallQuality: 8.5,
        notes: 'Bright and floral with citrus notes'
      },
      createdAt: '2025-01-01T10:00:00Z',
      isFavorite: true,
      isShared: false
    },
    {
      id: 'brew-2',
      brewNumber: 2,
      userId: 'user-1',
      beans: { 
        brand: 'Colombian Coffee', 
        origin: 'Huila', 
        processingMethod: 'natural',
        altitude: 1600,
        roastingLevel: 'medium'
      },
      parameters: { 
        brewingMethod: 'french-press', 
        grinderModel: 'Baratza Encore', 
        grinderSetting: '8', 
        waterTemperature: 94,
        filteringTools: 'metal mesh',
        waterQuality: 'tap'
      },
      measurements: { 
        coffeeBeansWeight: 25, 
        waterWeight: 400, 
        coffeeToWaterRatio: 16,
        brewedCoffeeWeight: 380,
        tdsPercentage: 1.28
      },
      evaluation: {
        type: 'sca',
        scores: {
          aroma: 8,
          flavor: 7.5,
          aftertaste: 7,
          acidity: 8,
          body: 8.5,
          balance: 8,
          overall: 8
        },
        defects: 1,
        notes: 'Full body with chocolate undertones'
      },
      createdAt: '2025-01-02T10:00:00Z',
      isFavorite: false,
      isShared: true
    }
  ] as BrewRecord[];

  const mockCollections: CollectionWithBrews[] = [
    {
      id: 'collection-1',
      userId: 'user-1',
      name: 'African Origins',
      description: 'Collection of African coffee brews',
      color: '#10b981',
      createdAt: '2025-01-01T09:00:00Z',
      updatedAt: '2025-01-02T11:00:00Z',
      brewIds: ['brew-1'],
      isDefault: false,
      brews: [mockBrews[0]],
      brewCount: 1,
      lastBrewDate: '2025-01-01T10:00:00Z',
      averageQuality: 8.5
    },
    {
      id: 'collection-2',
      userId: 'user-1',
      name: 'South American Collection',
      description: 'Brews from South America',
      color: '#ef4444',
      createdAt: '2025-01-02T09:00:00Z',
      updatedAt: '2025-01-02T11:00:00Z',
      brewIds: ['brew-2'],
      isDefault: false,
      brews: [mockBrews[1]],
      brewCount: 1,
      lastBrewDate: '2025-01-02T10:00:00Z',
      averageQuality: 7.5
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful service responses
    mockBrewService.getBrews.mockResolvedValue({
      brews: mockBrews,
      total: mockBrews.length,
      page: 1,
      limit: 20,
      totalPages: 1
    });
    
    mockCollectionsService.getCollectionWithBrews.mockImplementation(async (id) => {
      return mockCollections.find(c => c.id === id) || null;
    });

    mockCollectionsService.getCollections.mockResolvedValue([
      {
        id: 'collection-1',
        name: 'African Origins',
        description: 'Collection of African coffee brews',
        color: '#10b981',
        brewCount: 1,
        lastBrewDate: '2025-01-01T10:00:00Z',
        previewBrews: []
      },
      {
        id: 'collection-2', 
        name: 'South American Collection',
        description: 'Brews from South America',
        color: '#ef4444',
        brewCount: 1,
        lastBrewDate: '2025-01-02T10:00:00Z',
        previewBrews: []
      }
    ]);

    // Mock export utilities
    mockCsvExport.exportBrewsToCSV = jest.fn().mockResolvedValue('csv-data');
    mockCsvExport.exportCollectionsToCSV = jest.fn().mockResolvedValue('csv-data');
    mockPdfExport.exportBrewsToPDF = jest.fn().mockResolvedValue('pdf-blob');
    mockPdfExport.exportCollectionsToPDF = jest.fn().mockResolvedValue('pdf-blob');
  });

  describe('Brew Export with Collection Context', () => {
    test('should export brews with collection information in CSV format', async () => {
      const exportOptions = {
        format: 'csv' as const,
        includeCollections: true,
        brewIds: ['brew-1', 'brew-2']
      };

      await exportBrews(exportOptions);

      expect(mockBrewService.getBrews).toHaveBeenCalledWith({
        ids: ['brew-1', 'brew-2'],
        includeCollections: true
      });

      expect(mockCsvExport.exportBrewsToCSV).toHaveBeenCalledWith(
        mockBrews,
        expect.objectContaining({
          includeCollections: true,
          collectionNames: expect.any(Array)
        })
      );
    });

    test('should export brews with collection metadata in PDF format', async () => {
      const exportOptions = {
        format: 'pdf' as const,
        includeCollections: true,
        brewIds: ['brew-1']
      };

      await exportBrews(exportOptions);

      expect(mockPdfExport.exportBrewsToPDF).toHaveBeenCalledWith(
        [mockBrews[0]],
        expect.objectContaining({
          includeCollections: true,
          title: expect.stringContaining('Brews Export')
        })
      );
    });

    test('should handle export of brews from specific collection', async () => {
      const exportOptions = {
        format: 'csv' as const,
        collectionId: 'collection-1',
        includeCollectionInfo: true
      };

      await exportBrews(exportOptions);

      expect(mockCollectionsService.getCollectionWithBrews).toHaveBeenCalledWith('collection-1');
      expect(mockCsvExport.exportBrewsToCSV).toHaveBeenCalledWith(
        [mockBrews[0]],
        expect.objectContaining({
          collectionName: 'African Origins',
          collectionDescription: 'Collection of African coffee brews'
        })
      );
    });

    test('should validate brew IDs exist before export', async () => {
      mockBrewService.getBrews.mockResolvedValue({
        brews: [],
        total: 0
      });

      const exportOptions = {
        format: 'csv' as const,
        brewIds: ['non-existent-brew']
      };

      await expect(exportBrews(exportOptions)).rejects.toThrow(
        'No brews found for export'
      );
    });

    test('should handle export with mixed favorite and non-favorite brews', async () => {
      const exportOptions = {
        format: 'csv' as const,
        favoritesOnly: true,
        includeCollections: true
      };

      const favoriteBrews = mockBrews.filter(brew => brew.isFavorite);
      mockBrewService.getBrews.mockResolvedValue({
        brews: favoriteBrews,
        total: favoriteBrews.length
      });

      await exportBrews(exportOptions);

      expect(mockBrewService.getBrews).toHaveBeenCalledWith(
        expect.objectContaining({
          favoritesOnly: true
        })
      );

      expect(mockCsvExport.exportBrewsToCSV).toHaveBeenCalledWith(
        favoriteBrews,
        expect.any(Object)
      );
    });
  });

  describe('Collection Export Functionality', () => {
    test('should export collections with full brew details in CSV format', async () => {
      const exportOptions = {
        format: 'csv' as const,
        collectionIds: ['collection-1', 'collection-2'],
        includeBrewDetails: true
      };

      await exportCollections(exportOptions);

      expect(mockCollectionsService.getCollectionWithBrews).toHaveBeenCalledTimes(2);
      expect(mockCollectionsService.getCollectionWithBrews).toHaveBeenCalledWith('collection-1');
      expect(mockCollectionsService.getCollectionWithBrews).toHaveBeenCalledWith('collection-2');

      expect(mockCsvExport.exportCollectionsToCSV).toHaveBeenCalledWith(
        mockCollections,
        expect.objectContaining({
          includeBrewDetails: true
        })
      );
    });

    test('should export collections summary without brew details', async () => {
      const exportOptions = {
        format: 'csv' as const,
        includeBrewDetails: false
      };

      await exportCollections(exportOptions);

      expect(mockCollectionsService.getCollections).toHaveBeenCalled();
      expect(mockCsvExport.exportCollectionsToCSV).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          includeBrewDetails: false,
          summaryOnly: true
        })
      );
    });

    test('should export collections with statistical analysis in PDF', async () => {
      const exportOptions = {
        format: 'pdf' as const,
        collectionIds: ['collection-1'],
        includeAnalytics: true,
        includeBrewDetails: true
      };

      await exportCollections(exportOptions);

      expect(mockPdfExport.exportCollectionsToPDF).toHaveBeenCalledWith(
        [mockCollections[0]],
        expect.objectContaining({
          includeAnalytics: true,
          includeBrewDetails: true,
          title: expect.stringContaining('Collections Export')
        })
      );
    });

    test('should handle empty collections in export', async () => {
      const emptyCollection: CollectionWithBrews = {
        id: 'empty-collection',
        userId: 'user-1',
        name: 'Empty Collection',
        description: 'No brews yet',
        color: '#6b7280',
        createdAt: '2025-01-03T09:00:00Z',
        updatedAt: '2025-01-03T09:00:00Z',
        brewIds: [],
        isDefault: false,
        brews: [],
        brewCount: 0,
        lastBrewDate: undefined,
        averageQuality: undefined
      };

      mockCollectionsService.getCollectionWithBrews.mockResolvedValue(emptyCollection);

      const exportOptions = {
        format: 'csv' as const,
        collectionIds: ['empty-collection'],
        includeBrewDetails: true
      };

      await exportCollections(exportOptions);

      expect(mockCsvExport.exportCollectionsToCSV).toHaveBeenCalledWith(
        [emptyCollection],
        expect.objectContaining({
          includeBrewDetails: true
        })
      );
    });

    test('should validate collection IDs exist before export', async () => {
      mockCollectionsService.getCollectionWithBrews.mockResolvedValue(null);

      const exportOptions = {
        format: 'csv' as const,
        collectionIds: ['non-existent-collection']
      };

      await expect(exportCollections(exportOptions)).rejects.toThrow(
        'One or more collections not found'
      );
    });
  });

  describe('Cross-Platform Export Integration', () => {
    test('should handle export with proper error handling for service failures', async () => {
      mockBrewService.getBrews.mockRejectedValue(new Error('Service unavailable'));

      const exportOptions = {
        format: 'csv' as const,
        brewIds: ['brew-1']
      };

      await expect(exportBrews(exportOptions)).rejects.toThrow('Service unavailable');
    });

    test('should handle partial service failures gracefully', async () => {
      // Mock one collection succeeding, one failing
      mockCollectionsService.getCollectionWithBrews
        .mockResolvedValueOnce(mockCollections[0])
        .mockRejectedValueOnce(new Error('Collection service error'));

      const exportOptions = {
        format: 'csv' as const,
        collectionIds: ['collection-1', 'collection-2']
      };

      await expect(exportCollections(exportOptions)).rejects.toThrow(
        'Failed to export some collections'
      );
    });

    test('should validate export permissions and user access', async () => {
      const unauthorizedBrew = { ...mockBrews[0], userId: 'other-user' };
      mockBrewService.getBrews.mockResolvedValue({
        brews: [unauthorizedBrew],
        total: 1
      });

      const exportOptions = {
        format: 'csv' as const,
        brewIds: ['brew-1']
      };

      await expect(exportBrews(exportOptions)).rejects.toThrow(
        'Access denied: Cannot export brews from other users'
      );
    });
  });

  describe('Export Data Integrity and Quality', () => {
    test('should ensure exported data matches source data exactly', async () => {
      const exportOptions = {
        format: 'csv' as const,
        brewIds: ['brew-1', 'brew-2'],
        includeCollections: true
      };

      await exportBrews(exportOptions);

      const exportedData = mockCsvExport.exportBrewsToCSV.mock.calls[0][0];
      
      // Verify data integrity
      expect(exportedData).toHaveLength(2);
      expect(exportedData[0]).toEqual(mockBrews[0]);
      expect(exportedData[1]).toEqual(mockBrews[1]);
      
      // Verify no data transformation errors
      exportedData.forEach((brew, index) => {
        expect(brew.id).toBe(mockBrews[index].id);
        expect(brew.measurements.coffeeToWaterRatio).toBe(mockBrews[index].measurements.coffeeToWaterRatio);
        expect(brew.evaluation?.type).toBe(mockBrews[index].evaluation?.type);
      });
    });

    test('should handle special characters and unicode in export data', async () => {
      const brewWithSpecialChars = {
        ...mockBrews[0],
        beans: {
          ...mockBrews[0].beans,
          brand: 'Café Especial ñ',
          origin: 'São Paulo, Brazil 🇧🇷'
        },
        evaluation: {
          type: 'quick',
          overallQuality: 8.5,
          notes: 'Notes with "quotes" and, commas; and émojis 😍'
        }
      } as BrewRecord;

      mockBrewService.getBrews.mockResolvedValue({
        brews: [brewWithSpecialChars],
        total: 1
      });

      const exportOptions = {
        format: 'csv' as const,
        brewIds: ['brew-1']
      };

      await exportBrews(exportOptions);

      const exportedData = mockCsvExport.exportBrewsToCSV.mock.calls[0][0];
      expect(exportedData[0].beans.brand).toBe('Café Especial ñ');
      expect(exportedData[0].beans.origin).toBe('São Paulo, Brazil 🇧🇷');
      expect(exportedData[0].evaluation?.notes).toContain('émojis 😍');
    });

    test('should preserve date formatting and timezone information', async () => {
      const exportOptions = {
        format: 'csv' as const,
        brewIds: ['brew-1'],
        includeTimestamps: true
      };

      await exportBrews(exportOptions);

      const exportedData = mockCsvExport.exportBrewsToCSV.mock.calls[0][0];
      expect(exportedData[0].createdAt).toBe('2025-01-01T10:00:00Z');
      
      // Verify date can be parsed correctly
      const parsedDate = new Date(exportedData[0].createdAt);
      expect(parsedDate).toBeInstanceOf(Date);
      expect(parsedDate.toISOString()).toBe('2025-01-01T10:00:00.000Z');
    });
  });

  describe('Export Performance and Limits', () => {
    test('should handle large dataset exports efficiently', async () => {
      const largeBatchSize = 1000;
      const largeBrewsArray = Array.from({ length: largeBatchSize }, (_, i) => ({
        ...mockBrews[0],
        id: `brew-${i}`,
        brewNumber: i + 1
      }));

      mockBrewService.getBrews.mockResolvedValue({
        brews: largeBrewsArray,
        total: largeBatchSize
      });

      const exportOptions = {
        format: 'csv' as const,
        brewIds: largeBrewsArray.map(b => b.id)
      };

      const startTime = Date.now();
      await exportBrews(exportOptions);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(mockCsvExport.exportBrewsToCSV).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'brew-0' }),
          expect.objectContaining({ id: `brew-${largeBatchSize - 1}` })
        ]),
        expect.any(Object)
      );
    });

    test('should enforce export size limits', async () => {
      const exportOptions = {
        format: 'pdf' as const,
        brewIds: Array.from({ length: 10001 }, (_, i) => `brew-${i}`) // Over limit
      };

      await expect(exportBrews(exportOptions)).rejects.toThrow(
        'Export size exceeds maximum limit of 10,000 records'
      );
    });

    test('should handle concurrent export requests safely', async () => {
      const exportPromises = Array.from({ length: 5 }, (_, i) => 
        exportBrews({
          format: 'csv' as const,
          brewIds: [`brew-${i}`]
        })
      );

      await expect(Promise.all(exportPromises)).resolves.toBeDefined();
      expect(mockCsvExport.exportBrewsToCSV).toHaveBeenCalledTimes(5);
    });
  });

  describe('Export Format Compatibility', () => {
    test('should generate CSV export compatible with Excel and Google Sheets', async () => {
      const exportOptions = {
        format: 'csv' as const,
        brewIds: ['brew-1'],
        compatibility: 'excel'
      };

      await exportBrews(exportOptions);

      expect(mockCsvExport.exportBrewsToCSV).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          compatibility: 'excel',
          encoding: 'utf-8-bom',
          delimiter: ',',
          quoteStyle: 'minimal'
        })
      );
    });

    test('should generate PDF export with proper formatting and metadata', async () => {
      const exportOptions = {
        format: 'pdf' as const,
        collectionIds: ['collection-1'],
        includeCharts: true,
        includeBrewDetails: true
      };

      await exportCollections(exportOptions);

      expect(mockPdfExport.exportCollectionsToPDF).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          includeCharts: true,
          metadata: expect.objectContaining({
            title: expect.any(String),
            author: expect.any(String),
            subject: 'Coffee Collection Export',
            keywords: expect.any(String)
          })
        })
      );
    });

    test('should handle unsupported export format gracefully', async () => {
      const exportOptions = {
        format: 'xml' as any, // Unsupported format
        brewIds: ['brew-1']
      };

      await expect(exportBrews(exportOptions)).rejects.toThrow(
        'Unsupported export format: xml'
      );
    });
  });
});