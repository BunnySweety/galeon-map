// File: app/components/Layout.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMapStore } from '../store/useMapStore';
import Sidebar from './Sidebar';
import TimelineControl from './TimelineControl';

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
});

const Layout: React.FC = () => {
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
    <div className="relative h-screen bg-slate-900 overflow-hidden">
      {/* Map container */}
      <div className="absolute inset-0">
        <Map />
      </div>
      
      {/* Sidebar - explicitly positioned with z-index, aligned with timeline at top-8 */}
      <div className="absolute top-4 left-0 z-10 p-4 h-[calc(100%-2rem)] overflow-y-auto hide-scrollbar">
        <Sidebar />
      </div>
      
      {/* Timeline */}
      <TimelineControl />
    </div>
  );
};

export default Layout;