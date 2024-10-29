/**
 * @fileoverview Interactive hospital map application with filtering and clustering capabilities
 * @author BunnySweety
 * @version 1.0.0
 */

/**
 * Import required modules
 */
import { GaugeManager } from './gauge.js';
import { translations } from './translations.js';
import { hospitals } from './hospitals.js';

/**
 * @typedef {Object} Hospital
 * @property {string} id - Unique hospital identifier
 * @property {string} name - Hospital name
 * @property {number} lat - Latitude
 * @property {number} lon - Longitude
 * @property {string} status - Status (Deployed, In Progress, Signed)
 * @property {string} address - Full address
 * @property {string} imageUrl - Hospital image URL
 * @property {string} website - Hospital website URL
 */

/**
 * @typedef {Object} MapFilters
 * @property {string[]} activeStatus - Active status filters
 * @property {string} searchTerm - Search query
 * @property {string} continent - Selected continent
 * @property {string} country - Country filter
 * @property {string} city - City filter
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} language - User's preferred language
 * @property {boolean} darkMode - Dark mode setting
 * @property {string[]} activeStatus - Active status filters
 * @property {string} continent - Selected continent
 * @property {string} country - Selected country
 * @property {string} city - Selected city
 */

/**
 * Global application store for state management
 * @class Store
 */
class Store {
    /**
     * Creates a new Store instance
     * @param {Object} initialState - Initial store state
     */
    constructor(initialState = {}) {
        this.state = initialState;
        this.initialState = this.cloneState(initialState);
        this.listeners = new Set();
        this.history = [];
        this.maxHistoryLength = 10;
    }

    /**
     * Deep clones an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
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

    /**
     * Updates store state
     * @param {Object} newState - New state to merge
     * @param {boolean} [recordHistory=true] - Whether to record in history
     */
    setState(newState, recordHistory = true) {
        if (recordHistory) {
            this.history.push(this.cloneState(this.state));
            if (this.history.length > this.maxHistoryLength) {
                this.history.shift();
            }
        }

        const oldState = this.cloneState(this.state);
        this.state = { ...this.state, ...newState };

        let hasChanged = false;
        for (const key in newState) {
            if (oldState[key] !== this.state[key]) {
                hasChanged = true;
                break;
            }
        }

        if (hasChanged) {
            this.notify();
        }
    }

    /**
     * Gets current state
     * @returns {Object} Current state
     */
    getState() {
        return this.state;
    }    

    /**
     * Subscribes to state changes
     * @param {Function} listener - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notifies all listeners of state change
     * @private
     */
    notify() {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('Error in store listener:', error);
            }
        });
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
 * Application configuration constants
 * @constant
 */
