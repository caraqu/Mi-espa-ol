const APP_VERSION = 'v47.0';
const LEGACY_CACHE_NAME = 'mi-espanol';
const CACHE_PREFIX = 'mi-espanol-';
const CACHE_NAME = `${CACHE_PREFIX}${APP_VERSION}`;
const CORE_ASSETS = [
  './index.html',
  './manifest.json'
];
const OPTIONAL_ASSETS = [
  './',
  './icon.svg',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cacheFresh = async asset => {
      const request = new Request(asset, {cache: 'reload'});
      const response = await fetch(request);
      if (!response.ok) throw new Error(`Precache failed: ${asset}`);
      await cache.put(asset, response);
    };
    // Keep the current worker active if the new HTML or manifest cannot be
    // fetched; installing an empty shell would make an offline update unsafe.
    await Promise.all(CORE_ASSETS.map(cacheFresh));
    // Optional icons must not block a new worker from installing.
    await Promise.allSettled(OPTIONAL_ASSETS.map(cacheFresh));
  })());
  // The new worker stays waiting until the learner taps “Update now”, so an
  // active study session is never replaced silently.
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => (key === LEGACY_CACHE_NAME || key.startsWith(CACHE_PREFIX)) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(new Request(event.request, {cache: 'no-store'}));
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put('./index.html', response.clone());
        }
        return response;
      } catch (error) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(event.request, response.clone());
    }
    return response;
  })());
});
