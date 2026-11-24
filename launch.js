/* PROTOTYPE: the rocket flight from the Tech Incubation Hub launch page (?launch, hub-landing.js) into the
   Innovation Hub. The launch page drops away, stars streak past, and the rocket flies a gravity turn to the AGI planet. */
(() => {
  'use strict';
  if (!window.ATLAS_LANDING) return;
  const TARGET = 'agi'; // the Al Ghurair Investment planet at the centre of the Hub
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('stars-paused');
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  const hubNode = () => TARGET === 'agi' ? document.querySelector('.universe-map .family-centre') : document.querySelector(`[data-universe="${TARGET}"]`);
  const target = () => {
    const node = TARGET === 'agi' ? hubNode()?.querySelector('.spin-globe, canvas') || hubNode() : hubNode()?.querySelector('.planet-body') || hubNode();
    if (!node) return null; const b = node.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, r: Math.max(18, b.width * (TARGET === 'agi' ? .5 : .31)) }; };

  function launch({ page, warp, rocket, go, fromRect, after }) {
    if (go) go.disabled = true;
    if (reduced()) { page.classList.add('is-gone'); setTimeout(() => { page.hidden = true; if (go) go.disabled = false; land(after); }, 350); return; }
    page.classList.add('is-gone');

    // Stars stretch past while the page drops away.
    const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2), g = warp.getContext('2d');
    warp.width = W * dpr; warp.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const streaks = Array.from({ length: 120 }, () => ({ a: Math.random() * Math.PI * 2, d: 20 + Math.random() * Math.max(W, H) * .5, v: .6 + Math.random() * 1.4, c: Math.random() < .15 ? '255,214,160' : Math.random() < .35 ? '200,180,255' : '235,242,255' }));
    const trail = [], smoke = [];
    const from = { x: fromRect.left + fromRect.width / 2, y: fromRect.top + fromRect.height / 2 };
    const t0 = performance.now(), LIFT = 950, FLY = 2000, TOTAL = LIFT + FLY;
    const tail = Math.max(30, rocket.offsetHeight / 2 - 6); // nozzles: just under the rocket's base
    warp.classList.add('is-on'); rocket.classList.add('is-on');

    function frame(now) {
      const t = now - t0;
      g.clearRect(0, 0, W, H);
      const w = Math.max(0, 1 - t / (TOTAL * .75));
      if (w > 0) {
        g.lineCap = 'round';
        streaks.forEach(s => {
          const d = s.d * (1 + (t / 700) * s.v), len = 6 + 50 * w * s.v;
          const x1 = W / 2 + Math.cos(s.a) * d, y1 = H * .45 + Math.sin(s.a) * d, x2 = W / 2 + Math.cos(s.a) * (d + len), y2 = H * .45 + Math.sin(s.a) * (d + len);
          g.strokeStyle = `rgba(${s.c},${(.2 * w).toFixed(3)})`; g.lineWidth = .4 + s.v * .4; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
        });
      }
      const to = target() || { x: W / 2, y: H / 2, r: 30 };
      let x, y, angle, scale;
      if (t < LIFT) {
        // lift-off: slow at first, then accelerating (thrust beats gravity), with a little engine shake that settles
        const p = t / LIFT, q = p * p, shake = (1 - p) * 1.4;
        x = from.x + Math.sin(t * .11) * shake; y = from.y - q * Math.min(260, from.y * .45) + Math.cos(t * .13) * shake * .5; angle = 0; scale = .45 + p * .75;
      } else {
        // gravity turn: it carries its speed out of the climb, pitches over gradually and slows to land
        const pf = Math.min(1, (t - LIFT) / FLY), q = 1 - Math.pow(1 - pf, 2.4), sx = from.x, sy = from.y - Math.min(260, from.y * .45);
        // from below the screen it rises and bends straight onto the planet; otherwise it arcs over and comes down
        const below = from.y > H;
        const cx = below ? sx + (to.x - sx) * .2 : (sx + to.x) / 2 + (to.x < sx ? -1 : 1) * W * .18,
          cy = below ? to.y + (sy - to.y) * .25 : Math.min(sy, to.y) - H * .28;
        x = (1 - q) ** 2 * sx + 2 * (1 - q) * q * cx + q * q * to.x; y = (1 - q) ** 2 * sy + 2 * (1 - q) * q * cy + q * q * to.y;
        const dx = 2 * (1 - q) * (cx - sx) + 2 * q * (to.x - cx), dy = 2 * (1 - q) * (cy - sy) + 2 * q * (to.y - cy);
        angle = Math.atan2(dx, -dy) * 180 / Math.PI; scale = 1.2 - q * .95;
      }
      rocket.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`;
      const rad = (angle + 180) * Math.PI / 180, nx = Math.sin(rad), ny = -Math.cos(rad);
      for (let i = 0; i < 2; i++) trail.push({ x: x + nx * tail * scale + (Math.random() - .5) * 4 * scale, y: y + ny * tail * scale + (Math.random() - .5) * 4 * scale,
        vx: nx * (.4 + Math.random() * .6) + (Math.random() - .5) * .5, vy: ny * (.4 + Math.random() * .6) + (Math.random() - .5) * .5, s: scale, t: now, life: 900 + Math.random() * 500 });
      if (t < LIFT * .7) for (let i = 0; i < 3; i++) { const a = Math.PI * (.05 + Math.random() * .9);
        smoke.push({ x: from.x + (Math.random() - .5) * 10, y: from.y + 14, vx: Math.cos(a) * (1 + Math.random() * 2.4) * (Math.random() < .5 ? -1 : 1), vy: -Math.random() * .6, r: 6 + Math.random() * 8, t: now, life: 1400 + Math.random() * 700 }); }
      const glowR = 90 + 160 * scale, glow = g.createRadialGradient(x + nx * (tail + 4) * scale, y + ny * (tail + 4) * scale, 0, x + nx * (tail + 4) * scale, y + ny * (tail + 4) * scale, glowR);
      glow.addColorStop(0, `rgba(255,170,60,${(t < LIFT ? .22 : .12 * (1 - Math.min(1, (t - LIFT) / FLY))).toFixed(3)})`); glow.addColorStop(1, 'rgba(255,90,20,0)');
      g.fillStyle = glow; g.fillRect(0, 0, W, H);
      const puff = (p, r, rgba) => { const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); gr.addColorStop(0, rgba); gr.addColorStop(1, rgba.replace(/[\d.]+\)$/, '0)')); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill(); };
      for (let i = smoke.length - 1; i >= 0; i--) { const p = smoke[i], age = (now - p.t) / p.life; if (age >= 1) { smoke.splice(i, 1); continue; }
        p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy -= .01;
        puff(p, p.r * (1 + age * 3.2), `rgba(${Math.round(205 - 40 * age)},${Math.round(200 - 40 * age)},${Math.round(198 - 36 * age)},${(.32 * (1 - age)).toFixed(3)})`); }
      for (let i = trail.length - 1; i >= 0; i--) { const p = trail[i], age = (now - p.t) / p.life; if (age >= 1) { trail.splice(i, 1); continue; }
        p.x += p.vx; p.y += p.vy; p.vx *= .97; p.vy *= .97;
        if (age < .22) { const k = age / .22;
          const c = k < .3 ? [255, 250, 220] : k < .6 ? [255, 205, 70] : k < .85 ? [255, 130, 30] : [220, 60, 20];
          puff(p, (4 + 7 * k) * p.s + 1, `rgba(${c[0]},${c[1]},${c[2]},${(.85 * (1 - k * .4)).toFixed(3)})`); }
        else { const k = (age - .22) / .78;
          puff(p, (8 + 26 * k) * p.s + 2, `rgba(${Math.round(190 - 60 * k)},${Math.round(184 - 54 * k)},${Math.round(180 - 40 * k)},${(.26 * (1 - k)).toFixed(3)})`); } }
      if (t < TOTAL) { requestAnimationFrame(frame); return; }
      rocket.classList.remove('is-on'); page.hidden = true; if (go) go.disabled = false;
      const fade = performance.now();
      (function out(n) { const k = Math.min(1, (n - fade) / 900); g.clearRect(0, 0, W, H); g.globalAlpha = 1 - k;
        [...smoke, ...trail].forEach(p => { p.x += p.vx * .5; p.y += p.vy * .5; const r = 18 * (p.s || 1) + 6;
          const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); gr.addColorStop(0, 'rgba(170,168,170,.18)'); gr.addColorStop(1, 'rgba(170,168,170,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill(); });
        g.globalAlpha = 1;
        if (k < 1) requestAnimationFrame(out); else { g.clearRect(0, 0, W, H); warp.classList.remove('is-on'); } })(fade);
      land(after);
    }
    requestAnimationFrame(frame);
  }

  function land(after) {
    const node = hubNode(), to = target();
    if (to) {
      const ring = el('span', 'lp-ring'); ring.setAttribute('aria-hidden', 'true');
      ring.style.left = `${to.x}px`; ring.style.top = `${to.y}px`; ring.style.width = ring.style.height = `${to.r * 2}px`;
      document.body.append(ring); ring.addEventListener('animationend', () => ring.remove());
    }
    if (node && node.matches('button, a, [tabindex]')) node.focus({ preventScroll: true });
    document.body.classList.remove('lp-on');
    if (after) after();
  }

  // The warp canvas and the flying rocket, made once.
  let warpNode = null, rocketNode = null;
  function rig() {
    if (!warpNode) {
      warpNode = el('canvas', 'lp-warp'); warpNode.setAttribute('aria-hidden', 'true');
      // the same photographed rocket as the launch page hero (its body, without the plume; the flight draws the flame)
      rocketNode = el('div', 'lp-rocket is-photo'); rocketNode.innerHTML = '<img src="assets/landing/rocket-body.png" alt="">'; rocketNode.setAttribute('aria-hidden', 'true');
      document.body.append(warpNode, rocketNode);
    }
    return { warp: warpNode, rocket: rocketNode };
  }

  // Used by the Tech Incubation Hub launch page (hub-landing.js, ?launch) for the rocket flight into the Hub.
  window.LaunchPad = {
    // Fly from a button on `page` to the AGI planet in the Innovation Hub; `page` drops away, then `after` runs.
    toHub(page, from, after) {
      document.body.classList.remove('lp-reading');
      document.querySelectorAll('#cosmic-sky, #starfield').forEach(n => { n.style.translate = '0 0'; n.style.scale = '1'; });
      const { warp, rocket } = rig();
      launch({ page, warp, rocket, go: from, fromRect: from.getBoundingClientRect(), after });
    },
  };

})();
