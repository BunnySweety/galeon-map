'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import logger from '../utils/logger';

// Dynamic import du composant MapCDN
const MapCDN = dynamic(() => import('./MapCDN'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading CDN Map...</p>
      </div>
    </div>
  ),
});

// Fallback vers l'ancien Map si CDN échoue
const MapFallback = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading fallback map...</p>
      </div>
    </div>
  ),
});

interface MapWrapperCDNProps {
  className?: string;
}

export default function MapWrapperCDN({ className = '' }: MapWrapperCDNProps) {
  const [isClient, setIsClient] = useState(false);
  const [useCDN, setUseCDN] = useState(false);
  const [cdnFailed, setCdnFailed] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if we should use CDN (can be controlled via env var)
    const shouldUseCDN = false;
    setUseCDN(shouldUseCDN);
  }, []);

  const handleCDNError = () => {
    logger.warn('Mapbox CDN failed, falling back to npm version');
    setCdnFailed(true);
  };

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

  // Use CDN version if enabled and not failed
  if (useCDN && !cdnFailed) {
    return (
      <Suspense
        fallback={
          <div className={`flex items-center justify-center h-full bg-gray-100 ${className}`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading CDN map...</p>
            </div>
          </div>
        }
      >
        <div onError={handleCDNError}>
          <MapCDN className={className} />
        </div>
      </Suspense>
    );
  }

  // Fallback to npm version
  return (
    <Suspense
      fallback={
        <div className={`flex items-center justify-center h-full bg-gray-100 ${className}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading fallback map...</p>
          </div>
        </div>
      }
    >
      <MapFallback className={className} />
    </Suspense>
  );
} 