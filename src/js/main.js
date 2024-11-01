/**
 * @fileoverview Complete hospital map application with security and performance optimizations
 * @description This is the main entry point for the hospital map application.
 * It handles map rendering, markers, clustering, data management, and user interactions.
 * 
 * @author BunnySweety
 * @version 2.0.0
 * @license MIT
 * @since 1.0.0
 * 
 * @requires module:gauge
 * @requires module:translations
 * @requires module:hospitals
 * @requires module:security
 * @requires module:performance
 * @requires Leaflet
 * @requires module:leaflet.markercluster
 */

'use strict';

import { GaugeManager } from './gauge.js';
import { translations } from '../../data/translations.js';
import { hospitals } from '../../data/hospitals.js';
import { EnhancedSecurityManager, SecurityConfig } from './security.js';
import { PerformanceManager, PerformanceConfig } from './performance.js';

/**
 * @typedef {Object} UIConfig
 * @property {number} MOBILE_BREAKPOINT - Mobile breakpoint width in pixels
 * @property {string} DEFAULT_LANGUAGE - Default application language
 * @property {Object.<string, string>} COLORS - Color codes for different statuses
 * @property {Object} IMAGE - Image related configurations
 * @property {Object} MARKER - Marker styling configurations
 * @property {Object} ANIMATION - Animation timing configurations
 */

/**
 * @typedef {Object} MapConfig
 * @property {Array<number>} DEFAULT_CENTER - Default map center coordinates [lat, lon]
 * @property {number} DEFAULT_ZOOM - Default zoom level
 * @property {number} MAX_ZOOM - Maximum allowed zoom level
 * @property {number} MIN_ZOOM - Minimum allowed zoom level
 * @property {Object} CLUSTER - Marker clustering configurations
 * @property {Array<number>} BOUNDS_PADDING - Padding for map bounds
 * @property {Object} TILE_LAYER - Map tile layer configurations
 */

/**
 * @typedef {Object} RegionBounds
 * @property {Array<number>} lat - Latitude range [min, max]
 * @property {Array<number>} lon - Longitude range [min, max]
 */

/**
 * @typedef {Object} Hospital
 * @property {string} id - Unique identifier of the hospital
 * @property {string} name - Name of the hospital
 * @property {number} lat - Latitude coordinate
 * @property {number} lon - Longitude coordinate
 * @property {string} status - Current status ('Deployed', 'In Progress', 'Signed')
 * @property {string} address - Full address of the hospital
 * @property {string} [website] - Hospital website URL
 * @property {string} [imageUrl] - URL of the hospital image
 */

/**
 * Application configuration constants
 * @constant
 * @type {Object}
 * @property {UIConfig} UI - User interface configurations
 * @property {MapConfig} MAP - Map related configurations
 * @property {Object} STORAGE - Storage related configurations
 * @property {Object.<string, RegionBounds>} REGIONS - Geographic region boundaries
 * @property {Object} PERFORMANCE - Performance related configurations
 * @property {Object} SECURITY - Security related configurations
 * @property {Object.<string, string>} ERROR_MESSAGES - Application error messages
 */
const CONFIG = {
    UI: {
        MOBILE_BREAKPOINT: 1024,
        DEFAULT_LANGUAGE: 'en',
        COLORS: {
            DEPLOYED: '#4CAF50',
            'IN PROGRESS': '#FFA500',
            SIGNED: '#2196F3'
        },
        IMAGE: {
            DEFAULT: './assets/images/placeholder.png',
            STATES: {
                LOADING: 'loading',
                SUCCESS: 'success',
                ERROR: 'error'
            }
        },
        MARKER: {
            RADIUS: 8,
            WEIGHT: 1,
            OPACITY: 1,
            FILL_OPACITY: 0.8
        },
        ANIMATION: {
            DURATION: 300,
            DEBOUNCE_DELAY: 250,
            CLUSTER_ANIMATION: 200
        }
    },
    MAP: {
        DEFAULT_CENTER: [46.603354, 1.888334],
        DEFAULT_ZOOM: 6,
        MAX_ZOOM: 18,
        MIN_ZOOM: 3,
        CLUSTER: {
            MAX_RADIUS: 50,
            SPIDER_ON_MAX_ZOOM: true,
            SHOW_COVERAGE: false,
            DISABLE_CLUSTERING_AT_ZOOM: 19,
            ANIMATE: true,
            CHUNK_SIZE: 50,
            CHUNK_DELAY: 10,
            CHUNK_INTERVAL: 50
        },
        BOUNDS_PADDING: [50, 50],
        TILE_LAYER: {
            LIGHT: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    },
    STORAGE: {
        PREFERENCES_KEY: 'hospitalMapPreferences',
        VERSION: '1.0.0',
        MAX_AGE: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    REGIONS: {
        EUROPE: { lat: [35, 71], lon: [-25, 40] },
        AFRICA: { lat: [-35, 37], lon: [-20, 60] },
        ASIA: { lat: [-10, 55], lon: [25, 180] },
        OCEANIA: { lat: [-50, 0], lon: [110, 180] },
        NORTH_AMERICA: { lat: [15, 72], lon: [-170, -40] },
        SOUTH_AMERICA: { lat: [-57, 15], lon: [-110, -35] }
    },
    PERFORMANCE: {
        CHUNK_SIZE: 50,
        DEBOUNCE_TIME: 250,
        THROTTLE_TIME: 100,
        MAX_CACHE_SIZE: 100,
        CACHE_TTL: 3600000 // 1 hour
    },
    SECURITY: {
        MAX_REQUESTS: 100,
        TIME_WINDOW: 60000,
        INPUT_MAX_LENGTH: 100
    },
    ERROR_MESSAGES: {
        INIT_FAILED: 'Failed to initialize application. Please refresh the page.',
        DATA_LOAD_FAILED: 'Failed to load data. Please check your connection.',
        INVALID_DATA: 'Invalid data received. Please contact support.',
        RATE_LIMIT: 'Too many requests. Please try again later.',
        INVALID_INPUT: 'Invalid input detected.',
        INVALID_COORDINATES: 'Invalid coordinates provided.'
    }
};

/**
 * Service Worker Manager class
 * Handles service worker registration, updates, and periodic sync
 * 
 * @class
 * @since 1.0.0
 */
class ServiceWorkerManager {
    /**
     * Creates an instance of ServiceWorkerManager
     * @constructor
     * @example
     * const swManager = new ServiceWorkerManager();
     */
    constructor() {
        /**
         * Service Worker registration instance
         * @private
         * @type {ServiceWorkerRegistration|null}
         */
        this.registration = null;

        this.setupServiceWorker();
    }

    /**
     * Sets up the service worker
     * @async
     * @private
     * @returns {Promise<void>}
     * @throws {Error} When service worker registration fails
     */
    async setupServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        try {
            this.registration = await navigator.serviceWorker.register('./src/js/sw.js');
            this.handleUpdates();
        } catch (error) {
            console.error('ServiceWorker registration failed:', error);
        }
    }

    /**
     * Handles service worker updates
     * @private
     * @returns {void}
     */
    handleUpdates() {
        if (!this.registration) return;

        this.registration.addEventListener('updatefound', () => {
            const newWorker = this.registration.installing;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.showUpdateNotification();
                }
            });
        });
    }

    /**
     * Shows update notification to user
     * @private
     * @returns {void}
     */
    showUpdateNotification() {
        const shouldUpdate = confirm('A new version is available. Would you like to update?');
        if (shouldUpdate) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    /**
     * Requests permission for periodic background sync
     * @async
     * @returns {Promise<boolean>} Whether permission was granted
     */
    async requestPeriodicSyncPermission() {
        if (!('permissions' in navigator)) return false;

        try {
            const status = await navigator.permissions.query({
                name: 'periodic-background-sync'
            });

            if (status.state === 'granted') return true;

            const result = confirm(
                'Would you like to enable background updates? ' +
                'This helps keep the application up-to-date even when offline.'
            );

            return result;
        } catch (error) {
            console.log('Periodic sync not supported:', error);
            return false;
        }
    }
}

/**
 * Network Manager class
 * Handles network status monitoring and related UI updates
 * 
 * @class
 * @since 1.0.0
 */
class NetworkManager {
    /**
     * Creates an instance of NetworkManager
     * @constructor
     * @example
     * const networkManager = new NetworkManager();
     */
    constructor() {
        this.setupNetworkListeners();
    }

