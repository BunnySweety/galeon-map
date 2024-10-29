const CACHE_NAME = 'galeon-map-v1';
const ASSETS_TO_CACHE = [
    '/',
    './index.html',
    './styles.css',
    './main.js',
    './manifest.json',
    './browserconfig.xml',
    './assets/favicon.ico',
    './assets/favicon-16x16.png',
    './assets/favicon-32x32.png',
    './assets/web-app-manifest-192x192.png',
    './assets/web-app-manifest-512x512.png',
    './assets/apple-touch-icon.png',
    './assets/mstile-70x70.png',
    './assets/mstile-150x150.png',
    './assets/mstile-310x310.png',
    './assets/mstile-310x150.png',
    './assets/safari-pinned-tab.svg',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css',
    'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css',
    'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(error => {
                console.error('Cache addAll error:', error);
            })
    );
});

// Activate Service Worker and clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});

// Cache strategy: Network First with cache fallback
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip Chrome Extension requests
    if (event.request.url.startsWith('chrome-extension://')) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone the response as it can only be used once
                const responseClone = response.clone();
                
                // Cache the new response
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseClone);
                    })
                    .catch(err => console.error('Cache put error:', err));

                return response;
            })
            .catch(() => {
                // On network failure, try the cache
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        // If resource not in cache, return custom error page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('./offline.html');
                        }
                        // For other resources, return simple error response
                        return new Response('Network error happened', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});

// Handle messages from client
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync
self.addEventListener('sync', event => {
    if (event.tag === 'syncData') {
        event.waitUntil(
            // Your sync logic here
            Promise.resolve()
        );
    }
});

// Handle push notifications
self.addEventListener('push', event => {
    if (!event.data) return;

    const options = {
        body: event.data.text(),
        icon: './assets/web-app-manifest-192x192.png',
        badge: './assets/favicon-32x32.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Map',
                icon: './assets/web-app-manifest-192x192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Hospital Map Update', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                if (clientList.length) {
                    return clientList[0].focus();
                }
                return clients.openWindow('/');
            })
    );
});