const CONFIG = {
    UI: {
        MOBILE_BREAKPOINT: 1024,
        DEFAULT_LANGUAGE: 'en',
        COLORS: {
            DEPLOYED: '#4CAF50',
            IN_PROGRESS: '#FFA500',
            SIGNED: '#2196F3'
        },
        IMAGE: {
            DEFAULT: './assets/images/placeholder.jpg',
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
        DEFAULT_CENTER: [46.603354, 1.888334], // France center
        DEFAULT_ZOOM: 6,
        MAX_ZOOM: 18,
        MIN_ZOOM: 3,
        CLUSTER: {
            MAX_RADIUS: 50,
            SPIDER_ON_MAX_ZOOM: true,
            SHOW_COVERAGE: false,
            DISABLE_CLUSTERING_AT_ZOOM: 19,
            ANIMATE: true
        },
        BOUNDS_PADDING: [50, 50],
        TILE_LAYER: {
            LIGHT: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
    ERROR_MESSAGES: {
        INIT_FAILED: 'Failed to initialize application. Please refresh the page.',
        DATA_LOAD_FAILED: 'Failed to load data. Please check your connection.',
        GEOLOCATION_DENIED: 'Location access denied. Please enable location services.',
        INVALID_DATA: 'Invalid data received. Please contact support.'
    }
};

/**
 * Global store for application state
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
 * Utility functions
 * @namespace Utils
 */
const Utils = {
    /**
     * Debounces a function
     * @param {Function} fn - Function to debounce
     * @param {number} wait - Delay in milliseconds
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
     * Throttles a function
     * @param {Function} fn - Function to throttle
     * @param {number} limit - Throttle limit in milliseconds
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
     * Deep clones an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (obj instanceof Object) {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [key, Utils.deepClone(value)])
            );
        }
        return obj;
    },

    /**
     * Formats a number with thousand separators
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },

    /**
     * Gets continent from coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {string} Continent name
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
     * Extracts address components
     * @param {string} address - Full address
     * @returns {Object} Address components
     */
    parseAddress(address) {
        if (!address?.trim()) {
            return {
                street: '',
                city: '',
                state: '',
                country: '',
                postalCode: ''
            };
        }

        const parts = address.split(',').map(part => part.trim());

        // Extract postal code if present
        const postalMatch = parts.join(' ').match(/\b[A-Z0-9]{4,10}\b/i);
        const postalCode = postalMatch ? postalMatch[0] : '';

        return {
            country: parts[parts.length - 1] || '',
            state: parts[parts.length - 2] || '',
            city: parts[parts.length - 3] || '',
            street: parts.slice(0, -3).join(', '),
            postalCode
        };
    },

    /**
     * Validates coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {boolean} Whether coordinates are valid
     */
    validateCoordinates(lat, lon) {
        return !isNaN(lat) && !isNaN(lon) &&
            lat >= -90 && lat <= 90 &&
            lon >= -180 && lon <= 180;
    },

    /**
     * Saves user preferences
     * @param {UserPreferences} preferences - Preferences to save
     */
    savePreferences(preferences) {
        try {
            const data = {
                ...preferences,
                timestamp: Date.now(),
                version: CONFIG.STORAGE.VERSION
            };
            localStorage.setItem(CONFIG.STORAGE.PREFERENCES_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    },

    /**
     * Loads user preferences
     * @returns {UserPreferences|null} Saved preferences or null
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
            console.error('Error loading preferences:', error);
            return null;
        }
    },

    /**
     * Shows error message
     * @param {string} message - Error message
     * @param {number} [duration] - Message duration in ms
     */
    showError(message, duration = 5000) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            if (duration > 0) {
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, duration);
            }
        }
    },

    /**
     * Gets user's location
     * @returns {Promise<GeolocationPosition>} User's position
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
     * Calculates distance between coordinates
     * @param {number} lat1 - First latitude
     * @param {number} lon1 - First longitude
     * @param {number} lat2 - Second latitude
     * @param {number} lon2 - Second longitude
     * @returns {number} Distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};

/**
 * Analytics Manager
 */
class AnalyticsManager {
    static trackEvent(category, action, label = null, value = null) {
        // Implement your analytics tracking here
        console.log('Analytics:', { category, action, label, value });
    }

    static trackError(error, context = '') {
        // Implement error tracking
        console.error('Error:', context, error);
    }

    static trackTiming(category, variable, time) {
        // Implement performance tracking
        console.log('Timing:', { category, variable, time });
    }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
    static measures = new Map();

    static startMeasure(name) {
        this.measures.set(name, performance.now());
    }

    static endMeasure(name) {
        const start = this.measures.get(name);
        if (start) {
            const duration = performance.now() - start;
            this.measures.delete(name);
            AnalyticsManager.trackTiming('Performance', name, duration);
            return duration;
        }
        return null;
    }

    static async measureAsync(name, fn) {
        this.startMeasure(name);
        try {
            const result = await fn();
            return result;
        } finally {
            this.endMeasure(name);
        }
    }
}

/**
 * Error Handler
 */
class ErrorHandler {
    static handle(error, context = '') {
        AnalyticsManager.trackError(error, context);
        Utils.showError(error.message);
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
 * Map Manager
 */
class MapManager {
    constructor(containerId = 'map') {
        this.containerId = containerId;
        this.map = null;
        this.markerClusterGroup = null;
        this.markers = new Map();
    
        // Bind methods
        this.boundEventHandlers = {
            resize: Utils.throttle(() => this.handleResize(), 250),
            handleMapClick: this.handleMapClick.bind(this),
            handleZoomEnd: this.handleZoomEnd.bind(this),
            handleMoveEnd: this.handleMoveEnd.bind(this)
        };
    }

    init() {
        if (this.map) return this.map;

        PerformanceMonitor.startMeasure('mapInit');

        this.map = L.map(this.containerId, {
            center: CONFIG.MAP.DEFAULT_CENTER,
            zoom: CONFIG.MAP.DEFAULT_ZOOM,
            maxZoom: CONFIG.MAP.MAX_ZOOM,
            minZoom: CONFIG.MAP.MIN_ZOOM,
            zoomControl: window.innerWidth > CONFIG.UI.MOBILE_BREAKPOINT,
            scrollWheelZoom: true,
            dragging: true,
            tap: true
        });

        this.setupPanes();
        this.setupMarkerCluster();
        this.updateTileLayer();
        this.setupEventListeners();

        store.setState({ map: this.map });

        PerformanceMonitor.endMeasure('mapInit');
        return this.map;
    }

    setupPanes() {
        this.map.createPane('markerPane').style.zIndex = 450;
        this.map.createPane('popupPane').style.zIndex = 500;
        this.map.createPane('tooltipPane').style.zIndex = 550;
    }

    setupMarkerCluster() {
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
            chunkInterval: 200,
            chunkDelay: 50,
            iconCreateFunction: this.createClusterIcon.bind(this)
        });

        this.map.addLayer(this.markerClusterGroup);
        store.setState({ markerClusterGroup: this.markerClusterGroup });
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

    setupEventListeners() {
        // Window events
        window.addEventListener('resize', this.boundEventHandlers.resize, { passive: true });

        // Map events
        this.map.on('click', this.handleMapClick);
        this.map.on('zoomend', Utils.throttle(this.handleZoomEnd, 250));
        this.map.on('moveend', Utils.throttle(this.handleMoveEnd, 250));

        // Cluster events
        this.markerClusterGroup.on('clusterclick', (e) => {
            AnalyticsManager.trackEvent('Map', 'ClusterClick', `Size: ${e.layer.getChildCount()}`);
        });

        this.markerClusterGroup.on('animationend', () => {
            PerformanceMonitor.endMeasure('clusterAnimation');
        });
    }

    handleMapClick(e) {
        const { ui } = store.getState();
        if (ui.controlsVisible && window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT) {
            store.setState({
                ui: { ...ui, controlsVisible: false }
            });
        }
        AnalyticsManager.trackEvent('Map', 'Click', `${e.latlng.lat},${e.latlng.lng}`);
    }

    handleZoomEnd() {
        const zoom = this.map.getZoom();
        AnalyticsManager.trackEvent('Map', 'Zoom', `Level: ${zoom}`);
        store.setState({ currentZoom: zoom });
    }

    handleMoveEnd() {
        const center = this.map.getCenter();
        AnalyticsManager.trackEvent('Map', 'Move', `${center.lat},${center.lng}`);
        this.updateVisibleMarkers();
    }

    updateTileLayer() {
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

    async addMarkers(hospitals, chunkSize = 10) {
        if (!hospitals?.length) return;

        PerformanceMonitor.startMeasure('addMarkers');

        this.markerClusterGroup.clearLayers();
        this.markers.clear();

        const chunks = Array(Math.ceil(hospitals.length / chunkSize))
            .fill()
            .map((_, i) => hospitals.slice(i * chunkSize, (i + 1) * chunkSize));

        for (const chunk of chunks) {
            await this.processMarkerChunk(chunk);
        }

        PerformanceMonitor.endMeasure('addMarkers');
    }

    async processMarkerChunk(chunk) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                const markers = chunk.map(hospital => {
                    if (!Utils.validateCoordinates(hospital.lat, hospital.lon)) {
                        console.warn(`Invalid coordinates for hospital ${hospital.id}`);
                        return null;
                    }

                    const marker = this.createMarker(hospital);
                    this.markers.set(hospital.id, marker);
                    return marker;
                }).filter(Boolean);

                this.markerClusterGroup.addLayers(markers);
                resolve();
            });
        });
    }

    createMarker(hospital) {
        const marker = L.circleMarker([hospital.lat, hospital.lon], {
            radius: CONFIG.UI.MARKER.RADIUS,
            fillColor: CONFIG.UI.COLORS[hospital.status.toUpperCase().replace(/\s+/g, '_')],
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
    }

    bindPopupToMarker(marker) {
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
            popup.setContent(content);
            return popup;
        });

        marker.on('popupopen', () => {
            this.initializePopupImage(marker.getPopup().getElement());
            AnalyticsManager.trackEvent('Popup', 'Open', marker.hospitalData.name);
        });
    }

    bindTooltipToMarker(marker) {
        marker.bindTooltip(marker.hospitalData.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -10],
            opacity: 0.9,
            className: 'hospital-tooltip'
        });
    }

    generatePopupContent(hospital) {
        const { translations, language } = store.getState();
        const currentTranslations = translations[language] || translations[CONFIG.UI.DEFAULT_LANGUAGE];

        const address = Utils.parseAddress(hospital.address);
        const distance = this.calculateDistanceToUserLocation(hospital);

        return `
            <div class="popup-content">
                <h3 class="popup-title">${hospital.name}</h3>
                <div class="popup-image-wrapper">
                    <img 
                        src="${CONFIG.UI.IMAGE.DEFAULT}"
                        data-src="${hospital.imageUrl}" 
                        alt="${hospital.name}"
                        class="popup-image"
                        data-loading-state="${CONFIG.UI.IMAGE.STATES.LOADING}"
                    />
                </div>
                <div class="popup-address">
                    <strong>${currentTranslations.address || 'Address'}:</strong><br>
                    ${address.street}<br>
                    ${address.city}${address.postalCode ? ` (${address.postalCode})` : ''}<br>
                    ${address.country}
                    ${distance ? `<br><small>Distance: ${distance} km</small>` : ''}
                </div>
                <a href="${hospital.website}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="popup-link"
                   onclick="AnalyticsManager.trackEvent('Link', 'Click', 'Website: ${hospital.name}')">
                    ${currentTranslations.visitWebsite || 'Visit Website'}
                </a>
                <div class="popup-status">
                    <span>${currentTranslations.status || 'Status'}:</span>
                    <span class="status-tag status-${hospital.status.toLowerCase().replace(/\s+/g, '-')} active">
                        ${hospital.status}
                    </span>
                </div>
                <div class="popup-actions">
                    <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}')" 
                            class="directions-button">
                        Get Directions
                    </button>
                </div>
            </div>
        `;
    }

    calculateDistanceToUserLocation(hospital) {
        const { userLocation } = store.getState();
        if (!userLocation) return null;

        const distance = Utils.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            hospital.lat,
            hospital.lon
        );

        return Math.round(distance * 10) / 10; // Round to 1 decimal place
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

    updateVisibleMarkers() {
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

    fitMarkersInView(markers = null) {
        const markerArray = markers || Array.from(this.markers.values());
        if (markerArray.length === 0) return;

        const bounds = L.latLngBounds(markerArray.map(m => m.getLatLng()));
        this.map.fitBounds(bounds, {
            padding: CONFIG.MAP.BOUNDS_PADDING,
            maxZoom: this.map.getZoom()
        });
    }

    getUserLocation() {
        return ErrorHandler.wrapAsync(async () => {
            const position = await Utils.getCurrentPosition();
            const { latitude: lat, longitude: lng } = position.coords;

            store.setState({ userLocation: { lat, lng } });

            // Add user marker if not exists
            if (!this.userMarker) {
                this.userMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<div class="pulse"></div>'
                    })
                }).addTo(this.map);
            } else {
                this.userMarker.setLatLng([lat, lng]);
            }

            this.map.setView([lat, lng], CONFIG.MAP.DEFAULT_ZOOM);
            AnalyticsManager.trackEvent('Location', 'Get', 'Success');
        });
    }

    destroy() {
        if (this.map) {
            this.map.off('click', this.handleMapClick);
            this.map.off('zoomend', this.handleZoomEnd);
            this.map.off('moveend', this.handleMoveEnd);
            this.map.remove();
        }

        this.markers.clear();
        this.markerClusterGroup = null;
        this.map = null;
    }
}

