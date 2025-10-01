// File: app/components/Map.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLingui } from '@lingui/react';
import { toast } from 'react-hot-toast';
import screenfull from 'screenfull';
import { useMapStore } from '../store/useMapStore';
import { setupConsoleFilter } from '../utils/console-filter';
import logger from '../utils/logger';
import { useMapbox } from '../hooks/useMapbox';
import type { MapboxMap, MapboxGLInstance } from '../types/mapbox';
// Import our modular components
import MapControls from './map/MapControls';
import { useLocationMarker } from './map/LocationMarker';
import { useGeolocationHandler } from './map/GeolocationHandler';
import { useMapInitialization } from './map/MapInitialization';
import { useHospitalMarkersComplete } from './map/HospitalMarkers';

interface MapProps {
  className?: string;
}

const MapComponent: React.FC<MapProps> = ({ className = '' }) => {
  // Hooks and state
  const { i18n } = useLingui();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Mapbox hook
  const { mapboxgl, isLoading: isMapboxLoading, error: mapboxError } = useMapbox();

  // Safe translation function
  const _ = useCallback(
    (text: string) => {
      try {
        if (!i18n?._) {
          return text;
        }
        return i18n._(text);
      } catch (error) {
        logger.error(`Error translating text in Map component: ${text}`, error);
        return text;
      }
    },
    [i18n]
  );

  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRootContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);

  // Store state
  const {
    hospitals,
    filteredHospitals,
    currentDate,
    selectHospital,
    selectedFilters,
    timelineIndex,
    timelineLength,
  } = useMapStore();

  // Custom hooks for modular functionality
  const locationMarker = useLocationMarker({
    mapRef,
    mapboxgl,
    translate: _,
  });

  const geolocationHandler = useGeolocationHandler({
    mapRef,
    isLocating,
    setIsLocating,
    createLocationMarker: locationMarker.createLocationMarker,
    translate: _,
  });

  useMapInitialization({
    mapContainer,
    mapRef,
    mapboxgl,
    isTouchDevice,
    setMapLoaded,
  });

  const hospitalMarkers = useHospitalMarkersComplete({
    mapRef,
    mapboxgl,
    mapLoaded,
    hospitals,
    filteredHospitals,
    currentDate,
    selectedFilters,
    timelineIndex,
    timelineLength,
    selectHospital,
    i18n,
  });

  // Setup console filter for development
  useEffect(() => {
    setupConsoleFilter();
  }, []);

  // Detect touch device
  useEffect(() => {
    const detectTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    detectTouch();
    window.addEventListener('touchstart', () => setIsTouchDevice(true), { once: true });

    return () => {
      window.removeEventListener('touchstart', () => setIsTouchDevice(true));
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleChange = () => {
      if (screenfull.isEnabled) {
        setIsFullscreen(screenfull.isFullscreen);
      }
    };

    if (screenfull.isEnabled) {
      setIsFullscreen(screenfull.isFullscreen);
      screenfull.on('change', handleChange);

      return () => {
        screenfull.off('change', handleChange);
      };
    }

    return () => {};
  }, []);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      locationMarker.cleanup();
      geolocationHandler.cleanup();
      hospitalMarkers.cleanup();
    };
  }, [locationMarker, geolocationHandler, hospitalMarkers]);

  // Control handlers
  const handleLocationClick = useCallback(() => {
    // Handle removing existing marker first
    if (locationMarker.locationMarkerRef.current) {
      locationMarker.removeLocationMarker();
      toast.success(_('Location marker removed'), {
        duration: 2000,
        position: 'bottom-center',
      });
      return;
    }

    // Otherwise start geolocation
    geolocationHandler.handleLocationClick();
  }, [locationMarker, geolocationHandler, _]);

  const handleFullscreenToggle = useCallback(() => {
    if (screenfull.isEnabled && mapRootContainer.current) {
      screenfull.toggle(mapRootContainer.current);
    }
  }, []);

  // Tooltip functions
  const getLocationTooltip = useCallback(() => {
    return isLocating ? _('Click to cancel') : _('Geolocate');
  }, [isLocating, _]);

  const getFullscreenTooltip = useCallback(() => {
    return isFullscreen ? _('Exit fullscreen') : _('Enter fullscreen');
  }, [isFullscreen, _]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Show loading state while mapbox is loading
  if (isMapboxLoading) {
    return (
      <div className={`relative w-full h-screen bg-slate-900 flex flex-col ${className}`}>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Loading Map</h2>
            <p className="text-gray-300">Initializing Mapbox...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if mapbox failed to load
  if (mapboxError) {
    return (
      <div className={`relative w-full h-screen bg-slate-900 flex flex-col ${className}`}>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">Map Loading Failed</h2>
            <p className="text-gray-300">{mapboxError}</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRootContainer} className="relative w-full h-screen bg-slate-900 flex flex-col">
      {/* Map container */}
      <div className="relative flex-grow" role="region" aria-label={_('Interactive hospital map')}>
        <div
          ref={mapContainer}
          className={`w-full h-full ${className}`}
          style={{ position: 'relative', height: '100%' }}
          data-testid="map-container"
          role="application"
          aria-label={_('Mapbox interactive map')}
        />

        {/* Map Controls */}
        <MapControls
          isLocating={isLocating}
          isFullscreen={isFullscreen}
          isMobileView={isMobileView}
          onLocationClick={handleLocationClick}
          onFullscreenToggle={handleFullscreenToggle}
          getLocationTooltip={getLocationTooltip}
          getFullscreenTooltip={getFullscreenTooltip}
          mapRootContainer={mapRootContainer}
        />
      </div>
    </div>
  );
};

export default MapComponent;
