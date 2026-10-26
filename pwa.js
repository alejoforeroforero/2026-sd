/* Offline support is optional; direct file previews still work without it. */
(() => {
  if (!('serviceWorker' in navigator) || !window.isSecureContext || !/^https?:$/.test(location.protocol)) return;
  const localPreview = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (localPreview) {
    window.addEventListener('load', async () => {
      try {
        const workerURL = new URL('./sw.js', location.href).href;
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.filter(registration =>
          [registration.active, registration.waiting, registration.installing].some(worker => worker?.scriptURL === workerURL)
        ).map(registration => registration.unregister()));
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.filter(name => name.startsWith('systems-after-hours-shell-')).map(name => caches.delete(name)));
        }
        document.documentElement.dataset.offline = 'disabled';
      } catch {
        document.documentElement.dataset.offline = 'unavailable';
      }
    });
    return;
  }
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
      await navigator.serviceWorker.ready;
      document.documentElement.dataset.offline = 'ready';
    } catch {
      // Network or browser policy may prevent installation. Online study still works.
      document.documentElement.dataset.offline = 'unavailable';
    }
  });
})();
