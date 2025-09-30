// File: app/components/map/GeolocationHandler.tsx
'use client';

import { useRef, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import logger from '../../utils/logger';
import type { MapboxMap, MapboxGLInstance, MapboxMarker } from '../../types/mapbox';

// Props interface
interface GeolocationHandlerProps {
  mapRef: React.MutableRefObject<MapboxMap | null>;
  isLocating: boolean;
  setIsLocating: (isLocating: boolean) => void;
  createLocationMarker: (lngLat: [number, number]) => MapboxMarker | null;
  translate: (key: string) => string;
}

export const useGeolocationHandler = ({
  mapRef,
  isLocating,
  setIsLocating,
  createLocationMarker,
  translate
}: GeolocationHandlerProps) => {
  
  const geolocationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressToastRef = useRef<string | null>(null);
  const isTrackingRef = useRef<boolean>(false);

  // Factory pour créer un handler de test de localisation
  const createTestLocationClickHandler = useMemo(() => {
    return (toastId: string) => () => {
      // Position de test : Paris, France
      const testPosition: [number, number] = [2.3522, 48.8566];

      createLocationMarker(testPosition);

      if (mapRef.current) {
        const currentZoom = mapRef.current.getZoom();
        mapRef.current.flyTo({
          center: testPosition,
          zoom: currentZoom,
          speed: 1.2,
          curve: 1.42,
          essential: true,
        });
      }

      toast.dismiss(toastId);
      toast.success('Using test location: Paris, France', {
        duration: 3000,
        position: 'bottom-center',
      });
    };
  }, [createLocationMarker, mapRef]);

  const handleLocationClick = useCallback(() => {
    if (!mapRef.current) {
      return;
    }

    // Si on est en train de localiser, annuler la géolocalisation
    if (isLocating) {
      setIsLocating(false);
      isTrackingRef.current = false;

      if (geolocationTimeoutRef.current) {
        clearTimeout(geolocationTimeoutRef.current);
        geolocationTimeoutRef.current = null;
      }

      if (progressToastRef.current) {
        toast.dismiss(progressToastRef.current);
        progressToastRef.current = null;
      }

      toast.success(translate('Geolocation cancelled'), {
        duration: 2000,
        position: 'bottom-center',
      });

      return;
    }

    // Set tracking flag and loading state
    isTrackingRef.current = true;
    setIsLocating(true);

    // Afficher un toast de progression
    progressToastRef.current = toast.loading(translate('Locating... Click again to cancel'), {
      duration: 15000,
      position: 'bottom-center',
      style: {
        background: '#333',
        color: '#fff',
        border: '1px solid #555',
      },
    });

    // Timeout de sécurité
    geolocationTimeoutRef.current = setTimeout(() => {
      setIsLocating(false);
      isTrackingRef.current = false;

      if (progressToastRef.current) {
        toast.dismiss(progressToastRef.current);
        progressToastRef.current = null;
      }

      toast.error(translate('Geolocation timed out. Please try again.'), {
        duration: 4000,
        position: 'bottom-center',
      });
    }, 15000);

    // Vérifier si nous sommes sur Cloudflare
    const isCloudflare =
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('cloudflare') ||
        window.location.hostname.includes('galeon.community'));

    if (isCloudflare) {
      toast(
        translate('Note: Precise geolocation may be limited on this platform. Using approximate location.'),
        {
          duration: 4000,
          position: 'bottom-center',
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #555',
          },
        }
      );
    }

    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        const errorMsg = translate('Geolocation is not supported by your browser');
        toast.error(errorMsg, {
          duration: 4000,
          position: 'bottom-center',
        });
        isTrackingRef.current = false;
        setIsLocating(false);
        return;
      }

      // Check permissions first (if supported)
      if ('permissions' in navigator) {
        navigator.permissions
          .query({ name: 'geolocation' })
          .then(result => {
            if (result.state === 'denied') {
              const errorMsg = translate(
                'Location access was denied. Please check your browser permissions.'
              );
              toast.error(errorMsg, {
                duration: 4000,
                position: 'bottom-center',
              });
              isTrackingRef.current = false;
              setIsLocating(false);
              return;
            }
          })
          .catch(() => {
            // Permissions API not supported, continue
          });
      }

      // Request user location
      navigator.geolocation.getCurrentPosition(
        position => {
          // Nettoyer les états et timeouts
          setIsLocating(false);
          if (progressToastRef.current) {
            toast.dismiss(progressToastRef.current);
            progressToastRef.current = null;
          }
          if (geolocationTimeoutRef.current) {
            clearTimeout(geolocationTimeoutRef.current);
            geolocationTimeoutRef.current = null;
          }

          if (!mapRef.current || !isTrackingRef.current) {
            return;
          }

          const { longitude, latitude } = position.coords;

          // Create marker at user location
          createLocationMarker([longitude, latitude]);

          // Fly to user location
          const currentZoom = mapRef.current.getZoom();
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: currentZoom,
            speed: 1.2,
            curve: 1.42,
            essential: true,
          });

          toast.success(translate('Location found!'), {
            duration: 3000,
            position: 'bottom-center',
          });
        },
        error => {
          // Reset tracking state on error
          isTrackingRef.current = false;
          setIsLocating(false);
          if (progressToastRef.current) {
            toast.dismiss(progressToastRef.current);
            progressToastRef.current = null;
          }
          if (geolocationTimeoutRef.current) {
            clearTimeout(geolocationTimeoutRef.current);
            geolocationTimeoutRef.current = null;
          }

          // Handle different error types
          let errorMessage = translate('Unable to get your location');

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = translate(
                'Location access was denied. Please check your browser permissions.'
              );
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = translate(
                'Location information is unavailable. This often happens on localhost. Try using HTTPS or a different network.'
              );
              break;
            case error.TIMEOUT:
              errorMessage = translate('The request to get your location timed out.');
              break;
          }

          logger.warn(`Geolocation error (${error.code}): ${error.message ?? 'No message'}`);

          // Pour le développement local, proposer une position de test
          if (error.code === error.POSITION_UNAVAILABLE && process.env.NODE_ENV === 'development') {
            toast(
              t => (
                <div className="flex flex-col gap-2">
                  <div className="text-sm">{errorMessage}</div>
                  <button
                    onClick={createTestLocationClickHandler(t.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Use Test Location (Paris)
                  </button>
                </div>
              ),
              {
                duration: 8000,
                position: 'bottom-center',
                style: {
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                },
              }
            );
          } else {
            toast.error(errorMessage, {
              duration: 4000,
              position: 'bottom-center',
            });
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000,
        }
      );
    } catch (error) {
      logger.error('Geolocation try-catch error:', error);
      isTrackingRef.current = false;
      setIsLocating(false);
      
      if (progressToastRef.current) {
        toast.dismiss(progressToastRef.current);
        progressToastRef.current = null;
      }
      if (geolocationTimeoutRef.current) {
        clearTimeout(geolocationTimeoutRef.current);
        geolocationTimeoutRef.current = null;
      }

      const errorMsg = translate('Error accessing geolocation. Please try again.');
      toast.error(errorMsg, {
        duration: 4000,
        position: 'bottom-center',
      });
    }
  }, [
    mapRef,
    isLocating,
    setIsLocating,
    createLocationMarker,
    translate,
    createTestLocationClickHandler
  ]);

  const cleanup = useCallback(() => {
    if (geolocationTimeoutRef.current) {
      clearTimeout(geolocationTimeoutRef.current);
      geolocationTimeoutRef.current = null;
    }

    if (progressToastRef.current) {
      toast.dismiss(progressToastRef.current);
      progressToastRef.current = null;
    }

    isTrackingRef.current = false;
  }, []);

  return {
    handleLocationClick,
    cleanup,
    isTrackingRef,
  };
};

export default useGeolocationHandler;
