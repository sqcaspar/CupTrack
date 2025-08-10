import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Layout.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/brews', label: 'My Brews', icon: '☕' },
    { path: '/brews/new', label: 'New Brew', icon: '➕' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/collections', label: 'Collections', icon: '📚' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActivePath = (path: string): boolean => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="sidebar-nav-item">
                <Link
                  to={item.path}
                  className={`sidebar-nav-link ${
                    isActivePath(item.path) ? 'sidebar-nav-link-active' : ''
                  }`}
                  onClick={onClose}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <p className="sidebar-version">CupTrack v1.0</p>
            <p className="sidebar-help">
              <Link to="/help" className="sidebar-help-link">
                Help & Support
              </Link>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};