// TASK-008C: Organization Integration Testing - CollectionGrid Integration Tests
// TDD Core: Comprehensive integration testing of collection grid functionality

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CollectionGrid } from '../CollectionGrid';
import { CollectionsService } from '../../../services/collectionsService';
import { CollectionSummary } from '../../../types/collections';

// Mock the collections service
jest.mock('../../../services/collectionsService');
const mockCollectionsService = CollectionsService as jest.Mocked<typeof CollectionsService>;

// Mock the other collection components
jest.mock('../CollectionCard', () => ({
  CollectionCard: ({ collection, onEdit, onDelete, onSelect, onClick, isSelected, selectionMode }: any) => (
    <div data-testid={`collection-card-${collection.id}`}>
      <h3>{collection.name}</h3>
      <p>{collection.description}</p>
      <span>{collection.brewCount} brews</span>
      {selectionMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect?.(collection.id)}
          data-testid={`select-${collection.id}`}
        />
      )}
      <button onClick={() => onClick?.(collection.id)}>View</button>
      <button onClick={() => onEdit?.(collection.id)}>Edit</button>
      <button onClick={() => onDelete?.(collection.id)}>Delete</button>
    </div>
  )
}));

describe('CollectionGrid Integration Tests', () => {
  const mockCollections: CollectionSummary[] = [
    {
      id: 'collection-1',
      name: 'Ethiopian Origins',
      description: 'Collection of Ethiopian coffee brews',
      color: '#10b981',
      brewCount: 5,
      lastBrewDate: '2025-01-01T10:00:00Z',
      previewBrews: []
    },
    {
      id: 'collection-2', 
      name: 'Colombian Classics',
      description: 'Traditional Colombian brewing methods',
      color: '#ef4444',
      brewCount: 3,
      lastBrewDate: '2025-01-02T10:00:00Z',
      previewBrews: []
    },
    {
      id: 'collection-3',
      name: 'French Press Focus',
      description: 'All about French press brewing',
      color: '#8b5cf6',
      brewCount: 0,
      lastBrewDate: undefined,
      previewBrews: []
    }
  ];

  const defaultProps = {
    collections: mockCollections,
    loading: false,
    viewMode: 'grid' as const,
    onCollectionClick: jest.fn(),
    showActions: true,
    emptyMessage: 'No collections found',
    emptyDescription: 'Create your first collection'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering and Display', () => {
    test('should render all collections in grid layout', () => {
      render(<CollectionGrid {...defaultProps} />);

      expect(screen.getByTestId('collection-card-collection-1')).toBeInTheDocument();
      expect(screen.getByTestId('collection-card-collection-2')).toBeInTheDocument();
      expect(screen.getByTestId('collection-card-collection-3')).toBeInTheDocument();

      expect(screen.getByText('Ethiopian Origins')).toBeInTheDocument();
      expect(screen.getByText('Colombian Classics')).toBeInTheDocument();
      expect(screen.getByText('French Press Focus')).toBeInTheDocument();
    });

    test('should render collections in list layout', () => {
      render(<CollectionGrid {...defaultProps} viewMode="list" />);

      const container = screen.getByRole('region', { name: /collections grid/i });
      expect(container).toHaveClass('collections-list');
    });

    test('should display loading state correctly', () => {
      render(<CollectionGrid {...defaultProps} loading={true} collections={[]} />);

      expect(screen.getByText('Loading collections...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('should display empty state when no collections', () => {
      render(<CollectionGrid {...defaultProps} collections={[]} />);

      expect(screen.getByText('No collections found')).toBeInTheDocument();
      expect(screen.getByText('Create your first collection')).toBeInTheDocument();
    });

    test('should show add new collection card when showAddCard is true', () => {
      render(<CollectionGrid {...defaultProps} showAddCard={true} />);

      expect(screen.getByTestId('add-collection-card')).toBeInTheDocument();
      expect(screen.getByText('Create New Collection')).toBeInTheDocument();
    });
  });

  describe('Collection Interactions', () => {
    test('should handle collection click events', async () => {
      const mockOnCollectionClick = jest.fn();
      render(<CollectionGrid {...defaultProps} onCollectionClick={mockOnCollectionClick} />);

      const viewButton = within(screen.getByTestId('collection-card-collection-1')).getByText('View');
      fireEvent.click(viewButton);

      expect(mockOnCollectionClick).toHaveBeenCalledWith('collection-1');
    });

    test('should handle collection edit events', async () => {
      const mockOnCollectionEdit = jest.fn();
      render(<CollectionGrid {...defaultProps} onCollectionEdit={mockOnCollectionEdit} />);

      const editButton = within(screen.getByTestId('collection-card-collection-1')).getByText('Edit');
      fireEvent.click(editButton);

      expect(mockOnCollectionEdit).toHaveBeenCalledWith('collection-1');
    });

    test('should handle collection delete events', async () => {
      const mockOnCollectionDelete = jest.fn();
      render(<CollectionGrid {...defaultProps} onCollectionDelete={mockOnCollectionDelete} />);

      const deleteButton = within(screen.getByTestId('collection-card-collection-1')).getByText('Delete');
      fireEvent.click(deleteButton);

      expect(mockOnCollectionDelete).toHaveBeenCalledWith('collection-1');
    });

    test('should handle add new collection click', async () => {
      const mockOnCollectionEdit = jest.fn();
      render(
        <CollectionGrid 
          {...defaultProps} 
          showAddCard={true} 
          onCollectionEdit={mockOnCollectionEdit} 
        />
      );

      const addCard = screen.getByTestId('add-collection-card');
      fireEvent.click(addCard);

      expect(mockOnCollectionEdit).toHaveBeenCalledWith('new');
    });
  });

  describe('Selection Mode Integration', () => {
    test('should enable selection mode correctly', () => {
      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={[]}
          onCollectionSelect={jest.fn()}
        />
      );

      expect(screen.getByTestId('select-collection-1')).toBeInTheDocument();
      expect(screen.getByTestId('select-collection-2')).toBeInTheDocument();
      expect(screen.getByTestId('select-collection-3')).toBeInTheDocument();
    });

    test('should handle individual collection selection', async () => {
      const mockOnCollectionSelect = jest.fn();
      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={[]}
          onCollectionSelect={mockOnCollectionSelect}
        />
      );

      const checkbox = screen.getByTestId('select-collection-1');
      fireEvent.click(checkbox);

      expect(mockOnCollectionSelect).toHaveBeenCalledWith('collection-1');
    });

    test('should display selected collections correctly', () => {
      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={['collection-1', 'collection-3']}
          onCollectionSelect={jest.fn()}
        />
      );

      const checkbox1 = screen.getByTestId('select-collection-1') as HTMLInputElement;
      const checkbox2 = screen.getByTestId('select-collection-2') as HTMLInputElement;
      const checkbox3 = screen.getByTestId('select-collection-3') as HTMLInputElement;

      expect(checkbox1.checked).toBe(true);
      expect(checkbox2.checked).toBe(false);
      expect(checkbox3.checked).toBe(true);
    });

    test('should handle select all functionality', async () => {
      const mockOnSelectAll = jest.fn();
      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={[]}
          onCollectionSelect={jest.fn()}
          onSelectAll={mockOnSelectAll}
          showSelectAll={true}
        />
      );

      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);

      expect(mockOnSelectAll).toHaveBeenCalledWith(mockCollections.map(c => c.id));
    });

    test('should handle clear selection functionality', async () => {
      const mockOnClearSelection = jest.fn();
      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={['collection-1', 'collection-2']}
          onCollectionSelect={jest.fn()}
          onClearSelection={mockOnClearSelection}
          showSelectAll={true}
        />
      );

      const clearButton = screen.getByText('Clear Selection');
      fireEvent.click(clearButton);

      expect(mockOnClearSelection).toHaveBeenCalled();
    });
  });

  describe('Bulk Operations Integration', () => {
    test('should show bulk action bar when collections are selected', () => {
      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={['collection-1', 'collection-2']}
          onCollectionSelect={jest.fn()}
          onBulkAction={jest.fn()}
        />
      );

      expect(screen.getByText('2 collections selected')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
      expect(screen.getByText('Export Selected')).toBeInTheDocument();
    });

    test('should handle bulk delete operation', async () => {
      const mockOnBulkAction = jest.fn();
      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={['collection-1', 'collection-2']}
          onCollectionSelect={jest.fn()}
          onBulkAction={mockOnBulkAction}
        />
      );

      const deleteButton = screen.getByText('Delete Selected');
      fireEvent.click(deleteButton);

      expect(mockOnBulkAction).toHaveBeenCalledWith('delete', ['collection-1', 'collection-2']);
    });

    test('should handle bulk export operation', async () => {
      const mockOnBulkAction = jest.fn();
      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={['collection-1']}
          onCollectionSelect={jest.fn()}
          onBulkAction={mockOnBulkAction}
        />
      );

      const exportButton = screen.getByText('Export Selected');
      fireEvent.click(exportButton);

      expect(mockOnBulkAction).toHaveBeenCalledWith('export', ['collection-1']);
    });

    test('should disable bulk actions when no collections selected', () => {
      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={[]}
          onCollectionSelect={jest.fn()}
          onBulkAction={jest.fn()}
        />
      );

      expect(screen.queryByText('Delete Selected')).not.toBeInTheDocument();
      expect(screen.queryByText('Export Selected')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation and Accessibility', () => {
    test('should handle keyboard navigation in grid', async () => {
      const user = userEvent.setup();
      render(<CollectionGrid {...defaultProps} />);

      const firstCard = screen.getByTestId('collection-card-collection-1');
      
      await user.tab();
      expect(firstCard).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      const secondCard = screen.getByTestId('collection-card-collection-2');
      expect(secondCard).toHaveFocus();
    });

    test('should support keyboard selection in selection mode', async () => {
      const user = userEvent.setup();
      const mockOnCollectionSelect = jest.fn();

      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={[]}
          onCollectionSelect={mockOnCollectionSelect}
        />
      );

      const checkbox = screen.getByTestId('select-collection-1');
      
      await user.tab();
      await user.keyboard(' '); // Space key to toggle selection
      
      expect(mockOnCollectionSelect).toHaveBeenCalledWith('collection-1');
    });

    test('should have proper ARIA attributes', () => {
      render(<CollectionGrid {...defaultProps} />);

      const grid = screen.getByRole('region', { name: /collections grid/i });
      expect(grid).toHaveAttribute('aria-label', 'Collections grid');

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(mockCollections.length);
    });

    test('should announce selection changes to screen readers', () => {
      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={['collection-1']}
          onCollectionSelect={jest.fn()}
        />
      );

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('1 collection selected');
    });
  });

  describe('Performance and Error Handling', () => {
    test('should handle large collections list efficiently', () => {
      const largeCollectionsList = Array.from({ length: 100 }, (_, i) => ({
        id: `collection-${i}`,
        name: `Collection ${i}`,
        description: `Description ${i}`,
        color: '#10b981',
        brewCount: i % 10,
        lastBrewDate: new Date().toISOString(),
        previewBrews: []
      }));

      const startTime = performance.now();
      render(<CollectionGrid {...defaultProps} collections={largeCollectionsList} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render in less than 1 second
      expect(screen.getAllByRole('article')).toHaveLength(100);
    });

    test('should handle malformed collection data gracefully', () => {
      const malformedCollections = [
        {
          id: 'collection-1',
          name: '', // Invalid empty name
          description: null,
          color: 'invalid-color',
          brewCount: -1, // Invalid negative count
          lastBrewDate: 'invalid-date',
          previewBrews: []
        }
      ] as any;

      expect(() => {
        render(<CollectionGrid {...defaultProps} collections={malformedCollections} />);
      }).not.toThrow();

      // Should still render with fallback values
      expect(screen.getByTestId('collection-card-collection-1')).toBeInTheDocument();
    });

    test('should handle service errors gracefully during bulk operations', async () => {
      mockCollectionsService.deleteCollection.mockRejectedValue(new Error('Service error'));

      const mockOnBulkAction = jest.fn(async (action, ids) => {
        if (action === 'delete') {
          try {
            await Promise.all(ids.map(id => mockCollectionsService.deleteCollection(id)));
          } catch (error) {
            throw new Error('Failed to delete some collections');
          }
        }
      });

      render(
        <CollectionGrid 
          {...defaultProps} 
          selectionMode={true}
          selectedCollections={['collection-1']}
          onCollectionSelect={jest.fn()}
          onBulkAction={mockOnBulkAction}
        />
      );

      const deleteButton = screen.getByText('Delete Selected');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnBulkAction).toHaveBeenCalledWith('delete', ['collection-1']);
      });
    });
  });

  describe('Responsive Design Integration', () => {
    test('should adapt layout for mobile viewport', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<CollectionGrid {...defaultProps} />);

      const grid = screen.getByRole('region', { name: /collections grid/i });
      expect(grid).toHaveClass('collections-grid-mobile');
    });

    test('should show compact cards on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(<CollectionGrid {...defaultProps} />);

      const cards = screen.getAllByRole('article');
      cards.forEach(card => {
        expect(card).toHaveClass('collection-card-compact');
      });
    });
  });

  describe('Integration with Collections Service', () => {
    test('should handle service loading states', async () => {
      render(
        <CollectionGrid 
          {...defaultProps} 
          loading={true}
          collections={[]}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading collections...')).toBeInTheDocument();
    });

    test('should handle service error states', () => {
      render(
        <CollectionGrid 
          {...defaultProps} 
          error="Failed to load collections"
          collections={[]}
        />
      );

      expect(screen.getByText('Failed to load collections')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    test('should handle retry functionality', () => {
      const mockOnRetry = jest.fn();
      render(
        <CollectionGrid 
          {...defaultProps} 
          error="Failed to load collections"
          collections={[]}
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalled();
    });
  });
});