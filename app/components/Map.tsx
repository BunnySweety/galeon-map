// File: app/components/Map.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLingui } from '@lingui/react';
import { useMapStore } from '../store/useMapStore';
import { useGeolocation } from '../hooks/useGeolocation';

// Configuration RTL globale pour éviter les appels multiples
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
  const { 
    latitude, 
    longitude, 
    getPosition 
  } = useGeolocation();
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const locationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [showLocationRadar, setShowLocationRadar] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  
  const {
    filteredHospitals,
    currentDate,
    selectHospital
  } = useMapStore();

  // Create custom control button styles
  const createControlButton = (svgContent: string, onClick: () => void) => {
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

    // Scale SVG responsively
    const svg = button.querySelector('svg');
    if (svg) {
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.padding = '0';
    }

    // Add hover effect
    button.onmouseenter = () => {
      button.style.background = 'rgba(217, 217, 217, 0.1)';
      button.style.border = '1.95px solid rgba(255, 255, 255, 0.25)';
    };
    button.onmouseleave = () => {
      button.style.background = 'rgba(217, 217, 217, 0.05)';
      button.style.border = '1.95px solid rgba(255, 255, 255, 0.15)';
    };

    return button;
  };

  // Create footer element
  const createFooter = () => {
    const footer = document.createElement('div');
    footer.style.position = 'absolute';
    footer.style.bottom = '20px';
    footer.style.left = '0';
    footer.style.right = '0';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.alignItems = 'center';
    footer.style.padding = '0 20px';
    footer.style.zIndex = '10';

    // Create author credit
    const authorCredit = document.createElement('div');
    authorCredit.style.position = 'absolute';
    authorCredit.style.left = '50%';
    authorCredit.style.transform = 'translateX(-50%)';
    authorCredit.style.background = 'rgba(217, 217, 217, 0.05)';
    authorCredit.style.border = '1.95px solid rgba(255, 255, 255, 0.15)';
    authorCredit.style.backdropFilter = 'blur(17.5px)';
    authorCredit.style.borderRadius = '16px';
    authorCredit.style.padding = '8px 16px';
    authorCredit.innerHTML = 'Made with <span style="color: #3b82f6;">♥</span> by BunnySweety';
    authorCredit.style.color = 'white';
    authorCredit.style.fontSize = 'clamp(12px, 1.2vw, 14px)';

    // Add hover effect to author credit
    authorCredit.onmouseenter = () => {
      authorCredit.style.background = 'rgba(217, 217, 217, 0.1)';
      authorCredit.style.border = '1.95px solid rgba(255, 255, 255, 0.25)';
    };
    authorCredit.onmouseleave = () => {
      authorCredit.style.background = 'rgba(217, 217, 217, 0.05)';
      authorCredit.style.border = '1.95px solid rgba(255, 255, 255, 0.15)';
    };

    // Create version display
    const version = document.createElement('div');
    version.style.marginLeft = 'auto';
    version.style.background = 'rgba(217, 217, 217, 0.05)';
    version.style.border = '1.95px solid rgba(255, 255, 255, 0.15)';
    version.style.backdropFilter = 'blur(17.5px)';
    version.style.borderRadius = '16px';
    version.style.padding = '8px 16px';
    version.textContent = process.env.NEXT_PUBLIC_APP_VERSION || 'v1.0.0';
    version.style.color = 'white';
    version.style.fontSize = 'clamp(12px, 1.2vw, 14px)';

    // Add hover effect to version
    version.onmouseenter = () => {
      version.style.background = 'rgba(217, 217, 217, 0.1)';
      version.style.border = '1.95px solid rgba(255, 255, 255, 0.25)';
    };
    version.onmouseleave = () => {
      version.style.background = 'rgba(217, 217, 217, 0.05)';
      version.style.border = '1.95px solid rgba(255, 255, 255, 0.15)';
    };

    footer.appendChild(authorCredit);
    footer.appendChild(version);

    return footer;
  };

  // Create radar effect marker
  const createRadarLocationMarker = useCallback(() => {
    if (!map.current || !latitude || !longitude) return;

    // Remove existing location marker
    if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
    }

    // Create marker element with radar effect
    const markerEl = document.createElement('div');
    markerEl.style.position = 'relative';
    markerEl.style.width = '20px';
    markerEl.style.height = '20px';

    // Radar pulse layers
    const pulseLayer1 = document.createElement('div');
    const pulseLayer2 = document.createElement('div');
    const centerDot = document.createElement('div');

    [pulseLayer1, pulseLayer2].forEach(layer => {
      layer.style.position = 'absolute';
      layer.style.top = '50%';
      layer.style.left = '50%';
      layer.style.transform = 'translate(-50%, -50%)';
      layer.style.borderRadius = '50%';
      layer.style.border = '2px solid #3b82f6';
      layer.style.animation = 'radar-pulse 2s infinite';
      layer.style.opacity = '0.7';
    });

    pulseLayer1.style.animationDelay = '0s';
    pulseLayer2.style.animationDelay = '1s';

    centerDot.style.position = 'absolute';
    centerDot.style.top = '50%';
    centerDot.style.left = '50%';
    centerDot.style.transform = 'translate(-50%, -50%)';
    centerDot.style.width = '10px';
    centerDot.style.height = '10px';
    centerDot.style.borderRadius = '50%';
    centerDot.style.backgroundColor = '#3b82f6';

    markerEl.appendChild(pulseLayer1);
    markerEl.appendChild(pulseLayer2);
    markerEl.appendChild(centerDot);

    // Add global keyframe animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes radar-pulse {
        0% {
          width: 0;
          height: 0;
          opacity: 0.7;
        }
        100% {
          width: 40px;
          height: 40px;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Create and add marker
    const marker = new mapboxgl.Marker({
      element: markerEl,
      anchor: 'center'
    })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    locationMarkerRef.current = marker;
  }, [map, latitude, longitude]);

  // Handle location button click
  const handleLocationClick = useCallback(() => {
    setIsTrackingLocation(prev => !prev);
    if (!isTrackingLocation) {
      getPosition();
      setShowLocationRadar(true);
    } else if (locationMarkerRef.current) {
      locationMarkerRef.current.remove();
      locationMarkerRef.current = null;
      setShowLocationRadar(false);
    }
  }, [isTrackingLocation, getPosition]);

  // Update location marker when coordinates change
  useEffect(() => {
    if (showLocationRadar) {
      createRadarLocationMarker();
    }
  }, [showLocationRadar, createRadarLocationMarker]);

  useEffect(() => {
    if (map.current && isTrackingLocation) {
      handleLocationClick();
    }
  }, [map, handleLocationClick, isTrackingLocation]);

  // Create markers for hospitals
  useEffect(() => {
    if (!map.current || !filteredHospitals) return;

    // Remove existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Add new markers
    filteredHospitals.forEach(hospital => {
      const el = document.createElement('div');
      el.className = 'hospital-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundImage = 'url(/images/hospital-marker.svg)';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'hospital-popup'
      }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${hospital.name}</h3>
          <p class="text-sm">${hospital.address}</p>
        </div>
      `);

      // Create and add marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat(hospital.coordinates)
        .setPopup(popup);
      
      if (map.current) {
        marker.addTo(map.current);
      }

      // Add click handler
      el.addEventListener('click', () => {
        selectHospital(hospital);
      });
    });
  }, [filteredHospitals, currentDate, selectHospital]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [2.213749, 46.227638], // Center of France
        zoom: 5,
        attributionControl: false,
        touchZoomRotate: true,
        dragRotate: true,
        touchPitch: true,
        interactive: true,
        preserveDrawingBuffer: true,
        antialias: true
      });

      // Create full-screen control
      const fullscreenControl = createControlButton(`
        <svg width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask id="path-1-inside-1_0_1754" fill="white">
          <path d="M0 49C0 57.8366 7.16344 65 16 65H49C57.8366 65 65 57.8366 65 49V16C65 7.16344 57.8366 0 49 0H16C7.16344 0 0 7.16344 0 16V49Z"/>
          </mask>
          <path d="M0 49C0 57.8366 7.16344 65 16 65H49C57.8366 65 65 57.8366 65 49V16C65 7.16344 57.8366 0 49 0H16C7.16344 0 0 7.16344 0 16V49Z" fill="#D9D9D9" fill-opacity="0.05"/>
          <path d="M16 63.05H49V66.95H16V63.05ZM63.05 49V16H66.95V49H63.05ZM49 1.95H16V-1.95H49V1.95ZM1.95 16V49H-1.95V16H1.95ZM16 1.95C8.2404 1.95 1.95 8.2404 1.95 16H-1.95C-1.95 6.08649 6.08649 -1.95 16 -1.95V1.95ZM63.05 16C63.05 8.2404 56.7596 1.95 49 1.95V-1.95C58.9135 -1.95 66.95 6.08649 66.95 16H63.05ZM49 63.05C56.7596 63.05 63.05 56.7596 63.05 49H66.95C66.95 58.9135 58.9135 66.95 49 66.95V63.05ZM16 66.95C6.08649 66.95 -1.95 58.9135 -1.95 49H1.95C1.95 56.7596 8.2404 63.05 16 63.05V66.95Z" fill="white" fill-opacity="0.15" mask="url(#path-1-inside-1_0_1754)"/>
          <path d="M30.8844 34.1156C31.0006 34.2317 31.0928 34.3696 31.1557 34.5213C31.2186 34.6731 31.251 34.8357 31.251 35C31.251 35.1643 31.2186 35.3269 31.1557 35.4787C31.0928 35.6304 31.0006 35.7683 30.8844 35.8844L25.5172 41.25L28.3844 44.1156C28.5594 44.2904 28.6786 44.5133 28.7269 44.7559C28.7752 44.9985 28.7505 45.25 28.6558 45.4785C28.5611 45.707 28.4007 45.9023 28.195 46.0397C27.9892 46.177 27.7474 46.2502 27.5 46.25H20C19.6685 46.25 19.3505 46.1183 19.1161 45.8839C18.8817 45.6495 18.75 45.3315 18.75 45V37.5C18.7498 37.2526 18.823 37.0108 18.9603 36.805C19.0977 36.5993 19.293 36.4389 19.5215 36.3442C19.75 36.2495 20.0015 36.2248 20.2441 36.2731C20.4867 36.3214 20.7096 36.4406 20.8844 36.6156L23.75 39.4828L29.1156 34.1156C29.2317 33.9994 29.3696 33.9072 29.5213 33.8443C29.6731 33.7814 29.8357 33.749 30 33.749C30.1643 33.749 30.3269 33.7814 30.4787 33.8443C30.6304 33.9072 30.7683 33.9994 30.8844 34.1156ZM45 18.75H37.5C37.2526 18.7498 37.0108 18.823 36.805 18.9603C36.5993 19.0977 36.4389 19.293 36.3442 19.5215C36.2495 19.75 36.2248 20.0015 36.2731 20.2441C36.3214 20.4867 36.4406 20.7096 36.6156 20.8844L39.4828 23.75L34.1156 29.1156C33.8811 29.3502 33.7493 29.6683 33.7493 30C33.7493 30.3317 33.8811 30.6498 34.1156 30.8844C34.3502 31.1189 34.6683 31.2507 35 31.2507C35.3317 31.2507 35.6498 31.1189 35.8844 30.8844L41.25 25.5172L44.1156 28.3844C44.2904 28.5594 44.5133 28.6786 44.7559 28.7269C44.9985 28.7752 45.25 28.7505 45.4785 28.6558C45.707 28.5611 45.9023 28.4007 46.0397 28.195C46.177 27.9892 46.2502 27.7474 46.25 27.5V20C46.25 19.6685 46.1183 19.3505 45.8839 19.1161C45.6495 18.8817 45.3315 18.75 45 18.75Z" fill="#479AF3"/>
        </svg>
      `, handleLocationClick);

      // Create location control
      const locationControl = createControlButton(`
        <svg width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask id="path-1-inside-1_0_1751" fill="white">
          <path d="M0 49C0 57.8366 7.16344 65 16 65H49C57.8366 65 65 57.8366 65 49V16C65 7.16344 57.8366 0 49 0H16C7.16344 0 0 7.16344 0 16V49Z"/>
          </mask>
          <path d="M0 49C0 57.8366 7.16344 65 16 65H49C57.8366 65 65 57.8366 65 49V16C65 7.16344 57.8366 0 49 0H16C7.16344 0 0 7.16344 0 16V49Z" fill="#D9D9D9" fill-opacity="0.05"/>
          <path d="M16 63.05H49V66.95H16V63.05ZM63.05 49V16H66.95V49H63.05ZM49 1.95H16V-1.95H49V1.95ZM1.95 16V49H-1.95V16H1.95ZM16 1.95C8.2404 1.95 1.95 8.2404 1.95 16H-1.95C-1.95 6.08649 6.08649 -1.95 16 -1.95V1.95ZM63.05 16C63.05 8.2404 56.7596 1.95 49 1.95V-1.95C58.9135 -1.95 66.95 6.08649 66.95 16H63.05ZM49 63.05C56.7596 63.05 63.05 56.7596 63.05 49H66.95C66.95 58.9135 58.9135 66.95 49 66.95V63.05ZM16 66.95C6.08649 66.95 -1.95 58.9135 -1.95 49H1.95C1.95 56.7596 8.2404 63.05 16 63.05V66.95Z" fill="white" fill-opacity="0.15" mask="url(#path-1-inside-1_0_1751)"/>
          <path d="M50 31.25H46.1922C45.8959 28.0502 44.4899 25.0547 42.2176 22.7824C39.9453 20.5101 36.9498 19.1041 33.75 18.8078V15C33.75 14.6685 33.6183 14.3505 33.3839 14.1161C33.1495 13.8817 32.8315 13.75 32.5 13.75C32.1685 13.75 31.8505 13.8817 31.6161 14.1161C31.3817 14.3505 31.25 14.6685 31.25 15V18.8078C28.0502 19.1041 25.0547 20.5101 22.7824 22.7824C20.5101 25.0547 19.1041 28.0502 18.8078 31.25H15C14.6685 31.25 14.3505 31.3817 14.1161 31.6161C13.8817 31.8505 13.75 32.1685 13.75 32.5C13.75 32.8315 13.8817 33.1495 14.1161 33.3839C14.3505 33.6183 14.6685 33.75 15 33.75H18.8078C19.1041 36.9498 20.5101 39.9453 22.7824 42.2176C25.0547 44.4899 28.0502 45.8959 31.25 46.1922V50C31.25 50.3315 31.3817 50.6495 31.6161 50.8839C31.8505 51.1183 32.1685 51.25 32.5 51.25C32.8315 51.25 33.1495 51.1183 33.3839 50.8839C33.6183 50.6495 33.75 50.3315 33.75 50V46.1922C36.9498 45.8959 39.9453 44.4899 42.2176 42.2176C44.4899 39.9453 45.8959 36.9498 46.1922 33.75H50C50.3315 33.75 50.6495 33.6183 50.8839 33.3839C51.1183 33.1495 51.25 32.8315 51.25 32.5C51.25 32.1685 51.1183 31.8505 50.8839 31.6161C50.6495 31.3817 50.3315 31.25 50 31.25ZM32.5 43.75C30.275 43.75 28.0999 43.0902 26.2498 41.854C24.3998 40.6179 22.9578 38.8609 22.1064 36.8052C21.2549 34.7495 21.0321 32.4875 21.4662 30.3052C21.9002 28.1229 22.9717 26.1184 24.545 24.545C26.1184 22.9717 28.1229 21.9002 30.3052 21.4662C32.4875 21.0321 34.7495 21.2549 36.8052 22.1064C38.8609 22.9578 40.6179 24.3998 41.854 26.2498C43.0902 28.0999 43.75 30.275 43.75 32.5C43.7467 35.4827 42.5604 38.3422 40.4513 40.4513C38.3422 42.5604 35.4827 43.7467 32.5 43.75ZM38.75 32.5C38.75 33.7361 38.3834 34.9445 37.6967 35.9723C37.0099 37.0001 36.0338 37.8012 34.8918 38.2742C33.7497 38.7473 32.4931 38.8711 31.2807 38.6299C30.0683 38.3888 28.9547 37.7935 28.0806 36.9194C27.2065 36.0453 26.6112 34.9317 26.3701 33.7193C26.1289 32.5069 26.2527 31.2503 26.7258 30.1082C27.1988 28.9662 27.9999 27.9901 29.0277 27.3033C30.0555 26.6166 31.2639 26.25 32.5 26.25C34.1576 26.25 35.7473 26.9085 36.9194 28.0806C38.0915 29.2527 38.75 30.8424 38.75 32.5Z" fill="#479AF3"/>
        </svg>
      `, handleLocationClick);

      // Custom control container
      const controlContainer = document.createElement('div');
      controlContainer.style.position = 'absolute';
      controlContainer.style.top = '96px';
      controlContainer.style.right = '20px';
      controlContainer.style.zIndex = '10';
      controlContainer.style.display = 'flex';
      controlContainer.style.flexDirection = 'column';
      
      // Add controls to container
      controlContainer.appendChild(fullscreenControl);
      controlContainer.appendChild(locationControl);

      // Add custom container to map
      map.current.getContainer().appendChild(controlContainer);

      // Add footer to map
      map.current.getContainer().appendChild(createFooter());

      // Cleanup on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (e) {
      console.error('Error initializing map:', e);
    }
  }, [getPosition, handleLocationClick]);

  return (
    <div 
      ref={mapContainer} 
      className={`relative w-full h-full ${className}`}
      style={{ position: 'relative', height: '100%' }}
      data-testid="map-container"
    />
  );
};

export default MapComponent;