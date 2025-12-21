const CACHE_NAME = 'workout-cache-v2';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css', // if you have separate CSS
  '/app.js',    // if you have separate JS
  // Add icons or other assets here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch strategy: network first for index.html, cache first for others
self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.mode === 'navigate' || request.url.endsWith('index.html')) {
    // Network-first for main page
    event.respondWith(
      fetch(request)
        .then(resp => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, resp.clone());
            return resp;
          });
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first for other assets
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});
