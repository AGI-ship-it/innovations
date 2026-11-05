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
  const state = { collection: 'service', family: null, maturity: 'all', planet: null, selectedId: null };
  const families = window.FamilyAtlas.families(records);
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
    mountFamily(family);
    renderScene();
    byId('active-stage').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
    zoomFromPlanet(byId('solar-system'), origin, true);
  }
  // One delegated preview follows live planets without changing source records or click targets.
  const preview = el('aside', 'planet-preview');
  preview.id = 'planet-preview'; preview.setAttribute('role', 'dialog'); preview.setAttribute('aria-modal', 'false'); preview.setAttribute('aria-labelledby', 'preview-title'); preview.hidden = true;
  document.body.append(preview);
  let keyboardPreview = false;
  let previewTarget = null, previewTimer = 0, previewEpoch = 0, dismissedPreviewTarget = null, pendingPreviewTarget = null;
  const excerpt = (value, limit) => value.length > limit ? `${value.slice(0, limit).replace(/\s+\S*$/, '')}…` : value;
  function hidePreview() {
    previewEpoch++;
    pendingPreviewTarget = null;
    clearTimeout(previewTimer);
    previewTarget?.removeAttribute('aria-describedby');
    previewTarget?.setAttribute('aria-expanded', 'false');
    previewTarget = null; preview.hidden = true;
    document.body.classList.remove('planet-preview-open');
  }
  function showPreview(target) {
    clearTimeout(previewTimer);
    if (target === dismissedPreviewTarget || !detail.hidden || document.querySelector('dialog[open]')) return;
    if (previewTarget === target && !preview.hidden) return;
    hidePreview();
    const family = families.find(item => item.id === target.dataset.family);
    const record = records.find(item => item.id === target.dataset.id);
    if (!family && !record) return;
    previewTarget = target;
    const meta = el('div', 'preview-meta', family ? `${family.records.length} ${family.records.length === 1 ? 'use case' : 'use cases'} · ${['Established', 'Scaling', 'Emerging'].map(stage => [stage, family.records.filter(item => item.maturity === stage).length]).filter(([, count]) => count).map(([stage, count]) => `${count} ${stage}`).join(' · ')}` : `${record.maturity} · ${record.prioritisation.category}`);
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
    const action = setIconLabel(el('button', 'preview-open'), family ? 'Explore use cases' : 'Open the full card', 'arrow-right');
    action.addEventListener('click', () => {
      const origin = previewTarget;
      hidePreview();
      if (family) chooseFamily(family, origin);
      else { filtered = familyRecords(); openCase(record.id, origin); }
    });
    preview.append(action);
    preview.hidden = false; target.setAttribute('aria-describedby', preview.id); target.setAttribute('aria-controls', preview.id); target.setAttribute('aria-expanded', 'true');
    document.body.classList.add('planet-preview-open');
    const bounds = target.getBoundingClientRect();
    preview.style.maxHeight = '';
    const box = preview.getBoundingClientRect();
    const margin = 12;
    let left = Math.max(margin, Math.min(innerWidth - box.width - margin, bounds.left + bounds.width / 2 - box.width / 2));
    let top, placement;
    // Prefer the right side, then below, then left, then above, so the card never covers what you are reading.
    const rightFits = bounds.right + box.width + margin <= innerWidth - margin;
    const leftFits = bounds.left - box.width - margin >= margin;
    if (rightFits) {
      left = bounds.right + margin; top = Math.max(margin, Math.min(innerHeight - box.height - margin, bounds.top)); placement = 'right';
    } else if (bounds.bottom + box.height + margin <= innerHeight - margin) {
      top = bounds.bottom + margin; placement = 'below';
    } else if (leftFits) {
      left = bounds.left - box.width - margin; top = Math.max(margin, Math.min(innerHeight - box.height - margin, bounds.top)); placement = 'left';
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
      if (event.target === previewTarget && !event.shiftKey) { event.preventDefault(); action.focus({ preventScroll: true }); }
      else if (event.target === action) {
        const origin = previewTarget;
        const planets = [...document.querySelectorAll(origin.matches('.family-world') ? '.family-world' : '.usecase-moon')];
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
  serviceGroups.forEach(group => {
    const option = el('option', '', groupName(group)); option.value = group.id;
    byId('service-filter').append(option);
  });
  document.querySelectorAll('#collection-switch [data-collection]').forEach(button => {
    button.addEventListener('click', () => {
      closeCase(false); mountFamily(null);
      state.collection = button.dataset.collection;
      renderScene();
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
    const family = state.family;
    const collectionName = state.collection === 'internal' ? 'Internal' : 'Service';
    const pathTitle = family ? family.label : 'Facilities technology atlas';
    text('path-title', pathTitle);
    document.title = `Al Ghurair — ${collectionName} / ${family ? family.label : 'Technology families'}`;
    const scoped = records.filter(record => record.collection === state.collection);
    const shown = families.filter(item => item.collection === state.collection);
    document.querySelectorAll('#collection-switch button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.collection === state.collection));
      button.querySelector('span').textContent = records.filter(record => record.collection === button.dataset.collection).length;
    });
    byId('family-overview').hidden = Boolean(family);
    workspace.hidden = !family;
    byId('journey-home').querySelector('span').textContent = `${collectionName} technologies`;
    byId('journey-home').setAttribute('aria-current', family ? 'false' : 'step');
    byId('journey-cases').hidden = !family;
    byId('journey-separator').hidden = !family;
    text('journey-cases', family ? family.label : '');
    byId('journey-cases').setAttribute('aria-current', family ? 'step' : 'false');
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
      const info = byId('collection-info'); info.dataset.tooltip = summary; info.setAttribute('aria-label', summary);
    }
  }
  function resetSystem() {
    stopNavigationZoom();
    const previous = state.family?.id || previousFamily;
    closeCase(false); mountFamily(null); renderScene();
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
      // Numbered node: "STEP" on top, the number beneath; no icon.
      const stepNumber = (match[1].match(/\d+/) || [String(++stepIndex)])[0];
      const node = el('span', 'cx-step-node'); node.setAttribute('aria-hidden', 'true');
      node.append(el('small', 'cx-step-word', 'Step'), el('strong', 'cx-step-num', stepNumber));
      const body = el('div', 'cx-step-body');
      body.append(el('strong', 'cx-step-label sr-only', match[1].replace(/\s*:$/, '')), el('p', 'cx-step-copy', match[2].trim()));
      step.append(node, body);
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
      card.setAttribute('aria-label', ariaLabel); card.title = title;
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
      // First open: the floating panel glides in, scaling up and un-blurring.
      if (animate) inspector.animate([{ opacity: 0, transform: 'translateX(56px) scale(.96)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' });
    } else if (animate) {
      // Next / previous: the panel stays put; only its content flips across.
      const shift = (direction || 1) * 28;
      [byId('detail-title'), byId('detail-number').parentElement, byId('detail-scroll')].forEach(node => node.animate(
        [{ opacity: 0, transform: `translateX(${shift}px)` }, { opacity: 1, transform: 'translateX(0)' }],
        { duration: 280, easing: 'cubic-bezier(.16,1,.3,1)' }));
    }

  }
  // Long intro text shows three lines with an ellipsis; click (or Enter/Space) expands it.
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
  function closeCase(restore = true) {
    if (detail.hidden) return;
    state.selectedId = null;
    detail.hidden = true;
    stopNavigationZoom();
    inspector.close();
    inspector.hidden = true;
    workspace.classList.remove('is-reading');
    renderScene();
    if (records.some(record => `#${record.id}` === location.hash)) history.replaceState(null, '', location.pathname + location.search);
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
  inspector.addEventListener('click', event => { if (event.target === inspector) { const r = inspector.getBoundingClientRect(); if (event.clientX < r.left) closeCase(); } });
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
  byId('journey-home').addEventListener('click', resetSystem);
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
  document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); resetSystem(); window.scrollTo(0, 0); });
  ['about-open', 'source-notes-open'].forEach(id => byId(id).addEventListener('click', () => byId('about-dialog').showModal()));
  byId('about-close').addEventListener('click', () => byId('about-dialog').close());
  function openLinkedCase() {
    const linkedRecord = records.find(record => record.id === location.hash.slice(1));
    if (!linkedRecord) return;
    mountFamily(families.find(family => family.id === window.FamilyAtlas.key(linkedRecord)));
    filtered = familyRecords();
    returnRecordId = linkedRecord.id;
    returnOrigin = 'scene';
    returnFocus = null;
    state.maturity = 'all';
    renderScene();
    openCase(linkedRecord.id);
  }
  window.addEventListener('hashchange', openLinkedCase);
  renderScene();
  openLinkedCase();
})();
