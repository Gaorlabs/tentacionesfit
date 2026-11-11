// Service Worker for Tentaciones Fit PWA
// Bump version to force cache refresh
const CACHE_NAME = 'tentaciones-fit-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          // Delete all old caches to guarantee fresh code
          return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Network first strategy for all requests to ensure live updates reflect immediately
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept API routes
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Network first for all navigation and assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request) || caches.match('/index.html');
      })
  );
});
