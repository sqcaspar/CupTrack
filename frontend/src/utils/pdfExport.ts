// TASK-008C: Organization Integration Testing - PDF Export Implementation  
// TDD Core: PDF export functionality with proper formatting and metadata

import { BrewRecord } from '../types/brew';
import { CollectionWithBrews } from '../types/collections';

export interface PDFExportConfig {
  title?: string;
  includeCollections?: boolean;
  includeCharts?: boolean;
  metadata?: {
    title: string;
    author: string;
    subject: string;
    keywords: string;
  };
}

export interface PDFCollectionExportConfig {
  includeAnalytics?: boolean;
  includeBrewDetails?: boolean;
  includeCharts?: boolean;
  title?: string;
  metadata?: {
    title: string;
    author: string;
    subject: string;
    keywords: string;
  };
}

// Mock PDF generation - in real implementation would use library like jsPDF or Puppeteer
export const exportBrewsToPDF = async (
  brews: BrewRecord[],
  config: PDFExportConfig = {}
): Promise<Blob> => {
  if (!brews || brews.length === 0) {
    throw new Error('No brews data provided for PDF export');
  }

  // Validate input data
  validateBrewsData(brews);

  // Mock PDF generation process
  const pdfContent = generateBrewsPDFContent(brews, config);
  
  // In real implementation, this would generate actual PDF
  const mockPdfBlob = new Blob([pdfContent], { 
    type: 'application/pdf' 
  });

  return mockPdfBlob;
};

export const exportCollectionsToPDF = async (
  collections: CollectionWithBrews[],
  config: PDFCollectionExportConfig = {}
): Promise<Blob> => {
  if (!collections || collections.length === 0) {
    throw new Error('No collections data provided for PDF export');
  }

  // Validate input data
  validateCollectionsData(collections);

  // Mock PDF generation process
  const pdfContent = generateCollectionsPDFContent(collections, config);
  
  // In real implementation, this would generate actual PDF
  const mockPdfBlob = new Blob([pdfContent], { 
    type: 'application/pdf' 
  });

  return mockPdfBlob;
};

// Helper functions for validation
const validateBrewsData = (brews: BrewRecord[]): void => {
  for (const brew of brews) {
    if (!brew.id || typeof brew.id !== 'string') {
      throw new Error(`Invalid brew ID: ${brew.id}`);
    }
    
    if (!brew.beans || !brew.beans.brand || !brew.beans.origin) {
      throw new Error(`Missing required bean information for brew ${brew.id}`);
    }
    
    if (!brew.parameters || !brew.parameters.brewingMethod) {
      throw new Error(`Missing brewing method for brew ${brew.id}`);
    }
    
    if (!brew.measurements || !brew.measurements.coffeeBeansWeight || !brew.measurements.waterWeight) {
      throw new Error(`Missing required measurements for brew ${brew.id}`);
    }
    
    if (!brew.createdAt || isNaN(new Date(brew.createdAt).getTime())) {
      throw new Error(`Invalid creation date for brew ${brew.id}`);
    }
  }
};

const validateCollectionsData = (collections: CollectionWithBrews[]): void => {
  for (const collection of collections) {
    if (!collection.id || typeof collection.id !== 'string') {
      throw new Error(`Invalid collection ID: ${collection.id}`);
    }
    
    if (!collection.name || typeof collection.name !== 'string') {
      throw new Error(`Missing collection name for collection ${collection.id}`);
    }
    
    if (!collection.createdAt || isNaN(new Date(collection.createdAt).getTime())) {
      throw new Error(`Invalid creation date for collection ${collection.id}`);
    }
    
    // Validate brews if included
    if (collection.brews && collection.brews.length > 0) {
      validateBrewsData(collection.brews);
    }
  }
};

// Mock PDF content generation
const generateBrewsPDFContent = (brews: BrewRecord[], config: PDFExportConfig): string => {
  let content = `
    PDF Export: ${config.title || 'Brews Export'}
    Generated: ${new Date().toLocaleString()}
    Total Records: ${brews.length}
    
    ${config.metadata ? `
    Metadata:
    - Title: ${config.metadata.title}
    - Author: ${config.metadata.author}
    - Subject: ${config.metadata.subject}
    - Keywords: ${config.metadata.keywords}
    ` : ''}
    
    BREW RECORDS:
  `;

  for (const brew of brews) {
    content += `
    
    Brew #${brew.brewNumber}
    Brand: ${brew.beans.brand}
    Origin: ${brew.beans.origin}
    Processing: ${brew.beans.processingMethod}
    Method: ${brew.parameters.brewingMethod}
    Grinder: ${brew.parameters.grinderModel} (${brew.parameters.grinderSetting})
    Temperature: ${brew.parameters.waterTemperature}°C
    Coffee: ${brew.measurements.coffeeBeansWeight}g
    Water: ${brew.measurements.waterWeight}g
    Ratio: 1:${brew.measurements.coffeeToWaterRatio}
    ${brew.evaluation ? `Quality: ${getOverallQuality(brew)}` : ''}
    ${brew.evaluation?.notes ? `Notes: ${brew.evaluation.notes}` : ''}
    Favorite: ${brew.isFavorite ? 'Yes' : 'No'}
    Created: ${new Date(brew.createdAt).toLocaleDateString()}
    ${config.includeCollections ? '(Collection data would be included here)' : ''}
    `;
  }

  return content;
};

const generateCollectionsPDFContent = (collections: CollectionWithBrews[], config: PDFCollectionExportConfig): string => {
  let content = `
    PDF Export: ${config.title || 'Collections Export'}
    Generated: ${new Date().toLocaleString()}
    Total Collections: ${collections.length}
    
    ${config.metadata ? `
    Metadata:
    - Title: ${config.metadata.title}
    - Author: ${config.metadata.author}
    - Subject: ${config.metadata.subject}
    - Keywords: ${config.metadata.keywords}
    ` : ''}
    
    COLLECTIONS:
  `;

  for (const collection of collections) {
    content += `
    
    Collection: ${collection.name}
    ${collection.description ? `Description: ${collection.description}` : ''}
    ${collection.color ? `Color: ${collection.color}` : ''}
    Brew Count: ${collection.brewCount}
    ${collection.lastBrewDate ? `Last Brew: ${new Date(collection.lastBrewDate).toLocaleDateString()}` : ''}
    ${collection.averageQuality ? `Average Quality: ${collection.averageQuality.toFixed(1)}` : ''}
    Created: ${new Date(collection.createdAt).toLocaleDateString()}
    Updated: ${new Date(collection.updatedAt).toLocaleDateString()}
    
    ${config.includeBrewDetails && collection.brews && collection.brews.length > 0 ? `
    BREWS IN THIS COLLECTION:
    ${collection.brews.map(brew => `
    - Brew #${brew.brewNumber}: ${brew.beans.brand} (${brew.beans.origin})
      Method: ${brew.parameters.brewingMethod}
      Quality: ${getOverallQuality(brew) || 'N/A'}
      ${brew.isFavorite ? '❤️' : ''}
    `).join('')}
    ` : ''}
    
    ${config.includeAnalytics ? `
    ANALYTICS:
    - Most used brewing method: (would calculate from brew data)
    - Quality trend: (would analyze quality over time)
    - Favorite ratio: ${collection.brews ? `${collection.brews.filter(b => b.isFavorite).length}/${collection.brews.length}` : 'N/A'}
    ` : ''}
    `;

    if (config.includeCharts) {
      content += `
      CHARTS: (Chart visualizations would be embedded here)
      - Quality distribution chart
      - Brewing methods pie chart
      - Timeline chart
      `;
    }
  }

  return content;
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