/**
 * Gap 8 Remediation: Service Worker
 * Enterprise-grade service worker for offline support
 */

const CACHE_NAME = 'ghxstship-atlvs-v1';
const OFFLINE_URL = '/offline';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
];

// API routes that should use network-first strategy
const API_ROUTES = [
  '/api/',
  '/auth/',
];

// Static assets that should use cache-first strategy
const STATIC_EXTENSIONS = [
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
];

// ============================================================================
// INSTALL EVENT
// ============================================================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Cache precache assets
      await cache.addAll(PRECACHE_ASSETS);
      
      // Skip waiting to activate immediately
      await self.skipWaiting();
    })()
  );
});

// ============================================================================
// ACTIVATE EVENT
// ============================================================================

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      
      // Take control of all clients immediately
      await self.clients.claim();
    })()
  );
});

// ============================================================================
// FETCH EVENT
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Determine caching strategy based on request type
  if (isApiRequest(url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

/**
 * Network First Strategy
 * Try network, fall back to cache, then offline page
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    
    // Return error response for API requests
    return new Response(
      JSON.stringify({ error: 'Network unavailable', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Cache First Strategy
 * Try cache, fall back to network
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cache immediately, update cache in background
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Silently fail background fetch
      return null;
    });
  
  // Return cached response immediately, or wait for network
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
  } catch (error) {
    // Fall through to offline
  }
  
  // Return offline page for navigation
  if (request.mode === 'navigate') {
    return caches.match(OFFLINE_URL);
  }
  
  return new Response('Offline', { status: 503 });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isApiRequest(url) {
  return API_ROUTES.some((route) => url.pathname.startsWith(route));
}

function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

async function syncOfflineQueue() {
  // Get all clients
  const clients = await self.clients.matchAll();
  
  // Notify clients to sync
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_OFFLINE_QUEUE',
      timestamp: Date.now(),
    });
  });
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    actions: data.actions || [],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'GHXSTSHIP', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(payload.urls));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCache());
      break;
      
    case 'GET_CACHE_SIZE':
      event.waitUntil(getCacheSize().then((size) => {
        event.source.postMessage({ type: 'CACHE_SIZE', size });
      }));
      break;
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls);
}

async function clearCache() {
  await caches.delete(CACHE_NAME);
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(PRECACHE_ASSETS);
}

async function getCacheSize() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  let totalSize = 0;
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }
  
  return totalSize;
}
