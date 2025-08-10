import React from 'react';
import './Pages.css';

export const Dashboard: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's your brewing overview.</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">☕</div>
          <div className="stat-content">
            <h3 className="stat-number">24</h3>
            <p className="stat-label">Total Brews</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3 className="stat-number">8.2</h3>
            <p className="stat-label">Avg Quality</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3 className="stat-number">+12%</h3>
            <p className="stat-label">Improvement</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3 className="stat-number">3</h3>
            <p className="stat-label">Favorites</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h2 className="section-title">Recent Brews</h2>
          <div className="recent-brews">
            <div className="brew-item">
              <div className="brew-info">
                <h4 className="brew-name">Ethiopian Yirgacheffe</h4>
                <p className="brew-method">Pour Over • V60</p>
                <p className="brew-date">2 hours ago</p>
              </div>
              <div className="brew-score">8.5</div>
            </div>
            
            <div className="brew-item">
              <div className="brew-info">
                <h4 className="brew-name">Colombian Huila</h4>
                <p className="brew-method">French Press</p>
                <p className="brew-date">Yesterday</p>
              </div>
              <div className="brew-score">7.8</div>
            </div>
            
            <div className="brew-item">
              <div className="brew-info">
                <h4 className="brew-name">Guatemala Antigua</h4>
                <p className="brew-method">Aeropress</p>
                <p className="brew-date">2 days ago</p>
              </div>
              <div className="brew-score">8.9</div>
            </div>
          </div>
          
          <button className="section-button">View All Brews</button>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-button action-primary">
              <span className="action-icon">➕</span>
              New Brew Entry
            </button>
            
            <button className="action-button">
              <span className="action-icon">📊</span>
              View Analytics
            </button>
            
            <button className="action-button">
              <span className="action-icon">📚</span>
              Browse Collections
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};