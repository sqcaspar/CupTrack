import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthPage } from './auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <>{children}</>;
};