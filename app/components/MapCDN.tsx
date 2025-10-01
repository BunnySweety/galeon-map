'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMapStore } from '../store/useMapStore';
import logger from '../utils/logger';
import HospitalDetail from './HospitalDetail';
import MapboxCDN from './MapboxCDN';

interface MapCDNProps {
  className?: string;
}

// Internal component that receives mapboxgl
function MapContent({ mapboxgl, className }: { mapboxgl: any; className: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const { filteredHospitals, selectedHospital, selectHospital } = useMapStore();

  // Initialize map with CDN Mapbox
  const initializeMap = useCallback(() => {
    if (!mapContainer.current || map.current || !mapboxgl) return;

    try {
      // Set access token
      mapboxgl.accessToken =
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ??
        'pk.eyJ1IjoiamVhbmJvbjkxIiwiYSI6ImNtNDlhMHMzNTA3YnkycXM2dmYxc281MHkifQ.taYYM3jxELZ5CZuOH9_3SQ';

      // Create map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [2.3522, 48.8566], // Paris center
        zoom: 5,
        attributionControl: false,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Map ready event
      map.current.on('load', () => {
        setIsMapReady(true);
        logger.debug('Map loaded successfully via CDN');
      });

      // Error handling
      map.current.on('error', (e: any) => {
        logger.error('Map error:', e);
      });
    } catch (error) {
      logger.error('Failed to initialize map:', error);
    }
  }, [mapboxgl]);

  // Initialize map when mapboxgl is available
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Update markers when hospitals change
  useEffect(() => {
    if (!map.current || !isMapReady || !mapboxgl) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredHospitals.forEach(hospital => {
      try {
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'hospital-marker';
        markerEl.style.width = '20px';
        markerEl.style.height = '20px';
        markerEl.style.borderRadius = '50%';
        markerEl.style.backgroundColor = hospital.status === 'Deployed' ? '#3b82f6' : '#10b981';
        markerEl.style.border = '2px solid white';
        markerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        markerEl.style.cursor = 'pointer';

        // Add click handler
        markerEl.addEventListener('click', () => {
          selectHospital(hospital);
        });

        // Create and add marker
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(hospital.coordinates)
          .addTo(map.current);

        markersRef.current.push(marker);
      } catch (error) {
        logger.error(`Failed to create marker for hospital ${hospital.id}:`, error);
      }
    });
  }, [filteredHospitals, isMapReady, selectHospital, mapboxgl]);

  // Fly to selected hospital
  useEffect(() => {
    if (!map.current || !selectedHospital || !isMapReady) return;

    try {
      map.current.flyTo({
        center: selectedHospital.coordinates,
        zoom: 12,
        duration: 1000,
      });
    } catch (error) {
      logger.error('Failed to fly to hospital:', error);
    }
  }, [selectedHospital, isMapReady]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative h-full ${className}`}>
      <div ref={mapContainer} className="h-full w-full" />

      {/* Hospital detail overlay */}
      {selectedHospital && (
        <div className="absolute top-4 left-4 z-10 max-w-sm">
          <HospitalDetail hospital={selectedHospital} />
        </div>
      )}
    </div>
  );
}

export default function MapCDN({ className = '' }: MapCDNProps) {
  return (
    <MapboxCDN
      fallback={
        <div className={`h-full bg-slate-900 flex items-center justify-center ${className}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Loading Map</h2>
            <p className="text-gray-300">Initializing Mapbox via CDN...</p>
          </div>
        </div>
      }
    >
      {mapboxgl => <MapContent mapboxgl={mapboxgl} className={className} />}
    </MapboxCDN>
  );
}
