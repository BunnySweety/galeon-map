import L from 'leaflet';
import { Hospital } from '@/types/hospital';
import { MapBounds } from '@/types/map';

// Map configuration
export const MAP_CONFIG = {
  defaultCenter: [46.603354, 1.888334] as [number, number],
  defaultZoom: 6,
  minZoom: 3,
  maxZoom: 18,
  tileLayer: {
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '©OpenStreetMap, ©CartoDB'
  },
  cluster: {
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  }
};

// Marker styles by status
export const MARKER_STYLES = {
  Deployed: {
    color: '#4CAF50',
    fillColor: '#4CAF50',
    fillOpacity: 0.8,
    radius: 8
  },
  'In Progress': {
    color: '#FFA500',
    fillColor: '#FFA500',
    fillOpacity: 0.8,
    radius: 8
  },
  Signed: {
    color: '#2196F3',
    fillColor: '#2196F3',
    fillOpacity: 0.8,
    radius: 8
  }
};

// Map utility functions
export const createMarker = (hospital: Hospital): L.CircleMarker => {
  const marker = L.circleMarker(
    [hospital.lat, hospital.lon],
    MARKER_STYLES[hospital.status]
  );

  marker.bindPopup(createPopupContent(hospital));
  marker.bindTooltip(hospital.name);

  return marker;
};

export const createCluster = (): L.MarkerClusterGroup => {
  return L.markerClusterGroup({
    ...MAP_CONFIG.cluster,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      let size = 'small';

      if (count > 100) size = 'large';
      else if (count > 10) size = 'medium';

      return L.divIcon({
        html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
        className: `marker-cluster marker-cluster-${size}`,
        iconSize: L.point(40, 40)
      });
    }
  });
};

export const fitBounds = (map: L.Map, bounds: MapBounds): void => {
  map.fitBounds([
    [bounds.south, bounds.west],
    [bounds.north, bounds.east]
  ], {
    padding: [50, 50],
    maxZoom: 12,
    animate: true
  });
};

export const isInBounds = (hospital: Hospital, bounds: MapBounds): boolean => {
  return hospital.lat >= bounds.south &&
         hospital.lat <= bounds.north &&
         hospital.lon >= bounds.west &&
         hospital.lon <= bounds.east;
};

// Helper functions
const createPopupContent = (hospital: Hospital): string => {
  return `
    <div class="hospital-popup">
      <h3 class="text-lg font-semibold">${hospital.name}</h3>
      <p class="text-sm text-gray-600">${hospital.address}</p>
      ${hospital.website ? `
        <a href="${hospital.website}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Visit Website
        </a>
      ` : ''}
      <div class="mt-2">
        <span class="status-badge status-${hospital.status.toLowerCase()}">
          ${hospital.status}
        </span>
      </div>
    </div>
  `;
};

export const getMapCenter = (hospitals: Hospital[]): [number, number] => {
  if (!hospitals.length) return MAP_CONFIG.defaultCenter;

  const lats = hospitals.map(h => h.lat);
  const lons = hospitals.map(h => h.lon);

  return [
    (Math.max(...lats) + Math.min(...lats)) / 2,
    (Math.max(...lons) + Math.min(...lons)) / 2
  ];
};

export const calculateBounds = (hospitals: Hospital[]): MapBounds => {
  if (!hospitals.length) return {
    north: 71,
    south: 35,
    east: 40,
    west: -10
  };

  return {
    north: Math.max(...hospitals.map(h => h.lat)),
    south: Math.min(...hospitals.map(h => h.lat)),
    east: Math.max(...hospitals.map(h => h.lon)),
    west: Math.min(...hospitals.map(h => h.lon))
  };
};