/**
 * @fileoverview Interactive hospital map application with filtering and clustering capabilities
 * @author Claude Assistant
 * @version 1.0.0
 */

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
 * @property {number} totalPatients - Total number of patients
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
            IN_PROGRESS: '#FFA500',
            SIGNED: '#2196F3'
        },
        IMAGE: {
            DEFAULT: 'images/default-hospital.png',
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
        }
    },
    MAP: {
        DEFAULT_CENTER: [50, 10],
        DEFAULT_ZOOM: 4,
        MAX_ZOOM: 18,
        CLUSTER: {
            MAX_RADIUS: 50,
            SPIDER_ON_MAX_ZOOM: true,
            SHOW_COVERAGE: false
        }
    },
    STORAGE: {
        PREFERENCES_KEY: 'hospitalMapPreferences'
    }
};

/**
 * Application state management store
 * @class Store
 */
class Store {
    /**
     * Creates a new Store instance
     * @param {Object} initialState - Initial store state
     */
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = new Set();
    }

    /**
     * Gets current state
     * @returns {Object} Current state
     */
    getState() {
        return this.state;
    }

    /**
     * Updates store state
     * @param {Object} newState - Partial state update
     * @fires Store#stateChange
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
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
        this.listeners.forEach(listener => listener(this.state));
    }
}

/**
 * Global application store instance
 * @type {Store}
 */
