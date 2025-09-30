// File: app/components/map/MapInitialization.tsx
'use client';

import { useEffect, useRef } from 'react';
import {
  applyMapboxPassiveEventsFix,
  removeMapboxPassiveEventsFix,
} from '../../utils/mapbox-passive-fix';
import logger from '../../utils/logger';
import type { MapboxMap, MapboxGLInstance, MapboxLayer, MapboxStyle } from '../../types/mapbox';

// Global RTL configuration to avoid multiple calls
let rtlPluginLoaded = false;

interface MapInitializationProps {
  mapContainer: React.RefObject<HTMLDivElement | null>;
  mapRef: React.MutableRefObject<MapboxMap | null>;
  mapboxgl: MapboxGLInstance | null;
  isTouchDevice: boolean;
  setMapLoaded: (loaded: boolean) => void;
}

export const useMapInitialization = ({
  mapContainer,
  mapRef,
  mapboxgl,
  isTouchDevice,
  setMapLoaded,
}: MapInitializationProps) => {
  const mapInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || mapInitializedRef.current || !mapboxgl) {
      return () => {};
    }

    mapInitializedRef.current = true;

    // Clear container before initializing
    while (mapContainer.current.firstChild) {
      mapContainer.current.removeChild(mapContainer.current.firstChild);
    }

    try {
      // Configure RTL plugin
      if (!rtlPluginLoaded) {
        mapboxgl.setRTLTextPlugin(
          'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
          null,
          true
        );
        rtlPluginLoaded = true;
      }

      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [2.213749, 46.5], // Centre de la France
        zoom: 4.8,
        attributionControl: false,
        touchZoomRotate: true,
        dragRotate: true,
        touchPitch: true,
        interactive: true,
        preserveDrawingBuffer: true,
        antialias: true,
        minZoom: 4.0,
        maxZoom: 10,
        fadeDuration: 0,
        trackResize: true,
        refreshExpiredTiles: true,
        renderWorldCopies: false,
      });

      // Configure map on load
      newMap.once('load', () => {
        // Disable terrain and fog if available
        if (newMap.setTerrain && typeof newMap.setTerrain === 'function') {
          newMap.setTerrain(null);
        }

        if (newMap.setFog && typeof newMap.setFog === 'function') {
          newMap.setFog(null);
        }

        // Remove hillshade layers that can cause Canvas2D issues
        const style = newMap.getStyle() as MapboxStyle;
        if (style?.layers) {
          style.layers.forEach((layer: MapboxLayer) => {
            if (layer.id.includes('hillshade') || layer.type === 'hillshade') {
              try {
                newMap.removeLayer(layer.id);
              } catch (e) {
                // Ignore errors if layer doesn't exist
              }
            }
          });
        }

        // Filter Canvas2D and fingerprinting errors
        const originalConsoleError = console.error;
        console.error = function (...args) {
          const errorMessage = args.join(' ');
          if (
            (typeof errorMessage === 'string' &&
              errorMessage.includes('Canvas2D') &&
              errorMessage.includes('fingerprinting')) ||
            (args[0] && typeof args[0] === 'string' && args[0].includes('hook.js:608'))
          ) {
            return;
          }
          originalConsoleError.apply(console, args);
        };

        // Custom wheel handler to fix zoom issues
        newMap.scrollZoom.disable();
        const mapContainer = newMap.getContainer();

        const wheelHandler = (e: WheelEvent) => {
          e.preventDefault();
          e.stopPropagation();

          const wheelZoomRate = 0.0025;
          const delta = -e.deltaY * wheelZoomRate;
          const currentZoom = newMap.getZoom();
          let newZoom = currentZoom + delta;

          newZoom = Math.max(newMap.getMinZoom(), Math.min(newMap.getMaxZoom(), newZoom));

          if (newZoom !== currentZoom) {
            const rect = mapContainer.getBoundingClientRect();
            const point: [number, number] = [e.clientX - rect.left, e.clientY - rect.top];
            const lngLat = newMap.unproject(point);

            newMap.easeTo({
              zoom: newZoom,
              center: lngLat,
              duration: 0,
              around: lngLat,
            });
          }
        };

        mapContainer.addEventListener('wheel', wheelHandler, { passive: false });

        newMap.once('remove', () => {
          mapContainer.removeEventListener('wheel', wheelHandler);
        });

        // Touch device optimizations
        if (isTouchDevice) {
          mapContainer.style.touchAction = 'manipulation';
          newMap.touchZoomRotate.enable();
          newMap.touchZoomRotate.disableRotation();
          newMap.setMaxZoom(newMap.getMaxZoom());
          newMap.dragRotate.disable();
          newMap.touchPitch.disable();
        }

        // Apply passive events fix
        applyMapboxPassiveEventsFix();

        // Set map reference
        mapRef.current = newMap;

        try {
          // Initialize hospitals source and layer
          mapRef.current.addSource('hospitals', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [],
            },
          });

          mapRef.current.addLayer({
            id: 'hospital-points',
            type: 'circle',
            source: 'hospitals',
            paint: {
              'circle-radius': [
                'case',
                ['boolean', ['get', 'isActive'], false],
                9,
                6,
              ],
              'circle-color': [
                'match',
                ['get', 'status'],
                'Deployed',
                '#3b82f6',
                'Signed',
                '#10b981',
                '#cccccc',
              ],
              'circle-stroke-width': [
                'case',
                ['boolean', ['get', 'isActive'], false],
                2.5,
                1.5,
              ],
              'circle-stroke-color': [
                'case',
                ['boolean', ['get', 'isActive'], false],
                '#ffffff',
                '#ffffff',
              ],
            },
          });

          // Add hover effects
          mapRef.current.on('mouseenter', 'hospital-points', () => {
            if (mapRef.current) {
              mapRef.current.getCanvas().style.cursor = 'pointer';
            }
          });

          mapRef.current.on('mouseleave', 'hospital-points', () => {
            if (mapRef.current) {
              mapRef.current.getCanvas().style.cursor = '';
            }
          });
        } catch (error) {
          logger.error('Error initializing map layers:', error);
        }

        setMapLoaded(true);
      });

      return () => {
        removeMapboxPassiveEventsFix();
        
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        mapInitializedRef.current = false;
      };
    } catch (e) {
      logger.error('Error initializing map:', e);
      mapInitializedRef.current = false;
      return () => {};
    }
  }, [isTouchDevice, mapboxgl, mapContainer, mapRef, setMapLoaded]);

  return {
    mapInitializedRef,
  };
};

export default useMapInitialization;
