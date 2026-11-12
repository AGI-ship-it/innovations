/* One family per collection/domain. Case tracks alone encode maturity. */
(() => {
  'use strict';
  const stages = ['Established', 'Scaling', 'Emerging'];
  const names = {
    'Workforce Management / Mobile FM Apps': 'Workforce management',
    'IoT Sensors & Smart Building Platforms': 'IoT & smart buildings',
    'Frontline Worker Technologies / Mobile Workforce Solution': 'Frontline worker technologies',
    'ESG / Carbon Tracking Platforms': 'ESG & carbon tracking',
    'BMS/BAS & Autonomous HVAC Optimization': 'BMS & autonomous HVAC',
    'AI/ML Predictive Maintenance': 'AI / ML predictive maintenance',
    'Autonomous Cleaning Robots': 'Autonomous cleaning robots',
    'Generative AI / AI Copilots': 'Generative AI & copilots',
    'Drones for Inspection': 'Drones for inspection',
    'Wearables for Lone Worker Safety': 'Lone-worker wearables',
    'Computer Vision (Space Utilization & Security)': 'Computer vision',
    'AR/VR for Maintenance & Training': 'AR / VR',
    '3D Printing for Spare Parts (Additive Mfg)': '3D printing',
    'Digital Twins': 'Digital twins',
  };
  const label = domain => (names[domain] || domain).replace(/(^|[\s/-])([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase());
  // Each technology family has one colour and planet texture, used everywhere it appears.
  const looks = {
    'AI/ML Predictive Maintenance': ['ai-ml', '#8b5cf6'], 'IoT Sensors & Smart Building Platforms': ['iot', '#22c3e6'],
    'BMS/BAS & Autonomous HVAC Optimization': ['bms', '#6aa8ff'], 'ESG / Carbon Tracking Platforms': ['esg', '#3fbf7f'],
    'Workforce Management / Mobile FM Apps': ['workforce', '#f2a33a'], 'Generative AI / AI Copilots': ['genai', '#e04fb8'],
    'Autonomous Cleaning Robots': ['cleaning', '#2bb3a3'], 'Drones for Inspection': ['drones', '#5ec8ff'],
    'Frontline Worker Technologies / Mobile Workforce Solution': ['frontline', '#ff7a45'], 'Wearables for Lone Worker Safety': ['wearables', '#ff5d6c'],
    'Computer Vision (Space Utilization & Security)': ['vision', '#5b6cff'], 'AR/VR for Maintenance & Training': ['arvr', '#c06cff'],
    '3D Printing for Spare Parts (Additive Mfg)': ['printing', '#d98a5b'], 'Digital Twins': ['twins', '#a8d65a'],
  };
  // Light (day) theme uses realistic illustrated surfaces, one per family.
  const daySurface = { 'ai-ml': 'amethyst', iot: 'uranus', bms: 'neptune', esg: 'forest', workforce: 'golden', genai: 'rose', cleaning: 'ocean',
    drones: 'storm', frontline: 'mars', wearables: 'lava', vision: 'alien', arvr: 'jupiter', printing: 'desert', twins: 'earth' };
  const look = domain => { const [slug, colour] = looks[domain] || ['ai-ml', '#8b5cf6']; return { texture: `assets/planets/families/${slug}.png?v=2`, strip: `assets/planets/families/strip-${slug}.png`, day: `assets/planets/surfaces/${daySurface[slug] || 'moon'}.jpg`, colour }; };
  const maturityDay = { established: 'golden', scaling: 'rose', emerging: 'ice' };
  // A sphere whose surface slides horizontally behind a circular window, with fixed lighting on top.
  function spinGlobe(strip, seconds, day) {
    const node = element('span', 'spin-globe');
    node.style.setProperty('--strip', `url("${strip}")`);
    node.style.setProperty('--strip-day', `url("${day || strip}")`);
    node.style.setProperty('--spin', `${seconds}s`);
    node.setAttribute('aria-hidden', 'true');
    return node;
  }
  const key = record => JSON.stringify([record.collection, record.domain]);
  function families(records) {
    const map = new Map();
    records.forEach(record => {
      const id = key(record);
      if (!map.has(id)) map.set(id, { id, domain: record.domain, label: label(record.domain), collection: record.collection, records: [] });
      map.get(id).records.push(record);
    });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }
  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const svgElement = (tag, attributes) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    return node;
  };
  const clear = (a, b, gap = 10) => Math.abs(a.x - b.x) >= (a.width + b.width) / 2 + gap || Math.abs(a.y - b.y) >= (a.height + b.height) / 2 + gap;
  function point(item, ring, angle, centre) {
    const ox = Math.cos(angle) * ring.rx, oy = Math.sin(angle) * ring.ry, shift = ring.shift || 0;
    if (!ring.tilt) return { ...item, angle, x: centre.x + shift + ox, y: centre.y + oy };
    // A tilted (and optionally off-centre) orbit: rotate the ellipse point around its own centre.
    const c = Math.cos(ring.tilt), s = Math.sin(ring.tilt);
    return { ...item, angle, x: centre.x + shift + ox * c - oy * s, y: centre.y + ox * s + oy * c };
  }
  // Preserve assigned tracks and grow vertical room only when labels need it.
  // Case tracks encode maturity; overview tracks are decorative.
  function arrange(items, width, caseMode = false, fitHeight = 0, centreSize = 0, loose = false) {
    const compact = width < 650;
    const maxWidth = Math.max(...items.map(item => item.width), 120);
    const maxHeight = Math.max(...items.map(item => item.height), 90);
    // Orbits scale with how many planets there are: a family of two stays compact; big families use the full width.
    // The Facilities overview (no caseMode, default centre) keeps its families close to the centre, like the home page.
    const reach = compact || loose ? Infinity : (!caseMode && !centreSize ? 170 + items.length * 34 : 220 + items.length * 52);
    const outerX = Math.max(48, Math.min(width / 2 - maxWidth / 2 - 16, reach));
    // Desktop overview starts at the height left in the first screen; it grows only if labels would collide.
    let height = compact ? Math.max(caseMode ? 1000 : 1260, items.length * 125) : fitHeight ? Math.max(fitHeight, items.length * 40) : Math.max(caseMode ? 720 : 960, items.length * 66);
    const attempts = fitHeight ? 20 : 12, growth = fitHeight ? 1.08 : 1.18;
    for (let attempt = 0; attempt < attempts; attempt++, height *= growth) {
      const centre = { x: width / 2, y: height / 2, width: centreSize || (compact ? (caseMode ? 120 : 78) : 160), height: centreSize || (caseMode ? 180 : compact ? 100 : 160) };
      const outerY = loose ? height / 2 - maxHeight / 2 - 44 : Math.min(height / 2 - maxHeight / 2 - 44, Math.max(outerX * .5, 150));
      // Try a few ring spacings at this height before giving up and growing taller.
      const ringSets = caseMode ? (fitHeight ? [[.62, .81, 1], [.7, .86, 1], [.55, .78, 1], [.48, .74, 1]] : [[.62, .81, 1]]) : fitHeight ? [[.46, .74, 1], [.52, .78, 1], [.4, .7, 1]] : [[.40, .70, 1]];
      for (const set of ringSets) {
      const rings = set.map(scale => ({ rx: outerX * scale, ry: outerY * scale }));
      const placed = [];
      let failed = false;
      for (let ring = 0; ring < 3; ring++) {
        const members = items.filter(item => item.ring === ring);
        for (let index = 0; index < members.length; index++) {
          const item = members[index];
          // Universe planets carry an evenly spread preferred angle; other views spread per ring.
          const target = item.preferred ?? -Math.PI / 2 + (index + .32 + ring * .23) / members.length * Math.PI * 2;
          let chosen;
          for (let step = 0; step < 1440; step++) {
            const offset = Math.ceil(step / 2) * Math.PI / 720 * (step % 2 ? 1 : -1);
            const candidate = point(item, rings[ring], target + offset, centre);
            if (placed.concat(centre).every(other => clear(candidate, other))) { chosen = candidate; break; }
          }
          if (!chosen) { failed = true; break; }
          placed.push(chosen);
        }
        if (failed) break;
      }
      if (!failed) return { width, height: Math.ceil(height), centre, rings, nodes: placed };
      }
    }
    throw new Error('The technology-family labels need more room. Use the research index to explore all cases.');
  }
  function advance(layout, seconds) {
    const nodes = layout.nodes.map(node => ({ ...node }));
    nodes.forEach((node, index) => {
      const ring = layout.rings[node.ring];
      // Evenly spread views orbit at one speed so their spacing holds; others drift per ring.
      const delta = Math.min(seconds, .05) * Math.PI * 2 / (layout.uniform ? 300 : 260 + node.ring * 80);
      // The universe's planets travel together at one speed, so their spacing holds without collision checks.
      if (layout.together) { Object.assign(node, point(node, ring, node.angle + delta, layout.centre)); return; }
      // Check the whole short arc, preserving readable upright hit targets.
      for (const fraction of [1, .5, .2]) {
        const candidate = point(node, ring, node.angle + delta * fraction, layout.centre);
        if (nodes.every((other, otherIndex) => otherIndex === index || clear(candidate, other, 8)) && clear(candidate, layout.centre, 8)) {
          Object.assign(node, candidate); break;
        }
      }
    });
    return nodes;
  }
  window.FamilyAtlas = { families, key, label, look, spinGlobe, maturityDay, stages, arrange, advance };
  // Paints the mark onto the front of a sphere at high resolution with smooth (bilinear) sampling:
  // each sphere pixel reads the flat mark at asin(n) per axis, so it is true at the centre and bends toward the rim.
  function paintWrappedMark(canvas, src) {
    const SIZE = 720, MARK = .54;
    canvas.width = canvas.height = SIZE;
    const image = new Image();
    image.onload = () => {
      const flat = document.createElement('canvas'); flat.width = flat.height = SIZE;
      const fctx = flat.getContext('2d'), m = SIZE * MARK;
      fctx.drawImage(image, (SIZE - m) / 2, (SIZE - m) / 2, m, m);
      const from = fctx.getImageData(0, 0, SIZE, SIZE).data;
      const ctx = canvas.getContext('2d'), out = ctx.createImageData(SIZE, SIZE), to = out.data;
      const sample = (x, y, channel) => {
        const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
        const at = (px, py) => (px < 0 || py < 0 || px >= SIZE || py >= SIZE) ? 0 : from[(py * SIZE + px) * 4 + channel];
        return (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy) + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy;
      };
      const half = SIZE / 2;
      for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
        const nx = (x + .5) / half - 1, ny = (y + .5) / half - 1;
        if (nx * nx + ny * ny >= 1) continue;
        const sx = (Math.asin(nx) + 1) * half - .5, sy = (Math.asin(ny) + 1) * half - .5, i = (y * SIZE + x) * 4;
        const a = sample(sx, sy, 3);
        if (!a) continue;
        // Colour channels are premultiplied-free here, so weight them by alpha to avoid dark fringes.
        const r = sample(sx, sy, 0), g = sample(sx, sy, 1), b = sample(sx, sy, 2);
        to[i] = r; to[i + 1] = g; to[i + 2] = b; to[i + 3] = a;
      }
      ctx.putImageData(out, 0, 0);
    };
    image.src = src;
  }
  // Shared measured geometry keeps overview and case motion on exact tracks.
  function createMap(container, onSelect, { caseMode = false, universe = false, centreLabel = 'Facilities', centreSubLabel = '', domain = '' } = {}) {
    let layout = null, current = [], frame = 0, previous = null, speed = 0, comets = [], cometTime = 0;
    const nodes = new Map();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    container.classList.toggle('case-orbit-map', caseMode);
    container.classList.toggle('universe-map', universe);
    const paths = svgElement('svg', { class: 'family-orbit-lines', 'aria-hidden': 'true' });
    const centre = element('div', `family-centre${caseMode ? ' case-centre' : ''}`);
    // The Facilities galaxy is centred on the Facilities planet itself (purple, named); other views carry the Al Ghurair mark.
    const area = !caseMode && !universe ? (window.ATLAS_UNIVERSE?.planets || []).find(planet => planet.id === 'facilities') : null;
    let sun;
    if (area) {
      sun = element('div', 'service-sun area-sun');
      if (area.tint) sun.style.setProperty('--planet-tint', area.tint);
      const surface = element('img', 'area-sun-surface'); surface.src = `assets/planets/${area.surface}.png`; surface.alt = '';
      if (area.strip) { sun.classList.add('family-sun'); sun.append(surface, spinGlobe(area.strip, 90), element('span', 'globe-shade'), element('strong', 'area-sun-name', area.name)); }
      else sun.append(surface, element('span', 'area-sun-shade'), element('strong', 'area-sun-name', area.name));
    } else if (caseMode) {
      // Family views: the centre is the family's own planet, with its name on it.
      const { texture, colour } = look(domain);
      sun = element('div', 'service-sun area-sun family-sun');
      sun.style.setProperty('--planet-tint', colour);
      const surface = element('img', 'area-sun-surface'); surface.src = texture; surface.alt = '';
      sun.append(surface, spinGlobe(look(domain).strip, 90, look(domain).day), element('span', 'globe-shade'), element('strong', 'family-sun-name', centreLabel));
    } else {
      sun = element('div', 'service-sun facilities-sun');
      const mark = element('img', 'sun-mark');
      mark.src = 'assets/mark-dark.svg'; mark.alt = ''; mark.width = 72; mark.height = 72;
      // The universe's AGI centre is a real turning planet with a lit and a dark side, the mark on top.
      if (universe) {
        sun.classList.add('agi-planet');
        // The mark is wrapped onto the sphere: an SVG displacement filter bends it like a decal on a globe.
        const wrap = element('span', 'agi-mark-wrap');
        const canvas = document.createElement('canvas'); canvas.className = 'agi-mark-canvas'; canvas.setAttribute('aria-hidden', 'true');
        wrap.append(canvas);
        sun.append(spinGlobe('assets/planets/solar/2k_moon.jpg', 24), wrap, element('span', 'globe-shade'));
        paintWrappedMark(canvas, mark.src);
      } else sun.append(mark);
    }
    const caption = element('span', 'centre-caption', caseMode || universe ? centreLabel : 'TECHNOLOGY FAMILIES');
    if (centreSubLabel) caption.append(element('small', 'centre-sub', centreSubLabel));
    if (caseMode) caption.hidden = true;
    centre.append(sun, caption);
    // The AGI globe wears a thin light ring: its back half passes behind the globe, its front half across the middle.
    if (universe) centre.prepend(element('span', 'agi-ring is-back')), centre.append(element('span', 'agi-ring is-front'));
    const empty = element('p', 'family-empty', 'No technology families in this collection.');
    container.replaceChildren(paths, centre, empty);
    // Home only: a few tiny unnamed planets drifting on their own orbits (decorative, not interactive).
    const minis = universe ? [
      { map: 'assets/planets/solar/2k_mars.jpg', size: 18, reach: .48, tilt: 14, speed: 1.6, angle: .4 },
      { map: 'assets/planets/solar/2k_neptune.jpg', size: 13, reach: 1.02, tilt: -6, speed: .7, angle: 2.2 },
      { map: 'assets/planets/solar/2k_moon.jpg', size: 10, reach: .62, tilt: -12, speed: 1.2, angle: 4.1 },
      { map: 'assets/planets/solar/2k_venus_atmosphere.jpg', size: 15, reach: 1.1, tilt: 9, speed: .55, angle: 5.3 },
      { map: 'assets/planets/solar/2k_uranus.jpg', size: 12, reach: .84, tilt: 3, speed: .9, angle: 1.1 },
      { map: 'assets/planets/solar/2k_jupiter.jpg', size: 20, reach: 1.18, tilt: -3, speed: .45, angle: 3.4 },
    ].map(spec => {
      const node = element('span', 'mini-planet'); node.setAttribute('aria-hidden', 'true');
      node.style.setProperty('--strip', `url("${spec.map}")`); node.style.width = `${Math.round(spec.size * 1.6)}px`;
      container.append(node); return { ...spec, node };
    }) : [];
    function moveMinis(elapsed, still) {
      if (!layout || !minis.length) return;
      const base = layout.rings.reduce((max, ring) => Math.max(max, ring.rx), 0) || 300;
      minis.forEach(mini => {
        if (!still) mini.angle += elapsed * mini.speed * .05;
        const rx = Math.min(Math.max(175, base * mini.reach), layout.width / 2 - 14), ry = layout.width < 600 ? rx * 1.25 : rx * .4, tilt = mini.tilt * Math.PI / 180;
        const ox = Math.cos(mini.angle) * rx, oy = Math.sin(mini.angle) * ry;
        const x = layout.centre.x + ox * Math.cos(tilt) - oy * Math.sin(tilt), y = layout.centre.y + ox * Math.sin(tilt) + oy * Math.cos(tilt);
        mini.node.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
        const dx = layout.centre.x - x, dy = layout.centre.y - y, length = Math.hypot(dx, dy) || 1;
        mini.node.style.setProperty('--lx', `${(50 + dx / length * 26).toFixed(0)}%`);
        mini.node.style.setProperty('--ly', `${(50 + dy / length * 26).toFixed(0)}%`);
        // Behind the centre globe when passing above it (the far side), in front when below.
        mini.node.style.zIndex = y < layout.centre.y ? '1' : '3';
      });
    }
    function position() {
      if (!layout) return;
      layout.nodes.forEach(node => {
        const button = nodes.get(node.id);
        button.style.translate = `${node.x.toFixed(2)}px ${node.y.toFixed(2)}px`;
        // Home: a planet above the centre is on the far side (behind the AGI globe); below it, in front.
        if (universe) button.style.zIndex = node.y < layout.centre.y ? '1' : '3';
        {
          // Light comes from the centre globe: the lit side faces it, the shadow falls away — on every orbit view.
          const dx = layout.centre.x - node.x, dy = layout.centre.y - node.y, length = Math.hypot(dx, dy) || 1;
          button.style.setProperty('--lx', `${(50 + dx / length * 24).toFixed(1)}%`);
          button.style.setProperty('--ly', `${(50 + dy / length * 24).toFixed(1)}%`);
          // Night side points away from AGI: a gradient angle along (−dx, −dy) in CSS terms (0deg = up).
          button.style.setProperty('--shade-angle', `${(Math.atan2(-dx, dy) * 180 / Math.PI).toFixed(1)}deg`);
        }
        button.dataset.orbitAngle = String(node.angle);
      });
    }
    // Phones: inner pages become a simple list (no orbits); the home page keeps its compact solar system.
    const phoneList = () => !universe && window.innerWidth <= 760;
    function measure() {
      if (!(universe ? container.clientWidth : container.parentElement?.clientWidth) || !current.length) return;
      const list = phoneList();
      container.classList.toggle('is-list', list);
      if (list) {
        layout = null;
        ['height', 'width', 'transform', 'transform-origin', 'margin-bottom', 'margin-right'].forEach(property => container.style.removeProperty(property));
        nodes.forEach(node => { node.style.removeProperty('translate'); node.style.removeProperty('z-index'); });
        return;
      }
      const items = current.map((item, index) => {
        const node = nodes.get(item.id);
        return { id: item.id, ring: caseMode ? stages.indexOf(item.maturity) : universe ? (current.length <= 4 ? 2 : 1 + index % 2) : index % 3, width: node.offsetWidth, height: node.offsetHeight,
          // Universe and family views spread their planets evenly around the centre (two sit left and right).
          preferred: universe ? -Math.PI / 2 + (index + .5) / current.length * Math.PI * 2 : caseMode ? Math.PI + index / current.length * Math.PI * 2 : undefined };
      });
      const top = container.getBoundingClientRect().top + window.scrollY;
      // The universe is a compact stage; the other views fill the screen height.
      const fitHeight = universe ? 640 : Math.max(caseMode ? 380 : 420, window.innerHeight - top - 12);
      // If the labels can't fit in the screen height, lay out taller and let the scale-to-fit below shrink it.
      // Lay out at a comfortable width (galaxies with many planets need room for their labels), then scale to fit.
      const available = universe ? container.clientWidth : container.parentElement.clientWidth;
      const desktop = window.innerWidth > 760 && !universe;
      const layoutWidth = desktop ? Math.max(available, Math.min(1400, 560 + items.length * 60), caseMode && items.length > 2 ? 1100 : 0) : available;
      // Try the preferred even spread first; if the labels don't fit, fall back to free placement, then to a taller layout.
      const free = items.map(item => ({ ...item, preferred: universe ? item.preferred : undefined }));
      const attempts = [[items, fitHeight, false], [free, fitHeight, false], [items, fitHeight, true], [free, fitHeight, true], [free, 0, true]];
      layout = null; let lastError = null;
      for (const [set, height, loose, wide] of [...attempts, [free, 0, true, desktop ? 1.5 : 1]]) { try { layout = arrange(set, Math.round(layoutWidth * (wide || 1)), caseMode, height, universe ? 300 : 0, loose); break; } catch (error) { lastError = error; } }
      if (!layout) { empty.textContent = lastError.message; empty.hidden = false; empty.setAttribute('role', 'alert'); return; }
      empty.hidden = current.length > 0; empty.removeAttribute('role');
      layout.uniform = caseMode || universe; layout.together = universe;
      // The universe orbit is drawn a little flatter (more oval); planets are re-placed on it.
      if (universe) {
        // Each business area gets its own orbit, uneven and fairly close to AGI (never crossing the centre globe).
        const base = layout.rings[layout.nodes[0]?.ring ?? 0];
        // Bigger planets travel close to AGI; smaller ones orbit further out.
        const reach = { foods: .56, automotive: .67, facilities: .62, healthcare: .72 };
        const factors = [.64, .76, .7, .82, .67, .79];
        layout.rings = layout.nodes.map((node, index) => {
          const rx = Math.min(Math.max(265, base.rx * (reach[node.id] || factors[index % factors.length])), layout.width / 2 - 90);
          // Slightly different tilts make the orbits cross each other here and there, like a real system.
          const tilts = [-9, 7, -4, 11, -6, 5];
          // Mobility & Automotive runs on a flatter orbit that dips behind the AGI globe and comes back out in front.
          if (node.id === 'automotive') return { rx, ry: 112, tilt: -8 * Math.PI / 180 };
          return { rx, ry: 210 + (rx - 265) * .5, tilt: tilts[index % tilts.length] * Math.PI / 180 };
        });
        // Off-centre orbits: shifting each ring by its extra width makes the rings run together on the left and fan out on the right.
        const smallest = Math.min(...layout.rings.map(ring => ring.rx));
        // One extra, empty outer ring for depth.
        const widest = Math.max(...layout.rings.map(ring => ring.rx));
        const extraRx = Math.min(widest * 1.12, layout.width / 2 - 20);
        layout.rings.push({ rx: extraRx, ry: 210 + (extraRx - 265) * .5, tilt: 3 * Math.PI / 180, empty: true });
        layout.rings.forEach(ring => { ring.shift = (ring.rx - smallest) * .8; });
        layout.nodes = layout.nodes.map((node, index) => point({ ...node, ring: index }, layout.rings[index], node.angle, layout.centre));
        // Phones: a compact, portrait solar system — taller-than-wide orbits around a smaller AGI globe.
        if (layout.width < 600) {
          const w = layout.width, half = Math.max(110, w / 2 - 52);
          layout.height = 620; layout.centre = { ...layout.centre, x: w / 2, y: 300 };
          const order = { foods: 0, facilities: 1, automotive: 2, healthcare: 3 };
          layout.rings = layout.nodes.map((node, index) => {
            const step = order[node.id] ?? index;
            return { rx: Math.min(half, 112 + step * 8), ry: 168 + step * 26, tilt: [-6, 5, -3, 7][step % 4] * Math.PI / 180, shift: 0 };
          });
          layout.nodes = layout.nodes.map((node, index) => point({ ...node, ring: index }, layout.rings[index], node.angle, layout.centre));
        }
      }
      container.style.height = `${layout.height}px`;
      // Never scroll: scale the whole system down so it fits the screen's width and the height below the header.
      const room = Math.max(320, window.innerHeight - top - 12);
      const scale = desktop ? Math.min(1, available / layout.width, room / layout.height) : 1;
      if (desktop && (scale < 1 || layout.width !== available)) {
        container.style.width = `${layout.width}px`;
        container.style.transformOrigin = '0 0';
        container.style.transform = `translateX(${((available - layout.width * scale) / 2).toFixed(1)}px) scale(${scale.toFixed(4)})`;
        container.style.marginBottom = `${(layout.height * (scale - 1)).toFixed(1)}px`;
        container.style.marginRight = `${(available - layout.width).toFixed(1)}px`;
      } else { ['width', 'transform', 'transform-origin', 'margin-bottom', 'margin-right'].forEach(property => container.style.removeProperty(property)); }
      centre.style.top = `${layout.centre.y}px`;
      paths.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
      // The universe draws only the orbits that carry a planet, keeping the view simple.
      paths.replaceChildren(...layout.rings.map((ring, index) => (universe && !ring.empty && !layout.nodes.some(node => node.ring === index)) ? null : svgElement('ellipse', {
        cx: layout.centre.x + (ring.shift || 0), cy: layout.centre.y, rx: ring.rx, ry: ring.ry,
        ...(ring.tilt ? { transform: `rotate(${(ring.tilt * 180 / Math.PI).toFixed(2)} ${layout.centre.x + (ring.shift || 0)} ${layout.centre.y})` } : {}),
        ...(caseMode ? { 'data-orbit-maturity': stages[index] } : {}), class: `family-track track-${index}`,
      })).filter(Boolean));
      // Natural orbits: each ring fades toward the back (top) and is brighter in front (bottom), with a soft glow.
      if (universe) {
        const defs = svgElement('defs', {});
        const grad = svgElement('linearGradient', { id: 'orbit-depth', x1: '0', y1: '0', x2: '0', y2: '1' });
        [['0', '#e4dcf2', '.08'], ['.45', '#ece4f8', '.18'], ['1', '#ffffff', '.42']].forEach(([offset, colour, opacity]) => grad.append(svgElement('stop', { offset, 'stop-color': colour, 'stop-opacity': opacity })));
        const blur = svgElement('filter', { id: 'orbit-soft', x: '-5%', y: '-5%', width: '110%', height: '110%' });
        blur.append(svgElement('feGaussianBlur', { stdDeviation: '.6' }));
        defs.append(grad, blur); paths.prepend(defs);
      }
      // The universe orbit carries a soft pulse of light that travels around it.
      // A shining comet: layered strokes (long faint tail → short bright core) plus a sparkling head, moved each frame.
      comets = [];
      if (universe) layout.rings.forEach((ring, index) => {
        if (!layout.nodes.some(node => node.ring === index)) return;
        const shape = { cx: layout.centre.x, cy: layout.centre.y, rx: ring.rx, ry: ring.ry, pathLength: 1000 };
        // Many stacked strokes, each shorter, thinner and brighter towards the head, blend into one smooth fading tail.
        const steps = 12;
        const layers = Array.from({ length: steps }, (_, i) => {
          const t = i / (steps - 1), length = Math.round(220 - t * 206);
          const line = svgElement('ellipse', { ...shape, class: `orbit-comet${i === steps - 1 ? ' is-core' : ''}` });
          line.style.strokeDasharray = `${length} ${1000 - length}`; line.style.strokeWidth = (1 + t * 1.6).toFixed(2);
          line.style.opacity = (0.07 + t * t * 0.25).toFixed(3); line.dataset.length = length; return line;
        });
        const head = svgElement('circle', { r: 3.2, class: 'orbit-comet-head' });
        paths.append(...layers, head);
        comets.push({ layers, head, path: layers[0], phase: index * 370 });
      });
      items.forEach(item => { nodes.get(item.id).dataset.orbitRing = String(item.ring); });
      container.dataset.orbitGeometry = JSON.stringify(layout);
      position();
    }
    function render(items, collection) {
      current = items;
      nodes.forEach(node => node.remove()); nodes.clear();
      container.dataset.selectedMaturity = 'all';
      container.classList.toggle('is-dense', caseMode ? items.length > 5 : items.length > 10);
      if (!caseMode && !universe) caption.textContent = `${collection === 'internal' ? 'INTERNAL' : 'SERVICE'} TECHNOLOGIES`;
      empty.hidden = items.length > 0;
      centre.hidden = !items.length; paths.hidden = !items.length;
      if (!items.length) { layout = null; container.style.height = '220px'; return; }
      const surfaces = ['ringed', 'ice', 'cratered', 'marbled', 'banded', 'crescent', 'storm'];
      items.forEach((item, index) => {
        const button = element('button', caseMode ? `usecase-moon ${item.maturity.toLowerCase()}` : 'family-world');
        if (universe) {
          // Business areas: live planets open their page; coming-soon planets only preview.
          const live = item.status === 'live';
          button.classList.add('universe-world'); button.classList.toggle('is-soon', !live);
          button.dataset.universe = item.id;
          if (item.tint) button.style.setProperty('--planet-tint', item.tint);
          if (!live) button.setAttribute('aria-disabled', 'true');
          button.setAttribute('aria-label', live ? `${item.name}. Open ${item.name}.` : `${item.name}. Coming soon.`);
        } else if (caseMode) {
          button.dataset.id = item.id; button.dataset.maturity = item.maturity;
          button.setAttribute('aria-pressed', 'false');
          button.setAttribute('aria-label', `${item.title}. ${item.maturity}. Open full card.`);
        } else {
          button.dataset.family = item.id; button.dataset.domain = item.domain;
          button.setAttribute('aria-label', `${item.domain}. ${item.records.length} ${item.records.length === 1 ? 'use case' : 'use cases'} across maturity levels. Explore family.`);
        }
        const image = element('img', caseMode ? 'named-moon' : 'family-planet');
        // Use cases take their texture from their maturity (colour is added in CSS); families and areas keep theirs.
        const maturitySurface = { Established: 'cratered', Scaling: 'banded', Emerging: 'ringed' };
        image.src = universe ? `assets/planets/${item.surface}.png` : caseMode ? `assets/planets/${maturitySurface[item.maturity] || 'ice'}.png` : look(item.domain).texture;
        if (!caseMode && !universe) button.style.setProperty('--family-colour', look(item.domain).colour);
        image.alt = ''; image.width = 320; image.height = 260;
        if (!caseMode && !universe) {
          // Family planets turn slowly on their own axis (the surface slides; the light and shadow stay put).
          const globe = element('span', 'globe-wrap');
          globe.append(image, spinGlobe(look(item.domain).strip, 50 + (index * 7) % 30, look(item.domain).day));
          button.append(globe);
        } else if (universe) {
          // Business-area planets get a shading layer lit from the AGI side (see position()).
          const body = element('span', 'planet-body');
          body.append(image);
          if (item.strip) { body.classList.add('has-spin'); body.append(spinGlobe(item.strip, 80)); }
          body.append(element('span', 'planet-shade'), element('span', 'planet-glint'));
          button.append(body);
        } else {
          // Use-case planets: a fixed dark side painted over the sphere.
          // The surface turns horizontally (right to left); Emerging keeps its ring from the still image.
          const wrap = element('span', `moon-wrap is-${item.maturity.toLowerCase()}`);
          const spin = spinGlobe(`assets/planets/strip-${item.maturity.toLowerCase()}.png`, 40 + (Number(item.sourceId) * 7) % 30, `assets/planets/surfaces/${maturityDay[item.maturity.toLowerCase()] || 'moon'}.jpg`);
          // Emerging planets wear a ring: its back half sits behind the turning sphere, its front half over it.
          if (item.maturity === 'Emerging') wrap.append(image, element('span', 'planet-ring is-back'), spin, element('span', 'moon-shade'), element('span', 'planet-ring is-front'));
          else wrap.append(image, spin, element('span', 'moon-shade'));
          button.append(wrap);
        }
        if (universe) {
          button.append(element('strong', 'family-name', item.name), element('span', 'family-count', item.status === 'live' ? item.meta || 'Explore' : 'Coming soon'));
        } else if (caseMode) {
          const copy = element('span', 'satellite-copy');
          copy.append(element('strong', 'usecase-title', item.title), element('span', 'case-category', item.rawServiceGroup), element('small', 'usecase-maturity', item.maturity));
          button.append(copy);
        } else {
          const split = stages.map(stage => ({ stage, count: item.records.filter(record => record.maturity === stage).length })).filter(entry => entry.count);
          button.append(element('strong', 'family-name', item.label), element('span', 'family-count', `${item.records.length} ${item.records.length === 1 ? 'use case' : 'use cases'}`), element('span', 'family-stage', split.map(entry => `${entry.count} ${entry.stage}`).join(' · ')));
        }
        // Family and use-case planets come in uneven sizes (decorative only).
        if (!universe) button.style.setProperty('--ps', String([1.16, .84, 1.04, .78, 1.1, .9, .82, 1.12, .95][index % 9]));
        button.classList.add('is-entering'); button.style.setProperty('--enter-index', index);
        button.addEventListener('animationend', () => button.classList.remove('is-entering'), { once: true });
        button.addEventListener('click', () => onSelect(item, button));
        nodes.set(item.id, button); container.append(button);
      });
      measure();
      requestAnimationFrame(() => measure()); setTimeout(() => measure(), 300);
    }
    function highlight(maturity, selectedId) {
      container.dataset.selectedMaturity = maturity;
      current.forEach(item => {
        const button = nodes.get(item.id);
        button.classList.toggle('is-muted', maturity !== 'all' && item.maturity !== maturity);
        button.classList.toggle('is-selected', selectedId === item.id);
        button.setAttribute('aria-pressed', String(selectedId === item.id));
      });
    }
    const observer = new ResizeObserver(() => measure()); observer.observe(container.parentElement || container);
    // The space below the header depends on the breadcrumb/tab row, so re-fit when it changes and once things settle.
    const bar = document.querySelector('.family-bar'); if (bar) observer.observe(bar);
    window.addEventListener('resize', () => measure());
    // The comet keeps travelling while planets pause on hover; it stops only for Pause motion / reduced motion.
    function moveComets(elapsed) {
      const still = container.closest('[hidden]') || reduced.matches || document.hidden || document.body.classList.contains('stars-paused');
      if (!still) cometTime = (cometTime + elapsed * 1000 / 14) % 1000;   // one lap every 14 s
      const matrix = paths.getScreenCTM(); if (!matrix) return;
      const heads = comets.map(comet => {
        const at = (cometTime + comet.phase) % 1000;
        comet.layers.forEach(line => { line.style.strokeDashoffset = String(-(at - Number(line.dataset.length))); });
        const total = comet.path.getTotalLength();
        const point = comet.path.getPointAtLength(at / 1000 * total);
        comet.head.setAttribute('cx', point.x.toFixed(1)); comet.head.setAttribute('cy', point.y.toFixed(1));
        return new DOMPoint(point.x, point.y).matrixTransform(matrix);
      });
      // A planet catches the light as the comet passes over it: a moving sheen where the comet is.
      nodes.forEach(button => {
        const body = button.querySelector('.planet-body'); if (!body) return;
        const box = body.getBoundingClientRect(), radius = box.width * .31;
        const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
        let best = null, near = Infinity;
        heads.forEach(head => { const d = Math.hypot(head.x - cx, head.y - cy); if (d < near) { near = d; best = head; } });
        const glint = still || !best ? 0 : Math.max(0, 1 - near / (radius * 1.6));
        body.style.setProperty('--glint', (glint * glint * (3 - 2 * glint)).toFixed(3));
        body.classList.toggle('is-glinting', glint > .01); // the sheen layer exists only while the comet passes
        if (best) {
          body.style.setProperty('--gx', `${(50 + (best.x - cx) / (radius * 2) * 100).toFixed(1)}%`);
          body.style.setProperty('--gy', `${(50 + (best.y - cy) / (radius * 2) * 100).toFixed(1)}%`);
        }
      });
    }
    function animate(timestamp) {
      const elapsed = previous === null ? 0 : Math.min((timestamp - previous) / 1000, .05); previous = timestamp;
      const paused = container.closest('[hidden]') || reduced.matches || document.hidden
        || document.body.classList.contains('stars-paused') || document.body.classList.contains('planet-preview-open') || document.querySelector('dialog[open]')
        || container.querySelector('button:hover, button:focus, details[open]');
      if (layout && !paused) {
        speed += (1 - speed) * (1 - Math.exp(-elapsed / .65));
        layout.nodes = advance(layout, elapsed * speed * (universe ? 1 : 1)); position();
      } else speed = 0;
      if (universe && comets.length) moveComets(elapsed);
      if (universe) moveMinis(elapsed, container.closest('[hidden]') || reduced.matches || document.hidden || document.body.classList.contains('stars-paused'));
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return { render, highlight, destroy() { observer.disconnect(); cancelAnimationFrame(frame); } };
  }
  window.createFamilyMap = (container, onSelect) => createMap(container, onSelect);
  window.createUniverseMap = (container, onSelect, centreLabel, centreSubLabel) => createMap(container, onSelect, { universe: true, centreLabel, centreSubLabel });
  window.createFamilyCaseMap = (container, records, { onCase, centreLabel }) => {
    const map = createMap(container, (record, button) => onCase(record.id, button), { caseMode: true, centreLabel, domain: records[0]?.domain });
    map.render(records, records[0]?.collection);
    const references = element('details', 'case-map-references');
    references.append(setIconLabel(element('summary', 'redirect-link'), 'Source links', 'external-link'));
    const content = element('div', 'case-map-reference-content');
    records.filter(record => (record.sourceLinks || []).length).forEach(record => {
      const entry = element('section', 'source-entry');
      entry.append(element('h4', '', record.title));
      (record.sourceLinks || []).forEach(value => {
        try {
          const url = new URL(value);
          if (!['http:', 'https:'].includes(url.protocol)) return;
          const link = element('a', '', url.hostname); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; entry.append(link);
        } catch { /* Invalid source URLs remain excluded. */ }
      });
      content.append(entry);
    });
    references.append(content);
    // Appended to the map container; removed again when the family view closes.
    document.querySelectorAll('.page-footer .case-map-references').forEach(node => node.remove());
    const sourceNotes = document.getElementById('source-notes-open');
    if (content.children.length) { if (sourceNotes) sourceNotes.before(references); else container.append(references); }
    return { render(state) { map.highlight(state.maturity, state.selectedId); }, destroy() { references.remove(); map.destroy(); } };
  };
})();
