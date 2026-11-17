/* PROTOTYPE: The Edit · Edition 01 as a space mission that launches into the Innovation Hub.
   Active only when the address carries ?launch (e.g. http://localhost:8000/?launch); otherwise it does nothing.
   Content is Edition 01 (the-edit-edition-01.pdf). Each story is a chapter with its business area's planet;
   "Launch" sends a rocket from the story to the same planet in the Hub. */
(() => {
  'use strict';
  if (!new URLSearchParams(location.search).has('launch')) return;
  let TARGET = 'agi', TARGET_NAME = 'Al Ghurair Investment';
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('stars-paused');
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const pad = n => String(n).padStart(2, '0');

  // A real launch palette: white and silver body lit from one side, graphite fins and nose, a white-hot to red flame.
  let rid = 0;
  const ROCKET = () => { const k = `rk${++rid}`; return `<svg viewBox="0 0 64 128" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="${k}b" x1="0" x2="1"><stop offset="0" stop-color="#9aa3ad"/><stop offset=".28" stop-color="#ffffff"/><stop offset=".55" stop-color="#eef1f4"/><stop offset="1" stop-color="#7d8792"/></linearGradient>
      <linearGradient id="${k}d" x1="0" x2="1"><stop offset="0" stop-color="#22262c"/><stop offset=".35" stop-color="#4a525c"/><stop offset="1" stop-color="#15181c"/></linearGradient>
      <linearGradient id="${k}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7d6"/><stop offset=".25" stop-color="#ffd23f"/><stop offset=".6" stop-color="#ff7a1a"/><stop offset="1" stop-color="#d62a0a" stop-opacity="0"/></linearGradient>
      <linearGradient id="${k}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#fff3b0"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></linearGradient>
      <radialGradient id="${k}w" cx=".35" cy=".35"><stop offset="0" stop-color="#d8f3ff"/><stop offset=".5" stop-color="#4fa8d8"/><stop offset="1" stop-color="#173a5a"/></radialGradient>
    </defs>
    <path class="rk-flame-outer" fill="url(#${k}f)" d="M19 94 Q32 140 45 94 Z"/><path class="rk-flame-inner" fill="url(#${k}c)" d="M25 94 Q32 120 39 94 Z"/>
    <path fill="url(#${k}d)" d="M18 64 L3 90 L3 100 L20 90 Z"/><path fill="url(#${k}d)" d="M46 64 L61 90 L61 100 L44 90 Z"/>
    <path fill="url(#${k}b)" d="M32 4 C50 22 52 52 46 94 L18 94 C12 52 14 22 32 4 Z"/>
    <path fill="url(#${k}d)" d="M32 4 C40 12 44 20 46 28 L18 28 C20 20 24 12 32 4 Z"/>
    <path fill="#c7cdd4" d="M17.6 86 L46.4 86 L46 94 L18 94 Z"/><path fill="#5b636d" d="M21 94 L43 94 L41 99 L23 99 Z"/>
    <path fill="#d33a1f" d="M15.4 60 L48.6 60 L48.4 63 L15.6 63 Z" opacity=".9"/>
    <circle fill="#3a4049" cx="32" cy="44" r="8.5"/><circle fill="url(#${k}w)" cx="32" cy="44" r="5.8"/>
    <path fill="url(#${k}d)" d="M30 72 L34 72 L34 100 L30 100 Z"/></svg>`; };

  // Where each business area lands in the Hub, and the planet that stands for it in The Edit.
  const AREAS = {
    property: { hub: 'property', name: 'Property & Hospitality', strip: 'assets/planets/solar/2k_venus_atmosphere.jpg', tint: '#e8a7d8' },
    foods: { hub: 'foods', name: 'Foods & Agriculture', strip: 'assets/planets/solar/2k_mars.jpg', tint: '#f2b36b' },
    agi: { hub: 'agi', name: 'Al Ghurair Investment', strip: 'assets/planets/solar/2k_jupiter.jpg', tint: '#ffcf6e' },
    automotive: { hub: 'automotive', name: 'Mobility & Automotive', strip: 'assets/planets/solar/2k_neptune.jpg', tint: '#8fc8ff' },
    saturn: { hub: 'agi', name: 'Saturn', strip: 'assets/planets/solar/2k_saturn.jpg', tint: '#e8d2a6' },
  };
  // Saturn's rings, painted from the ring texture (a strip running from the inner edge to the outer edge).
  function paintRings(canvas) {
    const S = 1000, g = canvas.getContext('2d'); canvas.width = S; canvas.height = S;
    const img = new Image(); img.src = 'assets/planets/solar/2k_saturn_ring_alpha.png';
    img.onload = () => {
      const tmp = document.createElement('canvas'); tmp.width = img.width; tmp.height = 1;
      const t = tmp.getContext('2d'); t.drawImage(img, 0, Math.floor(img.height / 2), img.width, 1, 0, 0, img.width, 1);
      const px = t.getImageData(0, 0, img.width, 1).data, c = S / 2, rOut = c - 2, rIn = rOut * .545, steps = 260;
      g.lineWidth = (rOut - rIn) / steps + .8;
      for (let i = 0; i < steps; i++) { const k = Math.floor(i / steps * (img.width - 1)) * 4, r = rIn + (rOut - rIn) * i / steps;
        g.strokeStyle = `rgba(${px[k]},${px[k + 1]},${px[k + 2]},${(px[k + 3] / 255 * .92).toFixed(3)})`; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke(); }
    };
  }

  // The Edit · Edition 01 · The shape of progress (17 November 2026). Public newsroom digests.
  const EDITION = { number: '01', date: '17 November 2026', title: 'The shape of progress',
    standfirst: 'A concept edition exploring ideas, expertise and stories moving us forward.',
    note: 'Concept edition prototype. Final copy and publication approval are pending.' };
  const STORIES = [
    { area: 'property', category: 'Development', type: 'Story', date: '21 September 2026', title: 'Room for life to change',
      excerpt: 'Townhouse-inspired living, rethought for a low-density apartment setting in Dubai South.',
      body: ['Al Ghurair Development introduced Tessera in September 2026, bringing townhouse-style space and privacy into an apartment setting in Dubai South. The project is designed by Portugal-based architect Manuel Aires Mateus.',
        'The announced layouts include flexible additional rooms, private terraces and practical storage. Their intent is to let homes adapt as family needs change, rather than treating every room as fixed.',
        'The announcement gives an expected completion date of 2028. This is a planned milestone, not confirmation that the development is complete.'],
      source: 'https://development.al-ghurair.com/en/news/newsdetails/al-ghurair-introduces-new-residential-concept-Tessera-bringing-townhouse-living-experience-to-apartments' },
    { area: 'foods', category: 'Foods', type: 'Story', date: '26 January 2026', title: 'The ingredients of what comes next',
      excerpt: 'A new ingredients brand and an investment in local manufacturing signal the next chapter for Al Ghurair Foods.',
      body: ['At Gulfood on 26 January 2026, Al Ghurair Foods announced PURL, an ingredients brand for food manufacturers, alongside a USD 20 million investment in a UAE meat-coating systems plant.',
        'The company described a strategy centred on higher-value ingredients, integrated manufacturing and expansion into additional markets. PURL spans ingredients including starches, sweeteners, speciality flours, oils and coating systems.',
        'These are announcements reported by the company. This digest does not independently confirm plant completion, production performance or the financial return on those investments.'],
      source: 'https://al-ghurair.com/en/newsroom-hub' },
    { area: 'agi', category: 'People', type: 'Story', date: 'January 2026', title: 'A culture built around people',
      excerpt: 'Al Ghurair reported its fourth consecutive UAE Top Employer certification in January 2026.',
      body: ['Al Ghurair announced its 2026 UAE Top Employer recognition in January, describing it as the fourth consecutive year of certification by the Top Employers Institute.',
        'The company linked the recognition to its people practices, employee development and wellbeing. It also highlighted its culture essentials: Embrace the new, Collaborate for impact and Follow through.',
        'The source reports an assessment across areas such as work environment, learning and inclusion. The recognition is presented here as a dated company announcement, rather than a new assessment of workplace performance.'],
      source: 'https://al-ghurair.com/en/newsroom-hub/newsdetail/Al%2BGhurair%2Brecognised%2Bas%2Ba%2BTop%2BEmployer%2Bin%2Bthe%2BUAE%2Bfor%2Bthe%2Bfourth%2Bconsecutive%2Byear' },
    { area: 'property', category: 'Development', type: 'Perspective', date: '5 December 2025', title: 'Design that begins with everyday life',
      excerpt: 'The thinking behind The Weave connects contemporary homes with local context, functionality and long-term use.',
      body: ['In its December 2025 perspective on The Weave, Al Ghurair Development described an approach to housing shaped around the way residents live, work and connect.',
        'The article links the project in Jumeirah Village Circle with the traditional craft of palm-frond weaving, interpreted through contemporary architecture. Australian architect Joe Adsett is credited with its design.',
        'The emphasis is on practical spaces, considered materials and neighbourhood context. These are the design intentions described in that article, not independently measured resident outcomes.'],
      source: 'https://development.al-ghurair.com/en/news/newsdetails/building-with-purpose-the-weave' },
    { area: 'automotive', category: 'Mobility', type: 'Story', date: 'February 2025', title: 'A quieter route through the city',
      excerpt: 'A February 2025 announcement connected King Long electric buses with Sharjah’s public transport ambitions.',
      body: ['In February 2025, Al Ghurair reported that King Long electric buses were operating in Sharjah in collaboration with Sharjah Roads and Transport Authority. Al Ghurair Mobility represents King Long in the UAE.',
        'The announcement described intercity and city-bus models, battery-temperature monitoring and plans for a larger electric fleet.',
        'This story reflects the position reported at that time. Planned fleet expansion is not presented as completed, and King Long is a represented manufacturer, not described here as an Al Ghurair-owned brand.'],
      source: 'https://al-ghurair.com/en/newsroom-hub' },
  ];
  const NOTES = [
    { kicker: 'From the editor · 17 November 2026', title: 'Five perspectives. One edition.', text: 'This concept edition brings together public stories about homes, food ingredients, people and mobility. Open a story for the source and its original announcement date.' },
    { kicker: 'Reading note · 17 November 2026', title: 'Go beyond the digest', text: 'Each newsroom digest links to the original company article. Read it for the full announcement, context and any forward-looking statements.' },
  ];
  // Scenes: 0 = cover, 1..5 = stories, 6 = editor's notes (mission log).
  const SCENES = [{ kind: 'cover', area: 'agi' }, ...STORIES.map((s, i) => ({ kind: 'story', story: s, n: i + 1, area: s.area })), { kind: 'notes', area: 'agi' }];
  const sceneName = s => s.kind === 'cover' ? 'Cover' : s.kind === 'notes' ? 'Editor’s notes' : s.story.title;

  function planetArt(area) {
    const a = AREAS[area], wrap = el('div', 'lp-planet');
    wrap.style.setProperty('--planet-tint', a.tint);
    const globe = el('span', 'spin-globe'); globe.setAttribute('aria-hidden', 'true');
    globe.style.setProperty('--strip', `url("${a.strip}")`); globe.style.setProperty('--spin', '160s');
    wrap.append(el('span', 'lp-planet-glow'), globe); return wrap;
  }
  // The cover: far planets of every business area drifting slowly around the big AGI planet, each with a mono label.
  const FAR = [
    { area: 'property', x: 50, y: 22, size: 8, drift: 46, depth: .6, label: 'Property & Hospitality' },
    { area: 'foods', x: 62, y: 46, size: 4.8, drift: 38, depth: .45, label: 'Foods & Agriculture' },
    { area: 'automotive', x: 84, y: 52, size: 6, drift: 52, depth: .7, label: 'Mobility & Automotive' },
    { area: 'facilities', x: 42, y: 9, size: 3.2, drift: 34, depth: .3, label: 'Facilities' },
    { area: 'healthcare', x: 72, y: 10, size: 4, drift: 42, depth: .35, label: 'Healthcare' },
  ];
  // A far spiral galaxy, painted once: a warm core, two dusty arms of tiny stars, and a soft halo.
  function paintGalaxy(canvas) {
    const S = 900, g = canvas.getContext('2d'); canvas.width = canvas.height = S; const c = S / 2;
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const gauss = () => { let u = 0; for (let i = 0; i < 4; i++) u += rnd(); return u / 2 - 1; };
    const halo = g.createRadialGradient(c, c, 0, c, c, c);
    halo.addColorStop(0, 'rgba(255,236,214,.55)'); halo.addColorStop(.06, 'rgba(236,206,255,.28)'); halo.addColorStop(.25, 'rgba(150,110,220,.10)'); halo.addColorStop(.6, 'rgba(90,60,160,.04)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = halo; g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = 'lighter';
    // arm dust: soft blobs along the spirals
    for (let i = 0; i < 1400; i++) {
      const arm = i % 2, t = Math.pow(rnd(), .7), r = 18 + t * c * .9, a = arm * Math.PI + t * 3.1 * Math.PI + gauss() * .35 * (1 - t * .4);
      const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r, rad = 6 + rnd() * 18 * (1 - t * .5);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad), warm = rnd() < .3;
      gr.addColorStop(0, warm ? 'rgba(255,200,230,.05)' : 'rgba(170,140,255,.05)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // stars along the arms and scattered in the disc
    for (let i = 0; i < 9000; i++) {
      const arm = i % 2, t = Math.pow(rnd(), .8), r = 10 + t * c * .95, spread = i % 5 === 0 ? 1.2 : .28;
      const a = arm * Math.PI + t * 3.1 * Math.PI + gauss() * spread * (1 - t * .3);
      const x = c + Math.cos(a) * r + gauss() * 6, y = c + Math.sin(a) * r + gauss() * 6, b = (1 - t) * .5 + .15 + rnd() * .3;
      g.fillStyle = rnd() < .2 ? `rgba(255,214,240,${b.toFixed(2)})` : rnd() < .5 ? `rgba(206,196,255,${b.toFixed(2)})` : `rgba(255,255,255,${b.toFixed(2)})`;
      const sz = rnd() < .04 ? 1.8 : 1; g.fillRect(x, y, sz, sz);
    }
    const core = g.createRadialGradient(c, c, 0, c, c, 70);
    core.addColorStop(0, 'rgba(255,248,236,.9)'); core.addColorStop(.3, 'rgba(255,220,200,.35)'); core.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = core; g.fillRect(c - 70, c - 70, 140, 140);
  }
  function coverArt() {
    const wrap = el('div', 'lp-cover-sky');
    const band = el('div', 'lp-milky'); wrap.append(band);
    const tilt = el('div', 'lp-galaxy'), spin = el('canvas', 'lp-galaxy-disc'); spin.setAttribute('aria-hidden', 'true'); paintGalaxy(spin); tilt.append(spin); wrap.append(tilt);
    // The Hub's planets, realistic and far away, rise over the horizon, travel slowly across the sky on wide arcs
    // and set again behind the ground on the other side. Nearer ones are bigger and move a little faster.
    const TRAVEL = [
      { area: 'agi', size: 9, height: .5, period: 210, phase: .62, depth: .8, label: 'Al Ghurair Investment' },
      { area: 'property', size: 6.4, height: .4, period: 150, phase: .25, depth: .65, label: 'Property & Hospitality' },
      { area: 'foods', size: 4.6, height: .3, period: 125, phase: .82, depth: .45, label: 'Foods & Agriculture' },
      { area: 'automotive', size: 5.4, height: .44, period: 175, phase: .02, depth: .55, label: 'Mobility & Automotive' },
      { area: 'facilities', size: 3, height: .58, period: 240, phase: .45, depth: .15, label: 'Facilities' },
      { area: 'healthcare', size: 3.4, height: .24, period: 110, phase: .55, depth: .25, label: 'Healthcare' },
      { area: 'saturn', size: 6, height: .7, period: 260, phase: .9, depth: .5, label: 'Saturn', ring: true },
    ];
    const movers = TRAVEL.map((m, i) => {
      const a = AREAS[m.area] || { strip: m.area === 'facilities' ? 'assets/planets/solar/2k_uranus.jpg' : 'assets/planets/solar/2k_moon.jpg', tint: '#c9b6f0' };
      const node = el('div', 'lp-orb'); node.style.setProperty('--size', `${m.size}vmin`); node.style.setProperty('--planet-tint', a.tint);
      const globe = el('span', 'spin-globe'); globe.style.setProperty('--strip', `url("${a.strip}")`); globe.style.setProperty('--spin', `${80 + i * 22}s`);
      node.style.setProperty('--depth', m.depth);
      if (m.depth < .3) node.classList.add('is-far');
      node.append(globe, el('span', 'lp-far-label', m.label)); wrap.append(node);
      if (m.ring) { // the ring: back half behind the planet, front half across it
        node.classList.add('has-rings');
        const backWrap = el('span', 'lp-rings is-back'), frontWrap = el('span', 'lp-rings is-front'), back = el('canvas', 'lp-ring-back'), front = el('canvas', 'lp-ring-front');
        paintRings(back); paintRings(front); backWrap.append(back); frontWrap.append(front); node.append(backWrap, frontWrap);
      }
      return { ...m, node, cur: 0 };
    });
    // One sun lights every planet: low in the upper right, just off screen, so each planet shows a lit crescent facing it.
    wrap.append(el('div', 'lp-sun'));
    const t0 = performance.now();
    let camT = 0;
    let lastT = 0;
    const frame = now => {
      if (!wrap.isConnected) return;
      const editEl = wrap.closest('.lp-edit');
      if (editEl && (editEl.hidden || editEl.classList.contains('is-gone')) || document.hidden || now - lastT < 31) { requestAnimationFrame(frame); return; }
      lastT = now;
      const W = innerWidth, H = innerHeight, horizon = H * .68, t = (now - t0) / 1000;
      const sunX = W * 1.04, sunY = H * .12;
      // the camera: a slow sway (a few pixels), plus the pointer; nearer planets move more (parallax)
      camT = reduced() ? 0 : t;
      const camX = Math.sin(camT / 23) * 14 + (parseFloat(wrap.style.getPropertyValue('--cx')) || 0) * 26, camY = Math.sin(camT / 31) * 6 + (parseFloat(wrap.style.getPropertyValue('--cy')) || 0) * 14;
      movers.forEach(m => {
        const q = ((m.phase + (reduced() ? 0 : t / m.period)) % 1), x = -.12 * W + q * 1.24 * W; // left → right, off screen at both ends
        const u = (q - .5) * 2, lift = 1 - u * u;                                                // 0 at the horizon, 1 at the top of the arc
        const r = m.size * Math.min(W, H) / 200, y = horizon + r * 1.2 - lift * (horizon - 90) * m.height * 1.6;
        const px = x - camX * m.depth, py = y - camY * m.depth;
        m.node.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -50%)`;
        // light: turn the shading so the lit side faces the sun
        const toSun = Math.atan2(sunY - py, sunX - px) * 180 / Math.PI + 90;
        m.node.style.setProperty('--light', `${toSun.toFixed(1)}deg`);
        // quieter while passing behind the text column on the left
        m.node.style.opacity = (x > W * .54 ? .45 : 1).toString();
      });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    // (the ground planet lives on the page itself, so it stays put between the cover and the chapters)
    if (!reduced()) {
      let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
      const move = e => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; if (!raf) raf = requestAnimationFrame(step); };
      const step = () => { x += (tx - x) * .06; y += (ty - y) * .06; wrap.style.setProperty('--cx', x.toFixed(4)); wrap.style.setProperty('--cy', y.toFixed(4));
        raf = (Math.abs(tx - x) + Math.abs(ty - y) > .002 && wrap.isConnected) ? requestAnimationFrame(step) : 0; };
      addEventListener('pointermove', move, { passive: true });
      new MutationObserver((_, o) => { if (!wrap.isConnected) { removeEventListener('pointermove', move); o.disconnect(); } }).observe(document.body, { childList: true, subtree: true });
    }
    return wrap;
  }
  // The mono "transmission": typed on a few letters at a time, like a message arriving.
  let typing = 0;
  function type(node, text) {
    const token = ++typing; node.textContent = '';
    if (reduced()) { node.textContent = text; return; }
    let i = 0; const tick = () => { if (token !== typing) return; i += 2; node.textContent = text.slice(0, i); if (i < text.length) setTimeout(tick, 18); };
    setTimeout(tick, 380);
  }
  function launchButton(area, label) {
    const b = el('button', 'lp-launch'); b.type = 'button'; b.dataset.area = area;
    const mini = el('span', 'lp-launch-rocket'); mini.innerHTML = ROCKET();
    b.append(mini, el('span', '', label)); return b;
  }
  const planetDot = area => { const d = el('i', 'lp-mq-dot'); d.style.setProperty('--strip', `url("${AREAS[area].strip}")`); return d; };

  function build() {
    let index = 0, busy = false;
    const edit = el('section', 'lp-edit'); edit.setAttribute('aria-label', 'Al Ghurair | The Edit, Edition 01');
    const sky = el('div', 'lp-sky');
    // We stand on a planet: its curved surface fills the bottom of the view on every page (turning slowly).
    const ground = el('div', 'lp-ground'); ground.append(el('span', 'lp-ground-surface'));
    edit.append(sky, ground, el('div', 'lp-horizon'));

    // Top: brand on the left, the mission on the right (synced with the Innovation Hub).
    const bar = el('header', 'lp-bar');
    const brand = el('button', 'lp-brand'); brand.type = 'button'; brand.setAttribute('aria-label', 'Al Ghurair | The Edit: back to the cover');
    brand.addEventListener('click', () => show(0));
    const tile = el('span', 'lp-brand-tile'), mark = el('img'); mark.src = 'assets/mark-white.svg?v=2'; mark.alt = ''; mark.width = mark.height = 22; tile.append(mark);
    const words = el('span', 'lp-brand-words'); const name = el('strong'); name.append(document.createTextNode('Al Ghurair'), el('span', 'lp-brand-sep', '|'), document.createTextNode('The Edit'));
    words.append(name, el('span', '', `Edition ${EDITION.number} · ${EDITION.date}`));
    brand.append(tile, words);
    const navTop = el('nav', 'lp-top'); navTop.setAttribute('aria-label', 'Mission');
    const missionTag = el('span', 'lp-top-item'); missionTag.append(el('i', 'lp-sq'), el('span', '', `Mission ${EDITION.number}`));
    const hubLink = el('button', 'lp-top-item lp-top-link', '🚀 Innovation Hub →'); hubLink.type = 'button';
    navTop.append(missionTag, hubLink);
    bar.append(brand, navTop);

    // A connector from the chapter planet to the story's title: the planet and the story read as one.
    const link = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); link.setAttribute('class', 'lp-link'); link.setAttribute('aria-hidden', 'true');
    const linkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path'), linkA = document.createElementNS('http://www.w3.org/2000/svg', 'circle'), linkB = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    linkA.setAttribute('r', '3'); linkB.setAttribute('r', '3.5'); link.append(linkPath, linkA, linkB);
    function placeLink(draw) {
      const tick = rail.querySelector('.lp-tick.is-on .lp-tick-label'), title = content.querySelector('.lp-title, .lp-cover-title');
      if (!tick || !title || edit.dataset.scene === 'cover' || innerWidth <= 1100) { link.classList.remove('is-on'); return; }
      // from the current chapter on the mission path (beside the planet) to the story's title
      const p = tick.getBoundingClientRect(), t = title.getBoundingClientRect(), box = edit.getBoundingClientRect();
      const x1 = p.right + 12, y1 = p.top + p.height / 2, x2 = t.left - 22, y2 = t.top + Math.min(t.height, 60) / 2;
      if (x2 - x1 < 40) { link.classList.remove('is-on'); return; }
      const mx = (x1 + x2) / 2;
      link.setAttribute('viewBox', `0 0 ${box.width.toFixed(0)} ${box.height.toFixed(0)}`);
      linkPath.setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)} C${mx.toFixed(1)} ${y1.toFixed(1)} ${mx.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
      linkA.setAttribute('cx', x1.toFixed(1)); linkA.setAttribute('cy', y1.toFixed(1)); linkB.setAttribute('cx', x2.toFixed(1)); linkB.setAttribute('cy', y2.toFixed(1));
      link.classList.add('is-on');
      if (draw && !reduced()) { const len = linkPath.getTotalLength(); linkPath.animate([{ strokeDasharray: `${len}`, strokeDashoffset: `${len}` }, { strokeDasharray: `${len}`, strokeDashoffset: '0' }], { duration: 900, delay: 350, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        linkB.animate([{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: 1150, fill: 'backwards' }); }
    }
    // Cover: the path runs exactly from the top of the text (the kicker) to its bottom (the buttons), and the pair is centred.
    function alignCover() {
      const scene = content.firstChild; if (!scene || edit.dataset.scene !== 'cover') { edit.style.removeProperty('--cover-top'); edit.style.removeProperty('--cover-h'); return; }
      edit.style.setProperty('--cover-w', `${scene.offsetWidth || 640}px`);
      // the Cover dot sits level with the kicker line, the Log dot level with the middle of the buttons
      const box = edit.getBoundingClientRect(), k = scene.querySelector('.lp-kicker').getBoundingClientRect(), a = scene.querySelector('.lp-actions').getBoundingClientRect();
      const top = k.top + k.height / 2 - box.top, h = a.top + a.height / 2 - box.top - top;
      edit.style.setProperty('--cover-top', `${top.toFixed(0)}px`); edit.style.setProperty('--cover-h', `${h.toFixed(0)}px`);
    }
    addEventListener('resize', () => { placeLink(false); alignCover(); });
    // when the path glides aside (cover → chapter), redraw the connector from its new place
    edit.addEventListener('transitionend', e => { if (e.propertyName === 'left' && e.target.classList?.contains('lp-rail')) placeLink(true); });
    const stage = el('div', 'lp-stage');
    const transmission = el('div', 'lp-transmission'); transmission.setAttribute('aria-hidden', 'true');
    const txText = el('p', 'lp-tx-text');
    transmission.append(el('i', 'lp-sq'), txText, el('span', 'lp-tx-dots', '■ ■ ■ ▸'));
    const content = el('div', 'lp-content');
    stage.append(content, transmission);

    // Right edge: the mission path, one tick per chapter, with a small rocket at the current one.
    const rail = el('nav', 'lp-rail'); rail.setAttribute('aria-label', 'Chapters');
    rail.innerHTML = '<svg viewBox="0 0 24 400" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M12 0 C4 40 20 70 12 110 C4 150 20 180 12 220 C4 260 20 290 12 330 C6 360 16 380 12 400"/></svg>';
    const ticks = SCENES.map((scene, i) => { const b = el('button', 'lp-tick'); b.type = 'button'; b.style.top = `${i / (SCENES.length - 1) * 100}%`;
      const short = i === 0 ? 'Cover' : i === SCENES.length - 1 ? 'Log' : pad(i);
      b.setAttribute('aria-label', `${i === 0 || i === SCENES.length - 1 ? '' : `Chapter ${pad(i)}: `}${sceneName(scene)}`);
      b.append(el('span', 'lp-tick-label', short)); b.addEventListener('click', () => show(i)); rail.append(b); return b; });
    const railRocket = el('span', 'lp-rail-rocket'); railRocket.innerHTML = ROCKET(); railRocket.setAttribute('aria-hidden', 'true'); rail.append(railRocket);

    // Bottom: chapters (C) on the left, previous / next on the right; the cover adds a drifting marquee of chapters.
    const foot = el('footer', 'lp-foot');
    const chaptersBtn = el('button', 'lp-chapters-btn'); chaptersBtn.type = 'button'; chaptersBtn.setAttribute('aria-haspopup', 'dialog'); chaptersBtn.setAttribute('aria-expanded', 'false');
    chaptersBtn.append(el('span', 'lp-lines', '≡'), el('span', '', 'Chapters'), el('kbd', '', 'C'));
    const prev = el('button', 'lp-step'), next = el('button', 'lp-step lp-step-next'); prev.type = next.type = 'button';
    const stepper = el('div', 'lp-steps'); stepper.append(prev, next);
    foot.append(chaptersBtn, stepper);
    const marquee = el('div', 'lp-marquee'); marquee.setAttribute('aria-hidden', 'true');
    const strip = el('div', 'lp-marquee-strip');
    const marqueeWords = [...STORIES.map(s => [s.category, s.area]), ['Progress', 'agi']];
    for (let r = 0; r < 4; r++) marqueeWords.forEach(([w, a]) => { const item = el('span', 'lp-mq'); item.append(planetDot(a), el('span', '', w)); strip.append(item); });
    marquee.append(strip);

    // Chapters panel (C).
    const panel = el('div', 'lp-panel'); panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Chapters'); panel.setAttribute('aria-modal', 'true');
    const panelInner = el('div', 'lp-panel-inner');
    const panelHead = el('div', 'lp-panel-head'), closePanel = el('button', 'lp-panel-close', '×'); closePanel.type = 'button'; closePanel.setAttribute('aria-label', 'Close chapters');
    panelHead.append(el('span', 'lp-kicker', `Inside this edition · Mission ${EDITION.number}`), closePanel);
    const list = el('ol', 'lp-list');
    SCENES.forEach((scene, i) => { if (scene.kind === 'cover') return;
      const li = el('li'), b = el('button', 'lp-list-item'); b.type = 'button';
      const textWrap = el('span', 'lp-list-text');
      if (scene.kind === 'story') textWrap.append(el('span', 'lp-list-meta', `${pad(scene.n)} · ${scene.story.category} · 1 min read`), el('strong', '', scene.story.title), el('span', 'lp-list-dest', `Lands on ${AREAS[scene.area].name}`));
      else textWrap.append(el('span', 'lp-list-meta', 'Updates'), el('strong', '', 'Editor’s notes'), el('span', 'lp-list-dest', 'Lands on the whole Innovation Hub'));
      b.append(planetDot(scene.area), textWrap); b.addEventListener('click', () => { togglePanel(false); show(i); }); li.append(b); list.append(li); });
    panelInner.append(panelHead, list); panel.append(panelInner);

    edit.append(link, bar, stage, rail, marquee, foot, panel);

    let lastFocus = null;
    // The chapters list grows out of the Chapters button, in place (and folds back into it on close).
    let panelAnim = null;
    function togglePanel(open) {
      if (open === !panel.hidden && !panelAnim) return;
      chaptersBtn.setAttribute('aria-expanded', String(open));
      const fold = () => { const b = chaptersBtn.getBoundingClientRect(), r = panelInner.getBoundingClientRect();
        return `inset(${Math.max(0, b.top - r.top - 8)}px ${Math.max(0, r.right - b.right - 12)}px ${Math.max(0, r.bottom - b.bottom - 8)}px ${Math.max(0, b.left - r.left - 12)}px round 999px)`; };
      panelAnim?.cancel(); panelAnim = null;
      if (open) {
        panel.hidden = false; lastFocus = document.activeElement;
        if (!reduced()) {
          panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
          panelAnim = panelInner.animate([{ clipPath: fold(), opacity: .4 }, { clipPath: 'inset(0 0 0 0 round 20px)', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
          panelInner.querySelectorAll('.lp-list li').forEach((li, k) => li.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 140 + k * 40, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
          panelAnim.finished.then(() => { panelAnim = null; }, () => {});
        }
        panel.querySelector('.lp-list-item')?.focus({ preventScroll: true });
      } else {
        if (reduced()) { panel.hidden = true; lastFocus?.focus?.(); return; }
        panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 340, easing: 'ease-in', fill: 'forwards' });
        panelAnim = panelInner.animate([{ clipPath: 'inset(0 0 0 0 round 20px)', opacity: 1 }, { clipPath: fold(), opacity: 0 }], { duration: 360, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
        panelAnim.finished.then(() => { panel.hidden = true; panel.getAnimations().forEach(a => a.cancel()); panelAnim?.cancel(); panelAnim = null; lastFocus?.focus?.(); }, () => {});
      }
    }
    chaptersBtn.addEventListener('click', () => togglePanel(panel.hidden));
    closePanel.addEventListener('click', () => togglePanel(false));
    panel.addEventListener('click', e => { if (e.target === panel) togglePanel(false); });

    function sceneContent(scene) {
      const box = el('div', `lp-scene lp-scene-${scene.kind}`);
      if (scene.kind === 'cover') {
        box.append(el('span', 'lp-kicker', `The Edit · Edition ${EDITION.number} · ${EDITION.date}`), el('i', 'lp-rule'));
        const h = el('h1', 'lp-cover-title'); h.append(el('span', '', 'The shape of'), el('span', '', 'progress'));
        const actions = el('div', 'lp-actions');
        const begin = el('button', 'lp-primary', 'Begin the mission →'); begin.type = 'button'; begin.addEventListener('click', () => show(1));
        actions.append(begin, launchButton('agi', 'Launch into the Hub'));
        box.append(h, el('p', 'lp-standfirst', EDITION.standfirst), actions);
      } else if (scene.kind === 'story') {
        const s = scene.story, a = AREAS[scene.area];
        box.append(el('span', 'lp-kicker', `Chapter ${pad(scene.n)} · ${s.category} · ${s.type} · ${s.date}`),
          el('h2', 'lp-title', s.title), el('p', 'lp-excerpt', s.excerpt), el('p', 'lp-meta', 'Public newsroom digest · 1 min read'));
        const body = el('div', 'lp-body'); s.body.forEach(p => body.append(el('p', '', p))); box.append(body);
        const src = el('a', 'lp-source'); src.href = s.source; src.target = '_blank'; src.rel = 'noopener noreferrer';
        src.append(el('span', '', 'Source'), el('strong', '', 'Read the original announcement ↗'));
        const dock = el('div', 'lp-dock');
        const dest = el('p', 'lp-dest'); dest.append(el('span', '', 'Destination'), el('strong', '', a.name), el('span', '', 'Technology use cases in the Innovation Hub'));
        dock.append(launchButton(scene.area, `Launch to ${a.name}`), dest);
        box.append(src, dock);
      } else {
        box.append(el('span', 'lp-kicker', 'Updates · Mission log'), el('h2', 'lp-title', 'Editor’s notes'));
        NOTES.forEach(n => { const card = el('div', 'lp-note'); card.append(el('span', 'lp-note-kicker', n.kicker), el('strong', '', n.title), el('p', '', n.text)); box.append(card); });
        const actions = el('div', 'lp-actions');
        const back = el('button', 'lp-ghost', '↑ Back to the cover'); back.type = 'button'; back.addEventListener('click', () => show(0));
        actions.append(launchButton('agi', 'Launch into the Hub'), back); box.append(actions);
      }
      return box;
    }

    function show(i, first) {
      if (i < 0 || i >= SCENES.length || (!first && (i === index || busy))) return;
      const dir = i > index ? 1 : -1; index = i; const scene = SCENES[i];
      edit.dataset.scene = scene.kind; edit.style.setProperty('--tint', AREAS[scene.area].tint);
      // planet: the old one sinks away, the new one rises (same area → the planet just stays)
      const key = scene.kind === 'cover' ? 'cover' : 'chapter';
      const old = [...sky.children], same = old.length === 1 && old[0].dataset.area === key;
      if (!same) {
        const fresh = key === 'cover' ? coverArt() : el('div', 'lp-empty-sky'); fresh.dataset.area = key; sky.append(fresh);
        if (!first && !reduced()) {
          old.forEach(n => n.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${-dir * 60}px, 40px) scale(.9)` }], { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished.then(() => n.remove(), () => n.remove()));
          fresh.animate([{ opacity: 0, transform: `translate(${dir * 80}px, 30px) scale(.92)` }, { opacity: 1, transform: 'none' }], { duration: 1100, easing: 'cubic-bezier(.22,1,.36,1)' });
        } else old.forEach(n => n.remove());
      }
      // content: out, then in
      const swap = () => {
        content.replaceChildren(sceneContent(scene)); content.scrollTop = 0;
        if (!first && !reduced()) [...content.firstChild.children].forEach((n, k) => n.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 620, delay: 60 + Math.min(k, 7) * 55, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
        content.querySelectorAll('.lp-launch').forEach(b => b.addEventListener('click', () => go(b)));
        busy = false;
        link.classList.remove('is-on'); setTimeout(() => placeLink(true), first ? 60 : 0);
        // cover: centre the path + text group using the text's real width
        if (scene.kind === 'cover') requestAnimationFrame(alignCover);
        if (scene.kind === 'cover') setTimeout(alignCover, 1100);
      };
      const current = content.firstChild;
      if (current && !first && !reduced()) { busy = true; current.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 220, easing: 'ease-in', fill: 'forwards' }).finished.then(swap, swap); }
      else swap();
      type(txText, (scene.kind === 'story' ? scene.story.excerpt : scene.kind === 'cover' ? 'Five stories. Four planets. One mission into what comes next.' : 'End of transmission. The Innovation Hub is in range.').toUpperCase());
      ticks.forEach((t, k) => { t.classList.toggle('is-on', k === i); t.classList.toggle('is-past', k < i); if (k === i) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current'); });
      railRocket.style.top = `${i / (SCENES.length - 1) * 100}%`;
      prev.hidden = i === 0; next.hidden = i === SCENES.length - 1;
      prev.textContent = i > 0 ? `← ${sceneName(SCENES[i - 1])}` : '';
      next.textContent = i < SCENES.length - 1 ? `${sceneName(SCENES[i + 1])} →` : '';
      const pan = (i - (SCENES.length - 1) / 2) * -18;
      document.querySelectorAll('#cosmic-sky, #starfield').forEach(n => { n.style.transition = 'translate 1.6s cubic-bezier(.22,1,.36,1), scale 1.6s'; n.style.translate = `${pan}px 0`; n.style.scale = '1.06'; });
    }
    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    hubLink.addEventListener('click', () => go(null, 'agi'));
    addEventListener('keydown', e => {
      if (edit.hidden || edit.classList.contains('is-gone') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.('input, textarea, select')) return;
      if (e.key === 'Escape' && !panel.hidden) { togglePanel(false); return; }
      if (e.key === 'c' || e.key === 'C') { togglePanel(panel.hidden); return; }
      if (!panel.hidden) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(index - 1); }
    });
    // The wheel also moves between chapters, once the text column has nothing left to scroll that way.
    let wheelLock = 0;
    edit.addEventListener('wheel', e => { if (!panel.hidden || Math.abs(e.deltaY) < 24 || performance.now() < wheelLock) return;
      const c = content, atEnd = c.scrollTop + c.clientHeight >= c.scrollHeight - 2, atTop = c.scrollTop <= 0;
      if (c.contains(e.target) && ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atTop))) return;
      wheelLock = performance.now() + 1200; show(index + (e.deltaY > 0 ? 1 : -1)); }, { passive: true });

    const warp = el('canvas', 'lp-warp'); warp.setAttribute('aria-hidden', 'true');
    const rocket = el('div', 'lp-rocket'); rocket.innerHTML = ROCKET(); rocket.setAttribute('aria-hidden', 'true');
    const replay = el('button', 'lp-replay', '↺ Back to The Edit'); replay.type = 'button'; replay.hidden = true;
    const say = el('p', 'sr-only'); say.setAttribute('role', 'status');
    // Camera: the chapter planet follows the pointer a little (eased), so it feels like a real object out there.
    if (!reduced()) { let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
      const step = () => { x += (tx - x) * .05; y += (ty - y) * .05; edit.style.setProperty('--px', x.toFixed(4)); edit.style.setProperty('--py', y.toFixed(4));
        raf = Math.abs(tx - x) + Math.abs(ty - y) > .002 ? requestAnimationFrame(step) : 0; };
      edit.addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; if (!raf) raf = requestAnimationFrame(step); }, { passive: true }); }
    document.body.append(warp, edit, rocket, replay, say);
    document.body.classList.add('lp-on', 'lp-reading');
    const hubTitle = document.title; document.title = 'Al Ghurair | The Edit';

    function go(button, area) {
      area = area || button.dataset.area;
      TARGET = AREAS[area].hub; TARGET_NAME = AREAS[area].name;
      document.body.classList.remove('lp-reading'); document.title = hubTitle;
      document.querySelectorAll('#cosmic-sky, #starfield').forEach(n => { n.style.translate = '0 0'; n.style.scale = '1'; });
      const mini = button?.querySelector('.lp-launch-rocket') || null;
      launch({ edit, warp, rocket, go: button, mini, fromRect: (mini || hubLink).getBoundingClientRect() });
    }
    replay.addEventListener('click', () => { replay.hidden = true; document.title = 'Al Ghurair | The Edit'; document.body.classList.add('lp-on', 'lp-reading'); edit.classList.remove('is-gone'); edit.hidden = false;
      const at = index; sky.replaceChildren(); show(at, true); content.querySelector('.lp-launch')?.focus(); });
    show(0, true);
  }

  const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const hubNode = () => TARGET === 'agi' ? document.querySelector('.universe-map .family-centre') : document.querySelector(`[data-universe="${TARGET}"]`);
  const target = () => {
    const node = TARGET === 'agi' ? hubNode()?.querySelector('.spin-globe, canvas') || hubNode() : hubNode()?.querySelector('.planet-body') || hubNode();
    if (!node) return null; const b = node.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, r: Math.max(18, b.width * (TARGET === 'agi' ? .5 : .31)) }; };

  function launch({ edit, warp, rocket, go, mini, fromRect }) {
    if (go) go.disabled = true;
    if (reduced()) { edit.classList.add('is-gone'); setTimeout(() => { edit.hidden = true; if (go) go.disabled = false; land(); }, 350); return; }
    mini?.classList.add('is-gone');
    edit.classList.add('is-gone');

    // Stars stretch past while the page drops away.
    const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2), g = warp.getContext('2d');
    warp.width = W * dpr; warp.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const streaks = Array.from({ length: 120 }, () => ({ a: Math.random() * Math.PI * 2, d: 20 + Math.random() * Math.max(W, H) * .5, v: .6 + Math.random() * 1.4, c: Math.random() < .15 ? '255,214,160' : Math.random() < .35 ? '200,180,255' : '235,242,255' }));
    const trail = [], smoke = [];
    const from = { x: fromRect.left + fromRect.width / 2, y: fromRect.top + fromRect.height / 2 };
    const t0 = performance.now(), LIFT = 950, FLY = 2000, TOTAL = LIFT + FLY;
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
        const cx = (sx + to.x) / 2 + (to.x < sx ? -1 : 1) * W * .18, cy = Math.min(sy, to.y) - H * .28;
        x = (1 - q) ** 2 * sx + 2 * (1 - q) * q * cx + q * q * to.x; y = (1 - q) ** 2 * sy + 2 * (1 - q) * q * cy + q * q * to.y;
        const dx = 2 * (1 - q) * (cx - sx) + 2 * q * (to.x - cx), dy = 2 * (1 - q) * (cy - sy) + 2 * q * (to.y - cy);
        angle = Math.atan2(dx, -dy) * 180 / Math.PI; scale = 1.2 - q * .95;
      }
      rocket.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`;
      const rad = (angle + 180) * Math.PI / 180, nx = Math.sin(rad), ny = -Math.cos(rad);
      for (let i = 0; i < 2; i++) trail.push({ x: x + nx * 30 * scale + (Math.random() - .5) * 4 * scale, y: y + ny * 30 * scale + (Math.random() - .5) * 4 * scale,
        vx: nx * (.4 + Math.random() * .6) + (Math.random() - .5) * .5, vy: ny * (.4 + Math.random() * .6) + (Math.random() - .5) * .5, s: scale, t: now, life: 900 + Math.random() * 500 });
      if (t < LIFT * .7) for (let i = 0; i < 3; i++) { const a = Math.PI * (.05 + Math.random() * .9);
        smoke.push({ x: from.x + (Math.random() - .5) * 10, y: from.y + 14, vx: Math.cos(a) * (1 + Math.random() * 2.4) * (Math.random() < .5 ? -1 : 1), vy: -Math.random() * .6, r: 6 + Math.random() * 8, t: now, life: 1400 + Math.random() * 700 }); }
      const glowR = 90 + 160 * scale, glow = g.createRadialGradient(x + nx * 34 * scale, y + ny * 34 * scale, 0, x + nx * 34 * scale, y + ny * 34 * scale, glowR);
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
      rocket.classList.remove('is-on'); edit.hidden = true; if (go) go.disabled = false; mini?.classList.remove('is-gone');
      const fade = performance.now();
      (function out(n) { const k = Math.min(1, (n - fade) / 900); g.clearRect(0, 0, W, H); g.globalAlpha = 1 - k;
        [...smoke, ...trail].forEach(p => { p.x += p.vx * .5; p.y += p.vy * .5; const r = 18 * (p.s || 1) + 6;
          const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); gr.addColorStop(0, 'rgba(170,168,170,.18)'); gr.addColorStop(1, 'rgba(170,168,170,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill(); });
        g.globalAlpha = 1;
        if (k < 1) requestAnimationFrame(out); else { g.clearRect(0, 0, W, H); warp.classList.remove('is-on'); } })(fade);
      land();
    }
    requestAnimationFrame(frame);
  }

  function land() {
    const node = hubNode(), to = target();
    const say = document.querySelector('.lp-replay + .sr-only'), replay = document.querySelector('.lp-replay');
    if (to) {
      const ring = el('span', 'lp-ring'); ring.setAttribute('aria-hidden', 'true');
      ring.style.left = `${to.x}px`; ring.style.top = `${to.y}px`; ring.style.width = ring.style.height = `${to.r * 2}px`;
      document.body.append(ring); ring.addEventListener('animationend', () => ring.remove());
    }
    if (node && node.matches('button, a, [tabindex]')) node.focus({ preventScroll: true });
    if (say) say.textContent = `Landed on ${TARGET_NAME} in the Innovation Hub.`;
    document.body.classList.remove('lp-on');
    if (replay) replay.hidden = false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(build, 300)); else setTimeout(build, 300);
})();
