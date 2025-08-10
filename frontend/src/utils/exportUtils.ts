// TASK-008C: Organization Integration Testing - Export Utilities Implementation
// TDD Core: Export functionality with collections integration

import { getBrewService } from '../services/brewService';
import { CollectionsService } from '../services/collectionsService';
import { exportBrewsToCSV, exportCollectionsToCSV } from './csvExport';
import { exportBrewsToPDF, exportCollectionsToPDF } from './pdfExport';
import { BrewRecord } from '../types/brew';
import { CollectionWithBrews } from '../types/collections';

export interface BrewExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  brewIds?: string[];
  collectionId?: string;
  includeCollections?: boolean;
  includeCollectionInfo?: boolean;
  favoritesOnly?: boolean;
  includeTimestamps?: boolean;
  compatibility?: 'excel' | 'google-sheets' | 'standard';
}

export interface CollectionExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  collectionIds?: string[];
  includeBrewDetails?: boolean;
  includeAnalytics?: boolean;
  summaryOnly?: boolean;
  includeCharts?: boolean;
}

const MAX_EXPORT_RECORDS = 10000;

export const exportBrews = async (options: BrewExportOptions): Promise<string | Blob> => {
  // Validate options
  validateExportOptions(options);

  try {
    let brews: BrewRecord[] = [];
    let collectionInfo: any = null;

    // Get brews data based on options
    if (options.collectionId) {
      const collection = await CollectionsService.getCollection(options.collectionId);
      if (!collection) {
        throw new Error(`Collection not found: ${options.collectionId}`);
      }
      brews = collection.brews;
      collectionInfo = {
        collectionName: collection.name,
        collectionDescription: collection.description,
        collectionColor: collection.color
      };
    } else if (options.brewIds && options.brewIds.length > 0) {
      if (options.brewIds.length > MAX_EXPORT_RECORDS) {
        throw new Error(`Export size exceeds maximum limit of ${MAX_EXPORT_RECORDS.toLocaleString()} records`);
      }

      const response = await getBrewService().getBrews({
        ids: options.brewIds,
        includeCollections: options.includeCollections
      });
      brews = response.brews;
    } else {
      // Export all brews with filters
      const response = await getBrewService().getBrews({
        favorites: options.favoritesOnly,
        includeCollections: options.includeCollections,
        limit: MAX_EXPORT_RECORDS
      });
      brews = response.brews;
    }

    // Validate results
    if (brews.length === 0) {
      throw new Error('No brews found for export');
    }

    // Validate user access
    const currentUserId = 'mock-user-id'; // In real app, get from auth context
    const unauthorizedBrews = brews.filter(brew => brew.userId !== currentUserId);
    if (unauthorizedBrews.length > 0) {
      throw new Error('Access denied: Cannot export brews from other users');
    }

    // Get collection names for brews if requested
    let collectionNames: string[] = [];
    if (options.includeCollections) {
      const collections = await CollectionsService.getCollections();
      collectionNames = collections.map(c => c.name);
    }

    // Export based on format
    const exportConfig = {
      includeCollections: options.includeCollections,
      includeTimestamps: options.includeTimestamps,
      collectionNames,
      compatibility: options.compatibility || 'standard',
      encoding: options.compatibility === 'excel' ? 'utf-8-bom' : 'utf-8',
      delimiter: ',',
      quoteStyle: 'minimal',
      ...collectionInfo
    };

    switch (options.format) {
      case 'csv':
        return await exportBrewsToCSV(brews, exportConfig);
      
      case 'pdf':
        return await exportBrewsToPDF(brews, {
          ...exportConfig,
          title: collectionInfo 
            ? `${collectionInfo.collectionName} - Brews Export`
            : 'Brews Export',
          includeCollections: options.includeCollections
        });
      
      case 'excel':
        // Excel export would be implemented here
        throw new Error('Excel export not yet implemented');
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    console.error('Error exporting brews:', error);
    throw error;
  }
};

export const exportCollections = async (options: CollectionExportOptions): Promise<string | Blob> => {
  // Validate options
  validateCollectionExportOptions(options);

  try {
    let collections: CollectionWithBrews[] = [];

    if (options.collectionIds && options.collectionIds.length > 0) {
      // Export specific collections
      const collectionPromises = options.collectionIds.map(async (id) => {
        const collection = await CollectionsService.getCollection(id);
        if (!collection) {
          throw new Error(`Collection not found: ${id}`);
        }
        return collection;
      });

      try {
        collections = await Promise.all(collectionPromises);
      } catch (error) {
        throw new Error('One or more collections not found');
      }
    } else if (options.includeBrewDetails) {
      // Export all collections with brew details
      const collectionSummaries = await CollectionsService.getCollections();
      const collectionPromises = collectionSummaries.map(async (summary) => {
        return await CollectionsService.getCollection(summary.id);
      });

      try {
        const collectionResults = await Promise.all(collectionPromises);
        collections = collectionResults.filter((c): c is CollectionWithBrews => c !== null);
      } catch (error) {
        throw new Error('Failed to export some collections');
      }
    } else {
      // Export collections summary only
      const collectionSummaries = await CollectionsService.getCollections();
      collections = collectionSummaries.map(summary => ({
        ...summary,
        userId: 'mock-user-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        brewIds: [],
        isDefault: false,
        brews: [],
        lastBrewDate: summary.lastBrewDate,
        averageQuality: undefined
      })) as CollectionWithBrews[];
    }

    // Validate results
    if (collections.length === 0) {
      throw new Error('No collections found for export');
    }

    // Export configuration
    const exportConfig = {
      includeBrewDetails: options.includeBrewDetails || false,
      includeAnalytics: options.includeAnalytics || false,
      summaryOnly: options.summaryOnly || false,
      includeCharts: options.includeCharts || false,
      title: 'Collections Export',
      metadata: {
        title: 'Coffee Collections Export',
        author: 'CupTrack',
        subject: 'Coffee Collection Export',
        keywords: 'coffee, collections, brews, export'
      }
    };

    // Export based on format
    switch (options.format) {
      case 'csv':
        return await exportCollectionsToCSV(collections, exportConfig);
      
      case 'pdf':
        return await exportCollectionsToPDF(collections, exportConfig);
      
      case 'excel':
        // Excel export would be implemented here
        throw new Error('Excel export not yet implemented');
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    console.error('Error exporting collections:', error);
    throw error;
  }
};

// Validation functions
const validateExportOptions = (options: BrewExportOptions): void => {
  if (!options.format) {
    throw new Error('Export format is required');
  }

  if (!['csv', 'pdf', 'excel'].includes(options.format)) {
    throw new Error(`Invalid export format: ${options.format}`);
  }

  if (options.brewIds && options.collectionId) {
    throw new Error('Cannot specify both brewIds and collectionId');
  }

  if (options.brewIds && options.brewIds.length === 0) {
    throw new Error('brewIds array cannot be empty when specified');
  }
};

const validateCollectionExportOptions = (options: CollectionExportOptions): void => {
  if (!options.format) {
    throw new Error('Export format is required');
  }

  if (!['csv', 'pdf', 'excel'].includes(options.format)) {
    throw new Error(`Invalid export format: ${options.format}`);
  }

  if (options.collectionIds && options.collectionIds.length === 0) {
    throw new Error('collectionIds array cannot be empty when specified');
  }
};