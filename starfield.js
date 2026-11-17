// The sky behind every view (after the Trellis galaxy): soft coloured haze, a diagonal galactic band of faint stars
// with a glowing spine, scattered stars and fine dust, painted once on a canvas (and again only on resize).
// A live canvas on top adds twinkling stars, drifting specks, shooting stars and pointer parallax.
(() => {
  'use strict';
  // Deterministic pseudo-random numbers so the sky is the same on every visit.
  const seeded = start => { let seed = start; return () => (seed = (seed * 16807) % 2147483647) / 2147483647; };
  const gauss = rand => (rand() + rand() + rand() - 1.5) / 1.5;
  const rgb = ([r, g, b], k) => `rgb(${Math.round(r * k * 255)},${Math.round(g * k * 255)},${Math.round(b * k * 255)})`;

  // The reference renders in linear light and shows it through ACES filmic tone mapping (exposure 1.05) and sRGB output;
  // this is the same curve as three.js r128, so the haze and stars come out in the same colours.
  function tone(r, g, b, exposure = 1.05) {
    const k = exposure / .6; r *= k; g *= k; b *= k;
    let R = .59719 * r + .35458 * g + .04823 * b, G = .076 * r + .90834 * g + .01566 * b, B = .0284 * r + .13383 * g + .83777 * b;
    const fit = v => (v * (v + .0245786) - .000090537) / (v * (.983729 * v + .432951) + .238081);
    R = fit(R); G = fit(G); B = fit(B);
    const out = [1.60475 * R - .53108 * G - .07367 * B, -.10208 * R + 1.10813 * G - .00605 * B, -.00327 * R - .07276 * G + 1.07602 * B];
    return out.map(v => { v = Math.min(1, Math.max(0, v)); return Math.round(255 * (v <= .0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - .055)); });
  }
  const toned = ([r, g, b], k) => { const [R, G, B] = tone(r * k, g * k, b * k); return `rgb(${R},${G},${B})`; };

  function paintSky(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const rand = seeded(20261121), area = W * H / (1440 * 900);
    // Sky units: the band spans about 400 units across; centre of the view is (0, 0), y up.
    const s = Math.max(W, H) / 300, X = x => W / 2 + x * s, Y = y => H / 2 - y * s;
    // Broad colour (mostly green and teal, a little indigo, magenta), then the glowing spine of the band.
    const k = -.42, ang = Math.atan(k);
    const blobs = [
      [[120, 60, 200], -70, -20, 260, 220, .19], [[95, 65, 180], 80, 30, 240, 200, .12], [[80, 80, 190], 30, 70, 260, 180, .13], [[200, 60, 175], 105, -55, 230, 200, .2],
      [[150, 70, 200], -120, 70, 220, 180, .16], [[50, 100, 220], -40, -75, 260, 160, .14], [[120, 60, 200], 140, 40, 200, 170, .1], [[220, 80, 160], -150, -10, 160, 140, .07],
      ...[[-150, [160, 100, 225], .09], [-110, [130, 80, 210], .08], [-75, [90, 110, 230], .1], [0, [135, 85, 215], .1], [40, [150, 80, 210], .08], [70, [210, 80, 180], .11], [150, [80, 120, 220], .09]]
        .map(([x, c, o]) => [c, x, x * k + 8, 170, 46, o * .12, ang]),
      // a soft lavender glow around the middle of the view, where the system's centre sits (as the star's halo in the reference)
      [[150, 125, 235], 0, 4, 150, 130, .09], [[190, 150, 255], 0, 4, 70, 60, .05],
    ].map(([c, x, y, sx, sy, o, rot = 0]) => ({ c: c.map(v => v / 255 * .9 * o * .55), x, y, hx: sx / 2, hy: sy / 2, cos: Math.cos(rot), sin: Math.sin(rot) }));
    // The haze, summed in linear light at a third of the resolution (it is soft), toned, then scaled up smoothly.
    const step = 3, w = Math.ceil(W / step), h = Math.ceil(H / step), img = new ImageData(w, h), px = img.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const ux = (i * step - W / 2) / s, uy = (H / 2 - j * step) / s;
      // From black (upper left) to a deep violet (lower right), under the haze.
      const tx = i * step / W, ty = j * step / H, q = Math.min(1, Math.max(0, (tx * .42 + ty * .58 - .12) / .95)), lift = q * q * (3 - 2 * q);
      let r = .0003 + .009 * lift, gg = .0015 + .004 * lift, b = .003 + .022 * lift;
      for (const blob of blobs) {
        const dx = ux - blob.x, dy = uy - blob.y, lx = (dx * blob.cos + dy * blob.sin) / blob.hx, ly = (-dx * blob.sin + dy * blob.cos) / blob.hy, d = Math.sqrt(lx * lx + ly * ly);
        if (d < 1) { const f = (1 - d) * (1 - d); r += blob.c[0] * f; gg += blob.c[1] * f; b += blob.c[2] * f; }
      }
      const [R, G, B] = tone(r, gg, b), o = (j * w + i) * 4; px[o] = R; px[o + 1] = G; px[o + 2] = B; px[o + 3] = 255;
    }
    const low = document.createElement('canvas'); low.width = w; low.height = h; low.getContext('2d').putImageData(img, 0, 0);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(low, 0, 0, w * step, h * step);
    g.globalCompositeOperation = 'lighter';
    // A star: a crisp dot, with a soft halo for the brighter ones.
    const star = (x, y, r, colour, a) => {
      g.globalAlpha = a; g.fillStyle = colour;
      if (r < .9) g.fillRect(x - r, y - r, r * 2, r * 2);
      else { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    };
    // The band: a diagonal river of faint stars, brightest along its spine.
    const BAND = [[.82, .9, 1], [.86, .78, 1], [1, .72, .94], [.82, .72, 1], [.66, .78, 1], [1, .92, .78]], bandWeights = [.5, .68, .8, .9, .96, 1];
    for (let i = 0, n = Math.round(1300 * Math.min(area, 1.6)); i < n; i++) {
      const x = (rand() * 2 - 1) * 200, off = gauss(rand) * (9 + 24 * rand() ** 3), y = x * k + off + 8;
      const w = rand(), c = BAND[bandWeights.findIndex(limit => w < limit)], b = (.035 + rand() * .08) * (1 - Math.min(1, Math.abs(off) / 30) * .65); // a very faint band
      star(X(x), Y(y), .45 + rand() * .35, toned(c, b), 1);
    }
    // Scattered stars and dust of every weight across the whole view.
    const COOL = [[.82, .92, 1], [.86, .8, 1], [.7, .8, 1]], WARM = [[1, .72, .94], [.85, .72, 1], [1, .92, .8]], ALL = [...COOL, ...WARM];
    const field = (n, r, [lo, hi], tints, glow) => {
      for (let i = 0, m = Math.round(n * area); i < m; i++) {
        const x = rand() * W, y = rand() * H, c = tints[Math.floor(rand() * tints.length)], b = lo + rand() * (hi - lo);
        if (glow) { const grad = g.createRadialGradient(x, y, 0, x, y, r * 3.2); grad.addColorStop(0, toned(c, b)); grad.addColorStop(.3, toned(c, b * .35)); grad.addColorStop(1, 'rgba(0,0,0,0)');
          g.globalAlpha = 1; g.fillStyle = grad; g.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4); }
        else star(x, y, r * (.7 + rand() * .6), toned(c, b), 1);
      }
    };
    field(450, .4, [.25, .6], COOL);              // fine powder
    field(420, .55, [.3, .75], [[.85, .93, 1], [.85, .93, 1], [1, .9, .78], [.88, .82, 1]]); // far stars
    field(130, .8, [.28, .7], ALL);                // middling specks
    field(30, 1.1, [.5, .95], ALL, true);          // brighter grains with a halo
    field(8, 14, [.05, .12], [[.8, .62, 1], [1, .7, .92], [.7, .75, 1]], true); // large soft motes
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }

  // Home page sky: a purple nebula. Near-black in the upper right, rich violet clouds billowing toward the lower left,
  // soft cloudy texture (layered noise) and sparse warm stars. Painted once (and again on resize), like the galaxy sky.
  function paintNebula(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const hash = (x, y) => { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); };
    const noise = (x, y) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1); return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy; };
    const fbm = (x, y) => { let v = 0, amp = .5; for (let o = 0; o < 5; o++) { v += amp * noise(x, y); x = x * 2.03 + 11.7; y = y * 2.03 + 5.3; amp *= .5; } return v; };
    // Deep purple-black space with faint wispy clouds drifting diagonally (lower left to upper right), like a quiet night sky.
    const base = [7, 5, 16], haze = [40, 26, 74], wispC = [86, 66, 138];
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
    const step = 3, w = Math.ceil(W / step), h = Math.ceil(H / step), img = new ImageData(w, h), px = img.data, aspect = W / H;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const u = i / w, v = j / h;
      // distance from the diagonal running lower left → upper right; the band is strongest toward the corners
      const across = Math.abs((u * aspect + v) - (aspect + 1) / 2) / (aspect + 1) * 2, along = Math.abs(u - .5) * 2;
      const band = Math.exp(-across * across * 9) * (.35 + .65 * along);
      const cloud = fbm(u * 2.6 * aspect, v * 2.6), wisp = fbm(u * 6.5 * aspect + 7, v * 6.5 + 2);
      let c = mix(base, haze, band * Math.max(0, cloud * 1.4 - .35) * .9);
      c = mix(c, wispC, band * Math.max(0, wisp - .55) * 1.3 * Math.max(0, cloud - .35));
      c = mix(c, [12, 8, 26], .35 * (1 - Math.hypot(u - .5, v - .5) * 1.2)); // a touch lighter in the middle
      // nebula: soft violet clouds in the lower left, a rose-violet one in the upper right, shaped by the cloud noise
      const neb = (cx, cy, rx, ry) => { const dx = (u - cx) / rx, dy = (v - cy) / ry; return Math.exp(-(dx * dx + dy * dy)); };
      const shape = Math.max(0, cloud * 1.6 - .45), fine = .6 + .8 * wisp;
      c = mix(c, [74, 38, 132], neb(.16, .8, .38, .36) * shape * fine * .95);
      c = mix(c, [112, 52, 150], neb(.1, .9, .2, .2) * shape * fine * .6);
      c = mix(c, [96, 34, 112], neb(.86, .18, .32, .3) * shape * fine * .75);
      c = mix(c, [58, 40, 120], neb(.6, .55, .3, .22) * shape * fine * .3);
      const o = (j * w + i) * 4; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; px[o + 3] = 255;
    }
    const low = document.createElement('canvas'); low.width = w; low.height = h; low.getContext('2d').putImageData(img, 0, 0);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.filter = 'blur(2px)'; g.drawImage(low, -4, -4, w * step + 8, h * step + 8); g.filter = 'none';
    // a dense field of fine stars, some small ones, and a handful of brighter ones with a soft halo
    const rand = seeded(20261123), area = W * H / (1440 * 900);
    g.globalCompositeOperation = 'lighter';
    const dot = (x, y, r, col, a) => { g.fillStyle = `rgba(${col},${a.toFixed(2)})`; if (r < .7) g.fillRect(x - r, y - r, r * 2, r * 2); else { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); } };
    const tints = ['255,255,255', '232,226,255', '214,204,255', '255,240,228'];
    for (let k = 0, n = Math.round(2200 * area); k < n; k++) dot(rand() * W, rand() * H, .3 + rand() * .35, tints[k % 4], .18 + rand() * .45);
    for (let k = 0, n = Math.round(320 * area); k < n; k++) dot(rand() * W, rand() * H, .7 + rand() * .6, tints[k % 4], .4 + rand() * .5);
    for (let k = 0, n = Math.round(14 * area); k < n; k++) {
      const x = rand() * W, y = rand() * H, gr = g.createRadialGradient(x, y, 0, x, y, 7);
      gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.3, 'rgba(200,185,255,.35)'); gr.addColorStop(1, 'rgba(150,120,255,0)');
      g.fillStyle = gr; g.fillRect(x - 7, y - 7, 14, 14);
    }
    g.globalCompositeOperation = 'source-over';
  }

  function init() {
    const sky = document.getElementById('cosmic-sky');
    if (sky) {
      const canvas = document.createElement('canvas'); canvas.className = 'galaxy-sky'; canvas.setAttribute('aria-hidden', 'true');
      sky.prepend(canvas); paintSky(canvas);
      const nebula = document.createElement('canvas'); nebula.className = 'nebula-sky'; nebula.setAttribute('aria-hidden', 'true');
      canvas.after(nebula); paintNebula(nebula);
      // Opening on the home page: show its sky at once (no fade); fades only apply when moving between pages later.
      const root = document.documentElement;
      if (!location.hash || location.hash === '#') root.classList.add('sky-home-start');
      setTimeout(() => root.classList.add('sky-ready'), 1200);
      let timer = 0, size = `${innerWidth}x${innerHeight}`;
      addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(() => { const now = `${innerWidth}x${innerHeight}`; if (now !== size) { size = now; paintSky(canvas); paintNebula(nebula); } }, 200); });
    }
    // The living sky on top (as in the reference): bright stars that twinkle, specks drifting toward you,
    // shooting stars with tapering tails now and then, and a gentle parallax against the pointer.
    const live = document.createElement('canvas'); live.id = 'starfield'; live.setAttribute('aria-hidden', 'true');
    if (sky) sky.after(live); else document.body.prepend(live);
    animateSky(live, sky?.querySelector('.galaxy-sky'));
  }

  function animateSky(canvas, painted) {
    const g = canvas.getContext('2d'), rand = seeded(20261122);
    // one soft glow sprite per star colour, drawn with alpha (much cheaper than a new gradient per star per frame)
    const sprites = new Map();
    const sprite = c => { let s = sprites.get(c); if (s) return s;
      s = document.createElement('canvas'); s.width = s.height = 32; const x = s.getContext('2d'), rgb = c.map(v => Math.round(v * 255)).join(','), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.3, `rgba(${rgb},.3)`); gr.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); sprites.set(c, s); return s; };
    let W = 0, H = 0, dpr = 1, twinkle = [], near = [], meteors = [], next = performance.now() + 2500, px = 0, py = 0, aimX = 0, aimY = 0, last = performance.now();
    const TW = [[.9, .95, 1], [1, .85, .95], [.88, .82, 1]], NEAR = [[.8, .92, 1], [.85, .78, 1], [1, .75, .92]], TINT = ['255,255,255', '223,243,255', '214,196,255', '255,200,236', '227,212,255'];
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = W * H / (1440 * 900);
      twinkle = Array.from({ length: Math.round(45 * area) }, () => ({ x: rand() * W, y: rand() * H, r: .8 + rand() * 1.1, c: TW[Math.floor(rand() * 3)], f: .9 + rand() * 1.2, p: rand() * 6.28, depth: .4 + rand() * .6 }));
      near = Array.from({ length: Math.round(55 * area) }, () => spawnNear(true));
    }
    // specks start near the centre and drift outward, growing as they come closer
    function spawnNear(anywhere) { const a = rand() * 6.283, d = anywhere ? rand() : rand() * .15;
      return { a, d, v: .025 + rand() * .05, c: NEAR[Math.floor(rand() * 3)], b: .35 + rand() * .5 }; }
    function meteor(opt = {}) {
      const big = rand() < .18, a = opt.a ?? (2.55 + rand() * .7), len = (big ? .3 : .17) * H + rand() * .1 * H;
      meteors.push({ x: opt.x ?? (.15 + rand() * .95) * W, y: opt.y ?? rand() * .55 * H, dx: Math.cos(a), dy: Math.sin(a), len, w: big ? 2.2 : 1.4,
        dist: (big ? .7 : .45) * H + rand() * .25 * H, dur: (big ? 1500 : 900) + rand() * 700, t0: performance.now() + (opt.delay || 0), c: TINT[Math.floor(rand() * TINT.length)] });
    }
    function shower() { const x = (.4 + rand() * .55) * W, y = rand() * .35 * H, a = 2.5 + rand() * .6, n = 3 + Math.floor(rand() * 4);
      for (let k = 0; k < n; k++) meteor({ x: x + (rand() * 2 - 1) * W * .15, y: y + (rand() * 2 - 1) * H * .1, a: a + (rand() * 2 - 1) * .06, delay: k * (120 + rand() * 260) }); }
    const still = () => document.body.classList.contains('stars-paused') || matchMedia('(prefers-reduced-motion: reduce)').matches;
    addEventListener('pointermove', e => { aimX = e.clientX / W * 2 - 1; aimY = e.clientY / H * 2 - 1; }, { passive: true });
    let timer = 0; addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(size, 200); });
    size();
    function frame(now) {
      if (now - last < 31 || document.hidden) { requestAnimationFrame(frame); return; } // ~30 fps
      const dt = Math.min(.05, (now - last) / 1000), t = now / 1000, calm = still(); last = now;
      g.clearRect(0, 0, W, H);
      if (!calm) { px += (aimX - px) * (1 - Math.exp(-dt * 1.6)); py += (aimY - py) * (1 - Math.exp(-dt * 1.6)); }
      // parallax: the far painted sky slides a little against the pointer, near layers more
      if (painted) painted.style.transform = `translate(${(-px * 7).toFixed(2)}px, ${(-py * 4.5).toFixed(2)}px) scale(1.02)`;
      g.globalCompositeOperation = 'lighter';
      twinkle.forEach(s => { const o = calm ? .7 : .45 + .55 * Math.sin(t * s.f + s.p) ** 2, x = s.x - px * 12 * s.depth, y = s.y - py * 8 * s.depth, R = s.r * 3.4;
        g.globalAlpha = o; g.drawImage(sprite(s.c), x - R, y - R, R * 2, R * 2); });
      g.globalAlpha = 1;
      const R = Math.hypot(W, H) / 2;
      near.forEach((s, i) => { if (!calm) { s.d += s.v * dt * (.3 + s.d * 1.6); if (s.d > 1.05) { near[i] = s = spawnNear(false); } }
        const x = W / 2 + Math.cos(s.a) * s.d * R - px * 22 * s.d, y = H * .5 + Math.sin(s.a) * s.d * R - py * 14 * s.d, r = .35 + s.d * 1.5, o = s.b * Math.min(1, s.d * 6) * .8;
        g.fillStyle = `rgba(${s.c.map(v => Math.round(v * 255)).join(',')},${o.toFixed(3)})`; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); });
      // shooting stars
      if (!calm && now > next) { rand() < .07 ? shower() : meteor(); next = now + 4000 + rand() * 5000; }
      g.lineCap = 'round';
      for (let i = meteors.length - 1; i >= 0; i--) { const m = meteors[i], q = (now - m.t0) / m.dur; if (q < 0) continue; if (q >= 1 || calm) { meteors.splice(i, 1); continue; }
        const e = 1 - (1 - q) ** 2, hx = m.x + m.dx * e * m.dist, hy = m.y + m.dy * e * m.dist, l = m.len * Math.min(1, q * 3) * (1 - q * .35), f = Math.sin(Math.min(1, q * 1.15) * Math.PI);
        const tx = hx - m.dx * l, ty = hy - m.dy * l, lg = g.createLinearGradient(tx, ty, hx, hy);
        lg.addColorStop(0, `rgba(${m.c},0)`); lg.addColorStop(.75, `rgba(${m.c},${(.55 * f).toFixed(3)})`); lg.addColorStop(1, `rgba(${m.c},${f.toFixed(3)})`);
        g.strokeStyle = lg; g.lineWidth = m.w; g.beginPath(); g.moveTo(tx, ty); g.lineTo(hx, hy); g.stroke();
        const hr = m.w * 4, hg = g.createRadialGradient(hx, hy, 0, hx, hy, hr); hg.addColorStop(0, `rgba(${m.c},${f.toFixed(3)})`); hg.addColorStop(.4, `rgba(${m.c},${(.25 * f).toFixed(3)})`); hg.addColorStop(1, `rgba(${m.c},0)`);
        g.fillStyle = hg; g.fillRect(hx - hr, hy - hr, hr * 2, hr * 2); }
      g.globalCompositeOperation = 'source-over';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
