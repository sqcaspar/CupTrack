// TASK-008B: Collections & Organization - Collection Modal Component
// Rapid Iteration: Create/edit collection modal with color picker

import React, { useState, useEffect } from 'react';
import { 
  Collection, 
  CreateCollectionRequest, 
  UpdateCollectionRequest,
  CollectionFormData,
  CollectionValidationErrors,
  COLLECTION_COLORS 
} from '../../types/collections';
import { CollectionsService } from '../../services/collectionsService';
import './CollectionModal.css';

interface CollectionModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'delete';
  collection?: Collection;
  onClose: () => void;
  onSubmit: (collection: Collection) => void;
  availableBrews?: { id: string; name: string; brand: string }[];
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  mode,
  collection,
  onClose,
  onSubmit,
  availableBrews = []
}) => {
  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    description: '',
    color: COLLECTION_COLORS[0].value,
    selectedBrews: []
  });
  
  const [errors, setErrors] = useState<CollectionValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens or collection changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && collection) {
        setFormData({
          name: collection.name,
          description: collection.description || '',
          color: collection.color || COLLECTION_COLORS[0].value,
          selectedBrews: collection.brewIds
        });
      } else {
        setFormData({
          name: '',
          description: '',
          color: COLLECTION_COLORS[0].value,
          selectedBrews: []
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, collection]);

  const validateForm = (): boolean => {
    const newErrors: CollectionValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Collection name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Collection name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Collection name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const request: CreateCollectionRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          brewIds: formData.selectedBrews
        };

        const newCollection = await CollectionsService.createCollection(request);
        onSubmit(newCollection);
      } else if (mode === 'edit' && collection) {
        const request: UpdateCollectionRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          brewIds: formData.selectedBrews
        };

        const updatedCollection = await CollectionsService.updateCollection(collection.id, request);
        if (updatedCollection) {
          onSubmit(updatedCollection);
        }
      }

      handleClose();
    } catch (error) {
      console.error('Error saving collection:', error);
      setErrors({
        general: 'Failed to save collection. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      color: COLLECTION_COLORS[0].value,
      selectedBrews: []
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof CollectionFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBrewToggle = (brewId: string) => {
    const newSelection = formData.selectedBrews.includes(brewId)
      ? formData.selectedBrews.filter(id => id !== brewId)
      : [...formData.selectedBrews, brewId];
    
    handleInputChange('selectedBrews', newSelection);
  };

  if (!isOpen) return null;

  return (
    <div className="collection-modal-overlay" onClick={handleClose}>
      <div className="collection-modal" onClick={e => e.stopPropagation()}>
        <div className="collection-modal-header">
          <h2 className="collection-modal-title">
            {mode === 'create' ? 'Create New Collection' : 'Edit Collection'}
          </h2>
          <button 
            className="collection-modal-close"
            onClick={handleClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="collection-modal-form">
          {errors.general && (
            <div className="form-error-general">
              {errors.general}
            </div>
          )}

          {/* Collection Name */}
          <div className="form-group">
            <label htmlFor="collection-name" className="form-label">
              Collection Name *
            </label>
            <input
              id="collection-name"
              type="text"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="Enter collection name..."
              maxLength={50}
              disabled={isSubmitting}
              autoFocus
            />
            {errors.name && (
              <div className="form-error">{errors.name}</div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="collection-description" className="form-label">
              Description
            </label>
            <textarea
              id="collection-description"
              className={`form-textarea ${errors.description ? 'form-input-error' : ''}`}
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="Optional description..."
              rows={3}
              maxLength={200}
              disabled={isSubmitting}
            />
            {errors.description && (
              <div className="form-error">{errors.description}</div>
            )}
            <div className="form-helper">
              {formData.description.length}/200 characters
            </div>
          </div>

          {/* Color Picker */}
          <div className="form-group">
            <label className="form-label">Collection Color</label>
            <div className="color-picker-grid">
              {COLLECTION_COLORS.map(colorOption => (
                <button
                  key={colorOption.value}
                  type="button"
                  className={`color-picker-item ${
                    formData.color === colorOption.value ? 'selected' : ''
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  onClick={() => handleInputChange('color', colorOption.value)}
                  title={colorOption.name}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>

          {/* Brew Selection */}
          {availableBrews.length > 0 && (
            <div className="form-group">
              <label className="form-label">
                Add Brews to Collection ({formData.selectedBrews.length} selected)
              </label>
              <div className="brew-selection-list">
                {availableBrews.map(brew => (
                  <label key={brew.id} className="brew-selection-item">
                    <input
                      type="checkbox"
                      checked={formData.selectedBrews.includes(brew.id)}
                      onChange={() => handleBrewToggle(brew.id)}
                      disabled={isSubmitting}
                    />
                    <div className="brew-selection-info">
                      <span className="brew-selection-brand">{brew.brand}</span>
                      <span className="brew-selection-name">{brew.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="collection-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                mode === 'create' ? 'Create Collection' : 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};