/// SIK-MBH Service Worker — Network-First with Cache Fallback
/// Version: 3.0 (Bottom Navigation Bar & Mobile Telkomsel/By.U Overhaul)

const CACHE_NAME = 'sik-mbh-v3-20260907';
const OFFLINE_URL = '/';

// Precache only static branding assets (DO NOT precache HTML root to prevent stale UI)
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/logo-babul-khaer.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: precache branding and immediately take over
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate: clean up ALL legacy caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // Notify all open windows/PWA clients to reload with fresh assets
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', cache: CACHE_NAME });
        });
      });
    })
  );
  self.clients.claim();
});

// Fetch: Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API routes — always go directly to network
  if (url.pathname.startsWith('/api/')) return;

  // Skip non-http schemes
  if (!url.protocol.startsWith('http')) return;

  // Navigation requests (HTML pages): ALWAYS network-first, never serve stale HTML from cache when online
  if (request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Only if network fails (offline), attempt to serve cached offline page
          return caches.match(OFFLINE_URL).then((cached) => {
            return cached || new Response('Offline - Silakan periksa koneksi internet Anda.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
          });
        })
    );
    return;
  }

  // Static immutable assets (.png, .svg, .woff2, .ico)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && (
          url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.svg') ||
          url.pathname.endsWith('.woff2') ||
          url.pathname.endsWith('.ico')
        )) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return new Response('Asset unavailable offline', { status: 404 });
        });
      })
  );
});
