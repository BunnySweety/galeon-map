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
    '/src/js/main.js',
    '/src/js/security.js',
    '/src/js/performance.js',
    '/data/translations.js',
    '/data/hospitals.js',
    '/src/js/gauge.js',
    '/src/js/legacy-bundle.js',
    '/manifest.json',
    '/assets/images/favicon-32x32.png',
    '/assets/images/favicon-16x16.png',
    '/assets/images/apple-touch-icon.png',
    '/assets/images/placeholder.png'
];

const CDN_ASSETS = [
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
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
    async networkFirst(request) {
        try {
            const networkTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Network timeout')), 5000);
            });

            const networkPromise = fetch(request);
            const response = await Promise.race([
                networkPromise,
                networkTimeoutPromise
            ]);

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
            if (request.headers.get('Accept').includes('text/html')) {
                const offlineResponse = await caches.match(CONFIG.OFFLINE_URL);
                if (offlineResponse) {
                    return offlineResponse;
                }
            }
            throw error;
        }
    },

    async cacheFirst(request) {
        try {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }

            const response = await fetch(request);
            if (response.ok) {
                const cache = await caches.open(CONFIG.CACHE_NAME);
                await cache.put(request, response.clone());
                return response;
            }
            throw new Error('Network response was not ok');
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
        try {
            const cacheNames = await caches.keys();
            const oldCacheNames = cacheNames.filter(
                name => {
                    const isCacheVersionOld = name.includes('galeon-map-cache-v') && 
                                           name !== CONFIG.CACHE_NAME;
                    const isApiCacheVersionOld = name.includes('galeon-map-api-cache-v') && 
                                               name !== CONFIG.API_CACHE_NAME;
                    return isCacheVersionOld || isApiCacheVersionOld;
                }
            );
            await Promise.all(oldCacheNames.map(name => caches.delete(name)));
            utils.log('Old caches cleaned up:', oldCacheNames);
        } catch (error) {
            utils.error('Cache cleanup failed:', error);
        }
    }

    event.waitUntil(
        Promise.all([
            cleanOldCaches(),
            self.clients.claim()
        ])
    );
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

const PERIODIC_SYNC_TAG = 'periodic-cache-update';
const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures

self.addEventListener('periodicsync', event => {
    if (event.tag === PERIODIC_SYNC_TAG) {
        event.waitUntil(updateStaticCache());
    }
});

async function updateStaticCache() {
    try {
        await cacheStaticAssets();
        utils.log('Cache updated via periodic sync');
    } catch (error) {
        utils.error('Periodic cache update failed:', error);
    }
}