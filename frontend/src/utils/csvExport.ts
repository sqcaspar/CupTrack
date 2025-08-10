// TASK-008C: Organization Integration Testing - CSV Export Implementation
// TDD Core: CSV export functionality with proper data formatting and validation

import { BrewRecord } from '../types/brew';
import { CollectionWithBrews } from '../types/collections';

export interface CSVExportConfig {
  includeCollections?: boolean;
  includeTimestamps?: boolean;
  collectionNames?: string[];
  collectionName?: string;
  collectionDescription?: string;
  compatibility?: 'excel' | 'google-sheets' | 'standard';
  encoding?: 'utf-8' | 'utf-8-bom';
  delimiter?: ',' | ';' | '\t';
  quoteStyle?: 'minimal' | 'all' | 'none';
}

export interface CSVCollectionExportConfig {
  includeBrewDetails?: boolean;
  summaryOnly?: boolean;
  includeAnalytics?: boolean;
}

export const exportBrewsToCSV = async (
  brews: BrewRecord[], 
  config: CSVExportConfig = {}
): Promise<string> => {
  if (!brews || brews.length === 0) {
    throw new Error('No brews data provided for CSV export');
  }

  const delimiter = config.delimiter || ',';
  const quote = config.quoteStyle === 'none' ? '' : '"';
  const shouldQuote = config.quoteStyle === 'all';

  // Define CSV headers
  const headers = [
    'Brew Number',
    'Brand',
    'Origin', 
    'Processing Method',
    'Altitude',
    'Roasting Level',
    'Brewing Method',
    'Grinder Model',
    'Grinder Setting',
    'Water Temperature (°C)',
    'Filtering Tools',
    'Water Quality',
    'Coffee Weight (g)',
    'Water Weight (g)',
    'Coffee to Water Ratio',
    'Brewed Coffee Weight (g)',
    'TDS (%)',
    'Evaluation Type',
    'Overall Quality',
    'Notes',
    'Is Favorite',
    'Is Shared',
    'Created Date'
  ];

  if (config.includeCollections && config.collectionName) {
    headers.push('Collection');
  }

  if (config.includeTimestamps) {
    headers.push('Updated Date');
  }

  // Build CSV content
  let csvContent = '';

  // Add BOM for Excel compatibility if requested
  if (config.encoding === 'utf-8-bom') {
    csvContent = '\uFEFF';
  }

  // Add headers
  csvContent += headers.map(header => formatCSVValue(header, quote, shouldQuote)).join(delimiter) + '\n';

  // Add data rows
  for (const brew of brews) {
    const row = [
      brew.brewNumber.toString(),
      brew.beans.brand || '',
      brew.beans.origin || '',
      brew.beans.processingMethod || '',
      brew.beans.altitude?.toString() || '',
      brew.beans.roastingLevel || '',
      brew.parameters.brewingMethod || '',
      brew.parameters.grinderModel || '',
      brew.parameters.grinderSetting || '',
      brew.parameters.waterTemperature?.toString() || '',
      brew.parameters.filteringTools || '',
      brew.parameters.waterQuality || '',
      brew.measurements.coffeeBeansWeight?.toString() || '',
      brew.measurements.waterWeight?.toString() || '',
      brew.measurements.coffeeToWaterRatio?.toString() || '',
      brew.measurements.brewedCoffeeWeight?.toString() || '',
      brew.measurements.tdsPercentage?.toString() || '',
      brew.evaluation?.type || '',
      getOverallQuality(brew)?.toString() || '',
      brew.evaluation?.notes || '',
      brew.isFavorite ? 'Yes' : 'No',
      brew.isShared ? 'Yes' : 'No',
      formatDate(brew.createdAt)
    ];

    if (config.includeCollections && config.collectionName) {
      row.push(config.collectionName);
    }

    if (config.includeTimestamps && brew.updatedAt) {
      row.push(formatDate(brew.updatedAt));
    }

    csvContent += row.map(value => formatCSVValue(value, quote, shouldQuote)).join(delimiter) + '\n';
  }

  return csvContent;
};

