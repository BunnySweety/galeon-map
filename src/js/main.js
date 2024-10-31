/**
 * @fileoverview Complete hospital map application with security and performance optimizations
 * @author BunnySweety
 * @version 2.0.0
 */

'use strict';

/**
 * Import required modules
 */
import { GaugeManager } from './gauge.js';
import { translations } from '../../data/translations.js';
import { hospitals } from '../../data/hospitals.js';
import { SecurityManager, SecurityConfig } from './security.js';
import { PerformanceManager, PerformanceConfig } from './performance.js';

/**
 * Service Worker Manager
 */
class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.setupServiceWorker();
    }

    async setupServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        try {
            this.registration = await navigator.serviceWorker.register('/sw.js');
            this.handleUpdates();
        } catch (error) {
            console.error('ServiceWorker registration failed:', error);
        }
    }

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

    showUpdateNotification() {
        const shouldUpdate = confirm('A new version is available. Would you like to update ?');
        if (shouldUpdate) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }
}

/**
 * Network Manager
 */
class NetworkManager {
    constructor() {
        this.setupNetworkListeners();
    }

    setupNetworkListeners() {
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    handleOnline() {
        document.body.classList.remove('offline');
        // Notification optionnelle
        Utils.showError('Internet connection restored', 3000);
    }

    handleOffline() {
        document.body.classList.add('offline');
        // Notification optionnelle
        Utils.showError('You are offline. Some features may be limited', 5000);
    }
}

// Initialize managers
const swManager = new ServiceWorkerManager();
const networkManager = new NetworkManager();

/**
 * Application configuration constants
 * @constant
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
 * Utility functions with enhanced security and performance
 */
const Utils = {
    debounce(fn, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    },

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

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },

    getContinent(lat, lon) {
        for (const [name, bounds] of Object.entries(CONFIG.REGIONS)) {
            if (lat >= bounds.lat[0] && lat <= bounds.lat[1] &&
                lon >= bounds.lon[0] && lon <= bounds.lon[1]) {
                return name.replace('_', ' ');
            }
        }
        return 'Unknown';
    },

    parseAddress(address) {
        const securityManager = SecurityManager.getInstance();
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

    validateCoordinates(lat, lon) {
        const securityManager = SecurityManager.getInstance();
        return securityManager.validateCoordinates(lat, lon);
    },

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

    showError(message, duration = 5000) {
        const securityManager = SecurityManager.getInstance();
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

    savePreferences(preferences) {
        try {
            const securityManager = SecurityManager.getInstance();
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
            console.error('Error saving preferences:', error);
            ErrorHandler.handle(error, 'Save Preferences');
        }
    },

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
            console.error('Error loading preferences:', error);
            ErrorHandler.handle(error, 'Load Preferences');
            return null;
        }
    },

