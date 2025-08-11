// File: app/components/Map.tsx
'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useLingui } from '@lingui/react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from '@lingui/react';
import { toast } from 'react-hot-toast';
import screenfull from 'screenfull';
import {
  applyMapboxPassiveEventsFix,
  removeMapboxPassiveEventsFix,
} from '../utils/mapbox-passive-fix';
import { useMapStore } from '../store/useMapStore';
import { setupConsoleFilter } from '../utils/console-filter';
import logger from '../utils/logger';
import HospitalDetail from './HospitalDetail';
import { useMapbox } from '../hooks/useMapbox';

// Global RTL configuration to avoid multiple calls
let rtlPluginLoaded = false;

// Define MapComponent props (remove isMobileView)
interface MapProps {
  className?: string;
}

// DÉBUT: Icône SVG pour la Localisation
const LocationIcon: React.FC<{ isLocating?: boolean }> = ({ isLocating = false }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke="#A1CBF9"
      strokeWidth="2"
      className={isLocating ? 'animate-pulse' : ''}
    ></circle>
    <circle
      cx="12"
      cy="12"
      r="3"
      fill="#A1CBF9"
      className={isLocating ? 'animate-ping' : ''}
    ></circle>
    <path d="M12 2V4" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round"></path>
    <path d="M12 20V22" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round"></path>
    <path d="M2 12L4 12" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round"></path>
    <path d="M20 12L22 12" stroke="#A1CBF9" strokeWidth="2" strokeLinecap="round"></path>
  </svg>
);
// FIN: Icône SVG pour la Localisation

// DÉBUT: Icône SVG pour le Plein Écran
const FullscreenEnterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A1CBF9" strokeWidth="2">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    {/* Indicateur visuel pour debug */}
    <circle cx="12" cy="12" r="1" fill="#A1CBF9" />
  </svg>
);

const FullscreenExitIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A1CBF9" strokeWidth="2">
    <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3M8 21v-3a2 2 0 0 0-2-2H3" />
    {/* Indicateur visuel différent pour debug */}
    <rect x="10" y="10" width="4" height="4" fill="#A1CBF9" />
  </svg>
);
// FIN: Icône SVG pour le Plein Écran

// Composant séparé pour l'icône plein écran
const FullscreenIcon: React.FC<{ isFullscreen: boolean }> = ({ isFullscreen }) => {
  return isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />;
};

