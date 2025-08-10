import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ServiceProvider } from '../../contexts/ServiceContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { BrewsList } from '../../components/brews/BrewsList';
import { BrewCard } from '../../components/brews/BrewCard';
import { BrewFilters } from '../../components/brews/BrewFilters';
import { BrewRecord, CreateBrewRequest, BrewListFilters } from '../../types/brew';
import { getBrewService } from '../../services/brewService';

// Mock the API client to simulate backend responses
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

jest.mock('../../services/apiClient', () => ({
  createApiClient: () => mockApiClient
}));

// Test data factory
const createMockBrew = (overrides: Partial<BrewRecord> = {}): BrewRecord => ({
  id: 'brew-1',
  userId: 'user-1',
  brewNumber: '001',
  userName: 'Test User',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  isShared: false,
  isFavorite: false,
  beans: {
    brand: 'Ethiopian Coffee Co.',
    origin: 'Yirgacheffe',
    processingMethod: 'washed',
    altitude: 1800,
    roastingDate: '2024-01-10',
    roastingLevel: 'medium'
  },
  parameters: {
    brewingMethod: 'pour-over',
    grinderModel: 'Baratza Encore',
    grinderSetting: '15',
    waterTemperature: 92,
    filteringTools: 'Hario V60',
    waterQuality: 'filtered'
  },
  turbulenceSteps: [
    {
      stepOrder: 1,
      actionType: 'bloom',
      description: 'Initial bloom',
      actionTime: 30,
      volume: 60,
      technique: 'center pour'
    }
  ],
  measurements: {
    coffeeBeansWeight: 20,
    waterWeight: 320,
    brewedCoffeeWeight: 280,
    tdsPercentage: 1.2,
    coffeeToWaterRatio: 16
  },
  evaluation: {
    type: 'quick',
    overallQuality: 8,
    notes: 'Bright and fruity'
  },
  ...overrides
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <ServiceProvider>
        {children}
      </ServiceProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Brew Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses by default
    mockApiClient.get.mockResolvedValue({
      success: true,
      data: {
        brews: [createMockBrew(), createMockBrew({ id: 'brew-2', brewNumber: '002' })],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 2,
          hasMore: false
        },
        filters: {
          appliedFilters: {},
          availableFilters: {
            brewingMethods: ['pour-over', 'french-press'],
            brands: ['Ethiopian Coffee Co.'],
            origins: ['Yirgacheffe']
          }
        }
      }
    });
  });

  describe('Complete Brew Management Workflow', () => {
    test('should load and display brews list successfully', async () => {
      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      // Should show loading state initially
      expect(screen.getByText('Loading your brews...')).toBeInTheDocument();

      // Wait for brews to load
      await waitFor(() => {
        expect(screen.getByText('Ethiopian Coffee Co.')).toBeInTheDocument();
      });

      // Should display brew cards
      expect(screen.getByText('Yirgacheffe')).toBeInTheDocument();
      expect(screen.getByText('Quality: 8')).toBeInTheDocument();

      // Should call the correct API endpoint
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/brews?')
      );
    });

    test('should handle search and filtering workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Ethiopian Coffee Co.')).toBeInTheDocument();
      });

      // Test search functionality
      const searchInput = screen.getByPlaceholderText('Search brews');
      await user.type(searchInput, 'Ethiopian');

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          expect.stringContaining('search=Ethiopian')
        );
      });

      // Test method filter
      const methodSelect = screen.getByDisplayValue('All Methods');
      await user.selectOptions(methodSelect, 'pour-over');

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          expect.stringContaining('brewingMethod=pour-over')
        );
      });
    });

    test('should handle favorite toggle workflow', async () => {
      const user = userEvent.setup();
      
      // Mock successful toggle response
      mockApiClient.put.mockResolvedValueOnce({
        success: true,
        data: {
          brew: createMockBrew({ isFavorite: true })
        }
      });

      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      // Wait for brews to load
      await waitFor(() => {
        expect(screen.getByText('Ethiopian Coffee Co.')).toBeInTheDocument();
      });

      // Click favorite button
      const favoriteButton = screen.getAllByRole('button', { name: 'Favorite' })[0];
      await user.click(favoriteButton);

      // Should call update API
      await waitFor(() => {
        expect(mockApiClient.put).toHaveBeenCalledWith(
          '/api/v1/brews/brew-1',
          { isFavorite: true }
        );
      });
    });

    test('should handle duplicate brew workflow', async () => {
      const user = userEvent.setup();
      
      // Mock successful duplicate response
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          brew: createMockBrew({ id: 'brew-duplicate', brewNumber: '003' })
        }
      });

      // Mock refreshed list after duplicate
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [
            createMockBrew(),
            createMockBrew({ id: 'brew-2', brewNumber: '002' }),
            createMockBrew({ id: 'brew-duplicate', brewNumber: '003' })
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRecords: 3,
            hasMore: false
          },
          filters: {
            appliedFilters: {},
            availableFilters: {
              brewingMethods: ['pour-over', 'french-press'],
              brands: ['Ethiopian Coffee Co.'],
              origins: ['Yirgacheffe']
            }
          }
        }
      });

      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Ethiopian Coffee Co.')).toBeInTheDocument();
      });

      // Click duplicate button
      const duplicateButton = screen.getAllByRole('button', { name: 'Duplicate' })[0];
      await user.click(duplicateButton);

      // Should call duplicate API
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/brews/brew-1/duplicate');
      });

      // Should refresh the list
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(2); // Initial load + refresh
      });
    });

    test('should handle delete brew workflow', async () => {
      const user = userEvent.setup();
      
      // Mock successful delete response
      mockApiClient.delete.mockResolvedValueOnce({
        success: true
      });

      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Ethiopian Coffee Co.')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getAllByRole('button', { name: 'Delete' })[0];
      await user.click(deleteButton);

      // Should call delete API
      await waitFor(() => {
        expect(mockApiClient.delete).toHaveBeenCalledWith('/api/v1/brews/brew-1');
      });
    });

    test('should handle pagination workflow', async () => {
      const user = userEvent.setup();

      // Mock paginated response
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [createMockBrew()],
          pagination: {
            currentPage: 1,
            totalPages: 3,
            totalRecords: 25,
            hasMore: true
          },
          filters: {
            appliedFilters: {},
            availableFilters: {}
          }
        }
      });

      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Ethiopian Coffee Co.')).toBeInTheDocument();
      });

      // Should show pagination controls
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();

      // Click next page
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await user.click(nextButton);

      // Should request page 2
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          expect.stringContaining('page=2')
        );
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle API error gracefully', async () => {
      // Mock API failure
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Brews')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Should show retry button
      const retryButton = screen.getByRole('button', { name: 'Try Again' });
      expect(retryButton).toBeInTheDocument();
    });

    test('should handle empty state correctly', async () => {
      // Mock empty response
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalRecords: 0,
            hasMore: false
          },
          filters: {
            appliedFilters: {},
            availableFilters: {}
          }
        }
      });

      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      // Should show empty state for new users
      await waitFor(() => {
        expect(screen.getByText('No brews yet')).toBeInTheDocument();
        expect(screen.getByText('Start tracking your coffee brewing journey!')).toBeInTheDocument();
      });
    });

    test('should handle validation errors on actions', async () => {
      const user = userEvent.setup();
      
      // Mock validation error response
      mockApiClient.put.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            details: [
              { field: 'isFavorite', message: 'Invalid favorite status' }
            ]
          }
        }
      });

      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Ethiopian Coffee Co.')).toBeInTheDocument();
      });

      // Click favorite button (should fail)
      const favoriteButton = screen.getAllByRole('button', { name: 'Favorite' })[0];
      await user.click(favoriteButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Failed to update favorite')).toBeInTheDocument();
      });
    });
  });

  describe('Service Integration Tests', () => {
    test('should integrate with BrewService correctly', async () => {
      const brewService = getBrewService();
      
      // Test service methods are called correctly
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [createMockBrew()],
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 1, hasMore: false },
          filters: { appliedFilters: {}, availableFilters: {} }
        }
      });

      const filters: BrewListFilters = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: 'Ethiopian'
      };

      const result = await brewService.getBrews(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=Ethiopian')
      );
      expect(result.brews).toHaveLength(1);
      expect(result.brews[0].beans.brand).toBe('Ethiopian Coffee Co.');
    });

    test('should handle service validation correctly', async () => {
      const brewService = getBrewService();

      const invalidBrewData: CreateBrewRequest = {
        beans: {
          brand: '', // Invalid: empty brand
          origin: 'Yirgacheffe',
          processingMethod: 'washed'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Baratza Encore',
          grinderSetting: '15',
          waterTemperature: 92
        },
        measurements: {
          coffeeBeansWeight: 20,
          waterWeight: 320
        }
      };

      await expect(brewService.createBrew(invalidBrewData)).rejects.toThrow(
        expect.stringContaining('Validation failed')
      );
    });
  });

  describe('Component Integration', () => {
    test('BrewCard integrates correctly with parent actions', async () => {
      const user = userEvent.setup();
      const mockOnViewDetails = jest.fn();
      const mockOnDuplicate = jest.fn();
      const mockOnToggleFavorite = jest.fn();

      const mockBrew = createMockBrew();

      render(
        <TestWrapper>
          <BrewCard
            brew={mockBrew}
            onViewDetails={mockOnViewDetails}
            onDuplicate={mockOnDuplicate}
            onToggleFavorite={mockOnToggleFavorite}
          />
        </TestWrapper>
      );

      // Test view details
      const viewButton = screen.getByRole('button', { name: 'View Details' });
      await user.click(viewButton);
      expect(mockOnViewDetails).toHaveBeenCalledWith('brew-1');

      // Test duplicate
      const duplicateButton = screen.getByRole('button', { name: 'Duplicate' });
      await user.click(duplicateButton);
      expect(mockOnDuplicate).toHaveBeenCalledWith('brew-1');

      // Test toggle favorite
      const favoriteButton = screen.getByRole('button', { name: 'Favorite' });
      await user.click(favoriteButton);
      expect(mockOnToggleFavorite).toHaveBeenCalledWith('brew-1', true);
    });

    test('BrewFilters integrates correctly with list updates', async () => {
      const user = userEvent.setup();
      const mockOnFiltersChange = jest.fn();

      const filters: BrewListFilters = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      render(
        <TestWrapper>
          <BrewFilters
            filters={filters}
            onFiltersChange={mockOnFiltersChange}
            totalRecords={25}
          />
        </TestWrapper>
      );

      // Test search input
      const searchInput = screen.getByPlaceholderText('Search brews');
      await user.type(searchInput, 'Ethiopian');

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'Ethiopian',
            page: 1 // Should reset to page 1
          })
        );
      });

      // Test sort change
      const sortSelect = screen.getByDisplayValue('Newest First');
      await user.selectOptions(sortSelect, 'quality-desc');

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'quality',
          sortOrder: 'desc'
        })
      );
    });
  });

  describe('Performance Integration', () => {
    test('should handle large datasets efficiently', async () => {
      // Mock large dataset response
      const largeBrewList = Array.from({ length: 100 }, (_, i) => 
        createMockBrew({ id: `brew-${i}`, brewNumber: String(i + 1).padStart(3, '0') })
      );

      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: largeBrewList.slice(0, 20), // First page
          pagination: {
            currentPage: 1,
            totalPages: 5,
            totalRecords: 100,
            hasMore: true
          },
          filters: {
            appliedFilters: {},
            availableFilters: {}
          }
        }
      });

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      });

      const endTime = performance.now();
      
      // Should render within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Should only render 20 items (pagination)
      const brewCards = screen.getAllByText('Ethiopian Coffee Co.');
      expect(brewCards).toHaveLength(20);
    });

    test('should debounce search input correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BrewsList />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Ethiopian Coffee Co.')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search brews');
      
      // Type multiple characters quickly
      await user.type(searchInput, 'Ethiopian Coffee');

      // Should only call API once after debounce period
      await waitFor(() => {
        const searchCalls = mockApiClient.get.mock.calls.filter(call => 
          call[0].includes('search=Ethiopian%20Coffee')
        );
        expect(searchCalls).toHaveLength(1);
      }, { timeout: 1000 });
    });
  });
});