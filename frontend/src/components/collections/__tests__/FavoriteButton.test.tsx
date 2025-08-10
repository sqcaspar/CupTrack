// TASK-008B: Collections & Organization - FavoriteButton Component Tests
// Rapid Iteration: Basic component rendering and interaction tests

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FavoriteButton } from '../FavoriteButton';

// Mock the CollectionsService
jest.mock('../../services/collectionsService', () => ({
  CollectionsService: {
    toggleFavorite: jest.fn()
  }
}));

const { CollectionsService } = require('../../services/collectionsService');

describe('FavoriteButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with unfavorited state', () => {
    render(
      <FavoriteButton
        brewId="test-brew-1"
        isFavorite={false}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Add to favorites');
  });

  test('renders with favorited state', () => {
    render(
      <FavoriteButton
        brewId="test-brew-1"
        isFavorite={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Remove from favorites');
    expect(button).toHaveClass('favorite-active');
  });

  test('toggles favorite state on click', async () => {
    const mockOnToggle = jest.fn();
    CollectionsService.toggleFavorite.mockResolvedValue(true);

    render(
      <FavoriteButton
        brewId="test-brew-1"
        isFavorite={false}
        onToggle={mockOnToggle}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(CollectionsService.toggleFavorite).toHaveBeenCalledWith({
        brewId: 'test-brew-1',
        isFavorite: true
      });
    });

    expect(mockOnToggle).toHaveBeenCalledWith('test-brew-1', true);
  });

  test('shows loading state during toggle', async () => {
    CollectionsService.toggleFavorite.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(true), 100))
    );

    render(
      <FavoriteButton
        brewId="test-brew-1"
        isFavorite={false}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Check if loading spinner appears
    expect(screen.getByTitle('Add to favorites')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(CollectionsService.toggleFavorite).toHaveBeenCalled();
    });
  });

  test('renders with different sizes', () => {
    const { rerender } = render(
      <FavoriteButton
        brewId="test-brew-1"
        isFavorite={false}
        size="small"
      />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass('favorite-button-small');

    rerender(
      <FavoriteButton
        brewId="test-brew-1"
        isFavorite={false}
        size="large"
      />
    );

    button = screen.getByRole('button');
    expect(button).toHaveClass('favorite-button-large');
  });

  test('shows label when requested', () => {
    render(
      <FavoriteButton
        brewId="test-brew-1"
        isFavorite={false}
        showLabel={true}
      />
    );

    expect(screen.getByText('Favorite')).toBeInTheDocument();
  });

  test('shows favorited label when active', () => {
    render(
      <FavoriteButton
        brewId="test-brew-1"
        isFavorite={true}
        showLabel={true}
      />
    );

    expect(screen.getByText('Favorited')).toBeInTheDocument();
  });

  test('is disabled when disabled prop is true', () => {
    render(
      <FavoriteButton
        brewId="test-brew-1"
        isFavorite={false}
        disabled={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('favorite-disabled');
  });

  test('prevents event propagation on click', () => {
    const mockParentClick = jest.fn();
    const mockOnToggle = jest.fn();
    CollectionsService.toggleFavorite.mockResolvedValue(true);

    const { container } = render(
      <div onClick={mockParentClick}>
        <FavoriteButton
          brewId="test-brew-1"
          isFavorite={false}
          onToggle={mockOnToggle}
        />
      </div>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Parent click should not be triggered
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  test('handles API error gracefully', async () => {
    const mockOnToggle = jest.fn();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    CollectionsService.toggleFavorite.mockRejectedValue(new Error('API Error'));

    render(
      <FavoriteButton
        brewId="test-brew-1"
        isFavorite={false}
        onToggle={mockOnToggle}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(CollectionsService.toggleFavorite).toHaveBeenCalled();
    });

    // Should log error
    expect(consoleError).toHaveBeenCalledWith('Error toggling favorite:', expect.any(Error));

    // Should not call onToggle on error
    expect(mockOnToggle).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});