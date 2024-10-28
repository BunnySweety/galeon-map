// sw.js
const CACHE_NAME = 'galeon-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/favicon-32x32.png',
    '/assets/favicon-16x16.png',
    '/assets/apple-touch-icon.png',
    '/manifest.json',
    '/fonts/main-font.woff2',
    '/css/style.css',
    '/js/main.js',
    '/js/gauge.js',
    '/js/translations.js',
    '/js/hospitals.js',
    '/images/default-hospital.png',
    '/data/countries.geojson',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});