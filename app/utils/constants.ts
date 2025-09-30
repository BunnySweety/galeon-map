// File: app/utils/constants.ts
/**
 * Application-wide constants
 * Centralizes all magic numbers and configuration values
 */

// ===== LAYOUT DIMENSIONS =====
export const LAYOUT = {
  SIDEBAR_WIDTH: 320,
  SIDEBAR_WIDTH_MOBILE: 280,
  TIMELINE_HEIGHT: 52,
  MAP_CONTROLS_OFFSET: 10,
  HEADER_HEIGHT: 64,
  ACTION_BAR_HEIGHT: 60,
  MOBILE_BREAKPOINT: 768,
} as const;

// ===== TIMING CONSTANTS =====
export const TIMING = {
  INITIALIZATION_DELAY: 500,
  RETRY_DELAY: 2000,
  TOAST_DURATION: 3000,
  DEBOUNCE_SEARCH: 300,
  ANIMATION_DURATION: 300,
  TIMELINE_STEP_DELAY: 1000,
  MAP_FLY_DURATION: 2000,
} as const;

// ===== RATE LIMITS =====
export const LIMITS = {
  EXPORT_PER_MINUTE: 5,
  API_REQUESTS_PER_MINUTE: 100,
  MAX_SEARCH_LENGTH: 100,
  MAX_HOSPITALS_DISPLAY: 1000,
  MAX_TIMELINE_SPEED: 3,
  MIN_TIMELINE_SPEED: 0.5,
} as const;

// ===== Z-INDEX HIERARCHY =====
export const Z_INDEX = {
  BASE: 0,
  SIDEBAR: 10,
  TIMELINE: 20,
  ACTION_BAR: 30,
  MAP_CONTROLS: 40,
  MODAL: 50,
  TOOLTIP: 60,
  NOTIFICATION: 70,
  MAX: 9999,
} as const;

// ===== MAP CONFIGURATION =====
export const MAP = {
  DEFAULT_CENTER: [2.3522, 46.2276] as [number, number], // France center
  DEFAULT_ZOOM: 6,
  MIN_ZOOM: 4,
  MAX_ZOOM: 18,
  MARKER_SIZE: 30,
  CLUSTER_RADIUS: 50,
  FLY_DURATION: 2000,
  ANIMATION_EASE: 'easeInOutQuad',
} as const;

// ===== EXPORT CONFIGURATION =====
export const EXPORT = {
  PDF_PAGE_SIZE: 'a4',
  PDF_ORIENTATION: 'portrait',
  PDF_MARGIN: 10,
  CSV_SEPARATOR: ',',
  CSV_ENCODING: 'utf-8',
  JSON_INDENT: 2,
  MAX_FILE_SIZE_MB: 10,
} as const;

// ===== COLORS =====
export const COLORS = {
  PRIMARY: '#3b82f6',
  PRIMARY_DARK: '#2563eb',
  PRIMARY_LIGHT: '#60a5fa',
  DEPLOYED: '#10b981',
  SIGNED: '#f59e0b',
  ERROR: '#ef4444',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
} as const;

// ===== ANIMATION EASINGS =====
export const EASINGS = {
  LINEAR: 'linear',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  EASE_IN_QUAD: 'easeInQuad',
  EASE_OUT_QUAD: 'easeOutQuad',
  EASE_IN_OUT_QUAD: 'easeInOutQuad',
} as const;

// ===== API ENDPOINTS =====
export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  HOSPITALS: '/api/hospitals',
  HOSPITAL_BY_ID: (id: string) => `/api/hospitals/${id}`,
  ANALYTICS: '/api/analytics',
} as const;

// ===== LOCAL STORAGE KEYS =====
export const STORAGE_KEYS = {
  LANGUAGE: 'hospital-map-language',
  THEME: 'hospital-map-theme',
  FILTERS: 'hospital-map-filters',
  MAP_STATE: 'hospital-map-state',
  LAST_VISIT: 'hospital-map-last-visit',
} as const;

