// ============================================
// Service Worker - Roblox Game Pass Maker DEMO
// ============================================
// 
// This service worker caches static frontend assets only.
// It does NOT enable offline access to Roblox APIs.
// Roblox integration requires a real backend server.
//

const CACHE_NAME = 'roblox-gamepass-demo-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching assets');
      return cache.addAll(urlsToCache);
    }).catch(err => {
      console.error('[Service Worker] Cache failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).catch(err => {
        console.warn('[Service Worker] Fetch failed:', err);
        return new Response(
          'Offline - Demo entries available from local storage',
          { status: 503, statusText: 'Service Unavailable' }
        );
      });
    })
  );
});

console.log('[Service Worker] Loaded - Frontend demo caching only');