/**
 * Class representing the UI Manager
 */
class UIManager {
    constructor(mapManager) {
        if (!mapManager) {
            throw new Error('MapManager is required');
        }
        this.mapManager = mapManager;

        // Initialize elements object
        this.elements = {};

        // Initialize bound handlers
        this.boundEventHandlers = {
            handleResize: this.handleResize.bind(this),
            handleOrientationChange: this.handleOrientationChange.bind(this),
            handleEscapeKey: this.handleEscapeKey.bind(this),
            updateMarkers: Utils.debounce(this.updateFilters.bind(this), CONFIG.UI.ANIMATION.DEBOUNCE_DELAY),
            clicks: {},
            keydowns: {}
        };

        this.init();
    }

    initElements() {
        const elements = [
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

        return this.validateCriticalElements();
    }

    validateCriticalElements() {
        const criticalElements = ['map', 'controls'];
        const missingElements = criticalElements.filter(id => !this.elements[id]);

        if (missingElements.length > 0) {
            console.error(`Critical elements missing: ${missingElements.join(', ')}`);
            return false;
        }

        return true;
    }

    setupEventListeners() {
        if (!this.elements) return;

        // Window events
        window.addEventListener('resize', this.boundEventHandlers.handleResize, { passive: true });
        window.addEventListener('orientationchange', this.boundEventHandlers.handleOrientationChange, { passive: true });
        window.addEventListener('keydown', this.boundEventHandlers.handleEscapeKey);

        // Element-specific events
        Object.entries(this.elements).forEach(([id, element]) => {
            if (!element) return;

            switch (id) {
                case 'language-select':
                    element.addEventListener('change', () => this.handleLanguageChange(element.value));
                    break;
                case 'theme-toggle':
                    element.addEventListener('click', () => this.toggleTheme());
                    this.addKeyboardSupport(element, () => this.toggleTheme());
                    break;
                case 'legend-toggle':
                    element.addEventListener('click', () => this.toggleLegend());
                    this.addKeyboardSupport(element, () => this.toggleLegend());
                    break;
                case 'hamburger-menu':
                    element.addEventListener('click', () => this.toggleControls());
                    this.addKeyboardSupport(element, () => this.toggleControls());
                    break;
            }
        });

        // Filter inputs
        ['continent-select', 'country-filter', 'city-filter', 'hospital-search'].forEach(id => {
            const element = this.elements[id];
            if (element) {
                element.addEventListener('input', this.boundEventHandlers.updateMarkers);
                this.setupMobileKeyboardHandling(element);
            }
        });

        // Status tags
        document.querySelectorAll('.status-tag').forEach(tag => {
            const statusHandler = (e) => this.handleStatusTagClick(e, tag);
            tag.addEventListener('click', statusHandler);
            this.addKeyboardSupport(tag, statusHandler);
            this.boundEventHandlers.clicks[`status-${tag.getAttribute('status')}`] = statusHandler;
        });

        // User location button
        const locationButton = document.getElementById('get-location');
        if (locationButton) {
            locationButton.addEventListener('click', () => this.mapManager.getUserLocation());
        }
    }

    /**
     * Main initialization method
     * @private
     */
    init() {
        try {
            if (!this.initElements()) {
                throw new Error('Failed to initialize UI elements');
            }

            this.setupEventListeners();
            this.loadUserPreferences();
            this.setupAccessibility();
            this.setupThemeDetection();
            this.setupResizeObserver();
            this.updateLayout();

            AnalyticsManager.trackEvent('UI', 'Initialize', 'Success');
        } catch (error) {
            ErrorHandler.handle(error, 'UI Initialization');
            throw error;
        }
    }

    setupMobileKeyboardHandling(element) {
        element.addEventListener('focus', () => {
            if (window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT) {
                document.body.classList.add('keyboard-open');
                this.mapManager.map?.invalidateSize();
            }
        });

        element.addEventListener('blur', () => {
            if (window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT) {
                document.body.classList.remove('keyboard-open');
                this.mapManager.map?.invalidateSize();
            }
        });
    }

    handleStatusTagClick(e, tag) {
        e.preventDefault();
        e.stopPropagation();

        const status = tag.getAttribute('status');
        const { activeStatus } = store.getState();

        let newActiveStatus;
        const isActive = tag.classList.contains('active');

        if (isActive) {
            newActiveStatus = activeStatus.filter(s => s !== status);
            tag.classList.remove('active');
        } else {
            newActiveStatus = [...activeStatus, status];
            tag.classList.add('active');
        }

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
     * Updates all filters and markers
     * @private
     */
    updateFilters() {
        const filters = this.getCurrentFilters();
        store.setState({ filters });

        const filteredHospitals = this.filterHospitals(filters);

        this.updateMarkerVisibility(filteredHospitals);
        GaugeManager.updateAllGauges(filteredHospitals);
        this.updateURLParams(filters);

        Utils.savePreferences({
            ...Utils.loadPreferences(),
            filters
        });

        AnalyticsManager.trackEvent('Filter', 'Update', `Results: ${filteredHospitals.length}`);
    }

    getCurrentFilters() {
        return {
            activeStatus: store.getState().activeStatus,
            searchTerm: this.elements['hospital-search']?.value?.toLowerCase() || '',
            continent: this.elements['continent-select']?.value || '',
            country: this.elements['country-filter']?.value?.toLowerCase() || '',
            city: this.elements['city-filter']?.value?.toLowerCase() || ''
        };
    }

    filterHospitals(filters) {
        const { hospitals } = store.getState();

        return hospitals.filter(hospital => {
            if (filters.activeStatus.length && !filters.activeStatus.includes(hospital.status)) {
                return false;
            }

            if (filters.searchTerm && !hospital.name.toLowerCase().includes(filters.searchTerm)) {
                return false;
            }

            const address = Utils.parseAddress(hospital.address);

            if (filters.continent &&
                Utils.getContinent(hospital.lat, hospital.lon) !== filters.continent) {
                return false;
            }

            if (filters.country &&
                !address.country.toLowerCase().includes(filters.country)) {
                return false;
            }

            if (filters.city &&
                !address.city.toLowerCase().includes(filters.city)) {
                return false;
            }

            return true;
        });
    }

    updateMarkerVisibility(filteredHospitals) {
        const filteredIds = new Set(filteredHospitals.map(h => h.id));

        this.mapManager.markers.forEach(marker => {
            const isVisible = filteredIds.has(marker.hospitalData.id);
            if (isVisible) {
                this.mapManager.markerClusterGroup.addLayer(marker);
            } else {
                this.mapManager.markerClusterGroup.removeLayer(marker);
            }
        });

        const noResults = this.elements['no-hospitals-message'];
        if (noResults) {
            noResults.style.display = filteredHospitals.length === 0 ? 'block' : 'none';
        }

        if (filteredHospitals.length > 0) {
            this.mapManager.fitMarkersInView(
                Array.from(this.mapManager.markers.values())
                    .filter(m => filteredIds.has(m.hospitalData.id))
            );
        }
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

    clearFilters() {
        ['hospital-search', 'country-filter', 'city-filter'].forEach(id => {
            if (this.elements[id]) {
                this.elements[id].value = '';
            }
        });

        ['continent-select'].forEach(id => {
            if (this.elements[id]) {
                this.elements[id].selectedIndex = 0;
            }
        });

        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.classList.remove('active');
            tag.setAttribute('aria-pressed', 'false');
        });

        store.setState({ activeStatus: [] });
        this.updateFilters();
        AnalyticsManager.trackEvent('Filter', 'Clear');
    }

    /**
     * Sets up accessibility features
     * @private
     */
    setupAccessibility() {
        // Add ARIA attributes to elements
        Object.entries(this.elements).forEach(([id, element]) => {
            if (!element) return;

            const label = id.replace(/([A-Z])/g, ' $1').toLowerCase();
            element.setAttribute('aria-label', label);

            if (['theme-toggle', 'legend-toggle', 'hamburger-menu'].includes(id)) {
                element.setAttribute('role', 'button');
                element.setAttribute('tabindex', '0');
            }
        });

        // Make status tags keyboard accessible
        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.setAttribute('role', 'button');
            tag.setAttribute('tabindex', '0');
            tag.setAttribute('aria-pressed', 'false');
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
            }, 250));

            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                this.resizeObserver.observe(mapContainer);
            }
        }
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
     * Handles window resize events
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
            this.handleResize();
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
     * Handles language change
     * @private
     * @param {string} language - New language code
     */
    handleLanguageChange(language) {
        this.updateTranslations(language);
        Utils.savePreferences({
            ...Utils.loadPreferences(),
            language
        });
        AnalyticsManager.trackEvent('UI', 'LanguageChange', language);
    }

    /**
     * Toggles dark mode
     * @private
     */
    toggleTheme() {
        const { darkMode } = store.getState();
        this.setDarkMode(!darkMode);
        AnalyticsManager.trackEvent('UI', 'ThemeToggle', !darkMode ? 'Dark' : 'Light');
    }

    /**
     * Sets dark mode
     * @param {boolean} enabled - Whether to enable dark mode
     */
    setDarkMode(enabled) {
        document.body.classList.toggle('dark-mode', enabled);
        store.setState({ darkMode: enabled });
        this.mapManager.updateTileLayer();

        Utils.savePreferences({
            ...Utils.loadPreferences(),
            darkMode: enabled
        });
    }

    /**
     * Toggles legend visibility
     * @private
     */
    toggleLegend() {
        const { legendVisible } = store.getState().ui;
        store.setState({
            ui: { ...store.getState().ui, legendVisible: !legendVisible }
        });
        AnalyticsManager.trackEvent('UI', 'LegendToggle', !legendVisible ? 'Show' : 'Hide');
    }

    /**
     * Toggles controls visibility
     * @private
     */
    toggleControls() {
        const controls = this.elements['controls'];
        const hamburger = this.elements['hamburger-menu'];

        if (!controls || !hamburger) return;

        const isVisible = controls.classList.contains('visible');
        controls.classList.toggle('visible');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', (!isVisible).toString());

        AnalyticsManager.trackEvent('UI', 'ControlsToggle', isVisible ? 'Hide' : 'Show');
    }

    /**
     * Hides controls
     * @private
     */
    hideControls() {
        const controls = this.elements['controls'];
        const hamburger = this.elements['hamburger-menu'];

        if (controls) {
            controls.classList.remove('visible');
        }
        if (hamburger) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * Adds keyboard support to element
     * @private
     * @param {HTMLElement} element - Element to add keyboard support to
     * @param {Function} handler - Click handler
     */
    addKeyboardSupport(element, handler) {
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler(e);
            }
        });
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
     * Applies status filters
     * @private
     * @param {string[]} statuses - Status filters to apply
     */
    applyStatusFilters(statuses) {
        document.querySelectorAll('.status-tag').forEach(tag => {
            const status = tag.getAttribute('status');
            const isActive = statuses.includes(status);
            tag.classList.toggle('active', isActive);
            tag.setAttribute('aria-pressed', isActive.toString());
        });
    }

    destroy() {
        window.removeEventListener('resize', this.boundEventHandlers.handleResize);
        window.removeEventListener('orientationchange', this.boundEventHandlers.handleOrientationChange);
        window.removeEventListener('keydown', this.boundEventHandlers.handleEscapeKey);

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        this.elements = {};
        this.boundEventHandlers = {};
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Loaded');
    console.log('Map element:', document.getElementById('map'));
    console.log('Map element dimensions:', {
        width: document.getElementById('map').offsetWidth,
        height: document.getElementById('map').offsetHeight
    });
});

