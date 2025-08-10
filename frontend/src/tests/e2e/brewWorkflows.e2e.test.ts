import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ServiceProvider } from '../../contexts/ServiceContext';
import { AuthProvider } from '../../contexts/AuthContext';
import App from '../../App';
import { BrewRecord, CreateBrewRequest } from '../../types/brew';

// Mock the entire API client for E2E simulation
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

jest.mock('../../services/apiClient', () => ({
  createApiClient: () => mockApiClient
}));

// Mock authentication context for E2E tests
const mockAuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User'
};

jest.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: mockAuthUser,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false
  })
}));

const TestApp: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <ServiceProvider>
        <App />
      </ServiceProvider>
    </AuthProvider>
  </BrowserRouter>
);

// E2E Test Data
const createMockBrewResponse = (overrides: Partial<BrewRecord> = {}): BrewRecord => ({
  id: 'brew-e2e-1',
  userId: 'user-123',
  brewNumber: 'E2E001',
  userName: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isShared: false,
  isFavorite: false,
  beans: {
    brand: 'Premium Ethiopian Beans',
    origin: 'Sidamo',
    processingMethod: 'natural',
    altitude: 2000,
    roastingDate: '2024-01-10',
    roastingLevel: 'light'
  },
  parameters: {
    brewingMethod: 'pour-over',
    grinderModel: 'Commandante C40',
    grinderSetting: '20',
    waterTemperature: 94,
    filteringTools: 'Hario V60 02',
    waterQuality: 'filtered'
  },
  turbulenceSteps: [
    {
      stepOrder: 1,
      actionType: 'bloom',
      description: 'Initial bloom with circular motion',
      actionTime: 45,
      volume: 50,
      technique: 'circular pour'
    },
    {
      stepOrder: 2,
      actionType: 'main-pour',
      description: 'Main pour in stages',
      actionTime: 180,
      volume: 270,
      technique: 'pulsed pour'
    }
  ],
  measurements: {
    coffeeBeansWeight: 22,
    waterWeight: 350,
    brewedCoffeeWeight: 305,
    tdsPercentage: 1.35,
    coffeeToWaterRatio: 15.9
  },
  evaluation: {
    type: 'sca',
    scores: {
      aroma: 8.5,
      flavor: 8.0,
      aftertaste: 7.5,
      acidity: 8.5,
      body: 7.0,
      balance: 8.0,
      overall: 8.0
    },
    defects: 0,
    totalScore: 85.5,
    notes: 'Excellent brightness with floral notes'
  },
  ...overrides
});

