import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

export const Header: React.FC = () => {
  const { user, logout, loading } = useAuth();

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <h1 className="brand-title">
            <span className="brand-icon">☕</span>
            CupTrack
          </h1>
          <span className="brand-subtitle">Perfect Your Brew</span>
        </div>

        <nav className="header-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link to="/brews" className="nav-link">My Brews</Link>
            </li>
            <li className="nav-item">
              <Link to="/analytics" className="nav-link">Analytics</Link>
            </li>
            <li className="nav-item">
              <Link to="/collections" className="nav-link">Collections</Link>
            </li>
          </ul>
        </nav>

        <div className="header-user">
          {user && (
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <div className="user-menu">
                <button
                  onClick={logout}
                  disabled={loading}
                  className="user-menu-item logout-button"
                >
                  {loading ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};