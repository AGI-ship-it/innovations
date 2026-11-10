// Liquid glass for hover cards: the background bends near the card's edges, as light does through a thick
// glass slab. A displacement map is generated for the card's size and used by an SVG filter that the card
// applies as a backdrop-filter. Modelled on the edge/rim/corner refraction of WebGL "liquid glass" demos,
// but done with an SVG filter so it works on the live (animated) page without page snapshots.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const RADIUS = 24;        // card corner radius (px)
  const EDGE = 0.15;        // edge falloff (wide, gentle bend)
  const RIM = 0.8;          // rim falloff (tight, strong bend at the very edge)
  const EDGE_INT = 0.35, RIM_INT = 1, CORNER_INT = 0.5;
  const SCALE = 46;         // maximum displacement in px

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'svg-defs'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<filter id="liquid-glass" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feImage id="liquid-glass-map" x="0" y="0" result="map" preserveAspectRatio="none"/>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="${SCALE}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
  const mapNode = svg.querySelector('#liquid-glass-map');
  let lastKey = '';

  // Signed distance (negative inside) and outward normal of a rounded rectangle.
  function build(width, height) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'), image = ctx.createImageData(width, height), data = image.data;
    const hx = width / 2, hy = height / 2, r = Math.min(RADIUS, hx, hy);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const px = x + .5 - hx, py = y + .5 - hy;
      const qx = Math.abs(px) - (hx - r), qy = Math.abs(py) - (hy - r);
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)), inside = Math.min(Math.max(qx, qy), 0);
      const depth = Math.max(0, -(outside + inside - r));            // distance in from the edge
      let nx, ny;
      if (qx > 0 && qy > 0) { const l = Math.hypot(qx, qy) || 1; nx = Math.sign(px) * qx / l; ny = Math.sign(py) * qy / l; }
      else if (qx > qy) { nx = Math.sign(px); ny = 0; } else { nx = 0; ny = Math.sign(py); }
      const corner = qx > -r && qy > -r ? Math.exp(-depth * .3) * CORNER_INT : 0;
      const k = Math.min(1, Math.exp(-depth * EDGE) * EDGE_INT + Math.exp(-depth * RIM) * RIM_INT + corner);
      // Sample from further inside the card (pull the background towards the edge, like a lens rim).
      const i = (y * width + x) * 4;
      data[i] = 128 - nx * k * 127; data[i + 1] = 128 - ny * k * 127; data[i + 2] = 128; data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL();
  }

  // Over a bright surface (the white centre globes) the glass turns more solid so text stays readable.
  function checkBackdrop(card) {
    const box = card.getBoundingClientRect();
    const bright = [...document.querySelectorAll('.service-sun')].some(node => {
      if (!node.offsetParent) return false;
      const r = node.getBoundingClientRect();
      const overlapX = Math.min(box.right, r.right) - Math.max(box.left, r.left);
      const overlapY = Math.min(box.bottom, r.bottom) - Math.max(box.top, r.top);
      return overlapX > 12 && overlapY > 12;
    });
    card.classList.toggle('is-over-bright', bright);
  }
  function refresh(card) {
    if (card.hidden) return;
    checkBackdrop(card);
    const width = Math.round(card.offsetWidth), height = Math.round(card.offsetHeight);
    if (!width || !height) return;
    const key = `${width}x${height}`;
    if (key === lastKey) return;
    lastKey = key;
    mapNode.setAttribute('href', build(width, height));
    mapNode.setAttribute('width', width); mapNode.setAttribute('height', height);
    // Re-apply so the browser picks up the new map.
    card.classList.remove('liquid-glass'); void card.offsetWidth; card.classList.add('liquid-glass');
  }

  function init() {
    document.body.append(svg);
    const card = document.getElementById('planet-preview');
    if (!card) return;
    card.classList.add('liquid-glass');
    new ResizeObserver(() => refresh(card)).observe(card);
    new MutationObserver(() => refresh(card)).observe(card, { attributes: true, attributeFilter: ['hidden', 'style'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
