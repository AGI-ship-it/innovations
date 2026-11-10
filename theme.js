// The site runs in dark mode only. Runs in <head> (not deferred) so the theme applies before first paint.
(() => {
  'use strict';
  const root = document.documentElement;
  root.dataset.theme = 'dark';
  root.style.colorScheme = 'dark';
  // Clear any light-mode choice saved by earlier versions.
  try { localStorage.removeItem('atlas-theme'); } catch { /* storage unavailable */ }
})();
