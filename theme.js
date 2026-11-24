// The site runs in dark mode only. Runs in <head> (not deferred) so the theme applies before first paint.
(() => {
  'use strict';
  const root = document.documentElement;
  root.dataset.theme = 'dark';
  // The launch page is the site's front door: it shows on a plain visit (no route in the hash) or with ?launch.
  // ?hub (or any #route, e.g. a shared use case link) opens the Emerging Tech Radar directly.
  const q = new URLSearchParams(location.search);
  window.ATLAS_LANDING = q.has('launch') || (!q.has('hub') && (!location.hash || location.hash === '#'));
  // Keep the Radar out of sight until the launch page has drawn, so it doesn't flash on first load.
  if (window.ATLAS_LANDING) root.classList.add('atlas-landing-boot');
  root.style.colorScheme = 'dark';
  // Clear any light-mode choice saved by earlier versions.
  try { localStorage.removeItem('atlas-theme'); } catch { /* storage unavailable */ }
})();
