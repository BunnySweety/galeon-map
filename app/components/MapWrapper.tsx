'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import du composant Map avec Mapbox
const MapComponent = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  className?: string;
}

export default function MapWrapper({ className = '' }: MapWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing map...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className={`flex items-center justify-center h-full bg-gray-100 ${className}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map components...</p>
          </div>
        </div>
      }
    >
      <MapComponent className={className} />
    </Suspense>
  );
} 