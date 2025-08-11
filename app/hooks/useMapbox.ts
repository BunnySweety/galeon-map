import { useState, useEffect } from 'react';
import logger from '../utils/logger';

export function useMapbox() {
  const [mapboxgl, setMapboxgl] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMapbox = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import of mapbox-gl
        const mapboxModule = await import('mapbox-gl');
        
        if (!isMounted) return;

        // Load CSS dynamically
        if (typeof document !== 'undefined') {
          const existingLink = document.querySelector('link[href*="mapbox-gl.css"]');
          if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.css';
            document.head.appendChild(link);
          }
        }

        const mapboxgl = mapboxModule.default;

        // Setup MapBox token
        if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
          logger.warn('Mapbox token is not configured. Using fallback token for development.');
        }
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? 'pk.eyJ1IjoiamVhbmJvbjkxIiwiYSI6ImNtNDlhMHMzNTA3YnkycXM2dmYxc281MHkifQ.taYYM3jxELZ5CZuOH9_3SQ';

        if (isMounted) {
          setMapboxgl(mapboxgl);
          setIsLoading(false);
        }
      } catch (err) {
        logger.error('Failed to load mapbox-gl:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load mapbox-gl');
          setIsLoading(false);
        }
      }
    };

    loadMapbox();

    return () => {
      isMounted = false;
    };
  }, []);

  return { mapboxgl, isLoading, error };
} 