/* PROTOTYPE: Tech Incubation Hub launch page (Magic Patterns design "Tech Incubation Hub · Landing Page").
   Active with ?launch (e.g. http://localhost:8000/?launch). It sits on the Innovation Hub's sky; "Launch into the Hub"
   flies the rocket into the Hub (launch.js), and Newsroom links go to the Al Ghurair Newsroom hub. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (!window.ATLAS_LANDING) return;

  const VIEW_KEY = 'tih-view';
  const NEWSROOM = 'https://al-ghurair.com/en/newsroom-hub';
  // PROTOTYPE: the Hub's Teams channel link is not known yet; replace '#' with the channel's share link.
  const TEAMS_CHANNEL = '#';
  const ext = `href="${NEWSROOM}" target="_blank" rel="noopener"`;
  /* Tabs (site architecture v4, after the website review): Discover (statement + highlights, our services, our team),
     Foresight Reports (flipbook), Tech Radar (overview), Contact us (have an idea form), then Newsroom as a link. */
  const TABS = [
    { id: 'discover', label: 'Discover' },
    { id: 'foresight', label: 'Foresight Reports' },
    { id: 'tech-radar', label: 'Tech Radar' },
    { id: 'contact', label: 'Contact us' },
  ];
  const tabHref = id => { const u = new URLSearchParams(location.search); if (id === 'discover') u.delete('tab'); else u.set('tab', id); const q = u.toString(); return q ? `?${q}` : './'; };
  // Hub figures (last updated 18 Nov 2026). Use cases come from the Atlas data, so they stay in step with the Hub.
  const useCases = () => window.RADAR_DATA?.useCases?.length || 68;
  const KPIS = {
    public: () => [['Use cases', useCases()], ['Prototypes', 3], ['Tech domains', 17], ['Businesses', 1]],
    teams: () => [['Discovering', 77], ['Validations', useCases()], ['Prototype', 3], ['Handovers', 10]], // Handovers: placeholder (was Quick wins), to confirm
  };
  /* Where we look: read from the use cases. The best-ranked use case in each service line, then the top four of
     those, so the band follows the Hub's own prioritisation. Each has a photo in assets/landing/usecases/<id>.jpg. */
  const FOCUS_PHOTOS = ['uc-40', 'uc-34', 'uc-14', 'uc-03'];
  const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const focusCases = () => {
    const best = {};
    (window.RADAR_DATA?.useCases || []).filter(u => u.collection === 'service' && u.prioritisation?.rank != null).forEach(u => {
      if (!best[u.groupId] || u.prioritisation.rank < best[u.groupId].prioritisation.rank) best[u.groupId] = u; });
    return Object.values(best).sort((a, b) => a.prioritisation.rank - b.prioritisation.rank).slice(0, 4);
  };
  const TRENDS = [
    ['Generative AI & copilots', 'Answers in seconds, not searches', true],
    ['AI/ML predictive maintenance', 'Repairs made before breakdowns'],
    ['IoT & smart buildings', 'Every site, one live view'],
    ['Building systems & HVAC', 'Energy savings, managed remotely', true],
    ['ESG & carbon tracking', 'Sustainability you can measure'],
    ['Robots, drones & wearables', 'Safer work, made faster'],
  ];
  const DOMAINS = ['Generative AI', 'AI copilots', 'Machine learning', 'Predictive maintenance', 'Computer vision', 'IoT', 'Smart buildings',
    'HVAC optimisation', 'Energy management', 'ESG & carbon tracking', 'Digital twins', 'Robotics', 'Drones', 'Wearables',
    'Process automation', 'Data platforms', 'Cybersecurity'];
  const STAGES = [
    { n: '01', name: 'Discovery', objective: 'Identify opportunities', description: 'Scan the market and the business to find problems worth solving.',
      capabilities: ['Foresight & trend scanning', 'Market research', 'Problem & opportunity framing'], outcome: 'A ranked list of opportunities' },
    { n: '02', name: 'Validation', objective: 'Prioritise what matters', description: 'Test each idea against the business case before any build starts.',
      capabilities: ['Idea design', 'Co-creation workshop', 'Idea validation & feasibility assessment'], outcome: 'Validated ideas with a clear case' },
    { n: '03', name: 'Prototyping', objective: 'Build and test', description: 'Design the future service and prove it works with real users.',
      capabilities: ['Concept & service design', 'Rapid prototyping', 'Implementation assessment'], outcome: 'A tested, scalable prototype' },
    { n: '04', name: 'Handover', objective: 'Prepare for scale', description: 'Define what delivery teams need to build it at scale.',
      capabilities: ['Business requirements definition', 'Product requirements definition', 'Delivery readiness review'], outcome: 'Requirements, ready to build at scale' },
  ];
  const CAPABILITIES = [
    ['Foresight & trend scanning', 'Discovery', 'You sense change in your market but can’t yet name the opportunity.', ['Trend brief', 'Opportunity map'], 'We scan 17 technology domains and map them to your business priorities.'],
    ['Market research', 'Discovery', 'You need evidence on customers, vendors or competitors before deciding.', ['Research report', 'Vendor landscape'], 'Desk research and interviews, summarised into decisions you can act on.'],
    ['Problem & opportunity framing', 'Discovery', 'A pain point is clear, but the problem behind it isn’t.', ['Problem statement', 'Opportunity canvas'], 'Short working sessions that turn symptoms into a problem worth solving.'],
    ['Idea design', 'Validation', 'You have a problem and want strong options to solve it.', ['Idea cards', 'Concept sketches'], 'Structured ideation with your team, then shortlisting against criteria.'],
    ['Co-creation workshop', 'Validation', 'Several teams are affected and need to agree on the way forward.', ['Workshop output', 'Shared priorities'], 'A facilitated session with the people who own and use the process.'],
    ['Idea validation & feasibility', 'Validation', 'An idea looks promising and you need to know if it will pay off.', ['Feasibility assessment', 'Business case outline'], 'We test value, viability and technical fit before any build.'],
    ['Concept & service design', 'Prototyping', 'The idea is validated and needs a clear shape.', ['Service blueprint', 'User journeys'], 'We design the end-to-end experience with real users in the loop.'],
    ['Rapid prototyping', 'Prototyping', 'You want to see it working before committing budget.', ['Working prototype', 'Test findings'], 'Short build cycles, tested with users each week.'],
    ['Implementation assessment', 'Prototyping', 'The prototype works and you need to know what scaling involves.', ['Implementation options', 'Risk register'], 'We review integration, data and operating-model needs with IT.'],
    ['Business requirements', 'Handover', 'The decision to scale is made and delivery needs a clear brief.', ['Business requirements document'], 'We translate prototype learnings into requirements the business signs off.'],
    ['Product requirements', 'Handover', 'Delivery teams are ready to plan the build.', ['Product requirements', 'Prioritised backlog'], 'We define features, acceptance criteria and release scope with delivery.'],
  ];
  const BENEFITS = [['Saves time', 'clock'], ['Cuts cost', 'coins'], ['Safer work', 'shield-check'], ['Happier customers', 'smile'], ['Lower emissions', 'leaf']];

  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('stars-paused');
  const ic = name => `<i data-lucide="${name}"></i>`;
  const paintIcons = root => window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true', focusable: 'false' }, root });

  let view = 'public', intent = 'question', capIndex = 0;
  try { const v = localStorage.getItem(VIEW_KEY); if (v === 'public' || v === 'teams') view = v; } catch {}
  // Teams start on Share an idea; Public visitors start on a question.
  const defaultIntent = () => view === 'teams' ? 'idea' : 'question';
  intent = defaultIntent();

  /* ---------- Markup ---------- */
  const segmented = (label, value, options, name) => `
    <div class="hl-seg" role="radiogroup" aria-label="${label}" data-seg="${name}">
      ${options.map(([v, l]) => `<button type="button" role="radio" data-value="${v}" aria-checked="${v === value}" tabindex="${v === value ? 0 : -1}">${l}</button>`).join('')}
    </div>`;
  const viewSwitch = () => segmented('Audience view', view, [['public', 'Public'], ['teams', 'Teams']], 'view');

  const kpis = () => `
    <p class="hl-mono hl-dim hl-kpi-label">Highlights</p>
    <dl class="hl-kpis">
      ${KPIS[view]().map(([l, v]) => `<div><dt>${l}</dt><dd><span class="hl-count" data-to="${v}" aria-label="${v}">${reduced() ? String(v).padStart(2, '0') : '00'}</span></dd></div>`).join('')}
    </dl>
    <p class="hl-mono hl-dim hl-kpi-note">T+ <time datetime="2026-11-18">18 Nov 2026</time> · last updated</p>`;

  const hero = () => `
    <section id="discover" class="hl-hero" aria-labelledby="hl-hero-title">
      <div class="hl-hero-sky" aria-hidden="true">
        <canvas class="hl-stars"></canvas>
        <img class="hl-hero-bg" src="assets/landing/hero.png" alt="">
        <div class="hl-rocket"><div class="hl-rocket-float"><img src="assets/landing/rocket.png" alt=""><span class="hl-flame"></span><span class="hl-flame hl-flame-core"></span></div></div>
        <span class="hl-scrim"></span>
      </div>
      <div class="hl-wrap hl-hero-inner">
        <div class="hl-hero-copy">
          <p class="hl-mono hl-kicker">Tech Incubation Hub</p>
          <h1 id="hl-hero-title" class="hl-display"><span class="hl-line">Turning innovative ideas</span> <span class="hl-line"><em>into</em> scalable solutions</span></h1>
          <p class="hl-lede">We discover, validate and prototype new technology across Al Ghurair’s businesses.</p>
          <div class="hl-actions">
            <a href="#about" class="lp-primary hl-btn" data-to="about">Our services ${ic('arrow-down')}</a>
            <a href="#team" class="lp-ghost hl-btn" data-to="team">Our team ${ic('arrow-down')}</a>
          </div>
        </div>
        <div class="hl-clock" data-slot="kpis">${kpis()}</div>
      </div>
    </section>`;


  /* ---------- Tech Radar page: domains, the radar, use case highlights, then Enter the Radar and the full report ---------- */
  const MATURITY = [
    ['Established', 3, 'Proven and in use. Ready to scale across the business.'],
    ['Scaling', 2, 'Working in early sites. Being rolled out more widely.'],
    ['Emerging', 1, 'Early technology. We start with a careful pilot.'],
  ];
  const radarStats = () => {
    const all = window.RADAR_DATA?.useCases || [], by = m => all.filter(u => u.maturity === m).length;
    return { cases: all.length, domains: DOMAINS.length, by };
  };

  /* The radar graphic: every use case is a dot. Rings are maturity (Established inside, Emerging outside), sectors are
     the service lines. Positions are fixed per use case, so the picture is the same on every visit. */
  const radarSvg = () => {
    const all = window.RADAR_DATA?.useCases || [], groups = (window.RADAR_DATA?.serviceGroups || []).map(g => g.id);
    const n = Math.max(groups.length, 1), band = { Established: [.14, .38], Scaling: [.44, .66], Emerging: [.72, .9] };
    const hash = t => { let h = 2166136261; for (const c of String(t)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967295; };
    const R = 200, C = 210, colour = { Established: '#62e08c', Scaling: '#f5c26b', Emerging: '#6fc6ff' };
    const dots = all.map(u => {
      const g = Math.max(0, groups.indexOf(u.groupId)), [r0, r1] = band[u.maturity] || band.Scaling;
      const a = (g + .12 + hash(u.id + 'a') * .76) / n * Math.PI * 2 - Math.PI / 2, r = (r0 + hash(u.id + 'r') * (r1 - r0)) * R;
      return `<circle cx="${(C + Math.cos(a) * r).toFixed(1)}" cy="${(C + Math.sin(a) * r).toFixed(1)}" r="4.2" fill="${colour[u.maturity] || '#fff'}"/>`;
    }).join('');
    const spokes = groups.map((_, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; return `<line x1="${C}" y1="${C}" x2="${(C + Math.cos(a) * R).toFixed(1)}" y2="${(C + Math.sin(a) * R).toFixed(1)}"/>`; }).join('');
    return `<svg viewBox="0 0 420 420" aria-hidden="true">
      <defs><radialGradient id="hl-rd2-glow"><stop offset="0" stop-color="#de0090" stop-opacity=".22"/><stop offset="1" stop-color="#de0090" stop-opacity="0"/></radialGradient>
        <linearGradient id="hl-rd2-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff7fd0" stop-opacity="0"/><stop offset="1" stop-color="#ff7fd0" stop-opacity=".28"/></linearGradient></defs>
      <circle cx="${C}" cy="${C}" r="${R}" fill="url(#hl-rd2-glow)"/>
      <g class="hl-rd2-grid">${[.41, .69, 1].map(k => `<circle cx="${C}" cy="${C}" r="${(k * R).toFixed(1)}"/>`).join('')}${spokes}</g>
      <g class="hl-rd2-sweep"><path d="M${C} ${C} L${C + R} ${C} A${R} ${R} 0 0 0 ${(C + Math.cos(-.9) * R).toFixed(1)} ${(C + Math.sin(-.9) * R).toFixed(1)} Z" fill="url(#hl-rd2-sweep)"/></g>
      <g class="hl-rd2-dots">${dots}</g>
      <circle cx="${C}" cy="${C}" r="5" fill="#fff"/>
    </svg>`;
  };
  const radarVisual = () => {
    const st = radarStats();
    return `
      <div class="hl-rd2-panel">
        <figure class="hl-rd2-scope" aria-label="${st.cases} use cases plotted by maturity: ${st.by('Established')} established, ${st.by('Scaling')} scaling, ${st.by('Emerging')} emerging">${radarSvg()}</figure>
        <div class="hl-rd2-copy">
          <p class="hl-mono hl-kicker">Edition 01 · Facilities</p>
          <h3 class="hl-rd2-title">Every use case we track, on one map.</h3>
          <p class="hl-body">Each dot is a use case. The closer to the centre, the more ready it is to use today.</p>
          <ul class="hl-rd2-legend">${MATURITY.map(([m, , t]) => `<li class="is-${m.toLowerCase()}"><span class="hl-rd2-swatch" aria-hidden="true"></span><strong>${st.by(m)}</strong><span><b>${m}</b> ${t}</span></li>`).join('')}</ul>
          <p class="hl-dim hl-rd2-note">${st.domains} tech domains · 1 of 4 business areas live</p>
        </div>
      </div>`;
  };
  const useCaseHighlights = () => `
    <div class="hl-focus" id="hl-stories">
      <div class="hl-wrap hl-focus-head">
        <h3 class="hl-h3">Use case highlights</h3>
        <div class="hl-focus-aside">
          <p class="hl-body hl-oneline">Our four <b class="hl-pink">top-ranked</b> facilities use cases, and what they have delivered.</p>
          <button type="button" class="hl-link hl-view-all" data-act="hub-dissolve">View all use cases ${ic('arrow-up-right')}</button>
        </div>
      </div>
      <ul>
        ${focusCases().map(u => `<li><a href="./#${esc(u.id)}" class="hl-focus-card" aria-label="${esc(u.title)}: see it in the Emerging Tech Radar">
          <img src="assets/landing/usecases/${FOCUS_PHOTOS.includes(u.id) ? u.id : FOCUS_PHOTOS[0]}.jpg" alt="" loading="lazy">
          <span class="hl-focus-go" aria-hidden="true">${ic('arrow-up-right')}</span>
          <span class="hl-focus-rank">#${u.prioritisation.rank} · ${esc(u.prioritisation.category)}</span>
          <strong class="hl-focus-title">${esc(u.title)}</strong>
          ${u.value ? `<span class="hl-focus-value">${esc(String(u.value).split(';')[0].trim())}</span>` : ''}
        </a></li>`).join('')}
      </ul>
    </div>`;
  const radarPage = () => `
    <section id="tech-radar" class="hl-section hl-tab-first" aria-labelledby="hl-radar-title">
      <div class="hl-wrap">
        <div class="hl-head">
          <h2 id="hl-radar-title" class="hl-h2">Emerging Tech Radar</h2>
          <p class="hl-sub">The new technology we track for Al Ghurair’s businesses: what it is, how ready it is, and where it can help.</p>
        </div>
        <div class="hl-block">
          <div class="hl-sub-head"><h3 class="hl-h3">Technology trends</h3><p class="hl-body">What we found across ${DOMAINS.length} technology domains.</p></div>
          <div class="hl-trends">
            <div class="hl-brief">
              <p class="hl-mono hl-dim">Trend brief · 2026</p>
              <p class="hl-brief-title">Proven tech today. Bold bets tomorrow.</p>
              <p class="hl-body">We scanned 17 technology domains on the Gartner Hype Cycles. Most of what we found is ready to scale now. Newer areas, such as generative AI and energy optimisation, start with careful pilots.</p>
            </div>
            <ul>
              ${TRENDS.map(([d, h, pilot]) => `<li><span class="hl-dim">${d}</span><strong>${h}</strong><span class="hl-tag ${pilot ? 'hl-tag-in-flight' : 'hl-tag-plain'}">${pilot ? 'Pilot first' : 'Scale now'}</span></li>`).join('')}
            </ul>
          </div>
          <div class="hl-domains">
            <button type="button" aria-expanded="false" aria-controls="hl-domain-list" data-act="domains">All ${DOMAINS.length} technology domains we scan ${ic('chevron-down')}</button>
            <ul id="hl-domain-list" hidden>${DOMAINS.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        </div>
        <div class="hl-block hl-rd2">${radarVisual()}</div>
      </div>
      ${useCaseHighlights()}
    </section>`;

  /* ---------- Foresight Reports: one card per report, each opens a flipbook. Start with one; add more over time. ---------- */
  const REPORTS = [
    { id: 'fm', live: true, sector: 'Facilities Management', title: 'Emerging Tech Trends in Facility Management', edition: 'Edition 01 · Nov 2026', cover: 'uc-40', pages: 12 },
    { id: 'healthcare', sector: 'Healthcare', tone: 'teal', title: 'Emerging Tech Trends in Healthcare' },
    { id: 'foods', sector: 'Foods', tone: 'green', title: 'Emerging Tech Trends in Foods' },
    { id: 'automotive', sector: 'Automotive', tone: 'blue', title: 'Emerging Tech Trends in Automotive' },
  ];
  /* Each report shows as a closed book on a stage; on hover the cover swings open onto its contents page, the same
     way the flipbook opens. */
  const bookArt = r => `
      <span class="hl-rep-stage" aria-hidden="true">
        <span class="hl-book${r.live ? '' : ' is-ghost'}${r.tone ? ` is-${r.tone}` : ''}">
          <span class="hl-book-edge"></span>
          <span class="hl-book-inside"><span class="hl-book-kick">In this report</span><b>Contents</b><i></i><i></i><i></i><i></i></span>
          <span class="hl-book-cover">
            ${r.live ? `<img src="assets/landing/usecases/${r.cover}.jpg" alt="" loading="lazy">` : ''}
            <span class="hl-book-title"><span>Foresight Report</span><b>${r.title}</b></span>
          </span>
        </span>
      </span>`;
  // Compact cards, four to a row: the book, the sector, and either "Flipbook · n pages" or "Coming soon"
  const reportCard = r => r.live ? `
    <li><button type="button" class="hl-rep is-live" data-act="report" data-report="${r.id}" aria-label="${r.title}: open the flipbook">
      ${bookArt(r)}
      <span class="hl-rep-body">
        <span class="hl-rep-sector">${r.sector}</span>
        <span class="hl-mono hl-dim">${r.edition}</span>
        <span class="hl-rep-kind">${ic('book-open')} Flipbook · ${r.pages} pages</span>
      </span>
    </button></li>` : `
    <li><div class="hl-rep is-soon${r.tone ? ` is-${r.tone}` : ''}">
      ${bookArt(r)}
      <span class="hl-rep-body">
        <span class="hl-rep-sector">${r.sector}</span>
        <span><span class="hl-tag hl-tag-in-flight">Coming soon</span></span>
      </span>
    </div></li>`;
  const foresightPage = () => `
    <section id="foresight" class="hl-section hl-tab-first" aria-labelledby="hl-fs-title">
      <div class="hl-wrap">
        <div class="hl-head">
          <h2 id="hl-fs-title" class="hl-h2">Foresight Reports</h2>
          <p class="hl-sub">What’s coming next, sector by sector. Each report looks at the emerging technology for one sector: the trends, the use cases that matter most and the views of the people who lead it. Open one to read it as a flipbook.</p>
        </div>
        <ul class="hl-reps">${REPORTS.map(reportCard).join('')}</ul>
      </div>
    </section>`;

  /* The report as a flipbook, laid out like a magazine. PROTOTYPE: the first report is still being written (emerging
     tech trends in FM, top use cases, views from Faisal and MSL). Figures and use cases come from the radar's data;
     photos are samples and every note marked "Draft" is dummy text until the team supplies its own. */
  // Foreword: Saad's title is confirmed; the text is a draft for him to edit.
  const FOREWORD = { name: 'Saad Farooq', photo: 'sample-1', role: 'Senior Vice President, Software Engineering', unit: 'Group Digital & Technology',
    lede: 'Facilities is where technology meets people every day: in the buildings we run, the sites we maintain and the customers we serve.',
    body: [
      'This first Foresight Report brings together what the Tech Incubation Hub has learned from scanning 17 technology domains and working alongside our facilities teams. It separates what is proven and ready to scale from what still needs a careful pilot.',
      'Our aim is simple: help every Al Ghurair business invest with confidence, learn from each other, and move from good ideas to working solutions faster.',
    ] };
  const PULL = { name: 'Ayesha', photo: 'sample-2', note: 'Every use case here started as a conversation with a site team. The best ideas came from the people who run our buildings.' };
  const TEAM_NOTES = [
    { name: 'Saad Farooq', photo: 'sample-1', note: 'The surprise for me was how much is already proven. Most of this is about scaling what works, not betting on the unknown.' },
    { name: 'Ayesha', photo: 'sample-2', note: 'Energy and comfort came up in almost every site visit. Expect the next pilots to start there.' },
    { name: 'Rehan', photo: 'sample-3', note: 'We kept it practical: what each technology does, how ready it is, and what it has already delivered for us.' },
  ];
  const TREND_ICON = { 'Generative AI & copilots': 'sparkles', 'AI/ML predictive maintenance': 'wrench', 'IoT & smart buildings': 'building-2',
    'Building systems & HVAC': 'thermometer', 'ESG & carbon tracking': 'leaf', 'Robots, drones & wearables': 'bot' };
  const reportPages = () => {
    const r = REPORTS[0], st = radarStats(), top = focusCases(), lead = top[0];
    const photo = u => FOCUS_PHOTOS.includes(u?.id) ? u.id : FOCUS_PHOTOS[0];
    const firstLine = t => esc(String(t || '').split(/(?<=\.)\s/)[0]);
    const draft = '<span class="hl-fb-demo">Demo content</span>';
    const demo = '<span class="hl-fb-demo">Demo content</span>';
    const voice = v => `
      <p class="hl-fb-kick">0${v.n} · A view from</p>
      <div class="hl-fb-voice">
        <span class="hl-fb-portrait" aria-hidden="true">${ic('user-round')}<small>Photo to come</small></span>
        <div><h3 class="hl-fb-h">${v.name}</h3><p class="hl-fb-role"><b>${v.role}</b>${v.unit ? `<span>${v.unit}</span>` : ''}</p></div>
      </div>
      <blockquote class="hl-fb-quote">${v.quote}</blockquote>
      <dl class="hl-fb-qa">${v.qa.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join('')}</dl>
      <p class="hl-fb-demo-note">${demo}<span>Sample text to show the layout. ${v.name}’s own words will replace it.</span></p>`;
    return [
      // 0 cover
      `<div class="hl-fb-cover2">
        <div class="hl-fb-cover2-top">
          <p class="hl-fb-cover2-kick">Foresight Report · Edition 01 · November 2026</p>
          <h2><em>Facility Management:</em> the emerging tech that is ready now, and what to watch next</h2>
          <i class="hl-fb-cover2-bar" aria-hidden="true"></i>
          <p class="hl-fb-cover2-brand"><img src="assets/mark-white.svg?v=2" alt="">Tech Incubation Hub<span>Al Ghurair</span></p>
        </div>
        <div class="hl-fb-cover2-photo"><img src="assets/landing/usecases/${r.cover}.jpg" alt=""><span>${st.domains} domains · ${st.cases} use cases · 4 views</span></div>
      </div>`,
      // 1 foreword: a note from the team
      `<p class="hl-fb-kick">Foreword</p><h3 class="hl-fb-h">Why we wrote <mark>this report</mark></h3>
        <div class="hl-fb-foreword">
          <figure class="hl-fb-fig"><img src="assets/landing/people/${FOREWORD.photo}.jpg" alt=""><figcaption>Sample photo</figcaption></figure>
          <div>
            <p class="hl-fb-p hl-fb-lede hl-fb-dropcap">${FOREWORD.lede}</p>
            ${FOREWORD.body.map(t => `<p class="hl-fb-p">${t}</p>`).join('')}
          </div>
        </div>
        <p class="hl-fb-sign"><b>${FOREWORD.name}</b><span>${FOREWORD.role}</span><span>${FOREWORD.unit} · Al Ghurair</span><span>${draft}</span></p>`,
      // 2 contents
      `<p class="hl-fb-kick">In this report</p><h3 class="hl-fb-h">Contents</h3>
        <ol class="hl-fb-toc">
          <li><span>01</span>Emerging tech trends in FM<em>3</em></li><li><span>02</span>How ready is it?<em>5</em></li>
          <li><span>03</span>Top 4 use cases<em>6</em></li><li><span>04</span>A view from Faisal<em>8</em></li>
          <li><span>05</span>A view from MSL<em>9</em></li><li><span>06</span>Notes from the Hub team<em>10</em></li></ol>
        <p class="hl-fb-pending">Demo content · the report is being written</p>`,
      // 3 trends opener: picture + at a glance
      `<figure class="hl-fb-bleed"><img src="assets/landing/usecases/uc-14.jpg" alt=""><figcaption>Sample photo</figcaption></figure>
        <p class="hl-fb-kick">01 · Trends</p><h3 class="hl-fb-h">Proven tech today. Bold bets tomorrow.</h3>
        <ul class="hl-fb-glance"><li><strong>${st.domains}</strong>domains scanned</li><li><strong>${st.cases}</strong>use cases</li><li><strong>${TRENDS.filter(t => !t[2]).length}/${TRENDS.length}</strong>trends ready to scale</li></ul>`,
      // 4 trends list
      `<p class="hl-fb-kick">01 · Trends</p><h3 class="hl-fb-h"><mark>Six trends</mark> to know</h3>
        ${(() => { const list = [...TRENDS.filter(t => !t[2]), ...TRENDS.filter(t => t[2])], now = list.filter(t => !t[2]).length;
          return `<div class="hl-fb-tsum"><div class="hl-fb-tsum-bar">${list.map(t => `<i class="${t[2] ? 'is-pilot' : 'is-now'}"></i>`).join('')}</div>
            <p><span class="is-now"><b>${now}</b> ready to scale now</span><span class="is-pilot"><b>${list.length - now}</b> to pilot first</span></p></div>
          <ol class="hl-fb-trows">${list.map(([d, h, pilot], k) => `<li class="${pilot ? 'is-pilot' : 'is-now'}">
            <span class="hl-fb-tn">${String(k + 1).padStart(2, '0')}</span>
            <span class="hl-fb-ti">${ic(TREND_ICON[d] || 'sparkles')}</span>
            <span class="hl-fb-tt"><b>${d}</b><span>${h}</span></span>
            <span class="hl-fb-ts">${pilot ? 'Pilot first' : 'Scale now'}</span>
          </li>`).join('')}</ol>`; })()}`,
      // 5 maturity + team pull quote
      `<p class="hl-fb-kick">02 · Readiness</p><h3 class="hl-fb-h"><mark>How ready</mark> is it?</h3>
        <ul class="hl-fb-stats">${MATURITY.map(([m, , t]) => `<li class="is-${m.toLowerCase()}"><strong>${st.by(m)}</strong><b>${m}</b><span>${t}</span></li>`).join('')}</ul>
        <aside class="hl-fb-pull"><img src="assets/landing/people/${PULL.photo}.jpg" alt=""><p>“${PULL.note}”<b>${PULL.name} ${draft}</b></p></aside>`,
      // 6, 7 the top 4 use cases: two to a page, each with its picture, rank, what it is and what it delivered
      ...[top.slice(0, 2), top.slice(2, 4)].map((pair, k) => `
        <p class="hl-fb-kick">03 · Top 4 use cases</p><h3 class="hl-fb-h">${k ? 'The <mark>top four</mark>, continued' : 'The <mark>top four</mark> for Facilities'}</h3>
        <div class="hl-fb-top4">${pair.map((u, n) => `<article>
          <figure><img src="assets/landing/usecases/${photo(u)}.jpg" alt=""><span>${k * 2 + n + 1}</span></figure>
          <p class="hl-fb-uc-meta">#${u.prioritisation.rank} overall · ${esc(u.prioritisation.category)} · ${esc(u.maturity)}</p>
          <h4>${esc(u.title)}</h4>
          <p class="hl-fb-uc-desc">${firstLine(u.description)}</p>
          ${u.value ? `<p class="hl-fb-uc-result">${esc(String(u.value).split(';')[0].trim())}</p>` : ''}
        </article>`).join('')}</div>`),
      // 8, 9 views
      voice({ n: 4, name: 'Faisal', role: 'Chief Digital, Technology & Global Services Officer', unit: 'Group Digital & Technology',
        quote: 'The question is no longer whether to use this technology, but where it pays back first.',
        qa: [['Where should Facilities start?', 'With what is already proven: predictive maintenance, smart building controls and a single view of every site. These pay back within a year.'],
             ['What will change in the next three years?', 'AI copilots will sit beside every technician and planner, and our buildings will report their own energy and condition in real time.']] }),
      voice({ n: 5, name: 'MSL', role: 'Placeholder', unit: '',
        quote: 'Start with the problems our site teams feel every day. The technology should follow.',
        qa: [['What makes a pilot succeed?', 'A clear owner on site, a measure agreed before we start, and a decision date. Without those, pilots drift.'],
             ['What should we watch?', 'Robots and drones for inspection, and carbon tracking that customers can see for themselves.']] }),
      // 10 notes from the team
      `<p class="hl-fb-kick">06 · Notes from the Hub team</p><h3 class="hl-fb-h">What <mark>stood out</mark> to us</h3>
        <ul class="hl-fb-notes">${TEAM_NOTES.map(n => `<li><img src="assets/landing/people/${n.photo}.jpg" alt=""><p>${n.note}<b>${n.name}</b></p></li>`).join('')}</ul>
        <p class="hl-fb-pending">Demo content · sample photos</p>`,
      // 11 back
      `<div class="hl-fb-end"><p class="hl-fb-kick">What’s next</p><h3 class="hl-fb-h">See every use case on the <mark>Tech Radar</mark></h3>
        <p class="hl-fb-p">The next Foresight Reports cover Healthcare, Foods and Automotive.</p>
        <p class="hl-fb-p">Have an idea or a question about this report? Talk to the Hub.</p>
        <div class="hl-fb-ctas"><button type="button" class="hl-fb-cta is-main" data-fb="radar">Open the Tech Radar <span aria-hidden="true">→</span></button><button type="button" class="hl-fb-cta" data-fb="contact">Contact the Hub</button><a class="hl-fb-cta" href="assets/reports/foresight-facility-management-edition-01.pdf" download>Download PDF</a></div></div>`,
    ];
  };

  /* ---------- Our team (Discover). PROTOTYPE: names from the team; roles and photos to be confirmed. ---------- */
  /* Team: the lead first, as a feature; the rest as matching compact cards. PROTOTYPE: Saad's title is confirmed;
     the intro and the other roles are placeholders (marked) until the team supplies them. */
  const TEAM = [
    { name: 'Saad Farooq', initials: 'SF', photo: 'sample-1', lead: true, role: 'SVP, Software Engineering' },
    { name: 'Ayesha', initials: 'A', photo: 'sample-2' },
    { name: 'Rehan', initials: 'R', photo: 'sample-3' },
    { name: 'Amir Barsoum', initials: 'AB', photo: 'sample-4' },
  ];
  // "Have an idea?" closes Discover, after the team: a card for Al Ghurair teams, a line for everyone else
  const ideaCta = () => view === 'teams' ? `
          <div class="hl-card hl-idea">
            <div><p class="hl-h3">Have an idea?</p><p class="hl-body">Tell us the problem. We’ll take it from Discovery.</p></div>
            <button type="button" class="lp-primary hl-btn" data-act="idea">Share your idea ${ic('arrow-down')}</button>
          </div>`
        : `<p class="hl-body hl-more">Want to work with the Hub? <a href="#contact" class="hl-link" data-to="contact">Contact us ${ic('arrow-right')}</a></p>`;
  const team = () => `
    <div class="hl-wrap">
      <div class="hl-head">
        <p class="hl-mono hl-kicker">About the Hub</p>
        <h2 id="hl-team-title" class="hl-h2">Our team</h2>
        <p class="hl-sub">The people behind the Hub. Talk to any of us about an idea.</p>
      </div>
      <ul class="hl-team2">
        ${TEAM.map(m => `<li class="hl-tm${m.lead ? ' is-lead' : ''}">
          <span class="hl-tm-photo" aria-hidden="true">${m.photo ? `<img src="assets/landing/people/${m.photo}.jpg" alt="" loading="lazy"><small>Sample photo</small>` : `<b>${m.initials}</b><small>Photo to come</small>`}</span>
          <div class="hl-tm-body">
            <strong>${m.name}</strong>
            <span class="hl-tm-role">${m.role || 'Placeholder'}</span>
          </div>
        </li>`).join('')}
      </ul>
      <div class="hl-team-cta" data-slot="idea-cta">${ideaCta()}</div>
    </div>`;

  const about = () => {
    const compact = view === 'teams';
    return `
      <div class="hl-wrap">
        <div class="hl-head">
          <p class="hl-mono hl-kicker">About the Hub</p>
          <h2 id="hl-about-title" class="hl-h2">Our services</h2>
          <p class="hl-sub">A structured, four-stage process takes every idea from insight to a scalable prototype, ready for delivery.</p>
        </div>
        <ol class="hl-stages">
          ${STAGES.map((s, i) => `<li>
            <div class="hl-stage-bar" data-arrow="${i === 0 ? 'first' : i === STAGES.length - 1 ? 'last' : 'mid'}"><span class="hl-mono hl-dim">${s.n}</span><strong>${s.name}</strong></div>
            <p class="hl-stage-obj">${s.objective}</p>
            ${compact ? '' : `<p class="hl-body">${s.description}</p>
              <ul class="hl-caps">${s.capabilities.map(c => `<li>${c}</li>`).join('')}</ul>
              <p class="hl-outcome"><span class="hl-mono hl-dim">Outcome</span> ${s.outcome}</p>`}
          </li>`).join('')}
        </ol>
        ${compact ? capExplorer() : ''}
      </div>`;
  };

  /* Capabilities in detail: an accordion, grouped by stage. One item is open at a time; each opens in place. */
  const capDetail = i => {
    const [, , when, deliverables, approach] = CAPABILITIES[i];
    return `<dl class="hl-cap-grid">
        <div><dt>When to engage</dt><dd>${when}</dd></div>
        <div><dt>Deliverables</dt><dd><ul>${deliverables.map(d => `<li>${d}</li>`).join('')}</ul></dd></div>
        <div><dt>Approach</dt><dd>${approach}</dd></div>
      </dl>`;
  };
  const capExplorer = () => `
    <div class="hl-block">
      <div class="hl-block-head"><h3>Capabilities in detail</h3><span class="hl-mono hl-dim">${CAPABILITIES.length} capabilities</span></div>
      <div class="hl-acc">
        ${STAGES.map(st => `<section class="hl-acc-group" aria-label="${st.name}">
          <p class="hl-acc-stage"><span class="hl-mono hl-dim">${st.n}</span> ${st.name}</p>
          <div class="hl-acc-items">
            ${CAPABILITIES.map((c, i) => [c, i]).filter(([c]) => c[1] === st.name).map(([c, i]) => `
            <div class="hl-acc-item${i === capIndex ? ' is-open' : ''}">
              <h4><button type="button" class="hl-acc-btn" id="hl-acc-b-${i}" aria-expanded="${i === capIndex}" aria-controls="hl-acc-p-${i}" data-acc="${i}">
                <span>${c[0]}</span><span class="hl-acc-icon" aria-hidden="true">${ic('plus')}</span></button></h4>
              <div class="hl-acc-panel" id="hl-acc-p-${i}" role="region" aria-labelledby="hl-acc-b-${i}"><div class="hl-acc-inner">${capDetail(i)}</div></div>
            </div>`).join('')}
          </div>
        </section>`).join('')}
      </div>
    </div>`;

  // Required fields carry a pink asterisk; screen readers already hear "required" from aria-required on the control.
  const REQ = '<span class="hl-req" aria-hidden="true">*</span>';
  const field = (label, id, control, { optional, error, aside } = {}) => `
    <div class="hl-field" data-field="${id}">
      <div class="hl-field-head"><label for="hl-${id}">${label}${control.includes('data-required') ? REQ : ''}${optional ? ' <span class="hl-dim">optional</span>' : ''}</label>${aside ? `<span class="hl-dim">${aside}</span>` : ''}</div>
      ${control}
      ${error ? `<p class="hl-error" id="hl-${id}-error" hidden>${error}</p>` : ''}
    </div>`;
  // One of the four idea questions: a numbered step on a rail (it turns into a tick once answered), and one box holding the label and the answer.
  const question = (n, label, hint, id, error) => `
    <div class="hl-field hl-q" data-field="${id}">
      <span class="hl-q-n" aria-hidden="true"><b>${n}</b>${ic('check')}</span>
      <div class="hl-q-box">
        <label for="hl-${id}" class="hl-q-label">${label}${REQ}</label>
        <textarea id="hl-${id}" name="${id}" rows="2" data-required aria-required="true" placeholder="${hint}"></textarea>
      </div>
      <p class="hl-error" id="hl-${id}-error" hidden>${error}</p>
    </div>`;
  const input = (id, attrs = '') => `<input id="hl-${id}" name="${id}" ${attrs}>`;
  const textarea = (id, attrs = '') => `<textarea id="hl-${id}" name="${id}" ${attrs}></textarea>`;
  const select = (id, options, attrs = '') => `<span class="hl-select"><select id="hl-${id}" name="${id}" ${attrs}>${options}</select>${ic('chevron-down')}</span>`;
  const opts = list => list.map(o => Array.isArray(o) ? `<option value="${o[0]}"${o[2] ? ' selected' : ''}${o[3] ? ' disabled' : ''}>${o[1]}</option>` : `<option>${o}</option>`).join('');

  const publicFields = () => {
    const idea = intent === 'idea';
    return `
      <div class="hl-grid2">
        ${field('I am a', 'iam', select('iam', opts([['', 'Choose one', true, true], 'Technology vendor', 'Startup', 'Partner', 'Researcher', 'Investor', 'Media']), 'data-required aria-required="true"'), { error: 'Choose who you are.' })}
        ${field('Area of interest', 'area', select('area', opts([['question', 'Ask a question', !idea], ['idea', 'Propose a solution or idea', idea], ['partnership', 'Partnership'], ['media', 'Media enquiry']]), 'data-intent'))}
      </div>
      ${field('Al Ghurair business it relates to', 'biz', select('biz', opts([['group', 'Not sure / Group-wide', true], 'Foods', 'Properties', 'Construction', 'Resources', 'Energy'])), { optional: true })}
      <div class="hl-grid2">
        ${field('Full name', 'name', input('name', 'autocomplete="name" data-required aria-required="true"'), { error: 'Enter your full name.' })}
        ${field('Work email', 'email', input('email', 'type="email" autocomplete="email" data-required aria-required="true"'), { error: 'Enter a work email, like name@company.com.' })}
        ${field('Company or institution', 'company', input('company', 'autocomplete="organization"'))}
        ${field('Mobile', 'mobile', `<span class="hl-phone"><span dir="ltr">+971</span>${input('mobile', 'type="tel" dir="ltr" placeholder="50 123 4567" autocomplete="tel-national"')}</span>`, { optional: true })}
      </div>
      ${field(idea ? 'Describe your solution or idea' : 'Message', 'msg',
        textarea('msg', `rows="3" maxlength="500" data-required aria-required="true" placeholder="${idea ? 'What does it do, and which problem does it solve?' : 'Tell us what you would like to discuss.'}"`),
        { error: idea ? 'Describe your idea in a few lines.' : 'Write a short message.', aside: '<span aria-live="polite" data-counter>0 / 500</span>' })}
      <div class="hl-field" data-field="consent">
        <label class="hl-check"><input type="checkbox" id="hl-consent" name="consent" value="yes" data-required aria-required="true"><span class="hl-box">${ic('check')}</span><span>I agree that Al Ghurair may use my details to respond to this enquiry.${REQ}</span></label>
        <p class="hl-error" id="hl-consent-error" hidden>Tick the box so we can reply to you.</p>
      </div>`;
  };

  const teamsFields = () => {
    const idea = intent === 'idea';
    return `
      <p class="hl-sawa">${ic('shield-check')} Your SAWA profile fills in your name, business and team once you are signed in.</p>
      ${segmented('What would you like to do?', intent, [['idea', 'Share an idea'], ['question', 'Ask a question']], 'intent')}
      ${!idea ? `
        ${field('Topic', 'topic', select('topic', opts([['process', 'How the Hub process works', true], 'A technology domain', 'An existing use case', 'Something else'])))}
        ${field('Your question', 'question', textarea('question', 'rows="4" data-required aria-required="true"'), { error: 'Write your question.' })}`
      : `
        <div class="hl-grid2 hl-q-top">
          ${field('Idea title', 'title', input('title', 'data-required aria-required="true" placeholder="e.g. Predict lift faults"'), { error: 'Give your idea a short title.' })}
          ${field('Area it affects', 'affects', select('affects', opts([['ops', 'Operations', true], 'Customer experience', 'Finance', 'People', 'Sustainability'])))}
        </div>
        <div class="hl-q-group">
          <p class="hl-q-legend">Describe your idea <span>A sentence or two for each is enough. Write it as you would explain it to a colleague.</span></p>
          ${question(1, 'What’s the problem?', 'e.g. We re-key the same claim data into three systems, which adds two days to every approval.', 'problem', 'Describe the problem you see.')}
          ${question(2, 'Who has this problem?', 'e.g. Claims processors in four business units, about 40,000 claims a month.', 'customer', 'Say who has this problem.')}
          ${question(3, 'What’s your idea?', 'e.g. A tool that reads the form once and fills in all three systems.', 'idea', 'Describe your idea.')}
          ${question(4, 'What would change if it works?', 'e.g. Approvals take 4 hours instead of 2 days.', 'value', 'Say what would change if it works.')}
        </div>
        <fieldset class="hl-benefits"><legend>Type of value <span class="hl-dim">optional · choose any that apply</span></legend>
          <div class="hl-tiles">${BENEFITS.map(([b, icon]) => `<label class="hl-tile-opt"><input type="checkbox" name="benefit" value="${b}"><span class="hl-tile-box"><span class="hl-tile-tick">${ic('check')}</span>${ic(icon)}<span class="hl-tile-label">${b}</span></span></label>`).join('')}</div>
        </fieldset>
        ${field('Attachment', 'file', `<label class="hl-file" for="hl-file">${ic('paperclip')} <span data-file-label>Add a file <span class="hl-dim">· up to 10 MB</span></span><input id="hl-file" name="file" type="file"></label>`, { optional: true })}`}`;
  };


  /* How ideas are evaluated (from the Innovation Studio triage): seven perspectives react to each idea, five factors are
     scored and multiplied, and the score suggests Build, Pilot or Stop. The Hub team makes the final call.
     PROTOTYPE: the score bands (42 and 20) come from the Studio draft and still need to be confirmed. */
  const PERSPECTIVES = [
    ['briefcase-business', 'CEO', 'Would I sponsor this?'],
    ['coins', 'IT Business Partner', 'Economics, return and hidden costs'],
    ['users-round', 'Customer', 'Would people really use it?'],
    ['cpu', 'Technology', 'Can we build it on what we have?'],
    ['scale', 'Risk', 'Compliance and operational risk'],
    ['swords', 'Challenger', 'Tries to kill the idea'],
    ['rocket', 'Venture', 'Finds ways to scale it'],
  ];
  const FACTORS = [
    ['Desirability', 'Customer'], ['Feasibility', 'Technology'], ['Financial value', 'IT Business Partner'],
    ['Strategic fit', 'CEO and Venture'], ['Speed to value', 'Risk and Challenger'],
  ];
  const OUTCOMES = [
    ['build', 'circle-check', 'Build', 'Score 42 or more', 'Moves to a Circle Session with a sponsor.'],
    ['pilot', 'flask-conical', 'Pilot', 'Score 20 to 41', 'A time-boxed test to gather evidence before we commit capacity.'],
    ['stop', 'octagon-x', 'Stop', 'Score under 20', 'Closed, and what we learned is published so no one repeats it.'],
  ];
  const evaluate = () => `
    <div class="hl-wrap hl-eval" aria-labelledby="hl-eval-title">
      <div class="hl-eval-head">
        <p class="hl-mono hl-kicker">How we evaluate ideas</p>
        <h3 id="hl-eval-title" class="hl-h3">Seven perspectives. Five factors. One decision.</h3>
        <p class="hl-body hl-dim">Every idea is reviewed from seven points of view, each reacting independently in its own voice.</p>
      </div>
      <ul class="hl-eval-people">${PERSPECTIVES.map(([icon, name, role]) => `
        <li><span class="hl-eval-icon" aria-hidden="true">${ic(icon)}</span><strong>${name}</strong><span>${role}</span></li>`).join('')}
      </ul>
      <div class="hl-eval-score">
        <div>
          <p class="hl-mono hl-dim">Innovation score</p>
          <p class="hl-eval-formula">Desirability × Feasibility × Financial value × Strategic fit × Speed to value</p>
          <p class="hl-body hl-dim">The five factors multiply, so one weak factor pulls the whole score down.</p>
        </div>
        <ol class="hl-eval-factors">${FACTORS.map(([f, from]) => `<li><strong>${f}</strong><span>${from}</span></li>`).join('')}</ol>
      </div>
      <ul class="hl-eval-outcomes">${OUTCOMES.map(([cls, icon, name, band, text]) => `
        <li class="is-${cls}"><span class="hl-eval-o-head">${ic(icon)}<strong>${name}</strong><span class="hl-mono">${band}</span></span><p>${text}</p></li>`).join('')}
      </ul>
      <p class="hl-eval-note"><span class="hl-wn-draft">To confirm</span> The score suggests an outcome; the Hub team makes the decision after triage and tells you in Teams.</p>
    </div>`;
  // The same content as a pop-up, opened from the line under "Submit idea"
  const evalDialog = () => `
    <div class="hl-evd-head">
      <div><p class="hl-mono hl-kicker">How we evaluate ideas</p>
        <h2 id="hl-evd-title" class="hl-h3">Seven perspectives. Five factors. One decision.</h2></div>
      <button type="button" class="hl-square hl-evd-close" data-evd-close aria-label="Close">${ic('x')}</button>
    </div>
    <p class="hl-body hl-dim">Every idea is reviewed from seven points of view, each reacting independently in its own voice.</p>
    <ul class="hl-evd-people">${PERSPECTIVES.map(([icon, name, role]) => `
      <li><span class="hl-eval-icon" aria-hidden="true">${ic(icon)}</span><span><strong>${name}</strong><span>${role}</span></span></li>`).join('')}
    </ul>
    <div class="hl-evd-score">
      <p class="hl-mono hl-dim">Innovation score</p>
      <p class="hl-eval-formula">Desirability × Feasibility × Financial value × Strategic fit × Speed to value</p>
      <p class="hl-body hl-dim">The five factors multiply, so one weak factor pulls the whole score down.</p>
    </div>
    <ul class="hl-eval-outcomes">${OUTCOMES.map(([cls, icon, name, band, text]) => `
      <li class="is-${cls}"><span class="hl-eval-o-head">${ic(icon)}<strong>${name}</strong><span class="hl-mono">${band}</span></span><p>${text}</p></li>`).join('')}
    </ul>
    <p class="hl-eval-note"><span class="hl-wn-draft">To confirm</span> The score suggests an outcome; the Hub team makes the decision after triage and tells you in Teams.</p>`;
  const contact = () => {
    const teams = view === 'teams';
    return `
      <div class="hl-wrap hl-contact">
        <div>
          <p class="hl-mono hl-kicker">${teams ? 'For Al Ghurair teams' : 'For partners, startups and media'}</p>
          <h2 id="hl-contact-title" class="hl-h2">${teams ? 'Bring us a question or an idea.' : 'Have a question or an idea?'}</h2>
          <p class="hl-lede">${teams ? 'Tell us what you’re seeing, and we’ll reply within five working days.'
            : 'Share your enquiry below and the Hub team will respond. Technology partners, startups and researchers welcome.'}</p>
          ${teams ? `<p class="hl-eval-line is-aside">${ic('scan-search')}<span>Every idea is reviewed from seven perspectives and scored on five factors.</span>
            <button type="button" class="hl-eval-link" data-act="eval-open" aria-haspopup="dialog">How we evaluate ideas ${ic('arrow-up-right')}</button></p>` : ''}
        </div>
        <div class="hl-card hl-form-card" data-slot="form">${form()}</div>
      </div>`; // "How we evaluate ideas" (evaluate()) is hidden for now; add ${teams ? evaluate() : ''} here to show it.
  };
  const form = () => `
    <form class="hl-form" novalidate>
      <p class="hl-alert" role="alert" hidden>Some required fields are empty. Fill in the fields marked below, then send again.</p>
      ${view === 'teams' ? teamsFields() : publicFields()}
      <div><button type="submit" class="lp-primary hl-btn">${intent === 'idea' ? 'Submit idea' : view === 'teams' ? 'Send question' : 'Send message'} ${ic('arrow-right')}</button></div>
      ${view === 'teams' ? `<p class="hl-teams-note">For updates and sessions, <a href="${TEAMS_CHANNEL}" target="_blank" rel="noopener">join the Hub channel on Teams ${ic('arrow-up-right')}</a></p>` : ''}
    </form>`;
  const thanks = () => {
    const idea = view === 'teams' && intent === 'idea';
    return `<div class="hl-thanks" role="status" tabindex="-1">
      <span class="hl-thanks-icon">${ic('check')}</span>
      <p class="hl-h3">${idea ? 'Your idea is on the pad.' : 'Thank you. We’ve got it.'}</p>
      <p class="hl-body">${idea ? 'The Hub team triages new ideas every week from seven perspectives. You’ll hear the outcome, Build, Pilot or Stop, in Teams.'
        : 'Someone from the Hub will reply to your email within five working days.'}</p>
      <button type="button" class="lp-ghost hl-btn" data-act="again">Send another</button>
    </div>`;
  };

  const footer = () => `
    <footer class="hl-footer">
      <div class="hl-wrap">
        <div class="hl-footer-grid">
          <div class="hl-footer-brand">
            <p class="hl-footer-name"><span class="hl-tile"><img src="assets/mark-white.svg?v=2" alt="" width="22" height="22"></span>Tech Incubation Hub</p>
            <p class="hl-footer-tag">In pursuit of better.</p>
            <div class="hl-actions">
              <a href="#contact" class="lp-ghost hl-btn" data-to="contact">Contact the Hub</a>
            </div>
          </div>
          <div><p class="hl-small-title">Read</p><ul>
            <li><a href="${tabHref('foresight')}" data-tab="foresight">Foresight Reports</a></li>
            <li><a href="${tabHref('tech-radar')}" data-tab="tech-radar">Tech Radar</a></li>
            <li><a ${ext}>Newsroom ${ic('arrow-up-right')}</a></li></ul></div>
          <div><p class="hl-small-title">The Hub</p><ul>
            <li><a href="#about" data-to="about">Our services</a></li>
            <li><a href="#team" data-to="team">Our team</a></li>
            <li><button type="button" data-act="idea">Share an idea</button></li>
</ul></div>
        </div>
        <div class="hl-footer-base">
          <p>© 2026 Al Ghurair · Tech Incubation Hub</p>
        </div>
      </div>
    </footer>`;

  /* ---------- Build ---------- */
  let tab = TABS.some(t => t.id === params.get('tab')) ? params.get('tab') : 'discover';
  function build() {
    const page = document.createElement('div');
    page.className = 'hl-page';
    page.setAttribute('role', 'region');
    page.setAttribute('aria-label', 'Al Ghurair Tech Incubation Hub');
    page.innerHTML = `
      <header class="hl-bar">
        <div class="hl-bar-inner">
          <a href="#discover" class="hl-brand" data-to="discover" aria-label="Al Ghurair Tech Incubation Hub, top of page">
            <span class="hl-tile"><img src="assets/mark-white.svg?v=2" alt="" width="26" height="26"></span>
            <span class="hl-brand-words"><strong>Al Ghurair<span class="hl-sep" aria-hidden="true"> · </span>Tech Incubation Hub</strong><span>Emerging Tech Radar</span></span>
          </a>
          <nav class="hl-nav" aria-label="Sections">
            ${TABS.map(t => `<a href="${tabHref(t.id)}" data-tab="${t.id}"${t.id === tab ? ' aria-current="page"' : ''}>${t.label}</a>`).join('')}
            <a ${ext}>Newsroom ${ic('arrow-up-right')}</a>
          </nav>
          <div class="hl-bar-end">
            <div class="lang-switch hl-lang" role="group" aria-label="${window.ATLAS_LANG === 'ar' ? 'اللغة' : 'Language'}" data-no-i18n data-active="${window.ATLAS_LANG === 'ar' ? 'ar' : 'en'}">
              <button type="button" class="lang-option is-en" lang="en" aria-label="English" data-tooltip="English" aria-pressed="${window.ATLAS_LANG !== 'ar'}" data-lang="en">EN</button>
              <button type="button" class="lang-option is-ar" lang="ar" aria-label="العربية" data-tooltip="العربية" aria-pressed="${window.ATLAS_LANG === 'ar'}" data-lang="ar">ع</button>
            </div>
            <div class="hl-view-wide" data-slot="view">${viewSwitch()}</div>
            <button type="button" class="lp-primary hl-btn hl-radar-cta" data-act="hub-dissolve">Open Tech Radar ${ic('arrow-up-right')}</button>
            <button type="button" class="hl-square hl-menu-btn" aria-label="Open menu" data-tooltip="Menu" aria-expanded="false" aria-controls="hl-menu" data-act="menu">${ic('menu')}</button>
          </div>
        </div>
        <div id="hl-menu" class="hl-menu" hidden>
          <nav aria-label="Sections, mobile">
            ${TABS.map(t => `<a href="${tabHref(t.id)}" data-tab="${t.id}"${t.id === tab ? ' aria-current="page"' : ''}>${t.label}</a>`).join('')}
            <a ${ext}>Newsroom ${ic('arrow-up-right')}</a>
          </nav>
          <div class="hl-view-narrow" data-slot="view">${viewSwitch()}</div>
        </div>
      </header>
      <div class="hl-side">
        <div class="hl-view-side" data-slot="view">${viewSwitch()}</div>
      </div>
      <main>
        <div class="hl-panel" data-panel="discover">
          ${hero()}
          <section id="about" class="hl-section hl-about" aria-labelledby="hl-about-title" data-slot="about">${about()}</section>
          <section id="team" class="hl-section hl-team-section" aria-labelledby="hl-team-title">${team()}</section>
        </div>
        <div class="hl-panel" data-panel="foresight">${foresightPage()}</div>
        <div class="hl-panel" data-panel="tech-radar">${radarPage()}</div>
        <div class="hl-panel" data-panel="contact">
          <section id="contact" class="hl-section hl-tab-first" aria-labelledby="hl-contact-title" data-slot="contact">${contact()}</section>
        </div>
      </main>
      ${footer()}`;

    const back = document.createElement('button');
    back.type = 'button'; back.className = 'hl-return'; back.hidden = true;
    back.textContent = '↺ Back to the Tech Incubation Hub';
    const say = document.createElement('p'); say.className = 'sr-only'; say.setAttribute('role', 'status');
    document.body.append(page, back, say);
    paintIcons(page);

    const $ = s => page.querySelector(s), $$ = s => [...page.querySelectorAll(s)];
    const slots = name => $$(`[data-slot="${name}"]`);
    /* One scrolling page: the nav scrolls to each part, and the part in view is the one selected in the nav
       (and in the address, as ?tab=, so a shared link opens at the same place). */
    const markTab = t => {
      if (t === tab) return; tab = t;
      $$('.hl-nav [data-tab], .hl-menu [data-tab]').forEach(a => { if (a.dataset.tab === t) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      history.replaceState(history.state, '', tabHref(t));
    };
    function setTab(t, { focus = false, instant = false } = {}) {
      const panel = $(`[data-panel="${t}"]`); if (!panel) return;
      if (t === 'discover') page.scrollTo({ top: 0, behavior: reduced() || instant ? 'auto' : 'smooth' });
      else panel.scrollIntoView({ behavior: reduced() || instant ? 'auto' : 'smooth' });
      markTab(t);
      const title = panel.querySelector('h1, h2');
      if (focus && title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
    }
    const tabIO = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) markTab(e.target.dataset.panel); }),
      { root: page, rootMargin: '-40% 0px -55% 0px' });
    addEventListener('popstate', () => { const t = new URLSearchParams(location.search).get('tab') || 'discover'; if (!page.hidden) setTab(t); });
    const scrollTo = id => page.querySelector(`#${id}`)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });

    /* Count up the mission clock when it comes into view. */
    const countIO = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return; countIO.unobserve(e.target);
      const n = e.target, to = +n.dataset.to;
      if (reduced()) { n.textContent = String(to).padStart(2, '0'); return; }
      const dur = Math.min(1200, 400 + to / 80 * 1000), t0 = performance.now();
      const step = t => { const k = Math.min(1, (t - t0) / dur), eased = 1 - (1 - k) ** 4;
        n.textContent = String(Math.round(to * eased)).padStart(2, '0'); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { root: page, rootMargin: '-40px' });
    const watchCounts = () => $$('.hl-count').forEach(n => countIO.observe(n));

    /* Re-render the parts that depend on the audience view. */
    function setView(v, focusSeg) {
      if (v === view) return;
      view = v; intent = defaultIntent();
      try { localStorage.setItem(VIEW_KEY, v); } catch {}
      slots('view').forEach(s => { s.innerHTML = viewSwitch(); });
      slots('kpis').forEach(s => { s.innerHTML = kpis(); });
      slots('about').forEach(s => { s.innerHTML = about(); });
      slots('idea-cta').forEach(s => { s.innerHTML = ideaCta(); });
      slots('contact').forEach(s => { s.innerHTML = contact(); });
      paintIcons(page); watchCounts();
      if (focusSeg) focusSeg.closest('[data-slot]')?.querySelector('[aria-checked="true"]')?.focus();
    }
    function setIntent(i) {
      if (i === intent) return;
      const card = $('[data-slot="form"]'), keep = {};
      // keep what was typed in the shared fields
      card.querySelectorAll('input:not([type=checkbox]):not([type=file]), textarea').forEach(f => { keep[f.name] = f.value; });
      intent = i; card.innerHTML = form(); paintIcons(card);
      card.querySelectorAll('input:not([type=checkbox]):not([type=file]), textarea').forEach(f => { if (keep[f.name]) f.value = keep[f.name]; });
      updateCounter();
    }
    const updateCounter = () => { const m = $('#hl-msg'), c = $('[data-counter]'); if (m && c) c.textContent = `${m.value.length} / 500`; };
    const goToIdea = () => { setIntent('idea'); scrollTo('contact'); };

    /* Clicks */
    page.addEventListener('click', e => {
      const tb = e.target.closest('[data-tab]');
      if (tb) { e.preventDefault(); closeMenu(); setTab(tb.dataset.tab, { focus: true }); return; }
      const to = e.target.closest('[data-to]');
      if (to) { e.preventDefault(); closeMenu(); scrollTo(to.dataset.to); return; }
      const seg = e.target.closest('[data-seg] [role="radio"]');
      if (seg) { const kind = seg.parentElement.dataset.seg; kind === 'view' ? setView(seg.dataset.value) : setIntent(seg.dataset.value);
        if (kind === 'intent') $('[data-seg="intent"] [aria-checked="true"]')?.focus(); return; }
      const langBtn = e.target.closest('[data-lang]');
      if (langBtn) { const code = langBtn.dataset.lang; if (code === (window.ATLAS_LANG || 'en')) return;
        try { localStorage.setItem('atlas-lang', code); } catch {}
        langBtn.parentElement.dataset.switching = code; setTimeout(() => location.reload(), 180); return; }
      const acc = e.target.closest('[data-acc]');
      if (acc) { toggleCap(+acc.dataset.acc); return; }
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'build') { view === 'teams' ? goToIdea() : scrollTo('contact'); }
      else if (act === 'hub') launchToHub(e.target.closest('[data-act]'));
      else if (act === 'hub-dissolve') dissolveToHub();
      else if (act === 'idea') goToIdea();
      else if (act === 'menu') toggleMenu();
      else if (act === 'report') openBook(e.target.closest('[data-act]'));
      else if (act === 'domains') { const b = e.target.closest('button'), list = $('#hl-domain-list'), open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', open); list.hidden = !open; }
      else if (act === 'again') { $('[data-slot="form"]').innerHTML = form(); paintIcons(page); $('[data-slot="form"] input, [data-slot="form"] select')?.focus(); }
    });
    /* Keyboard: arrows move within radio groups; up and down move between accordion headers */
    page.addEventListener('keydown', e => {
      const radio = e.target.closest('[data-seg] [role="radio"]'), head = e.target.closest('[data-acc]');
      if (radio && ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault(); const group = radio.parentElement, items = [...group.children], rtl = getComputedStyle(group).direction === 'rtl';
        const next = items[(items.indexOf(radio) + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : (e.key === 'ArrowRight') !== rtl ? 1 : -1) + items.length) % items.length];
        group.dataset.seg === 'view' ? setView(next.dataset.value, group) : (setIntent(next.dataset.value), $('[data-seg="intent"] [aria-checked="true"]')?.focus());
      }
      if (head && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault(); const heads = $$('[data-acc]'), k = heads.indexOf(head), n = heads.length;
        heads[e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (k + (e.key === 'ArrowDown' ? 1 : -1) + n) % n].focus();
      }
      if (e.key === 'Escape' && !$('#hl-menu').hidden) { closeMenu(); $('.hl-menu-btn').focus(); }
    });
    function toggleCap(i) {
      capIndex = capIndex === i ? -1 : i;
      $$('[data-acc]').forEach(b => { const on = +b.dataset.acc === capIndex;
        b.setAttribute('aria-expanded', on); b.closest('.hl-acc-item').classList.toggle('is-open', on); });
    }

    /* Form */
    page.addEventListener('input', e => {
      if (e.target.id === 'hl-msg') updateCounter();
      if (e.target.matches('[data-intent]')) setIntent(e.target.value === 'idea' ? 'idea' : 'question');
    });
    page.addEventListener('change', e => {
      if (e.target.matches('[data-intent]')) setIntent(e.target.value === 'idea' ? 'idea' : 'question');
      if (e.target.id === 'hl-file') { const f = e.target.files?.[0], l = $('[data-file-label]');
        if (l) l.textContent = f ? (f.size > 10 * 1024 * 1024 ? `${f.name} is over 10 MB. Choose a smaller file.` : f.name) : 'Add a file, up to 10 MB'; }
    });
    page.addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target, missing = [];
      f.querySelectorAll('[data-required]').forEach(c => {
        const empty = c.type === 'checkbox' ? !c.checked : !c.value.trim();
        const bad = empty || (c.type === 'email' && !/^\S+@\S+\.\S+$/.test(c.value.trim()));
        const err = f.querySelector(`#${c.id}-error`);
        c.toggleAttribute('aria-invalid', bad);
        if (bad) c.setAttribute('aria-describedby', `${c.id}-error`); else c.removeAttribute('aria-describedby');
        c.closest('.hl-field')?.classList.toggle('is-invalid', bad);
        if (err) err.hidden = !bad;
        if (bad) missing.push(c);
      });
      f.querySelector('.hl-alert').hidden = !missing.length;
      if (missing.length) { missing[0].focus(); return; }
      // PROTOTYPE: no enquiry service is connected yet, so nothing is sent.
      const card = $('[data-slot="form"]'); card.innerHTML = thanks(); paintIcons(card); card.querySelector('.hl-thanks').focus();
    });

    /* Mobile menu */
    function toggleMenu(force) {
      const menu = $('#hl-menu'), btn = $('.hl-menu-btn'), open = force ?? menu.hidden;
      menu.hidden = !open; btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      btn.innerHTML = ic(open ? 'x' : 'menu'); paintIcons(btn); page.classList.toggle('is-menu', open);
    }
    const closeMenu = () => { if (!$('#hl-menu').hidden) toggleMenu(false); };

    /* Scroll: solid top bar once scrolled; the rocket climbs faster than the sky behind it while the hero leaves */
    const heroEl = $('.hl-hero');
    let ticking = false;
    page.addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        page.classList.toggle('is-scrolled', page.scrollTop > 24);
        const h = heroEl.offsetHeight; if (!h) return;
        const p = Math.min(1, page.scrollTop / h);
        if (p < 1 || heroEl.style.getPropertyValue('--p') !== '1') heroEl.style.setProperty('--p', reduced() ? 0 : p.toFixed(3));
      });
    }, { passive: true });

    /* Into the Innovation Hub, and back */
    /* Lift-off: the hero rocket shakes, then climbs out of view with its flame flaring; the small rocket then
       rises into the Hub from below the screen, in the same column, and flies onto the AGI planet. */
    let launching = false;
    function launchToHub(from) {
      if (!window.LaunchPad) { hide(); return; }
      if (launching) return;
      closeMenu();
      const landed = () => {
        launching = false; heroEl.classList.remove('is-lifting');
        document.title = hubTitle;
        say.textContent = 'Landed on Al Ghurair Investment in the Emerging Tech Radar.';
        back.hidden = false;
      };
      const rocketBox = $('.hl-rocket');
      if (reduced() || !rocketBox || page.scrollTop > heroEl.offsetHeight * .6 || !rocketBox.getClientRects().length) {
        window.LaunchPad.toHub(page, from, landed); return;
      }
      launching = true; from.disabled = true;
      const b = rocketBox.getBoundingClientRect(), x = b.left + b.width / 2, y = innerHeight + 70; // the small rocket rises into the Hub from below the screen
      heroEl.classList.add('is-lifting');
      setTimeout(() => {
        from.disabled = false;
        const handoff = { disabled: false, getBoundingClientRect: () => ({ left: x - 10, top: y - 10, width: 20, height: 20 }) };
        window.LaunchPad.toHub(page, handoff, landed);
      }, 1250);
    }
    const hubTitle = document.title;
    /* Dissolve (smart-animate style): the page fades out and eases slightly towards you while the Hub fades in
       from just behind, both on the same sky. */
    function dissolveToHub() {
      closeMenu();
      const done = () => {
        page.hidden = true; page.classList.remove('is-dissolving');
        document.body.classList.remove('lp-on', 'hl-hub-in');
        document.title = hubTitle; say.textContent = 'Opened the Emerging Tech Radar.'; back.hidden = false;
      };
      if (reduced()) { document.body.classList.remove('lp-reading'); done(); return; }
      page.classList.add('is-dissolving');
      document.body.classList.add('hl-hub-in');
      document.body.classList.remove('lp-reading');
      setTimeout(done, 750);
    }
    /* Back to the launch page: always a dissolve (the page fades in, settling from slightly forward, while the Hub
       fades out), whichever way we left. */
    function show() {
      back.hidden = true; heroEl.classList.remove('is-lifting');
      page.style.transition = 'none';
      page.classList.remove('is-gone'); page.classList.add('is-dissolving'); page.hidden = false;
      void page.offsetWidth; page.style.transition = '';
      document.body.classList.add('lp-on', 'lp-reading', 'hl-hub-out');
      document.title = 'Al Ghurair | Tech Incubation Hub';
      requestAnimationFrame(() => page.classList.remove('is-dissolving'));
      setTimeout(() => document.body.classList.remove('hl-hub-out'), 900);
      page.focus({ preventScroll: true });
    }
    function hide() { page.classList.add('is-gone'); setTimeout(() => { page.hidden = true; }, 600); document.body.classList.remove('lp-on', 'lp-reading'); back.hidden = false; }
    back.addEventListener('click', show);
    page.tabIndex = -1;
    window.HubLanding = { show };

    /* "How we evaluate ideas" pop-up: grows out of its link and folds back into it on close */
    const evd = document.createElement('dialog');
    evd.className = 'hl-evd'; evd.setAttribute('aria-labelledby', 'hl-evd-title');
    evd.innerHTML = evalDialog(); document.body.append(evd); paintIcons(evd);
    let evdAnim = null, evdFrom = null;
    const evdMotion = () => !reduced() && innerWidth > 760;
    const evdFold = () => {
      const b = evdFrom?.isConnected ? evdFrom.getBoundingClientRect() : null, r = evd.getBoundingClientRect();
      if (!b) return 'inset(50% 50% 50% 50% round 14px)';
      const cl = v => Math.max(0, Math.min(v, r.width - 1)), ct = v => Math.max(0, Math.min(v, r.height - 1));
      return `inset(${ct(b.top - r.top)}px ${cl(r.right - b.right)}px ${ct(r.bottom - b.bottom)}px ${cl(b.left - r.left)}px round 12px)`;
    };
    function openEval(from) {
      evdFrom = from; evdAnim?.cancel(); evd.showModal(); evd.scrollTop = 0;
      if (!evdMotion()) return;
      evdAnim = evd.animate([{ clipPath: evdFold(), opacity: .5 }, { clipPath: 'inset(0 0 0 0 round 22px)', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' });
      try { evd.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, pseudoElement: '::backdrop' }); } catch { /* no ::backdrop animation */ }
      evd.querySelectorAll(':scope > *').forEach((c, k) => c.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 360, delay: 120 + Math.min(k, 5) * 40, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
      evdAnim.finished.then(() => { evdAnim = null; }, () => {});
    }
    function closeEval() {
      if (!evd.open) return;
      const back = () => { evd.close(); evd.getAnimations().forEach(a => a.cancel()); evdAnim = null; if (evdFrom?.isConnected) evdFrom.focus(); };
      if (!evdMotion()) { back(); return; }
      evdAnim?.cancel();
      evdAnim = evd.animate([{ clipPath: 'inset(0 0 0 0 round 22px)', opacity: 1 }, { clipPath: evdFold(), opacity: 0 }], { duration: 340, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      try { evd.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 340, pseudoElement: '::backdrop', fill: 'forwards' }); } catch { /* no ::backdrop animation */ }
      evdAnim.finished.then(back, () => {});
    }
    evd.addEventListener('cancel', e => { e.preventDefault(); closeEval(); });
    evd.addEventListener('click', e => { if (e.target === evd || e.target.closest('[data-evd-close]')) closeEval(); });
    page.addEventListener('click', e => { const t = e.target.closest('[data-act="eval-open"]'); if (t) openEval(t); });

    /* Foresight Report flipbook: a two-page spread on wide screens, one page on phones. The right-hand page turns over
       onto the next spread like paper; the buttons and the arrow keys turn pages. */
    const book = document.createElement('dialog');
    book.className = 'hl-fb'; book.setAttribute('aria-labelledby', 'hl-fb-title');
    book.innerHTML = `
      <div class="hl-fb-top">
        <p id="hl-fb-title" class="hl-fb-name">${REPORTS[0].title}<span class="hl-fb-count" aria-live="polite"></span></p>
        <button type="button" class="hl-fb-btn" data-fb="close" aria-label="Close the report">${ic('x')}</button>
      </div>
      <div class="hl-fb-stage">
        <button type="button" class="hl-fb-arrow is-prev" data-fb="prev" aria-label="Previous page">${ic('chevron-left')}</button>
        <div class="hl-fb-spread"></div>
        <button type="button" class="hl-fb-arrow is-next" data-fb="next" aria-label="Next page">${ic('chevron-right')}</button>
      </div>
      <div class="hl-fb-thumbs" id="hl-fb-thumbs" hidden></div>
      <div class="hl-fb-bar" role="toolbar" aria-label="Report tools">
        <button type="button" class="hl-fb-tool" data-fb="first" aria-label="First page" data-tip="First page">${ic('chevrons-left')}</button>
        <button type="button" class="hl-fb-tool" data-fb="toc" aria-label="Contents" data-tip="Contents">${ic('list')}</button>
        <button type="button" class="hl-fb-tool" data-fb="thumbs" aria-label="All pages" data-tip="All pages" aria-expanded="false" aria-controls="hl-fb-thumbs">${ic('layout-grid')}</button>
        <i aria-hidden="true"></i>
        <button type="button" class="hl-fb-tool" data-fb="zoom" aria-label="Zoom in" data-tip="Zoom" aria-pressed="false">${ic('zoom-in')}</button>
        <button type="button" class="hl-fb-tool" data-fb="full" aria-label="Full screen" data-tip="Full screen">${ic('maximize')}</button>
        <a class="hl-fb-tool" href="assets/reports/foresight-facility-management-edition-01.pdf" download aria-label="Download PDF" data-tip="Download PDF">${ic('download')}</a>
        <i aria-hidden="true"></i>
        <button type="button" class="hl-fb-tool" data-fb="last" aria-label="Last page" data-tip="Last page">${ic('chevrons-right')}</button>
      </div>`;
    document.body.append(book); paintIcons(book);
    let pages = [], at = 0, turning = false, bookFrom = null, shownFirst = 0, swipeX = null, swiped = 0;
    const wideBook = () => innerWidth > 860;
    const spreads = () => {
      if (!wideBook()) return pages.map((_, i) => [i]);
      const out = [[0]]; let i = 1;
      for (; i < pages.length - 1; i += 2) out.push([i, i + 1]);
      if (i === pages.length - 1) out.push([i]);
      return out;
    };
    // where each page of a spread sits: the cover alone on the right, the back page alone on the left
    const sidesOf = sp => !wideBook() ? [sp[0]] : sp.length === 2 ? sp : sp[0] === 0 ? [null, 0] : [sp[0], null];
    // the page is the size container; its content box (hl-fb-in) is laid out in page widths (cqw)
    const pageHtml = i => i == null ? '' : `<div class="hl-fb-page${i === 0 ? ' is-cover' : ''}${i % 2 ? ' is-odd' : ''}"><div class="hl-fb-in">${pages[i]}</div>${i ? `<span class="hl-fb-folio"><b>${String(i).padStart(2, '0')}</b>Tech Incubation Hub</span>` : ''}</div>`;
    const fbSlots = sides => sides.map((i, k) => `<div class="hl-fb-slot ${sides.length === 1 ? 'is-single' : k ? 'is-right' : 'is-left'}">${pageHtml(i)}</div>`).join('');
    const spreadEl = book.querySelector('.hl-fb-spread');
    // cover alone sits on the right half, the back page on the left: shift the book so a closed book is centred
    const shiftFor = sides => !wideBook() || sides.length < 2 ? '' : sides[0] == null ? 'is-shut-front' : sides[1] == null ? 'is-shut-back' : '';
    const setShift = sides => { spreadEl.classList.remove('is-shut-front', 'is-shut-back'); const c = shiftFor(sides); if (c) spreadEl.classList.add(c); };
    function renderBook() {
      const all = spreads(), sides = sidesOf(all[at]);
      spreadEl.classList.toggle('is-wide', wideBook());
      spreadEl.innerHTML = fbSlots(sides); paintIcons(spreadEl); setShift(sides);
      book.querySelector('[data-fb="prev"]').disabled = at === 0;
      book.querySelector('[data-fb="next"]').disabled = at === all.length - 1;
      const real = sides.filter(i => i != null); shownFirst = real[0];
      book.querySelectorAll('[data-fb-go]').forEach(t => { const on = real.includes(+t.dataset.fbGo); t.toggleAttribute('aria-current', on); if (on && !t.closest('[hidden]')) t.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
      book.querySelector('.hl-fb-count').textContent = real[0] === 0 ? 'Cover' : `${real.length > 1 ? "Pages" : "Page"} ${real.join("–")} of ${pages.length - 1}`;
    }
    function turn(d) {
      const all = spreads(), to = at + d;
      if (turning || to < 0 || to >= all.length) return;
      if (reduced()) { at = to; renderBook(); return; }
      turning = true;
      if (!wideBook()) {
        spreadEl.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-d * 28}px)` }], { duration: 150, easing: 'ease-in' }).finished.then(() => {
          at = to; renderBook();
          spreadEl.animate([{ opacity: 0, transform: `translateX(${d * 28}px)` }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' }).finished.then(() => { turning = false; });
        });
        return;
      }
      const cur = sidesOf(all[at]), nxt = sidesOf(all[to]);
      // underneath: the page that stays put and the page being uncovered; on top: the leaf that turns
      const under = d > 0 ? [cur[0], nxt[1]] : [nxt[0], cur[1]];
      const front = d > 0 ? cur[1] : cur[0], back = d > 0 ? nxt[0] : nxt[1];
      spreadEl.innerHTML = fbSlots(under) + `<div class="hl-fb-leaf ${d > 0 ? 'is-right' : 'is-left'}"><div class="hl-fb-face is-front">${pageHtml(front)}</div><div class="hl-fb-face is-back">${pageHtml(back)}</div></div>`;
      paintIcons(spreadEl);
      const leaf = spreadEl.querySelector('.hl-fb-leaf');
      setShift(nxt);
      leaf.animate([{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${d > 0 ? -180 : 180}deg)` }], { duration: 820, easing: 'cubic-bezier(.45,.05,.2,1)' })
        .finished.then(() => { at = to; renderBook(); turning = false; });
      leaf.querySelectorAll('.hl-fb-face').forEach(f => f.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(.78)', offset: .5 }, { filter: 'brightness(1)' }], { duration: 820 }));
    }
    // jump straight to a page from the thumbnails
    function goTo(i) {
      const to = Math.max(0, spreads().findIndex(sp => sp.includes(i)));
      if (to === at || turning) return;  // already there
      if (reduced()) { at = to; renderBook(); return; }
      spreadEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140 }).finished.then(() => { at = to; renderBook(); spreadEl.animate([{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' }); });
    }
    const thumbsEl = book.querySelector('.hl-fb-thumbs');
    function toggleThumbs(force) {
      const open = force ?? thumbsEl.hidden, btn = book.querySelector('[data-fb="thumbs"]');
      thumbsEl.hidden = !open; btn.setAttribute('aria-expanded', open); book.classList.toggle('is-thumbs', open);
      if (open) { book.querySelector('[data-fb-go][aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' }); }
    }
    function openBook(from) {
      bookFrom = from; pages = reportPages(); at = 0; turning = false;
      thumbsEl.innerHTML = pages.map((pg, i) => `<button type="button" class="hl-fb-thumb" data-fb-go="${i}" aria-label="${i ? `Page ${i}` : 'Cover'}"><span class="hl-fb-mini${i === 0 ? ' is-cover' : ''}" aria-hidden="true"><span class="hl-fb-in">${pg.replace(/<(\/?)(?:button|a)\b[^>]*>/g, '<$1span>')}</span></span><span class="hl-fb-thumb-n">${i || 'Cover'}</span></button>`).join('');
      paintIcons(thumbsEl); toggleThumbs(false); renderBook();
      book.showModal();
      if (!reduced()) {
        book.animate([{ opacity: 0, transform: 'translateY(18px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' });
        try { book.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, pseudoElement: '::backdrop' }); } catch { /* no ::backdrop animation */ }
      }
      book.querySelector('[data-fb="next"]').focus();
    }
    function closeBook() {
      if (!book.open) return;
      const done = () => { book.classList.remove('is-zoom'); if (document.fullscreenElement) document.exitFullscreen?.(); book.close(); if (bookFrom?.isConnected) bookFrom.focus(); };
      if (reduced()) { done(); return; }
      book.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(12px) scale(.98)' }], { duration: 220, easing: 'ease-in', fill: 'forwards' }).finished.then(() => { done(); book.getAnimations().forEach(a => a.cancel()); });
    }
    book.addEventListener('cancel', e => { e.preventDefault(); closeBook(); });
    book.addEventListener('click', e => {
      if (e.target === book) { closeBook(); return; }
      const go = e.target.closest('[data-fb-go]'); if (go) { goTo(+go.dataset.fbGo); return; }
      const b = e.target.closest('[data-fb]')?.dataset.fb;
      if (b === 'radar' || b === 'contact') { const to = b; book.close(); book.getAnimations().forEach(a => a.cancel()); if (to === 'radar') setTab('tech-radar', { focus: true }); else scrollTo('contact'); return; }
      if (b === 'close') closeBook(); else if (b === 'next') turn(1); else if (b === 'prev') turn(-1); else if (b === 'thumbs') toggleThumbs();
      else if (b === 'first') goTo(0); else if (b === 'last') goTo(pages.length - 1); else if (b === 'toc') goTo(2);
      else if (b === 'zoom') { const on = !book.classList.contains('is-zoom'); book.classList.toggle('is-zoom', on); const t = book.querySelector('[data-fb="zoom"]'); t.setAttribute('aria-pressed', on); t.setAttribute('aria-label', on ? 'Zoom out' : 'Zoom in'); t.innerHTML = ic(on ? 'zoom-out' : 'zoom-in'); paintIcons(t); }
      else if (b === 'full') { if (document.fullscreenElement) document.exitFullscreen?.(); else book.requestFullscreen?.().catch(() => {}); }
      else if (!b && e.target.closest('.hl-fb-spread') && Date.now() - swiped > 400) {
        // tap a page to turn it: the right-hand side goes forward, the left-hand side goes back
        const r = spreadEl.getBoundingClientRect(); turn(e.clientX > r.left + r.width / 2 ? 1 : -1);
      }
    });
    spreadEl.addEventListener('pointerdown', e => { swipeX = e.pointerType === 'mouse' ? null : e.clientX; });
    spreadEl.addEventListener('pointerup', e => { if (swipeX == null) return; const dx = e.clientX - swipeX; swipeX = null; if (Math.abs(dx) > 40) { swiped = Date.now(); turn(dx < 0 ? 1 : -1); } });
    book.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); } });
    /* Print / PDF: every page on its own sheet, same design. Used to make the downloadable PDF. */
    window.HubLanding.printReport = () => {
      document.querySelector('.hl-fb-print')?.remove();
      pages = reportPages();
      const el = document.createElement('div'); el.className = 'hl-fb hl-fb-print';
      el.innerHTML = pages.map((_, i) => `<section class="hl-fb-print-page is-${i % 2 ? 'odd' : 'even'}">${pageHtml(i)}</section>`).join('');
      document.body.append(el); paintIcons(el); return el.querySelectorAll('img').length;
    };
    addEventListener('resize', () => { if (!book.open || turning) return;
      if (spreadEl.classList.contains('is-wide') === wideBook()) return;
      at = Math.max(0, spreads().findIndex(sp => sp.includes(shownFirst))); renderBook(); });

    $$('[data-panel]').forEach(p => tabIO.observe(p));
    if (tab !== 'discover') { const start = tab; tab = 'discover'; requestAnimationFrame(() => setTab(start, { instant: true })); }
    heroStars(page.querySelector('.hl-stars'), page);
    watchCounts();
    document.body.classList.add('lp-on', 'lp-reading');
    document.documentElement.classList.remove('atlas-landing-boot');
    document.title = window.ATLAS_LANG === 'ar' ? 'الغرير | مركز احتضان التقنيات' : 'Al Ghurair | Tech Incubation Hub';
  }

  /* Hero sky: twinkling stars in three depths that drift against the pointer, and a shooting star every few seconds.
     Drawn above the blue tint and under the earth and moon; it rests while the hero is off screen or the page is hidden. */
  function heroStars(canvas, page) {
    if (!canvas) return;
    const g = canvas.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, stars = [], meteors = [], next = performance.now() + 1500, last = 0, aimX = 0, aimY = 0, px = 0, py = 0, visible = true;
    const rnd = Math.random;
    function size() {
      const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(W * H / 5200);
      stars = Array.from({ length: n }, () => { const d = rnd(); return { x: rnd() * W, y: rnd() * H, d, r: .4 + d * 1.3, f: .6 + rnd() * 2.2, p: rnd() * 6.3,
        c: rnd() < .12 ? '255,226,190' : rnd() < .3 ? '205,220,255' : '255,255,255' }; });
    }
    function meteor() {
      const a = 2.55 + rnd() * .5;
      meteors.push({ x: (.35 + rnd() * .6) * W, y: rnd() * .4 * H, dx: Math.cos(a), dy: Math.sin(a), dist: 260 + rnd() * 320, len: 90 + rnd() * 120, t0: performance.now(), dur: 900 + rnd() * 600 });
    }
    addEventListener('pointermove', e => { aimX = e.clientX / innerWidth * 2 - 1; aimY = e.clientY / innerHeight * 2 - 1; }, { passive: true });
    addEventListener('resize', size);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { root: page }).observe(canvas);
    size();
    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden || page.hidden || now - last < 31) return;
      const dt = Math.min(.05, (now - last) / 1000), t = now / 1000, calm = reduced(); last = now;
      if (!calm) { px += (aimX - px) * (1 - Math.exp(-dt * 3)); py += (aimY - py) * (1 - Math.exp(-dt * 3)); }
      g.clearRect(0, 0, W, H);
      stars.forEach(s => {
        const o = calm ? .7 : .35 + .65 * Math.sin(t * s.f + s.p) ** 2;
        const x = s.x - px * (10 + 40 * s.d), y = s.y - py * (6 + 26 * s.d);
        g.globalAlpha = o * (.45 + .55 * s.d); g.fillStyle = `rgb(${s.c})`; g.beginPath(); g.arc(x, y, s.r, 0, 6.283); g.fill();
      });
      g.globalAlpha = 1;
      if (!calm && now > next) { meteor(); if (rnd() < .2) setTimeout(meteor, 260); next = now + 2800 + rnd() * 3500; }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i], q = (now - m.t0) / m.dur;
        if (q >= 1 || calm) { meteors.splice(i, 1); continue; }
        const e = 1 - (1 - q) ** 2, hx = m.x + m.dx * e * m.dist, hy = m.y + m.dy * e * m.dist, l = m.len * Math.min(1, q * 3) * (1 - q * .4), f = Math.sin(Math.min(1, q * 1.15) * Math.PI);
        const tx = hx - m.dx * l, ty = hy - m.dy * l, lg = g.createLinearGradient(tx, ty, hx, hy);
        lg.addColorStop(0, 'rgba(235,242,255,0)'); lg.addColorStop(1, `rgba(235,242,255,${f.toFixed(3)})`);
        g.strokeStyle = lg; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(tx, ty); g.lineTo(hx, hy); g.stroke();
        const hg = g.createRadialGradient(hx, hy, 0, hx, hy, 7); hg.addColorStop(0, `rgba(255,255,255,${f.toFixed(3)})`); hg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = hg; g.fillRect(hx - 7, hy - 7, 14, 14);
      }
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(build, 300)); else setTimeout(build, 300);
})();