/**
 * Main application initialization
 */
async function initApplication() {
    try {
        await new Promise(resolve => setTimeout(resolve, 0));

        PerformanceMonitor.startMeasure('appInit');

        if (store.getState().isInitialized) return;

        const mapElement = document.getElementById('map');
        const controlsElement = document.getElementById('controls');

        if (!mapElement || !controlsElement) {
            throw new Error(`Required elements missing: ${!mapElement ? 'map ' : ''}${!controlsElement ? 'controls' : ''}`);
        }

        const loader = document.getElementById('initial-loader');
        if (loader) loader.style.display = 'block';

        const mapManager = new MapManager('map');
        await mapManager.init();

        const uiManager = new UIManager(mapManager);
        await GaugeManager.initGauges();

        const preferences = Utils.loadPreferences();
        if (preferences?.language) {
            uiManager.updateTranslations(preferences.language);
        }

        await mapManager.addMarkers(hospitals);
        GaugeManager.updateAllGauges(hospitals);
        await applyInitialFilters(uiManager);

        if (loader) loader.style.display = 'none';

        store.setState({ isInitialized: true });

        PerformanceMonitor.endMeasure('appInit');
        AnalyticsManager.trackEvent('App', 'Initialize', 'Success');

        console.log('Application initialized successfully');

    } catch (error) {
        ErrorHandler.handle(error, 'Application Initialization');
        throw error;
    }
}

