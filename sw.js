/* Retirement worker: keep this URL so old installations can recover.
   It deliberately has no fetch handler and creates no caches. */
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('systems-after-hours-shell-')).map(name => caches.delete(name)));
    await self.clients.claim();
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await self.registration.unregister();
    const scope = new URL(self.registration.scope);
    await Promise.allSettled(windows.filter(client => {
      const url = new URL(client.url);
      return url.origin === scope.origin && url.pathname.startsWith(scope.pathname);
    }).map(client => client.navigate(client.url)));
  })());
});
