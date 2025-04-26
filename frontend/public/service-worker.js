/* eslint-disable no-restricted-globals */

// Service Worker for Email Assistant PWA
// This service worker handles caching and offline functionality

// Cache names
const STATIC_CACHE_NAME = 'email-assistant-static-v1';
const DYNAMIC_CACHE_NAME = 'email-assistant-dynamic-v1';
const DATA_CACHE_NAME = 'email-assistant-api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
  '/assets/offline-image.svg',
  '/assets/offline-image.png',
  '/static/css/main.css',
  '/static/js/main.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell and static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Claim clients to update pages already open
  self.clients.claim();
  
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          // Delete old cache versions if they don't match current cache names
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
          return null;
        }));
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to delete old caches:', error);
      })
  );
});

// Fetch event - serve from cache or fetch from network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for chrome-extension URLs
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle API requests differently (don't return stale data)
  if (url.pathname.startsWith('/api/')) {
    handleApiRequest(event);
    return;
  }

  // Handle navigation requests (HTML documents)
  if (event.request.mode === 'navigate') {
    handleNavigationRequest(event);
    return;
  }

  // For static assets, images, CSS, JS, etc.
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response and update cache in background
          updateCacheInBackground(event.request);
          return cachedResponse;
        }
        
        // Fetch from network
        return fetchAndCache(event.request, DYNAMIC_CACHE_NAME);
      })
      .catch(() => {
        console.log('[Service Worker] Fetch failed, returning offline fallback');
        // If the request is for an image, return a placeholder
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('image')) {
          return caches.match('/assets/offline-image.svg')
            .then(response => {
              if (response) {
                return response;
              }
              return caches.match('/assets/offline-image.png');
            });
        }
        
        // For other assets that failed to load, just return null
        return null;
      })
  );
});

// Handle navigation requests specifically
function handleNavigationRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache a copy of the response
        const clonedResponse = response.clone();
        caches.open(DYNAMIC_CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        return response;
      })
      .catch(() => {
        // If navigation fails, show offline page
        return caches.match('/offline.html');
      })
  );
}

// Handle API requests
function handleApiRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache a copy of the API response
        const clonedResponse = response.clone();
        caches.open(DATA_CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        return response;
      })
      .catch(() => {
        // Check if we have cached API response
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cached response, handle API error appropriately
            return new Response(JSON.stringify({ error: 'Network offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
      })
  );
}

// Fetch and cache helper function
function fetchAndCache(request, cacheName) {
  // Skip caching for HEAD requests or other unsupported methods
  if (request.method !== 'GET') {
    return fetch(request);
  }
  
  return fetch(request)
    .then((response) => {
      // Only cache valid responses
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      
      // Cache the fetched response
      const clonedResponse = response.clone();
      caches.open(cacheName)
        .then((cache) => {
          cache.put(request, clonedResponse);
        })
        .catch((error) => {
          console.error(`[Service Worker] Failed to cache response for ${request.url}:`, error);
        });
      
      return response;
    });
}

// Update cache in background without blocking
function updateCacheInBackground(request) {
  // Skip caching for HEAD requests or other unsupported methods
  if (request.method !== 'GET') {
    return;
  }
  
  fetch(request)
    .then((response) => {
      // Only cache valid responses
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return;
      }
      
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          cache.put(request, response);
        });
    })
    .catch(() => {
      // Silently fail - this is just a background update
    });
}

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'REFRESH_CONTENT') {
    console.log('[Service Worker] Received refresh content message');
    // Could implement special refresh logic here if needed
  }
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received:', event);
  
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Email Assistant',
        body: event.data.text(),
        icon: '/logo192.png'
      };
    }
  }
  
  const title = data.title || 'Email Assistant';
  const options = {
    body: data.body || 'New notification from Email Assistant',
    icon: data.icon || '/logo192.png',
    badge: '/badge.png',
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();
  
  // Handle action clicks
  if (event.action) {
    console.log('[Service Worker] Action clicked:', event.action);
    // Handle specific actions here
    return;
  }
  
  // Default click behavior - open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If we have an open window, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Sync event for background syncing
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event);
  
  if (event.tag === 'sync-emails') {
    event.waitUntil(
      // Implement background sync logic here
      Promise.resolve()
    );
  }
});