// File: app/utils/mapHelpers.ts
import mapboxgl from 'mapbox-gl';
import { Hospital } from '../store/useMapStore';

/**
 * Creates a bounds object from an array of hospitals
 */
export function createBoundsFromHospitals(hospitals: Hospital[]): mapboxgl.LngLatBounds | null {
  if (!hospitals.length) return null;

  const bounds = new mapboxgl.LngLatBounds();
  
  hospitals.forEach(hospital => {
    bounds.extend(hospital.coordinates);
  });
  
  return bounds;
}

/**
 * Creates a custom marker element for a hospital
 */
export function createMarkerElement(hospital: Hospital): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'hospital-marker';
  el.style.width = '24px';
  el.style.height = '24px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = hospital.status === 'Deployed' ? '#36A2EB' : '#10b981';
  el.style.border = '2px solid white';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  el.style.transition = 'transform 0.2s ease';

  // Optional hover effect
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.2)';
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)';
  });

  return el;
}

/**
 * Gets the formatted date string
 */
export function formatDate(dateString: string, locale: string = 'en'): string {
  return new Date(dateString).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US');
}