async function applyInitialFilters(uiManager) {
    const params = new URLSearchParams(window.location.search);

    const statusParam = params.get('activeStatus');
    if (statusParam) {
        const statuses = statusParam.split(',');
        store.setState({ activeStatus: statuses });

        document.querySelectorAll('.status-tag').forEach(tag => {
            const status = tag.getAttribute('status');
            const isActive = statuses.includes(status);
            tag.classList.toggle('active', isActive);
            tag.setAttribute('aria-pressed', isActive.toString());
        });
    }

    const searchTerm = params.get('searchTerm');
    if (searchTerm && uiManager.elements['hospital-search']) {
        uiManager.elements['hospital-search'].value = searchTerm;
    }

    ['continent', 'country', 'city'].forEach(param => {
        const value = params.get(param);
        if (value && uiManager.elements[`${param}-filter`]) {
            uiManager.elements[`${param}-filter`].value = value;
        }
    });

    uiManager.updateFilters();
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('load', () => {
            initApplication().catch(error => {
                console.error('Initialization error:', error);
            });
        });
    });
} else {
    window.addEventListener('load', () => {
        initApplication().catch(error => {
            console.error('Initialization error:', error);
        });
    });
}

// Export for module usage
export {
    initApplication,
    MapManager,
    UIManager,
    Utils,
    store,
    CONFIG,
    AnalyticsManager,
    PerformanceMonitor,
    ErrorHandler
};