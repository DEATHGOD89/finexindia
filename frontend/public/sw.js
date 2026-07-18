const CACHE_NAME = 'financepro-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/js/bundle.js',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Network-first strategy for HTML and JS to ensure updates are always fetched
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).then(response => {
            // If network fetch is successful, clone it and update the cache
            if (response && response.status === 200 && response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
            }
            return response;
        }).catch(() => {
            // If network fails (offline), fallback to cache
            return caches.match(event.request);
        })
    );
});