const appStore = new Store({
    map: null,
    markers: new Map(),
    markerClusterGroup: null,
    activeStatus: [],
    language: CONFIG.UI.DEFAULT_LANGUAGE,
    darkMode: false,
    translations: {},
    isInitialized: false,
    hospitals: []
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
     * Loads JSON data
     * @async
     * @param {string} url - URL to fetch from
     * @returns {Promise<Object>} Parsed JSON data
     * @throws {Error} Network or parsing error
     */
    async loadJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading JSON:', error);
            throw error;
        }
    },

    /**
     * Determines continent from coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {string} Continent name
     */
    getContinent(lat, lon) {
        const regions = {
            Europe: { lat: [35, 71], lon: [-25, 40] },
            Africa: { lat: [-35, 37], lon: [-20, 60] },
            Asia: { lat: [-10, 55], lon: [25, 180] },
            Oceania: { lat: [-50, 0], lon: [110, 180] },
            'North America': { lat: [15, 72], lon: [-170, -40] },
            'South America': { lat: [-57, 15], lon: [-110, -35] }
        };

        for (const [name, bounds] of Object.entries(regions)) {
            if (lat >= bounds.lat[0] && lat <= bounds.lat[1] &&
                lon >= bounds.lon[0] && lon <= bounds.lon[1]) {
                return name;
            }
        }
        return 'Unknown';
    },

    /**
     * Parses and extracts address components
     * @param {string} address - Full address string
     * @returns {Object} Parsed address components
     */
    parseAddress(address) {
        if (!address?.trim()) {
            return { street: '', city: '', state: '', country: '', postalCode: '' };
        }

        const parts = address.trim().split(',').map(part => part.trim());
        const result = {
            country: parts.pop() || '',
            city: parts.pop() || '',
            street: parts.join(', ')
        };

        // Extract postal code if present
        const postalMatch = result.city.match(/\b[A-Z0-9]{5,10}\b/i);
        if (postalMatch) {
            result.postalCode = postalMatch[0];
            result.city = result.city.replace(postalMatch[0], '').trim();
        }

        return result;
    },

    /**
     * Saves user preferences to localStorage
     * @param {UserPreferences} preferences - User preferences to save
     */
    savePreferences(preferences) {
        try {
            localStorage.setItem(
                CONFIG.STORAGE.PREFERENCES_KEY,
                JSON.stringify(preferences)
            );
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    },

    /**
     * Loads user preferences from localStorage
     * @returns {UserPreferences|null} Saved preferences or null
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE.PREFERENCES_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading preferences:', error);
            return null;
        }
    }
};

/**
 * Manages map markers and clustering
 * @class MapManager
 */
class MapManager {
    /**
     * Creates a new MapManager instance
     * @param {string} containerId - Map container element ID
     */
    constructor(containerId = 'map') {
        this.containerId = containerId;
        this.map = null;
        this.markerClusterGroup = null;
        this.markers = new Map();
    }

    /**
     * Initializes the map
     * @returns {L.Map} Initialized map instance
     */
    init() {
        if (this.map) return this.map;

        const { DEFAULT_CENTER, DEFAULT_ZOOM, MAX_ZOOM } = CONFIG.MAP;
        const isMobile = window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT;

        this.map = L.map(this.containerId, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            maxZoom: MAX_ZOOM,
            zoomControl: !isMobile,
            scrollWheelZoom: true,
            dragging: true,
            tap: true,
            attributionControl: false
        });

        this.setupPanes();
        this.setupMarkerCluster();
        this.updateTileLayer();

        appStore.setState({ map: this.map });
        return this.map;
    }

    /**
     * Sets up map panes
     * @private
     */
    setupPanes() {
        this.map.createPane('borderPane').style.zIndex = 400;
        this.map.createPane('markerPane').style.zIndex = 450;
    }

    /**
     * Sets up marker clustering
     * @private
     */
    setupMarkerCluster() {
        const { CLUSTER } = CONFIG.MAP;
        this.markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: CLUSTER.MAX_RADIUS,
            spiderfyOnMaxZoom: CLUSTER.SPIDER_ON_MAX_ZOOM,
            showCoverageOnHover: CLUSTER.SHOW_COVERAGE,
            zoomToBoundsOnClick: true
        });

        this.map.addLayer(this.markerClusterGroup);
        appStore.setState({ markerClusterGroup: this.markerClusterGroup });
    }

    /**
     * Updates map tile layer based on theme
     */
    updateTileLayer() {
        const { darkMode } = appStore.getState();
        if (this.map.currentTileLayer) {
            this.map.removeLayer(this.map.currentTileLayer);
        }

        const tileUrl = darkMode
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

        this.map.currentTileLayer = L.tileLayer(tileUrl, {
            maxZoom: CONFIG.MAP.MAX_ZOOM
        }).addTo(this.map);
    }

    /**
     * Adds hospital markers to the map
     * @async
     * @param {Hospital[]} hospitals - Array of hospital data
     * @param {number} chunkSize - Size of each processing chunk
     */
    async addMarkers(hospitals, chunkSize = 5) {
        if (!hospitals?.length) return;

        this.markerClusterGroup.clearLayers();
        this.markers.clear();

        const chunks = Array(Math.ceil(hospitals.length / chunkSize))
            .fill()
            .map((_, i) => hospitals.slice(i * chunkSize, (i + 1) * chunkSize));

        for (const chunk of chunks) {
            await this.processMarkerChunk(chunk);
        }
    }

    /**
     * Processes a chunk of markers
     * @private
     * @param {Hospital[]} chunk - Array of hospital data to process
     * @returns {Promise<void>}
     */
    processMarkerChunk(chunk) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                chunk.forEach(hospital => {
                    const marker = this.createMarker(hospital);
                    this.markers.set(hospital.id, marker);
                    this.markerClusterGroup.addLayer(marker);
                });
                resolve();
            });
        });
    }

    /**
     * Creates a marker for a hospital
     * @private
     * @param {Hospital} hospital - Hospital data
     * @returns {L.CircleMarker} Leaflet marker instance
     */
    createMarker(hospital) {
        const { MARKER } = CONFIG.UI;
        const marker = L.circleMarker([hospital.lat, hospital.lon], {
            pane: 'markerPane',
            radius: MARKER.RADIUS,
            fillColor: CONFIG.UI.COLORS[hospital.status.toUpperCase()],
            color: "#fff",
            weight: MARKER.WEIGHT,
            opacity: MARKER.OPACITY,
            fillOpacity: MARKER.FILL_OPACITY
        });

        marker.hospitalData = hospital;
        this.bindPopupToMarker(marker);

        return marker;
    }

    /**
     * Binds popup to marker
     * @private
     * @param {L.CircleMarker} marker - Marker to bind popup to
     */
    bindPopupToMarker(marker) {
        const popup = new PopupManager(marker.hospitalData).createPopup();
        marker.bindPopup(popup, {
            autoPan: false,
            closeButton: true,
            closeOnClick: false
        });

        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            this.closeAllPopupsExcept(marker);
            marker.openPopup();
        });

        marker.on('popupopen', () => {
            PopupManager.initializePopupImage(marker.getPopup().getElement());
        });
    }

    /**
     * Closes all popups except for specified marker
     * @param {L.CircleMarker} excludeMarker - Marker to keep open
     */
    closeAllPopupsExcept(excludeMarker) {
        this.markerClusterGroup.eachLayer(layer => {
            if (layer instanceof L.Marker && layer !== excludeMarker) {
                layer.closePopup();
            }
        });
    }

    /**
     * Updates marker visibility based on filters
     * @param {MapFilters} filters - Current filter settings
     * @returns {Object} Bounds and visible marker count
     */
    updateMarkersVisibility(filters) {
        const bounds = L.latLngBounds();
        let visibleCount = 0;

        this.markers.forEach(marker => {
            const visible = this.markerMatchesFilters(marker.hospitalData, filters);
            if (visible) {
                bounds.extend(marker.getLatLng());
                visibleCount++;
                this.markerClusterGroup.addLayer(marker);
            } else {
                this.markerClusterGroup.removeLayer(marker);
            }
        });

        return { bounds, visibleCount };
    }

    /**
       * Checks if hospital matches current filters (continued)
       * @private
       * @param {Hospital} hospital - Hospital to check
       * @param {MapFilters} filters - Current filters
       * @returns {boolean} Whether hospital matches filters
       */
    markerMatchesFilters(hospital, filters) {
        const { activeStatus, searchTerm, continent, country, city } = filters;
        const address = Utils.parseAddress(hospital.address);

        if (activeStatus.length && !activeStatus.includes(hospital.status)) return false;
        if (searchTerm && !hospital.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (continent && Utils.getContinent(hospital.lat, hospital.lon) !== continent) return false;
        if (country && !address.country.toLowerCase().includes(country.toLowerCase())) return false;
        if (city && !address.city.toLowerCase().includes(city.toLowerCase())) return false;

        return true;
    }
}

