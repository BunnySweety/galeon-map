// File: app/components/Map.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLingui } from '@lingui/react';
import { format } from 'date-fns';
import { useMapStore } from '../store/useMapStore';
import { Hospital } from '../store/useMapStore';
import { useGeolocation } from '../hooks/useGeolocation';
import { applyMapboxPassiveEventsFix, removeMapboxPassiveEventsFix } from '../utils/mapbox-passive-fix';
import { createBoundsFromHospitals, createMarkerElement } from '../utils/mapHelpers';
import { createRoot } from 'react-dom/client';
import HospitalDetail from './HospitalDetail';
import { I18nProvider } from '@lingui/react';
import ActionBar from './ActionBar';

// Global RTL configuration to avoid multiple calls
let rtlPluginLoaded = false;

// Setup MapBox token
if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  console.error('Mapbox token is not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local');
}
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapComponentProps {
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ className = '' }) => {
  const { i18n } = useLingui();

  // Create a safe translation function that handles undefined i18n
  const _ = useCallback((text: string) => {
    try {
      if (!i18n || !i18n._) {
        return text;
      }
      const translated = i18n._(text);
      return translated;
    } catch (error) {
      console.error(`Error translating text in Map component: ${text}`, error);
      return text;
    }
  }, [i18n]);

  const {
    latitude,
    longitude,
    getPosition
  } = useGeolocation();

  // Define France bounds for reuse
  const franceBounds = new mapboxgl.LngLatBounds(
    [-5.142, 41.333], // South-west of France
    [9.561, 51.089]   // North-east of France
  );

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const locationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTrackingRef = useRef<boolean>(false);
  const isFirstRenderRef = useRef<boolean>(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const {
    hospitals,
    currentDate,
    selectHospital
  } = useMapStore();

  // Create custom control button styles
  const createControlButton = useCallback((svgContent: string, onClick: () => void) => {
    const button = document.createElement('button');
    button.className = 'map-control-button';
    button.innerHTML = svgContent;
    button.style.width = 'clamp(45px, 5vw, 55px)';
    button.style.height = 'clamp(45px, 5vw, 55px)';
    button.style.padding = '8px';
    button.style.background = 'rgba(217, 217, 217, 0.05)';
    button.style.border = '1.95px solid rgba(255, 255, 255, 0.15)';
    button.style.backdropFilter = 'blur(17.5px)';
    button.style.borderRadius = '16px';
    button.style.cursor = 'pointer';
    button.style.margin = '8px 0';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.color = 'white';
    button.onclick = onClick;

    return button;
  }, []);

  // Create footer element
  const createFooter = useCallback(() => {
    const footer = document.createElement('div');
    footer.style.position = 'absolute';
    footer.style.bottom = '20px';
    footer.style.left = '0';
    footer.style.right = '0';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.alignItems = 'center';
    footer.style.padding = '12px 16px';
    footer.style.zIndex = '10';

    return footer;
  }, []);

  // Create radar effect marker
  const createRadarLocationMarker = useCallback(() => {
    if (!mapRef.current || !latitude || !longitude) return null;

    // Remove existing location marker
    if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
    }

    // Create marker element with radar effect
    const markerEl = document.createElement('div');
    markerEl.style.position = 'relative';
    markerEl.style.width = '50px';
    markerEl.style.height = '50px';

    // Create radar pulse effect
    const pulseRing = document.createElement('div');
    pulseRing.style.position = 'absolute';
    pulseRing.style.width = '100%';
    pulseRing.style.height = '100%';
    pulseRing.style.borderRadius = '50%';
    pulseRing.style.border = '2px solid #3b82f6';
    pulseRing.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';

    // Create center dot
    const centerDot = document.createElement('div');
    centerDot.style.position = 'absolute';
    centerDot.style.left = '50%';
    centerDot.style.top = '50%';
    centerDot.style.transform = 'translate(-50%, -50%)';
    centerDot.style.width = '16px';
    centerDot.style.height = '16px';
    centerDot.style.backgroundColor = '#3b82f6';
    centerDot.style.borderRadius = '50%';
    centerDot.style.border = '2px solid white';

    // Add keyframe animation for pulse effect
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(0.5);
          opacity: 1;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    markerEl.appendChild(pulseRing);
    markerEl.appendChild(centerDot);

    // Create and add marker
    const marker = new mapboxgl.Marker({
      element: markerEl,
      anchor: 'center'
    })
      .setLngLat([longitude, latitude])
      .addTo(mapRef.current);

    return marker;
  }, [latitude, longitude]);

  // Handle location button click
  const handleLocationClick = useCallback(() => {
    // Clear existing timeout if any
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }

    // If currently tracking, stop tracking
    if (isTrackingRef.current) {
      isTrackingRef.current = false;
      if (locationMarkerRef.current) {
        locationMarkerRef.current.remove();
        locationMarkerRef.current = null;
      }
      return;
    }

    // Start tracking
    isTrackingRef.current = true;
    getPosition();

    // Set timeout to disable tracking after 10 seconds
    locationTimeoutRef.current = setTimeout(() => {
      isTrackingRef.current = false;
      if (locationMarkerRef.current) {
        locationMarkerRef.current.remove();
        locationMarkerRef.current = null;
      }
      // Force cleanup of any remaining markers
      const mapElement = mapRef.current?.getContainer();
      if (mapElement) {
        const markers = mapElement.getElementsByClassName('mapboxgl-marker');
        while (markers.length > 0) {
          markers[0].remove();
        }
      }
    }, 10000);
  }, [getPosition]);

  // Update location marker when coordinates change
  useEffect(() => {
    // Always clean up existing marker first
    if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
      locationMarkerRef.current = null;
    }

    // If not tracking or no coordinates, don't create new marker
    if (!isTrackingRef.current || !latitude || !longitude || !mapLoaded) {
      return;
    }

    // Create and update marker
    const marker = createRadarLocationMarker();
    if (marker) {
      locationMarkerRef.current = marker;

      // Center map on user location without zoom
      mapRef.current?.panTo([longitude, latitude], {
        duration: 2000
      });
    }

    // Cleanup marker when effect is re-run or component unmounts
    return () => {
      if (locationMarkerRef.current) {
        locationMarkerRef.current.remove();
        locationMarkerRef.current = null;
      }
      // Force cleanup of any remaining markers
      const mapElement = mapRef.current?.getContainer();
      if (mapElement) {
        const markers = mapElement.getElementsByClassName('mapboxgl-marker');
        while (markers.length > 0) {
          markers[0].remove();
        }
      }
    };
  }, [mapLoaded, latitude, longitude, createRadarLocationMarker]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

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
        center: [2.213749, 46.5],
        zoom: 5.5,
        attributionControl: false,
        touchZoomRotate: true,
        dragRotate: true,
        touchPitch: true,
        interactive: true,
        preserveDrawingBuffer: true,
        antialias: true,
        maxBounds: franceBounds,
        minZoom: 5.5,
        maxZoom: 10,
        fadeDuration: 0,
        trackResize: true,
        refreshExpiredTiles: true,
        renderWorldCopies: false
      });

      // Initialisation simple
      newMap.once('load', () => {
        // Correctif pour le problème de dézoom bloqué
        // Désactiver le zoom par défaut et implémenter notre propre gestionnaire
        newMap.scrollZoom.disable();

        // Ajouter un gestionnaire d'événements pour la molette
        const wheelHandler = (e: WheelEvent) => {
          // Empêcher le comportement par défaut
          e.preventDefault();

          // Calculer le delta de zoom en utilisant les mêmes facteurs que Mapbox par défaut
          // La valeur par défaut de Mapbox est d'environ 0.0025 * wheelDelta
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
            const rect = mapContainer.current.getBoundingClientRect();
            const point = new mapboxgl.Point(
              e.clientX - rect.left,
              e.clientY - rect.top
            );

            // Convertir en coordonnées géographiques
            const lngLat = newMap.unproject(point);

            // Appliquer le zoom
            newMap.easeTo({
              zoom: newZoom,
              duration: 0,
              around: lngLat
            });
          }

          return false;
        };

        // Ajouter l'écouteur d'événements
        mapContainer.current.addEventListener('wheel', wheelHandler, { passive: false });

        // Indiquer que la carte est chargée
        setMapLoaded(true);
      });

      // Apply passive events fix
      applyMapboxPassiveEventsFix();

      // Wait for both map and style to be loaded
      newMap.on('style.load', () => {
        // Set map reference only after style is loaded
        mapRef.current = newMap;

        try {
          // Initialize hospitals source and layer
          mapRef.current.addSource('hospitals', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });

          mapRef.current.addLayer({
            id: 'hospital-points',
            type: 'circle',
            source: 'hospitals',
            paint: {
              'circle-radius': 6,
              'circle-color': [
                'match',
                ['get', 'status'],
                'Deployed', '#42A5F5',
                'Signed', '#4CAF50',
                '#42A5F5'  // Default color
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          });

          // Add click handler for the points
          mapRef.current.on('click', 'hospital-points', (e) => {
            if (!e.features?.length || !mapRef.current) return;

            const feature = e.features[0];
            const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
            const hospital = hospitals.find(h => h.id === feature.properties?.id);

            if (hospital) {
              // Handle popup creation and display
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
                offset: [0, 0]
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
          console.error('Error initializing map layers:', error);
        }

        // Create and add controls
        const controlContainer = document.createElement('div');
        controlContainer.style.position = 'absolute';
        controlContainer.style.top = '250px';
        controlContainer.style.right = '20px';
        controlContainer.style.zIndex = '10';
        controlContainer.style.display = 'flex';
        controlContainer.style.flexDirection = 'column';

        // Add controls to container
        controlContainer.appendChild(createControlButton(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A1CBF9" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        `, () => {
          if (!document.fullscreenElement) {
            mapContainer.current?.requestFullscreen();
          } else if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }));

        controlContainer.appendChild(createControlButton(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" stroke="#A1CBF9" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#A1CBF9"/>
            <path d="M12 2V4" stroke="#A1CBF9" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 20V22" stroke="#A1CBF9" stroke-width="2" stroke-linecap="round"/>
            <path d="M2 12L4 12" stroke="#A1CBF9" stroke-width="2" stroke-linecap="round"/>
            <path d="M20 12L22 12" stroke="#A1CBF9" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `, handleLocationClick));

        // Add custom container to map
        newMap.getContainer().appendChild(controlContainer);

        // Add footer to map
        newMap.getContainer().appendChild(createFooter());

        // Set map as loaded and trigger initial marker update
        setMapLoaded(true);
      });

      // Adjust initial view to see entire France
      newMap.fitBounds(franceBounds, {
        padding: { top: 150, bottom: 50, left: 100, right: 100 },
        duration: 0,
        maxZoom: 4.5
      });

      // Cleanup on unmount
      return () => {
        removeMapboxPassiveEventsFix();
        if (mapRef.current) {
          // Remove all markers first
          Object.values(markersRef.current).forEach(marker => marker.remove());
          markersRef.current = {};

          // Then remove the map
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (e) {
      console.error('Error initializing map:', e);
    }
  }, []);

  // Update displayed hospitals based on current date
  useEffect(() => {
    if (!mapRef.current || !hospitals.length || !mapLoaded) return;

    try {
      // Sort hospitals by deployment date
      const sortedHospitals = [...hospitals].sort((a, b) =>
        new Date(a.deploymentDate).getTime() - new Date(b.deploymentDate).getTime()
      );

      // Get date of the first hospital
      const firstHospitalDate = new Date(sortedHospitals[0].deploymentDate);
      const currentDateObj = new Date(currentDate);

      // Check if we are at the beginning of the animation
      const isStartOfAnimation = isFirstRenderRef.current ||
        currentDateObj.getTime() <= firstHospitalDate.getTime();

      // Get hospitals up to current date
      const hospitalsUpToCurrentDate = sortedHospitals
        .filter(h => new Date(h.deploymentDate) <= currentDateObj);

      // Convert hospitals to GeoJSON features
      const features = hospitalsUpToCurrentDate.map(h => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: h.coordinates
        },
        properties: {
          id: h.id,
          name: h.name,
          status: h.status,
          deploymentDate: h.deploymentDate
        }
      }));

      // Update source data
      const source = mapRef.current.getSource('hospitals') as mapboxgl.GeoJSONSource;
      if (source) {
        // Display only the first hospital at the beginning
        const displayFeatures = isStartOfAnimation ?
          [{ // Only first hospital
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: sortedHospitals[0].coordinates
            },
            properties: {
              id: sortedHospitals[0].id,
              name: sortedHospitals[0].name,
              status: sortedHospitals[0].status,
              deploymentDate: sortedHospitals[0].deploymentDate
            }
          }] :
          features;

        source.setData({
          type: 'FeatureCollection',
          features: displayFeatures
        });

        // Adjust view only on initial render
        if (isFirstRenderRef.current) {
          mapRef.current.fitBounds(franceBounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            duration: 0
          });
          isFirstRenderRef.current = false;
        }
      }
    } catch (e) {
      console.error('Error updating hospital points:', e);
    }

    return () => {
      if (mapRef.current) {
        const source = mapRef.current.getSource('hospitals') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: []
          });
        }
      }

      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, [currentDate, hospitals, mapLoaded]);

  // Nettoyer les écouteurs lors du démontage du composant
  useEffect(() => {
    return () => {
      // Nettoyage si nécessaire
    };
  }, []);

  return (
    <>
      <div
        ref={mapContainer}
        className={`relative w-full h-full ${className}`}
        style={{ position: 'relative', height: '100%' }}
        data-testid="map-container"
      />
      {/* Action Bar positioned to match timeline position */}
      <div className="absolute top-[190px] left-[clamp(350px,calc(330px+3vw),410px)] w-[calc(100%-clamp(370px,calc(350px+3vw),430px))] z-[9999]">
        <div className="relative w-full overflow-visible px-[2.5%]">
          <div className="absolute w-[calc(100%-120px)] left-[80px] flex justify-center">
            <div className="absolute w-full flex justify-center">
              <ActionBar className="!my-0" />
            </div>
          </div>
        </div>
      </div>
      {/* Author credit */}
      <div className="absolute bottom-[80px] left-[clamp(350px,calc(330px+3vw),410px)] w-[calc(100%-clamp(370px,calc(350px+3vw),430px))] z-[9999]">
        <div className="relative w-full overflow-visible px-[2.5%]">
          <div className="absolute w-[calc(100%-120px)] left-[80px] flex justify-center">
            <div className="border-2 border-[rgba(71,154,243,0.3)] rounded-lg px-6 py-2 bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] text-[#A1CBF9] text-[clamp(12px,0.9vw,14px)] transition-all duration-200 whitespace-nowrap">
              {_("Made with")} <span className="text-[#3b82f6]"> ♥ </span>{_("by")} BunnySweety
            </div>
          </div>
        </div>
      </div>
      
      {/* Version display */}
      <div className="absolute bottom-[80px] right-[80px] z-[9999]">
        <div className="relative w-full overflow-visible">
          <div className="absolute w-full flex justify-center">
            <div className="border-2 border-[rgba(71,154,243,0.3)] rounded-lg px-6 py-2 bg-[rgba(217,217,217,0.05)] backdrop-blur-[17.5px] text-[#A1CBF9] text-[clamp(12px,0.9vw,14px)] transition-all duration-200 whitespace-nowrap">
              {process.env.NEXT_PUBLIC_APP_VERSION || 'v1.0.0'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapComponent;