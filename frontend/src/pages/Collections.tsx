// TASK-008B: Collections & Organization - Enhanced Collections Page
// Rapid Iteration: Using new collection components with full functionality

import React, { useState, useEffect } from 'react';
import { CollectionGrid, CollectionModal } from '../components/collections';
import { CollectionsService } from '../services/collectionsService';
import { 
  CollectionSummary, 
  Collection, 
  CollectionFilters,
  CollectionsViewState,
  CollectionModalState 
} from '../types/collections';
import './Pages.css';

export const Collections: React.FC = () => {
  // State management
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [systemCollections, setSystemCollections] = useState<CollectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [viewState, setViewState] = useState<CollectionsViewState>({
    viewMode: 'grid',
    selectedCollections: [],
    isSelectionMode: false,
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Modal state
  const [modalState, setModalState] = useState<CollectionModalState>({
    isOpen: false,
    mode: 'create'
  });

  // Load collections on component mount
  useEffect(() => {
    loadCollections();
    loadSystemCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const filters: CollectionFilters = {
        searchQuery: viewState.searchQuery || undefined,
        sortBy: viewState.sortBy,
        sortOrder: viewState.sortOrder,
        showEmpty: true
      };

      const [userCollections] = await Promise.all([
        CollectionsService.getCollections(filters)
      ]);

      setCollections(userCollections);
      setError(null);
    } catch (err) {
      console.error('Error loading collections:', err);
      setError('Failed to load collections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemCollections = async () => {
    try {
      const systemColls = await CollectionsService.getSystemCollections();
      setSystemCollections(systemColls);
    } catch (err) {
      console.error('Error loading system collections:', err);
    }
  };

  // Event handlers
  const handleCreateCollection = () => {
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  };

  const handleEditCollection = async (collectionId: string) => {
    if (collectionId === 'new') {
      handleCreateCollection();
      return;
    }

    try {
      const collection = await CollectionsService.getCollection(collectionId);
      if (collection) {
        setModalState({
          isOpen: true,
          mode: 'edit',
          collection
        });
      }
    } catch (err) {
      console.error('Error loading collection for edit:', err);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await CollectionsService.deleteCollection(collectionId);
        setCollections(prev => prev.filter(c => c.id !== collectionId));
      } catch (err) {
        console.error('Error deleting collection:', err);
        setError('Failed to delete collection. Please try again.');
      }
    }
  };

  const handleCollectionSubmit = (collection: Collection) => {
    // Reload collections to get updated data
    loadCollections();
    
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCollectionClick = (collectionId: string) => {
    // Navigate to collection detail view
    console.log('Navigate to collection:', collectionId);
    // In a real app, this would use React Router
  };

  const handleCollectionSelect = (collectionId: string) => {
    setViewState(prev => ({
      ...prev,
      selectedCollections: prev.selectedCollections.includes(collectionId)
        ? prev.selectedCollections.filter(id => id !== collectionId)
        : [...prev.selectedCollections, collectionId]
    }));
  };

  const handleBulkAction = async (action: 'delete' | 'export', collectionIds: string[]) => {
    if (action === 'delete') {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${collectionIds.length} collection(s)? This action cannot be undone.`
      );

      if (confirmed) {
        try {
          await Promise.all(
            collectionIds.map(id => CollectionsService.deleteCollection(id))
          );
          
          setCollections(prev => prev.filter(c => !collectionIds.includes(c.id)));
          setViewState(prev => ({ ...prev, selectedCollections: [] }));
        } catch (err) {
          console.error('Error deleting collections:', err);
          setError('Failed to delete some collections. Please try again.');
        }
      }
    } else if (action === 'export') {
      // Handle bulk export
      console.log('Export collections:', collectionIds);
    }
  };

  const handleViewModeToggle = () => {
    setViewState(prev => ({
      ...prev,
      viewMode: prev.viewMode === 'grid' ? 'list' : 'grid'
    }));
  };

  const handleSelectionModeToggle = () => {
    setViewState(prev => ({
      ...prev,
      isSelectionMode: !prev.isSelectionMode,
      selectedCollections: []
    }));
  };

  const handleSearchChange = (query: string) => {
    setViewState(prev => ({ ...prev, searchQuery: query }));
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      loadCollections();
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Collections</h1>
          <p className="page-subtitle">
            Organize your brews into meaningful groups and track your favorites
          </p>
        </div>
        
        <div className="page-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleSelectionModeToggle}
          >
            {viewState.isSelectionMode ? 'Exit Selection' : 'Select Multiple'}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={handleViewModeToggle}
            title={`Switch to ${viewState.viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewState.viewMode === 'grid' ? '☰' : '▦'}
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={handleCreateCollection}
          >
            <span className="button-icon">➕</span>
            New Collection
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button 
            className="error-retry"
            onClick={loadCollections}
          >
            Retry
          </button>
        </div>
      )}

      {/* System Collections */}
      {systemCollections.length > 0 && (
        <div className="collections-section">
          <h2 className="section-title">Quick Access</h2>
          <CollectionGrid
            collections={systemCollections}
            loading={false}
            viewMode="grid"
            onCollectionClick={handleCollectionClick}
            showActions={false}
            emptyMessage="No system collections available"
          />
        </div>
      )}

      {/* User Collections */}
      <div className="collections-section">
        <div className="section-header">
          <h2 className="section-title">My Collections</h2>
          {collections.length > 0 && (
            <div className="collections-search">
              <input
                type="text"
                className="search-input"
                placeholder="Search collections..."
                value={viewState.searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
              />
            </div>
          )}
        </div>

        <CollectionGrid
          collections={collections}
          loading={loading}
          viewMode={viewState.viewMode}
          selectionMode={viewState.isSelectionMode}
          selectedCollections={viewState.selectedCollections}
          onCollectionSelect={handleCollectionSelect}
          onCollectionClick={handleCollectionClick}
          onCollectionEdit={handleEditCollection}
          onCollectionDelete={handleDeleteCollection}
          onBulkAction={handleBulkAction}
          showActions={true}
          emptyMessage="No collections yet"
          emptyDescription="Create your first collection to organize your brews by origin, method, or any theme you like"
        />
      </div>

      {/* Collection Modal */}
      <CollectionModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        collection={modalState.collection}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleCollectionSubmit}
        availableBrews={[]} // TODO: Load available brews
      />
    </div>
  );
};