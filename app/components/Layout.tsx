// File: app/components/Layout.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMapStore } from '../store/useMapStore';
import Sidebar from './Sidebar';
import TimelineControl from './TimelineControl';
import HospitalDetail from './HospitalDetail';

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
});

// Create a client with persistent caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const Layout: React.FC = () => {
  const { selectedHospital } = useMapStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Simulate initialization process
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Perform any necessary initialization
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization failed', error);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative h-screen bg-slate-900 overflow-hidden">
        {/* Map container */}
        <div className="absolute inset-0">
          <Map />
        </div>
        
        {/* Sidebar - explicitly positioned with z-index */}
        <div className="absolute top-0 left-0 z-10 p-4 h-full overflow-y-auto hide-scrollbar">
          <Sidebar />
        </div>
        
        {/* Timeline */}
        <TimelineControl />
        
        {/* Hospital Detail Panel - conditionally rendered */}
        {selectedHospital && (
          <HospitalDetail 
            hospital={selectedHospital} 
            className="absolute top-6 right-6 w-80 z-10" 
          />
        )}
      </div>

      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default Layout;