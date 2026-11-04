/* Anchored solar-system visualisation. Positions convey grouping, never business value. */
(() => {
  'use strict';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const WIDTH = 1100;
  const HEIGHT = 700;
  const CENTER = { x: 550, y: 350 };
  const planets = [
    { maturity: 'Scaling', rx: 420, ry: 260, angle: -40, radius: 82, satelliteRadius: 150 },
    { maturity: 'Established', rx: 300, ry: 190, angle: 190, radius: 68, satelliteRadius: 125 },
    { maturity: 'Emerging', rx: 240, ry: 170, angle: 55, radius: 62, satelliteRadius: 115 },
  ];
  function svgNode(tag, attributes = {}, value) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes).forEach(([key, content]) => node.setAttribute(key, String(content)));
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function htmlNode(tag, className, value) {
    const node = document.createElement(tag);
    node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function wrapLabel(value, limit = 22) {
    const lines = [''];
    value.replaceAll('/', ' / ').split(/\s+/).forEach(word => {
      const last = lines.length - 1;
      if (lines[last] && lines[last].length + word.length + 1 > limit) lines.push(word);
      else lines[last] += `${lines[last] ? ' ' : ''}${word}`;
    });
    return lines;
  }
  function svgLabel(value, x, y, className, limit) {
    const label = svgNode('text', { x, y, class: className, 'text-anchor': 'middle' });
    wrapLabel(value, limit).forEach((line, index) => label.append(svgNode('tspan', { x, dy: index ? '1.18em' : 0 }, line)));
    return label;
  }
  function bindButton(node, action) {
    node.addEventListener('click', action);
    node.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action(); }
    });
  }
  const worldStyles = ['banded', 'ringed', 'cratered', 'marbled', 'storm', 'ice', 'crescent'];
  // Original Blender renders share a fixed camera and body radius. The invisible
  // geometry preserves stable focus/expansion measurements, including ringed worlds.
  // Surface appearances are decorative; they do not encode a business metric.
  function createWorld(id, x, y, radius, styleIndex) {
    const surface = worldStyles[styleIndex];
    const world = svgNode('g', {
      class: `world-surface world-${surface}`, 'data-surface': surface, 'data-world': id,
      transform: `translate(${x} ${y}) scale(${radius / 100})`, 'aria-hidden': 'true',
    });
    world.append(
      svgNode('circle', { r: 100, class: 'planet-sphere' }),
      svgNode('image', {
        href: `assets/planets/${surface}.png`, x: -160, y: -130,
        width: 320, height: 260, preserveAspectRatio: 'xMidYMid meet',
      }),
    );
    return world;
  }
  function createStarfield() {
    const sky = document.getElementById('cosmic-sky');
    if (!sky) return;
    const svgNode = (tag, attributes) => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
      return element;
    };
    const svg = svgNode('svg', { viewBox: '0 0 1600 1000', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' });
    const far = svgNode('g', { class: 'star-layer stars-far', fill: '#ffffff' });
    const near = svgNode('g', { class: 'star-layer stars-near', fill: '#e5d8ee' });
    // Fixed coordinates keep decorative stars independent of the data layout.
    for (let index = 0; index < 145; index++) {
      const x = (index * 379 + 73) % 1600;
      const y = (index * 227 + Math.floor(index / 7) * 43 + 29) % 1000;
      const bright = index % 7 === 0;
      const star = svgNode('g', { class: bright ? 'star-glint' : 'star-point' });
      if (bright) {
        star.style.setProperty('--twinkle-duration', `${5 + index % 5}s`);
        star.style.setProperty('--twinkle-delay', `${-index % 11}s`);
      }
      star.append(svgNode('circle', {
        cx: x, cy: y, r: bright ? 1.6 : .5 + index % 3 * .12,
        opacity: bright ? .55 : .15 + index % 4 * .07,
      }));
      if (bright && index % 3 === 0) star.append(svgNode('path', {
        d: `M${x - 4} ${y}h8 M${x} ${y - 4}v8`,
        fill: 'none', stroke: '#FFFFFF', 'stroke-width': .6, opacity: .5,
      }));
      (bright ? near : far).append(star);
    }
    svg.append(far, near);
    sky.replaceChildren(svg);
  }

  createStarfield();
  window.createSolarSystem = (container, records, { onCase, onPlanet, onReset, centreLabel = 'Facilities', familyMode = false }) => {
    if (familyMode) return window.createFamilyCaseMap(container, records, { onCase, centreLabel });
    let destroyed = false;
    let animationFrame = 0;
    const groups = planets.map(planet => ({ ...planet, records: records.filter(record => record.maturity === planet.maturity) }));
    const caseNodes = new Map();
    const planetNodes = new Map();
    const clusterNodes = new Map();
    const namedButtons = new Map();
    const svg = svgNode('svg', { class: 'solar-svg', viewBox: `0 0 ${WIDTH} ${HEIGHT}`, role: 'group', 'aria-label': `${centreLabel} at the centre of one solar system, with maturity planets and use-case satellites` });
    const defs = svgNode('defs');
    const sun = svgNode('radialGradient', { id: 'sun-material', cx: '40%', cy: '35%' });
    [['0%', '#FFFFFF'], ['45%', '#F4F4F5'], ['78%', '#D4D4D8'], ['100%', '#71717A']].forEach(([offset, colour]) => sun.append(svgNode('stop', { offset, 'stop-color': colour })));
    const glow = svgNode('filter', { id: 'sun-glow', x: '-100%', y: '-100%', width: '300%', height: '300%' });
    glow.append(svgNode('feGaussianBlur', { stdDeviation: 22 }));
    const orbitLight = svgNode('linearGradient', { id: 'orbit-light', x1: '0%', y1: '10%', x2: '100%', y2: '85%' });
    [['0%', '.02'], ['28%', '.24'], ['54%', '.04'], ['78%', '.18'], ['100%', '.02']].forEach(([offset, opacity]) => orbitLight.append(svgNode('stop', { offset, 'stop-color': '#cbb9dc', 'stop-opacity': opacity })));
    defs.append(sun, glow, orbitLight); svg.append(defs);
    const backdrop = svgNode('g', { 'aria-hidden': 'true', class: 'solar-backdrop' });
    const orbitField = svgNode('g', { class: 'orbit-field' });
    backdrop.append(orbitField);
    planets.forEach(({ rx, ry }, orbitIndex) => {
      orbitField.append(svgNode('ellipse', { cx: CENTER.x, cy: CENTER.y, rx, ry, class: 'system-orbit' }),
        svgNode('ellipse', { cx: CENTER.x, cy: CENTER.y, rx, ry, pathLength: 1000, class: `orbit-tracer orbit-${orbitIndex}` }));
    });
    const sunGroup = svgNode('g', { class: 'sun-group' });
    // Wrap longer service/function names inside the existing sphere, without scaling the scene.
    const centreLines = wrapLabel(centreLabel, 12);
    const centreTitle = svgNode('text', { x: CENTER.x, y: CENTER.y, 'text-anchor': 'middle', class: 'core-title', 'aria-label': centreLabel });
    centreTitle.style.fontSize = centreLines.length > 2 ? '16px' : centreLines.length > 1 ? '18px' : '21px';
    centreLines.forEach((line, index) => centreTitle.append(svgNode('tspan', {
      x: CENTER.x, y: CENTER.y + 7 + (index - (centreLines.length - 1) / 2) * 22,
    }, `${line}${index < centreLines.length - 1 ? ' ' : ''}`)));
    sunGroup.append(svgNode('circle', { cx: CENTER.x, cy: CENTER.y, r: 95, fill: '#D4D4D8', opacity: '.08', filter: 'url(#sun-glow)' }),
      svgNode('circle', { cx: CENTER.x, cy: CENTER.y, r: 77, class: 'sun-corona' }),
      svgNode('circle', { cx: CENTER.x, cy: CENTER.y, r: 64, fill: 'url(#sun-material)', class: 'facilities-sun' }),
      centreTitle,
      svgNode('text', { x: CENTER.x, y: CENTER.y + 99, 'text-anchor': 'middle', class: 'core-subtitle' }, 'TECHNOLOGY ATLAS'));
    backdrop.append(sunGroup);
    svg.append(backdrop);
    const focus = htmlNode('section', 'planet-focus');
    focus.hidden = true;
    focus.setAttribute('aria-label', 'Use cases in the selected planet');
    let lastPlanet = null;
    let focusLayout = null;
    let namedOrbits = [];
    let namedSeconds = 0;
    let namedPositions = null;
    let namedSpeed = 0;
    let revealUntil = 0;
    let activePlanet = null;
    let readerOpen = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let revealAnimations = [];
    groups.forEach((group, planetIndex) => {
      const angle = group.angle * Math.PI / 180;
      const x = CENTER.x + group.rx * Math.cos(angle);
      const y = CENTER.y + group.ry * Math.sin(angle);
      const orbitRadius = group.satelliteRadius;
      const cluster = svgNode('g', { class: 'planet-cluster', 'data-maturity-planet': group.maturity });
      cluster.append(svgNode('ellipse', { cx: x, cy: y, rx: orbitRadius, ry: orbitRadius * .72, class: 'moon-orbit', 'aria-hidden': 'true' }));
      const planet = svgNode('g', { class: 'technology-planet', role: 'button', tabindex: 0, 'data-maturity-planet': group.maturity, 'aria-label': `${group.maturity}. Expand to reveal ${group.records.length} named ${group.records.length === 1 ? 'use case' : 'use cases'} and source links.` });
      planet.setAttribute('aria-expanded', 'false');
      planet.append(svgNode('title', {}, group.maturity),
        svgNode('circle', { cx: x, cy: y, r: group.radius + 8, class: 'planet-halo' }),
        createWorld(`maturity-${group.maturity.toLowerCase()}`, x, y, group.radius, planetIndex));
      planet.append(svgLabel(group.maturity, x, y + orbitRadius * .72 + 35, 'planet-name', 20));
      planet.append(svgNode('text', { x, y: y + orbitRadius * .72 + 59, 'text-anchor': 'middle', class: 'planet-total' }, `${group.records.length} ${group.records.length === 1 ? 'use case' : 'use cases'}`));
      planet.setAttribute('aria-disabled', String(!group.records.length));
      if (!group.records.length) planet.classList.add('is-empty');
      bindButton(planet, () => { if (group.records.length) onPlanet(group.maturity); });
      if (familyMode) { cluster.setAttribute('hidden', ''); cluster.setAttribute('aria-hidden', 'true'); }
      cluster.append(planet);
      planetNodes.set(group.maturity, planet);
      group.records.forEach((record, index) => {
        const angle = -Math.PI / 2 + index / group.records.length * Math.PI * 2;
        const moonX = x + Math.cos(angle) * orbitRadius;
        const moonY = y + Math.sin(angle) * orbitRadius * .72;
        const marker = svgNode('g', { class: `case-satellite ${record.maturity.toLowerCase()}`, 'data-id': record.id, 'aria-hidden': 'true' });
        marker.append(svgNode('title', {}, record.title), svgNode('circle', { cx: moonX, cy: moonY, r: 15, class: 'moon-hit' }), svgNode('circle', { cx: moonX, cy: moonY, r: 3.2, class: 'moon-body' }));
        cluster.append(marker);
        caseNodes.set(record.id, {
          record, marker,
          orbit: { x, y, radius: orbitRadius, angle, initialX: moonX, initialY: moonY, period: 90 + planetIndex * 24 },
        });
      });
      clusterNodes.set(group.maturity, { cluster, x, y, radius: group.radius });
      svg.append(cluster);
    });
    const scene = htmlNode('div', 'orbital-scene');
    scene.append(svg);
    container.replaceChildren(scene, focus);
    function sourceLinks(record) {
      return (record.sourceLinks || []).flatMap(value => {
        try {
          const url = new URL(value);
          return ['https:', 'http:'].includes(url.protocol) ? [url] : [];
        } catch { return []; }
      });
    }
    function buildFocus(domain) {
      const group = groups.find(item => item.maturity === domain);
      namedButtons.clear();
      const toolbar = htmlNode('div', 'focus-toolbar');
      const back = setIconLabel(htmlNode('button', 'focus-back'), familyMode ? 'Technology families' : 'Maturity', 'arrow-left', 'lead');
      back.addEventListener('click', onReset);
      const count = htmlNode('span', 'focus-count', `${group.records.length} ${group.records.length === 1 ? 'use case' : 'use cases'}`);
      const links = group.records.reduce((total, record) => total + sourceLinks(record).length, 0);
      const sourceLabel = links ? `Source links (${links})` : 'Workbook references';
      const sourceToggle = setIconLabel(htmlNode('button', 'focus-source-toggle redirect-link'), sourceLabel, 'external-link');
      sourceToggle.setAttribute('aria-expanded', 'false');
      toolbar.append(back, count, sourceToggle);
      const orbits = htmlNode('div', 'focus-orbits');
      orbits.append(svgNode('svg', { class: 'named-orbit-paths', 'aria-hidden': 'true' }));
      const heading = htmlNode('h3', 'focus-title sr-only', `${familyMode ? centreLabel : domain} use cases`); heading.tabIndex = -1;
      toolbar.prepend(heading);
      group.records.forEach(record => {
        const button = htmlNode('button', `usecase-moon ${record.maturity.toLowerCase()}`);
        button.dataset.id = record.id;
        button.setAttribute('aria-pressed', 'false');
        const marker = svgNode('svg', { class: 'named-moon', viewBox: '-160 -130 320 260', 'aria-hidden': 'true', focusable: 'false' });
        const seed = Number(record.sourceId);
        marker.append(createWorld(`case-${record.id}`, 0, 0, 100, seed * 3 % worldStyles.length));
        const copy = htmlNode('span', 'satellite-copy');
        copy.append(htmlNode('strong', 'usecase-title', record.title), htmlNode('span', 'case-category', familyMode ? record.rawServiceGroup : record.domain), htmlNode('small', 'usecase-maturity sr-only', record.maturity));
        const arrow = htmlNode('span', 'satellite-arrow'); arrow.setAttribute('aria-hidden', 'true'); arrow.append(icon('arrow-up-right'));
        button.append(marker, copy, arrow);
        button.addEventListener('click', () => onCase(record.id, button));
        orbits.append(button);
        namedButtons.set(record.id, button);
      });
      const sources = htmlNode('div', 'focus-sources'); sources.hidden = true;
      const sourceTitle = htmlNode('h3', '', `${domain} workbook references`);
      sources.append(sourceTitle);
      group.records.forEach(record => {
        const entry = htmlNode('section', 'source-entry');
        entry.append(htmlNode('span', 'case-category', record.domain), htmlNode('h4', '', record.title));
        const urls = sourceLinks(record);
        urls.forEach((url, index) => {
          const link = setIconLabel(htmlNode('a'), `${urls.length > 1 ? `${index + 1}. ` : ''}${url.hostname}`, 'external-link');
          link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
          entry.append(link);
        });
        if (!urls.length) entry.append(htmlNode('p', '', `${record.provenance.sheet} · row ${record.sourceRow}. ${record.sourcesText || 'No source link recorded in the workbook.'}`));
        sources.append(entry);
      });
      sourceToggle.addEventListener('click', () => {
        const show = sources.hidden;
        sources.hidden = !show;
        sourceToggle.setAttribute('aria-expanded', String(show));
        show ? setIconLabel(sourceToggle, 'Back to use cases', 'arrow-left', 'lead') : setIconLabel(sourceToggle, sourceLabel, 'external-link');

      });
      const content = htmlNode('div', 'focus-content');
      content.append(orbits);
      focus.replaceChildren(toolbar, content, sources);
      return { heading };
    }
    function motionEnabled() {
      return !reducedMotion.matches && !document.body.classList.contains('stars-paused');
    }
    // Advance equal-spaced satellites together, keeping their hit areas attached.
    // Inspection pauses the clock, so resuming never jumps or catches up.
    let orbitSeconds = 0;
    let orbitSpeed = 0;
    let previousFrame = null;
    function animateSatellites(timestamp) {
      if (destroyed || !container.isConnected) return;
      const elapsed = previousFrame === null ? 0 : Math.min((timestamp - previousFrame) / 1000, .05);
      previousFrame = timestamp;
      const paused = !motionEnabled() || document.hidden || activePlanet || readerOpen
        || document.querySelector('dialog[open]');
      if (!paused) {
        orbitSpeed += (1 - orbitSpeed) * (1 - Math.exp(-elapsed / .65));
        orbitSeconds += elapsed * orbitSpeed;
        caseNodes.forEach(({ marker, orbit }) => {
          const angle = orbit.angle + orbitSeconds / orbit.period * Math.PI * 2;
          const dx = orbit.x + Math.cos(angle) * orbit.radius - orbit.initialX;
          const dy = orbit.y + Math.sin(angle) * orbit.radius * .72 - orbit.initialY;
          marker.setAttribute('transform', `translate(${dx.toFixed(3)} ${dy.toFixed(3)})`);
        });
      } else orbitSpeed = 0;
      const inspecting = focus.querySelector('.usecase-moon:hover, .usecase-moon:focus') || document.body.classList.contains('planet-preview-open')
        || !focus.querySelector('.focus-sources')?.hidden;
      if (activePlanet && !inspecting && !readerOpen && motionEnabled()
        && !document.hidden && timestamp >= revealUntil && !document.querySelector('dialog[open]')) {
        namedSpeed += (1 - namedSpeed) * (1 - Math.exp(-elapsed / .65));
        const step = elapsed * namedSpeed;
        namedSeconds += step;
        positionNamedMoons(step);
      } else namedSpeed = 0;
      animationFrame = requestAnimationFrame(animateSatellites);
    }
    animationFrame = requestAnimationFrame(animateSatellites);
    function positionNamedMoons(elapsed = 0) {
      if (!focusLayout || !namedOrbits.length) return;
      const positions = window.AtlasOrbits.positions(namedOrbits, focusLayout, namedSeconds, elapsed ? namedPositions : null, elapsed);
      namedPositions = positions;
      namedOrbits.forEach((item, index) => {
        // Independent translation keeps orbital movement on the compositor,
        // without laying out every label on every frame or fighting its reveal.
        item.button.style.translate = `${positions[index].x.toFixed(3)}px ${positions[index].y.toFixed(3)}px`;
      });
    }
    // Build a wide orbital field, with enough space for every full title. Phones
    // stretch the field vertically instead of shrinking text or hiding use cases.
    function layoutMoons() {
      if (!activePlanet) return;
      const width = container.clientWidth;
      const buttons = [...namedButtons.values()];
      const compact = width < 600;
      const labelWidth = compact ? Math.min(155, (width - 40) / 2) : 184;
      buttons.forEach(button => { button.style.width = `${labelWidth}px`; });
      const labelHeight = Math.max(...buttons.map(button => button.scrollHeight));
      const top = familyMode ? 60 : compact ? 180 : 160;
      const fieldSize = Math.min(width, buttons.length <= 3 ? 660 : buttons.length <= 8 ? 820 : buttons.length <= 13 ? 1000 : buttons.length <= 20 ? 1100 : 1200);
      const labelArea = buttons.reduce((total, button) => total + (labelWidth + 22) * (button.scrollHeight + 24), 0);
      const usableHeight = compact ? Math.max(buttons.length <= 3 ? 630 : 900, buttons.length * (labelHeight + 26) * 1.25 + 260)
        : Math.max(fieldSize, labelArea / width * 1.35 + 240);
      const height = Math.ceil(top + usableHeight + 70);
      const centreX = width / 2, centreY = top + usableHeight / 2;
      const ringCount = compact || buttons.length <= 6 ? 1 : buttons.length > 20 ? 3 : 2;
      const rings = Array.from({ length: ringCount }, (_, index) => {
        const fraction = ringCount === 1 ? 1 : .56 + index * .44 / (ringCount - 1);
        const radius = (fieldSize / 2 - labelWidth / 2 - 18) * fraction;
        return { rx: radius, ry: compact ? (usableHeight / 2 - labelHeight / 2 - 20) * fraction : radius,
          period: 220 + index * 65 };
      });
      const members = rings.map(() => []);
      const totalRadius = rings.reduce((total, ring) => total + ring.rx, 0);
      let assigned = 0;
      rings.forEach((ring, index) => {
        const count = index === rings.length - 1 ? buttons.length - assigned
          : Math.floor(buttons.length * ring.rx / totalRadius);
        members[index].push(...buttons.slice(assigned, assigned + count));
        assigned += count;
      });
      namedOrbits = [];
      members.forEach((list, ring) => list.forEach((button, index) => {
        const angle = -Math.PI / 2 + (index + ring * .36) / list.length * Math.PI * 2;
        button.dataset.orbitRing = String(ring);
        button.dataset.orbitAngle = String(angle);
        namedOrbits.push({ button, ring, width: labelWidth, height: button.scrollHeight, angle });
      }));
      focusLayout = { width, height, x: centreX, y: centreY, top, compact, rings,
        centre: { width: compact ? 130 : 210, height: compact ? 210 : 240, offsetY: 20 } };
      container.style.height = `${height}px`;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      const paths = focus.querySelector('.named-orbit-paths');
      paths.setAttribute('viewBox', `0 0 ${width} ${height}`);
      paths.replaceChildren(...rings.map(ring => svgNode('ellipse', {
        cx: centreX, cy: centreY, rx: ring.rx, ry: ring.ry,
      })));
      positionNamedMoons();
    }
    function captureBodies() {
      const positions = new Map();
      planetNodes.forEach((planet, name) => positions.set(name, planet.querySelector('.planet-sphere').getBoundingClientRect()));
      positions.set('sun', sunGroup.querySelector('.facilities-sun').getBoundingClientRect());
      return positions;
    }
    function moveBody(node, x, y, radius, target, scale, origin) {
      const transform = `translate(${target.x - x * scale} ${target.y - y * scale}) scale(${scale})`;
      node.setAttribute('transform', transform);
      if (!origin || !motionEnabled()) return;
      // FLIP in the SVG's current coordinate space preserves the very same planet
      // while the canvas changes size. No duplicate sphere or replacement scene.
      const matrix = svg.getScreenCTM().inverse();
      const point = new DOMPoint(origin.x + origin.width / 2, origin.y + origin.height / 2).matrixTransform(matrix);
      const startScale = origin.width * matrix.a / (radius * 2);
      const from = `translate(${point.x - x * startScale}px, ${point.y - y * startScale}px) scale(${startScale})`;
      const to = `translate(${target.x - x * scale}px, ${target.y - y * scale}px) scale(${scale})`;
      revealAnimations.push(node.animate([{ transform: from }, { transform: to }], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' }));
    }
    function focusSystem(maturity, origins) {
      const orbitScaleX = maturity ? focusLayout.width / WIDTH : 1;
      const orbitScaleY = maturity ? Math.min(1.2, Math.max(.7, (window.innerHeight - 252) / HEIGHT)) : 1;
      orbitField.setAttribute('transform', maturity
        ? `translate(${focusLayout.x - CENTER.x * orbitScaleX} ${focusLayout.y - CENTER.y * orbitScaleY}) scale(${orbitScaleX} ${orbitScaleY})`
        : 'translate(0 0) scale(1)');
      let maturitySlot = 0;
      clusterNodes.forEach(({ cluster, x, y, radius }, name) => {
        const selected = name === maturity;
        const group = groups.find(item => item.maturity === name);
        const labelOffset = selected ? radius + 22 : group.satelliteRadius * .72 + 35;
        const label = planetNodes.get(name).querySelector('.planet-name');
        label.setAttribute('y', y + labelOffset);
        planetNodes.get(name).querySelector('.planet-total').setAttribute('y', y + labelOffset + 24);
        const scale = !maturity ? 1 : .4;
        const target = !maturity ? { x, y } : { x: focusLayout.width * [.18, .5, .82][maturitySlot++], y: 75 };
        cluster.classList.toggle('is-focused', selected);
        cluster.classList.toggle('is-neighbour', Boolean(maturity));
        moveBody(cluster, x, y, radius, target, scale, origins?.get(name));
      });
      moveBody(sunGroup, CENTER.x, CENTER.y, 64, maturity ? focusLayout : CENTER, maturity && focusLayout.compact ? .75 : 1, origins?.get('sun'));
    }
    function revealCases(origin) {
      if (!motionEnabled()) return;
      revealUntil = performance.now() + 1080;
      [...namedButtons.values()].forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        const x = origin.x + origin.width / 2 - rect.x - rect.width / 2;
        const y = origin.y + origin.height / 2 - rect.y - rect.height / 2;
        revealAnimations.push(button.animate([
          { opacity: 0, transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(.15)` },
          { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        ], { duration: 900, delay: 80 + Math.min(index, 12) * 8, fill: 'backwards', easing: 'cubic-bezier(.22,1,.36,1)' }));
      });
    }
    let lastWidth = container.clientWidth;
    const resizeObserver = new ResizeObserver(() => {
      if (container.clientWidth === lastWidth) return;
      lastWidth = container.clientWidth;
      if (activePlanet) { layoutMoons(); focusSystem(activePlanet); }
    });
    resizeObserver.observe(container);
    function render({ maturity, planet: domain, selectedId }) {
      readerOpen = Boolean(selectedId);
      const expanded = Boolean(domain);
      const changed = lastPlanet !== domain;
      const origins = changed ? captureBodies() : null;
      if (changed) { revealAnimations.forEach(animation => animation.cancel()); revealAnimations = []; }
      activePlanet = domain;
      let entered;
      if (expanded && changed) {
        namedSeconds = 0;
        entered = buildFocus(domain);
      }
      focus.hidden = !expanded;
      container.classList.toggle('has-focus', expanded);
      svg.classList.toggle('is-expanded', expanded);
      if (changed) {
        if (expanded) layoutMoons();
        else { container.style.height = ''; svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`); }
        focusSystem(domain, origins);
      }
      planetNodes.forEach((planet, name) => {
        planet.setAttribute('tabindex', familyMode || planet.getAttribute('aria-disabled') === 'true' ? '-1' : '0');
        planet.setAttribute('aria-expanded', String(name === domain));
      });
      caseNodes.forEach(({ record, marker }) => {
        marker.setAttribute('tabindex', '-1');
        marker.setAttribute('aria-hidden', 'true');
        [marker, namedButtons.get(record.id)].filter(Boolean).forEach(target => {
          target.classList.toggle('is-muted', maturity !== 'all' && record.maturity !== maturity);
          target.classList.toggle('is-selected', selectedId === record.id);
          target.setAttribute('aria-pressed', String(selectedId === record.id));
        });
      });
      if (entered) {
        revealCases(origins.get(familyMode ? 'sun' : domain));
        entered.heading.focus({ preventScroll: true });
        requestAnimationFrame(() => {
          if (destroyed || activePlanet !== domain) return;
          if (familyMode) return;
          const sceneTop = container.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: Math.max(0, sceneTop + focusLayout.y - window.innerHeight * .5), behavior: 'auto' });
        });
      }
      lastPlanet = domain;
    }
    return { render, destroy() {
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      revealAnimations.forEach(animation => animation.cancel());
    } };
  };
})();