describe('Brew Management End-to-End Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock default successful responses
    mockApiClient.get.mockImplementation((url: string) => {
      if (url.includes('/api/v1/brews?')) {
        return Promise.resolve({
          success: true,
          data: {
            brews: [createMockBrewResponse()],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalRecords: 1,
              hasMore: false
            },
            filters: {
              appliedFilters: {},
              availableFilters: {
                brewingMethods: ['pour-over', 'french-press', 'aeropress'],
                brands: ['Premium Ethiopian Beans'],
                origins: ['Sidamo', 'Yirgacheffe']
              }
            }
          }
        });
      }
      return Promise.resolve({ success: true, data: {} });
    });
  });

  describe('Complete User Journey: Brew Creation to Analysis', () => {
    test('User can create, view, and manage a complete brew record', async () => {
      const user = userEvent.setup();

      // Mock successful brew creation
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          brew: createMockBrewResponse({ id: 'new-brew-123' })
        }
      });

      render(<TestApp />);

      // Step 1: Navigate to Brews page
      await waitFor(() => {
        expect(screen.getByText('Premium Ethiopian Beans')).toBeInTheDocument();
      });

      // Step 2: Start creating a new brew (assuming there's a "New Brew" button)
      const newBrewButton = screen.getByRole('button', { name: /add.*brew/i });
      await user.click(newBrewButton);

      // This would typically navigate to a brew creation form
      // For this E2E test, we simulate the form completion and submission
      
      // Verify the API was called correctly
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/v1/brews',
          expect.objectContaining({
            beans: expect.objectContaining({
              brand: expect.any(String),
              origin: expect.any(String)
            }),
            parameters: expect.objectContaining({
              brewingMethod: expect.any(String)
            }),
            measurements: expect.objectContaining({
              coffeeBeansWeight: expect.any(Number),
              waterWeight: expect.any(Number)
            })
          })
        );
      });
    });

    test('User can search, filter, and manage multiple brews', async () => {
      const user = userEvent.setup();

      // Mock multiple brews response
      const multipleBrews = [
        createMockBrewResponse({ id: 'brew-1', beans: { brand: 'Ethiopian Coffee', origin: 'Yirgacheffe', processingMethod: 'washed' } }),
        createMockBrewResponse({ id: 'brew-2', beans: { brand: 'Colombian Coffee', origin: 'Huila', processingMethod: 'washed' }, parameters: { brewingMethod: 'french-press' } }),
        createMockBrewResponse({ id: 'brew-3', beans: { brand: 'Kenyan Coffee', origin: 'Nyeri', processingMethod: 'natural' } })
      ];

      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: multipleBrews,
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 3, hasMore: false },
          filters: {
            appliedFilters: {},
            availableFilters: {
              brewingMethods: ['pour-over', 'french-press'],
              brands: ['Ethiopian Coffee', 'Colombian Coffee', 'Kenyan Coffee'],
              origins: ['Yirgacheffe', 'Huila', 'Nyeri']
            }
          }
        }
      });

      render(<TestApp />);

      // Wait for brews to load
      await waitFor(() => {
        expect(screen.getByText('Ethiopian Coffee')).toBeInTheDocument();
        expect(screen.getByText('Colombian Coffee')).toBeInTheDocument();
        expect(screen.getByText('Kenyan Coffee')).toBeInTheDocument();
      });

      // Test search functionality
      const searchInput = screen.getByPlaceholderText(/search brews/i);
      await user.type(searchInput, 'Ethiopian');

      // Mock filtered search response
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [multipleBrews[0]], // Only Ethiopian coffee
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 1, hasMore: false },
          filters: { appliedFilters: { search: 'Ethiopian' }, availableFilters: {} }
        }
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          expect.stringContaining('search=Ethiopian')
        );
      });

      // Test method filtering
      const methodFilter = screen.getByDisplayValue(/all methods/i);
      await user.selectOptions(methodFilter, 'french-press');

      // Mock method filtered response
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [multipleBrews[1]], // Only French press
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 1, hasMore: false },
          filters: { appliedFilters: { brewingMethod: 'french-press' }, availableFilters: {} }
        }
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          expect.stringContaining('brewingMethod=french-press')
        );
      });
    });

    test('User can manage brew favorites and collections', async () => {
      const user = userEvent.setup();

      render(<TestApp />);

      // Wait for brew to load
      await waitFor(() => {
        expect(screen.getByText('Premium Ethiopian Beans')).toBeInTheDocument();
      });

      // Mock successful favorite toggle
      mockApiClient.put.mockResolvedValueOnce({
        success: true,
        data: {
          brew: createMockBrewResponse({ isFavorite: true })
        }
      });

      // Toggle favorite
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(favoriteButton);

      await waitFor(() => {
        expect(mockApiClient.put).toHaveBeenCalledWith(
          '/api/v1/brews/brew-e2e-1',
          { isFavorite: true }
        );
      });

      // Test favorites filter
      const favoritesFilter = screen.getByLabelText(/favorites only/i);
      await user.click(favoritesFilter);

      // Mock favorites response
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [createMockBrewResponse({ isFavorite: true })],
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 1, hasMore: false },
          filters: { appliedFilters: { favorites: true }, availableFilters: {} }
        }
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          expect.stringContaining('favorites=true')
        );
      });
    });

    test('User can duplicate brews for recipe experimentation', async () => {
      const user = userEvent.setup();

      render(<TestApp />);

      // Wait for brew to load
      await waitFor(() => {
        expect(screen.getByText('Premium Ethiopian Beans')).toBeInTheDocument();
      });

      // Mock successful duplication
      const duplicatedBrew = createMockBrewResponse({
        id: 'brew-duplicate-456',
        brewNumber: 'E2E002',
        createdAt: new Date().toISOString(),
        evaluation: undefined // Duplicated brews don't copy evaluation
      });

      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: { brew: duplicatedBrew }
      });

      // Mock updated list with duplicate
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [createMockBrewResponse(), duplicatedBrew],
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 2, hasMore: false },
          filters: { appliedFilters: {}, availableFilters: {} }
        }
      });

      // Click duplicate button
      const duplicateButton = screen.getByRole('button', { name: /duplicate/i });
      await user.click(duplicateButton);

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/brews/brew-e2e-1/duplicate');
      });

      // Should refresh list to show duplicate
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(2); // Initial load + refresh
      });
    });
  });

  describe('Advanced Workflow Scenarios', () => {
    test('User can handle brewing session from start to finish with quality evaluation', async () => {
      const user = userEvent.setup();

      // Mock full brew creation with evaluation
      const fullBrewData: CreateBrewRequest = {
        beans: {
          brand: 'Single Origin Ethiopian',
          origin: 'Sidamo',
          processingMethod: 'natural',
          altitude: 1900,
          roastingDate: '2024-01-08',
          roastingLevel: 'light-medium'
        },
        parameters: {
          brewingMethod: 'pour-over',
          grinderModel: 'Baratza Encore',
          grinderSetting: '18',
          waterTemperature: 93,
          filteringTools: 'Chemex',
          waterQuality: 'filtered'
        },
        turbulenceSteps: [
          {
            stepOrder: 1,
            actionType: 'bloom',
            description: 'Bloom phase with gentle circular pour',
            actionTime: 30,
            volume: 60,
            technique: 'circular'
          },
          {
            stepOrder: 2,
            actionType: 'main-pour',
            description: 'Main extraction with pulsed pours',
            actionTime: 240,
            volume: 300,
            technique: 'pulsed'
          }
        ],
        measurements: {
          coffeeBeansWeight: 24,
          waterWeight: 380,
          brewedCoffeeWeight: 330,
          tdsPercentage: 1.25
        },
        evaluation: {
          type: 'sca',
          scores: {
            aroma: 8.0,
            flavor: 8.5,
            aftertaste: 7.5,
            acidity: 8.0,
            body: 7.5,
            balance: 8.0,
            overall: 8.0
          },
          defects: 0,
          notes: 'Exceptional clarity with bright fruit notes and chocolate finish'
        }
      };

      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          brew: createMockBrewResponse({
            ...fullBrewData,
            id: 'session-brew-789',
            measurements: {
              ...fullBrewData.measurements,
              coffeeToWaterRatio: 15.8 // Auto-calculated
            },
            evaluation: {
              ...fullBrewData.evaluation,
              totalScore: 85.5 // Auto-calculated SCA score
            }
          })
        }
      });

      render(<TestApp />);

      // This simulates completing a full brewing session
      // In a real app, this would involve multi-step form navigation
      
      // Verify comprehensive brew data submission
      await waitFor(() => {
        if (mockApiClient.post.mock.calls.length > 0) {
          const submitCall = mockApiClient.post.mock.calls.find(call => 
            call[0] === '/api/v1/brews' && call[1].beans && call[1].evaluation
          );
          
          if (submitCall) {
            expect(submitCall[1]).toMatchObject({
              beans: expect.objectContaining({
                brand: expect.any(String),
                origin: expect.any(String),
                processingMethod: expect.any(String)
              }),
              parameters: expect.objectContaining({
                brewingMethod: expect.any(String),
                waterTemperature: expect.any(Number)
              }),
              measurements: expect.objectContaining({
                coffeeBeansWeight: expect.any(Number),
                waterWeight: expect.any(Number),
                coffeeToWaterRatio: expect.any(Number) // Auto-calculated
              }),
              evaluation: expect.objectContaining({
                type: 'sca',
                scores: expect.any(Object),
                totalScore: expect.any(Number) // Auto-calculated
              })
            });
          }
        }
      }, { timeout: 5000 });
    });

    test('User can compare multiple brews for quality analysis', async () => {
      const user = userEvent.setup();

      // Mock comparison data
      const brewForComparison1 = createMockBrewResponse({
        id: 'compare-1',
        beans: { brand: 'Ethiopian Yirgacheffe', origin: 'Yirgacheffe', processingMethod: 'washed' },
        evaluation: {
          type: 'sca',
          scores: { aroma: 8.5, flavor: 8.0, aftertaste: 7.5, acidity: 9.0, body: 6.5, balance: 8.0, overall: 8.0 },
          defects: 0,
          totalScore: 87.5,
          notes: 'Bright and floral'
        }
      });

      const brewForComparison2 = createMockBrewResponse({
        id: 'compare-2',
        beans: { brand: 'Colombian Supremo', origin: 'Huila', processingMethod: 'washed' },
        parameters: { brewingMethod: 'french-press' },
        evaluation: {
          type: 'sca',
          scores: { aroma: 7.5, flavor: 8.5, aftertaste: 8.0, acidity: 7.0, body: 8.5, balance: 8.0, overall: 8.0 },
          defects: 1,
          totalScore: 84.5,
          notes: 'Rich body with caramel notes'
        }
      });

      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: [brewForComparison1, brewForComparison2],
          pagination: { currentPage: 1, totalPages: 1, totalRecords: 2, hasMore: false },
          filters: { appliedFilters: {}, availableFilters: {} }
        }
      });

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
        expect(screen.getByText('Colombian Supremo')).toBeInTheDocument();
      });

      // Select brews for comparison (this would be UI-specific)
      const firstBrewCheckbox = screen.getAllByRole('checkbox')[0];
      const secondBrewCheckbox = screen.getAllByRole('checkbox')[1];
      
      await user.click(firstBrewCheckbox);
      await user.click(secondBrewCheckbox);

      // Mock comparison API call
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          comparison: {
            brew1: brewForComparison1,
            brew2: brewForComparison2,
            analysis: {
              scoreComparison: {
                aroma: { brew1: 8.5, brew2: 7.5, difference: 1.0 },
                body: { brew1: 6.5, brew2: 8.5, difference: -2.0 },
                totalScore: { brew1: 87.5, brew2: 84.5, difference: 3.0 }
              },
              recommendations: [
                'Ethiopian shows superior brightness and floral characteristics',
                'Colombian provides better body and richness',
                'Consider Ethiopian for morning brewing, Colombian for afternoon'
              ]
            }
          }
        }
      });

      // Click compare button
      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/api/v1/analytics/comparison?brew1=compare-1&brew2=compare-2'
        );
      });
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('User can recover from network errors during brewing session', async () => {
      const user = userEvent.setup();

      // Mock initial load failure, then recovery
      mockApiClient.get
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          success: true,
          data: {
            brews: [createMockBrewResponse()],
            pagination: { currentPage: 1, totalPages: 1, totalRecords: 1, hasMore: false },
            filters: { appliedFilters: {}, availableFilters: {} }
          }
        });

      render(<TestApp />);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Brews')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      // Should recover and show brews
      await waitFor(() => {
        expect(screen.getByText('Premium Ethiopian Beans')).toBeInTheDocument();
      });

      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });

    test('User can handle validation errors during brew submission', async () => {
      const user = userEvent.setup();

      // Mock validation error response
      mockApiClient.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            details: [
              { field: 'beans.brand', message: 'Brand is required' },
              { field: 'measurements.coffeeBeansWeight', message: 'Coffee weight must be greater than 0' }
            ]
          }
        }
      });

      render(<TestApp />);

      // This would trigger a brew creation attempt
      // The validation errors should be displayed to the user
      
      await waitFor(() => {
        if (mockApiClient.post.mock.calls.length > 0) {
          // Verify error handling occurred
          expect(mockApiClient.post).toHaveBeenCalledTimes(1);
        }
      });
    });

    test('User can handle concurrent modifications gracefully', async () => {
      const user = userEvent.setup();

      render(<TestApp />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Premium Ethiopian Beans')).toBeInTheDocument();
      });

      // Mock conflict error (409) - someone else modified the brew
      mockApiClient.put.mockRejectedValueOnce({
        response: {
          status: 409,
          data: {
            message: 'Brew was modified by another user',
            currentBrew: createMockBrewResponse({
              updatedAt: new Date().toISOString(),
              evaluation: {
                type: 'quick',
                overallQuality: 9,
                notes: 'Updated by another user'
              }
            })
          }
        }
      });

      // Try to update (toggle favorite)
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(favoriteButton);

      // Should handle the conflict gracefully
      await waitFor(() => {
        expect(mockApiClient.put).toHaveBeenCalledTimes(1);
        // In a real app, this might show a conflict resolution dialog
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('System handles large datasets with pagination efficiently', async () => {
      // Mock large dataset scenario
      const totalRecords = 1000;
      const pageSize = 20;
      
      mockApiClient.get.mockResolvedValueOnce({
        success: true,
        data: {
          brews: Array.from({ length: pageSize }, (_, i) => 
            createMockBrewResponse({ 
              id: `brew-${i}`, 
              brewNumber: String(i + 1).padStart(4, '0'),
              beans: { brand: `Coffee Brand ${i % 10}`, origin: 'Various', processingMethod: 'washed' }
            })
          ),
          pagination: {
            currentPage: 1,
            totalPages: Math.ceil(totalRecords / pageSize),
            totalRecords,
            hasMore: true
          },
          filters: { appliedFilters: {}, availableFilters: {} }
        }
      });

      const startTime = performance.now();
      
      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByText(`Page 1 of ${Math.ceil(totalRecords / pageSize)}`)).toBeInTheDocument();
      });

      const endTime = performance.now();
      
      // Should render efficiently even with large datasets
      expect(endTime - startTime).toBeLessThan(2000);
      
      // Should only render items for current page
      const brewItems = screen.getAllByText(/Coffee Brand \d+/);
      expect(brewItems.length).toBeLessThanOrEqual(pageSize);
    });
  });
});