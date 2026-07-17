const CACHE_NAME = 'financepro-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/css/style.css',
    '/src/css/responsive.css',
    '/src/js/app.js',
    '/src/js/calculators/emi.js',
    '/src/js/calculators/sip.js',
    '/src/js/tax/indianTax.js',
    '/src/js/loan/comparison.js',
    '/src/js/planning/goalPlanner.js',
    '/src/js/utils/currency.js',
    '/src/js/utils/i18n.js',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png'
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
            .catch(() => {
                return caches.match('/offline.html');
            })
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
        })
    );
});
