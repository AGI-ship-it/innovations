// Light / dark theme. Runs in <head> (not deferred) so the saved theme applies before first paint.
(() => {
  'use strict';
  const KEY = 'atlas-theme';
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* storage unavailable */ }
  const apply = theme => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  };
  apply(saved === 'light' ? 'light' : 'dark');

  function render(button) {
    const light = root.dataset.theme === 'light';
    const label = light ? 'Switch to dark mode' : 'Switch to light mode';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(light));
    button.dataset.tooltip = label;
    if (window.icon) button.replaceChildren(window.icon(light ? 'moon' : 'sun'));
  }
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    render(button);
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch { /* storage unavailable */ }
      render(button);
    });
  });
})();
