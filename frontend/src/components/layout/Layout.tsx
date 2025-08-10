import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      <Header />
      
      <div className="layout-content">
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        <main className="main-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};