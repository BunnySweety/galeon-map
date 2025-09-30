import { useState, useEffect } from 'react';
import logger from '../utils/logger';
import type { MapboxGLInstance } from '../types/mapbox';

export function useMapbox() {
  const [mapboxgl, setMapboxgl] = useState<MapboxGLInstance | null>(null);
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

        // Setup MapBox token - MUST be configured in environment variables
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          const errorMsg = 'Mapbox token is required. Set NEXT_PUBLIC_MAPBOX_TOKEN in environment variables.';
          logger.error(errorMsg);
          if (isMounted) {
            setError(errorMsg);
            setIsLoading(false);
          }
          return;
        }
        mapboxgl.accessToken = token;

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