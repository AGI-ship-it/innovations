(() => {
  'use strict';
  const data = window.RADAR_DATA;
  const byId = id => document.getElementById(id);
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined && value !== null) node.textContent = String(value);
    return node;
  };
  const text = (id, value) => { byId(id).textContent = value === null || value === undefined || value === '' ? 'Not recorded.' : String(value); };
  if (!data || !Array.isArray(data.useCases) || !data.useCases.length || !Array.isArray(data.serviceGroups)
    || typeof window.createFamilyCaseMap !== 'function' || typeof window.createFamilyMap !== 'function' || !window.FamilyAtlas || typeof window.createSolarSystem !== 'function' || typeof window.AtlasOrbits?.positions !== 'function') {
    byId('solar-system').textContent = 'The solar system could not be loaded. Reload the page or check that all website files are together.';
    byId('solar-system').setAttribute('role', 'alert');
    document.querySelectorAll('button').forEach(button => { button.disabled = true; });
    return;
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let starsPaused = reducedMotion.matches;
  function updateStarMotion() {
    document.body.classList.toggle('stars-paused', starsPaused || reducedMotion.matches);
    const control = byId('motion-toggle');
    const motionLabel = reducedMotion.matches ? 'Motion reduced' : starsPaused ? 'Resume motion' : 'Pause motion';
    control.replaceChildren(icon(starsPaused || reducedMotion.matches ? 'play' : 'pause'));
    control.setAttribute('aria-label', motionLabel); control.dataset.tooltip = motionLabel;
    control.disabled = reducedMotion.matches;
    control.setAttribute('aria-pressed', String(starsPaused || reducedMotion.matches));
  }
  // ⌘K / Ctrl+K opens search from anywhere.
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) document.querySelector('#overview-all kbd').textContent = 'Ctrl K';
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !document.querySelector('dialog[open]')) { event.preventDefault(); byId('overview-all').click(); }
  });
  byId('motion-toggle').addEventListener('click', () => {
    starsPaused = !starsPaused;
    if (starsPaused) document.getAnimations().filter(animation => !('animationName' in animation)).forEach(animation => animation.cancel());
    updateStarMotion();
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { starsPaused = true; document.getAnimations().forEach(animation => animation.cancel()); } updateStarMotion(); });
  updateStarMotion();
  const records = data.useCases;
  // Display titles use an ampersand for “and” (source text elsewhere is unchanged).
  records.forEach(record => { record.title = record.title.replace(/\s+and\s+/gi, ' & '); });
  const domains = [...new Set(records.map(record => record.domain))].sort((a, b) => a.localeCompare(b));
  const serviceGroups = data.serviceGroups;
  // view: 'universe' (AGI and its business areas, the landing view) or 'area' (Facilities).
  const state = { view: 'universe', collection: 'service', family: null, maturity: 'all', planet: null, selectedId: null };
  const families = window.FamilyAtlas.families(records);
  const universe = window.ATLAS_UNIVERSE;
  let overviewStamp = '';
  let previousFamily = null;
  const workspace = document.querySelector('.landscape-workspace');
  const inspector = document.querySelector('.inspector');
  const browse = { collection: 'all', groupId: 'all', maturity: 'all', domain: 'all', query: '' };
  const detail = byId('case-detail');
  let filtered = records;
  let returnFocus = null;
  let returnOrigin = 'scene';
  let returnRecordId = null;
  let indexScroll = 0;
  let indexDialogScroll = 0;
  let returnScrollY = 0;
  const number = record => String(record.sourceId).padStart(2, '0');
  let solar = null;
  const familyRecords = () => state.family?.records || [];
  const groupName = group => group.name.replace(/^\d+\.\s*/, '');
  function mountFamily(family) {
    if (state.family?.id === family?.id && solar) return;
    stopNavigationZoom();
    solar?.destroy();
    const container = byId('solar-system');
    container.replaceChildren(); container.style.height = ''; container.classList.remove('has-focus');
    state.family = family;
    state.planet = family?.id || null;
    // The page takes on the selected family's colour.
    const colour = family ? window.FamilyAtlas.look(family.domain).colour : '';
    document.body.classList.toggle('has-family-colour', Boolean(family));
    if (family) document.body.style.setProperty('--family-colour', colour); else document.body.style.removeProperty('--family-colour');
    state.maturity = 'all';
    if (!family) { solar = null; return; }
    state.collection = family.collection;
    solar = window.createSolarSystem(container, family.records, {
      centreLabel: family.label,
      familyMode: true,
      onPlanet() {},
      onReset: resetSystem,
      onCase(id, trigger) { filtered = familyRecords(); openCase(id, trigger); }
    });
  }
  // Navigation commits immediately; motion is decorative and never delays input.
  const navigationAnimations = new Set();
  function stopNavigationZoom() {
    navigationAnimations.forEach(animation => animation.cancel());
    navigationAnimations.clear();
  }
  function planetOrigin(trigger) {
    if (!trigger?.matches('.family-world, .usecase-moon')) return null;
    const surface = trigger.querySelector('.family-planet, .named-moon');
    const bounds = (surface || trigger).getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= innerHeight) return null;
    return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2,
      image: surface?.tagName === 'IMG' ? surface.cloneNode() : null, bounds };
  }
  function zoomFromPlanet(destination, origin, showPlanet = false) {
    stopNavigationZoom();
    if (!origin || starsPaused || reducedMotion.matches) return;
    const bounds = destination.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width, origin.x - bounds.left));
    const y = Math.max(0, Math.min(bounds.height, origin.y - bounds.top));
    const animation = destination.animate([
      { transform: 'scale(.88)', transformOrigin: `${x}px ${y}px`, opacity: .25 },
      { transform: 'scale(1)', transformOrigin: `${x}px ${y}px`, opacity: 1 }
    ], { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)' });
    const track = (motion, cleanup = () => {}) => {
      navigationAnimations.add(motion);
      const done = () => { navigationAnimations.delete(motion); cleanup(); };
      motion.onfinish = done; motion.oncancel = done;
    };
    track(animation);
    if (showPlanet && origin.image) {
      const ghost = origin.image;
      ghost.className = 'planet-zoom-ghost'; ghost.alt = ''; ghost.setAttribute('aria-hidden', 'true');
      Object.assign(ghost.style, { left: `${origin.bounds.left}px`, top: `${origin.bounds.top}px`,
        width: `${origin.bounds.width}px`, height: `${origin.bounds.height}px` });
      document.body.append(ghost);
      // Fallback: the ghost never outlives its animation, even if the animation is throttled or never finishes.
      setTimeout(() => ghost.remove(), 700);
      track(ghost.animate([
        { transform: 'scale(1)', opacity: .9 },
        { transform: 'scale(3.2)', opacity: 0 }
      ], { duration: 480, easing: 'cubic-bezier(.2,.7,.2,1)' }), () => ghost.remove());
    }
  }
  function chooseFamily(family, trigger) {
    const origin = planetOrigin(trigger);

    closeCase(false);
    previousFamily = family.id;
    state.view = 'area';
    mountFamily(family);
    renderScene();
    pushRoute();
    byId('active-stage').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
    zoomFromPlanet(byId('solar-system'), origin, true);
  }
  // One delegated preview follows live planets without changing source records or click targets.
  const preview = el('aside', 'planet-preview');
  preview.id = 'planet-preview'; preview.setAttribute('role', 'dialog'); preview.setAttribute('aria-modal', 'false'); preview.setAttribute('aria-labelledby', 'preview-title'); preview.hidden = true;
  document.body.append(preview);
  // Cards carry a small external-link icon instead of a full-width button; it stays a real, labelled button for keyboard use.
  function previewAction(label) {
    const action = el('button', 'preview-open'); action.type = 'button';
    action.setAttribute('aria-label', label);
    action.append(icon('external-link'));
    return action;
  }
  // The whole card is clickable: a click anywhere on it does what its action button does.
  preview.addEventListener('click', event => {
    const action = preview.querySelector('.preview-open');
    if (action && !action.contains(event.target)) action.click();
  });
  // Curved connectors: a soft S-curve from a planet to what it opens, with a pulse of light that travels along it.
  const svgNS = 'http://www.w3.org/2000/svg';
  function makeCurve(className) {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', `curve-link ${className}`); svg.setAttribute('aria-hidden', 'true');
    const path = cls => { const node = document.createElementNS(svgNS, 'path'); node.setAttribute('class', cls); node.setAttribute('pathLength', '1000'); return node; };
    const dot = cls => { const node = document.createElementNS(svgNS, 'circle'); node.setAttribute('class', cls); return node; };
    svg.append(path('curve-base'), path('curve-pulse'), path('curve-pulse-head'), dot('curve-dot is-start'), dot('curve-dot is-end'));
    return svg;
  }
  // a → b, leaving and arriving along one axis ('x' for side-by-side, 'y' for above/below).
  function setCurve(svg, a, b, axis = 'x') {
    // Straight connectors: layouts align the planet with its target so the line runs level.
    const d = `M${a.x} ${a.y} L${b.x} ${b.y}`;
    svg.querySelectorAll('path').forEach(node => node.setAttribute('d', d));
    const [start, end] = svg.querySelectorAll('circle');
    start.setAttribute('cx', a.x); start.setAttribute('cy', a.y); start.setAttribute('r', 2.5);
    end.setAttribute('cx', b.x); end.setAttribute('cy', b.y); end.setAttribute('r', 3.5);
  }
  // Restart the draw-in, pulse and flash together.
  function replayCurve(svg, ...targets) { [svg, ...targets].forEach(node => node?.classList.remove('is-live')); void svg.getBoundingClientRect(); [svg, ...targets].forEach(node => node?.classList.add('is-live')); }
  const sphereOf = node => {
    const box = (node.querySelector('.planet-body, .family-planet, .named-moon') || node).getBoundingClientRect();
    // Planet images draw their sphere at 62.5% of the image width, centred.
    return { x: box.left + box.width / 2, y: box.top + box.height / 2, r: box.width * .3125 * .95 };
  };
  // SVG elements have no .hidden property, so the attribute is toggled directly.
  const tether = makeCurve('preview-curve'); tether.setAttribute('hidden', '');
  document.body.append(tether);
  function placeTether(target, placement) {
    // Use the card's resting position (it may still be sliding in), so the lines land exactly on its edge.
    const sphere = sphereOf(target), restLeft = parseFloat(preview.style.left) || 0, restTop = parseFloat(preview.style.top) || 0;
    const card = { left: restLeft, top: restTop, right: restLeft + preview.offsetWidth, bottom: restTop + preview.offsetHeight };
    // The connector is always horizontal: it meets the card at the planet's own height (the title is aligned there).
    const clampY = () => Math.max(card.top + 22, Math.min(card.bottom - 22, sphere.y));
    const clampX = value => Math.max(card.left + 22, Math.min(card.right - 22, value));
    let a, b, axis = 'x';
    if (placement === 'right') { a = { x: sphere.x + sphere.r, y: sphere.y }; b = { x: card.left, y: clampY() }; }
    else if (placement === 'left') { a = { x: sphere.x - sphere.r, y: sphere.y }; b = { x: card.right, y: clampY() }; }
    else if (placement === 'below') { axis = 'y'; a = { x: sphere.x, y: sphere.y + sphere.r }; b = { x: clampX(sphere.x), y: card.top }; }
    else { axis = 'y'; a = { x: sphere.x, y: sphere.y - sphere.r }; b = { x: clampX(sphere.x), y: card.bottom }; }
    // The connector takes the planet's colour: a use case's maturity, a family's colour, or the business area's tint.
    const stageTone = { Established: '#f2b84b', Scaling: '#e24bc0', Emerging: '#3fd6c4' }[target.dataset.maturity];
    const areaTone = { facilities: '#b58cf0', healthcare: '#3fbf7f' }[target.dataset.universe];
    const tone = stageTone || areaTone || target.style.getPropertyValue('--family-colour').trim();
    if (tone) tether.style.setProperty('--page-primary-button', tone); else tether.style.removeProperty('--page-primary-button');
    setCurve(tether, a, b, axis);
    // Side cards: like the full card — the line branches into two curves at the card's edge, lines run along
    // that edge and fade, and soft ripples pulse from the dot on the planet.
    const ns = 'http://www.w3.org/2000/svg';
    tether.querySelectorAll('.curve-tail, .curve-ripple, defs').forEach(node => node.remove());
    if (axis === 'x') {
      const dir = placement === 'right' ? 1 : -1, r = 18, bx = b.x;
      const d = `M${a.x} ${a.y} L${bx - dir * r} ${b.y} Q${bx} ${b.y} ${bx} ${b.y - r} M${bx - dir * r} ${b.y} Q${bx} ${b.y} ${bx} ${b.y + r}`;
      tether.querySelectorAll('path').forEach(path => path.setAttribute('d', d));
      const end = tether.querySelector('.curve-dot.is-end'); end?.setAttribute('cx', bx - dir * r);
      const defs = document.createElementNS(ns, 'defs'); tether.prepend(defs);
      [['up', b.y - r, Math.max(card.top + 14, b.y - r - 90)], ['down', b.y + r, Math.min(card.bottom - 14, b.y + r + 90)]].forEach(([way, from, to]) => {
        const grad = document.createElementNS(ns, 'linearGradient'); grad.id = `preview-tail-${way}`; grad.setAttribute('gradientUnits', 'userSpaceOnUse');
        grad.setAttribute('x1', bx); grad.setAttribute('x2', bx); grad.setAttribute('y1', from); grad.setAttribute('y2', to);
        [['0', '1'], ['1', '0']].forEach(([offset, opacity]) => { const stop = document.createElementNS(ns, 'stop'); stop.setAttribute('offset', offset); stop.style.stopColor = 'var(--page-primary-button)'; stop.setAttribute('stop-opacity', opacity); grad.append(stop); });
        defs.append(grad);
        const tail = document.createElementNS(ns, 'path'); tail.setAttribute('class', 'curve-tail'); tail.setAttribute('pathLength', '1000');
        tail.setAttribute('stroke', `url(#preview-tail-${way})`); tail.setAttribute('d', `M${bx} ${from} L${bx} ${to}`); tether.append(tail);
      });
    }
    [0, 1, 2].forEach(index => { const ring = document.createElementNS(ns, 'circle'); ring.setAttribute('class', 'curve-ripple'); ring.style.animationDelay = `${.6 + index * .8}s`;
      ring.setAttribute('cx', a.x); ring.setAttribute('cy', a.y); ring.setAttribute('r', 5); tether.append(ring); });
    tether.removeAttribute('hidden');
    replayCurve(tether, preview.querySelector('h3'));
  }
  let keyboardPreview = false;
  let previewTarget = null, previewTimer = 0, previewEpoch = 0, dismissedPreviewTarget = null, pendingPreviewTarget = null;
  const excerpt = (value, limit) => value.length > limit ? `${value.slice(0, limit).replace(/\s+\S*$/, '')}…` : value;
  function hidePreview() {
    previewEpoch++;
    pendingPreviewTarget = null;
    clearTimeout(previewTimer);
    previewTarget?.removeAttribute('aria-describedby');
    previewTarget?.setAttribute('aria-expanded', 'false');
    previewTarget = null; preview.hidden = true; tether.setAttribute('hidden', '');
    document.body.classList.remove('planet-preview-open');
  }
  function showPreview(target) {
    clearTimeout(previewTimer);
    if (target === dismissedPreviewTarget || !detail.hidden || document.querySelector('dialog[open]')) return;
    if (previewTarget === target && !preview.hidden) return;
    hidePreview();
    const family = families.find(item => item.id === target.dataset.family);
    const record = records.find(item => item.id === target.dataset.id);
    const area = universe.planets.find(item => item.id === target.dataset.universe);
    if (!family && !record && !area) return;
    previewTarget = target;
    if (area) {
      // Business-area planets: name, one-line description, and either "Coming soon" or an open action.
      const live = area.status === 'live';
      const meta = el('div', 'preview-meta'); meta.append(el('span', `preview-status${live ? '' : ' is-soon'}`, live ? 'Live' : 'Coming soon'));
      const heading = el('h3', '', area.name); heading.id = 'preview-title';
      preview.replaceChildren(meta, heading, el('p', 'preview-description', area.description));
      if (live) {
        const action = previewAction(`Open ${area.name}`);
        action.addEventListener('click', () => { const origin = previewTarget; hidePreview(); openArea(area, origin); });
        preview.append(action);
      }
    } else {
    const meta = el('div', 'preview-meta', family ? `${family.records.length} ${family.records.length === 1 ? 'use case' : 'use cases'} · ${['Established', 'Scaling', 'Emerging'].map(stage => [stage, family.records.filter(item => item.maturity === stage).length]).filter(([, count]) => count).map(([stage, count]) => `${count} ${stage}`).join(' · ')}` : '');
    // Use cases: the maturity shows as a chip, followed by the prioritisation category.
    if (record && !family) meta.append(el('span', 'maturity-chip', record.maturity), el('span', 'preview-category', record.prioritisation.category));
    const heading = el('h3', '', family ? family.label : record.title); heading.id = 'preview-title';
    preview.replaceChildren(meta, heading);
    if (family) {
      const list = el('ul', 'preview-cases');
      family.records.slice(0, 3).forEach(item => list.append(el('li', '', item.title)));
      preview.append(list);
      if (family.records.length > 3) preview.append(el('p', 'preview-more', `+ ${family.records.length - 3} more use cases`));
    } else {
      preview.append(el('p', 'preview-description', excerpt(record.description, 220)));
      const value = el('div', 'preview-value');
      value.append(el('strong', '', 'Value realised'), el('p', '', excerpt(record.value, 160)));
      preview.append(value);
    }
    const action = previewAction(family ? `Explore ${family.label} use cases` : `Open the full card: ${record.title}`);
    action.addEventListener('click', () => {
      const origin = previewTarget;
      hidePreview();
      if (family) chooseFamily(family, origin);
      else { filtered = familyRecords(); openCase(record.id, origin); }
    });
    preview.append(action);
    }
    preview.hidden = false; target.setAttribute('aria-describedby', preview.id); target.setAttribute('aria-controls', preview.id); target.setAttribute('aria-expanded', 'true');
    document.body.classList.add('planet-preview-open');
    const bounds = target.getBoundingClientRect();
    preview.style.maxHeight = '';
    const box = preview.getBoundingClientRect();
    const margin = 8;
    let left = Math.max(margin, Math.min(innerWidth - box.width - margin, bounds.left + bounds.width / 2 - box.width / 2));
    let top, placement;
    // Cards open to the side of the planet: right, then left; if neither fits at full width, the roomier
    // side with a narrower card. Only narrow (phone) screens fall back to below or above.
    preview.style.width = '';
    const rightRoom = innerWidth - margin - bounds.right - margin, leftRoom = bounds.left - margin - margin;
    const rightFits = rightRoom >= box.width;
    const leftFits = leftRoom >= box.width;
    const sideWidth = Math.max(rightRoom, leftRoom);
    // Side cards line up so their title sits level with the planet's centre (a short, straight connector).
    const planetCentreY = sphereOf(target).y;
    const titleOffset = () => { const title = preview.querySelector('h3'); return title ? title.offsetTop + title.offsetHeight / 2 : 40; };
    const sideTop = height => Math.max(margin, Math.min(innerHeight - height - margin, planetCentreY - titleOffset()));
    if (rightFits) {
      left = bounds.right + margin; top = sideTop(box.height); placement = 'right';
    } else if (leftFits) {
      left = bounds.left - box.width - margin; top = sideTop(box.height); placement = 'left';
    } else if (sideWidth >= 240) {
      preview.style.width = `${sideWidth}px`;
      const height = preview.getBoundingClientRect().height;
      placement = rightRoom >= leftRoom ? 'right' : 'left';
      left = placement === 'right' ? bounds.right + margin : bounds.left - sideWidth - margin;
      top = sideTop(height);
    } else if (bounds.bottom + box.height + margin <= innerHeight - margin) {
      top = bounds.bottom + margin; placement = 'below';
    } else if (bounds.top - box.height - margin >= margin) {
      top = bounds.top - box.height - margin; placement = 'above';
    } else {
      // Narrow screens: fit on the roomier side, never cover the click target.
      const above = bounds.top - margin * 2;
      const below = innerHeight - bounds.bottom - margin * 2;
      const useAbove = above >= below;
      const height = Math.max(80, useAbove ? above : below);
      preview.style.maxHeight = `${height}px`;
      top = useAbove ? bounds.top - preview.getBoundingClientRect().height - margin : bounds.bottom + margin;
      placement = useAbove ? 'above' : 'below';
    }
    preview.style.left = `${left}px`; preview.style.top = `${Math.max(margin, top)}px`;
    preview.dataset.placement = placement;
    placeTether(target, placement);
  }
  function deferPreviewHide() { clearTimeout(previewTimer); previewTimer = setTimeout(() => { if (!preview.contains(document.activeElement) && document.activeElement !== previewTarget) hidePreview(); }, 220); }
  const planetTarget = target => target instanceof Element ? target.closest('.family-world, .usecase-moon') : null;
  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch') return;
    const target = planetTarget(event.target);
    if (target && !keyboardPreview && !pendingPreviewTarget && !preview.contains(document.activeElement)) showPreview(target);
  });
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    keyboardPreview = false;
    const target = planetTarget(event.target);
    if (target && target !== dismissedPreviewTarget) showPreview(target);
  });
  document.addEventListener('pointerout', event => {
    const target = planetTarget(event.target);
    if (target && !target.contains(event.relatedTarget)) {
      if (!keyboardPreview && dismissedPreviewTarget === target) dismissedPreviewTarget = null;
      deferPreviewHide();
    }
  });
  function scheduleFocusPreview(target) {
    hidePreview();
    const epoch = previewEpoch;
    pendingPreviewTarget = target;
    // Focus may scroll the page. Discard delayed previews after clicks or Escape.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (epoch !== previewEpoch) return;
      pendingPreviewTarget = null;
      const bounds = target.getBoundingClientRect();
      if (epoch === previewEpoch && document.activeElement === target && target.isConnected
        && bounds.bottom > 0 && bounds.top < innerHeight) showPreview(target);
    }));
  }
  document.addEventListener('focusin', event => {
    const target = planetTarget(event.target);
    if (target) {
      keyboardPreview = true;
      if (target !== dismissedPreviewTarget) dismissedPreviewTarget = null;
      scheduleFocusPreview(target);
    } else if (!preview.contains(event.target)) { dismissedPreviewTarget = null; hidePreview(); }
  });
  preview.addEventListener('pointerenter', () => clearTimeout(previewTimer));
  preview.addEventListener('pointerleave', deferPreviewHide);
  document.addEventListener('click', event => { if (!preview.contains(event.target)) hidePreview(); }, true);
  document.addEventListener('scroll', event => {
    if (event.target === preview || preview.contains(document.activeElement)) return;
    const target = planetTarget(document.activeElement);
    if (target && target !== dismissedPreviewTarget) scheduleFocusPreview(target);
    else hidePreview();
  }, true);
  window.addEventListener('resize', hidePreview);
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && pendingPreviewTarget && preview.hidden) showPreview(pendingPreviewTarget);
    if (event.key === 'Tab' && !preview.hidden && previewTarget) {
      const action = preview.querySelector('.preview-open');
      if (action && event.target === previewTarget && !event.shiftKey) { event.preventDefault(); action.focus({ preventScroll: true }); }
      else if (event.target === action) {
        const origin = previewTarget;
        const planets = [...origin.parentElement.querySelectorAll(':scope > .family-world, :scope > .usecase-moon')];
        const next = event.shiftKey ? origin : planets[planets.indexOf(origin) + 1] || byId('overview-all');
        event.preventDefault(); hidePreview(); next.focus();
      }
    }
    if (event.key === 'Escape' && (!preview.hidden || pendingPreviewTarget)) {
      const origin = previewTarget || pendingPreviewTarget;
      const focusWasInPreview = preview.contains(document.activeElement);
      dismissedPreviewTarget = origin; hidePreview();
      if (focusWasInPreview) origin?.focus({ preventScroll: true });
      event.stopImmediatePropagation(); event.preventDefault();
    }
  }, true);
  const familyMap = window.createFamilyMap(byId('family-map'), chooseFamily);
  // Universe level: AGI at the centre, each business area as a planet (configured in planets.js).
  // Every current use case belongs to Facilities, the only live area.
  const universeItems = universe.planets.map(planet => ({ ...planet, meta: planet.id === 'facilities' ? `${records.length} use cases` : '' }));
  const universeMap = window.createUniverseMap(byId('universe-map'), (planet, button) => (planet.status === 'live' ? openArea(planet, button) : showPreview(button)), universe.centre.name);
  let universeRendered = false;
  function openArea(planet, trigger) {
    if (planet.status !== 'live') return;
    const origin = planetOrigin(trigger);
    closeCase(false); mountFamily(null);
    state.view = 'area';
    renderScene();
    pushRoute();
    byId('family-heading').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
    zoomFromPlanet(byId('family-map'), origin, true);
  }
  function showUniverse() {
    stopNavigationZoom();
    closeCase(false); mountFamily(null);
    state.view = 'universe';
    renderScene();
  }
  // Hash routes keep every level linkable and make Back work:
  // #/ (AGI) · #/facilities/<service|internal> · #/facilities/<collection>/<family> · #<case-id> opens a card.
  const slug = value => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function routeFor() {
    if (state.view === 'universe') return '#/';
    const base = `#/facilities/${state.collection}`;
    return state.family ? `${base}/${slug(state.family.label)}` : base;
  }
  function pushRoute() { const route = routeFor(); if (location.hash !== route) history.pushState(null, '', route); }
  function applyRoute() {
    const hash = location.hash;
    if (records.some(record => `#${record.id}` === hash)) { openLinkedCase(); return; }
    const parts = decodeURIComponent(hash.replace(/^#/, '')).split('/').filter(Boolean);
    if (parts[0] !== 'facilities') { showUniverse(); return; }
    const collection = ['service', 'internal'].includes(parts[1]) ? parts[1] : state.collection;
    const family = parts[2] ? families.find(item => item.collection === collection && slug(item.label) === parts[2]) : null;
    closeCase(false);
    state.view = 'area'; state.collection = collection;
    mountFamily(family || null);
    renderScene();
  }
  function renderBreadcrumb() {
    const collectionName = state.collection === 'internal' ? 'Internal' : 'Service';
    const levels = [{ label: universe.centre.name, href: '#/', title: universe.centre.fullName }];
    if (state.view !== 'universe') {
      levels.push({ label: 'Facilities', href: '#/facilities' }, { label: collectionName, href: `#/facilities/${state.collection}` });
      if (state.family) levels.push({ label: state.family.label, href: routeFor() });
    }
    byId('breadcrumb-list').replaceChildren(...levels.map((level, index) => {
      const item = el('li', 'breadcrumb-item');
      const current = index === levels.length - 1;
      const node = el(current ? 'span' : 'a', current ? 'breadcrumb-current' : 'breadcrumb-link', level.label);
      if (current) node.setAttribute('aria-current', 'page'); else node.href = level.href;
      if (level.title) node.title = level.title;
      item.append(node);
      return item;
    }));
  }
  // Home page side list: every family, grouped under Service and Internal; clicking one opens it.
  function buildFamilyIndex() {
    const host = byId('family-index');
    host.replaceChildren(...['service', 'internal'].map(collection => {
      const group = el('section', 'family-index-group'); group.dataset.collection = collection;
      const items = families.filter(item => item.collection === collection).sort((a, b) => b.records.length - a.records.length || a.label.localeCompare(b.label));
      const total = records.filter(record => record.collection === collection).length;
      const head = el('h3', 'family-index-head'); head.append(el('span', '', `${collection === 'internal' ? 'Internal' : 'Service'} families`), el('small', '', String(items.length)));
      const list = el('ul', 'family-index-list');
      items.forEach(family => {
        const button = el('button', 'family-index-item'); button.type = 'button'; button.dataset.familyLink = family.id;
        button.setAttribute('aria-label', `${family.label}, ${family.records.length} ${family.records.length === 1 ? 'use case' : 'use cases'}, ${collection}`);
        button.append(el('span', 'family-index-name', family.label), el('span', 'family-index-count', String(family.records.length)));
        button.addEventListener('click', () => { state.collection = family.collection; chooseFamily(family, null); });
        // Hovering a pill lights up its planet in the galaxy.
        const planet = () => [...document.querySelectorAll('#family-map [data-family]')].find(node => node.dataset.family === family.id);
        ['pointerenter', 'focus'].forEach(type => button.addEventListener(type, () => planet()?.classList.add('is-linked')));
        ['pointerleave', 'blur'].forEach(type => button.addEventListener(type, () => planet()?.classList.remove('is-linked')));
        const item = el('li'); item.append(button); list.append(item);
      });
      // Leading "All families" pill marks the current home view, like "All maturities".
      const all = el('button', 'family-index-item is-all'); all.type = 'button'; all.setAttribute('aria-pressed', 'true');
      all.append(el('span', 'family-index-name', 'All families'), el('span', 'family-index-count', String(items.length)));
      const allItem = el('li'); allItem.append(all); list.prepend(allItem);
      head.classList.add('sr-only');
      group.append(head, list);
      return group;
    }));
  }
  buildFamilyIndex();
  // Vertical wheel scrolls the family row sideways.
  document.querySelector('.maturity-navigation').addEventListener('wheel', event => { const row = event.currentTarget; if (row.scrollWidth <= row.clientWidth || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return; row.scrollLeft += event.deltaY; event.preventDefault(); }, { passive: false });
  byId('family-index').addEventListener('wheel', event => { const row = event.target.closest('.family-index-group'); if (!row || row.scrollWidth <= row.clientWidth || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return; row.scrollLeft += event.deltaY; event.preventDefault(); }, { passive: false });
  serviceGroups.forEach(group => {
    const option = el('option', '', groupName(group)); option.value = group.id;
    byId('service-filter').append(option);
  });
  document.querySelectorAll('#collection-switch [data-collection]').forEach(button => {
    button.addEventListener('click', () => {
      closeCase(false); mountFamily(null);
      state.view = 'area';
      state.collection = button.dataset.collection;
      renderScene();
      pushRoute();
    });
  });
  domains.forEach(domain => { const option = el('option', '', domain); option.value = domain; byId('domain-filter').append(option); });
  text('about-source', 'Source: Al Ghurair internal and service use-case prioritisation research, October 2026.');
  function caseRow(record, context, showDomain = false) {
    const button = el('button', 'case-row');
    button.dataset.id = record.id;
    button.setAttribute('aria-label', `${record.title}. ${record.maturity}. Open description and value realised.`);
    // Title first, then the domain line and number/maturity beneath it.
    button.append(el('strong', 'case-row-title', record.title));
    if (showDomain) button.append(el('span', 'case-domain', `${serviceGroups.find(group => group.id === record.groupId).shortName} / ${record.domain}`));
    const heading = el('span', 'case-heading');
    heading.append(el('span', 'case-number', number(record)), el('span', 'case-stage', record.maturity), el('span', 'case-arrow'));
    heading.lastChild.append(icon('arrow-up-right'));
    button.append(heading);
    const value = el('span', 'case-value');
    value.append(el('span', 'value-label', 'Value realised'), el('span', 'case-preview', record.value));
    button.append(value);
    button.addEventListener('click', () => { filtered = context; openCase(record.id, button); });
    return button;
  }
  function renderScene() {
    // Safety net: nothing from a previous screen may linger (zoom ghosts, an orphaned full-card planet).
    if (detail.hidden && !closingCase) {
      document.querySelectorAll('.planet-zoom-ghost').forEach(node => node.remove());
      { if (cardPlanet.matches(':popover-open')) cardPlanet.hidePopover(); cardPlanet.classList.remove('is-shown'); cardPlanet.style.setProperty('display', 'none', 'important'); }
      document.querySelectorAll('.is-lifted').forEach(node => node.classList.remove('is-lifted'));
    }
    const family = state.family;
    const collectionName = state.collection === 'internal' ? 'Internal' : 'Service';
    const inUniverse = state.view === 'universe';
    document.title = inUniverse ? 'Al Ghurair — Tech Incubation Hub' : `Al Ghurair — Facilities / ${collectionName} / ${family ? family.label : 'Technology families'}`;
    document.body.classList.toggle('is-universe', inUniverse);
    byId('universe-view').hidden = !inUniverse;
    if (inUniverse && !universeRendered) { universeMap.render(universeItems); universeRendered = true; }
    const liveCount = universe.planets.filter(planet => planet.status === 'live').length;
    text('universe-summary', `${universe.centre.fullName}: ${universe.planets.length} business areas, ${liveCount} live.`);
    renderBreadcrumb();
    const scoped = records.filter(record => record.collection === state.collection);
    const shown = families.filter(item => item.collection === state.collection);
    document.querySelectorAll('#collection-switch [data-collection]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.collection === state.collection));
      button.querySelector('span').textContent = records.filter(record => record.collection === button.dataset.collection).length;
    });
    byId('family-overview').hidden = inUniverse || Boolean(family);
    byId('family-index').hidden = inUniverse || Boolean(family);
    workspace.hidden = inUniverse || !family;
    document.querySelector('.scene-toolbar').hidden = !family;
    document.querySelectorAll('[data-maturity-filter]').forEach(button => {
      const maturity = button.dataset.maturityFilter;
      const count = (family?.records || scoped).filter(record => maturity === 'all' || record.maturity === maturity).length;
      button.querySelector('span').textContent = count;
      button.disabled = count === 0;
      button.setAttribute('aria-pressed', String(maturity === state.maturity));
    });
    if (family) {
      solar.render({ ...state });
      text('active-stage', family.domain);
      text('stage-summary', `${family.records.length} named ${family.records.length === 1 ? 'use case' : 'use cases'}`);
      text('scene-instruction', 'Select a named use case to read its description, scores and value.');
    } else {
      const stamp = state.collection;
      if (stamp !== overviewStamp) { familyMap.render(shown, state.collection); overviewStamp = stamp; }
      const summary = `${shown.length} families, one planet each. Select a planet to explore its use cases by maturity.`;
      text('family-summary', summary);
      document.querySelectorAll('.family-index-group').forEach(group => group.classList.toggle('is-current', group.dataset.collection === state.collection));
    }
  }
  function resetSystem() {
    stopNavigationZoom();
    const previous = state.family?.id || previousFamily;
    closeCase(false); mountFamily(null); state.view = 'area'; renderScene(); pushRoute();
    const target = [...document.querySelectorAll('[data-family]')].find(button => button.dataset.family === previous);
    (target || byId('family-heading')).focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function renderBrowser() {
    const query = browse.query.trim().toLocaleLowerCase('en-GB');
    const matches = records.filter(record => (browse.collection === 'all' || record.collection === browse.collection)
      && (browse.groupId === 'all' || record.groupId === browse.groupId)
      && (browse.maturity === 'all' || record.maturity === browse.maturity)
      && (browse.domain === 'all' || record.domain === browse.domain)
      && [record.title, record.domain, record.description, record.value, record.technologies].join(' ').toLocaleLowerCase('en-GB').includes(query));
    byId('browse-list').replaceChildren(...matches.map(record => caseRow(record, matches, true)));
    const count = el('span', '', matches.length); count.id = 'result-count';
    byId('filter-summary').replaceChildren(count, document.createTextNode(` ${matches.length === 1 ? 'use case' : 'use cases'}`));
    byId('empty-state').hidden = matches.length !== 0;
    byId('browse-list').hidden = matches.length === 0;
  }
  function resetBrowser() {
    browse.collection = 'all';
    byId('browse-collection-filter').value = 'all';
    browse.groupId = 'all';
    byId('service-filter').value = browse.groupId;
    browse.maturity = 'all'; browse.domain = 'all'; browse.query = '';
    byId('browse-stage-filter').value = 'all'; byId('domain-filter').value = 'all'; byId('search').value = '';
    renderBrowser();
  }
  // Simple process glyphs describe steps, not technology or corporate identities.
  function processIcon(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('process-icon');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    const shapes = [
      'M4 8V4h6M20 8V4h-6M4 16v4h6M20 16v4h-6M8 12h8m-3-3 3 3-3 3',
      'M4 6h10m4-3 3 3M4 12h3m4 0h9M4 18h10m4 0h2M14 3v6M7 9v6m7 0v6',
      'M5 4h10l4 4v12H5V4m10 0v5h4M8 14l3 3 5-5'
    ];
    path.setAttribute('d', shapes[Math.min(index, shapes.length - 1)]);
    svg.append(path); return svg;
  }
  function openCase(id, trigger, direction = 0) {
    if (closingCase) return;
    const wasOpen = inspector.open && !detail.hidden;
    const origin = detail.hidden ? planetOrigin(trigger) : null;
    const record = records.find(item => item.id === id);
    if (!record) return;
    hidePreview();
    if (trigger) {
      if (detail.hidden) {
        returnScrollY = window.scrollY;
      }
      returnFocus = trigger;
      returnRecordId = id;
      returnOrigin = byId('browse-dialog').open ? 'index' : 'scene';
    }
    if (byId('browse-dialog').open) {
      indexScroll = byId('browse-list').scrollTop;
      indexDialogScroll = byId('browse-dialog').scrollTop;
      byId('browse-dialog').close();
    }
    state.view = 'area';
    mountFamily(families.find(family => family.id === window.FamilyAtlas.key(record)));
    if (state.maturity !== 'all' && state.maturity !== record.maturity) state.maturity = 'all';
    // The named atlas stays present alongside the reader.
    state.selectedId = id;
    text('detail-title', record.title);
    text('detail-domain', record.domain);
    text('detail-maturity', record.maturity);
    text('detail-portfolio', record.collection === 'internal' ? 'Internal' : 'Service');
    text('detail-service-group', record.rawServiceGroup);
    byId('detail-maturity').title = `${record.maturityScore} / 4 · ${record.maturityExplanation}`;
    text('detail-number', `${record.collection === 'internal' ? 'INTERNAL' : 'SERVICE'} CASE ${number(record)}`);
    const description = byId('detail-description');
    // Split only explicit source markers; preserve all original text and whitespace.
    const resultStart = record.description.search(/The outputs? (?:is|are) |It is needed because /);
    const process = resultStart < 0 ? record.description : record.description.slice(0, resultStart);
    const results = resultStart < 0 ? '' : record.description.slice(resultStart);
    const parts = process.split(/(?=Step \d+\s*:)/);
    let stepIndex = 0;
    const timeline = el('div', 'cx-timeline');
    description.replaceChildren(...parts.filter(part => part.trim()).map(part => {
      const match = part.match(/^(Step \d+\s*:)([\s\S]*)$/);
      if (!match) return el('p', 'cx-lead', part.trim());
      const step = el('div', 'cx-step');
      // Step card: an icon chosen from the step's wording, a "STEP n" chip, then the text.
      const stepNumber = (match[1].match(/\d+/) || [String(++stepIndex)])[0];
      const copy = match[2].trim();
      const badge = el('span', 'cx-step-icon'); badge.setAttribute('aria-hidden', 'true'); badge.append(icon(stepIcon(copy)));
      const node = el('span', 'cx-step-node'); node.setAttribute('aria-hidden', 'true');
      node.append(el('small', 'cx-step-word', 'Step'), el('strong', 'cx-step-num', stepNumber));
      const body = el('div', 'cx-step-body');
      body.append(node, el('strong', 'cx-step-label sr-only', match[1].replace(/\s*:$/, '')), el('p', 'cx-step-copy', copy));
      step.append(badge, body);
      return step;
    }));
    description.querySelectorAll('.cx-lead').forEach(clampLead);
    const steps = [...description.querySelectorAll(':scope > .cx-step')];
    if (steps.length) { steps[0].before(timeline); timeline.append(...steps); }
    if (results) {
      // Visual pair: Challenge (why it is needed) → Outcome (the output). Lead-in phrases are trimmed for display only.
      const tidy = textPart => { const t = textPart.trim(); return t.charAt(0).toUpperCase() + t.slice(1); };
      let outcome = '', challenge = '';
      results.split(/(?=It is needed because )/).filter(Boolean).forEach(part => {
        if (part.startsWith('It is needed because ')) challenge = tidy(part.replace(/^It is needed because /, ''));
        else outcome = tidy(part.replace(/^The outputs? (?:is|are) /, ''));
      });
      const grid = el('div', 'cx-results cx-flow');
      const card = (kind, label, iconName, body) => {
        const block = el('div', `cx-result is-${kind}`); block.setAttribute('role', 'group'); block.setAttribute('aria-label', label);
        const badge = el('span', 'cx-result-badge'); badge.setAttribute('aria-hidden', 'true'); badge.append(icon(iconName));
        const head = el('div', 'cx-result-head'); head.append(badge, el('strong', '', label));
        block.append(head, el('p', '', body));
        return block;
      };
      if (challenge) grid.append(card('why', 'Challenge', 'triangle-alert', challenge));
      if (challenge && outcome) { const arrow = el('span', 'cx-flow-arrow'); arrow.setAttribute('aria-hidden', 'true'); arrow.append(icon('arrow-right')); grid.append(arrow); }
      if (outcome) grid.append(card('out', 'Outcome', 'circle-check-big', outcome));
      description.append(grid);
    }
    text('detail-value', record.value);
    const priority = record.prioritisation;
    const score = (value, maximum = '') => value === null || value === undefined || value === '' ? 'Not scored' : `${typeof value === 'number' ? new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value) : value}${maximum}`;
    const collectionSize = records.filter(item => item.collection === record.collection).length;
    // Assessment tiles with half-radial gauges; rank as a headline stat.
    const svgNS = 'http://www.w3.org/2000/svg';
    const R = 38, CX = 50, CY = 48;
    const polar = t => [CX - R * Math.cos(Math.PI * t), CY - R * Math.sin(Math.PI * t)]; // t: 0 = left, 1 = right
    const arcPath = (t0, t1) => { const [x0, y0] = polar(t0), [x1, y1] = polar(t1); return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
    const svgEl = (name, attrs) => { const n = document.createElementNS(svgNS, name); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
    // Half-radial gauge: grey track with a continuous, softly graded arc on top (rounded ends).
    // One colour rule for every tile, by % of maximum: <25% Low (grey-red), 25–50% Moderate (orange), ≥50% Strong (green).
    let gaugeId = 0;
    const gaugeStops = { High: ['#4ade80', '#14c98b'], Medium: ['#ffbb3a', '#ff7a1a'], Low: ['#e3958c', '#b9675f'] };
    const bandText = { High: 'Strong', Medium: 'Moderate', Low: 'Low' };
    const gauge = (fraction, band) => {
      const svg = svgEl('svg', { viewBox: '0 0 100 56', class: 'cx-gauge', 'aria-hidden': 'true', focusable: 'false' });
      const id = `cx-gauge-grad-${++gaugeId}`;
      const defs = svgEl('defs', {}), grad = svgEl('linearGradient', { id, x1: '0', y1: '0', x2: '1', y2: '0' });
      (gaugeStops[band] || gaugeStops.Low).forEach((color, i) => grad.append(svgEl('stop', { offset: String(i), 'stop-color': color })));
      defs.append(grad); svg.append(defs);
      svg.append(svgEl('path', { d: arcPath(0, 1), class: 'cx-gauge-track' }));
      if (fraction > 0) {
        const fill = svgEl('path', { d: arcPath(0, 1), class: 'cx-gauge-fill', pathLength: '100' });
        fill.style.setProperty('stroke', `url(#${id})`); // beats the flat band colours in CSS
        fill.style.setProperty('--fraction', String(Math.max(0.02, Math.min(1, fraction))));
        svg.append(fill);
      }
      return svg;
    };
    const tile = (label, valueText, maximum, band, svg, ariaLabel, title) => {
      const card = el('div', 'cx-tile'); card.setAttribute('role', 'listitem'); card.dataset.score = label.toLowerCase();
      if (band) card.dataset.band = band;
      const dial = el('div', 'cx-tile-dial');
      const value = el('span', 'cx-tile-value'); value.append(el('strong', '', valueText), el('small', '', maximum ? `of ${maximum}` : ''));
      dial.append(svg, value);
      card.append(dial, el('span', 'cx-tile-label', label), el('span', 'cx-tile-band', band ? bandText[band] : 'Not scored'));
      card.setAttribute('aria-label', ariaLabel); // no hover tooltip: the band and 'How to read the scores' explain it
      return card;
    };
    const bandOf = fraction => fraction >= .5 ? 'High' : fraction >= .25 ? 'Medium' : 'Low';
    const bandRule = 'Low below 25%, Moderate 25% to below 50%, Strong 50% or above';
    const scoreTile = (label, raw, maximum, hint) => {
      const scored = typeof raw === 'number' && Number.isFinite(raw);
      const fraction = scored ? Math.max(0, Math.min(1, raw / maximum)) : 0;
      const band = scored ? bandOf(fraction) : null;
      const card = tile(label, scored ? score(raw) : '–', scored ? maximum : '', band, gauge(fraction, band),
        scored ? `${label}: ${score(raw)} out of ${maximum}, ${bandText[band]}` : `${label}: not scored`,
        scored ? `${hint}. ${bandText[band]}: ${bandRule}.` : 'Not scored');
      if (!scored) card.dataset.unscored = 'true';
      return card;
    };
    // Maturity follows the same percentage rule; the stage name sits in the label.
    const maturityScored = typeof record.maturityScore === 'number' && Number.isFinite(record.maturityScore);
    const maturityFraction = maturityScored ? Math.max(0, Math.min(1, record.maturityScore / 4)) : 0;
    const maturityBand = maturityScored ? bandOf(maturityFraction) : null;
    const maturityTile = tile('Maturity', maturityScored ? String(record.maturityScore) : '–', 4, maturityBand, gauge(maturityFraction, maturityBand),
      maturityScored ? `Maturity: ${record.maturity}, ${record.maturityScore} out of 4, ${bandText[maturityBand]}. ${record.maturityExplanation || ''}` : 'Maturity: not scored',
      [record.maturityExplanation, maturityScored ? `${bandText[maturityBand]}: ${bandRule}.` : ''].filter(Boolean).join(' '));
    const tiles = [
      maturityTile,
      scoreTile('Priority', priority.priorityScore, 16, 'Viability × Feasibility, out of 16'),
      scoreTile('Viability', priority.viability, 4, 'Out of 4'),
      scoreTile('Feasibility', priority.feasibility, 4, 'Out of 4')
    ];
    const rankScored = typeof priority.rank === 'number' && Number.isFinite(priority.rank);
    const rank = byId('detail-rank');
    rank.replaceChildren(...(record.maturity ? [el('span', 'cx-rank-stage', record.maturity), el('span', 'cx-rank-dot')] : []), el('span', 'cx-rank-label', 'Rank'), el('strong', '', rankScored ? `#${score(priority.rank)}` : '–'), el('span', 'cx-rank-of', rankScored ? `of ${collectionSize}` : 'not ranked'));
    rank.setAttribute('aria-label', (record.maturity ? `${record.maturity} maturity. ` : '') + (rankScored ? `Rank ${score(priority.rank)} of ${collectionSize} ${record.collection} cases` : 'Not ranked'));
    byId('detail-score-tags').replaceChildren(...tiles);
    // Maturity chip carries a 4-segment meter of the maturity score.
    const maturityChip = byId('detail-maturity');
    const meter = el('span', 'cx-meter'); meter.setAttribute('aria-hidden', 'true');
    for (let level = 1; level <= 4; level++) meter.append(el('i', level <= (record.maturityScore || 0) ? 'is-on' : ''));
    maturityChip.replaceChildren(meter, document.createTextNode(record.maturity));
    maturityChip.setAttribute('aria-label', `Maturity: ${record.maturity}, score ${record.maturityScore} of 4`);
    byId('detail-service-group').hidden = !record.rawServiceGroup;
    text('score-guide-text', 'Each gauge fills in proportion to the score as a percentage of its maximum, and every tile uses the same colour rule: Low (grey-red) below 25%, Moderate (orange) 25% to below 50%, Strong (green) 50% or above. Maturity is out of 4. Viability and Feasibility are out of 4; Priority is their product, out of 16. These display bands summarise the existing scores; they are not recommendations. Rank is the research ordering within its collection: 1 is highest.');
    const index = filtered.findIndex(item => item.id === id);
    text('detail-index', index >= 0 ? `${index + 1} / ${filtered.length}` : '–');
    byId('case-prev').disabled = index <= 0;
    byId('case-next').disabled = index < 0 || index >= filtered.length - 1;
    const closeLabel = returnOrigin === 'index' ? 'Close and return to index' : 'Close and return to planet';
    byId('detail-close').setAttribute('aria-label', closeLabel);
    detail.hidden = false;
    inspector.hidden = false;
    if (!inspector.open) inspector.showModal();
    workspace.classList.add('is-reading');
    renderScene();
    byId('detail-scroll').scrollTop = 0;
    const scroller = byId('detail-scroll');
    if (!wasOpen) { scroller.classList.remove('cx-enter'); void scroller.offsetWidth; scroller.classList.add('cx-enter'); }
    document.querySelectorAll('[data-detail-section]').forEach(button => button.setAttribute('aria-current', String(button.dataset.detailSection === 'detail-overview')));
    byId('detail-title').focus({ preventScroll: true });
    history.replaceState(null, '', `#${record.id}`);
    stopNavigationZoom();
    const animate = !starsPaused && !reducedMotion.matches;
    if (!wasOpen) {
      // First open, one continuous move: the galaxy fades away, the planet glides out, the card follows it in.
      if (animate) {
        try { inspector.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: 'ease-out', pseudoElement: '::backdrop' }); } catch { /* ::backdrop animation unsupported: CSS fade still applies. */ }
        inspector.animate([{ opacity: 0, transform: 'translateX(40px) scale(.97)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 700, delay: 180, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      }
    } else if (animate) {
      // Next / previous: the panel stays put; only its content flips across.
      const shift = (direction || 1) * 28;
      [byId('detail-title'), byId('detail-number').parentElement, byId('detail-scroll')].forEach(node => node.animate(
        [{ opacity: 0, transform: `translateX(${shift}px)` }, { opacity: 1, transform: 'translateX(0)' }],
        { duration: 280, easing: 'cubic-bezier(.16,1,.3,1)' }));
    }
    showCardPlanet(id, animate);

  }
  // Long intro text shows three lines with an ellipsis; click (or Enter/Space) expands it.
  // Picks a fitting icon for a step from its wording.
  function stepIcon(text) {
    const t = text.toLowerCase();
    const rules = [[/phone|mobile|alert|notif|whatsapp|pushed/, 'smartphone'], [/sensor|iot|meter|telemetr|monitor/, 'radio'],
      [/machine-learning|\bml\b|model|\bai\b|predict|forecast|learn/, 'brain'], [/\bapp\b/, 'smartphone'], [/dashboard|report|kpi|portal|view/, 'layout-dashboard'],
      [/robot|autonomous|drone/, 'bot'], [/camera|vision|photo|scan|image/, 'scan-eye'], [/staff|team|technician|crew|worker|manager|people|operator/, 'users'],
      [/contract|document|invoice|bid|tender|form|record/, 'file-text'], [/schedul|route|plan|allocat|dispatch|assign/, 'route'],
      [/energy|power|hvac|bms|chiller/, 'zap'], [/repair|maint|fix|fault|work order/, 'wrench'], [/data|platform|cloud|stream/, 'database']];
    const found = rules.find(([pattern]) => pattern.test(t));
    return found ? found[1] : 'circle-dot';
  }
  function clampLead(lead) {
    lead.classList.add('is-clamped');
    requestAnimationFrame(() => {
      if (lead.scrollHeight <= lead.clientHeight + 2) { lead.classList.remove('is-clamped'); return; }
      lead.classList.add('is-expandable');
      lead.tabIndex = 0;
      lead.setAttribute('role', 'button');
      lead.setAttribute('aria-expanded', 'false');
      lead.title = 'Show full text';
      const toggle = () => {
        const expanded = lead.classList.toggle('is-clamped') === false;
        lead.setAttribute('aria-expanded', String(expanded));
        lead.title = expanded ? 'Show less' : 'Show full text';
      };
      lead.addEventListener('click', toggle);
      lead.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
    });
  }
  function stepCase(offset) {
    const index = filtered.findIndex(record => record.id === state.selectedId);
    const next = filtered[index + offset];
    if (next) openCase(next.id, null, offset);
  }
  // Full card opens as its own screen: the chosen planet glides out of the galaxy, carrying its
  // name and maturity, and the reading panel sits beside it.
  const cardPlanet = el('div', 'card-planet');
  cardPlanet.setAttribute('popover', 'manual'); cardPlanet.setAttribute('aria-hidden', 'true');
  document.body.append(cardPlanet);
  let cardPlanetId = null, cardPlanetToken = 0;
  const moonFor = id => id ? document.querySelector(`.usecase-moon[data-id="${CSS.escape(id)}"] .named-moon`) : null;
  // Planet column and card sit side by side as one centred pair; narrow screens fall back to the card alone.
  function resetCardPosition() { ['left', 'right', 'width', 'margin-left', 'margin-right', '--hero-extra'].forEach(property => inspector.style.removeProperty(property)); }
  // The card title's untransformed position on screen (its left edge and vertical centre).
  function titleBox() {
    const title = byId('detail-title');
    let x = 0, y = 0, node = title;
    while (node && node !== inspector) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
    const line = Math.min(title.offsetHeight, 40);
    return { x: inspector.offsetLeft + x, y: inspector.offsetTop + y + line / 2 };
  }
  function cardPlanetSlot() {
    resetCardPosition();
    const card = inspector.getBoundingClientRect();
    const gap = 56, edge = 40;
    const size = Math.min(260, innerHeight * .32, Math.max(0, innerWidth - card.width - gap - edge * 2 - 40));
    if (size < 140) return null;
    const column = Math.max(size + 40, 280);
    // The card spreads into the room left over beside the planet column, up to a comfortable reading width.
    // The panel sits close to the right edge of the screen; the planet column stays beside it.
    const right = 32;
    const width = Math.max(card.width, Math.min(960, innerWidth - column - gap - edge - right));
    // Planet + panel are centred as one group (on wide screens the panel stops growing, so the group stays in the middle).
    const left = Math.max(edge, (innerWidth - (column + gap + width)) / 2);
    // Arabic (right-to-left) mirrors the pair: the card on the left, the planet on the right.
    const rtl = document.documentElement.dir === 'rtl';
    const planetLeft = rtl ? left + width + gap : left, cardLeft = rtl ? left : left + column + gap;
    inspector.style.setProperty('--planet-x', `${Math.round(planetLeft + column / 2)}px`);
    Object.assign(inspector.style, { left: `${cardLeft}px`, right: 'auto', width: `${width}px`, marginLeft: '0', marginRight: '0' });
    // The planet sits level with the card title (a straight, horizontal connector). The title is pushed down a
    // little so the planet clears the top of the screen. Offsets ignore the card's entrance transform.
    // The card starts at the top; the planet sits level with its title, shrinking if needed so it stays on screen.
    // The planet sits a little below the top of the card, clear of the screen edge.
    // The planet sits in the vertical middle of the screen.
    return { left: planetLeft, column, size, rtl, y: innerHeight / 2 + 75 };
  }
  function placeCardPlanet(slot) {
    const height = slot.size + 150;
    Object.assign(cardPlanet.style, { left: `${slot.left}px`, top: `${slot.y - height / 2}px`, width: `${slot.column}px`, height: `${height}px` });
    cardPlanet.style.setProperty('--orb', `${slot.size}px`);
    cardPlanetSlotCache = { ...slot, top: slot.y - height / 2 };
    placeCardLink();
  }
  // Connector: a curve from the planet's edge (its sphere is 62.5% of the image width) to the start of the card title.
  let cardPlanetSlotCache = null;
  function placeCardLink() {
    const link = cardPlanet.querySelector('.card-curve'), slot = cardPlanetSlotCache;
    if (!link || !slot) return;
    const title = titleBox();
    // Starts on the thin orbit ring around the planet (ring radius = 46% of the planet box).
    const dir = slot.rtl ? -1 : 1;
    const a = { x: slot.left + slot.column / 2 + dir * slot.size * .46, y: slot.top + slot.size / 2 };
    // Horizontal, ending on the glowing left edge of the content area.
    const scroll = byId('detail-scroll'); let edge = 0, node = scroll;
    while (node && node !== inspector) { edge += node.offsetLeft; node = node.offsetParent; }
    // The curves meet the card's own outer edge, and the lines run along that edge.
    const bx = slot.rtl ? inspector.offsetLeft + inspector.offsetWidth + 2 : inspector.offsetLeft - 2, r = 46;
    // Hide the straight edge where the curves join, so the edge itself appears to bend out to the planet.
    let top = 0; node = scroll; while (node && node !== inspector) { top += node.offsetTop; node = node.offsetParent; }
    scroll.style.setProperty('--join-top', `${(a.y - inspector.offsetTop - top - r).toFixed(1)}px`);
    scroll.style.setProperty('--join-height', `${2 * r}px`);
    setCurve(link, a, { x: bx, y: a.y }, 'x');
    // Like a branch joining a stem: the line runs to the card and splits into two curves that flow up and down into its edge.
    const d = `M${a.x} ${a.y} L${bx - dir * r} ${a.y} Q${bx} ${a.y} ${bx} ${a.y - r} M${bx - dir * r} ${a.y} Q${bx} ${a.y} ${bx} ${a.y + r}`;
    link.querySelectorAll('path:not(.curve-tail)').forEach(path => path.setAttribute('d', d));
    const end = link.querySelector('.curve-dot.is-end'); if (end) { end.setAttribute('cx', bx - dir * r); end.setAttribute('cy', a.y); }
    // From each curve, a line runs along the card's edge (up and down) and fades out before the card's ends.
    const ns = 'http://www.w3.org/2000/svg';
    let defs = link.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(ns, 'defs');
      ['up', 'down'].forEach(dir => {
        const grad = document.createElementNS(ns, 'linearGradient'); grad.id = `curve-tail-${dir}`; grad.setAttribute('gradientUnits', 'userSpaceOnUse');
        [['0', '1'], ['1', '0']].forEach(([offset, opacity]) => { const stop = document.createElementNS(ns, 'stop'); stop.setAttribute('offset', offset); stop.style.stopColor = 'var(--page-primary-button)'; stop.setAttribute('stop-opacity', opacity); grad.append(stop); });
        defs.append(grad);
        const tail = document.createElementNS(ns, 'path'); tail.setAttribute('class', `curve-tail is-${dir}`); tail.setAttribute('pathLength', '1000'); tail.setAttribute('stroke', `url(#curve-tail-${dir})`); link.append(tail);
      });
      link.prepend(defs);
    }
    // Ripples: soft rings pulsing out from the bright dot where the connector leaves the planet.
    if (!link.querySelector('.curve-ripple')) [0, 1, 2].forEach(index => { const ring = document.createElementNS(ns, 'circle'); ring.setAttribute('class', 'curve-ripple'); ring.style.animationDelay = `${index * 0.8}s`; link.append(ring); });
    link.querySelectorAll('.curve-ripple').forEach(ring => { ring.setAttribute('cx', a.x); ring.setAttribute('cy', a.y); ring.setAttribute('r', 7); });
    const cardTop = inspector.offsetTop + 70, cardBottom = inspector.offsetTop + inspector.offsetHeight - 40;
    [['up', a.y - r, Math.max(cardTop, a.y - r - 140)], ['down', a.y + r, Math.min(cardBottom, a.y + r + 160)]].forEach(([dir, from, to]) => {
      const grad = defs.querySelector(`#curve-tail-${dir}`);
      grad.setAttribute('x1', bx); grad.setAttribute('x2', bx); grad.setAttribute('y1', from); grad.setAttribute('y2', to);
      link.querySelector(`.curve-tail.is-${dir}`).setAttribute('d', `M${bx} ${from} L${bx} ${to}`);
    });
  }
  function cardPlanetContent(source) {
    const button = source.closest('.usecase-moon');
    const orb = el('div', 'card-planet-orb');
    orb.dataset.maturity = (button?.dataset.maturity || '').toLowerCase();
    // The page glow behind the planet takes the planet's colour too.
    const tone = { established: '#f2b84b', scaling: '#e24bc0', emerging: '#3fd6c4' }[orb.dataset.maturity];
    inspector.style.setProperty('--planet-tone', tone || 'var(--page-primary-button)');
    // The connector (line, curves, edge lines, ripples) is drawn in the planet's colour.
    if (tone) cardPlanet.style.setProperty('--page-primary-button', tone); else cardPlanet.style.removeProperty('--page-primary-button');
    const image = source.cloneNode(); image.className = 'card-planet-image'; image.removeAttribute('style');
    const stage = (button?.dataset.maturity || '').toLowerCase();
    // The planet turns horizontally (right to left); Emerging keeps its ring from the still image.
    const turning = stage ? [window.FamilyAtlas.spinGlobe(`assets/planets/strip-${stage}.png`, 60, `assets/planets/surfaces/${window.FamilyAtlas.maturityDay[stage] || 'moon'}.jpg`)] : [];
    if (stage === 'emerging') orb.append(image, el('span', 'planet-ring is-back'), ...turning, el('span', 'orb-shade'), el('span', 'planet-ring is-front'));
    else orb.append(image, ...turning, el('span', 'orb-shade'));
    orb.classList.toggle('is-emerging', stage === 'emerging');
    const caption = el('div', 'card-planet-caption');
    const maturity = button?.dataset.maturity || '';
    // Title, then category, then the maturity chip at the bottom.
    caption.append(el('strong', '', button?.querySelector('.usecase-title')?.textContent || ''));
    const category = button?.querySelector('.case-category')?.textContent;
    if (category) caption.append(el('span', 'card-planet-category', category));
    if (maturity) caption.append(el('span', `card-planet-maturity is-${maturity.toLowerCase()}`, maturity));
    const link = makeCurve('card-curve');
    cardPlanet.replaceChildren(orb, caption, link);
    return { orb, caption, link };
  }
  function showCardPlanet(id, animate) {
    const token = ++cardPlanetToken;
    cardPlanet.querySelectorAll('*').forEach(node => node.getAnimations().forEach(animation => animation.cancel()));
    document.querySelectorAll('.is-lifted').forEach(node => node.classList.remove('is-lifted'));
    const source = moonFor(id), slot = cardPlanetSlot();
    if (!source || !slot) { { if (cardPlanet.matches(':popover-open')) cardPlanet.hidePopover(); cardPlanet.classList.remove('is-shown'); cardPlanet.style.setProperty('display', 'none', 'important'); } cardPlanetId = null; return; }
    const wasShown = cardPlanet.matches(':popover-open') && cardPlanetId !== null;
    const from = source.getBoundingClientRect();
    const { orb, caption, link } = cardPlanetContent(source);
    placeCardPlanet(slot);
    if (!cardPlanet.matches(':popover-open')) cardPlanet.showPopover();
    cardPlanet.classList.add('is-shown'); cardPlanet.style.removeProperty('display');
    cardPlanetId = id;
    source.classList.add('is-lifted'); source.closest('.usecase-moon')?.classList.add('is-lifted');
    if (!animate || token !== cardPlanetToken) { placeCardLink(); replayCurve(link); return; }
    const rise = [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }];
    if (wasShown) {
      orb.animate([{ opacity: 0, transform: 'scale(.82) rotate(-8deg)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
      caption.animate(rise, { duration: 320, delay: 80, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      placeCardLink(); replayCurve(link, byId('detail-title'));
      return;
    }
    const target = orb.getBoundingClientRect();
    if (from.width && from.bottom > 0 && from.top < innerHeight) {
      const dx = from.left + from.width / 2 - (target.left + target.width / 2), dy = from.top + from.height / 2 - (target.top + target.height / 2);
      orb.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${from.width / target.width})` }, { transform: 'none' }], { duration: 820, easing: 'cubic-bezier(.22,1,.36,1)' });
    } else {
      orb.animate([{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'ease-out' });
    }
    caption.animate(rise, { duration: 560, delay: 480, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    // Once the planet lands, the curve draws in and the light starts travelling to the title.
    setTimeout(() => { if (token === cardPlanetToken) { placeCardLink(); replayCurve(link, byId('detail-title')); document.body.classList.add('card-linked'); } }, 900);
  }
  function hideCardPlanet(animate) {
    document.body.classList.remove('card-linked');
    const token = ++cardPlanetToken;
    const source = moonFor(cardPlanetId);
    cardPlanetId = null;
    const finish = () => {
      if (token !== cardPlanetToken) return;
      source?.classList.remove('is-lifted');
      source?.closest('.usecase-moon')?.classList.remove('is-lifted');
      { if (cardPlanet.matches(':popover-open')) cardPlanet.hidePopover(); cardPlanet.classList.remove('is-shown'); cardPlanet.style.setProperty('display', 'none', 'important'); }
    };
    const orb = cardPlanet.querySelector('.card-planet-orb'), caption = cardPlanet.querySelector('.card-planet-caption');
    if (!cardPlanet.matches(':popover-open') || !orb) { finish(); return; }
    const from = source?.getBoundingClientRect(), box = orb.getBoundingClientRect();
    if (!animate || !from?.width || from.bottom <= 0 || from.top >= innerHeight) { finish(); return; }
    cardPlanet.querySelectorAll('*').forEach(node => node.getAnimations().forEach(animation => animation.cancel()));
    const dx = from.left + from.width / 2 - (box.left + box.width / 2), dy = from.top + from.height / 2 - (box.top + box.height / 2);
    cardPlanet.querySelectorAll('.card-planet-caption, .card-curve').forEach(node => node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }));
    orb.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${from.width / box.width})` }], { duration: 640, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' })
      .finished.then(finish, finish);
  }
  window.addEventListener('resize', () => {
    if (!cardPlanetId) return;
    const slot = cardPlanetSlot();
    if (slot) placeCardPlanet(slot); else hideCardPlanet(false);
  });
  // Closing reverses the opening: the card slips away and the background fades while the planet
  // flies home, and only then is the dialog torn down, so the galaxy never pops back in.
  let closingCase = false;
  function closeCase(restore = true) {
    if (detail.hidden || closingCase) return;
    // Programmatic closes (restore = false) are followed by a scene change, so they stay instant.
    const animate = restore && !starsPaused && !reducedMotion.matches;
    hideCardPlanet(animate && returnOrigin !== 'index');
    if (!animate) { finishCloseCase(restore); return; }
    closingCase = true;
    inspector.getAnimations().forEach(animation => animation.cancel());
    const out = [inspector.animate([{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'translateX(32px) scale(.97)', filter: 'blur(6px)' }], { duration: 340, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' })];
    try { out.push(inspector.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-in-out', fill: 'forwards', pseudoElement: '::backdrop' })); } catch { /* ::backdrop animation unsupported. */ }
    Promise.all(out.map(animation => animation.finished)).catch(() => {}).then(() => {
      closingCase = false;
      finishCloseCase(restore);
      out.forEach(animation => animation.cancel());
    });
  }
  function finishCloseCase(restore) {
    if (detail.hidden) return;
    if (cardPlanetId) hideCardPlanet(false);
    state.selectedId = null;
    detail.hidden = true;
    stopNavigationZoom();
    inspector.close();
    inspector.hidden = true;
    resetCardPosition();
    workspace.classList.remove('is-reading');
    renderScene();
    if (records.some(record => `#${record.id}` === location.hash)) history.replaceState(null, '', routeFor());
    if (restore && returnOrigin === 'index') {
      byId('browse-dialog').showModal();
      byId('browse-list').scrollTop = indexScroll;
      byId('browse-dialog').scrollTop = indexDialogScroll;
    }
    if (restore) {
      const returnList = byId(returnOrigin === 'index' ? 'browse-list' : 'solar-system');
      const fallback = [...returnList.querySelectorAll('.case-row, .usecase-moon, .case-satellite')].find(row => row.dataset.id === returnRecordId && !row.closest('[hidden], [aria-hidden="true"]'))
        || (returnOrigin === 'index' ? byId('search') : byId('active-stage'));
      const target = returnFocus?.isConnected && !returnFocus.closest('[hidden], [aria-hidden="true"]') ? returnFocus : fallback;
      if (returnOrigin !== 'index') {
        window.scrollTo({ top: returnScrollY, behavior: 'auto' });
      }
      target?.focus({ preventScroll: true });
      if (returnOrigin !== 'index' && !returnFocus) target?.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
    returnOrigin = 'scene';
    returnFocus = null;
  }
  document.addEventListener('keydown', event => {
    // ← / → step through cases while the card is open.
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !detail.hidden && !byId('browse-dialog').open && !byId('about-dialog').open && !event.target.closest('input, select, textarea, [contenteditable]')) {
      event.preventDefault(); stepCase(event.key === 'ArrowLeft' ? -1 : 1); return;
    }
    if (event.key === 'Escape' && !detail.hidden && !document.querySelector('dialog[open]')) {
      event.preventDefault();
      closeCase();
    } else if (event.key === 'Escape' && state.planet && !document.querySelector('dialog[open]')) {
      event.preventDefault();
      resetSystem();

    }
  });
  inspector.addEventListener('cancel', event => { event.preventDefault(); closeCase(); });
  // Clicking the dimmed area left of the side panel closes it.
  inspector.addEventListener('click', event => { if (event.target === inspector) { const r = inspector.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeCase(); } });
  byId('detail-close').addEventListener('click', () => closeCase());
  document.querySelectorAll('[data-detail-section]').forEach(button => {
    button.addEventListener('click', () => {
      const section = byId(button.dataset.detailSection);
      const reader = byId('detail-scroll');
      reader.scrollTo({ top: reader.scrollTop + section.getBoundingClientRect().top - reader.getBoundingClientRect().top - document.querySelector('.cx-tabs').offsetHeight - 12,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  });
  byId('detail-scroll').addEventListener('scroll', () => {
    const top = byId('detail-scroll').getBoundingClientRect().top + document.querySelector('.cx-tabs').offsetHeight + 40;
    const controls = [...document.querySelectorAll('[data-detail-section]')];
    let active = controls[0];
    controls.forEach(button => { if (byId(button.dataset.detailSection).getBoundingClientRect().top <= top) active = button; });
    const reader = byId('detail-scroll');
    if (reader.scrollTop > 0 && reader.scrollTop + reader.clientHeight >= reader.scrollHeight - 2) active = controls.at(-1);
    controls.forEach(button => button.setAttribute('aria-current', String(button === active)));
  });
  byId('case-prev').addEventListener('click', () => stepCase(-1));
  byId('case-next').addEventListener('click', () => stepCase(1));
  byId('overview-all').addEventListener('click', () => {
    resetBrowser();
    browse.collection = state.collection;
    browse.domain = state.family?.domain || 'all';
    browse.maturity = state.family ? state.maturity : 'all';
    byId('browse-collection-filter').value = browse.collection;
    byId('domain-filter').value = browse.domain;
    byId('browse-stage-filter').value = browse.maturity;
    renderBrowser();
    byId('browse-dialog').showModal();
    byId('search').focus();
  });
  byId('browse-close').addEventListener('click', () => byId('browse-dialog').close());
  byId('browse-dialog').addEventListener('close', () => {
    // Reopening the index from an inline case changes the browser's native return target.
    if (!byId('browse-dialog').open && detail.hidden) byId('overview-all').focus({ preventScroll: true });
  });
  document.querySelectorAll('[data-maturity-filter]').forEach(button => button.addEventListener('click', () => {
    if (!state.family) return;
    hidePreview();
    closeCase(false);
    state.maturity = button.dataset.maturityFilter;
    renderScene();
  }));
  byId('browse-collection-filter').addEventListener('change', event => { browse.collection = event.target.value; renderBrowser(); });
  byId('service-filter').addEventListener('change', event => { browse.groupId = event.target.value; renderBrowser(); });
  byId('browse-stage-filter').addEventListener('change', event => { browse.maturity = event.target.value; renderBrowser(); });
  byId('domain-filter').addEventListener('change', event => { browse.domain = event.target.value; renderBrowser(); });
  byId('search').addEventListener('input', event => { browse.query = event.target.value; renderBrowser(); });
  byId('reset-filters').addEventListener('click', resetBrowser);
  byId('empty-reset').addEventListener('click', () => { resetBrowser(); byId('search').focus(); });
  document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); showUniverse(); pushRoute(); byId('universe-heading').focus({ preventScroll: true }); window.scrollTo(0, 0); });
  ['about-open'].forEach(id => byId(id).addEventListener('click', () => byId('about-dialog').showModal()));
  byId('about-close').addEventListener('click', () => byId('about-dialog').close());
  function openLinkedCase() {
    const linkedRecord = records.find(record => record.id === location.hash.slice(1));
    if (!linkedRecord) return;
    state.view = 'area';
    mountFamily(families.find(family => family.id === window.FamilyAtlas.key(linkedRecord)));
    filtered = familyRecords();
    returnRecordId = linkedRecord.id;
    returnOrigin = 'scene';
    returnFocus = null;
    state.maturity = 'all';
    renderScene();
    openCase(linkedRecord.id);
  }
  window.addEventListener('hashchange', applyRoute);
  window.addEventListener('popstate', applyRoute);
  applyRoute();
})();