export const exportCollectionsToCSV = async (
  collections: CollectionWithBrews[],
  config: CSVCollectionExportConfig = {}
): Promise<string> => {
  if (!collections || collections.length === 0) {
    throw new Error('No collections data provided for CSV export');
  }

  const delimiter = ',';
  const quote = '"';

  let csvContent = '\uFEFF'; // Add BOM for Excel compatibility

  if (config.summaryOnly || !config.includeBrewDetails) {
    // Export collections summary
    const headers = [
      'Collection Name',
      'Description',
      'Color',
      'Brew Count',
      'Last Brew Date',
      'Average Quality',
      'Created Date',
      'Updated Date'
    ];

    csvContent += headers.map(header => formatCSVValue(header, quote, true)).join(delimiter) + '\n';

    for (const collection of collections) {
      const row = [
        collection.name,
        collection.description || '',
        collection.color || '',
        collection.brewCount.toString(),
        collection.lastBrewDate ? formatDate(collection.lastBrewDate) : '',
        collection.averageQuality?.toFixed(1) || '',
        formatDate(collection.createdAt),
        formatDate(collection.updatedAt)
      ];

      csvContent += row.map(value => formatCSVValue(value, quote, true)).join(delimiter) + '\n';
    }
  } else {
    // Export collections with brew details
    const headers = [
      'Collection Name',
      'Collection Description',
      'Collection Color',
      'Brew Number',
      'Brand',
      'Origin',
      'Processing Method',
      'Brewing Method',
      'Coffee Weight (g)',
      'Water Weight (g)',
      'Ratio',
      'Overall Quality',
      'Is Favorite',
      'Brew Created Date'
    ];

    csvContent += headers.map(header => formatCSVValue(header, quote, true)).join(delimiter) + '\n';

    for (const collection of collections) {
      if (collection.brews && collection.brews.length > 0) {
        for (const brew of collection.brews) {
          const row = [
            collection.name,
            collection.description || '',
            collection.color || '',
            brew.brewNumber.toString(),
            brew.beans.brand,
            brew.beans.origin,
            brew.beans.processingMethod,
            brew.parameters.brewingMethod,
            brew.measurements.coffeeBeansWeight.toString(),
            brew.measurements.waterWeight.toString(),
            brew.measurements.coffeeToWaterRatio.toString(),
            getOverallQuality(brew)?.toString() || '',
            brew.isFavorite ? 'Yes' : 'No',
            formatDate(brew.createdAt)
          ];

          csvContent += row.map(value => formatCSVValue(value, quote, true)).join(delimiter) + '\n';
        }
      } else {
        // Empty collection row
        const row = [
          collection.name,
          collection.description || '',
          collection.color || '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          ''
        ];

        csvContent += row.map(value => formatCSVValue(value, quote, true)).join(delimiter) + '\n';
      }
    }
  }

  return csvContent;
};

// Helper functions
const formatCSVValue = (value: string | number, quote: string, shouldQuote: boolean): string => {
  if (value === null || value === undefined) return '';
  
  // Convert to string if it's a number
  const stringValue = typeof value === 'number' ? value.toString() : value;
  
  // Always quote if value contains delimiter, quote, or newline
  const needsQuoting = shouldQuote || 
    stringValue.includes(',') || 
    stringValue.includes(';') || 
    stringValue.includes('\t') ||
    stringValue.includes(quote) || 
    stringValue.includes('\n') || 
    stringValue.includes('\r');

  if (needsQuoting && quote) {
    // Escape existing quotes by doubling them
    const escapedValue = stringValue.replace(new RegExp(quote, 'g'), quote + quote);
    return quote + escapedValue + quote;
  }

  return stringValue;
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};

const getOverallQuality = (brew: BrewRecord): number | null => {
  if (!brew.evaluation) return null;

  switch (brew.evaluation.type) {
    case 'quick':
      return brew.evaluation.overallQuality;
    case 'sca':
      const totalScore = Object.values(brew.evaluation.scores).reduce((sum, score) => sum + score, 0);
      return Math.round((totalScore - (brew.evaluation as any).defects?.totalPenalty || 0) * 10) / 10;
    case 'cva_affective':
      return brew.evaluation.scaScore || null;
    default:
      return null;
  }
};