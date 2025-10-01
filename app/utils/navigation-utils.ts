// File: app/utils/navigation-utils.ts
import logger from './logger';

// Types pour la navigation
export interface NavigationOptions {
  coordinates: [number, number];
  hospitalName?: string;
  address?: string;
}

/**
 * Ouvre Google Maps avec directions vers les coordonnées données
 */
export function openDirections(coordinates: [number, number], hospitalName?: string): void {
  try {
    const [longitude, latitude] = coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    if (process.env.NODE_ENV === 'development') {
      logger.debug(
        `Opening directions to ${hospitalName ?? 'hospital'} at ${latitude},${longitude}`
      );
    }

    window.open(url, '_blank');
  } catch (error) {
    logger.error('Error opening directions:', error);
  }
}

/**
 * Partage la localisation de l'hôpital
 */
export async function shareLocation(
  coordinates: [number, number],
  hospitalName?: string,
  url?: string
): Promise<void> {
  try {
    const [longitude, latitude] = coordinates;
    const title = hospitalName ?? "Localisation d'hôpital";
    const text = hospitalName
      ? `Localisation: ${hospitalName}`
      : `Localisation: ${latitude}, ${longitude}`;

    if (navigator.share && url) {
      await navigator.share({
        title,
        text,
        url,
      });
    } else if (navigator.clipboard && url) {
      // Fallback vers le clipboard
      await navigator.clipboard.writeText(url);
      logger.info('Location URL copied to clipboard');
    } else {
      // Fallback final vers Google Maps
      openDirections(coordinates, hospitalName);
    }
  } catch (error) {
    logger.error('Error sharing location:', error);
    // En cas d'erreur, fallback vers Google Maps
    openDirections(coordinates, hospitalName);
  }
}

/**
 * Obtient la position actuelle de l'utilisateur
 */
export function getCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache position for 5 minutes
      }
    );
  });
}

/**
 * Calcule la distance entre deux points géographiques (en km)
 */
export function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Arrondi à 2 décimales
}
