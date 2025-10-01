// File: app/components/map/LocationMarker.tsx
'use client';

import { useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { MapboxMarker, MapboxMap, MapboxGLInstance } from '../../types/mapbox';

interface LocationMarkerProps {
  mapRef: React.MutableRefObject<MapboxMap | null>;
  mapboxgl: MapboxGLInstance | null;
  translate: (key: string) => string;
}

// Hook for location marker management
export const useLocationMarker = ({ mapRef, mapboxgl, translate }: LocationMarkerProps) => {
  const locationMarkerRef = useRef<MapboxMarker | null>(null);
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createLocationMarker = useCallback(
    (lngLat: [number, number]) => {
      if (!mapRef.current || !mapboxgl) return null;

      // Supprimer le marqueur existant s'il y en a un
      if (locationMarkerRef.current) {
        locationMarkerRef.current.remove();
        locationMarkerRef.current = null;
      }

      // Créer l'élément du marqueur avec effet radar
      const markerEl = document.createElement('div');
      markerEl.className = 'location-marker';
      markerEl.style.width = '40px';
      markerEl.style.height = '40px';
      markerEl.style.position = 'relative';
      markerEl.style.zIndex = '10';

      // Créer les effets de pulsation
      const pulseRing1 = document.createElement('div');
      pulseRing1.className = 'pulse-ring pulse-ring-1';
      Object.assign(pulseRing1.style, {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        border: '2px solid rgba(66, 133, 244, 0.6)',
        opacity: '1',
      });

      const pulseRing2 = document.createElement('div');
      pulseRing2.className = 'pulse-ring pulse-ring-2';
      Object.assign(pulseRing2.style, {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        border: '2px solid rgba(66, 133, 244, 0.6)',
        opacity: '1',
      });

      // Créer le point central
      const centerDot = document.createElement('div');
      centerDot.className = 'center-dot';
      Object.assign(centerDot.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: '#4285F4',
        border: '2px solid white',
        boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
        zIndex: '2',
      });

      // Ajouter l'animation CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes radarPulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          50% {
            transform: scale(1.8);
            opacity: 0.6;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
        .pulse-ring-1 {
          animation: radarPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .pulse-ring-2 {
          animation: radarPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 1s;
        }
        .location-marker {
          filter: drop-shadow(0 0 8px rgba(66, 133, 244, 0.6));
        }
      `;

      // Only add style if it doesn't exist
      if (!document.querySelector('#location-marker-styles')) {
        style.id = 'location-marker-styles';
        document.head.appendChild(style);
      }

      markerEl.appendChild(pulseRing1);
      markerEl.appendChild(pulseRing2);
      markerEl.appendChild(centerDot);

      // Créer et ajouter le marqueur Mapbox
      const marker = new mapboxgl.Marker({
        element: markerEl,
        anchor: 'center',
      })
        .setLngLat(lngLat)
        .addTo(mapRef.current);

      // Stocker le marqueur dans la référence
      locationMarkerRef.current = marker;

      // Configurer le timeout pour supprimer le marqueur après 10 secondes
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }

      locationTimeoutRef.current = setTimeout(() => {
        if (locationMarkerRef.current) {
          locationMarkerRef.current.remove();
          locationMarkerRef.current = null;
        }

        toast.success(translate('Location marker automatically removed'), {
          duration: 2000,
          position: 'bottom-center',
        });
      }, 10000);

      return marker;
    },
    [mapRef, mapboxgl, translate]
  );

  const removeLocationMarker = useCallback(() => {
    if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
      locationMarkerRef.current = null;
    }

    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    removeLocationMarker();
  }, [removeLocationMarker]);

  return {
    createLocationMarker,
    removeLocationMarker,
    cleanup,
    locationMarkerRef,
    locationTimeoutRef,
  };
};

export default useLocationMarker;