/**
 * Manages popup content and behavior
 * @class PopupManager
 */
class PopupManager {
    /**
     * Creates a new PopupManager instance
     * @param {Hospital} hospitalData - Hospital data for popup
     */
    constructor(hospitalData) {
        this.hospital = hospitalData;
    }

    /**
     * Creates a Leaflet popup for the hospital
     * @returns {L.Popup} Configured popup instance
     */
    createPopup() {
        const { translations } = appStore.getState();
        return L.popup().setContent(this.generatePopupContent(translations));
    }

    /**
     * Generates HTML content for popup
     * @private
     * @param {Object} translations - Current language translations
     * @returns {string} Popup HTML content
     */
    generatePopupContent(translations) {
        return `
      <div class="popup-content">
        <h3 class="popup-title">${this.hospital.name}</h3>
        <div class="popup-image-wrapper">
          <img 
            src="${CONFIG.UI.IMAGE.DEFAULT}"
            data-src="${this.hospital.imageUrl}" 
            alt="${this.hospital.name}"
            class="popup-image"
            data-loading-state="${CONFIG.UI.IMAGE.STATES.LOADING}"
          />
        </div>
        <div class="popup-address">
          <strong>${translations.address || 'Address'}:</strong><br>
          ${this.hospital.address}
        </div>
        <a href="${this.hospital.website}" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="popup-link">
          ${translations.visitWebsite || 'Visit Website'}
        </a>
        <div class="popup-status">
          <span>${translations.status || 'Status'}:</span>
          ${this.generateStatusTag()}
        </div>
      </div>
    `;
    }

    /**
     * Generates HTML for status tag
     * @private
     * @returns {string} Status tag HTML
     */
    generateStatusTag() {
        const statusClass = this.hospital.status.toLowerCase().replace(/\s+/g, "-");
        return `
      <span class="status-tag status-${statusClass} active" 
            data-status="${this.hospital.status}">
        ${this.hospital.status}
      </span>
    `;
    }

    /**
     * Initializes and loads popup image
     * @static
     * @param {HTMLElement} popupElement - Popup DOM element
     */
    static initializePopupImage(popupElement) {
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
                }
            });
        };

        imageLoader.onerror = () => {
            requestAnimationFrame(() => {
                if (img.parentElement) {
                    img.src = CONFIG.UI.IMAGE.DEFAULT;
                    img.setAttribute('data-loading-state', CONFIG.UI.IMAGE.STATES.ERROR);
                }
            });
        };

        if (loadingState !== CONFIG.UI.IMAGE.STATES.LOADING) {
            img.setAttribute('data-loading-state', CONFIG.UI.IMAGE.STATES.LOADING);
            imageLoader.src = img.dataset.src;
        }
    }
}

/**
 * Manages user interface elements and interactions
 * @class UIManager
 */
