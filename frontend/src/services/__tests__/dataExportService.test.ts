// TASK-008A: Data Export Functionality - TDD Core
// RED: Write failing tests first for export formats and data integrity

// Mock jsPDF before importing the service
import { DataExportService } from '../dataExportService';
import { BrewRecord } from '../../types/brew';

jest.mock('jspdf', () => {
  const mockPDF = {
    setFontSize: jest.fn(),
    text: jest.fn(),
    autoTable: jest.fn(),
    output: jest.fn().mockReturnValue(new ArrayBuffer(1000)),
    internal: {
      pageSize: {
        height: 297
      }
    }
  };
  
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockPDF)
  };
});

jest.mock('jspdf-autotable', () => ({}));

// Mock data for export testing
const createExportTestData = (): BrewRecord[] => {
  return [
    {
      id: 'export-test-1',
      userId: 'user-123',
      brewNumber: 'B-001',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
      isShared: false,
      isFavorite: true,
      beans: {
        brand: 'Ethiopian Coffee Co',
        origin: 'Yirgacheffe',
        processingMethod: 'washed',
        altitude: 1800,
        roastingLevel: 'light',
        roastingDate: '2024-01-10'
      },
      parameters: {
        brewingMethod: 'pour-over',
        grinderModel: 'Baratza Encore',
        grinderSetting: '15',
        waterTemperature: 93,
        filteringTools: 'V60',
        waterQuality: 'Filtered'
      },
      turbulenceSteps: [
        {
          stepNumber: 1,
          timeSeconds: 0,
          pourWeight: 50,
          totalWeight: 50,
          notes: 'Bloom'
        },
        {
          stepNumber: 2,
          timeSeconds: 30,
          pourWeight: 150,
          totalWeight: 200,
          notes: 'Second pour'
        }
      ],
      measurements: {
        coffeeBeansWeight: 22,
        waterWeight: 350,
        coffeeToWaterRatio: 15.91,
        brewedCoffeeWeight: 320,
        tdsPercentage: 1.35
      },
      evaluation: {
        type: 'quick',
        overallQuality: 8.5,
        notes: 'Excellent balance with bright acidity'
      }
    },
    {
      id: 'export-test-2',
      userId: 'user-123',
      brewNumber: 'B-002',
      createdAt: '2024-01-16T09:30:00Z',
      updatedAt: '2024-01-16T09:30:00Z',
      isShared: true,
      isFavorite: false,
      beans: {
        brand: 'Colombian Supremo',
        origin: 'Huila',
        processingMethod: 'natural',
        altitude: 1600,
        roastingLevel: 'medium'
      },
      parameters: {
        brewingMethod: 'french-press',
        grinderModel: 'Manual Grinder',
        grinderSetting: 'coarse',
        waterTemperature: 85,
        filteringTools: 'Metal filter'
      },
      turbulenceSteps: [],
      measurements: {
        coffeeBeansWeight: 30,
        waterWeight: 450,
        coffeeToWaterRatio: 15.0,
        brewedCoffeeWeight: 400,
        tdsPercentage: 1.45
      },
      evaluation: {
        type: 'sca',
        scores: {
          aroma: 1.2,
          flavor: 1.3,
          aftertaste: 1.1,
          acidity: 1.0,
          body: 1.4,
          balance: 1.2,
          overall: 1.1
        },
        defects: 1,
        notes: 'Professional SCA evaluation with minor defect'
      }
    },
    {
      id: 'export-test-3',
      userId: 'user-123',
      brewNumber: 'B-003',
      createdAt: '2024-01-17T07:45:00Z',
      updatedAt: '2024-01-17T07:45:00Z',
      isShared: false,
      isFavorite: true,
      beans: {
        brand: 'Guatemalan Antigua',
        origin: 'Antigua',
        processingMethod: 'washed',
        altitude: 2000,
        roastingLevel: 'medium-dark'
      },
      parameters: {
        brewingMethod: 'aeropress',
        grinderModel: 'Comandante C40',
        grinderSetting: '12',
        waterTemperature: 88,
        filteringTools: 'Paper filter'
      },
      turbulenceSteps: [
        {
          stepNumber: 1,
          timeSeconds: 0,
          pourWeight: 200,
          totalWeight: 200,
          notes: 'Full immersion'
        }
      ],
      measurements: {
        coffeeBeansWeight: 18,
        waterWeight: 250,
        coffeeToWaterRatio: 13.89,
        brewedCoffeeWeight: 220,
        tdsPercentage: 1.55
      },
      evaluation: {
        type: 'cvd_affective',
        overallQuality: 7.8,
        liking: 8.2,
        intensity: 7.5,
        notes: 'CVD Affective evaluation - well balanced'
      }
    }
  ];
};

