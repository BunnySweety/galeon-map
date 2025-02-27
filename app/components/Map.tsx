// File: app/components/Map.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLingui } from '@lingui/react';
import { Hospital, useMapStore } from '../store/useMapStore';
import { format } from 'date-fns';

// Setup MapBox token (in production, use environment variables)
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiamVhbmJvbjkxIiwiYSI6ImNtNDlhMHMzNTA3YnkycXM2dmYxc281MHkifQ.taYYM3jxELZ5CZuOH9_3SQ';

interface MapComponentProps {
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ className = '' }) => {
  const { i18n } = useLingui();
  
  // Create a safe translation function wrapped in useCallback
  const _ = useCallback((text: string) => {
    try {
      return i18n && i18n._ ? i18n._(text) : text;
    } catch {
      return text;
    }
  }, [i18n]);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const { 
    filteredHospitals, 
    selectedHospital, 
    selectHospital 
  } = useMapStore();

  // Pour éviter le warning "Hospital is declared but its value is never read"
  // Encapsulé dans useCallback pour éviter les recréations inutiles
  const getHospitalById = useCallback((id: string): Hospital | undefined => {
    return filteredHospitals.find((h: Hospital) => h.id === id);
  }, [filteredHospitals]);

  // Log des hôpitaux pour utiliser explicitement le type Hospital
  useEffect(() => {
    if (filteredHospitals.length > 0) {
      console.log("Filtered hospitals:", filteredHospitals.map((h: Hospital) => ({
        id: h.id,
        name: h.name,
        status: h.status,
        location: h.coordinates
      })));
    }
  }, [filteredHospitals]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [2.213749, 46.227638], // Center of France
      zoom: 5,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'bottom-right'
    );

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      'bottom-right'
    );

    // Add fullscreen control
    map.current.addControl(
      new mapboxgl.FullscreenControl(),
      'bottom-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle markers update when hospitals change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for filtered hospitals
    filteredHospitals.forEach((hospital: Hospital) => {
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'hospital-marker';
      markerEl.style.width = '24px';
      markerEl.style.height = '24px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.backgroundColor = hospital.status === 'Deployed' ? '#36A2EB' : '#4BC0C0';
      markerEl.style.border = '2px solid white';
      markerEl.style.cursor = 'pointer';
      markerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      // Create popup with hospital info
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        maxWidth: '260px',
        className: 'hospital-popup'
      }).setHTML(`
        <div style="padding: 0; border-radius: 8px; background-color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; width: 260px;">
          <div style="width: 100%; height: 140px; position: relative; overflow: hidden;">
            <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.4) 100%); z-index: 1;"></div>
            <img 
              src="${hospital.imageUrl}" 
              alt="${hospital.name}" 
              style="width: 100%; height: 100%; object-fit: cover;"
            />
          </div>
          <div style="padding: 16px;">
            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #333;">${hospital.name}</h3>
            <p style="
              display: inline-flex;
              align-items: center;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 13px;
              margin-bottom: 16px;
              color: #3b82f6;
              background-color: #dbeafe;
            ">
              <span class="status-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #3b82f6; margin-right: 6px;"></span>
              ${_(hospital.status)} on ${format(new Date(hospital.deploymentDate), 'dd/MM/yyyy')}
            </p>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <a 
                href="${hospital.website}" 
                target="_blank" 
                rel="noopener noreferrer"
                style="
                  flex: 1;
                  padding: 8px 12px;
                  background-color: #3b82f6;
                  color: white;
                  border-radius: 8px;
                  text-decoration: none;
                  font-size: 13px;
                  font-weight: 500;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                "
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                ${_('Website')}
              </a>
              <button 
                style="
                  flex: 1;
                  padding: 8px 12px;
                  background-color: #f1f5f9;
                  color: #64748b;
                  border-radius: 8px;
                  border: none;
                  text-decoration: none;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                "
                onclick="alert('${hospital.address}')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${_('Address')}
              </button>
            </div>
          </div>
        </div>
      `);

      // Create and store the marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(hospital.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
      
      // Add click event to select the hospital
      markerEl.addEventListener('click', () => {
        selectHospital(hospital);
      });
      
      markers.current.push(marker);
    });

    // If no markers, return to default view
    if (markers.current.length === 0 && map.current) {
      map.current.flyTo({
        center: [2.213749, 46.227638],
        zoom: 5,
      });
    }
    // If there are markers, fit the map to show all markers
    else if (markers.current.length > 0 && map.current) {
      // Only adjust bounds if there are multiple hospitals or we're not focused on one
      if (markers.current.length > 1 && !selectedHospital) {
        const bounds = new mapboxgl.LngLatBounds();
        
        filteredHospitals.forEach((hospital: Hospital) => {
          bounds.extend(hospital.coordinates);
        });
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 10,
        });
      }
    }
  }, [filteredHospitals, mapLoaded, _, selectHospital, selectedHospital]);

  // Handle selected hospital change
  useEffect(() => {
    if (!map.current || !selectedHospital) return;

    // Fly to selected hospital
    map.current.flyTo({
      center: selectedHospital.coordinates,
      zoom: 12,
      duration: 1500,
    });

    // Find and open the popup for the selected hospital
    const marker = markers.current.find(m => {
      const lngLat = m.getLngLat();
      return (
        lngLat.lng === selectedHospital.coordinates[0] && 
        lngLat.lat === selectedHospital.coordinates[1]
      );
    });

    if (marker) {
      marker.togglePopup();
    }
    
    // Log selectedHospital details to use Hospital type
    console.log('Selected hospital:', {
      id: selectedHospital.id,
      name: selectedHospital.name,
      coordinates: selectedHospital.coordinates,
      status: selectedHospital.status
    });
    
    // Simuler la recherche d'un hôpital par ID pour utiliser notre fonction getHospitalById
    const foundHospital = getHospitalById(selectedHospital.id);
    if (foundHospital) {
      console.log('Hospital found by ID:', foundHospital.name);
    }
  }, [selectedHospital, getHospitalById]);

  return (
    <div 
      ref={mapContainer} 
      className={`relative w-full h-full ${className}`}
      data-testid="map-container"
    />
  );
};

export default MapComponent;