    /**
     * Sets up network status event listeners
     * @private
     * @returns {void}
     */
    setupNetworkListeners() {
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    /**
     * Handles online event
     * @private
     * @returns {void}
     */
    handleOnline() {
        document.body.classList.remove('offline');
        Utils.showError('Internet connection restored', 3000);
    }

    /**
     * Handles offline event
     * @private
     * @returns {void}
     */
    handleOffline() {
        document.body.classList.add('offline');
        Utils.showError('You are offline. Some features may be limited', 5000);
    }
}

/**
 * Utility functions namespace
 * @namespace
 */
const Utils = {
    /**
     * Debounces function execution
     * @param {Function} fn - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(fn, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    },

    /**
     * Throttles function execution
     * @param {Function} fn - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(fn, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Formats number with locale
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },

    /**
     * Gets continent based on coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {string} Continent name or 'Unknown'
     */
    getContinent(lat, lon) {
        for (const [name, bounds] of Object.entries(CONFIG.REGIONS)) {
            if (lat >= bounds.lat[0] && lat <= bounds.lat[1] &&
                lon >= bounds.lon[0] && lon <= bounds.lon[1]) {
                return name.replace('_', ' ');
            }
        }
        return 'Unknown';
    },

    /**
     * Parses address string into components
     * @param {string} address - Address string to parse
     * @returns {Object} Parsed address components
     * @property {string} street - Street address
     * @property {string} city - City name
     * @property {string} country - Country name
     * @property {string} postalCode - Postal code
     */
    parseAddress(address) {
        const securityManager = new EnhancedSecurityManager();
        const sanitizedAddress = securityManager.sanitizeInput(address);

        if (!sanitizedAddress?.trim()) {
            return {
                street: '',
                city: '',
                country: '',
                postalCode: ''
            };
        }

        const parts = sanitizedAddress.split(',').map(part => part.trim());

        // Postal code patterns for different countries
        const postalPatterns = [
            /\b[0-9]{5}\b/,
            /\b[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]\b/i,
            /\b[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}\b/i,
            /\b[0-9]{4}\s?[A-Z]{2}\b/i,
            /\b[0-9]{4,6}\b/,
            /\b[A-Z0-9]{2,4}\s?[0-9]{3,4}\b/i
        ];

        let postalCode = '';
        let city = '';
        let potentialCityPart = parts[1] || '';

        for (const pattern of postalPatterns) {
            const match = potentialCityPart.match(pattern);
            if (match) {
                postalCode = match[0];
                city = potentialCityPart.replace(pattern, '').trim();
                break;
            }
        }

        if (!city && potentialCityPart) {
            city = potentialCityPart;
        }

        return {
            street: securityManager.sanitizeInput(parts[0] || ''),
            city: securityManager.sanitizeInput(city),
            country: securityManager.sanitizeInput(parts[parts.length - 1] || ''),
            postalCode: securityManager.sanitizeInput(postalCode)
        };
    },

    /**
     * Validates coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {boolean} Whether coordinates are valid
     */
    validateCoordinates(lat, lon) {
        const securityManager = new EnhancedSecurityManager();
        return securityManager.validateCoordinates(lat, lon);
    },

    /**
     * Calculates distance between two points
     * @param {number} lat1 - First latitude
     * @param {number} lon1 - First longitude
     * @param {number} lat2 - Second latitude
     * @param {number} lon2 - Second longitude
     * @returns {number} Distance in kilometers
     * @throws {Error} If coordinates are invalid
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        if (!this.validateCoordinates(lat1, lon1) || !this.validateCoordinates(lat2, lon2)) {
            throw new Error(CONFIG.ERROR_MESSAGES.INVALID_COORDINATES);
        }

        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    /**
     * Gets current geolocation position
     * @async
     * @returns {Promise<GeolocationPosition>} Current position
     * @throws {Error} If geolocation is not supported or permission denied
     */
    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    },