const MapComponent: React.FC<MapProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Use the mapbox hook for dynamic loading
  const { mapboxgl, isLoading: isMapboxLoading, error: mapboxError } = useMapbox();

  // Create a safe translation function that handles undefined i18n
  const _ = useCallback(
    (text: string) => {
      try {
        if (!i18n?._) {
          return text;
        }
        const translated = i18n._(text);
        return translated;
      } catch (error) {
        logger.error(`Error translating text in Map component: ${text}`, error);
        return text;
      }
    },
    [i18n]
  );

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRootContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const locationMarkerRef = useRef<any>(null);
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const geolocationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressToastRef = useRef<string | null>(null);
  const isTrackingRef = useRef<boolean>(false);
  const isFirstRenderRef = useRef<boolean>(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const popupRef = useRef<any>(null);

  const {
    hospitals,
    filteredHospitals,
    currentDate,
    selectHospital,
    selectedFilters,
    timelineIndex,
    timelineLength,
  } = useMapStore();

  // Référence pour suivre si la carte a été initialisée
  const mapInitializedRef = useRef<boolean>(false);

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

  // Note: resetToFranceView function removed to prevent automatic zoom changes
  // The map now maintains user-chosen zoom levels for better UX

  // Créer un marqueur de localisation avec effet radar
  const createLocationMarker = useCallback(
    (lngLat: [number, number]) => {
      if (!mapRef.current || !mapboxgl) return null;

      // Supprimer le marqueur existant s'il y en a un
      if (locationMarkerRef.current) {
        locationMarkerRef.current.remove();
        locationMarkerRef.current = null;
      }

      // Créer l'élément du marqueur
      const markerEl = document.createElement('div');
      markerEl.className = 'location-marker';
      markerEl.style.width = '40px';
      markerEl.style.height = '40px';
      markerEl.style.position = 'relative';
      markerEl.style.zIndex = '10'; // Assurer que le marqueur est au-dessus des autres éléments

      // Créer le premier effet de pulsation
      const pulseRing1 = document.createElement('div');
      pulseRing1.className = 'pulse-ring pulse-ring-1';
      pulseRing1.style.position = 'absolute';
      pulseRing1.style.width = '100%';
      pulseRing1.style.height = '100%';
      pulseRing1.style.borderRadius = '50%';
      pulseRing1.style.backgroundColor = 'rgba(66, 133, 244, 0.2)';
      pulseRing1.style.border = '2px solid rgba(66, 133, 244, 0.6)';
      pulseRing1.style.opacity = '1';

      // Créer le second effet de pulsation avec un délai
      const pulseRing2 = document.createElement('div');
      pulseRing2.className = 'pulse-ring pulse-ring-2';
      pulseRing2.style.position = 'absolute';
      pulseRing2.style.width = '100%';
      pulseRing2.style.height = '100%';
      pulseRing2.style.borderRadius = '50%';
      pulseRing2.style.backgroundColor = 'rgba(66, 133, 244, 0.2)';
      pulseRing2.style.border = '2px solid rgba(66, 133, 244, 0.6)';
      pulseRing2.style.opacity = '1';

      // Créer le point central
      const centerDot = document.createElement('div');
      centerDot.className = 'center-dot';
      centerDot.style.position = 'absolute';
      centerDot.style.top = '50%';
      centerDot.style.left = '50%';
      centerDot.style.transform = 'translate(-50%, -50%)';
      centerDot.style.width = '16px';
      centerDot.style.height = '16px';
      centerDot.style.borderRadius = '50%';
      centerDot.style.backgroundColor = '#4285F4';
      centerDot.style.border = '2px solid white';
      centerDot.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
      centerDot.style.zIndex = '2'; // S'assurer que le point est au-dessus des anneaux

      // Ajouter l'animation CSS avec deux anneaux décalés pour un effet radar
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
      document.head.appendChild(style);

      markerEl.appendChild(pulseRing1);
      markerEl.appendChild(pulseRing2);
      markerEl.appendChild(centerDot);

      // Créer et ajouter le marqueur
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
        isTrackingRef.current = false;

        // Ne pas changer le zoom automatiquement
        // L'utilisateur peut manuellement ajuster la vue si nécessaire

        toast.success(_('Location marker automatically removed'), {
          duration: 2000,
          position: 'bottom-center',
        });
      }, 10000);

      return marker;
    },
    [_, mapboxgl]
  );

  // Écouter les événements personnalisés pour le contrôle de la carte
  useEffect(() => {
    const handleZoomIn = () => {
      if (mapRef.current) {
        mapRef.current.zoomIn();
      }
    };

    const handleZoomOut = () => {
      if (mapRef.current) {
        mapRef.current.zoomOut();
      }
    };

    const handleCenterUser = (event: CustomEvent) => {
      if (mapRef.current && event.detail) {
        mapRef.current.flyTo({
          center: [event.detail.lng, event.detail.lat],
          zoom: 12,
          duration: 1500,
        });
        // Créer un marqueur de localisation
        createLocationMarker([event.detail.lng, event.detail.lat]);
      }
    };

    window.addEventListener('mapZoomIn', handleZoomIn);
    window.addEventListener('mapZoomOut', handleZoomOut);
    window.addEventListener('mapCenterUser', handleCenterUser as EventListener);

    return () => {
      window.removeEventListener('mapZoomIn', handleZoomIn);
      window.removeEventListener('mapZoomOut', handleZoomOut);
      window.removeEventListener('mapCenterUser', handleCenterUser as EventListener);
    };
  }, [createLocationMarker]);

  // Handler optimisé pour le bouton de test de géolocalisation avec factory pattern
  const createTestLocationClickHandler = useMemo(() => {
    return (toastId: string) => () => {
      // Position de test : Paris, France
      const testPosition: [number, number] = [2.3522, 48.8566]; // [longitude, latitude]

      createLocationMarker(testPosition);

      if (mapRef.current) {
        // Fly to test location with smooth animation, preserving current zoom
        const currentZoom = mapRef.current.getZoom();
        mapRef.current.flyTo({
          center: testPosition,
          zoom: currentZoom, // Keep exact same zoom to avoid zoom animation
          speed: 1.2, // Smooth flying speed
          curve: 1.42, // Natural curve for the flight path
          essential: true, // This animation is considered essential
        });
      }

      toast.dismiss(toastId);
      toast.success('Using test location: Paris, France', {
        duration: 3000,
        position: 'bottom-center',
      });
    };
  }, [createLocationMarker]);

  // Handle location button click
  const handleLocationClick = useCallback(() => {
    if (!mapRef.current || !mapboxgl) {
      return;
    }

    // Si on est en train de localiser (recherche GPS en cours), annuler la géolocalisation
    if (isLocating) {
      setIsLocating(false);
      isTrackingRef.current = false;

      // Annuler le timeout de géolocalisation
      if (geolocationTimeoutRef.current) {
        clearTimeout(geolocationTimeoutRef.current);
        geolocationTimeoutRef.current = null;
      }

      // Fermer le toast de progression
      if (progressToastRef.current) {
        toast.dismiss(progressToastRef.current);
        progressToastRef.current = null;
      }

      toast.success(_('Geolocation cancelled'), {
        duration: 2000,
        position: 'bottom-center',
      });

      return;
    }

    // Si on a déjà un marqueur de localisation (radar actif), le supprimer
    // Vérifier d'abord si le marqueur existe, même si isTrackingRef n'est pas encore mis à jour
    if (locationMarkerRef.current) {
      isTrackingRef.current = false;

      // Supprimer le marqueur immédiatement
      locationMarkerRef.current.remove();
      locationMarkerRef.current = null;

      // Annuler le timeout de suppression automatique
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }

      // Ne pas changer le zoom automatiquement lors de la suppression manuelle

      toast.success(_('Location marker removed'), {
        duration: 2000,
        position: 'bottom-center',
      });

      return;
    }

    // Clear existing location marker
    if (locationMarkerRef.current) {
      (locationMarkerRef.current as mapboxgl.Marker).remove();
      locationMarkerRef.current = null;
    }

    // Clear existing timeout
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }

    // Set tracking flag and loading state
    isTrackingRef.current = true;
    setIsLocating(true);

    // Afficher un toast de progression avec timeout visuel
    progressToastRef.current = toast.loading(_('Locating... Click again to cancel'), {
      duration: 15000,
      position: 'bottom-center',
      style: {
        background: '#333',
        color: '#fff',
        border: '1px solid #555',
      },
    });

    // Timeout de sécurité pour annuler automatiquement après 15 secondes
    geolocationTimeoutRef.current = setTimeout(() => {
      setIsLocating(false);
      isTrackingRef.current = false;

      if (progressToastRef.current) {
        toast.dismiss(progressToastRef.current);
        progressToastRef.current = null;
      }

      toast.error(_('Geolocation timed out. Please try again.'), {
        duration: 4000,
        position: 'bottom-center',
      });
    }, 15000);

    // Vérifier si nous sommes sur Cloudflare
    const isCloudflare =
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('cloudflare') ||
        window.location.hostname.includes('galeon.community'));

    // Informer l'utilisateur des limitations sur Cloudflare
    if (isCloudflare) {
      toast(
        _('Note: Precise geolocation may be limited on this platform. Using approximate location.'),
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
        const errorMsg = _('Geolocation is not supported by your browser');
        toast.error(errorMsg, {
          duration: 4000,
          position: 'bottom-center',
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #555',
          },
        });
        isTrackingRef.current = false;
        return;
      }

      // Check permissions first (if supported)
      if ('permissions' in navigator) {
        navigator.permissions
          .query({ name: 'geolocation' })
          .then(result => {
            if (result.state === 'denied') {
              const errorMsg = _(
                'Location access was denied. Please check your browser permissions.'
              );
              toast.error(errorMsg, {
                duration: 4000,
                position: 'bottom-center',
                style: {
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                },
              });
              isTrackingRef.current = false;
              return;
            }
          })
          .catch(() => {
            // Permissions API not supported, continue with geolocation request
          });
      }

      // Request user location with appropriate options
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

          // Fly to user location with smooth animation, preserving current zoom
          const currentZoom = mapRef.current.getZoom();
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: currentZoom, // Keep exact same zoom to avoid zoom animation
            speed: 1.2, // Smooth flying speed
            curve: 1.42, // Natural curve for the flight path
            essential: true, // This animation is considered essential
          });

          // Afficher un message de succès
          toast.success(_('Location found!'), {
            duration: 3000,
            position: 'bottom-center',
          });
        },
        error => {
          // Reset tracking state and loading on error
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

          // Provide user feedback based on error type
          let errorMessage = _('Unable to get your location');

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = _(
                'Location access was denied. Please check your browser permissions.'
              );
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = _(
                'Location information is unavailable. This often happens on localhost. Try using HTTPS or a different network.'
              );
              break;
            case error.TIMEOUT:
              errorMessage = _('The request to get your location timed out.');
              break;
          }

          logger.warn(`Geolocation error (${error.code}): ${error.message ?? 'No message'}`);

          // Pour le développement local, proposer une position de test
          if (error.code === error.POSITION_UNAVAILABLE && process.env.NODE_ENV === 'development') {
            // Afficher un toast avec option de test
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
            // Display normal error message
            toast.error(errorMessage, {
              duration: 4000,
              position: 'bottom-center',
              style: {
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
              },
            });
          }
        },
        {
          enableHighAccuracy: false, // Try with less accuracy first
          timeout: 15000, // Increased timeout
          maximumAge: 300000, // Allow cached position up to 5 minutes
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
      const errorMsg = _('Error accessing geolocation. Please try again.');

      toast.error(errorMsg, {
        duration: 4000,
        position: 'bottom-center',
        style: {
          background: '#333',
          color: '#fff',
          border: '1px solid #555',
        },
      });
    }
  }, [createLocationMarker, _, isLocating, createTestLocationClickHandler, mapboxgl]);

  const handleFullscreenToggle = useCallback(() => {
    if (screenfull.isEnabled && mapRootContainer.current) {
      screenfull.toggle(mapRootContainer.current);
    }
  }, []);







  useEffect(() => {
    const handleChange = () => {
      if (screenfull.isEnabled) {
        setIsFullscreen(screenfull.isFullscreen);
      }
    };

    if (screenfull.isEnabled) {
      // Initialiser l'état au chargement
      setIsFullscreen(screenfull.isFullscreen);

      // Écouter les changements
      screenfull.on('change', handleChange);

      return () => {
        screenfull.off('change', handleChange);
      };
    }

    // Return empty cleanup function if screenfull is not enabled
    return () => {};
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current || mapInitializedRef.current || !mapboxgl) {
      return () => {}; // Return empty cleanup function for early returns
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
        zoom: 4.8, // Zoom approprié pour voir toute la France
        attributionControl: false,
        touchZoomRotate: true,
        dragRotate: true,
        touchPitch: true,
        interactive: true,
        preserveDrawingBuffer: true,
        antialias: true,
        // Temporarily remove maxBounds to see if it causes zoom issues
        // maxBounds: franceBounds,
        minZoom: 4.0,
        maxZoom: 10,
        fadeDuration: 0,
        trackResize: true,
        refreshExpiredTiles: true,
        renderWorldCopies: false,
      });

      // Désactiver explicitement les fonctionnalités qui causent des avertissements
      newMap.once('load', () => {
        // Désactiver le terrain si disponible dans cette version de mapbox
        if (newMap.setTerrain && typeof newMap.setTerrain === 'function') {
          newMap.setTerrain(null);
        }

        // Désactiver le brouillard si disponible
        if (newMap.setFog && typeof newMap.setFog === 'function') {
          newMap.setFog(null);
        }

        // Désactiver hillshade layers qui peuvent causer des problèmes Canvas2D
        const style = newMap.getStyle();
        if (style?.layers) {
          style.layers.forEach((layer: any) => {
            if (layer.id.includes('hillshade') || layer.type === 'hillshade') {
              try {
                newMap.removeLayer(layer.id);
              } catch (e) {
                // Ignorer les erreurs si la couche n'existe pas
              }
            }
          });
        }

        // Ajouter un gestionnaire pour les erreurs Canvas2D
        // eslint-disable-next-line no-console
        const originalConsoleError = console.error;
        // eslint-disable-next-line no-console
        console.error = function (...args) {
          // Filtrer les erreurs liées à Canvas2D et fingerprinting
          const errorMessage = args.join(' ');
          if (
            (typeof errorMessage === 'string' &&
              errorMessage.includes('Canvas2D') &&
              errorMessage.includes('fingerprinting')) ||
            (args[0] && typeof args[0] === 'string' && args[0].includes('hook.js:608'))
          ) {
            // Ignorer silencieusement cette erreur spécifique
            return;
          }
          // Passer les autres erreurs au gestionnaire d'origine
          originalConsoleError.apply(console, args);
        };

        // Correctif pour le problème de dézoom bloqué
        // Désactiver le zoom par défaut et implémenter notre propre gestionnaire
        newMap.scrollZoom.disable();

        // Ajouter un gestionnaire d'événements pour la molette avec l'option passive: false
        const mapContainer = newMap.getContainer();

        const wheelHandler = (e: WheelEvent) => {
          // Empêcher le comportement par défaut pour éviter le défilement de la page
          e.preventDefault();
          e.stopPropagation();

          // Calculer le delta de zoom en utilisant les mêmes facteurs que Mapbox par défaut
          const wheelZoomRate = 0.0025;
          const delta = -e.deltaY * wheelZoomRate;

          // Obtenir le zoom actuel
          const currentZoom = newMap.getZoom();

          // Calculer le nouveau zoom
          let newZoom = currentZoom + delta;

          // S'assurer que le zoom reste dans les limites
          newZoom = Math.max(newMap.getMinZoom(), Math.min(newMap.getMaxZoom(), newZoom));

          // Appliquer le zoom uniquement s'il a changé
          if (newZoom !== currentZoom) {
            // Obtenir la position du curseur par rapport à la carte
            const rect = mapContainer.getBoundingClientRect();
            const point: [number, number] = [e.clientX - rect.left, e.clientY - rect.top];

            // Convertir en coordonnées géographiques
            const lngLat = newMap.unproject(point);

            // Appliquer le zoom en gardant le curseur au même point
            newMap.easeTo({
              zoom: newZoom,
              center: lngLat,
              duration: 0, // Zoom instantané
              around: lngLat, // Zoomer autour du point du curseur
            });
          }
        };

        // Utiliser l'API addEventListener directement avec passive: false
        // Cela permet d'appeler preventDefault() dans le gestionnaire
        mapContainer.addEventListener('wheel', wheelHandler, { passive: false });

        // Ajouter un nettoyage pour cet écouteur
        newMap.once('remove', () => {
          mapContainer.removeEventListener('wheel', wheelHandler);
        });

        // Améliorer la gestion des événements tactiles pour la carte
        if (isTouchDevice) {
          // Désactiver le comportement de zoom par défaut du navigateur sur double-tap
          mapContainer.style.touchAction = 'manipulation';

          // Améliorer la réactivité des gestes de pincement pour le zoom
          newMap.touchZoomRotate.enable();
          newMap.touchZoomRotate.disableRotation();

          // Améliorer la sensibilité du zoom tactile
          // La méthode setZoomRate n'existe pas, utilisons une approche alternative
          // en ajustant les options de la carte
          newMap.setMaxZoom(newMap.getMaxZoom()); // Rafraîchir les paramètres de zoom

          // Désactiver le comportement de rotation pour éviter les rotations accidentelles
          newMap.dragRotate.disable();
          newMap.touchPitch.disable();
        }

        // Apply passive events fix
        applyMapboxPassiveEventsFix();

        // Set map reference and initialize layers
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
                9, // Larger radius for active points
                6, // Default radius for inactive points
              ],
              'circle-color': [
                'match',
                ['get', 'status'],
                'Deployed',
                '#42A5F5', // Blue for Deployed
                'Signed',
                '#4CAF50', // Green for Signed
                '#cccccc', // Default fallback color (grey)
              ],
              'circle-stroke-width': [
                'case',
                ['boolean', ['get', 'isActive'], false],
                2.5, // Thicker stroke for active points
                1.5, // Default stroke for inactive points
              ],
              'circle-stroke-color': [
                'case',
                ['boolean', ['get', 'isActive'], false],
                '#ffffff', // White stroke for active points
                '#ffffff', // White stroke for inactive points (or change if desired)
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

        // Zoom change listener removed - no longer needed for debugging

        // Set map as loaded and trigger initial marker update
        setMapLoaded(true);
      });

      // Initial view is set via map constructor parameters
      // No fitBounds needed to avoid unwanted zoom animation

      // Cleanup on unmount
      return () => {
        removeMapboxPassiveEventsFix();

        // Nettoyer tous les marqueurs
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};

        // Nettoyer le marqueur de localisation
        if (locationMarkerRef.current) {
          locationMarkerRef.current.remove();
          locationMarkerRef.current = null;
        }

        // Nettoyer les timeouts
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
          locationTimeoutRef.current = null;
        }

        if (geolocationTimeoutRef.current) {
          clearTimeout(geolocationTimeoutRef.current);
          geolocationTimeoutRef.current = null;
        }

        // Nettoyer le toast de progression
        if (progressToastRef.current) {
          toast.dismiss(progressToastRef.current);
          progressToastRef.current = null;
        }

        // Nettoyer les popups
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }

        // Supprimer la carte en dernier
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        // Réinitialiser les états et références
        mapInitializedRef.current = false;
        isTrackingRef.current = false;
        isFirstRenderRef.current = true;
      };
    } catch (e) {
      logger.error('Error initializing map:', e);
      // Réinitialiser la référence d'initialisation en cas d'erreur
      mapInitializedRef.current = false;
      // Return empty cleanup function for error case
      return () => {};
    }
  }, [isTouchDevice, mapboxgl]);

  // Update displayed hospitals based on current date and filters
  useEffect(() => {
    // Ensure map, source, and base hospital data are ready
    if (!mapRef.current || !hospitals || !mapLoaded) {
      return;
    }

    const source = mapRef.current.getSource('hospitals') as mapboxgl.GeoJSONSource;
    if (!source) {
      return; // Exit if source doesn't exist yet
    }

    try {
      // --- Re-implement filtering logic directly in the map component ---

      // 1. Filter by status based on selectedFilters
      const statusFiltered = hospitals.filter(hospital => {
        if (hospital.status === 'Deployed' && selectedFilters.deployed) return true;
        if (hospital.status === 'Signed' && selectedFilters.signed) return true;
        return false;
      });

      // 2. Filter by date (using normalized dates) - Skip on mobile
      const isMobile = window.innerWidth <= 768;
      const dateFiltered = isMobile ? statusFiltered : statusFiltered.filter(hospital => {
        try {
          const current = new Date(currentDate);
          current.setUTCHours(0, 0, 0, 0);
          const hospitalDate = new Date(hospital.deploymentDate);
          hospitalDate.setUTCHours(0, 0, 0, 0);
          return hospitalDate <= current;
        } catch (error) {
          logger.error(`Error parsing date during map update for hospital ${hospital.id}:`, error);
          return false;
        }
      });
      // --- End re-implemented filtering ---

      // Sort hospitals by status for consistent rendering (optional, based on preference)
      const finalHospitalsToShow = [...dateFiltered].sort((a, b) => {
        if (a.status === 'Deployed' && b.status !== 'Deployed') return 1;
        if (a.status !== 'Deployed' && b.status === 'Deployed') return -1;
        return 0;
      });

      // Update the GeoJSON source with the locally filtered hospitals
      const features = finalHospitalsToShow.map(hospital => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: hospital.coordinates ?? [0, 0],
        },
        properties: {
          id: hospital.id,
          name: hospital.name,
          status: hospital.status,
          isActive: hospital.deploymentDate === currentDate && timelineIndex < timelineLength - 1,
        },
      }));

      source.setData({
        type: 'FeatureCollection',
        features: features,
      });
    } catch (error) {
      logger.error('Error updating hospitals source data:', error);
    }
  }, [hospitals, currentDate, selectedFilters, mapLoaded, timelineIndex, timelineLength]);

  // Add click handler for hospital points
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const clickHandler = (
      e: any
    ) => {
      if (!e.features?.length || !mapRef.current) return;

      const feature = e.features[0];
      if (!feature) return;

      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [
        number,
        number,
      ];
      const isMobile = window.innerWidth <= 768;
      const hospitalList = isMobile ? hospitals : filteredHospitals;
      const hospital = hospitalList.find(h => h.id === feature.properties?.id);

      if (hospital) {
        if (isMobile) {
          // Sur mobile, pas de popup - juste sélectionner l'hôpital
          // Forcer une mise à jour même si c'est le même hôpital
          selectHospital(null); // Réinitialiser d'abord
          setTimeout(() => {
            selectHospital(hospital); // Puis sélectionner
          }, 0);
          // Centrer la carte sur l'hôpital avec décalage vers le haut pour le panneau
          // Décaler le centre vers le haut pour que l'hôpital soit visible au-dessus du panneau
          const offsetLat = coordinates[1] + 0.006; // Décalage vers le haut ajusté pour panneau au-dessus de la nav
          mapRef.current.flyTo({
            center: [coordinates[0], offsetLat],
            zoom: 14,
            duration: 1000,
          });
        } else {
          // Sur desktop, afficher le popup
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }

          const popupNode = document.createElement('div');
          const root = createRoot(popupNode);
          root.render(
            <I18nProvider i18n={i18n}>
              <HospitalDetail hospital={hospital} />
            </I18nProvider>
          );

          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true,
            maxWidth: '300px',
            className: 'hospital-popup',
            offset: [0, 0],
          })
            .setLngLat(coordinates)
            .setDOMContent(popupNode)
            .addTo(mapRef.current);

          popupRef.current = popup;
          selectHospital(hospital);

          popup.on('close', () => {
            popupRef.current = null;
            selectHospital(null);
          });
        }
      }
    };

    // Add click handler
    mapRef.current.on('click', 'hospital-points', clickHandler);

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', 'hospital-points', clickHandler);
      }
    };
  }, [mapLoaded, filteredHospitals, hospitals, selectHospital, i18n]);

  // Note: Initial France view is set during map initialization
  // No need for additional fitBounds after map loads to avoid unwanted zoom changes

  // Détecter la vue mobile pour ajuster la position des boutons
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768); // Seuil pour la vue mobile, à ajuster si besoin
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Positions simplifiées et corrigées avec l'espacement standard
  const getButtonPosition = () => {
    if (isFullscreen) {
      return 'top-24'; // Position plus basse en plein écran
    }
    // Position normale - ajustée pour mobile et desktop
    return isMobileView ? 'top-32' : 'top-44';
  };

  // Show loading state while mapbox is loading
  if (isMapboxLoading) {
    return (
      <div className={`relative w-full h-screen bg-slate-900 flex flex-col ${className}`}>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
              onClick={() => window.location.reload()} 
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
      {/* Map container - Takes remaining space */}
      <div className="relative flex-grow">
        <div
          ref={mapContainer}
          className={`w-full h-full ${className}`}
          style={{ position: 'relative', height: '100%' }}
          data-testid="map-container"
        />

        <div
          className={`absolute ${isMobileView ? 'right-2' : 'right-6'} ${isFullscreen ? 'z-[9999]' : 'z-[60]'} flex flex-col ${getButtonPosition()}`}
          style={{
            gap: '4px', // Espacement réduit entre les boutons
          }}
        >
          <button
            onClick={handleLocationClick}
            className="map-control-button touch-manipulation hover:bg-white/20 transition-colors"
            style={{
              width: 'clamp(45px, 5vw, 55px)',
              height: 'clamp(45px, 5vw, 55px)',
              padding: 'calc(var(--standard-spacing) * 0.4)',
              background: 'rgba(217, 217, 217, 0.05)',
              border: '1.95px solid rgba(71,154,243,0.3)',
              backdropFilter: 'blur(17.5px)',
              borderRadius: '16px',
              cursor: 'pointer',
              margin: 'calc(var(--standard-spacing) * 0.4) 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              touchAction: 'manipulation',
            }}
            aria-label="Show my location"
            title={isLocating ? _('Click to cancel') : _('Geolocate')}
          >
            <LocationIcon isLocating={isLocating} />
          </button>
          {screenfull.isEnabled && (
            <button
              key={`fullscreen-${isFullscreen}`} // Forcer le re-rendu avec une clé unique
              onClick={handleFullscreenToggle}
              className="map-control-button touch-manipulation hover:bg-white/20 transition-colors"
              style={{
                width: 'clamp(45px, 5vw, 55px)',
                height: 'clamp(45px, 5vw, 55px)',
                padding: 'calc(var(--standard-spacing) * 0.4)',
                background: 'rgba(217, 217, 217, 0.05)',
                border: '1.95px solid rgba(71,154,243,0.3)',
                backdropFilter: 'blur(17.5px)',
                borderRadius: '16px',
                cursor: 'pointer',
                margin: 'calc(var(--standard-spacing) * 0.4) 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                touchAction: 'manipulation',
              }}
              aria-label={isFullscreen ? _('Exit fullscreen') : _('Enter fullscreen')}
              title={isFullscreen ? _('Exit fullscreen') : _('Enter fullscreen')}
            >
              <FullscreenIcon isFullscreen={isFullscreen} />
            </button>
          )}
        </div>
      </div>{' '}
      {/* End Map Container */}
    </div>
  );
};

export default MapComponent;
