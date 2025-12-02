// Simple service worker for PWA functionality
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    event.waitUntil(clients.claim());
});

// Basic fetch handler - just pass through to network
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