    /**
     * Shows error message
     * @param {string} message - Error message to display
     * @param {number} [duration=5000] - Duration in milliseconds
     */
    showError(message, duration = 5000) {
        const securityManager = new EnhancedSecurityManager();
        const sanitizedMessage = securityManager.sanitizeInput(message);

        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = sanitizedMessage;
            errorElement.style.display = 'block';
            if (duration > 0) {
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, duration);
            }
        }
    },

    /**
     * Saves user preferences to local storage
     * @param {Object} preferences - User preferences to save
     * @throws {Error} If saving fails
     */
    savePreferences(preferences) {
        try {
            const securityManager = new EnhancedSecurityManager();
            const sanitizedPreferences = Object.entries(preferences).reduce((acc, [key, value]) => {
                acc[key] = typeof value === 'string' ?
                    securityManager.sanitizeInput(value) : value;
                return acc;
            }, {});

            const data = {
                ...sanitizedPreferences,
                timestamp: Date.now(),
                version: CONFIG.STORAGE.VERSION
            };

            localStorage.setItem(
                CONFIG.STORAGE.PREFERENCES_KEY,
                JSON.stringify(data)
            );
        } catch (error) {
            ErrorHandler.handle(error, 'Save Preferences');
            throw error;
        }
    },

    /**
     * Loads user preferences from local storage
     * @returns {Object|null} User preferences or null if not found/invalid
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE.PREFERENCES_KEY);
            if (!saved) return null;

            const data = JSON.parse(saved);
            const age = Date.now() - (data.timestamp || 0);

            if (age > CONFIG.STORAGE.MAX_AGE || data.version !== CONFIG.STORAGE.VERSION) {
                localStorage.removeItem(CONFIG.STORAGE.PREFERENCES_KEY);
                return null;
            }

            return data;
        } catch (error) {
            ErrorHandler.handle(error, 'Load Preferences');
            return null;
        }
    },

    /**
     * Validates and sanitizes input
     * @param {string} input - Input to validate
     * @param {string} [type='text'] - Type of input
     * @returns {string|Object|null} Sanitized input
     */
    validateAndSanitizeInput(input, type = 'text') {
        const securityManager = new EnhancedSecurityManager();
        const sanitized = securityManager.sanitizeInput(input);

        switch (type) {
            case 'url':
                return securityManager.validateUrl(sanitized) ? sanitized : '';
            case 'coordinates':
                const [lat, lon] = sanitized.split(',').map(Number);
                return securityManager.validateCoordinates(lat, lon) ? { lat, lon } : null;
            case 'text':
            default:
                return sanitized;
        }
    },

    /**
     * Safely loads resources with security checks
     * @async
     * @param {string} url - URL to load
     * @param {Object} [options={}] - Fetch options
     * @returns {Promise<Object>} Loaded resource
     * @throws {Error} If URL is invalid or request fails
     */
    async loadResourceSafely(url, options = {}) {
        const securityManager = new EnhancedSecurityManager();
        if (!securityManager.validateUrl(url)) {
            throw new Error('Invalid URL');
        }

        try {
            const response = await fetch(url, {
                ...options,
                credentials: 'same-origin',
                headers: {
                    ...options.headers,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            ErrorHandler.handle(error, 'Resource Loading');
            throw error;
        }
    }
};

/**
 * Store class for state management
 * Manages application state with history tracking and change notifications
 * 
 * @class
 * @since 1.0.0
 */
class Store {
    /**
     * Security manager instance
     * @private
     * @type {SecurityManager}
     */
    #securityManager = new EnhancedSecurityManager();

    /**
     * Performance manager instance
     * @private
     * @type {PerformanceManager}
     */
    #performanceManager = new PerformanceManager();

    /**
     * Creates a store instance
     * @constructor
     * @param {Object} [initialState={}] - Initial state
     * @example
     * const store = new Store({
     *   user: null,
     *   settings: { theme: 'light' }
     * });
     */
    constructor(initialState = {}) {
        /**
         * Current state
         * @type {Object}
         */
        this.state = initialState;

        /**
         * Initial state backup
         * @type {Object}
         * @private
         */
        this.initialState = this.cloneState(initialState);

        /**
         * State change listeners
         * @type {Set<Function>}
         * @private
         */
        this.listeners = new Set();

        /**
         * State history
         * @type {Array<Object>}
         * @private
         */
        this.history = [];

        /**
         * Maximum history length
         * @type {number}
         * @private
         */
        this.maxHistoryLength = 10;
    }

    /**
     * Deep clones state objects, handling special cases
     * @private
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    cloneState(obj) {
        // Handle special Leaflet objects
        if (obj instanceof L.Map ||
            obj instanceof L.MarkerClusterGroup ||
            obj instanceof L.Layer ||
            obj instanceof L.Marker) {
            return obj;
        }

        // Handle null and non-objects
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        // Handle Date objects
        if (obj instanceof Date) {
            return new Date(obj);
        }

        // Handle Arrays
        if (obj instanceof Array) {
            return obj.map(item => this.cloneState(item));
        }

        // Handle Maps
        if (obj instanceof Map) {
            return new Map([...obj].map(([key, value]) => [key, this.cloneState(value)]));
        }

        // Handle plain objects
        const cloned = {};
        for (const [key, value] of Object.entries(obj)) {
            cloned[key] = this.cloneState(value);
        }
        return cloned;
    }

    /**
     * Updates state and notifies listeners
     * @param {Object} newState - State updates
     * @param {boolean} [recordHistory=true] - Whether to record in history
     * @throws {Error} If state update validation fails
     */
    setState(newState, recordHistory = true) {
        this.#performanceManager.startMeasure('setState');

        try {
            if (recordHistory) {
                this.history.push(this.cloneState(this.state));
                if (this.history.length > this.maxHistoryLength) {
                    this.history.shift();
                }
            }

            const oldState = this.cloneState(this.state);

            // Sanitize new state values
            const sanitizedState = Object.entries(newState).reduce((acc, [key, value]) => {
                acc[key] = typeof value === 'string' ?
                    this.#securityManager.sanitizeInput(value) : value;
                return acc;
            }, {});

            this.state = { ...this.state, ...sanitizedState };

            let hasChanged = false;
            for (const key in sanitizedState) {
                if (oldState[key] !== this.state[key]) {
                    hasChanged = true;
                    break;
                }
            }

            if (hasChanged) {
                this.notify();
            }

            this.#performanceManager.endMeasure('setState');
        } catch (error) {
            ErrorHandler.handle(error, 'State Update');
            throw error;
        }
    }

    /**
     * Gets current state
     * @returns {Object} Current state clone
     */
    getState() {
        return this.cloneState(this.state);
    }

    /**
     * Subscribes to state changes
     * @param {Function} listener - Listener function
     * @returns {Function} Unsubscribe function
     * @throws {Error} If listener is not a function
     */
    subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Store subscriber must be a function');
        }
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notifies all listeners of state changes
     * @private
     */
    notify() {
        this.#performanceManager.startMeasure('storeNotify');

        this.listeners.forEach(listener => {
            try {
                listener(this.getState());
            } catch (error) {
                ErrorHandler.handle(error, 'Store Listener');
            }
        });

        this.#performanceManager.endMeasure('storeNotify');
    }

    /**
     * Resets store to initial state
     */
    reset() {
        this.history = [];
        this.setState(this.initialState, false);
    }
}

/**
 * Global store instance
 * @type {Store}
 */
const store = new Store({
    map: null,
    markers: new Map(),
    markerClusterGroup: null,
    activeStatus: [],
    language: CONFIG.UI.DEFAULT_LANGUAGE,
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    translations: translations,
    isInitialized: false,
    hospitals: hospitals,
    visibleHospitals: [],
    currentZoom: CONFIG.MAP.DEFAULT_ZOOM,
    filters: {
        continent: '',
        country: '',
        city: '',
        searchTerm: '',
        statuses: []
    },
    ui: {
        controlsVisible: window.innerWidth > CONFIG.UI.MOBILE_BREAKPOINT,
        legendVisible: true,
        selectedHospital: null,
        loading: false,
        error: null,
        mobileKeyboardVisible: false
    },
    preferences: {
        language: null,
        darkMode: null,
        activeStatus: [],
        lastVisitedLocation: null
    },
    stats: {
        totalHospitals: 0,
        deployedCount: 0,
        inProgressCount: 0,
        signedCount: 0,
        visibleCount: 0
    },
    performance: {
        lastUpdateTime: null,
        markerUpdateCount: 0,
        filterUpdateCount: 0
    }
});

/**
 * Error Handler class
 * Centralized error handling and tracking
 * 
 * @class
 * @static
 * @since 1.0.0
 */
class ErrorHandler {
    /**
     * Security manager instance
     * @private
     * @static
     * @type {SecurityManager}
     */
    static #securityManager = new EnhancedSecurityManager();

    /**
     * Performance manager instance
     * @private
     * @static
     * @type {PerformanceManager}
     */
    static #performanceManager = new PerformanceManager();

    /**
     * Handles application errors
     * @static
     * @param {Error} error - Error object
     * @param {string} [context=''] - Error context
     * @returns {void}
     */
    static handle(error, context = '') {
        this.#performanceManager.startMeasure('errorHandling');

        const sanitizedError = this.#securityManager.sanitizeInput(error.message);
        const sanitizedContext = this.#securityManager.sanitizeInput(context);

        AnalyticsManager.trackError(error, sanitizedContext);
        Utils.showError(sanitizedError);

        this.#performanceManager.endMeasure('errorHandling');
    }

    /**
     * Wraps async function with error handling
     * @static
     * @async
     * @template T
     * @param {function(): Promise<T>} fn - Async function to wrap
     * @returns {Promise<T>}
     * @throws {Error} Rethrows caught error after handling
     */
    static async wrapAsync(fn) {
        try {
            return await fn();
        } catch (error) {
            this.handle(error);
            throw error;
        }
    }
}

/**
 * Analytics Manager class
 * Handles event tracking and analytics
 * 
 * @class
 * @static
 * @since 1.0.0
 */
class AnalyticsManager {
    /**
     * Performance manager instance
     * @private
     * @static
     * @type {PerformanceManager}
     */
    static #performanceManager = new PerformanceManager();

    /**
     * Security manager instance
     * @private
     * @static
     * @type {SecurityManager}
     */
    static #securityManager = new EnhancedSecurityManager();

    /**
     * Whether tracking is enabled
     * @private
     * @static
     * @type {boolean}
     */
    static #trackingEnabled = true;

    /**
     * Enables or disables tracking
     * @static
     * @param {boolean} enabled - Whether tracking should be enabled
     * @returns {void}
     */
    static setTrackingEnabled(enabled) {
        this.#trackingEnabled = enabled;
    }

    /**
     * Tracks an event
     * @static
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string} [label=null] - Event label
     * @param {number} [value=null] - Event value
     * @returns {void}
     */
    static trackEvent(category, action, label = null, value = null) {
        if (!this.#trackingEnabled) return;

        this.#performanceManager.startMeasure('analytics');

        const sanitizedData = {
            category: this.#securityManager.sanitizeInput(category),
            action: this.#securityManager.sanitizeInput(action),
            label: label ? this.#securityManager.sanitizeInput(label) : null,
            value: typeof value === 'number' ? value : null
        };

        console.log('Analytics:', sanitizedData);
        this.#performanceManager.endMeasure('analytics');
    }

    /**
     * Tracks an error
     * @static
     * @param {Error} error - Error to track
     * @param {string} [context=''] - Error context
     * @returns {void}
     */
    static trackError(error, context = '') {
        if (!this.#trackingEnabled) return;

        const sanitizedError = this.#securityManager.sanitizeInput(error.message);
        const sanitizedContext = this.#securityManager.sanitizeInput(context);

        console.error('Error:', sanitizedContext, sanitizedError);
    }

    /**
     * Tracks timing information
     * @static
     * @param {string} category - Timing category
     * @param {string} variable - Timing variable
     * @param {number} time - Time value in milliseconds
     * @returns {void}
     */
    static trackTiming(category, variable, time) {
        if (!this.#trackingEnabled) return;

        this.#performanceManager.startMeasure('timing');

        const sanitizedCategory = this.#securityManager.sanitizeInput(category);
        const sanitizedVariable = this.#securityManager.sanitizeInput(variable);

        console.log('Timing:', {
            category: sanitizedCategory,
            variable: sanitizedVariable,
            time
        });

        this.#performanceManager.endMeasure('timing');
    }
}

/**
 * Enhanced Map Manager class
 * Manages the map instance and all map-related operations
 * 
 * @class
 * @since 1.0.0
 */
class EnhancedMapManager {
    /**
     * Creates an EnhancedMapManager instance
     * @constructor
     * @param {string} [containerId='map'] - Map container element ID
     */
    constructor(containerId = 'map') {
        /**
         * Map container element ID
         * @type {string}
         */
        this.containerId = containerId;

        /**
         * Leaflet map instance
         * @type {L.Map|null}
         */
        this.map = null;

        /**
         * Marker cluster group instance
         * @type {L.MarkerClusterGroup|null}
         */
        this.markerClusterGroup = null;

        /**
         * Map of markers
         * @type {Map<string, L.CircleMarker>}
         */
        this.markers = new Map();

        /**
         * Set of active popups
         * @type {Set<L.CircleMarker>}
         */
        this.activePopups = new Set();

        /**
         * Security manager instance
         * @type {SecurityManager}
         */
        this.securityManager = new EnhancedSecurityManager();

        /**
         * Performance manager instance
         * @type {PerformanceManager}
         */
        this.performanceManager = new PerformanceManager();

        // Security and performance limits
        /**
         * Maximum number of markers allowed
         * @type {number}
         */
        this.MAX_MARKERS = 10000;

        /**
         * Maximum number of active popups allowed
         * @type {number}
         */
        this.MAX_ACTIVE_POPUPS = 10;

        /**
         * Threshold for marker cleanup
         * @type {number}
         */
        this.MARKER_CLEANUP_THRESHOLD = 5000;

        /**
         * Interval for popup updates
         * @type {number}
         */
        this.POPUP_UPDATE_INTERVAL = 1000;

        /**
         * Maximum attempts for tile loading
         * @type {number}
         */
        this.TILE_RETRY_ATTEMPTS = 3;

        /**
         * Delay between tile retry attempts
         * @type {number}
         */
        this.TILE_RETRY_DELAY = 1000;

        // Async operation queue
        /**
         * Queue for marker operations
         * @type {Array}
         * @private
         */
        this.markerQueue = [];

        /**
         * Whether the queue is being processed
         * @type {boolean}
         * @private
         */
        this.isProcessingQueue = false;

        // Marker icon cache
        /**
         * Cache for marker icons
         * @type {Map}
         * @private
         */
        this.markerIconCache = new Map();

        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);
        this.handleZoomEnd = this.handleZoomEnd.bind(this);
        this.handleMoveEnd = this.handleMoveEnd.bind(this);
        this.processMarkerQueue = this.processMarkerQueue.bind(this);
    }

    /**
     * Initializes the map
     * @async
     * @returns {Promise<L.Map>} Initialized map instance
     * @throws {Error} If map initialization fails
     */
    async init() {
        if (this.map) return this.map;

        this.performanceManager.startMeasure('mapInit');

        try {
            const mapElement = document.getElementById(this.containerId);
            if (!mapElement) {
                throw new Error(`Map container with id '${this.containerId}' not found`);
            }

            // Validate map configuration
            const validatedCenter = this.securityManager.validateCoordinates(
                CONFIG.MAP.DEFAULT_CENTER[0],
                CONFIG.MAP.DEFAULT_CENTER[1]
            ) ? CONFIG.MAP.DEFAULT_CENTER : [0, 0];

            this.map = L.map(this.containerId, {
                center: validatedCenter,
                zoom: CONFIG.MAP.DEFAULT_ZOOM,
                maxZoom: CONFIG.MAP.MAX_ZOOM,
                minZoom: CONFIG.MAP.MIN_ZOOM,
                zoomControl: true,
                scrollWheelZoom: true,
                dragging: true,
                tap: true,
                maxBounds: SecurityConfig.VALIDATION.MAX_BOUNDS
            });

            this.map.zoomControl.remove();
            L.control.zoom({ position: 'topleft' }).addTo(this.map);

            await Promise.all([
                this.setupPanes(),
                this.setupMarkerCluster(),
                this.updateTileLayer()
            ]);

            this.setupEventListeners();
            this.setupSecurityBoundaries();

            store.setState({ map: this.map });

            this.performanceManager.endMeasure('mapInit');
            return this.map;
        } catch (error) {
            ErrorHandler.handle(error, 'Map Initialization');
            throw error;
        }
    }

    /**
     * Sets up map security boundaries
     * @private
     */
    setupSecurityBoundaries() {
        this.map.setMaxBounds(SecurityConfig.VALIDATION.MAX_BOUNDS);

        this.map.on('zoomend', () => {
            const zoom = this.map.getZoom();
            if (zoom > SecurityConfig.VALIDATION.MAX_ZOOM_LEVEL) {
                this.map.setZoom(SecurityConfig.VALIDATION.MAX_ZOOM_LEVEL);
            }
        });
    }

    /**
     * Sets up map panes
     * @async
     * @private
     */
    async setupPanes() {
        if (!this.map) return;

        this.performanceManager.startMeasure('setupPanes');

        this.map.createPane('markerPane').style.zIndex = 450;
        this.map.createPane('popupPane').style.zIndex = 500;
        this.map.createPane('tooltipPane').style.zIndex = 550;

        this.performanceManager.endMeasure('setupPanes');
    }

    /**
     * Sets up marker cluster group
     * @async
     * @private
     * @returns {Promise<boolean>} Success status
     */
    async setupMarkerCluster() {
        if (!this.map) return false;

        this.performanceManager.startMeasure('setupCluster');

        try {
            if (this.markerClusterGroup) {
                this.map.removeLayer(this.markerClusterGroup);
                this.markerClusterGroup = null;
            }

            this.markerClusterGroup = L.markerClusterGroup({
                maxClusterRadius: CONFIG.MAP.CLUSTER.MAX_RADIUS,
                spiderfyOnMaxZoom: CONFIG.MAP.CLUSTER.SPIDER_ON_MAX_ZOOM,
                showCoverageOnHover: CONFIG.MAP.CLUSTER.SHOW_COVERAGE,
                zoomToBoundsOnClick: true,
                removeOutsideVisibleBounds: true,
                animate: CONFIG.MAP.CLUSTER.ANIMATE,
                animateAddingMarkers: true,
                disableClusteringAtZoom: CONFIG.MAP.CLUSTER.DISABLE_CLUSTERING_AT_ZOOM,
                chunkedLoading: true,
                chunkInterval: PerformanceConfig.MARKERS.CHUNK_INTERVAL,
                chunkDelay: PerformanceConfig.MARKERS.CHUNK_DELAY,
                iconCreateFunction: this.createClusterIcon.bind(this)
            });

            this.setupClusterEventListeners();

            if (!this.map.hasLayer(this.markerClusterGroup)) {
                this.map.addLayer(this.markerClusterGroup);
            }

            this.markerClusterGroup = this.performanceManager.enhanceClusterPerformance(
                this.markerClusterGroup
            );

            store.setState({ markerClusterGroup: this.markerClusterGroup });

            this.performanceManager.endMeasure('setupCluster');
            return true;
        } catch (error) {
            ErrorHandler.handle(error, 'Setup Marker Cluster');
            return false;
        }
    }

    /**
     * Sets up cluster event listeners
     * @private
     */
    setupClusterEventListeners() {
        this.markerClusterGroup.on('error', (error) => {
            ErrorHandler.handle(error, 'Marker Cluster Error');
        });

        this.markerClusterGroup.on('clusterclick', (e) => {
            const clusterSize = e.layer.getChildCount();
            if (clusterSize > this.MARKER_CLEANUP_THRESHOLD) {
                e.layer.zoomToBounds({
                    padding: CONFIG.MAP.BOUNDS_PADDING,
                    maxZoom: Math.min(this.map.getZoom() + 2, CONFIG.MAP.MAX_ZOOM)
                });
            }
            AnalyticsManager.trackEvent('Map', 'ClusterClick', `Size: ${clusterSize}`);
        });

        this.markerClusterGroup.on('animationend', () => {
            this.performanceManager.endMeasure('clusterAnimation');
            this.checkAndOptimizeMarkers();
        });
    }

    /**
     * Sets up map event listeners
     * @private
     */
    setupEventListeners() {
        if (!this.map) return;

        window.addEventListener('resize', this.handleResize, { passive: true });
        this.map.on('click', this.handleMapClick);
        this.map.on('zoomend', this.handleZoomEnd);
        this.map.on('moveend', this.handleMoveEnd);

        if (this.markerClusterGroup) {
            this.markerClusterGroup.on('clusterclick', (e) => {
                AnalyticsManager.trackEvent('Map', 'ClusterClick', `Size: ${e.layer.getChildCount()}`);
            });
        }
    }

    /**
     * Handles map clicks
     * @private
     * @param {L.MouseEvent} e - Click event
     */
    handleMapClick(e) {
        if (!this.map) return;

        const { ui } = store.getState();
        if (ui.controlsVisible && window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT) {
            store.setState({
                ui: { ...ui, controlsVisible: false }
            });
        }
        AnalyticsManager.trackEvent('Map', 'Click', `${e.latlng.lat},${e.latlng.lng}`);
    }

    /**
     * Handles zoom end events
     * @private
     */
    handleZoomEnd() {
        if (!this.map) return;

        const zoom = this.map.getZoom();
        AnalyticsManager.trackEvent('Map', 'Zoom', `Level: ${zoom}`);
        store.setState({ currentZoom: zoom });

        requestAnimationFrame(() => {
            this.checkAndOptimizeMarkers();
        });
    }

    /**
     * Handles map move end events
     * @private
     */
    handleMoveEnd() {
        if (!this.map) return;

        const center = this.map.getCenter();
        if (!center) return;

        AnalyticsManager.trackEvent('Map', 'Move', `${center.lat},${center.lng}`);
        this.updateVisibleMarkers();
    }

    /**
     * Handles window resize events
     * @private
     */
    handleResize() {
        if (this.map) {
            this.map.invalidateSize();
            this.checkAndOptimizeMarkers();
        }
    }

    /**
     * Creates a cluster icon
     * @private
     * @param {L.MarkerCluster} cluster - Marker cluster
     * @returns {L.DivIcon} Cluster icon
     */
    createClusterIcon(cluster) {
        const count = cluster.getChildCount();
        let size = 'small';

        if (count > 100) size = 'large';
        else if (count > 10) size = 'medium';

        const iconKey = `cluster-${size}-${count}`;

        if (this.markerIconCache.has(iconKey)) {
            return this.markerIconCache.get(iconKey);
        }

        const icon = L.divIcon({
            html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
            className: `marker-cluster marker-cluster-${size}`,
            iconSize: L.point(40, 40)
        });

        this.markerIconCache.set(iconKey, icon);
        return icon;
    }

    /**
     * Updates the map tile layer
     * @async
     * @returns {Promise<boolean>} Success status
     */
    async updateTileLayer() {
        if (!this.map) return false;

        try {
            const { darkMode } = store.getState();

            if (this.map.currentTileLayer) {
                this.map.removeLayer(this.map.currentTileLayer);
            }

            const tileUrl = darkMode ? CONFIG.MAP.TILE_LAYER.DARK : CONFIG.MAP.TILE_LAYER.LIGHT;

            this.map.currentTileLayer = L.tileLayer(tileUrl, {
                maxZoom: CONFIG.MAP.MAX_ZOOM,
                attribution: CONFIG.MAP.TILE_LAYER.ATTRIBUTION,
                tileSize: 256,
                updateWhenIdle: true,
                updateWhenZooming: false,
                keepBuffer: 2
            });

            this.setupTileLayerErrorHandling();
            this.map.addLayer(this.map.currentTileLayer);

            return true;
        } catch (error) {
            ErrorHandler.handle(error, 'Update Tile Layer');
            return false;
        }
    }

    /**
     * Sets up tile layer error handling
     * @private
     */
    setupTileLayerErrorHandling() {
        let retryCount = new Map();

        this.map.currentTileLayer.on('tileerror', (error) => {
            const tileUrl = error.tile.src;
            const currentRetry = retryCount.get(tileUrl) || 0;

            if (currentRetry < this.TILE_RETRY_ATTEMPTS) {
                retryCount.set(tileUrl, currentRetry + 1);
                setTimeout(() => {
                    if (error.tile?.parentNode) {
                        error.tile.src = tileUrl;
                    }
                }, this.TILE_RETRY_DELAY * (currentRetry + 1));
            } else {
                console.warn('Max tile retry attempts reached for:', tileUrl);
                retryCount.delete(tileUrl);
                ErrorHandler.handle(new Error('Tile loading failed'), 'Tile Layer');
            }
        });

        this.map.currentTileLayer.on('load', () => {
            retryCount.clear();
        });
    }

    /**
     * Adds multiple hospital markers to the map
     * @async
     * @param {Array<Object>} hospitals - Hospital data array
     * @returns {Promise<number>} Number of markers added
     */
    async addMarkers(hospitals) {
        if (!hospitals?.length || !this.markerClusterGroup) return 0;

        this.performanceManager.startMeasure('addMarkers');
        console.log('Starting addMarkers with', hospitals.length, 'hospitals');

        try {
            if (hospitals.length > this.MAX_MARKERS) {
                console.warn(`Limiting markers from ${hospitals.length} to ${this.MAX_MARKERS}`);
                hospitals = hospitals.slice(0, this.MAX_MARKERS);
            }

            await this.clearAllMarkers();
            const validHospitals = this.validateHospitals(hospitals);
            console.log('Valid hospitals:', validHospitals.length);

            const chunks = this.performanceManager.chunkArray(
                validHospitals,
                PerformanceConfig.MARKERS.CHUNK_SIZE
            );

            for (const chunk of chunks) {
                await this.processMarkerChunk(chunk);
            }

            console.log('Final marker count:', this.markers.size);

            if (this.markers.size > 0) {
                await this.fitMarkersToView();
            }

            await GaugeManager.updateAllGauges(validHospitals);

            this.performanceManager.endMeasure('addMarkers');
            return this.markers.size;
        } catch (error) {
            ErrorHandler.handle(error, 'Add Markers');
            return 0;
        }
    }

    /**
     * Validates hospitals data
     * @private
     * @param {Array<Object>} hospitals - Hospitals to validate
     * @returns {Array<Object>} Valid hospitals
     */
    validateHospitals(hospitals) {
        return hospitals.filter(hospital => {
            if (!hospital?.id) {
                console.warn('Hospital missing ID');
                return false;
            }

            const requiredFields = ['lat', 'lon', 'name', 'status'];
            const missingFields = requiredFields.filter(field => !hospital[field]);

            if (missingFields.length > 0) {
                console.warn(`Hospital ${hospital.id} missing fields:`, missingFields);
                return false;
            }

            return this.securityManager.validateCoordinates(hospital.lat, hospital.lon) &&
                this.securityManager.sanitizeInput(hospital.name);
        });
    }

    /**
     * Processes a chunk of markers
     * @private
     * @async
     * @param {Array<Object>} chunk - Chunk of hospital data
     * @returns {Promise<void>}
     */
    async processMarkerChunk(chunk) {
        return new Promise(resolve => {
            requestAnimationFrame(async () => {
                const markers = await Promise.all(
                    chunk.map(async hospital => {
                        const marker = await this.createMarker(hospital);
                        if (marker) {
                            this.markers.set(hospital.id, marker);
                        }
                        return marker;
                    })
                );

                const validMarkers = markers.filter(Boolean);

                if (validMarkers.length > 0) {
                    await this.performanceManager.optimizeMarkerRendering(
                        validMarkers,
                        this.map,
                        this.markerClusterGroup
                    );
                }

                resolve();
            });
        });
    }

    /**
     * Creates a single marker
     * @private
     * @async
     * @param {Object} hospital - Hospital data
     * @returns {Promise<L.CircleMarker|null>} Created marker
     */
    async createMarker(hospital) {
        if (!this.validateHospitalData(hospital)) {
            return null;
        }

        try {
            const marker = L.circleMarker([hospital.lat, hospital.lon], {
                radius: CONFIG.UI.MARKER.RADIUS,
                fillColor: CONFIG.UI.COLORS[hospital.status.toUpperCase()],
                color: "#ffffff",
                weight: CONFIG.UI.MARKER.WEIGHT,
                opacity: CONFIG.UI.MARKER.OPACITY,
                fillOpacity: CONFIG.UI.MARKER.FILL_OPACITY,
                pane: 'markerPane'
            });

            marker.hospitalData = hospital;

            await Promise.all([
                this.bindPopupToMarker(marker),
                this.bindTooltipToMarker(marker)
            ]);

            this.setupMarkerEventListeners(marker);

            return marker;
        } catch (error) {
            ErrorHandler.handle(error, `Create Marker for hospital ${hospital.id}`);
            return null;
        }
    }

    /**
     * Validates individual hospital data
     * @private
     * @param {Object} hospital - Hospital data to validate
     * @returns {boolean} Whether data is valid
     */
    validateHospitalData(hospital) {
        if (!hospital?.id) {
            console.warn('Hospital missing ID');
            return false;
        }

        const requiredFields = ['lat', 'lon', 'name', 'status'];
        const missingFields = requiredFields.filter(field => !hospital[field]);

        if (missingFields.length > 0) {
            console.warn(`Hospital ${hospital.id} missing fields:`, missingFields);
            return false;
        }

        if (!Utils.validateCoordinates(hospital.lat, hospital.lon)) {
            console.warn(`Invalid coordinates for hospital ${hospital.id}`);
            return false;
        }

        return true;
    }

    /**
     * Sets up marker event listeners
     * @private
     * @param {L.CircleMarker} marker - Marker to setup
     * @returns {L.CircleMarker} Configured marker
     */
    setupMarkerEventListeners(marker) {
        marker.on('click', () => {
            if (this.activePopups.size >= this.MAX_ACTIVE_POPUPS) {
                const oldestPopup = Array.from(this.activePopups)[0];
                oldestPopup.closePopup();
            }
            AnalyticsManager.trackEvent('Marker', 'Click', marker.hospitalData.name);
        });

        marker.on('mouseover', () => {
            marker.setStyle({ weight: CONFIG.UI.MARKER.WEIGHT + 1 });
        });

        marker.on('mouseout', () => {
            marker.setStyle({ weight: CONFIG.UI.MARKER.WEIGHT });
        });

        return marker;
    }

    /**
     * Binds popup to marker
     * @private
     * @async
     * @param {L.CircleMarker} marker - Marker to bind popup to
     */
    async bindPopupToMarker(marker) {
        if (!marker?.hospitalData) return;

        try {
            if (marker.getPopup()) {
                marker.unbindPopup();
            }

            const popup = L.popup({
                maxWidth: 300,
                minWidth: 200,
                className: 'hospital-popup',
                offset: [0, -5],
                autoPan: true,
                autoPanPadding: [50, 50],
                closeButton: true,
                closeOnClick: false
            });

            marker.bindPopup(() => this.generatePopupContent(marker.hospitalData));
            this.setupPopupEventListeners(marker);

        } catch (error) {
            ErrorHandler.handle(error, 'Bind Popup to Marker');
        }
    }

    /**
     * Sets up popup event listeners
     * @private
     * @param {L.CircleMarker} marker - Marker with popup
     */
    setupPopupEventListeners(marker) {
        marker.on('popupopen', (e) => {
            const popupElement = e.popup.getElement();
            if (popupElement) {
                if (this.activePopups.size >= this.MAX_ACTIVE_POPUPS) {
                    const oldestPopup = Array.from(this.activePopups)[0];
                    oldestPopup.closePopup();
                }
                this.activePopups.add(marker);
                this.initializePopupImage(popupElement);
                AnalyticsManager.trackEvent('Popup', 'Open', marker.hospitalData.name);
            }
        });

        marker.on('popupclose', () => {
            this.activePopups.delete(marker);
            AnalyticsManager.trackEvent('Popup', 'Close', marker.hospitalData.name);
        });
    }

    /**
     * Generates popup content
     * @private
     * @param {Object} hospital - Hospital data
     * @returns {HTMLElement} Popup content element
     */
    generatePopupContent(hospital) {
        if (!hospital) return document.createElement('div');

        const { translations, language } = store.getState();
        const currentTranslations = translations[language] || translations[CONFIG.UI.DEFAULT_LANGUAGE];

        const container = document.createElement('div');
        container.className = 'popup-content';

        const address = Utils.parseAddress(hospital.address);
        const sanitizedName = this.securityManager.sanitizeInput(hospital.name);
        const sanitizedWebsite = this.securityManager.validateUrl(hospital.website) ?
            hospital.website : '#';
        const sanitizedImageUrl = this.securityManager.validateUrl(hospital.imageUrl) ?
            hospital.imageUrl : CONFIG.UI.IMAGE.DEFAULT;

        const statusKey = `status${hospital.status.replace(/\s+/g, '')}`;
        const translatedStatus = currentTranslations[statusKey] || hospital.status;

        container.innerHTML = this.getPopupHTML(
            sanitizedName,
            sanitizedImageUrl,
            address,
            sanitizedWebsite,
            translatedStatus,
            currentTranslations
        );

        return container;
    }

    /**
     * Gets HTML content for popup
     * @private
     * @param {Object} params - Popup content parameters
     * @returns {string} HTML content
     */
    getPopupHTML({ name, imageUrl, address, website, status, translations }) {
        return `
            <h3 class="popup-title">${name}</h3>
            <div class="popup-image-wrapper">
                <img 
                    src="${CONFIG.UI.IMAGE.DEFAULT}"
                    data-src="${imageUrl}" 
                    alt="${name}"
                    class="popup-image"
                    data-loading-state="${CONFIG.UI.IMAGE.STATES.LOADING}"
                />
            </div>
            <div class="popup-address">
                <strong>${translations.address || 'Address'}:</strong>
                <span class="popup-address-line">${address.street}</span>
                ${address.postalCode || address.city ?
                `<span class="popup-address-line">${[address.postalCode, address.city]
                    .filter(Boolean).join(' ')}</span>`
                : ''}
                <span class="popup-address-line">${address.country}</span>
            </div>
            <a href="${website}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="popup-link">
               ${translations.visitWebsite || 'Visit Website'}
            </a>
            <div class="popup-status">
                <span>${translations.status || 'Status'}:</span>
                <span class="status-tag status-${status.toLowerCase().replace(/\s+/g, '-')} active">
                    ${status}
                </span>
            </div>
        `;
    }

    /**
     * Binds tooltip to marker
     * @private
     * @param {L.CircleMarker} marker - Marker to bind tooltip to
     */
    bindTooltipToMarker(marker) {
        if (!marker?.hospitalData?.name) return;

        marker.bindTooltip(marker.hospitalData.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -10],
            opacity: 0.9,
            className: 'hospital-tooltip'
        });
    }

    /**
     * Updates visible markers
     * @private
     */
    async updateVisibleMarkers() {
        if (!this.map || !this.markers.size) return;

        try {
            const bounds = this.map.getBounds();
            const visibleMarkers = [];

            this.markers.forEach(marker => {
                if (bounds.contains(marker.getLatLng())) {
                    visibleMarkers.push(marker.hospitalData);
                }
            });

            store.setState({ visibleHospitals: visibleMarkers });
            await this.checkAndOptimizeMarkers();

            AnalyticsManager.trackEvent('Map', 'VisibleMarkers', `Count: ${visibleMarkers.length}`);
        } catch (error) {
            ErrorHandler.handle(error, 'Update Visible Markers');
        }
    }

    /**
     * Checks and optimizes markers for performance
     * @private
     * @async
     */
    async checkAndOptimizeMarkers() {
        if (this.markers.size > this.MARKER_CLEANUP_THRESHOLD) {
            try {
                const bounds = this.map.getBounds();
                const padding = 0.5; // 50% padding around current view

                const extendedBounds = L.latLngBounds(
                    [bounds.getSouth() - padding, bounds.getWest() - padding],
                    [bounds.getNorth() + padding, bounds.getEast() + padding]
                );

                let optimizedCount = 0;
                this.markers.forEach((marker, id) => {
                    if (!extendedBounds.contains(marker.getLatLng())) {
                        if (marker.getPopup()) marker.unbindPopup();
                        if (marker.getTooltip()) marker.unbindTooltip();
                        this.markerClusterGroup.removeLayer(marker);
                        this.markers.delete(id);
                        optimizedCount++;
                    }
                });

                if (optimizedCount > 0) {
                    console.log(`Optimized ${optimizedCount} markers`);
                    await this.performanceManager.trackMemoryUsage('markerOptimization');
                    AnalyticsManager.trackEvent('Performance', 'MarkerOptimization', `Removed: ${optimizedCount}`);
                }
            } catch (error) {
                ErrorHandler.handle(error, 'Marker Optimization');
            }
        }
    }

    /**
     * Fits the map view to show all markers
     * @async
     * @private
     * @returns {Promise<boolean>} Success status
     */
    async fitMarkersToView() {
        if (!this.map || this.markers.size === 0) return false;

        try {
            const bounds = L.latLngBounds(
                Array.from(this.markers.values()).map(m => m.getLatLng())
            );

            await new Promise(resolve => {
                this.map.fitBounds(bounds, {
                    padding: CONFIG.MAP.BOUNDS_PADDING,
                    maxZoom: SecurityConfig.VALIDATION.MAX_ZOOM_LEVEL,
                    animate: true,
                    duration: 1
                });

                this.map.once('moveend', resolve);
            });

            return true;
        } catch (error) {
            ErrorHandler.handle(error, 'Fit Markers to View');
            return false;
        }
    }

    /**
     * Cleans up the map manager
     * @async
     * @returns {Promise<boolean>} Success status
     */
    async cleanup() {
        try {
            this.performanceManager.startMeasure('cleanup');

            this.activePopups.forEach(marker => {
                if (marker.getPopup()) {
                    marker.closePopup();
                }
            });
            this.activePopups.clear();

            if (this.markers.size > 0) {
                this.markers.forEach(marker => {
                    marker.off();
                    if (marker.getPopup()) marker.unbindPopup();
                    if (marker.getTooltip()) marker.unbindTooltip();
                });
                this.markers.clear();
            }

            this.markerIconCache.clear();
            this.markerQueue = [];
            this.isProcessingQueue = false;

            if (this.map) {
                this.map.off();
                this.map.remove();
                this.map = null;
            }

            window.removeEventListener('resize', this.handleResize);

            this.performanceManager.endMeasure('cleanup');
            await this.performanceManager.destroy();

            return true;
        } catch (error) {
            ErrorHandler.handle(error, 'Map Cleanup');
            return false;
        }
    }
}

/**
 * Enhanced UI Manager class
 * Manages all user interface operations and interactions
 * 
 * @class
 * @since 1.0.0
 */
class EnhancedUIManager {
    /**
     * Creates an EnhancedUIManager instance
     * @constructor
     * @param {EnhancedMapManager} mapManager - Map manager instance
     * @throws {Error} If mapManager is not provided
     */
    constructor(mapManager) {
        if (!mapManager) {
            throw new Error('MapManager is required');
        }

        /**
         * Map manager instance
         * @type {EnhancedMapManager}
         * @private
         */
        this.mapManager = mapManager;

        /**
         * UI elements references
         * @type {Object.<string, HTMLElement>}
         * @private
         */
        this.elements = {};

        /**
         * Resize observer instance
         * @type {ResizeObserver|null}
         * @private
         */
        this.resizeObserver = null;

        /**
         * Security manager instance
         * @type {SecurityManager}
         * @private
         */
        this.securityManager = new EnhancedSecurityManager();

        /**
         * Performance manager instance
         * @type {PerformanceManager}
         * @private
         */
        this.performanceManager = new PerformanceManager();

        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        this.handleOrientationChange = this.handleOrientationChange.bind(this);
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.handleLegendToggle = this.handleLegendToggle.bind(this);
        this.handleControlsToggle = this.handleControlsToggle.bind(this);
        this.handleStatusTagClick = this.handleStatusTagClick.bind(this);
        this.updateFilters = this.updateFilters.bind(this);
        this.clearFilters = this.clearFilters.bind(this);
    }

    /**
     * Initializes the UI manager
     * @async
     * @returns {Promise<void>}
     * @throws {Error} If initialization fails
     */
    async init() {
        this.performanceManager.startMeasure('uiInit');

        try {
            await this.initElements();
            this.setupEnhancedEventListeners();
            this.loadUserPreferences();
            this.setupAccessibility();
            this.setupThemeDetection();
            this.setupResizeObserver();
            this.updateLayout();

            store.setState({
                ui: {
                    ...store.getState().ui,
                    controlsVisible: true,
                    legendVisible: true
                }
            });

            AnalyticsManager.trackEvent('UI', 'Initialize', 'Success');
            this.performanceManager.endMeasure('uiInit');
        } catch (error) {
            ErrorHandler.handle(error, 'UI Initialization');
            throw error;
        }
    }

    /**
     * Initializes UI elements
     * @async
     * @private
     * @returns {Promise<boolean>} Success status
     */
    async initElements() {
        const elements = [
            'map',
            'language-select',
            'continent-select',
            'country-filter',
            'city-filter',
            'hospital-search',
            'theme-toggle',
            'legend-toggle',
            'hamburger-menu',
            'controls',
            'error-message',
            'no-hospitals-message'
        ];

        this.elements = {};

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements[id] = element;
            } else {
                console.warn(`Element with id '${id}' not found`);
            }
        });

        const valid = await this.validateCriticalElements();
        if (!valid) {
            throw new Error('Critical UI elements missing');
        }

        return true;
    }

    /**
     * Validates critical UI elements
     * @private
     * @returns {boolean} Whether all critical elements exist
     */
    validateCriticalElements() {
        const criticalElements = ['map', 'controls'];
        const missingElements = criticalElements.filter(id => !document.getElementById(id));

        if (missingElements.length > 0) {
            console.error(`Critical elements missing: ${missingElements.join(', ')}`);
            return false;
        }

        return true;
    }

    /**
     * Sets up enhanced event listeners
     * @private
     */
    setupEnhancedEventListeners() {
        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('orientationchange', this.handleOrientationChange, { passive: true });
        window.addEventListener('keydown', this.handleEscapeKey);

        this.setupInputListeners();
        this.setupButtonListeners();
        this.setupFilterListeners();
    }

    /**
     * Sets up input event listeners
     * @private
     */
    setupInputListeners() {
        const languageSelect = this.elements['language-select'];
        if (languageSelect) {
            languageSelect.addEventListener('change', this.handleLanguageChange);
        }

        ['country-filter', 'city-filter', 'hospital-search'].forEach(id => {
            const element = this.elements[id];
            if (element) {
                element.addEventListener('input', Utils.debounce(
                    () => this.updateFilters(),
                    CONFIG.PERFORMANCE.DEBOUNCE_TIME
                ));
                this.setupMobileKeyboardHandling(element);
            }
        });
    }

    /**
     * Sets up button event listeners
     * @private
     */
    setupButtonListeners() {
        const buttonHandlers = {
            'theme-toggle': this.handleThemeToggle,
            'legend-toggle': this.handleLegendToggle,
            'hamburger-menu': this.handleControlsToggle
        };

        Object.entries(buttonHandlers).forEach(([id, handler]) => {
            const element = this.elements[id];
            if (element) {
                element.addEventListener('click', () => {
                    if (this.securityManager.checkRateLimit('button-click')) {
                        handler();
                    } else {
                        Utils.showError(CONFIG.ERROR_MESSAGES.RATE_LIMIT);
                    }
                });
                this.addKeyboardSupport(element, handler);
            }
        });
    }

    /**
     * Sets up filter event listeners
     * @private
     */
    setupFilterListeners() {
        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.handleStatusTagClick(e, tag));
            this.addKeyboardSupport(tag, (e) => this.handleStatusTagClick(e, tag));
        });
    }

    /**
     * Sets up accessibility features
     * @private
     */
    setupAccessibility() {
        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.setAttribute('role', 'button');
            tag.setAttribute('tabindex', '0');
            tag.setAttribute('aria-pressed', 'false');
        });

        ['theme-toggle', 'legend-toggle', 'hamburger-menu'].forEach(id => {
            const element = this.elements[id];
            if (element) {
                element.setAttribute('role', 'button');
                element.setAttribute('tabindex', '0');
            }
        });
    }

    /**
     * Sets up theme detection
     * @private
     */
    setupThemeDetection() {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const savedPreferences = Utils.loadPreferences();

        if (savedPreferences?.darkMode !== undefined) {
            this.setDarkMode(savedPreferences.darkMode);
        } else {
            this.setDarkMode(darkModeMediaQuery.matches);
        }

        darkModeMediaQuery.addEventListener('change', (e) => {
            if (!Utils.loadPreferences()?.darkMode) {
                this.setDarkMode(e.matches);
            }
        });
    }

    /**
     * Sets up resize observer
     * @private
     */
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(Utils.throttle(() => {
                if (this.mapManager.map) {
                    this.mapManager.map.invalidateSize();
                }
            }, CONFIG.PERFORMANCE.THROTTLE_TIME));

            const mapContainer = this.elements['map'];
            if (mapContainer) {
                this.resizeObserver.observe(mapContainer);
            }
        }
    }

    /**
     * Handles resize events
     * @private
     */
    handleResize() {
        this.updateLayout();
        AnalyticsManager.trackEvent('UI', 'Resize', `Width: ${window.innerWidth}`);
    }

    /**
     * Handles orientation change events
     * @private
     */
    handleOrientationChange() {
        setTimeout(() => {
            this.updateLayout();
        }, 100);
    }

    /**
     * Handles escape key events
     * @private
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleEscapeKey(e) {
        if (e.key === 'Escape') {
            if (this.mapManager.map) {
                this.mapManager.map.closePopup();
            }
            if (window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT) {
                this.hideControls();
            }
            document.activeElement?.blur();
        }
    }

    /**
     * Handles language change events
     * @private
     * @param {Event} event - Change event
     */
    handleLanguageChange(event) {
        const language = this.securityManager.sanitizeInput(event.target.value);
        this.updateTranslations(language);

        if (this.mapManager) {
            this.mapManager.updateOpenPopups();
        }

        Utils.savePreferences({
            ...Utils.loadPreferences(),
            language
        });

        AnalyticsManager.trackEvent('UI', 'LanguageChange', language);
    }

    /**
     * Handles theme toggle events
     * @private
     */
    handleThemeToggle() {
        const { darkMode } = store.getState();
        const newDarkMode = !darkMode;

        this.setDarkMode(newDarkMode);
        AnalyticsManager.trackEvent('UI', 'ThemeToggle', newDarkMode ? 'Dark' : 'Light');
    }

    /**
     * Sets dark mode
     * @param {boolean} enabled - Whether dark mode should be enabled
     */
    setDarkMode(enabled) {
        document.body.classList.toggle('dark-mode', enabled);
        store.setState({ darkMode: enabled });

        if (this.mapManager) {
            this.mapManager.updateTileLayer();
        }

        Utils.savePreferences({
            ...Utils.loadPreferences(),
            darkMode: enabled
        });
    }

    /**
     * Handles legend toggle events
     * @private
     */
    handleLegendToggle() {
        const { ui } = store.getState();
        const newLegendVisible = !ui.legendVisible;

        const legendContainer = document.querySelector('.legend-container');
        if (legendContainer) {
            legendContainer.classList.toggle('hidden', !newLegendVisible);
        }

        store.setState({
            ui: { ...ui, legendVisible: newLegendVisible }
        });

        AnalyticsManager.trackEvent('UI', 'LegendToggle', newLegendVisible ? 'Show' : 'Hide');
    }

    /**
     * Handles controls toggle events
     * @private
     */
    handleControlsToggle() {
        const controls = this.elements['controls'];
        const hamburger = this.elements['hamburger-menu'];

        if (!controls || !hamburger) return;

        const isVisible = !controls.classList.contains('hidden');

        controls.classList.toggle('hidden', isVisible);
        hamburger.classList.toggle('active', !isVisible);
        hamburger.setAttribute('aria-expanded', (!isVisible).toString());

        store.setState({
            ui: {
                ...store.getState().ui,
                controlsVisible: !isVisible
            }
        });

        AnalyticsManager.trackEvent('UI', 'ControlsToggle', isVisible ? 'Hide' : 'Show');
    }

    /**
     * Hides controls on mobile
     * @private
     */
    hideControls() {
        const controls = this.elements['controls'];
        const hamburger = this.elements['hamburger-menu'];

        if (controls && hamburger) {
            controls.classList.add('hidden');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');

            store.setState({
                ui: {
                    ...store.getState().ui,
                    controlsVisible: false
                }
            });
        }
    }

    /**
     * Handles status tag click events
     * @private
     * @param {Event} e - Click event
     * @param {HTMLElement} tag - Clicked tag element
     */
    handleStatusTagClick(e, tag) {
        if (!tag) return;

        e.preventDefault();
        e.stopPropagation();

        const status = this.securityManager.sanitizeInput(tag.getAttribute('status'));
        if (!status) return;

        const { activeStatus } = store.getState();
        const isActive = activeStatus.includes(status);
        const newActiveStatus = isActive
            ? activeStatus.filter(s => s !== status)
            : [...activeStatus, status];

        tag.classList.toggle('active', !isActive);
        tag.setAttribute('aria-pressed', (!isActive).toString());

        store.setState({ activeStatus: newActiveStatus });

        Utils.savePreferences({
            ...Utils.loadPreferences(),
            activeStatus: newActiveStatus
        });

        this.updateFilters();

        AnalyticsManager.trackEvent('Filter', 'StatusToggle', `${status}: ${!isActive}`);
    }

    /**
     * Updates layout based on screen size
     * @private
     */
    updateLayout() {
        const isMobile = window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT;
        document.body.classList.toggle('mobile-view', isMobile);

        if (this.mapManager.map) {
            this.mapManager.map.invalidateSize();
        }
    }

    /**
     * Updates translations
     * @param {string} language - Language code
     */
    updateTranslations(language) {
        const { translations } = store.getState();
        const currentTranslations = translations[language] || translations[CONFIG.UI.DEFAULT_LANGUAGE];

        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (currentTranslations[key]) {
                if (element.tagName === 'INPUT') {
                    element.placeholder = currentTranslations[key];
                } else {
                    element.textContent = currentTranslations[key];
                }
            }
        });

        document.documentElement.setAttribute('lang', language);
        store.setState({ language });
    }

    /**
     * Loads user preferences
     * @private
     */
    loadUserPreferences() {
        const preferences = Utils.loadPreferences();
        if (preferences) {
            if (preferences.language) {
                this.updateTranslations(preferences.language);
            }
            if (preferences.darkMode !== undefined) {
                this.setDarkMode(preferences.darkMode);
            }
            if (preferences.activeStatus) {
                store.setState({ activeStatus: preferences.activeStatus });
                this.applyStatusFilters(preferences.activeStatus);
            }
        }
    }

    /**
     * Updates filters
     * Updates filters
     * @private
     */
    updateFilters() {
        const filters = this.getCurrentFilters();
        store.setState({ filters });

        const filteredHospitals = this.filterHospitals(filters);

        if (this.mapManager?.markerClusterGroup) {
            this.mapManager.markerClusterGroup.clearLayers();

            const markersToAdd = [];

            filteredHospitals.forEach(hospital => {
                const marker = this.mapManager.markers.get(hospital.id);
                if (marker && marker instanceof L.CircleMarker) {
                    markersToAdd.push(marker);
                }
            });

            if (markersToAdd.length > 0) {
                this.mapManager.markerClusterGroup.addLayers(markersToAdd);

                const bounds = L.latLngBounds(markersToAdd.map(m => m.getLatLng()));
                this.mapManager.map.fitBounds(bounds, {
                    padding: CONFIG.MAP.BOUNDS_PADDING,
                    maxZoom: this.mapManager.map.getZoom()
                });
            }
        }

        GaugeManager.updateAllGauges(filteredHospitals);

        this.updateURLParams(filters);

        Utils.savePreferences({
            ...Utils.loadPreferences(),
            filters
        });

        const noResults = this.elements['no-hospitals-message'];
        if (noResults) {
            noResults.style.display = filteredHospitals.length === 0 ? 'block' : 'none';
        }

        AnalyticsManager.trackEvent('Filter', 'Update', `Results: ${filteredHospitals.length}`);
    }

    /**
     * Gets current filters state
     * @private
     * @returns {Object} Current filters
     */
    getCurrentFilters() {
        const searchTerm = this.elements['hospital-search']?.value;
        const continent = this.elements['continent-select']?.value;
        const country = this.elements['country-filter']?.value;
        const city = this.elements['city-filter']?.value;

        return {
            activeStatus: store.getState().activeStatus,
            searchTerm: this.securityManager.sanitizeInput(searchTerm?.toLowerCase() || ''),
            continent: this.securityManager.sanitizeInput(continent || ''),
            country: this.securityManager.sanitizeInput(country?.toLowerCase() || ''),
            city: this.securityManager.sanitizeInput(city?.toLowerCase() || '')
        };
    }

    /**
     * Filters hospitals based on current filters
     * @private
     * @param {Object} filters - Current filters
     * @returns {Array<Object>} Filtered hospitals
     */
    filterHospitals(filters) {
        const { hospitals } = store.getState();

        return hospitals.filter(hospital => {
            // Status filter
            if (filters.activeStatus.length && !filters.activeStatus.includes(hospital.status)) {
                return false;
            }

            // Search term filter
            if (filters.searchTerm &&
                !hospital.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
                return false;
            }

            const address = Utils.parseAddress(hospital.address);

            // Continent filter
            if (filters.continent) {
                const hospitalContinent = Utils.getContinent(hospital.lat, hospital.lon);
                if (hospitalContinent !== filters.continent) {
                    return false;
                }
            }

            // Country filter
            if (filters.country && !address.country.toLowerCase().includes(filters.country.toLowerCase())) {
                return false;
            }

            // City filter
            if (filters.city && !address.city.toLowerCase().includes(filters.city.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    /**
     * Updates URL parameters based on current filters
     * @private
     * @param {Object} filters - Current filters
     */
    updateURLParams(filters) {
        const params = new URLSearchParams(window.location.search);

        Object.entries(filters).forEach(([key, value]) => {
            if (value && (typeof value === 'string' || Array.isArray(value))) {
                params.set(key, Array.isArray(value) ? value.join(',') : value);
            } else {
                params.delete(key);
            }
        });

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
    }

    /**
     * Sets up mobile keyboard handling
     * @private
     * @param {HTMLElement} element - Input element
     */
    setupMobileKeyboardHandling(element) {
        if (!element) return;

        const handleFocus = () => {
            if (window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT) {
                document.body.classList.add('keyboard-open');
                this.mapManager.map?.invalidateSize();
            }
        };

        const handleBlur = () => {
            if (window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT) {
                document.body.classList.remove('keyboard-open');
                this.mapManager.map?.invalidateSize();
            }
        };

        element.addEventListener('focus', handleFocus);
        element.addEventListener('blur', handleBlur);

        element._mobileKeyboardHandlers = {
            focus: handleFocus,
            blur: handleBlur
        };
    }

    /**
     * Adds keyboard support to element
     * @private
     * @param {HTMLElement} element - Element to enhance
     * @param {Function} handler - Click handler
     */
    addKeyboardSupport(element, handler) {
        if (!element || !handler) return;

        const keyboardHandler = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler(e);
            }
        };

        element.addEventListener('keydown', keyboardHandler);
        element._keyboardHandler = keyboardHandler;
    }

    /**
     * Clears all filters
     */
    clearFilters() {
        ['hospital-search', 'country-filter', 'city-filter'].forEach(id => {
            const element = this.elements[id];
            if (element) {
                element.value = '';
            }
        });

        const continentSelect = this.elements['continent-select'];
        if (continentSelect) {
            continentSelect.selectedIndex = 0;
        }

        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.classList.remove('active');
            tag.setAttribute('aria-pressed', 'false');
        });

        store.setState({ activeStatus: [] });

        if (this.mapManager?.markerClusterGroup) {
            this.mapManager.markerClusterGroup.clearLayers();

            const { hospitals } = store.getState();
            const markersToAdd = [];

            hospitals.forEach(hospital => {
                const marker = this.mapManager.markers.get(hospital.id);
                if (marker && marker instanceof L.CircleMarker) {
                    markersToAdd.push(marker);
                }
            });

            if (markersToAdd.length > 0) {
                this.mapManager.markerClusterGroup.addLayers(markersToAdd);

                const bounds = L.latLngBounds(markersToAdd.map(m => m.getLatLng()));
                this.mapManager.map.fitBounds(bounds, {
                    padding: CONFIG.MAP.BOUNDS_PADDING
                });
            }

            GaugeManager.updateAllGauges(hospitals);
        }

        const noResults = this.elements['no-hospitals-message'];
        if (noResults) {
            noResults.style.display = 'none';
        }

        AnalyticsManager.trackEvent('Filter', 'Clear');
    }

    /**
     * Applies status filters
     * @private
     * @param {Array<string>} statuses - Statuses to apply
     */
    applyStatusFilters(statuses) {
        if (!Array.isArray(statuses)) return;

        document.querySelectorAll('.status-tag').forEach(tag => {
            const status = tag.getAttribute('status');
            const isActive = statuses.includes(status);
            tag.classList.toggle('active', isActive);
            tag.setAttribute('aria-pressed', isActive.toString());
        });
    }

    /**
     * Cleans up the UI manager
     */
    destroy() {
        try {
            this.performanceManager.startMeasure('uiDestroy');

            window.removeEventListener('resize', this.handleResize);
            window.removeEventListener('orientationchange', this.handleOrientationChange);
            window.removeEventListener('keydown', this.handleEscapeKey);

            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }

            Object.values(this.elements).forEach(element => {
                if (element?._mobileKeyboardHandlers) {
                    element.removeEventListener('focus', element._mobileKeyboardHandlers.focus);
                    element.removeEventListener('blur', element._mobileKeyboardHandlers.blur);
                }
                if (element?._keyboardHandler) {
                    element.removeEventListener('keydown', element._keyboardHandler);
                }
            });

            this.elements = {};
            this.mapManager = null;

            this.performanceManager.endMeasure('uiDestroy');
            this.performanceManager.destroy();

            console.log('UIManager cleanup completed successfully');
        } catch (error) {
            ErrorHandler.handle(error, 'UIManager Cleanup');
        }
    }
}

