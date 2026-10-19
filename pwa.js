/* Offline support is optional; direct file previews still work without it. */
(() => {
  if (!('serviceWorker' in navigator) || !window.isSecureContext || !/^https?:$/.test(location.protocol)) return;
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
