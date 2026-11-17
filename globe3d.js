/* Real 3D planets (three.js): one transparent WebGL layer behind the page draws a lit sphere wherever a turning
   planet (.spin-globe) sits. The DOM keeps everything else: labels, clicks, hover, keyboard, orbits and layout.
   Lighting follows the reference: light from the centre of the system (--shade-angle), Lambert falloff in linear
   light, a faint ambient night side and an atmosphere on the lit limb. Planets in the top layer (the full card,
   The Edit prototype) keep their CSS look. If WebGL is unavailable, nothing changes. */
(() => {
  'use strict';
  if (!window.THREE) return;
  const THREE = window.THREE;
  let renderer;
  const canvas = document.createElement('canvas');
  canvas.id = 'globe-layer'; canvas.setAttribute('aria-hidden', 'true');
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
  catch { return; }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -10000, 10000);
  const geometry = new THREE.SphereGeometry(1, 64, 40);

  const loader = new THREE.TextureLoader(), textures = new Map();
  function texture(url) {
    if (!textures.has(url)) {
      const t = loader.load(url, () => { t.isReady = true; }); t.encoding = THREE.sRGBEncoding; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4;
      textures.set(url, t);
    }
    return textures.get(url);
  }

  const vertex = `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
  const surface = `uniform sampler2D map; uniform vec3 L; uniform vec3 atm; uniform float lit; uniform float alpha; uniform float star; uniform vec3 tint; uniform float tintAmt;
    varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main(){
      vec3 N = normalize(vN), V = vec3(0., 0., 1.);
      vec3 tex = pow(texture2D(map, vUv).rgb, vec3(2.2));                  // to linear light
      tex = mix(tex, vec3(dot(tex, vec3(.2126, .7152, .0722))) * tint, tintAmt); // the AGI globe's gold, coming-soon grey
      float d = dot(N, normalize(L)), diff = max(d, 0.);
      // As in the reference: a light at the system's centre (point light ~2.4) and a very faint ambient (0.06).
      vec3 col = tex * (diff * 1.35 + .05) * lit;
      // The centre globe is the system's own star: lit from the front, evenly.
      col = mix(col, tex * (.82 + .3 * max(dot(N, V), 0.)), star);
      // Atmosphere on the lit limb (the reference's atmMat), drawn on the sphere itself so no ring shows outside it.
      float f = pow(1. - max(dot(N, V), 0.), 3.);
      col += pow(atm, vec3(2.2)) * f * smoothstep(-.35, .55, d) * .75 * (1. - star);
      gl_FragColor = vec4(pow(col, vec3(1. / 2.2)), alpha);
    }`;
  const halo = `uniform vec3 L; uniform vec3 atm; uniform float lit; uniform float alpha; varying vec3 vN; varying vec3 vV;
    void main(){
      vec3 N = normalize(vN); float f = clamp(abs(N.z) / .356, 0., 1.);   // 1 at the planet's edge, 0 at the halo's outer edge
      float a = pow(f, 2.2) * .32 * (.45 + .55 * smoothstep(-.5, .6, dot(N, L)));
      gl_FragColor = vec4(atm, a * .55 * lit * alpha);
    }`;

  // Rings (after the reference): a flat band from 1.4× to 2.25× the planet's radius, banded by noise with two gaps
  // and soft edges, tilted toward the camera and leaning with the planet. Lit by the same light as the sphere.
  const ringHalf = (start) => { const g = new THREE.RingGeometry(1.35, 2.15, 120, 1, start, Math.PI), pos = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) { const r = Math.hypot(pos.getX(i), pos.getY(i)); uv.setXY(i, (r - 1.35) / .8, .5); } return g; };
  const RING_BACK = ringHalf(0), RING_FRONT = ringHalf(Math.PI);
  const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
  const noise = t => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
  const fbm = t => { let v = 0, a = .5, k = 1; for (let o = 0; o < 5; o++) { v += a * noise(t * k + o * 17.3); k *= 2.1; a *= .5; } return v / .97; };
  const ringTextures = new Map();
  function ringTexture(colour) {
    if (ringTextures.has(colour)) return ringTextures.get(colour);
    const tint = new THREE.Color(colour || '#c9c2d8'), pale = new THREE.Color('#e9e4dc').lerp(tint, .22), deep = new THREE.Color('#8d8679').lerp(tint, .3);
    const c = document.createElement('canvas'); c.width = 1024; c.height = 8; const g = c.getContext('2d');
    for (let x = 0; x < 1024; x++) {
      const t = x / 1023, n = Math.min(1, Math.max(0, fbm(t * 11) * .7 + fbm(t * 46) * .3));
      const gap = (t > .58 && t < .62) ? .18 : (t > .84 && t < .855) ? .5 : 1;   // a main division and a faint one
      const sm = v => v * v * (3 - 2 * v), edge = sm(Math.min(1, t / .12)) * sm(Math.min(1, (1 - t) / .14));
      const col = deep.clone().lerp(pale, .35 + n * .65);
      g.fillStyle = `rgba(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0},${(.18 + n * .42) * gap * edge})`; g.fillRect(x, 0, 1, 8);
    }
    const t = new THREE.CanvasTexture(c); ringTextures.set(colour, t); return t;
  }
  const ringVertex = `varying vec2 vUv; varying vec3 vN; varying vec3 vP;
    void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.); vP = (modelMatrix * vec4(position, 1.)).xyz; gl_Position = projectionMatrix * mv; }`;
  const ringShader = `uniform sampler2D map; uniform vec3 L; uniform float alpha; uniform float lit; uniform vec3 centre; uniform float radius;
    varying vec2 vUv; varying vec3 vN; varying vec3 vP;
    void main(){ vec4 t = texture2D(map, vUv); vec3 l = normalize(L);
      float light = .35 + .75 * abs(dot(normalize(vN), l));
      // the planet's shadow on the ring: points whose path toward the light passes through the sphere
      vec3 d = vP - centre; float along = dot(d, l); float off = length(d - along * l);
      float shade = along < 0. ? smoothstep(radius * .92, radius * 1.08, off) : 1.;
      gl_FragColor = vec4(t.rgb * light * mix(.25, 1., shade) * lit, t.a * alpha); }`;
  // Which planets wear a ring: Emerging use cases, about one family planet in three, a family view's centre, and Facilities on the home page.
  const textHash = text => [...(text || '')].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  function wantsRing(node) {
    return false; // planets carry no rings of their own (the rings shown are the orbits they travel on)
    if (node.closest('.moon-wrap.is-emerging')) return true;
    if (node.closest('.family-sun')) return true;
    if (node.closest('[data-universe="facilities"]')) return true;
    const family = node.closest('.family-world');
    return !!family && textHash(family.dataset.family) % 3 === 0;
  }

  const entries = new Map(); let made = 0;
  function make(node) {
    const strip = (getComputedStyle(node).getPropertyValue('--strip').match(/url\(["']?([^"')]+)["']?\)/) || [])[1];
    if (!strip) return null;
    const uniforms = { map: { value: texture(strip) }, L: { value: new THREE.Vector3(-.6, .5, .6).normalize() }, atm: { value: new THREE.Color('#9fd4f0') }, lit: { value: 1 }, alpha: { value: 1 }, star: { value: 0 }, tint: { value: new THREE.Color(1, 1, 1) }, tintAmt: { value: 0 } };
    const body = new THREE.Mesh(geometry, new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: surface, transparent: true }));
    const shell = new THREE.Mesh(geometry, new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: halo, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide }));
    shell.scale.setScalar(1.07);
    shell.visible = false; // no halo shell: it read as a ring around each planet
    // As in the reference: each planet leans on its own axis and turns at its own pace (0.10–0.22 rad/s).
    const k = made++, tilt = new THREE.Group(); tilt.rotation.z = (k % 3 - 1) * .28 + .12; tilt.add(body, shell);
    let ring = null;
    if (wantsRing(node)) {
      const colour = (getComputedStyle(node).getPropertyValue('--family-colour') || getComputedStyle(node).getPropertyValue('--planet-tint')).trim();
      const ringUniforms = { map: { value: ringTexture(colour) }, L: uniforms.L, alpha: uniforms.alpha, lit: uniforms.lit, centre: { value: new THREE.Vector3() }, radius: { value: 1 } };
      const half = (geo, front) => { const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: ringUniforms, vertexShader: ringVertex, fragmentShader: ringShader,
        transparent: true, side: THREE.DoubleSide, depthWrite: false, depthTest: !front })); m.rotation.x = -Math.PI / 2 - .42; m.renderOrder = front ? 3 : 0; return m; };
      ring = new THREE.Group(); ring.add(half(RING_BACK, false), half(RING_FRONT, true)); ring.userData.uniforms = ringUniforms;
      body.renderOrder = 1; tilt.add(ring);
      node.classList.add('has-3d-ring');
    }
    const group = new THREE.Group(); group.add(tilt); scene.add(group);
    const entry = { node, group, body, ring, uniforms, strip, rate: .1 + (k % 4) * .04, phase: Math.random() * Math.PI * 2 };
    entries.set(node, entry); // 'is-3d' (which hides the flat planet) is added once the texture has loaded
    return entry;
  }
  const shellOf = entry => entry.group.children[0].children[1];
  function drop(entry) {
    scene.remove(entry.group); entry.body.material.dispose(); shellOf(entry).material.dispose(); entry.ring?.children.forEach(m => m.material.dispose()); entry.node.classList.remove('has-3d-ring');
    entry.node.classList.remove('is-3d'); entries.delete(entry.node);
  }

  // Which planets the layer may draw: visible, on the page (not in a dialog, popover or the prototype overlay).
  const skip = node => node.closest('.card-planet, .lp-edit, dialog, [hidden], .is-list');
  const still = () => document.body.classList.contains('stars-paused') || matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The centre of the system a planet belongs to (the AGI globe or a family's centre planet), once per frame.
  const centres = new Map();
  function centreOf(node) {
    const map = node.closest('.family-map') || document.body;
    if (!centres.has(map)) {
      const c = map.querySelector('.service-sun .spin-globe, .service-sun, .family-centre'), b = c?.getBoundingClientRect();
      centres.set(map, b && b.width ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 });
    }
    return centres.get(map);
  }
  // Orbit lines live in this layer too, behind every planet. Their shapes come from the page's own orbit drawings
  // (sampled once per shape, then placed on screen each frame), so they follow resizing and the camera exactly.
  const tracks = new Map(), trackMaterial = op => new THREE.LineBasicMaterial({ color: new THREE.Color('#d6c8f2'), transparent: true, opacity: op, depthWrite: false });
  function syncTracks(seen) {
    document.querySelectorAll('.family-orbit-lines .family-track').forEach(el => {
      if (skip(el)) return;
      const matrix = el.getScreenCTM && el.getScreenCTM(); if (!matrix) return;
      const shape = el.getAttribute('d') || ['cx', 'cy', 'rx', 'ry', 'transform'].map(a => el.getAttribute(a)).join(',');
      let t = tracks.get(el);
      if (!t || t.shape !== shape) {
        if (t) { scene.remove(t.line); t.line.geometry.dispose(); }
        let length = 0; try { length = el.getTotalLength(); } catch { return; }
        if (!length) return;
        const N = 180, local = Array.from({ length: N }, (_, i) => el.getPointAtLength(i / N * length));
        const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
        const line = new THREE.LineLoop(geometry, trackMaterial(el.classList.contains('track-1') ? .22 : .16)); line.renderOrder = -1; scene.add(line);
        t = { line, local, shape }; tracks.set(el, t);
      }
      const pos = t.line.geometry.attributes.position;
      t.local.forEach((p, i) => { pos.setXYZ(i, matrix.a * p.x + matrix.c * p.y + matrix.e, -(matrix.b * p.x + matrix.d * p.y + matrix.f), 0); });
      pos.needsUpdate = true; t.line.geometry.computeBoundingSphere(); seen.add(el);
    });
    tracks.forEach((t, el) => { if (!seen.has(el)) { scene.remove(t.line); t.line.geometry.dispose(); t.line.material.dispose(); tracks.delete(el); } });
  }

  let W = 0, H = 0, clock = 0, last = performance.now();
  function size() {
    W = innerWidth; H = innerHeight; renderer.setSize(W, H, false);
    camera.left = 0; camera.right = W; camera.top = 0; camera.bottom = -H; camera.updateProjectionMatrix();
  }
  addEventListener('resize', size);

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (document.hidden) return;
    if (!still()) clock += dt;
    const seen = new Set(); centres.clear();
    document.querySelectorAll('.spin-globe').forEach(node => {
      if (skip(node)) return;
      const box = node.getBoundingClientRect();
      if (box.width < 2 || box.bottom < -box.height || box.top > H + box.height) return;
      let entry = entries.get(node) || make(node);
      if (!entry) return;
      seen.add(node);
      const r = box.width / 2;
      // One read of the planet's styles: its light angle, colour and depth dimming are inherited custom properties.
      const cs = getComputedStyle(node), host = node.closest('.family-world, .usecase-moon, .service-sun, .universe-world');
      const hs = host ? getComputedStyle(host) : null;
      // Stack order: the planet's own z-index (home: in front of or behind AGI), then its size.
      const z = (parseInt(hs?.zIndex, 10) || 2) * 1200 + r;
      entry.group.position.set(box.left + r, -(box.top + r), z);
      entry.group.scale.setScalar(r);
      if (entry.ring) { entry.ring.userData.uniforms.centre.value.set(box.left + r, -(box.top + r), z); entry.ring.userData.uniforms.radius.value = r; }
      entry.body.rotation.y = entry.phase + clock * entry.rate;
      // Light comes from the system's centre, as from a sun in the orbital plane seen from above: planets beside it are
      // half lit, planets in front of it (lower on screen) show a crescent, planets behind it are nearly full.
      // Only the AGI globe is a star (it lights the home system). A family's centre is a planet: lit by a key light from the
      // upper left, like the reference's large focused planet, so it shows the same curved shadow.
      const isCentre = !!node.closest('.service-sun, .family-centre'), isStar = false; // every centre, the AGI globe included, is lit like a planet
      entry.uniforms.star.value = isStar ? 1 : 0;
      if (isCentre && !isStar) entry.uniforms.L.value.set(-1, .3, .12); // light from the left side: the right half falls into deep shadow
      if (node.closest('.agi-planet')) { entry.uniforms.tint.value.setRGB(1.75, 1.18, .42); entry.uniforms.tintAmt.value = 1; entry.uniforms.atm.value.set('#ffc25e'); entry.colour = '#ffc25e'; }
      else if (node.closest('.universe-world.is-soon')) { entry.uniforms.tint.value.setRGB(1, 1, 1); entry.uniforms.tintAmt.value = 1; }
      else entry.uniforms.tintAmt.value = 0;
      if (!isCentre) {
        const sun = centreOf(node), dx = box.left + r - sun.x, dy = box.top + r - sun.y;
        if (Math.hypot(dx, dy) < 1) entry.uniforms.L.value.set(-.5, .5, .7); else entry.uniforms.L.value.set(-dx, dy, -dy * 1.25);
      }
      const colour = (cs.getPropertyValue('--family-colour') || cs.getPropertyValue('--planet-tint')).trim();
      if (colour !== entry.colour && !node.closest('.agi-planet')) { entry.colour = colour; try { entry.uniforms.atm.value.set(colour || '#9fd4f0'); } catch { entry.uniforms.atm.value.set('#9fd4f0'); } }
      entry.uniforms.lit.value = parseFloat(cs.getPropertyValue('--depth-dim')) || 1;
      // Follow the planet's own fading (filtered-out planets, a lifted moon, views fading in or out).
      const alpha = host?.classList.contains('is-lifted') ? 0 : Math.min(parseFloat(hs?.opacity ?? 1), parseFloat(cs.opacity));
      const ready = !!entry.uniforms.map.value.isReady;
      if (ready !== entry.shown) { entry.shown = ready; node.classList.toggle('is-3d', ready); }
      entry.uniforms.alpha.value = alpha; entry.group.visible = ready && alpha > .01;
    });
    entries.forEach(entry => { if (!seen.has(entry.node)) drop(entry); });
    syncTracks(new Set());
    renderer.render(scene, camera);
  }

  function start() {
    const sky = document.getElementById('starfield') || document.getElementById('cosmic-sky');
    if (sky) sky.after(canvas); else document.body.prepend(canvas);
    document.documentElement.classList.add('has-3d-globes');
    size(); requestAnimationFrame(frame);
  }
  // After the starfield is in place (both are deferred; this one loads later).
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0)); else setTimeout(start, 0);
})();