    validateAndSanitizeInput(input, type = 'text') {
        const securityManager = SecurityManager.getInstance();
        const sanitized = securityManager.sanitizeInput(input);
        
        switch(type) {
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

    async loadResourceSafely(url, options = {}) {
        const securityManager = SecurityManager.getInstance();
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
 * Analytics Manager with enhanced tracking
 */
class AnalyticsManager {
    static #performanceManager = new PerformanceManager();
    static #securityManager = SecurityManager.getInstance();
    static #trackingEnabled = true;

    static setTrackingEnabled(enabled) {
        this.#trackingEnabled = enabled;
    }

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

    static trackError(error, context = '') {
        if (!this.#trackingEnabled) return;

        const sanitizedError = this.#securityManager.sanitizeInput(error.message);
        const sanitizedContext = this.#securityManager.sanitizeInput(context);
        
        console.error('Error:', sanitizedContext, sanitizedError);
    }

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
 * Error Handler with enhanced tracking
 */
class ErrorHandler {
    static #securityManager = SecurityManager.getInstance();
    static #performanceManager = new PerformanceManager();

    static handle(error, context = '') {
        this.#performanceManager.startMeasure('errorHandling');

        const sanitizedError = this.#securityManager.sanitizeInput(error.message);
        const sanitizedContext = this.#securityManager.sanitizeInput(context);
        
        AnalyticsManager.trackError(error, sanitizedContext);
        Utils.showError(sanitizedError);

        this.#performanceManager.endMeasure('errorHandling');
    }

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
 * Global Store with enhanced security
 */
class Store {
    #securityManager = SecurityManager.getInstance();
    #performanceManager = new PerformanceManager();
    
    constructor(initialState = {}) {
        this.state = initialState;
        this.initialState = this.cloneState(initialState);
        this.listeners = new Set();
        this.history = [];
        this.maxHistoryLength = 10;
    }

    cloneState(obj) {
        if (obj instanceof L.Map ||
            obj instanceof L.MarkerClusterGroup ||
            obj instanceof L.Layer ||
            obj instanceof L.Marker) {
            return obj;
        }

        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj);
        }

        if (obj instanceof Array) {
            return obj.map(item => this.cloneState(item));
        }

        if (obj instanceof Map) {
            return new Map([...obj].map(([key, value]) => [key, this.cloneState(value)]));
        }

        const cloned = {};
        for (const [key, value] of Object.entries(obj)) {
            cloned[key] = this.cloneState(value);
        }
        return cloned;
    }

    setState(newState, recordHistory = true) {
        this.#performanceManager.startMeasure('setState');

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
    }

    getState() {
        return this.cloneState(this.state);
    }

    subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Store subscriber must be a function');
        }
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

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

    reset() {
        this.history = [];
        this.setState(this.initialState, false);
    }
}

/**
 * Global store instance
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
    filters: {
        continent: '',
        country: '',
        city: '',
        searchTerm: '',
        statuses: []
    },
    ui: {
        controlsVisible: false,
        legendVisible: true,
        selectedHospital: null,
        loading: false,
        error: null
    }
});

/**
 * Enhanced Map Manager Class
 */
class EnhancedMapManager {
    constructor(containerId = 'map') {
        this.containerId = containerId;
        this.map = null;
        this.markerClusterGroup = null;
        this.markers = new Map();
        this.activePopups = new Set();
        this.securityManager = SecurityManager.getInstance();
        this.performanceManager = new PerformanceManager();

        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);
        this.handleZoomEnd = this.handleZoomEnd.bind(this);
        this.handleMoveEnd = this.handleMoveEnd.bind(this);
        this.createClusterIcon = this.createClusterIcon.bind(this);
        this.updateVisibleMarkers = this.updateVisibleMarkers.bind(this);
        this.updateTileLayer = this.updateTileLayer.bind(this);
        this.updateOpenPopups = this.updateOpenPopups.bind(this);
    }

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

            await this.setupPanes();
            await this.setupMarkerCluster();
            await this.updateTileLayer();
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

    setupSecurityBoundaries() {
        this.map.setMaxBounds(SecurityConfig.VALIDATION.MAX_BOUNDS);
        
        this.map.on('zoomend', () => {
            const zoom = this.map.getZoom();
            if (zoom > SecurityConfig.VALIDATION.MAX_ZOOM_LEVEL) {
                this.map.setZoom(SecurityConfig.VALIDATION.MAX_ZOOM_LEVEL);
            }
        });
    }

    async setupPanes() {
        if (!this.map) return;

        this.performanceManager.startMeasure('setupPanes');
        
        this.map.createPane('markerPane').style.zIndex = 450;
        this.map.createPane('popupPane').style.zIndex = 500;
        this.map.createPane('tooltipPane').style.zIndex = 550;
        
        this.performanceManager.endMeasure('setupPanes');
    }

    async setupMarkerCluster() {
        if (!this.map) return;

        this.performanceManager.startMeasure('setupCluster');

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
            iconCreateFunction: this.createClusterIcon
        });

        this.markerClusterGroup = this.performanceManager.enhanceClusterPerformance(
            this.markerClusterGroup
        );

        this.map.addLayer(this.markerClusterGroup);
        store.setState({ markerClusterGroup: this.markerClusterGroup });
        
        this.performanceManager.endMeasure('setupCluster');
    }

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

            this.markerClusterGroup.on('animationend', () => {
                this.performanceManager.endMeasure('clusterAnimation');
            });
        }
    }

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

    handleZoomEnd() {
        if (!this.map) return;

        const zoom = this.map.getZoom();
        AnalyticsManager.trackEvent('Map', 'Zoom', `Level: ${zoom}`);
        store.setState({ currentZoom: zoom });
    }

    handleMoveEnd() {
        if (!this.map) return;

        const center = this.map.getCenter();
        if (!center) return;

        AnalyticsManager.trackEvent('Map', 'Move', `${center.lat},${center.lng}`);
        this.updateVisibleMarkers();
    }

    handleResize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }

    createClusterIcon(cluster) {
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

    async updateTileLayer() {
        if (!this.map) return;

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
        }).addTo(this.map);
    }

    async addMarkers(hospitals) {
        if (!hospitals?.length || !this.markerClusterGroup) return;

        this.performanceManager.startMeasure('addMarkers');

        try {
            this.markerClusterGroup.clearLayers();
            this.markers.clear();

            // Validate and filter hospitals
            const validHospitals = hospitals.filter(hospital => 
                this.securityManager.validateCoordinates(hospital.lat, hospital.lon) &&
                this.securityManager.sanitizeInput(hospital.name)
            );

            const chunks = this.performanceManager.chunkArray(
                validHospitals,
                PerformanceConfig.MARKERS.CHUNK_SIZE
            );

            for (const chunk of chunks) {
                await new Promise(resolve => {
                    requestAnimationFrame(async () => {
                        const markers = await Promise.all(
                            chunk.map(hospital => this.createMarker(hospital))
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

            if (this.markers.size > 0) {
                const bounds = L.latLngBounds(
                    Array.from(this.markers.values()).map(m => m.getLatLng())
                );
                this.map.fitBounds(bounds, {
                    padding: CONFIG.MAP.BOUNDS_PADDING,
                    maxZoom: SecurityConfig.VALIDATION.MAX_ZOOM_LEVEL
                });
            }

            await GaugeManager.updateAllGauges(validHospitals);

            this.performanceManager.endMeasure('addMarkers');
        } catch (error) {
            ErrorHandler.handle(error, 'Add Markers');
        }
    }

    createMarker(hospital) {
        if (!Utils.validateCoordinates(hospital.lat, hospital.lon)) {
            console.warn(`Invalid coordinates for hospital ${hospital.id}`);
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

            this.bindPopupToMarker(marker);
            this.bindTooltipToMarker(marker);

            marker.on('click', () => {
                AnalyticsManager.trackEvent('Marker', 'Click', hospital.name);
            });

            return marker;
        } catch (error) {
            console.error('Error creating marker:', error);
            return null;
        }
    }

    updateVisibleMarkers() {
        if (!this.map || !this.markers.size) return;

        const bounds = this.map.getBounds();
        const visibleMarkers = [];

        this.markers.forEach(marker => {
            if (bounds.contains(marker.getLatLng())) {
                visibleMarkers.push(marker.hospitalData);
            }
        });

        store.setState({ visibleHospitals: visibleMarkers });
        AnalyticsManager.trackEvent('Map', 'VisibleMarkers', `Count: ${visibleMarkers.length}`);
    }

    bindPopupToMarker(marker) {
        if (!marker?.hospitalData) return;

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

        marker.bindPopup(() => {
            const content = this.generatePopupContent(marker.hospitalData);
            return content;
        });

        marker.on('popupopen', (e) => {
            const popupElement = e.popup.getElement();
            if (popupElement) {
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

    updateOpenPopups() {
        this.performanceManager.startMeasure('updatePopups');
        
        this.activePopups.forEach(marker => {
            if (marker.getPopup() && marker.getPopup().isOpen()) {
                const popup = marker.getPopup();
                const newContent = this.generatePopupContent(marker.hospitalData);
                popup.setContent(newContent);
                
                const popupElement = popup.getElement();
                if (popupElement) {
                    this.initializePopupImage(popupElement);
                }
            }
        });

        this.performanceManager.endMeasure('updatePopups');
    }

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

        container.innerHTML = `
            <h3 class="popup-title">${sanitizedName}</h3>
            <div class="popup-image-wrapper">
                <img 
                    src="${CONFIG.UI.IMAGE.DEFAULT}"
                    data-src="${sanitizedImageUrl}" 
                    alt="${sanitizedName}"
                    class="popup-image"
                    data-loading-state="${CONFIG.UI.IMAGE.STATES.LOADING}"
                />
            </div>
            <div class="popup-address">
                <strong>${currentTranslations.address || 'Address'}:</strong>
                <span class="popup-address-line">${address.street}</span>
                ${address.postalCode || address.city ?
                `<span class="popup-address-line">${[address.postalCode, address.city]
                    .filter(Boolean).join(' ')}</span>`
                : ''}
                <span class="popup-address-line">${address.country}</span>
            </div>
            <a href="${sanitizedWebsite}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="popup-link">
               ${currentTranslations.visitWebsite || 'Visit Website'}
            </a>
            <div class="popup-status">
                <span>${currentTranslations.status || 'Status'}:</span>
                <span class="status-tag status-${hospital.status.toLowerCase().replace(/\s+/g, '-')} active">
                    ${translatedStatus}
                </span>
            </div>
        `;

        return container;
    }

    initializePopupImage(popupElement) {
        if (!popupElement) return;

        const img = popupElement.querySelector('.popup-image');
        if (!img?.dataset.src) return;

        const loadingState = img.getAttribute('data-loading-state');
        if (loadingState === CONFIG.UI.IMAGE.STATES.SUCCESS) return;

        const imageLoader = new Image();

        imageLoader.onload = () => {
            requestAnimationFrame(() => {
                if (img.parentElement) {
                    img.src = img.dataset.src;
                    img.setAttribute('data-loading-state', CONFIG.UI.IMAGE.STATES.SUCCESS);
                    AnalyticsManager.trackEvent('Image', 'Load', 'Success');
                }
            });
        };

        imageLoader.onerror = () => {
            requestAnimationFrame(() => {
                if (img.parentElement) {
                    img.src = CONFIG.UI.IMAGE.DEFAULT;
                    img.setAttribute('data-loading-state', CONFIG.UI.IMAGE.STATES.ERROR);
                    AnalyticsManager.trackEvent('Image', 'Load', 'Error');
                }
            });
        };

        if (loadingState !== CONFIG.UI.IMAGE.STATES.LOADING) {
            img.setAttribute('data-loading-state', CONFIG.UI.IMAGE.STATES.LOADING);
            imageLoader.src = img.dataset.src;
        }
    }

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

            if (this.map) {
                this.map.off();
                this.map.remove();
                this.map = null;
            }

            this.performanceManager.endMeasure('cleanup');
            await this.performanceManager.destroy();

            return true;
        } catch (error) {
            ErrorHandler.handle(error, 'Map Cleanup');
            return false;
        }
    }

    destroy() {
        try {
            this.performanceManager.startMeasure('mapDestroy');

            window.removeEventListener('resize', this.handleResize);
            if (this.map) {
                this.map.off('click', this.handleMapClick);
                this.map.off('zoomend', this.handleZoomEnd);
                this.map.off('moveend', this.handleMoveEnd);

                if (this.markerClusterGroup) {
                    this.markerClusterGroup.clearLayers();
                    this.map.removeLayer(this.markerClusterGroup);
                }

                if (this.userMarker) {
                    this.map.removeLayer(this.userMarker);
                }

                if (this.map.currentTileLayer) {
                    this.map.removeLayer(this.map.currentTileLayer);
                }

                this.map.remove();
            }

            this.map = null;
            this.markerClusterGroup = null;
            this.userMarker = null;
            this.markers.clear();
            this.activePopups.clear();

            this.performanceManager.endMeasure('mapDestroy');
            this.performanceManager.destroy();

            console.log('MapManager cleanup completed successfully');
        } catch (error) {
            ErrorHandler.handle(error, 'MapManager Cleanup');
        }
    }
}

/**
 * Enhanced UI Manager Class
 */
class EnhancedUIManager {
    constructor(mapManager) {
        if (!mapManager) {
            throw new Error('MapManager is required');
        }
        
        this.mapManager = mapManager;
        this.elements = {};
        this.resizeObserver = null;
        this.securityManager = SecurityManager.getInstance();
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

    validateCriticalElements() {
        const criticalElements = ['map', 'controls'];
        const missingElements = criticalElements.filter(id => !document.getElementById(id));

        if (missingElements.length > 0) {
            console.error(`Critical elements missing: ${missingElements.join(', ')}`);
            return false;
        }

        return true;
    }

    setupEnhancedEventListeners() {
        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('orientationchange', this.handleOrientationChange, { passive: true });
        window.addEventListener('keydown', this.handleEscapeKey);

        this.setupInputListeners();
        this.setupButtonListeners();
        this.setupFilterListeners();
    }

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

    setupFilterListeners() {
        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.handleStatusTagClick(e, tag));
            this.addKeyboardSupport(tag, (e) => this.handleStatusTagClick(e, tag));
        });
    }

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

    handleResize() {
        this.updateLayout();
        AnalyticsManager.trackEvent('UI', 'Resize', `Width: ${window.innerWidth}`);
    }

    handleOrientationChange() {
        setTimeout(() => {
            this.updateLayout();
        }, 100);
    }

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

    handleThemeToggle() {
        const { darkMode } = store.getState();
        const newDarkMode = !darkMode;
        
        this.setDarkMode(newDarkMode);
        AnalyticsManager.trackEvent('UI', 'ThemeToggle', newDarkMode ? 'Dark' : 'Light');
    }

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

    updateLayout() {
        const isMobile = window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT;
        document.body.classList.toggle('mobile-view', isMobile);

        if (this.mapManager.map) {
            this.mapManager.map.invalidateSize();
        }
    }

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

    applyStatusFilters(statuses) {
        if (!Array.isArray(statuses)) return;

        document.querySelectorAll('.status-tag').forEach(tag => {
            const status = tag.getAttribute('status');
            const isActive = statuses.includes(status);
            tag.classList.toggle('active', isActive);
            tag.setAttribute('aria-pressed', isActive.toString());
        });
    }

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

/**
 * Enhanced application initialization
 */
async function initEnhancedApplication() {
    const securityManager = SecurityManager.getInstance();
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

        // Validate critical elements
        const mapElement = document.getElementById('map');
        const controlsElement = document.getElementById('controls');

        if (!mapElement || !controlsElement) {
            throw new Error(CONFIG.ERROR_MESSAGES.INIT_FAILED);
        }

        // Show loader
        const loader = document.getElementById('initial-loader');
        if (loader) loader.style.display = 'block';

        // Initialize managers
        const mapManager = new EnhancedMapManager('map');
        await mapManager.init();

        const uiManager = new EnhancedUIManager(mapManager);
        await uiManager.init();

        // Initialize components
        await GaugeManager.initGauges();

        // Load and apply user preferences
        const preferences = Utils.loadPreferences();
        if (preferences?.language) {
            uiManager.updateTranslations(preferences.language);
        }
        if (preferences?.darkMode !== undefined) {
            uiManager.setDarkMode(preferences.darkMode);
        }

        // Load and display data
        const validatedHospitals = hospitals.filter(hospital => 
            securityManager.validateCoordinates(hospital.lat, hospital.lon) &&
            securityManager.sanitizeInput(hospital.name)
        );

        await mapManager.addMarkers(validatedHospitals);
        await GaugeManager.updateAllGauges(validatedHospitals);
        await applyInitialFilters(uiManager);

        // Hide loader
        if (loader) loader.style.display = 'none';

        // Set initialization flag
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

/**
 * Apply initial filters from URL parameters
 */
async function applyInitialFilters(uiManager) {
    const performanceManager = new PerformanceManager();
    
    try {
        performanceManager.startMeasure('applyFilters');
        const securityManager = SecurityManager.getInstance();
        const params = new URLSearchParams(window.location.search);

        // Apply status filters
        const statusParam = params.get('activeStatus');
        if (statusParam) {
            const statuses = statusParam.split(',')
                .map(s => securityManager.sanitizeInput(s))
                .filter(Boolean);
            
            store.setState({ activeStatus: statuses });
            uiManager.applyStatusFilters(statuses);
        }

        // Apply search term
        const searchTerm = params.get('searchTerm');
        if (searchTerm && uiManager.elements['hospital-search']) {
            uiManager.elements['hospital-search'].value = 
                securityManager.sanitizeInput(searchTerm);
        }

        // Apply other filters
        ['continent', 'country', 'city'].forEach(param => {
            const value = params.get(param);
            if (value && uiManager.elements[`${param}-filter`]) {
                uiManager.elements[`${param}-filter`].value = 
                    securityManager.sanitizeInput(value);
            }
        });

        await uiManager.updateFilters();
        performanceManager.endMeasure('applyFilters');
    } catch (error) {
        ErrorHandler.handle(error, 'Initial Filters');
    }
}

// Initialize application when DOM is ready
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

// Export enhanced modules
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