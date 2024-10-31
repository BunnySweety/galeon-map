/**
 * @fileoverview Interactive hospital map application with filtering and clustering capabilities
 * @author BunnySweety
 * @version 1.0.0
 */

'use strict';

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
            ANIMATE: true
        },
        BOUNDS_PADDING: [50, 50],
        TILE_LAYER: {
            LIGHT: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
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
        INVALID_DATA: 'Invalid data received. Please contact support.'
    }
};

/**
 * Utility functions
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
        if (!address?.trim()) {
            return {
                street: '',
                city: '',
                country: '',
                postalCode: ''
            };
        }

        const parts = address.split(',').map(part => part.trim());

        const postalPatterns = [
            /\b[0-9]{5}\b/, // US, FR, DE, etc.
            /\b[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]\b/i, // CA
            /\b[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}\b/i, // UK
            /\b[0-9]{4}\s?[A-Z]{2}\b/i, // NL
            /\b[0-9]{4,6}\b/, // JP, CN, KR, etc.
            /\b[A-Z0-9]{2,4}\s?[0-9]{3,4}\b/i // SG, etc.
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

        const country = parts[parts.length - 1];
        const street = parts[0];

        return {
            street,
            city,
            country,
            postalCode
        };
    },

    validateCoordinates(lat, lon) {
        return !isNaN(lat) && !isNaN(lon) &&
            lat >= -90 && lat <= 90 &&
            lon >= -180 && lon <= 180;
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
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
    }
};

/**
 * Analytics Manager
 */
class AnalyticsManager {
    static trackEvent(category, action, label = null, value = null) {
        console.log('Analytics:', { category, action, label, value });
    }

    static trackError(error, context = '') {
        console.error('Error:', context, error);
    }

    static trackTiming(category, variable, time) {
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
 * Global application store for state management
 * @class Store
 */
class Store {
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

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('Error in store listener:', error);
            }
        });
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
 * Map Manager
 */
