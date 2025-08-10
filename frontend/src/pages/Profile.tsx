import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Pages.css';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account and brewing preferences</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">Coffee Enthusiast</h2>
              <p className="profile-email">{user?.email}</p>
              <span className="profile-badge">Member since Jan 2024</span>
            </div>
            <button 
              className="edit-profile-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    defaultValue="Coffee"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    defaultValue="Enthusiast"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  defaultValue={user?.email}
                  disabled
                />
                <p className="form-hint">Email cannot be changed</p>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="primary-button">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">24</span>
                <span className="stat-label">Total Brews</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">8.2</span>
                <span className="stat-label">Avg Quality</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">3</span>
                <span className="stat-label">Collections</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">18</span>
                <span className="stat-label">Days Active</span>
              </div>
            </div>
          )}
        </div>

        <div className="preferences-card">
          <h3 className="card-title">Brewing Preferences</h3>
          
          <div className="preference-group">
            <label className="preference-label">
              <span>Preferred Brewing Method</span>
              <select className="preference-select">
                <option value="pour-over">Pour Over</option>
                <option value="french-press">French Press</option>
                <option value="aeropress">Aeropress</option>
                <option value="espresso">Espresso</option>
              </select>
            </label>
          </div>

          <div className="preference-group">
            <label className="preference-label">
              <span>Favorite Coffee Origins</span>
              <div className="preference-tags">
                <span className="preference-tag active">Ethiopia</span>
                <span className="preference-tag">Colombia</span>
                <span className="preference-tag active">Guatemala</span>
                <span className="preference-tag">Kenya</span>
              </div>
            </label>
          </div>

          <div className="preference-group">
            <label className="preference-label">
              <span>Grinder Type</span>
              <select className="preference-select">
                <option value="burr">Burr Grinder</option>
                <option value="blade">Blade Grinder</option>
                <option value="manual">Manual Grinder</option>
              </select>
            </label>
          </div>

          <div className="preference-group">
            <label className="preference-label">
              <span>Notification Preferences</span>
              <div className="preference-checkboxes">
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Brewing reminders</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Weekly reports</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>New feature announcements</span>
                </label>
              </div>
            </label>
          </div>

          <button className="primary-button">Save Preferences</button>
        </div>

        <div className="achievements-card">
          <h3 className="card-title">Achievements</h3>
          
          <div className="achievements-grid">
            <div className="achievement-item earned">
              <div className="achievement-icon">☕</div>
              <div className="achievement-content">
                <h4 className="achievement-name">First Brew</h4>
                <p className="achievement-description">Logged your very first brew</p>
              </div>
            </div>
            
            <div className="achievement-item earned">
              <div className="achievement-icon">🔥</div>
              <div className="achievement-content">
                <h4 className="achievement-name">Week Streak</h4>
                <p className="achievement-description">Brewed coffee 7 days in a row</p>
              </div>
            </div>
            
            <div className="achievement-item">
              <div className="achievement-icon">🏆</div>
              <div className="achievement-content">
                <h4 className="achievement-name">Perfect 10</h4>
                <p className="achievement-description">Score a perfect 10 on a brew</p>
              </div>
            </div>
            
            <div className="achievement-item">
              <div className="achievement-icon">🌍</div>
              <div className="achievement-content">
                <h4 className="achievement-name">World Explorer</h4>
                <p className="achievement-description">Try beans from 10 different countries</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};