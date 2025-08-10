import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrewWizard } from '../components/brews/BrewWizard';
import { CreateBrewRequest } from '../types/brew';

export const BrewWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're duplicating an existing brew
  const duplicateData = location.state?.duplicateFrom as CreateBrewRequest | undefined;

  const handleComplete = (brewId: string) => {
    // Navigate to the new brew's detail page (or back to brews list)
    navigate('/brews', { 
      state: { 
        message: 'Brew created successfully!',
        newBrewId: brewId 
      }
    });
  };

  const handleCancel = () => {
    // Navigate back to brews list
    navigate('/brews');
  };

  return (
    <div className="brew-wizard-page">
      <BrewWizard
        onComplete={handleComplete}
        onCancel={handleCancel}
        initialData={duplicateData}
      />
    </div>
  );
};