export const APP_CONFIG = {
    NAME: 'Hospital Map',
    VERSION: '1.0.0',
    API_URL: import.meta.env.VITE_API_URL || 'https://api.hospitalmap.com',
    DEFAULT_LANGUAGE: 'en',
    CACHE_TTL: 3600000, // 1 hour in milliseconds
    MAX_CACHE_SIZE: 100
  } as const;
  
  export const MAP_CONFIG = {
    defaultCenter: [46.603354, 1.888334] as [number, number],
    defaultZoom: 6,
    minZoom: 3,
    maxZoom: 18,
    boundsPadding: [50, 50] as [number, number],
    
    tileLayer: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '© OpenStreetMap contributors, © CartoDB',
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    },
    
    marker: {
      radius: 8,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
      colors: {
        deployed: '#4CAF50',
        inProgress: '#FFA500',
        signed: '#2196F3',
        default: '#9E9E9E'
      }
    },
    
    cluster: {
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxZoom: 18,
      chunkedLoading: true,
      chunkInterval: 100,
      chunkDelay: 50
    }
  } as const;
  
  export const UI_CONFIG = {
    theme: {
      light: 'light',
      dark: 'dark',
      system: 'system'
    },
    
    animation: {
      duration: 300,
      easing: 'ease-in-out'
    },
    
    breakpoints: {
      mobile: 640,
      tablet: 768,
      laptop: 1024,
      desktop: 1280
    },
    
    toast: {
      duration: 5000,
      position: 'bottom-right'
    }
  } as const;
  
  export const REGIONS = {
    EUROPE: {
      name: 'Europe',
      bounds: { lat: [35, 71], lon: [-10, 40] }
    },
    NORTH_AMERICA: {
      name: 'North America',
      bounds: { lat: [15, 72], lon: [-170, -50] }
    },
    SOUTH_AMERICA: {
      name: 'South America',
      bounds: { lat: [-55, 15], lon: [-80, -35] }
    },
    ASIA: {
      name: 'Asia',
      bounds: { lat: [-10, 55], lon: [60, 150] }
    },
    AFRICA: {
      name: 'Africa',
      bounds: { lat: [-35, 37], lon: [-20, 50] }
    },
    OCEANIA: {
      name: 'Oceania',
      bounds: { lat: [-50, 0], lon: [110, 180] }
    }
  } as const;
  
  export const HOSPITAL_STATUS = {
    DEPLOYED: 'Deployed',
    IN_PROGRESS: 'In Progress',
    SIGNED: 'Signed'
  } as const;
  
  export const CACHE_KEYS = {
    HOSPITALS: 'hospitals',
    FILTERS: 'filters',
    USER_PREFERENCES: 'userPreferences'
  } as const;
  
  export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Validation error. Please check your input.',
    MAP_ERROR: 'Error loading map. Please refresh the page.',
    DATA_ERROR: 'Error loading data. Please try again.'
  } as const;
  
  export const ANALYTICS_EVENTS = {
    MAP_INTERACTION: 'map_interaction',
    FILTER_CHANGE: 'filter_change',
    SEARCH: 'search',
    HOSPITAL_VIEW: 'hospital_view',
    ERROR: 'error',
    PERFORMANCE: 'performance'
  } as const;
  
  export const PERFORMANCE_METRICS = {
    MAP_LOAD: 'map_load',
    MARKER_UPDATE: 'marker_update',
    FILTER_APPLY: 'filter_apply',
    SEARCH_EXECUTE: 'search_execute',
    DATA_FETCH: 'data_fetch'
  } as const;
  
  export const LOCAL_STORAGE_KEYS = {
    THEME: 'theme',
    LANGUAGE: 'language',
    FILTERS: 'filters',
    LAST_POSITION: 'lastPosition'
  } as const;
  
  export const API_ENDPOINTS = {
    HOSPITALS: '/hospitals',
    SEARCH: '/search',
    STATISTICS: '/statistics',
    HEALTH: '/health'
  } as const;
  
  export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  } as const;