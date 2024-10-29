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
  * Global application store for state management
  * @class Store
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
            IN_PROGRESS: '#FFA500',
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
        GEOLOCATION_DENIED: 'Location access denied. Please enable location services.',
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
                state: '',
                country: '',
                postalCode: ''
            };
        }

        const parts = address.split(',').map(part => part.trim());
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
 * Store for state management
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

        this.toggleTheme = () => {
            const { darkMode } = store.getState();
            this.setDarkMode(!darkMode);
            AnalyticsManager.trackEvent('UI', 'ThemeToggle', !darkMode ? 'Dark' : 'Light');
        };

        this.toggleLegend = () => {
            const { legendVisible } = store.getState().ui;
            store.setState({
                ui: { ...store.getState().ui, legendVisible: !legendVisible }
            });
            AnalyticsManager.trackEvent('UI', 'LegendToggle', !legendVisible ? 'Show' : 'Hide');
        };

        this.toggleControls = () => {
            const controls = this.elements['controls'];
            const hamburger = this.elements['hamburger-menu'];

            if (!controls || !hamburger) return;

            const isVisible = controls.classList.contains('visible');
            controls.classList.toggle('visible');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', (!isVisible).toString());

            AnalyticsManager.trackEvent('UI', 'ControlsToggle', isVisible ? 'Hide' : 'Show');
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

        this.handleStatusTagClick = (e, tag) => {
            if (!tag) return;
            
            e.preventDefault();
            e.stopPropagation();

            const status = tag.getAttribute('status');
            if (!status) return;

            const { activeStatus } = store.getState();
            const isActive = tag.classList.contains('active');

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
        if (!this.elements) return;

        // Window events
        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('orientationchange', this.handleOrientationChange, { passive: true });
        window.addEventListener('keydown', this.handleEscapeKey);

        // Element-specific events
        Object.entries(this.elements).forEach(([id, element]) => {
            if (!element) return;

            switch (id) {
                case 'language-select':
                    element.addEventListener('change', (e) => this.handleLanguageChange(e.target.value));
                    break;
                case 'theme-toggle':
                    element.addEventListener('click', this.toggleTheme);
                    this.addKeyboardSupport(element, this.toggleTheme);
                    break;
                case 'legend-toggle':
                    element.addEventListener('click', this.toggleLegend);
                    this.addKeyboardSupport(element, this.toggleLegend);
                    break;
                case 'hamburger-menu':
                    element.addEventListener('click', this.toggleControls);
                    this.addKeyboardSupport(element, this.toggleControls);
                    break;
            }
        });

        // Filter inputs
        ['continent-select', 'country-filter', 'city-filter', 'hospital-search'].forEach(id => {
            const element = this.elements[id];
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
        Object.entries(this.elements).forEach(([id, element]) => {
            if (!element) return;

            const label = id.replace(/([A-Z])/g, ' $1').toLowerCase();
            element.setAttribute('aria-label', label);

            if (['theme-toggle', 'legend-toggle', 'hamburger-menu'].includes(id)) {
                element.setAttribute('role', 'button');
                element.setAttribute('tabindex', '0');
            }
        });

        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.setAttribute('role', 'button');
            tag.setAttribute('tabindex', '0');
            tag.setAttribute('aria-pressed', 'false');
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
        // Reset input fields
        ['hospital-search', 'country-filter', 'city-filter'].forEach(id => {
            if (this.elements[id]) {
                this.elements[id].value = '';
            }
        });

        // Reset select elements
        ['continent-select'].forEach(id => {
            if (this.elements[id]) {
                this.elements[id].selectedIndex = 0;
            }
        });

        // Reset status tags
        document.querySelectorAll('.status-tag').forEach(tag => {
            tag.classList.remove('active');
            tag.setAttribute('aria-pressed', 'false');
        });

        // Reset store state
        store.setState({ activeStatus: [] });
        
        // Update filters and UI
        this.updateFilters();
        
        // Track event
        AnalyticsManager.trackEvent('Filter', 'Clear');
    }

    destroy() {
        try {
            // Remove window event listeners
            window.removeEventListener('resize', this.handleResize);
            window.removeEventListener('orientationchange', this.handleOrientationChange);
            window.removeEventListener('keydown', this.handleEscapeKey);

            // Remove element-specific event listeners
            Object.entries(this.elements).forEach(([id, element]) => {
                if (!element) return;

                switch (id) {
                    case 'language-select':
                        element.removeEventListener('change', this.handleLanguageChange);
                        break;
                    case 'theme-toggle':
                        element.removeEventListener('click', this.toggleTheme);
                        break;
                    case 'legend-toggle':
                        element.removeEventListener('click', this.toggleLegend);
                        break;
                    case 'hamburger-menu':
                        element.removeEventListener('click', this.toggleControls);
                        break;
                }
            });

            // Remove filter input listeners
            ['continent-select', 'country-filter', 'city-filter', 'hospital-search'].forEach(id => {
                const element = this.elements[id];
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

            // Cleanup ResizeObserver
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }

            // Clear references
            this.elements = {};

            console.log('UIManager cleanup completed successfully');
        } catch (error) {
            console.error('Error during UIManager cleanup:', error);
            ErrorHandler.handle(error, 'UIManager Cleanup');
        }
    }

    // Debugging method
    debug() {
        return {
            elements: this.elements,
            mapManager: this.mapManager,
            resizeObserver: this.resizeObserver,
            state: store.getState()
        };
    }
}

class UIManager {
    constructor(mapManager) {
        if (!mapManager) {
            throw new Error('MapManager is required');
        }
        this.mapManager = mapManager;
        this.elements = {};
        this.resizeObserver = null;

        // Bind all methods
        this.handleResize = this.handleResize.bind(this);
        this.handleOrientationChange = this.handleOrientationChange.bind(this);
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
        this.toggleLegend = this.toggleLegend.bind(this);
        this.toggleControls = this.toggleControls.bind(this);
        this.updateFilters = this.updateFilters.bind(this);
        this.handleStatusTagClick = this.handleStatusTagClick.bind(this);

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
        if (!this.elements) return;

        // Window events
        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('orientationchange', this.handleOrientationChange, { passive: true });
        window.addEventListener('keydown', this.handleEscapeKey);

        // Element-specific events
        Object.entries(this.elements).forEach(([id, element]) => {
            if (!element) return;

            switch (id) {
                case 'language-select':
                    element.addEventListener('change', (e) => this.handleLanguageChange(e.target.value));
                    break;
                case 'theme-toggle':
                    element.addEventListener('click', this.toggleTheme);
                    this.addKeyboardSupport(element, this.toggleTheme);
                    break;
                case 'legend-toggle':
                    element.addEventListener('click', this.toggleLegend);
                    this.addKeyboardSupport(element, this.toggleLegend);
                    break;
                case 'hamburger-menu':
                    element.addEventListener('click', this.toggleControls);
                    this.addKeyboardSupport(element, this.toggleControls);
                    break;
            }
        });

        // Filter inputs
        ['continent-select', 'country-filter', 'city-filter', 'hospital-search'].forEach(id => {
            const element = this.elements[id];
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

    handleStatusTagClick(e, tag) {
        if (!tag) return;
        
        e.preventDefault();
        e.stopPropagation();

        const status = tag.getAttribute('status');
        if (!status) return;

        const { activeStatus } = store.getState();
        const isActive = tag.classList.contains('active');

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

    handleResize() {
        this.updateLayout();
        AnalyticsManager.trackEvent('UI', 'Resize', `Width: ${window.innerWidth}`);
    }

    handleOrientationChange() {
        setTimeout(() => {
            this.handleResize();
        }, 100);
    }

    handleEscapeKey(e) {
        if (e.key !== 'Escape') return;

        if (this.mapManager.map) {
            this.mapManager.map.closePopup();
        }
        
        if (window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT) {
            this.hideControls();
        }
        
        document.activeElement?.blur();
    }

    destroy() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('keydown', this.handleEscapeKey);

        // Cleanup ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        // Clear references
        this.elements = {};
        this.resizeObserver = null;
    }
}

// DOM Content Loaded logging
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Loaded');
    console.log('Map element:', document.getElementById('map'));
    console.log('Map element dimensions:', {
        width: document.getElementById('map')?.offsetWidth,
        height: document.getElementById('map')?.offsetHeight
    });
});

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