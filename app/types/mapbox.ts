// File: app/types/mapbox.ts
// Type definitions for Mapbox GL JS to replace 'any' types

// Simplified types to avoid conflicts with actual Mapbox GL types
export type MapboxMap = any;
export type MapboxGLInstance = any;
export type MapboxMarker = any;
export type MapboxPopup = any;

export interface MapboxGeoJSONSource {
  setData(data: any): void;
}

export interface MapboxEvent {
  features?: Array<{
    geometry: GeoJSON.Point;
    properties?: Record<string, any>;
  }>;
}

export type GeolocationPosition = {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
  };
  timestamp: number;
};

export type GeolocationError = {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
};

export interface MapboxLayer {
  id: string;
  type: string;
  source?: string;
  paint?: Record<string, any>;
  layout?: Record<string, any>;
}

export interface MapboxStyle {
  layers?: MapboxLayer[];
  sources?: Record<string, any>;
}
