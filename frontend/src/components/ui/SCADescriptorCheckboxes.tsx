import React from 'react';

interface SCADescriptorCheckboxesProps {
  title: string;
  descriptors: string[];
  selectedDescriptors: string[];
  onSelectionChange: (selected: string[]) => void;
  maxSelections?: number;
  hierarchicalGroups?: { [key: string]: string[] };
  className?: string;
  layout?: 'grid' | 'inline';
}

export const SCADescriptorCheckboxes: React.FC<SCADescriptorCheckboxesProps> = ({
  title,
  descriptors,
  selectedDescriptors,
  onSelectionChange,
  maxSelections,
  hierarchicalGroups,
  className = '',
  layout = 'grid'
}) => {
  const handleCheckboxChange = (descriptor: string, checked: boolean) => {
    let newSelection: string[];
    
    if (checked) {
      // Add descriptor if under limit
      if (!maxSelections || selectedDescriptors.length < maxSelections) {
        newSelection = [...selectedDescriptors, descriptor];
      } else {
        // At limit, replace last selection with new one
        newSelection = [...selectedDescriptors.slice(0, -1), descriptor];
      }
    } else {
      // Remove descriptor
      newSelection = selectedDescriptors.filter(d => d !== descriptor);
    }
    
    onSelectionChange(newSelection);
  };

  const isSelected = (descriptor: string) => selectedDescriptors.includes(descriptor);
  
  const isAtLimit = maxSelections ? selectedDescriptors.length >= maxSelections : false;

  const renderCheckbox = (descriptor: string, isSubItem: boolean = false) => {
    const selected = isSelected(descriptor);
    const disabled = !selected && isAtLimit;
    
    return (
      <label 
        key={descriptor}
        className={`sca-checkbox-item ${isSubItem ? 'sub-item' : ''} ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      >
        <input
          type="checkbox"
          checked={selected}
          disabled={disabled}
          onChange={(e) => handleCheckboxChange(descriptor, e.target.checked)}
          className="sca-checkbox-input"
        />
        <span className="sca-checkbox-checkmark"></span>
        <span className="sca-checkbox-label">{descriptor}</span>
      </label>
    );
  };

  const renderHierarchicalGroups = () => {
    if (!hierarchicalGroups) {
      return descriptors.map(descriptor => renderCheckbox(descriptor));
    }

    return Object.entries(hierarchicalGroups).map(([groupName, groupDescriptors]) => (
      <div key={groupName} className="sca-checkbox-group">
        {groupDescriptors.map((descriptor, index) => 
          renderCheckbox(descriptor, index > 0)
        )}
      </div>
    ));
  };

  return (
    <div className={`sca-descriptor-checkboxes ${layout} ${className}`}>
      <div className="sca-checkboxes-header">
        <h5 className="sca-checkboxes-title">{title}</h5>
        {maxSelections && (
          <div className="sca-selection-counter">
            <span className={selectedDescriptors.length === maxSelections ? 'at-limit' : ''}>
              {selectedDescriptors.length}/{maxSelections}
            </span>
          </div>
        )}
      </div>
      
      <div className={`sca-checkboxes-container ${layout}`}>
        {hierarchicalGroups ? renderHierarchicalGroups() : descriptors.map(descriptor => renderCheckbox(descriptor))}
      </div>
      
      {maxSelections && (
        <div className="sca-selection-help">
          {selectedDescriptors.length === 0 && (
            <span className="help-text">Select up to {maxSelections} options that best represent the coffee</span>
          )}
          {selectedDescriptors.length === maxSelections && (
            <span className="help-text limit-reached">Maximum selections reached. Uncheck to select different options.</span>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized components for different SCA sections
export const SCAOrthonasalCheckboxes: React.FC<{
  selectedDescriptors: string[];
  onSelectionChange: (selected: string[]) => void;
}> = ({ selectedDescriptors, onSelectionChange }) => {
  const orthonasalGroups = {
    floral: ['Floral'],
    fruity: ['Fruity', 'Berry', 'Dried Fruit', 'Citrus Fruit'],
    sourFermented: ['Sour/Fermented', 'Sour', 'Fermented'],
    greenVegetative: ['Green/Vegetative'],
    other: ['Other', 'Chemical', 'Musty/Earthy', 'Woody'],
    roasted: ['Roasted', 'Cereal', 'Burnt', 'Tobacco'],
    nuttyCocoa: ['Nutty/Cocoa', 'Nutty', 'Cocoa'],
    spice: ['Spice'],
    sweet: ['Sweet', 'Vanilla/Vanillin', 'Brown Sugar']
  };

  return (
    <SCADescriptorCheckboxes
      title="Orthonasal Characteristics (Fragrance & Aroma)"
      descriptors={[]}
      selectedDescriptors={selectedDescriptors}
      onSelectionChange={onSelectionChange}
      maxSelections={5}
      hierarchicalGroups={orthonasalGroups}
      layout="grid"
      className="orthonasal-checkboxes"
    />
  );
};

export const SCAMainTastesCheckboxes: React.FC<{
  selectedDescriptors: string[];
  onSelectionChange: (selected: string[]) => void;
}> = ({ selectedDescriptors, onSelectionChange }) => {
  return (
    <SCADescriptorCheckboxes
      title="Main Tastes"
      descriptors={['Salty', 'Sour', 'Sweet', 'Bitter', 'Umami']}
      selectedDescriptors={selectedDescriptors}
      onSelectionChange={onSelectionChange}
      maxSelections={2}
      layout="inline"
      className="main-tastes-checkboxes"
    />
  );
};

export const SCAMouthfeelCheckboxes: React.FC<{
  selectedDescriptors: string[];
  onSelectionChange: (selected: string[]) => void;
}> = ({ selectedDescriptors, onSelectionChange }) => {
  return (
    <SCADescriptorCheckboxes
      title="Mouthfeel Characteristics"
      descriptors={[
        'Rough (Gritty, Chalky, Sandy)',
        'Smooth (Velvety, Silky, Syrupy)', 
        'Oily',
        'Mouth-Drying',
        'Metallic'
      ]}
      selectedDescriptors={selectedDescriptors}
      onSelectionChange={onSelectionChange}
      maxSelections={2}
      layout="grid"
      className="mouthfeel-checkboxes"
    />
  );
};