class MapManager {
    constructor(containerId = 'map') {
        this.containerId = containerId;
        this.map = null;
        this.markerClusterGroup = null;
        this.markers = new Map();

        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);
        this.handleZoomEnd = this.handleZoomEnd.bind(this);
        this.handleMoveEnd = this.handleMoveEnd.bind(this);
        this.createClusterIcon = this.createClusterIcon.bind(this);
        this.updateVisibleMarkers = this.updateVisibleMarkers.bind(this);
        this.updateTileLayer = this.updateTileLayer.bind(this);
    }

    async init() {
        if (this.map) return this.map;

        PerformanceMonitor.startMeasure('mapInit');

        try {
            const mapElement = document.getElementById(this.containerId);
            if (!mapElement) {
                throw new Error(`Map container with id '${this.containerId}' not found`);
            }

            this.map = L.map(this.containerId, {
                center: CONFIG.MAP.DEFAULT_CENTER, // Toujours utiliser le centre par défaut
                zoom: CONFIG.MAP.DEFAULT_ZOOM,
                maxZoom: CONFIG.MAP.MAX_ZOOM,
                minZoom: CONFIG.MAP.MIN_ZOOM,
                zoomControl: true,
                scrollWheelZoom: true,
                dragging: true,
                tap: true
            });

            this.map.zoomControl.remove();
            L.control.zoom({ position: 'topleft' }).addTo(this.map);

            this.setupPanes();
            this.setupMarkerCluster();
            await this.updateTileLayer();
            this.setupEventListeners();

            store.setState({ map: this.map });

            PerformanceMonitor.endMeasure('mapInit');
            return this.map;
        } catch (error) {
            ErrorHandler.handle(error, 'Map Initialization');
            throw error;
        }
    }

    async centerOnUserLocation() {
        if (!this.map) return;

        try {
            const position = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation not supported'));
                    return;
                }

                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            const { latitude: lat, longitude: lng } = position.coords;

            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                this.map.setView([lat, lng], CONFIG.MAP.DEFAULT_ZOOM, {
                    animate: true,
                    duration: 1
                });
                AnalyticsManager.trackEvent('Map', 'AutoCenter', 'Success');
            } else {
                throw new Error('Invalid coordinates received from geolocation');
            }
        } catch (error) {
            console.warn('Geolocation failed:', error.message);
            AnalyticsManager.trackEvent('Map', 'AutoCenter', 'Failed');
            throw error;
        }
    }

    setupPanes() {
        if (!this.map) return;

        this.map.createPane('markerPane').style.zIndex = 450;
        this.map.createPane('popupPane').style.zIndex = 500;
        this.map.createPane('tooltipPane').style.zIndex = 550;
    }

    setupMarkerCluster() {
        if (!this.map) return;

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
            iconCreateFunction: this.createClusterIcon
        });

        this.map.addLayer(this.markerClusterGroup);
        store.setState({ markerClusterGroup: this.markerClusterGroup });
    }

    setupEventListeners() {
        if (!this.map) return;

        // Window events
        window.addEventListener('resize', this.handleResize, { passive: true });

        // Map events
        this.map.on('click', this.handleMapClick);
        this.map.on('zoomend', this.handleZoomEnd);
        this.map.on('moveend', this.handleMoveEnd);

        // Cluster events
        if (this.markerClusterGroup) {
            this.markerClusterGroup.on('clusterclick', (e) => {
                AnalyticsManager.trackEvent('Map', 'ClusterClick', `Size: ${e.layer.getChildCount()}`);
            });

            this.markerClusterGroup.on('animationend', () => {
                PerformanceMonitor.endMeasure('clusterAnimation');
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

    /**
     * Add markers for all hospitals
     * @param {Array} hospitals List of hospitals
     * @param {number} chunkSize Size of chunks to create
     */
    async addMarkers(hospitals, chunkSize = 10) {
        if (!hospitals?.length || !this.markerClusterGroup) return;

        PerformanceMonitor.startMeasure('addMarkers');

        try {
            this.markerClusterGroup.clearLayers();
            this.markers.clear();

            const chunks = Array(Math.ceil(hospitals.length / chunkSize))
                .fill()
                .map((_, i) => hospitals.slice(i * chunkSize, (i + 1) * chunkSize));

            for (const chunk of chunks) {
                await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        const validMarkers = chunk
                            .map(hospital => {
                                const marker = this.createMarker(hospital);
                                if (marker) {
                                    this.markers.set(hospital.id, marker);
                                }
                                return marker;
                            })
                            .filter(marker => marker instanceof L.CircleMarker);

                        if (validMarkers.length > 0) {
                            this.markerClusterGroup.addLayers(validMarkers);
                        }
                        resolve();
                    });
                });
            }

            await GaugeManager.updateAllGauges(hospitals);

            PerformanceMonitor.endMeasure('addMarkers');
        } catch (error) {
            console.error('Error adding markers:', error);
            ErrorHandler.handle(error, 'Add Markers');
        }
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
                    if (marker) {
                        this.markers.set(hospital.id, marker);
                    }
                    return marker;
                }).filter(Boolean);

                this.markerClusterGroup?.addLayers(markers);
                resolve();
            });
        });
    }

    /**
    * Create a marker for a hospital
    * @param {Object} hospital Les données de l'hôpital
    * @returns {L.CircleMarker|null} Le marqueur créé ou null en cas d'erreur
    */
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

        marker.bindPopup(() => this.generatePopupContent(marker.hospitalData));

        marker.on('popupopen', () => {
            const popupElement = marker.getPopup().getElement();
            if (popupElement) {
                this.initializePopupImage(popupElement);
                AnalyticsManager.trackEvent('Popup', 'Open', marker.hospitalData.name);
            }
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

    generatePopupContent(hospital) {
        if (!hospital) return document.createElement('div');

        const { translations, language } = store.getState();
        const currentTranslations = translations[language] || translations[CONFIG.UI.DEFAULT_LANGUAGE];

        const container = document.createElement('div');
        container.className = 'popup-content';

        const address = Utils.parseAddress(hospital.address);

        container.innerHTML = `
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
                <strong>${currentTranslations.address || 'Address'}:</strong>
                <span class="popup-address-line">${address.street}</span>
                ${address.postalCode || address.city ?
                `<span class="popup-address-line">${[address.postalCode, address.city].filter(Boolean).join(' ')}</span>`
                : ''}
                <span class="popup-address-line">${address.country}</span>
            </div>
            <a href="${hospital.website}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="popup-link">
               ${currentTranslations.visitWebsite || 'Visit Website'}
            </a>
            <div class="popup-status">
                <span>${currentTranslations.status || 'Status'}:</span>
                <span class="status-tag status-${hospital.status.toLowerCase().replace(/\s+/g, '-')} active">
                    ${hospital.status}
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

    calculateDistanceToUserLocation(hospital) {
        const { userLocation } = store.getState();
        if (!userLocation || !hospital) return null;

        const distance = Utils.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            hospital.lat,
            hospital.lon
        );

        return Math.round(distance * 10) / 10;
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

    fitMarkersInView(markers = null) {
        if (!this.map) return;

        const markerArray = markers || Array.from(this.markers.values());
        if (markerArray.length === 0) return;

        const bounds = L.latLngBounds(markerArray.map(m => m.getLatLng()));
        this.map.fitBounds(bounds, {
            padding: CONFIG.MAP.BOUNDS_PADDING,
            maxZoom: this.map.getZoom()
        });
    }

    async getUserLocation() {
        try {
            const position = await Utils.getCurrentPosition();
            const { latitude: lat, longitude: lng } = position.coords;

            store.setState({ userLocation: { lat, lng } });

            if (!this.map) return;

            // Add or update user marker
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
        } catch (error) {
            ErrorHandler.handle(error, 'Geolocation');
            throw error;
        }
    }

    destroy() {
        try {
            // Remove window event listeners
            window.removeEventListener('resize', this.handleResize);

            if (this.map) {
                // Remove map event listeners
                this.map.off('click', this.handleMapClick);
                this.map.off('zoomend', this.handleZoomEnd);
                this.map.off('moveend', this.handleMoveEnd);

                // Clean up markers
                if (this.markerClusterGroup) {
                    this.markerClusterGroup.clearLayers();
                    this.map.removeLayer(this.markerClusterGroup);
                }

                if (this.userMarker) {
                    this.map.removeLayer(this.userMarker);
                }

                // Remove tile layer
                if (this.map.currentTileLayer) {
                    this.map.removeLayer(this.map.currentTileLayer);
                }

                // Remove map
                this.map.remove();
            }

            // Clear references
            this.map = null;
            this.markerClusterGroup = null;
            this.userMarker = null;
            this.markers.clear();

            console.log('MapManager cleanup completed successfully');
        } catch (error) {
            console.error('Error during MapManager cleanup:', error);
            ErrorHandler.handle(error, 'MapManager Cleanup');
        }
    }

    // Debugging method
    debug() {
        return {
            map: this.map,
            markers: this.markers,
            markerClusterGroup: this.markerClusterGroup,
            userMarker: this.userMarker
        };
    }
}

/**
 * UI Manager
 */
class UIManager {
    constructor(mapManager) {
        if (!mapManager) {
            throw new Error('MapManager is required');
        }
        this.mapManager = mapManager;
        this.elements = {};
        this.resizeObserver = null;

        // Définition des gestionnaires d'événements
        this.handleResize = () => {
            this.updateLayout();
            AnalyticsManager.trackEvent('UI', 'Resize', `Width: ${window.innerWidth}`);
        };

        this.handleOrientationChange = () => {
            setTimeout(() => {
                this.updateLayout();
            }, 100);
        };

        this.handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                if (this.mapManager.map) {
                    this.mapManager.map.closePopup();
                }
                if (window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT) {
                    this.hideControls();
                }
                document.activeElement?.blur();
            }
        };

        this.handleLanguageChange = (language) => {
            this.updateTranslations(language);
            Utils.savePreferences({
                ...Utils.loadPreferences(),
                language
            });
            AnalyticsManager.trackEvent('UI', 'LanguageChange', language);
        };

        this.handleThemeToggle = () => {
            const { darkMode } = store.getState();
            this.setDarkMode(!darkMode);
            AnalyticsManager.trackEvent('UI', 'ThemeToggle', !darkMode ? 'Dark' : 'Light');
        };

        this.handleLegendToggle = () => {
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
        };

        this.handleControlsToggle = () => {
            const controls = document.getElementById('controls');
            const hamburger = document.getElementById('hamburger-menu');

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
        };

        this.handleStatusTagClick = (e, tag) => {
            if (!tag) return;

            e.preventDefault();
            e.stopPropagation();

            const status = tag.getAttribute('status');
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
        };

        this.updateFilters = () => {
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
        };

        // Initialisation
        this.init();
    }

    async init() {
        try {
            await this.initElements();
            this.setupEventListeners();
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
        } catch (error) {
            ErrorHandler.handle(error, 'UI Initialization');
            throw error;
        }
    }

    async initElements() {
        console.log('Initializing UI elements...');

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
                console.log(`Found element: ${id}`);
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

    setupEventListeners() {
        // Window events
        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('orientationchange', this.handleOrientationChange, { passive: true });
        window.addEventListener('keydown', this.handleEscapeKey);

        // Element-specific events
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => this.handleLanguageChange(e.target.value));
        }

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.handleThemeToggle);
            this.addKeyboardSupport(themeToggle, this.handleThemeToggle);
        }

        const legendToggle = document.getElementById('legend-toggle');
        if (legendToggle) {
            legendToggle.addEventListener('click', this.handleLegendToggle);
            this.addKeyboardSupport(legendToggle, this.handleLegendToggle);
        }

        const hamburgerMenu = document.getElementById('hamburger-menu');
        if (hamburgerMenu) {
            hamburgerMenu.addEventListener('click', this.handleControlsToggle);
            this.addKeyboardSupport(hamburgerMenu, this.handleControlsToggle);
        }

        // Filter inputs
        ['continent-select', 'country-filter', 'city-filter', 'hospital-search'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', Utils.debounce(this.updateFilters, CONFIG.UI.ANIMATION.DEBOUNCE_DELAY));
                this.setupMobileKeyboardHandling(element);
            }
        });

        // Status tags
        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.addEventListener('click', (e) => this.handleStatusTagClick(e, tag));
            this.addKeyboardSupport(tag, (e) => this.handleStatusTagClick(e, tag));
        });

        // User location button
        const locationButton = document.getElementById('get-location');
        if (locationButton) {
            locationButton.addEventListener('click', () => this.mapManager.getUserLocation());
        }
    }

    setupAccessibility() {
        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.setAttribute('role', 'button');
            tag.setAttribute('tabindex', '0');
            tag.setAttribute('aria-pressed', 'false');
        });

        ['theme-toggle', 'legend-toggle', 'hamburger-menu'].forEach(id => {
            const element = document.getElementById(id);
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
            }, 250));

            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                this.resizeObserver.observe(mapContainer);
            }
        }
    }

    setupMobileKeyboardHandling(element) {
        if (!element) return;

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

    addKeyboardSupport(element, handler) {
        if (!element || !handler) return;

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler(e);
            }
        });
    }

    getCurrentFilters() {
        return {
            activeStatus: store.getState().activeStatus,
            searchTerm: document.getElementById('hospital-search')?.value?.toLowerCase() || '',
            continent: document.getElementById('continent-select')?.value || '',
            country: document.getElementById('country-filter')?.value?.toLowerCase() || '',
            city: document.getElementById('city-filter')?.value?.toLowerCase() || ''
        };
    }

    filterHospitals(filters) {
        const { hospitals } = store.getState();
        console.log('Filtres actifs:', {
            activeStatus: filters.activeStatus,
            totalHospitals: hospitals.length
        });

        const filteredHospitals = hospitals.filter(hospital => {
            if (filters.activeStatus.length && !filters.activeStatus.includes(hospital.status)) {
                console.log('Hospital filtered out:', {
                    hospitalStatus: hospital.status,
                    activeFilters: filters.activeStatus,
                    matched: filters.activeStatus.includes(hospital.status)
                });
                return false;
            }

            if (filters.searchTerm && !hospital.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
                return false;
            }

            const address = Utils.parseAddress(hospital.address);

            if (filters.continent) {
                const hospitalContinent = Utils.getContinent(hospital.lat, hospital.lon);
                if (hospitalContinent !== filters.continent) {
                    return false;
                }
            }

            if (filters.country && !address.country.toLowerCase().includes(filters.country.toLowerCase())) {
                return false;
            }

            if (filters.city && !address.city.toLowerCase().includes(filters.city.toLowerCase())) {
                return false;
            }

            return true;
        });

        console.log('Résultat du filtrage:', {
            total: filteredHospitals.length,
            statuses: [...new Set(filteredHospitals.map(h => h.status))]
        });

        return filteredHospitals;
    }

    updateMarkerVisibility(filteredHospitals) {
        try {
            if (!this.mapManager?.markerClusterGroup) return;

            this.mapManager.markerClusterGroup.clearLayers();

            const noResults = document.getElementById('no-hospitals-message');
            if (noResults) {
                noResults.style.display = filteredHospitals.length === 0 ? 'block' : 'none';
            }

            const markers = filteredHospitals
                .map(hospital => this.mapManager.markers.get(hospital.id))
                .filter(marker => marker instanceof L.CircleMarker);

            if (markers.length > 0) {
                this.mapManager.markerClusterGroup.addLayers(markers);

                if (this.mapManager.map) {
                    const bounds = L.latLngBounds(markers.map(m => m.getLatLng()));
                    this.mapManager.map.fitBounds(bounds, {
                        padding: CONFIG.MAP.BOUNDS_PADDING,
                        maxZoom: this.mapManager.map.getZoom()
                    });
                }
            }
        } catch (error) {
            console.error('Error updating marker visibility:', error);
            ErrorHandler.handle(error, 'Marker Visibility Update');
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
        this.mapManager.updateTileLayer();

        Utils.savePreferences({
            ...Utils.loadPreferences(),
            darkMode: enabled
        });
    }

    hideControls() {
        const controls = document.getElementById('controls');
        const hamburger = document.getElementById('hamburger-menu');

        if (controls) {
            controls.classList.add('hidden');
        }
        if (hamburger) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }

        store.setState({
            ui: {
                ...store.getState().ui,
                controlsVisible: false
            }
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

    clearFilters() {
        // Reset input values
        ['hospital-search', 'country-filter', 'city-filter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });

        // Reset continent select
        const continentSelect = document.getElementById('continent-select');
        if (continentSelect) continentSelect.selectedIndex = 0;

        // Reset status tags
        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.classList.remove('active');
            tag.setAttribute('aria-pressed', 'false');
        });

        // Reset store state
        store.setState({ activeStatus: [] });

        // Reset markers
        const { hospitals } = store.getState();
        if (this.mapManager?.markerClusterGroup) {
            this.mapManager.markerClusterGroup.clearLayers();
            hospitals.forEach(hospital => {
                const marker = this.mapManager.markers.get(hospital.id);
                if (marker) {
                    this.mapManager.markerClusterGroup.addLayer(marker);
                }
            });
        }

        // Hide no results message
        const noResults = document.getElementById('no-hospitals-message');
        if (noResults) noResults.style.display = 'none';

        // Reset map view
        if (this.mapManager) {
            this.mapManager.fitMarkersInView();
        }

        // Track event
        AnalyticsManager.trackEvent('Filter', 'Clear');
    }

    destroy() {
        try {
            // Remove window event listeners
            window.removeEventListener('resize', this.handleResize);
            window.removeEventListener('orientationchange', this.handleOrientationChange);
            window.removeEventListener('keydown', this.handleEscapeKey);

            // Clean up ResizeObserver
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }

            // Remove element event listeners
            ['language-select', 'theme-toggle', 'legend-toggle', 'hamburger-menu'].forEach(id => {
                const element = document.getElementById(id);
                if (!element) return;

                switch (id) {
                    case 'language-select':
                        element.removeEventListener('change', this.handleLanguageChange);
                        break;
                    case 'theme-toggle':
                        element.removeEventListener('click', this.handleThemeToggle);
                        break;
                    case 'legend-toggle':
                        element.removeEventListener('click', this.handleLegendToggle);
                        break;
                    case 'hamburger-menu':
                        element.removeEventListener('click', this.handleControlsToggle);
                        break;
                }
            });

            // Remove filter input listeners
            ['continent-select', 'country-filter', 'city-filter', 'hospital-search'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.removeEventListener('input', this.updateFilters);
                    element.removeEventListener('focus', this.setupMobileKeyboardHandling);
                    element.removeEventListener('blur', this.setupMobileKeyboardHandling);
                }
            });

            // Remove status tag listeners
            document.querySelectorAll('.status-tag').forEach(tag => {
                tag.removeEventListener('click', this.handleStatusTagClick);
            });

            // Clear references
            this.elements = {};

            console.log('UIManager cleanup completed successfully');
        } catch (error) {
            console.error('Error during UIManager cleanup:', error);
            ErrorHandler.handle(error, 'UIManager Cleanup');
        }
    }

    // Debug method
    debug() {
        return {
            elements: this.elements,
            mapManager: this.mapManager,
            resizeObserver: this.resizeObserver,
            state: store.getState()
        };
    }
}

/**
 * Main application initialization
 */
async function initApplication() {
    try {
        console.log('Starting application initialization...');

        PerformanceMonitor.startMeasure('appInit');

        if (store.getState().isInitialized) {
            console.log('Application already initialized');
            return;
        }

        // Check critical elements
        const mapElement = document.getElementById('map');
        const controlsElement = document.getElementById('controls');

        console.log('Critical elements check:', {
            map: !!mapElement,
            controls: !!controlsElement
        });

        if (!mapElement || !controlsElement) {
            throw new Error('Critical elements missing. Please ensure map and controls elements exist in the DOM');
        }

        // Show loader
        const loader = document.getElementById('initial-loader');
        if (loader) loader.style.display = 'block';

        // Initialize managers
        const mapManager = new MapManager('map');
        await mapManager.init();

        const uiManager = new UIManager(mapManager);
        await GaugeManager.initGauges();

        // Load preferences and apply initial state
        const preferences = Utils.loadPreferences();
        if (preferences?.language) {
            uiManager.updateTranslations(preferences.language);
        }

        await mapManager.addMarkers(hospitals);
        await GaugeManager.updateAllGauges(hospitals);
        await applyInitialFilters(uiManager);

        // Hide loader
        if (loader) loader.style.display = 'none';

        // Mark as initialized
        store.setState({ isInitialized: true });

        PerformanceMonitor.endMeasure('appInit');
        AnalyticsManager.trackEvent('App', 'Initialize', 'Success');

        console.log('Application initialized successfully');

    } catch (error) {
        console.error('Initialization error details:', error);
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

// Initialize application when DOM and resources are ready
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