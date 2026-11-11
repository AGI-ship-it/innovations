// A quiet field of star dots behind every view: fixed positions, varied size and brightness, drifting very slowly.
(() => {
  'use strict';
  function init() {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.id = 'starfield'; svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    svg.setAttribute('viewBox', '0 0 1000 1000'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    // Deterministic pseudo-random positions so the sky is the same on every visit.
    let seed = 20261120;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const layers = [['far', 170, .5, .9], ['mid', 70, .9, 1.4], ['near', 22, 1.3, 2]];
    layers.forEach(([name, count, minR, maxR]) => {
      const group = document.createElementNS(NS, 'g'); group.setAttribute('class', `starfield-${name}`);
      for (let i = 0; i < count; i++) {
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', (rand() * 1000).toFixed(1)); dot.setAttribute('cy', (rand() * 1000).toFixed(1));
        dot.setAttribute('r', (minR + rand() * (maxR - minR)).toFixed(2));
        dot.setAttribute('fill', rand() > .85 ? '#f3dcff' : rand() > .8 ? '#dbe6ff' : '#ffffff');
        dot.setAttribute('opacity', (.18 + rand() * .55).toFixed(2));
        group.append(dot);
      }
      svg.append(group);
    });
    // Sits just above the sky backdrop (same layer, later in the page) and below all content.
    const sky = document.getElementById('cosmic-sky');
    if (sky) sky.after(svg); else document.body.prepend(svg);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
