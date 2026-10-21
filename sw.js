const APP_VERSION = 'v54.1';
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
  './icon-512.png',
  "./lesson-assets/fcc13c75a5e2ae0649f9aa62.webp",
  "./lesson-assets/0adc9f7520e7620af82e2380.webp",
  "./lesson-assets/3b59a58d1e5075d7ed56653c.webp",
  "./lesson-assets/fcef1e7f43499cc79ac8efc4.webp",
  "./lesson-assets/6537d9b86ef434e8ae01a0f3.webp",
  "./lesson-assets/7cb36076a9a4936d57aa897c.webp",
  "./lesson-assets/e54e92857f335882bcb064fe.webp",
  "./lesson-assets/0682606be1dd804ec2dfcc0e.webp",
  "./lesson-assets/41d1cc33a697f839fdb69801.webp",
  "./lesson-assets/57da0d0984d62646610cb8a2.webp",
  "./lesson-assets/aa41ea5d120a504c254439b7.webp",
  "./lesson-assets/a528a8c97dc896bcc64d8b34.webp",
  "./lesson-assets/0f8e49840c0c6e22e90986c0.png",
  "./lesson-assets/cfb67be3ddc60257afddd97b.png",
  "./lesson-assets/4abd40aead7194221d92668c.png",
  "./lesson-assets/b7f04c31ae31a163e5cd2658.png",
  "./lesson-assets/6a5a0535b54cd00c3b0f82a4.png",
  "./lesson-assets/3d181057484157fc960dd777.png",
  "./lesson-assets/0f3f1d6c4fdf0a9b6577e7cd.png",
  "./lesson-assets/6ba0fe84750214e9458aba1d.png",
  "./lesson-assets/c7909bf11f1427bbb5024aab.png",
  "./lesson-assets/3ba465da834bba231f85280d.png",
  "./lesson-assets/2d1022d78739186b36efcd1e.png"
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
        return (await (await caches.open(CACHE_NAME)).match('./index.html')) || (await (await caches.open(CACHE_NAME)).match('./'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const activeCache = await caches.open(CACHE_NAME);
    const cached = await activeCache.match(event.request);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(event.request, response.clone());
    }
    return response;
  })());
});
