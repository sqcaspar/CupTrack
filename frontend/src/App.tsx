import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout';
import { Dashboard, Brews, Analytics, Collections, Profile, BrewWizardPage } from './pages';
import { AuthPage } from './components/auth';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      {!isAuthenticated && (
        <>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* Protected Routes */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/brews" element={
            <ProtectedRoute>
              <Layout>
                <Brews />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/brews/new" element={
            <ProtectedRoute>
              <Layout>
                <BrewWizardPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/collections" element={
            <ProtectedRoute>
              <Layout>
                <Collections />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h2>Settings</h2>
                  <p>Application settings coming soon!</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/help" element={
            <ProtectedRoute>
              <Layout>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h2>Help & Support</h2>
                  <p>Help documentation coming soon!</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ServiceProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ServiceProvider>
  );
}

export default App;