// Initialize application
/**
 * Initializes the enhanced application
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function initEnhancedApplication() {
    const securityManager = new EnhancedSecurityManager();
    const performanceManager = new PerformanceManager();

    try {
        performanceManager.startMeasure('appInit');
        console.log('Starting enhanced application initialization...');

        if (!navigator.onLine) {
            document.body.classList.add('offline');
        }

        if (store.getState().isInitialized) {
            console.log('Application already initialized');
            return;
        }

        const mapElement = document.getElementById('map');
        const controlsElement = document.getElementById('controls');

        if (!mapElement || !controlsElement) {
            throw new Error(CONFIG.ERROR_MESSAGES.INIT_FAILED);
        }

        const loader = document.getElementById('initial-loader');
        if (loader) loader.style.display = 'block';

        const mapManager = new EnhancedMapManager('map');
        await mapManager.init();

        const uiManager = new EnhancedUIManager(mapManager);
        await uiManager.init();

        await GaugeManager.initGauges();

        const preferences = Utils.loadPreferences();
        if (preferences?.language) {
            uiManager.updateTranslations(preferences.language);
        }
        if (preferences?.darkMode !== undefined) {
            uiManager.setDarkMode(preferences.darkMode);
        }

        const validatedHospitals = hospitals.filter(hospital =>
            securityManager.validateCoordinates(hospital.lat, hospital.lon) &&
            securityManager.sanitizeInput(hospital.name)
        );

        await mapManager.addMarkers(validatedHospitals);
        await GaugeManager.updateAllGauges(validatedHospitals);

        if (loader) loader.style.display = 'none';

        store.setState({ isInitialized: true });

        performanceManager.endMeasure('appInit');
        AnalyticsManager.trackEvent('App', 'Initialize', 'Success');

        console.log('Enhanced application initialized successfully');
    } catch (error) {
        console.error('Initialization error details:', error);
        ErrorHandler.handle(error, 'Application Initialization');
        throw error;
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('load', () => {
            initEnhancedApplication().catch(error => {
                ErrorHandler.handle(error, 'Application Load');
            });
        });
    });
} else {
    window.addEventListener('load', () => {
        initEnhancedApplication().catch(error => {
            ErrorHandler.handle(error, 'Application Load');
        });
    });
}

export {
    initEnhancedApplication,
    EnhancedMapManager,
    EnhancedUIManager,
    Utils,
    store,
    CONFIG,
    SecurityConfig,
    PerformanceConfig,
    AnalyticsManager,
    PerformanceManager,
    SecurityManager,
    ErrorHandler
};