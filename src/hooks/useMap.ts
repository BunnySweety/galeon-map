import { useCallback, useEffect, useState } from 'react';
import L from 'leaflet';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectFilteredHospitals } from '@/store/selectors/hospitalSelectors';
import { setMapBounds, setMapZoom } from '@/store/slices/mapSlice';
import { Hospital } from '@/types/hospital';
import { MapConfig } from '@/types/map';

const DEFAULT_CONFIG: MapConfig = {
  center: [46.603354, 1.888334],
  zoom: 6,
  maxZoom: 18,
  minZoom: 3,
  zoomControl: false
};

export const useMap = () => {
  const dispatch = useAppDispatch();
  const hospitals = useAppSelector(selectFilteredHospitals);
  const [map, setMap] = useState<L.Map | null>(null);
  const [clusterGroup, setClusterGroup] = useState<L.MarkerClusterGroup | null>(null);

  const createMarker = useCallback((hospital: Hospital) => {
    const marker = L.circleMarker([hospital.lat, hospital.lon], {
      radius: 8,
      fillColor: getStatusColor(hospital.status),
      color: '#FFFFFF',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });

    // Add popup
    marker.bindPopup(() => {
      const popupContent = document.createElement('div');
      popupContent.className = 'hospital-popup';
      popupContent.innerHTML = `
        <h3 class="font-semibold">${hospital.name}</h3>
        <p class="text-sm text-gray-600">${hospital.address}</p>
        <div class="mt-2">
          <a href="${hospital.website}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="text-blue-600 hover:underline text-sm">
            Visit Website
          </a>
        </div>
      `;
      return popupContent;
    });

    return marker;
  }, []);

  const initializeMap = useCallback((element: HTMLElement) => {
    const newMap = L.map(element, DEFAULT_CONFIG);
    
    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©CartoDB',
      maxZoom: DEFAULT_CONFIG.maxZoom
    }).addTo(newMap);

    // Add cluster group
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });

    newMap.addLayer(cluster);
    setMap(newMap);
    setClusterGroup(cluster);

    // Add event listeners
    newMap.on('zoomend', () => {
      dispatch(setMapZoom(newMap.getZoom()));
    });

    newMap.on('moveend', () => {
      const bounds = newMap.getBounds();
      dispatch(setMapBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      }));
    });

    return () => {
      newMap.remove();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!map || !clusterGroup || !hospitals.length) return;

    // Clear existing markers
    clusterGroup.clearLayers();

    // Add new markers
    const markers = hospitals.map(createMarker);
    clusterGroup.addLayers(markers);

    // Fit bounds if needed
    const bounds = L.latLngBounds(hospitals.map(h => [h.lat, h.lon]));
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [map, clusterGroup, hospitals, createMarker]);

  return {
    map,
    clusterGroup,
    createMarker,
    initializeMap,
    mapConfig: DEFAULT_CONFIG
  };
};

// Helper function to get color based on hospital status
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Deployed':
      return '#10B981'; // green-500
    case 'In Progress':
      return '#F59E0B'; // yellow-500
    case 'Signed':
      return '#3B82F6'; // blue-500
    default:
      return '#6B7280'; // gray-500
  }
};

export default useMap;