class UIManager {
    /**
     * Creates a new UIManager instance
     * @param {MapManager} mapManager - Reference to MapManager instance
     */
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.elements = {};
        this.debouncedUpdateMarkers = Utils.debounce(this.updateMarkers.bind(this), 150);
    }

    /**
     * Initializes UI elements and event listeners
     */
    init() {
        this.initElements();
        this.initEventListeners();
        this.loadUserPreferences();
        this.setupAccessibility();
    }

    /**
     * Initializes DOM element references
     * @private
     */
    initElements() {
        const elements = [
            'language-select',
            'continent-select',
            'country-filter',
            'city-filter',
            'hospital-search',
            'theme-toggle',
            'legend-toggle',
            'hamburger-menu'
        ];

        elements.forEach(id => {
            this.elements[id] = document.getElementById(id);
            if (!this.elements[id]) {
                console.warn(`Element with id '${id}' not found`);
            }
        });
    }

    /**
     * Sets up event listeners for UI elements
     * @private
     */
    initEventListeners() {
        // Window events
        const windowEvents = {
            'resize': Utils.debounce(this.handleResize.bind(this), 250),
            'orientationchange': this.handleOrientationChange.bind(this)
        };

        Object.entries(windowEvents).forEach(([event, handler]) => {
            window.addEventListener(event, handler);
        });

        // Element events
        if (this.elements['language-select']) {
            this.elements['language-select'].addEventListener('change', this.handleLanguageChange.bind(this));
        }

        if (this.elements['theme-toggle']) {
            this.elements['theme-toggle'].addEventListener('click', this.toggleTheme.bind(this));
        }

        // Filter events
        const filterElements = ['continent-select', 'country-filter', 'city-filter', 'hospital-search'];
        filterElements.forEach(id => {
            if (this.elements[id]) {
                this.elements[id].addEventListener('input', this.debouncedUpdateMarkers);
            }
        });
    }

    /**
     * Handles window resize events
     * @private
     */
    handleResize() {
        const isMobile = window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT;
        document.body.classList.toggle('mobile-view', isMobile);
        if (this.mapManager.map) {
            this.mapManager.map.invalidateSize();
        }
        this.updateLayout();
    }

    /**
     * Updates layout based on current window size
     * @private
     */
    updateLayout() {
        const isMobile = window.innerWidth <= CONFIG.UI.MOBILE_BREAKPOINT;
        const isLandscape = window.innerWidth > window.innerHeight;

        this.adjustControlsPosition(isMobile, isLandscape);
        this.adjustMapSize(isMobile, isLandscape);
        this.adjustLegendPosition(isMobile, isLandscape);
    }

    /**
     * Updates markers based on current filters
     * @private
     */
    updateMarkers() {
        const filters = this.getCurrentFilters();
        const { bounds, visibleCount } = this.mapManager.updateMarkersVisibility(filters);

        this.updateVisibilityMessage(visibleCount);
        this.updateMapBounds(bounds, visibleCount);

        Utils.savePreferences({
            ...Utils.loadPreferences(),
            ...filters
        });
    }

    /**
     * Gets current filter values
     * @private
     * @returns {MapFilters} Current filter values
     */
    getCurrentFilters() {
        return {
            activeStatus: appStore.getState().activeStatus,
            searchTerm: this.elements['hospital-search']?.value?.toLowerCase() || '',
            continent: this.elements['continent-select']?.value || '',
            country: this.elements['country-filter']?.value?.toLowerCase() || '',
            city: this.elements['city-filter']?.value?.toLowerCase() || ''
        };
    }

    /**
     * Updates visibility message
     * @private
     * @param {number} visibleCount - Number of visible markers
     */
    updateVisibilityMessage(visibleCount) {
        const messageElement = document.getElementById('no-hospitals-message');
        if (messageElement) {
            messageElement.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    /**
     * Updates map bounds based on visible markers
     * @private
     * @param {L.LatLngBounds} bounds - Bounds of visible markers
     * @param {number} visibleCount - Number of visible markers
     */
    updateMapBounds(bounds, visibleCount) {
        if (visibleCount === 0) {
            this.mapManager.map.setView(CONFIG.MAP.DEFAULT_CENTER, CONFIG.MAP.DEFAULT_ZOOM);
        } else if (!this.mapManager.map.getBounds().intersects(bounds)) {
            this.mapManager.map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: this.mapManager.map.getZoom()
            });
        }
    }

    /**
   * Updates map bounds based on visible markers
   * @private
   * @param {L.LatLngBounds} bounds - Bounds of visible markers
   * @param {number} visibleCount - Number of visible markers
   */
    updateMapBounds(bounds, visibleCount) {
        if (visibleCount === 0) {
            this.mapManager.map.setView(CONFIG.MAP.DEFAULT_CENTER, CONFIG.MAP.DEFAULT_ZOOM);
        } else if (!this.mapManager.map.getBounds().intersects(bounds)) {
            this.mapManager.map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: this.mapManager.map.getZoom()
            });
        }
    }

    // INSÉRER ICI LES NOUVELLES MÉTHODES

    /**
     * Adjusts controls position based on screen size
     * @private
     * @param {boolean} isMobile - Whether device is mobile
     * @param {boolean} isLandscape - Whether device is in landscape mode
     */
    adjustControlsPosition(isMobile, isLandscape) {
        const controls = document.querySelector('.controls');
        if (!controls) return;

        if (isMobile) {
            controls.style.left = isLandscape ? '4.5rem' : '3.5rem';
            controls.style.width = isLandscape ? '300px' : 'calc(100% - 5rem)';
        } else {
            controls.style.left = '4rem';
            controls.style.width = '300px';
        }
    }

    /**
     * Adjusts map container size
     * @private
     * @param {boolean} isMobile - Whether device is mobile
     * @param {boolean} isLandscape - Whether device is in landscape mode
     */
    adjustMapSize(isMobile, isLandscape) {
        const mapContainer = document.getElementById(this.mapManager.containerId);
        if (!mapContainer) return;

        if (isMobile && isLandscape) {
            mapContainer.style.height = '100vh';
            mapContainer.style.width = '100vw';
        } else {
            mapContainer.style.height = '';
            mapContainer.style.width = '';
        }
    }

    /**
     * Adjusts legend position based on screen size
     * @private
     * @param {boolean} isMobile - Whether device is mobile
     * @param {boolean} isLandscape - Whether device is in landscape mode
     */
    adjustLegendPosition(isMobile, isLandscape) {
        const legend = document.querySelector('.legend-container');
        if (!legend) return;

        if (isMobile) {
            legend.style.left = isLandscape ? '4.5rem' : '0.625rem';
            legend.style.bottom = isLandscape ? '1rem' : '10rem';
        } else {
            legend.style.left = '4rem';
            legend.style.bottom = '1rem';
        }
    }

    /**
     * Loads saved user preferences from storage
     * @private
     */
    loadUserPreferences() {
        const preferences = Utils.loadPreferences();
        if (!preferences) return;

        const { language, darkMode, activeStatus } = preferences;

        if (language && this.elements['language-select']) {
            this.elements['language-select'].value = language;
        }

        if (darkMode !== undefined) {
            document.body.classList.toggle('dark-mode', darkMode);
            this.mapManager.updateTileLayer();
        }

        if (Array.isArray(activeStatus)) {
            appStore.setState({ activeStatus });
        }
    }

    /**
     * Sets up accessibility features
     * @private
     */
    setupAccessibility() {
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element) return;

            // Add proper ARIA labels
            const label = key.replace(/([A-Z])/g, ' $1')
                .toLowerCase()
                .trim();
            element.setAttribute('aria-label', label);

            // Add keyboard navigation where appropriate
            if (['theme-toggle', 'legend-toggle', 'hamburger-menu'].includes(key)) {
                element.setAttribute('role', 'button');
                element.setAttribute('tabindex', '0');
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        element.click();
                    }
                });
            }
        });
    }

    /**
     * Handles orientation change events
     * @private
     */
    handleOrientationChange() {
        setTimeout(() => {
            this.handleResize();
        }, 100); // Small delay to ensure dimensions are updated
    }

    /**
     * Handles language change events
     * @private
     * @param {Event} event - Change event
     */
    handleLanguageChange(event) {
        const language = event.target.value;
        appStore.setState({ language });
        Utils.savePreferences({
            ...Utils.loadPreferences(),
            language
        });
    }

    /**
     * Toggles theme between light and dark mode
     * @private
     */
    toggleTheme() {
        const { darkMode } = appStore.getState();
        const newDarkMode = !darkMode;

        document.body.classList.toggle('dark-mode', newDarkMode);
        appStore.setState({ darkMode: newDarkMode });
        this.mapManager.updateTileLayer();

        Utils.savePreferences({
            ...Utils.loadPreferences(),
            darkMode: newDarkMode
        });
    }
}

/**
 * Initializes the application
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function initApplication() {
    try {
        if (appStore.getState().isInitialized) return;

        const mapManager = new MapManager('map');
        const uiManager = new UIManager(mapManager);

        mapManager.init();
        uiManager.init();

        const [hospitals, translations] = await Promise.all([
            Utils.loadJSON('/api/hospitals'),
            Utils.loadJSON('/api/translations')
        ]);

        appStore.setState({
            hospitals,
            translations,
            isInitialized: true
        });

        await mapManager.addMarkers(hospitals);
        uiManager.updateMarkers();

    } catch (error) {
        console.error('Initialization error:', error);
        throw new Error('Failed to initialize application');
    }
}

// Export necessary functions and classes
export {
    initApplication,
    MapManager,
    PopupManager,
    UIManager,
    Utils,
    appStore,
    CONFIG
};