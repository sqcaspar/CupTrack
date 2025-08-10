import React, { createContext, useContext, ReactNode } from 'react';
import { createApiClient, getApiClient } from '../services/apiClient';
import { createBrewService, getBrewService } from '../services/brewService';
import { ApiConfig } from '../types/api';

interface ServiceContextType {
  // Services are available globally after initialization
  initialized: boolean;
}

export const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  // Initialize services
  React.useEffect(() => {
    const apiConfig: ApiConfig = {
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
      timeout: 10000,
      retries: 3
    };

    // Create API client
    const apiClient = createApiClient(apiConfig);
    
    // Create brew service
    createBrewService(apiClient);

    console.log('Services initialized successfully');
  }, []);

  return (
    <ServiceContext.Provider value={{ initialized: true }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

// Helper hooks for specific services
export const useApiClient = () => {
  const { initialized } = useServices();
  if (!initialized) {
    throw new Error('Services not initialized');
  }
  return getApiClient();
};

export const useBrewService = () => {
  const { initialized } = useServices();
  if (!initialized) {
    throw new Error('Services not initialized');
  }
  return getBrewService();
};