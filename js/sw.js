// Service Worker configuration
const CONFIG = {
    VERSION: '1.0.0',
    CACHE_NAME: 'galeon-map-cache-v1',
    OFFLINE_URL: '/offline.html',
    DEBUG: true,
    API_CACHE_NAME: 'galeon-map-api-cache-v1',
    // Cache duration in milliseconds (24 hours)
    API_CACHE_DURATION: 24 * 60 * 60 * 1000
};

// Resources to cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/js/translations.js',
    '/js/hospitals.js',
    '/js/gauge.js',
    '/js/legacy-bundle.js',
    '/manifest.json',
    '/assets/favicon-32x32.png',
    '/assets/favicon-16x16.png',
    '/assets/apple-touch-icon.png'
];

const CDN_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.js',
    'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Utility functions
const utils = {
    log(...args) {
        if (CONFIG.DEBUG) {
            console.log('[ServiceWorker]', ...args);
        }
    },
    
    error(...args) {
        console.error('[ServiceWorker]', ...args);
    },

    // Check if URL is within scope
    isUrlInScope(url) {
        return url.origin === self.location.origin || 
               CDN_ASSETS.some(cdn => url.href.startsWith(cdn));
    },

    // Check if request should be cached
    shouldCache(request) {
        // Skip non-GET requests
        if (request.method !== 'GET') return false;

        // Skip chrome-extension requests
        if (request.url.startsWith('chrome-extension://')) return false;

        const url = new URL(request.url);

        // Only cache assets from our origin or allowed CDNs
        return this.isUrlInScope(url);
    }
};

// Cache strategies
const strategies = {
    // Network first with cache fallback
    async networkFirst(request) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                const cache = await caches.open(CONFIG.CACHE_NAME);
                await cache.put(request, response.clone());
                return response;
            }
            throw new Error('Network response was not ok');
        } catch (error) {
            utils.log('Network request failed, falling back to cache', request.url);
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            // Return offline page for HTML requests
            if (request.headers.get('Accept').includes('text/html')) {
                return caches.match(CONFIG.OFFLINE_URL);
            }
            throw error;
        }
    },

    // Cache first with network fallback
    async cacheFirst(request) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        try {
            const response = await fetch(request);
            if (response.ok) {
                const cache = await caches.open(CONFIG.CACHE_NAME);
                await cache.put(request, response.clone());
            }
            return response;
        } catch (error) {
            utils.error('Cache first strategy failed:', error);
            throw error;
        }
    }
};

// Install event handler
self.addEventListener('install', event => {
    async function cacheStaticAssets() {
        try {
            const cache = await caches.open(CONFIG.CACHE_NAME);
            utils.log('Caching static assets');
            
            // Cache static assets in chunks to avoid quota errors
            const chunks = [STATIC_ASSETS, CDN_ASSETS];
            for (const chunk of chunks) {
                await Promise.all(
                    chunk.map(async url => {
                        try {
                            const response = await fetch(url, { credentials: 'same-origin' });
                            if (response.ok) {
                                await cache.put(url, response);
                            } else {
                                utils.error(`Failed to cache ${url}: ${response.status}`);
                            }
                        } catch (error) {
                            utils.error(`Failed to fetch ${url}:`, error);
                        }
                    })
                );
            }
            utils.log('Static assets cached successfully');
        } catch (error) {
            utils.error('Failed to cache static assets:', error);
        }
    }

    event.waitUntil(cacheStaticAssets());
});

// Activate event handler
self.addEventListener('activate', event => {
    async function cleanOldCaches() {
        const cacheNames = await caches.keys();
        const oldCacheNames = cacheNames.filter(
            name => name !== CONFIG.CACHE_NAME && name !== CONFIG.API_CACHE_NAME
        );
        await Promise.all(oldCacheNames.map(name => caches.delete(name)));
        utils.log('Old caches cleaned up');
    }

    event.waitUntil(cleanOldCaches());
});

// Fetch event handler
self.addEventListener('fetch', event => {
    // Skip non-GET requests and non-cacheable requests
    if (!utils.shouldCache(event.request)) return;

    const url = new URL(event.request.url);

    // Choose caching strategy based on request type
    if (STATIC_ASSETS.includes(url.pathname) || CDN_ASSETS.includes(event.request.url)) {
        // Use cache first for static assets
        event.respondWith(strategies.cacheFirst(event.request));
    } else {
        // Use network first for other requests
        event.respondWith(strategies.networkFirst(event.request));
    }
});

// Message event handler
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Push notification event handler
self.addEventListener('push', event => {
    if (!event.data) return;

    const options = {
        body: event.data.text(),
        icon: '/assets/favicon-192x192.png',
        badge: '/assets/favicon-32x32.png',
        vibrate: [100, 50, 100],
        data: {
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'Open Map'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Hospital Map Update', options)
    );
});

// Notification click event handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return clients.openWindow('/');
            })
    );
});