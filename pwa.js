/* Online-only app. Retire old quiz workers without clearing saved progress. */
(() => {
  if (!('serviceWorker' in navigator) || !window.isSecureContext || !/^https?:$/.test(location.protocol)) return;
  window.addEventListener('load', async () => {
    try {
      const workerURL = new URL('./sw.js', location.href).href;
      const wasControlled = navigator.serviceWorker.controller?.scriptURL === workerURL;
      const registrations = await navigator.serviceWorker.getRegistrations();
      const removed = await Promise.all(registrations.filter(registration =>
        [registration.active, registration.waiting, registration.installing].some(worker => worker?.scriptURL === workerURL)
      ).map(registration => registration.unregister()));
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name.startsWith('systems-after-hours-shell-')).map(name => caches.delete(name)));
      }
      document.documentElement.dataset.offline = 'disabled';
      // A fresh recovery page can still be controlled by an older worker.
      // Navigate once after unregistering it; the next page is network-driven.
      if (wasControlled && removed.some(Boolean)) location.reload();
    } catch {
      document.documentElement.dataset.offline = 'unavailable';
    }
  });
})();