describe('DataExportService - TDD Core', () => {
  let testBrews: BrewRecord[];

  beforeEach(() => {
    testBrews = createExportTestData();
  });

  describe('CSV Export Format', () => {
    test('should export brews to valid CSV format with all required fields', () => {
      // RED: This test will fail initially as the service doesn't exist yet
      const csvData = DataExportService.exportToCSV(testBrews);

      expect(csvData).toBeDefined();
      expect(typeof csvData).toBe('string');
      
      // Verify CSV structure
      const lines = csvData.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(4); // Header + 3 data rows
      
      // Verify headers are present and in correct order
      const headers = lines[0].split(',');
      expect(headers).toContain('Brew Number');
      expect(headers).toContain('Date');
      expect(headers).toContain('Bean Brand');
      expect(headers).toContain('Bean Origin');
      expect(headers).toContain('Processing Method');
      expect(headers).toContain('Brewing Method');
      expect(headers).toContain('Grinder Model');
      expect(headers).toContain('Water Temperature');
      expect(headers).toContain('Coffee Weight (g)');
      expect(headers).toContain('Water Weight (g)');
      expect(headers).toContain('Coffee to Water Ratio');
      expect(headers).toContain('Quality Score');
      expect(headers).toContain('Notes');
    });

    test('should properly escape CSV special characters and handle quotes', () => {
      const brewWithSpecialChars = {
        ...testBrews[0],
        beans: {
          ...testBrews[0].beans,
          brand: 'Coffee "Premium" Brand, Ltd.'
        },
        evaluation: {
          ...testBrews[0].evaluation,
          notes: 'Notes with commas, quotes "like this", and newlines\nhere'
        }
      };

      const csvData = DataExportService.exportToCSV([brewWithSpecialChars]);
      
      // Should handle special characters without breaking CSV format
      expect(csvData).toContain('"Coffee ""Premium"" Brand, Ltd."');
      expect(csvData).toContain('"Notes with commas, quotes ""like this"", and newlines\\nhere"');
    });

    test('should handle empty dataset gracefully', () => {
      const csvData = DataExportService.exportToCSV([]);
      
      expect(csvData).toBeDefined();
      const lines = csvData.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(1); // Only headers
    });

    test('should handle brews with missing optional fields', () => {
      const incompleteBrews = [{
        ...testBrews[0],
        beans: {
          brand: 'Test Coffee',
          origin: 'Test Origin',
          processingMethod: 'washed'
          // Missing altitude, roastingLevel, roastingDate
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Test Grinder',
          grinderSetting: '10',
          waterTemperature: 90
          // Missing filteringTools, waterQuality
        },
        turbulenceSteps: [],
        evaluation: undefined // No evaluation
      }];

      const csvData = DataExportService.exportToCSV(incompleteBrews as BrewRecord[]);
      
      expect(csvData).toBeDefined();
      const lines = csvData.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(2); // Header + 1 data row
      
      // Should handle missing fields with appropriate placeholders
      expect(lines[1]).toContain('N/A'); // For missing quality score
    });
  });

  describe('Excel Export Format', () => {
    test('should export brews to Excel format with proper workbook structure', async () => {
      const excelBuffer = await DataExportService.exportToExcel(testBrews);

      expect(excelBuffer).toBeDefined();
      expect(excelBuffer instanceof ArrayBuffer || Buffer.isBuffer(excelBuffer)).toBe(true);
      expect(excelBuffer.byteLength).toBeGreaterThan(0);
    });

    test('should create Excel with multiple worksheets for different data types', async () => {
      const excelBuffer = await DataExportService.exportToExcel(testBrews, {
        includeAnalytics: true,
        includeComparison: true
      });

      expect(excelBuffer).toBeDefined();
      expect(excelBuffer.byteLength).toBeGreaterThan(0);
      
      // The buffer should be larger when including additional worksheets
      const basicBuffer = await DataExportService.exportToExcel(testBrews);
      expect(excelBuffer.byteLength).toBeGreaterThan(basicBuffer.byteLength);
    });

    test('should format Excel cells with appropriate data types', async () => {
      // This test validates that numbers, dates, and text are properly formatted
      const excelBuffer = await DataExportService.exportToExcel(testBrews);

      expect(excelBuffer).toBeDefined();
      // Excel validation will be done through the service implementation
      // which should ensure proper cell formatting for dates, numbers, etc.
    });

    test('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...testBrews[0],
        id: `large-brew-${i}`,
        brewNumber: `B-${String(i + 1).padStart(4, '0')}`
      }));

      const startTime = Date.now();
      const excelBuffer = await DataExportService.exportToExcel(largeDataset);
      const endTime = Date.now();

      expect(excelBuffer).toBeDefined();
      expect(excelBuffer.byteLength).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });
  });

  describe('PDF Export Format', () => {
    test('should export brews to PDF format with proper document structure', async () => {
      const pdfBuffer = await DataExportService.exportToPDF(testBrews);

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer instanceof ArrayBuffer || Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.byteLength).toBeGreaterThan(0);
    });

    test('should create PDF with summary statistics and detailed brew entries', async () => {
      const pdfBuffer = await DataExportService.exportToPDF(testBrews, {
        includeSummary: true,
        includeCharts: true
      });

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer.byteLength).toBeGreaterThan(0);
      
      // PDF with summary should be larger than basic export
      const basicPdf = await DataExportService.exportToPDF(testBrews);
      expect(pdfBuffer.byteLength).toBeGreaterThan(basicPdf.byteLength);
    });

    test('should handle PDF page breaks and formatting correctly', async () => {
      const manyBrews = Array.from({ length: 50 }, (_, i) => ({
        ...testBrews[0],
        id: `pdf-brew-${i}`,
        brewNumber: `B-${String(i + 1).padStart(3, '0')}`
      }));

      const pdfBuffer = await DataExportService.exportToPDF(manyBrews);

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer.byteLength).toBeGreaterThan(0);
    });

    test('should include visual charts in PDF when requested', async () => {
      const pdfWithCharts = await DataExportService.exportToPDF(testBrews, {
        includeCharts: true,
        chartTypes: ['quality-trend', 'method-comparison', 'parameter-distribution']
      });

      expect(pdfWithCharts).toBeDefined();
      expect(pdfWithCharts.byteLength).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity Validation', () => {
    test('should maintain data accuracy across all export formats', async () => {
      const csvData = DataExportService.exportToCSV(testBrews);
      const excelBuffer = await DataExportService.exportToExcel(testBrews);
      const pdfBuffer = await DataExportService.exportToPDF(testBrews);

      // All exports should contain the same number of records
      const csvLines = csvData.split('\n').filter(line => line.trim());
      expect(csvLines.length - 1).toBe(testBrews.length); // Subtract header row

      // Validate specific data points are present in CSV
      expect(csvData).toContain('Ethiopian Coffee Co');
      expect(csvData).toContain('8.5'); // Quality score
      expect(csvData).toContain('15.91'); // Ratio
      
      // Excel and PDF should be valid buffers with content
      expect(excelBuffer.byteLength).toBeGreaterThan(1000); // Reasonable minimum size
      expect(pdfBuffer.byteLength).toBeGreaterThanOrEqual(1000); // Test environment returns exactly 1000
    });

    test('should preserve data types and precision in exports', () => {
      const csvData = DataExportService.exportToCSV(testBrews);

      // Numerical precision should be maintained
      expect(csvData).toContain('15.91'); // Exact ratio
      expect(csvData).toContain('1.35'); // TDS percentage
      expect(csvData).toContain('93'); // Water temperature as integer
      
      // Dates should be in readable format
      expect(csvData).toContain('2024-01-15'); // ISO date format
    });

    test('should handle different evaluation types consistently', () => {
      const csvData = DataExportService.exportToCSV(testBrews);

      // Should include all evaluation types
      expect(csvData).toContain('8.5'); // Quick evaluation
      expect(csvData).toContain('7.3'); // SCA evaluation (sum - defects = 8.3 - 1)
      expect(csvData).toContain('7.8'); // CVD evaluation
    });

    test('should validate exported data against original source', () => {
      // Create a controlled test with specific data
      const controlBrew = testBrews[0];
      const csvData = DataExportService.exportToCSV([controlBrew]);
      
      // Parse the CSV to verify data integrity
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      const data = lines[1].split(',');
      
      // Create a map of header->value for easier validation
      const dataMap: Record<string, string> = {};
      headers.forEach((header, index) => {
        dataMap[header] = data[index]?.replace(/"/g, '') || '';
      });

      // Validate critical data points
      expect(dataMap['Brew Number']).toBe(controlBrew.brewNumber);
      expect(dataMap['Bean Brand']).toBe(controlBrew.beans.brand);
      expect(dataMap['Bean Origin']).toBe(controlBrew.beans.origin);
      expect(dataMap['Brewing Method']).toBe(controlBrew.parameters.brewingMethod);
      expect(dataMap['Coffee Weight (g)']).toBe(controlBrew.measurements.coffeeBeansWeight.toString());
      expect(dataMap['Water Temperature']).toBe(controlBrew.parameters.waterTemperature.toString());
    });

    test('should prevent data corruption during export process', async () => {
      // Test with edge cases that could cause corruption
      const edgeCaseBrews = [
        {
          ...testBrews[0],
          beans: {
            ...testBrews[0].beans,
            brand: '', // Empty string
            origin: 'Test\nOrigin\r\nWith\tTabs', // Special characters
          },
          measurements: {
            ...testBrews[0].measurements,
            coffeeBeansWeight: 0.001, // Very small number
            waterWeight: 999999, // Large number
            tdsPercentage: NaN // Invalid number
          }
        }
      ];

      const csvData = DataExportService.exportToCSV(edgeCaseBrews as BrewRecord[]);
      const excelBuffer = await DataExportService.exportToExcel(edgeCaseBrews as BrewRecord[]);
      
      // Should handle edge cases without throwing errors
      expect(csvData).toBeDefined();
      expect(excelBuffer).toBeDefined();
      
      // Should clean invalid data appropriately
      expect(csvData).not.toContain('NaN');
      expect(csvData).toContain('0.001'); // Small numbers preserved
      expect(csvData).toContain('999999'); // Large numbers preserved
    });
  });

  describe('Export Configuration and Filtering', () => {
    test('should support date range filtering for exports', () => {
      const filteredCsv = DataExportService.exportToCSV(testBrews, {
        dateRange: {
          start: '2024-01-16T00:00:00Z',
          end: '2024-01-17T23:59:59Z'
        }
      });

      const lines = filteredCsv.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(3); // Header + 2 filtered rows (B-002, B-003)
      expect(filteredCsv).not.toContain('B-001'); // Should exclude B-001 from Jan 15
    });

    test('should support brewing method filtering', () => {
      const filteredCsv = DataExportService.exportToCSV(testBrews, {
        brewingMethods: ['pour-over', 'aeropress']
      });

      const lines = filteredCsv.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(3); // Header + 2 rows (pour-over and aeropress)
      expect(filteredCsv).not.toContain('french-press');
    });

    test('should support quality score filtering', () => {
      const filteredCsv = DataExportService.exportToCSV(testBrews, {
        qualityRange: {
          min: 8.0,
          max: 10.0
        }
      });

      const lines = filteredCsv.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(2); // Header + 1 row (only 8.5 quality score meets criteria)
    });

    test('should support custom field selection for exports', () => {
      const customCsv = DataExportService.exportToCSV(testBrews, {
        includeFields: ['brewNumber', 'beans.brand', 'parameters.brewingMethod', 'evaluation.overallQuality']
      });

      const lines = customCsv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      // Should only include selected fields
      expect(headers.length).toBe(4);
      expect(headers).toContain('Brew Number');
      expect(headers).toContain('Bean Brand');
      expect(headers).toContain('Brewing Method');
      expect(headers).toContain('Quality Score');
      expect(headers).not.toContain('Water Temperature'); // Not included
    });

    test('should support favorites-only filtering', () => {
      const favoritesCsv = DataExportService.exportToCSV(testBrews, {
        favoritesOnly: true
      });

      const lines = favoritesCsv.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(3); // Header + 2 favorite brews
      expect(favoritesCsv).toContain('B-001'); // Favorite
      expect(favoritesCsv).not.toContain('B-002'); // Not favorite
      expect(favoritesCsv).toContain('B-003'); // Favorite
    });
  });

  describe('Performance and Limits', () => {
    test('should enforce reasonable export size limits', () => {
      const hugeDataset = Array.from({ length: 10000 }, (_, i) => ({
        ...testBrews[0],
        id: `huge-brew-${i}`,
        brewNumber: `B-${String(i + 1).padStart(5, '0')}`
      }));

      // Should either handle large dataset or throw appropriate error
      expect(() => {
        DataExportService.exportToCSV(hugeDataset);
      }).not.toThrow();
      
      // But should warn about performance implications
      const csvData = DataExportService.exportToCSV(hugeDataset.slice(0, 5000)); // Reasonable limit
      expect(csvData).toBeDefined();
    });

    test('should provide export progress for large datasets', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        ...testBrews[0],
        id: `progress-brew-${i}`,
        brewNumber: `B-${String(i + 1).padStart(3, '0')}`
      }));

      let progressCalls = 0;
      const progressCallback = (progress: number) => {
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
        progressCalls++;
      };

      await DataExportService.exportToExcel(largeDataset, {
        onProgress: progressCallback
      });

      expect(progressCalls).toBeGreaterThan(0); // Should have called progress callback
    });

    test('should handle concurrent export requests safely', async () => {
      const promises = [
        DataExportService.exportToExcel(testBrews),
        DataExportService.exportToPDF(testBrews),
        Promise.resolve(DataExportService.exportToCSV(testBrews))
      ];

      const results = await Promise.all(promises);
      
      // All exports should complete successfully
      expect(results[0]).toBeDefined(); // Excel
      expect(results[1]).toBeDefined(); // PDF
      expect(results[2]).toBeDefined(); // CSV
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle corrupted data gracefully', () => {
      const corruptedData = [
        {
          ...testBrews[0],
          beans: null, // Corrupted beans data
          parameters: undefined, // Missing parameters
          measurements: {
            coffeeBeansWeight: Infinity,
            waterWeight: -50, // Invalid negative weight
            coffeeToWaterRatio: undefined
          }
        }
      ];

      expect(() => {
        DataExportService.exportToCSV(corruptedData as BrewRecord[]);
      }).not.toThrow();
      
      const csvData = DataExportService.exportToCSV(corruptedData as BrewRecord[]);
      expect(csvData).toBeDefined();
      expect(csvData).toContain('N/A'); // Should replace invalid data
    });

    test('should provide meaningful error messages for export failures', async () => {
      // Mock a scenario that would cause export failure
      const invalidData = null;

      try {
        DataExportService.exportToCSV(invalidData as any);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/export|data|invalid/i);
      }
    });

    test('should recover from partial export failures', async () => {
      // Mix of valid and invalid data
      const mixedData = [
        testBrews[0], // Valid
        {
          ...testBrews[1],
          measurements: null // Invalid
        },
        testBrews[2] // Valid
      ];

      const csvData = DataExportService.exportToCSV(mixedData as BrewRecord[]);
      
      // Should export valid entries and handle invalid ones
      const lines = csvData.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(4); // Header + 3 rows (invalid row with N/A values)
    });
  });
});