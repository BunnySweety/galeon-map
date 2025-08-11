'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    mapboxgl: any;
  }
}

interface MapboxCDNProps {
  children: (mapboxgl: any) => React.ReactNode;
  fallback?: React.ReactNode;
}

export default function MapboxCDN({ children, fallback }: MapboxCDNProps) {
  const [mapboxgl, setMapboxgl] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Mapbox is already loaded
    if (window.mapboxgl) {
      setMapboxgl(window.mapboxgl);
      setIsLoading(false);
      return;
    }

    // Load Mapbox CSS
    const loadCSS = () => {
      return new Promise<void>((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.css';
        link.onload = () => resolve();
        link.onerror = () => reject(new Error('Failed to load Mapbox CSS'));
        document.head.appendChild(link);
      });
    };

    // Load Mapbox JS
    const loadJS = () => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.js';
        script.onload = () => {
          if (window.mapboxgl) {
            resolve();
          } else {
            reject(new Error('Mapbox GL not available after loading'));
          }
        };
        script.onerror = () => reject(new Error('Failed to load Mapbox JS'));
        document.head.appendChild(script);
      });
    };

    // Load both CSS and JS
    const loadMapbox = async () => {
      try {
        await Promise.all([loadCSS(), loadJS()]);
        
        // Configure Mapbox token
        if (window.mapboxgl) {
          window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiamVhbmJvbjkxIiwiYSI6ImNtNDlhMHMzNTA3YnkycXM2dmYxc281MHkifQ.taYYM3jxELZ5CZuOH9_3SQ';
        }
        
        setMapboxgl(window.mapboxgl);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Mapbox:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    loadMapbox();
  }, []);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Mapbox...</p>
          </div>
        </div>
      )
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-700">Failed to load map</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!mapboxgl) {
    return (
      <div className="flex items-center justify-center h-full bg-yellow-50">
        <div className="text-center">
          <div className="text-yellow-500 mb-2">⚠️</div>
          <p className="text-yellow-700">Map not available</p>
        </div>
      </div>
    );
  }

  return <>{children(mapboxgl)}</>;
} 