// ===== BREAKPOINTS (sync with Tailwind) =====
export const BREAKPOINTS = {
  XS: 375,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// ===== SUPPORTED LANGUAGES =====
export const LANGUAGES = {
  EN: 'en',
  FR: 'fr',
} as const;

export const DEFAULT_LANGUAGE = LANGUAGES.EN;

// ===== DATE FORMATS =====
export const DATE_FORMATS = {
  ISO: 'yyyy-MM-dd',
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_LONG: 'dd MMMM yyyy',
  DISPLAY_SHORT: 'dd/MM',
  API: 'yyyy-MM-dd',
} as const;

// ===== ERROR MESSAGES =====
export const ERRORS = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'Unauthorized access.',
  FORBIDDEN: 'Access forbidden.',
  VALIDATION: 'Validation error. Please check your input.',
  MAPBOX_TOKEN: 'Mapbox token is required. Set NEXT_PUBLIC_MAPBOX_TOKEN in environment variables.',
  GEOLOCATION_DENIED: 'Geolocation permission denied.',
  GEOLOCATION_UNAVAILABLE: 'Geolocation unavailable.',
  EXPORT_FAILED: 'Export failed. Please try again.',
  RATE_LIMIT: 'Too many requests. Please wait and try again.',
} as const;

// ===== SUCCESS MESSAGES =====
export const SUCCESS = {
  EXPORT_PDF: 'PDF exported successfully',
  EXPORT_EXCEL: 'Excel exported successfully',
  EXPORT_JSON: 'JSON exported successfully',
  LOCATION_SHARED: 'Location shared successfully',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard',
  SETTINGS_SAVED: 'Settings saved',
} as const;

// ===== FEATURE FLAGS =====
export const FEATURES = {
  EXPORT_PDF: true,
  EXPORT_EXCEL: true,
  EXPORT_JSON: true,
  SOCIAL_SHARE: true,
  GEOLOCATION: true,
  ANALYTICS: process.env.NODE_ENV === 'production',
  DEV_TOOLS: process.env.NODE_ENV === 'development',
} as const;

// ===== REGEX PATTERNS =====
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^\+?[\d\s-()]+$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  COORDINATES: /^-?\d+\.?\d*$/,
} as const;

// ===== MAPBOX CONFIGURATION =====
export const MAPBOX = {
  STYLE: 'mapbox://styles/mapbox/streets-v12',
  STYLE_SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12',
  STYLE_DARK: 'mapbox://styles/mapbox/dark-v11',
  CSS_VERSION: '3.10.0',
  CSS_URL: 'https://api.mapbox.com/mapbox-gl-js/v3.10.0/mapbox-gl.css',
} as const;

// ===== PERFORMANCE THRESHOLDS =====
export const PERFORMANCE = {
  LCP_GOOD: 2500, // Largest Contentful Paint (ms)
  LCP_NEEDS_IMPROVEMENT: 4000,
  FID_GOOD: 100, // First Input Delay (ms)
  FID_NEEDS_IMPROVEMENT: 300,
  CLS_GOOD: 0.1, // Cumulative Layout Shift
  CLS_NEEDS_IMPROVEMENT: 0.25,
  TTFB_GOOD: 800, // Time to First Byte (ms)
  TTFB_NEEDS_IMPROVEMENT: 1800,
} as const;

// ===== ACCESSIBILITY =====
export const A11Y = {
  SKIP_LINK_TARGET: '#main-content',
  FOCUS_VISIBLE_CLASS: 'focus-visible:outline-blue-500',
  MIN_TOUCH_TARGET: 44, // px (WCAG 2.1 AA)
  MIN_CONTRAST_RATIO: 4.5, // WCAG 2.1 AA
} as const;

// Type exports for type safety
export type LayoutKey = keyof typeof LAYOUT;
export type TimingKey = keyof typeof TIMING;
export type LimitKey = keyof typeof LIMITS;
export type ZIndexKey = keyof typeof Z_INDEX;
export type ColorKey = keyof typeof COLORS;
export type LanguageCode = typeof LANGUAGES[keyof typeof LANGUAGES];
export type ErrorKey = keyof typeof ERRORS;
export type SuccessKey = keyof typeof SUCCESS;
export type FeatureKey = keyof typeof FEATURES;
