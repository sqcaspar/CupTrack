// TASK-008B: Collections & Organization - TypeScript Interfaces
// Rapid Iteration: Build-first approach for organization system types

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string; // Hex color code for visual organization
  createdAt: string;
  updatedAt: string;
  brewIds: string[]; // Array of brew IDs in this collection
  isDefault?: boolean; // For system collections like "All Brews", "Favorites"
}

export interface CollectionWithBrews extends Collection {
  brews: import('./brew').BrewRecord[];
  brewCount: number;
  lastBrewDate?: string;
  averageQuality?: number;
}

export interface CollectionSummary {
  id: string;
  name: string;
  description?: string;
  color?: string;
  brewCount: number;
  lastBrewDate?: string;
  previewBrews: import('./brew').BrewRecord[]; // First 3-4 brews for thumbnails
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  color?: string;
  brewIds?: string[];
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  color?: string;
  brewIds?: string[];
}

export interface CollectionFilters {
  searchQuery?: string;
  sortBy?: 'name' | 'createdAt' | 'brewCount' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
  showEmpty?: boolean; // Whether to show collections with no brews
}

export interface FavoriteOperation {
  brewId: string;
  isFavorite: boolean;
}

export interface BulkCollectionOperation {
  brewIds: string[];
  action: 'add' | 'remove';
  collectionId: string;
}

export interface CollectionStats {
  totalCollections: number;
  totalFavorites: number;
  averageBrewsPerCollection: number;
  mostUsedCollection: {
    id: string;
    name: string;
    brewCount: number;
  };
  recentActivity: {
    collectionsCreated: number;
    brewsAddedToCollections: number;
    favoritesChanged: number;
  };
}

// UI State Management Types
export interface CollectionsViewState {
  viewMode: 'grid' | 'list';
  selectedCollections: string[];
  isSelectionMode: boolean;
  searchQuery: string;
  sortBy: CollectionFilters['sortBy'];
  sortOrder: CollectionFilters['sortOrder'];
}

export interface CollectionModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'delete';
  collection?: Collection;
  initialBrewIds?: string[];
}

// Collection Assignment Types
export interface BrewCollectionAssignment {
  brewId: string;
  collectionIds: string[];
  addedToCollections: string[];
  removedFromCollections: string[];
}

export interface CollectionAssignmentModalState {
  isOpen: boolean;
  brewIds: string[];
  currentAssignments: Record<string, string[]>; // brewId -> collectionIds
}

// Drag and Drop Types
export interface DragData {
  type: 'brew' | 'collection';
  brewId?: string;
  brewIds?: string[];
  collectionId?: string;
}

export interface DropResult {
  success: boolean;
  targetCollectionId?: string;
  brewIds: string[];
  action: 'assign' | 'remove' | 'move';
}

// Collection Color Presets
export const COLLECTION_COLORS = [
  { name: 'Coffee Brown', value: '#8B4513' },
  { name: 'Espresso', value: '#3C2414' },
  { name: 'Latte', value: '#D2B48C' },
  { name: 'Green Bean', value: '#6B8E23' },
  { name: 'Blue Steel', value: '#4682B4' },
  { name: 'Purple Berry', value: '#9370DB' },
  { name: 'Orange Zest', value: '#FF8C00' },
  { name: 'Cherry Red', value: '#DC143C' },
  { name: 'Forest Green', value: '#228B22' },
  { name: 'Royal Purple', value: '#663399' },
  { name: 'Sunset Orange', value: '#FF6347' },
  { name: 'Ocean Blue', value: '#20B2AA' }
] as const;

// Default system collections
export const SYSTEM_COLLECTIONS = {
  FAVORITES: {
    id: 'favorites',
    name: 'Favorites',
    description: 'Your favorite brews',
    color: '#DC143C',
    isDefault: true
  },
  RECENT: {
    id: 'recent',
    name: 'Recent Brews',
    description: 'Last 30 days',
    color: '#4682B4',
    isDefault: true
  },
  HIGH_RATED: {
    id: 'high-rated',
    name: 'High Rated',
    description: 'Quality score 8.0+',
    color: '#FFD700',
    isDefault: true
  }
} as const;

// Validation schemas for forms
export interface CollectionFormData {
  name: string;
  description: string;
  color: string;
  selectedBrews: string[];
}

export interface CollectionValidationErrors {
  name?: string;
  description?: string;
  color?: string;
  selectedBrews?: string;
  general?: string;
}