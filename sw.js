/* Bump this cache version whenever any file in ASSETS changes.
   New workers wait for existing windows to close, keeping a session on one version. */
const CACHE_PREFIX = 'systems-after-hours-shell-';
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const ASSETS = [
  './', './index.html', './styles.css', './questions.js', './app.js', './pwa.js',
  './favicon.svg', './manifest.webmanifest',
  './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png'
];
const assetURLs = new Set(ASSETS.map(path => new URL(path, self.registration.scope).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Fail the whole installation if any required asset is unavailable.
    await cache.addAll(ASSETS.map(path => new Request(new URL(path, self.registration.scope), { cache: 'reload' })));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const isAppNavigation = event.request.mode === 'navigate' && (url.pathname === new URL('./', self.registration.scope).pathname || url.pathname === new URL('./index.html', self.registration.scope).pathname);
  if (!isAppNavigation && !assetURLs.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(isAppNavigation ? new URL('./index.html', self.registration.scope).href : event.request);
    return cached || fetch(event.request);
  })());
});
