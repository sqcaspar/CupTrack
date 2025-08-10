import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrewsList } from '../components/brews';
import './Pages.css';

export const Brews: React.FC = () => {
  const navigate = useNavigate();

  const handleViewBrew = (brewId: string) => {
    navigate(`/brews/${brewId}`);
  };

  const handleEditBrew = (brewId: string) => {
    navigate(`/brews/${brewId}/edit`);
  };

  const handleNewBrew = () => {
    navigate('/brew-journey');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Brews</h1>
        <p className="page-subtitle">Track and analyze your coffee brewing journey</p>
        
        <button className="primary-button" onClick={handleNewBrew}>
          <span className="button-icon">➕</span>
          New Brew Entry
        </button>
      </div>

      <BrewsList
        onViewBrew={handleViewBrew}
        onEditBrew={handleEditBrew}
        onNewBrew={handleNewBrew}
        showFilters={true}
      />
    </div>
  );
};