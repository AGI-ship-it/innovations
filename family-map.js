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
    return { ...item, angle, x: centre.x + Math.cos(angle) * ring.rx, y: centre.y + Math.sin(angle) * ring.ry };
  }
  // Preserve assigned tracks and grow vertical room only when labels need it.
  // Case tracks encode maturity; overview tracks are decorative.
  function arrange(items, width, caseMode = false, fitHeight = 0) {
    const compact = width < 650;
    const maxWidth = Math.max(...items.map(item => item.width), 120);
    const maxHeight = Math.max(...items.map(item => item.height), 90);
    const outerX = Math.max(48, width / 2 - maxWidth / 2 - 16);
    // Desktop overview starts at the height left in the first screen; it grows only if labels would collide.
    let height = compact ? Math.max(caseMode ? 1000 : 1260, items.length * 125) : fitHeight ? Math.max(fitHeight, items.length * 40) : Math.max(caseMode ? 720 : 960, items.length * 66);
    const attempts = fitHeight ? 20 : 12, growth = fitHeight ? 1.08 : 1.18;
    for (let attempt = 0; attempt < attempts; attempt++, height *= growth) {
      const centre = { x: width / 2, y: height / 2, width: compact ? (caseMode ? 120 : 78) : 160, height: caseMode ? 180 : compact ? 100 : 160 };
      const outerY = height / 2 - maxHeight / 2 - 44;
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
          const target = -Math.PI / 2 + (index + .32 + ring * .23) / members.length * Math.PI * 2;
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
      const delta = Math.min(seconds, .05) * Math.PI * 2 / (260 + node.ring * 80);
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
  window.FamilyAtlas = { families, key, label, stages, arrange, advance };
  // Shared measured geometry keeps overview and case motion on exact tracks.
  function createMap(container, onSelect, { caseMode = false, centreLabel = 'Facilities' } = {}) {
    let layout = null, current = [], frame = 0, previous = null, speed = 0;
    const nodes = new Map();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    container.classList.toggle('case-orbit-map', caseMode);
    const paths = svgElement('svg', { class: 'family-orbit-lines', 'aria-hidden': 'true' });
    const centre = element('div', `family-centre${caseMode ? ' case-centre' : ''}`);
    const sun = element('div', `service-sun${caseMode ? ' facilities-sun' : ''}`, caseMode ? '' : centreLabel);
    if (caseMode) {
      // Inner (family) views carry the Al Ghurair mark on the central planet.
      const mark = element('img', 'sun-mark');
      mark.src = 'assets/mark-dark.svg'; mark.alt = ''; mark.width = 56; mark.height = 56;
      sun.append(mark);
    }
    centre.append(sun, element('span', '', caseMode ? centreLabel : 'TECHNOLOGY FAMILIES'));
    const empty = element('p', 'family-empty', 'No technology families in this collection.');
    container.replaceChildren(paths, centre, empty);
    function position() {
      if (!layout) return;
      layout.nodes.forEach(node => {
        const button = nodes.get(node.id);
        button.style.translate = `${node.x.toFixed(2)}px ${node.y.toFixed(2)}px`;
        button.dataset.orbitAngle = String(node.angle);
      });
    }
    function measure() {
      if (!container.clientWidth || !current.length) return;
      const items = current.map((item, index) => {
        const node = nodes.get(item.id);
        return { id: item.id, ring: caseMode ? stages.indexOf(item.maturity) : index % 3, width: node.offsetWidth, height: node.offsetHeight };
      });
      const top = container.getBoundingClientRect().top + window.scrollY;
      const fitHeight = Math.max(caseMode ? 380 : 420, window.innerHeight - top - (window.innerWidth > 900 ? 44 : 12));
      try { layout = arrange(items, container.clientWidth, caseMode, fitHeight); }
      catch (error) { empty.textContent = error.message; empty.hidden = false; empty.setAttribute('role', 'alert'); return; }
      container.style.height = `${layout.height}px`;
      centre.style.top = `${layout.centre.y}px`;
      paths.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
      paths.replaceChildren(...layout.rings.map((ring, index) => svgElement('ellipse', {
        cx: layout.centre.x, cy: layout.centre.y, rx: ring.rx, ry: ring.ry,
        ...(caseMode ? { 'data-orbit-maturity': stages[index] } : {}), class: `family-track track-${index}`,
      })));
      items.forEach(item => { nodes.get(item.id).dataset.orbitRing = String(item.ring); });
      container.dataset.orbitGeometry = JSON.stringify(layout);
      position();
    }
    function render(items, collection) {
      current = items;
      nodes.forEach(node => node.remove()); nodes.clear();
      container.dataset.selectedMaturity = 'all';
      container.classList.toggle('is-dense', caseMode && items.length > 5);
      if (!caseMode) centre.querySelector('span').textContent = `${collection === 'internal' ? 'INTERNAL' : 'SERVICE'} TECHNOLOGIES`;
      empty.hidden = items.length > 0;
      centre.hidden = !items.length; paths.hidden = !items.length;
      if (!items.length) { layout = null; container.style.height = '220px'; return; }
      const surfaces = ['ringed', 'ice', 'cratered', 'marbled', 'banded', 'crescent', 'storm'];
      items.forEach((item, index) => {
        const button = element('button', caseMode ? `usecase-moon ${item.maturity.toLowerCase()}` : 'family-world');
        if (caseMode) {
          button.dataset.id = item.id; button.dataset.maturity = item.maturity;
          button.setAttribute('aria-pressed', 'false');
          button.setAttribute('aria-label', `${item.title}. ${item.maturity}. Open full card.`);
        } else {
          button.dataset.family = item.id; button.dataset.domain = item.domain;
          button.setAttribute('aria-label', `${item.domain}. ${item.records.length} ${item.records.length === 1 ? 'use case' : 'use cases'} across maturity levels. Explore family.`);
        }
        const image = element('img', caseMode ? 'named-moon' : 'family-planet');
        image.src = `assets/planets/${surfaces[(caseMode ? Number(item.sourceId) * 3 : index) % surfaces.length]}.png`;
        image.alt = ''; image.width = 320; image.height = 260;
        button.append(image);
        if (caseMode) {
          const copy = element('span', 'satellite-copy');
          copy.append(element('strong', 'usecase-title', item.title), element('span', 'case-category', item.rawServiceGroup), element('small', 'usecase-maturity', item.maturity));
          button.append(copy);
        } else {
          const split = stages.map(stage => ({ stage, count: item.records.filter(record => record.maturity === stage).length })).filter(entry => entry.count);
          button.append(element('strong', 'family-name', item.label), element('span', 'family-count', `${item.records.length} ${item.records.length === 1 ? 'use case' : 'use cases'}`), element('span', 'family-stage', split.map(entry => `${entry.count} ${entry.stage}`).join(' · ')));
        }
        button.addEventListener('click', () => onSelect(item, button));
        nodes.set(item.id, button); container.append(button);
      });
      measure();
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
    const observer = new ResizeObserver(measure); observer.observe(container);
    function animate(timestamp) {
      const elapsed = previous === null ? 0 : Math.min((timestamp - previous) / 1000, .05); previous = timestamp;
      const paused = container.closest('[hidden]') || reduced.matches || document.hidden
        || document.body.classList.contains('stars-paused') || document.body.classList.contains('planet-preview-open') || document.querySelector('dialog[open]')
        || container.querySelector('button:hover, button:focus, details[open]');
      if (layout && !paused) {
        speed += (1 - speed) * (1 - Math.exp(-elapsed / .65));
        layout.nodes = advance(layout, elapsed * speed); position();
      } else speed = 0;
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return { render, highlight, destroy() { observer.disconnect(); cancelAnimationFrame(frame); } };
  }
  window.createFamilyMap = (container, onSelect) => createMap(container, onSelect);
  window.createFamilyCaseMap = (container, records, { onCase, centreLabel }) => {
    const map = createMap(container, (record, button) => onCase(record.id, button), { caseMode: true, centreLabel });
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
    // Lives in the footer, just before Source notes; removed again when the family view closes.
    document.querySelectorAll('.page-footer .case-map-references').forEach(node => node.remove());
    const sourceNotes = document.getElementById('source-notes-open');
    if (content.children.length) { if (sourceNotes) sourceNotes.before(references); else container.append(references); }
    return { render(state) { map.highlight(state.maturity, state.selectedId); }, destroy() { references.remove(); map.destroy(); } };
  };
})();
