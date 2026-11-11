// English / Arabic. Runs after data.js and before app.js (all scripts are deferred, in order).
// - Arabic switches the page to right-to-left with the Almarai typeface.
// - Use-case content comes from data-ar.js (window.RADAR_DATA_AR) and is patched into the data before the app builds.
// - Interface text is translated in the DOM from the dictionary below, including text the app adds later.
(() => {
  'use strict';
  const KEY = 'atlas-lang';
  let lang = 'en';
  try { lang = localStorage.getItem(KEY) === 'ar' ? 'ar' : 'en'; } catch { /* storage unavailable */ }
  const root = document.documentElement;
  root.lang = lang; root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  window.ATLAS_LANG = lang;

  // ---------- Interface dictionary (exact English → Arabic) ----------
  const D = {
    'Skip to solar system': 'انتقل إلى المجموعة الشمسية', 'Tech Incubation Hub': 'مركز احتضان التقنيات', 'Tech Incubation Hub home': 'الصفحة الرئيسية لمركز احتضان التقنيات',
    'Service': 'الخدمات', 'Internal': 'الداخلية', 'Search use cases': 'ابحث في حالات الاستخدام', 'AGI': 'AGI', 'Al Ghurair Investment': 'الغرير للاستثمار',
    'Facilities': 'المرافق', 'Healthcare': 'الرعاية الصحية', 'Coming soon': 'قريبًا', 'Live': 'متاح', 'Explore': 'استكشف',
    'Technology use cases for facilities management services and operations.': 'حالات استخدام التقنية لخدمات وعمليات إدارة المرافق.',
    'Technology use cases for the healthcare business are being prepared.': 'يجري إعداد حالات استخدام التقنية لقطاع الرعاية الصحية.',
    'Open Facilities': 'افتح المرافق',
    'Service families': 'عائلات الخدمات', 'Internal families': 'العائلات الداخلية', 'All families': 'كل العائلات',
    'All maturities': 'كل مستويات النضج', 'Established': 'راسخة', 'Scaling': 'قيد التوسع', 'Emerging': 'ناشئة',
    'Inner orbit': 'المدار الداخلي', 'Middle orbit': 'المدار الأوسط', 'Outer orbit': 'المدار الخارجي',
    'SERVICE TECHNOLOGIES': 'تقنيات الخدمات', 'INTERNAL TECHNOLOGIES': 'التقنيات الداخلية', 'TECHNOLOGY FAMILIES': 'عائلات التقنية',
    'Explore technology families': 'استكشف عائلات التقنية', 'Al Ghurair Investment business areas': 'قطاعات أعمال الغرير للاستثمار',
    'No technology families in this collection.': 'لا توجد عائلات تقنية في هذه المجموعة.',
    'The technology-family labels need more room. Use the research index to explore all cases.': 'تحتاج أسماء العائلات إلى مساحة أكبر. استخدم فهرس البحث لاستكشاف كل الحالات.',
    'The facilities universe': 'عالم المرافق', 'Select a technology family to view its use cases': 'اختر عائلة تقنية لعرض حالات استخدامها',
    'Select a planet to expand its use cases and sources. Select a satellite to go directly to a use case.': 'اختر كوكبًا لعرض حالات استخدامه ومصادره، أو اختر قمرًا للانتقال مباشرة إلى حالة استخدام.',
    'Select a named use case to read its description, scores and value.': 'اختر حالة استخدام لقراءة وصفها وتقييماتها وقيمتها.',
    'Technology family': 'عائلة تقنية', 'Use case': 'حالة استخدام',
    'Scores': 'التقييمات', 'How it works': 'آلية العمل', 'Value realised': 'القيمة المحققة', 'Expected value': 'القيمة المتوقعة', 'Case': 'حالة', 'Assessment': 'التقييم', 'How to read the scores': 'كيف تُقرأ التقييمات',
    'Each gauge shows the score against its maximum. Strong (green) is 50% or more, Moderate (orange) 25–50%, Low (red) under 25%. Maturity, Viability and Feasibility are out of 4; Priority is Viability × Feasibility, out of 16. Rank 1 is the highest.':
      'يعرض كل مؤشر الدرجة مقارنةً بحدها الأقصى. قوي (أخضر) 50% أو أكثر، متوسط (برتقالي) من 25% إلى 50%، منخفض (أحمر) أقل من 25%. النضج والجدوى وقابلية التنفيذ من 4، والأولوية حاصل ضرب الجدوى في قابلية التنفيذ من 16. الترتيب 1 هو الأعلى.',
    'Reported benchmark': 'معيار مُبلَّغ عنه', 'Rank': 'الترتيب', 'Strong': 'قوي', 'Moderate': 'متوسط', 'Low': 'منخفض', 'Not scored': 'غير مُقيَّم',
    'Maturity': 'النضج', 'Priority': 'الأولوية', 'Viability': 'الجدوى', 'Feasibility': 'قابلية التنفيذ', 'Step': 'خطوة', 'Challenge': 'التحدي', 'Outcome': 'النتيجة',
    'Quick win': 'مكسب سريع', 'Consider for pilot': 'تُدرس للتجربة', 'Long-term invest': 'استثمار طويل الأجل', 'Deprioritise': 'أولوية منخفضة',
    'Each gauge fills in proportion to the score as a percentage of its maximum, and every tile uses the same colour rule: Low (grey-red) below 25%, Moderate (orange) 25% to below 50%, Strong (green) 50% or above. Maturity is out of 4. Viability and Feasibility are out of 4; Priority is their product, out of 16. These display bands summarise the existing scores; they are not recommendations. Rank is the research ordering within its collection: 1 is highest.':
      'يمتلئ كل مؤشر بنسبة الدرجة إلى حدها الأقصى، وتتبع كل البطاقات قاعدة الألوان نفسها: منخفض (رمادي مائل للأحمر) أقل من 25%، ومتوسط (برتقالي) من 25% إلى أقل من 50%، وقوي (أخضر) 50% أو أكثر. النضج من 4، والجدوى وقابلية التنفيذ من 4، والأولوية حاصل ضربهما من 16. هذه الفئات تلخّص الدرجات الحالية وليست توصيات. الترتيب هو تسلسل البحث داخل المجموعة، و1 هو الأعلى.',
    'THE FACILITIES RESEARCH INDEX': 'فهرس أبحاث المرافق', 'Use-case index': 'فهرس حالات الاستخدام', 'Collection': 'المجموعة', 'All collections': 'كل المجموعات',
    'Service group': 'مجموعة الخدمة', 'All service groups': 'كل مجموعات الخدمة', 'All stages': 'كل المراحل', 'Technology domain': 'المجال التقني', 'All domains': 'كل المجالات',
    'Reset': 'إعادة ضبط', 'use cases': 'حالات استخدام', 'No matching use cases': 'لا توجد حالات مطابقة', 'Try another search or reset your filters.': 'جرّب بحثًا آخر أو أعد ضبط عوامل التصفية.',
    'Show all use cases': 'اعرض كل الحالات', 'Search use cases, technologies or value…': 'ابحث في الحالات أو التقنيات أو القيمة…',
    'ABOUT THE RESEARCH': 'عن البحث', 'Research you can explore.': 'بحث يمكنك استكشافه.', 'How maturity is set': 'كيف يُحدَّد النضج', 'Source & coverage': 'المصدر والتغطية',
    'Choose Service or Internal, then select a technology family directly from its maturity orbit. Established families occupy the inner orbit, Scaling the middle and Emerging the outer orbit. Maturity is also available as a filter.':
      'اختر الخدمات أو الداخلية، ثم اختر عائلة تقنية من مدار نضجها. تقع العائلات الراسخة في المدار الداخلي، وقيد التوسع في الأوسط، والناشئة في الخارجي. ويمكن أيضًا التصفية حسب النضج.',
    'A family can appear on several orbits when its cases have different maturities. Each placement opens only that collection, family and maturity. Select a named use case to read its description, scores and reported value. The original service group or function remains available in search.':
      'قد تظهر العائلة في أكثر من مدار عندما تختلف مستويات نضج حالاتها. كل موضع يفتح تلك المجموعة والعائلة والنضج فقط. اختر حالة استخدام لقراءة وصفها وتقييماتها وقيمتها المُبلَّغ عنها. وتبقى مجموعة الخدمة أو الوظيفة الأصلية متاحة في البحث.',
    'Orbital distance indicates technology maturity only, not Al Ghurair adoption, approval or investment priority. Size and texture are decorative. Hover or keyboard focus pauses movement; Pause motion stops orbital and star animation. Reduced-motion preferences disable these effects. Narrow screens scroll vertically to keep names readable.':
      'تدل المسافة المدارية على نضج التقنية فقط، لا على اعتماد الغرير أو موافقتها أو أولوية استثمارها. الحجم والملمس للزينة. يوقف التمرير أو التركيز بلوحة المفاتيح الحركة، ويوقف زر إيقاف الحركة دوران المدارات والنجوم. وتعطّل تفضيلات تقليل الحركة هذه التأثيرات. وتُمرَّر الشاشات الضيقة عموديًا لتبقى الأسماء مقروءة.',
    'Maturity score 4 maps to Established and 3 to Scaling. Scores 1 (early stage/unproven) and 2 (pilot-stage) share Emerging in this navigation; each case retains its exact score and definition. They do not indicate Al Ghurair adoption, approval or investment priority.':
      'درجة النضج 4 تعني راسخة و3 تعني قيد التوسع. وتندرج الدرجتان 1 (مرحلة مبكرة/غير مثبتة) و2 (مرحلة تجريبية) تحت ناشئة في هذا التصفح، مع احتفاظ كل حالة بدرجتها وتعريفها الدقيقين. ولا تدل على اعتماد الغرير أو موافقتها أو أولوية استثمارها.',
    'Source: Al Ghurair internal and service use-case prioritisation research, October 2026.': 'المصدر: بحث الغرير لترتيب أولويات حالات الاستخدام الداخلية والخدمية، أكتوبر 2026.',
    'This view includes all 25 service and 43 internal use cases. Original titles, descriptions, domains, values and prioritisation results are preserved.':
      'يتضمن هذا العرض كل حالات الاستخدام: 25 خدمية و43 داخلية، مع الحفاظ على العناوين والأوصاف والمجالات والقيم ونتائج ترتيب الأولويات الأصلية.',
    'Value statements have not been independently verified. Scores and categories are research assessments, not approval decisions.':
      'لم يتم التحقق من بيانات القيمة بشكل مستقل. التقييمات والفئات تقديرات بحثية وليست قرارات اعتماد.',
    'Local working preview · No publication or content approval is implied.': 'معاينة عمل محلية · لا يعني ذلك نشرًا أو اعتمادًا للمحتوى.',
    'Choose use-case collection': 'اختر مجموعة حالات الاستخدام', 'Pause motion': 'إيقاف الحركة', 'Resume motion': 'استئناف الحركة', 'Motion reduced': 'الحركة مخفّضة',
    'About the research': 'عن البحث', 'Breadcrumb': 'مسار التنقل', 'Technology families by collection': 'عائلات التقنية حسب المجموعة', 'Filter by maturity': 'التصفية حسب النضج',
    'Maturity orbits from inside to outside': 'مدارات النضج من الداخل إلى الخارج', 'Browse use cases': 'تصفّح حالات الاستخدام', 'Previous use case': 'حالة الاستخدام السابقة',
    'Next use case': 'حالة الاستخدام التالية', 'Close': 'إغلاق', 'Use-case sections': 'أقسام حالة الاستخدام', 'Use-case assessment scores': 'تقييمات حالة الاستخدام',
    'Close research index': 'إغلاق فهرس البحث', 'Close about research': 'إغلاق نافذة عن البحث', 'Close and return to planet': 'إغلاق والعودة إلى الكوكب', 'Close and return to index': 'إغلاق والعودة إلى الفهرس',
    'Previous  ←': 'السابق', 'Next  →': 'التالي', 'Close  Esc': 'إغلاق (Esc)',
    // Technology families (display labels) and full domains
    'IoT & Smart Buildings': 'إنترنت الأشياء والمباني الذكية', 'BMS & Autonomous HVAC': 'أنظمة إدارة المباني والتكييف الذاتي', 'ESG & Carbon Tracking': 'الاستدامة وتتبع الكربون',
    'AI / ML Predictive Maintenance': 'الصيانة التنبؤية بالذكاء الاصطناعي', 'Autonomous Cleaning Robots': 'روبوتات التنظيف الذاتية', 'Workforce Management': 'إدارة القوى العاملة',
    'Drones For Inspection': 'الطائرات المسيّرة للفحص', 'Frontline Worker Technologies': 'تقنيات العاملين الميدانيين', 'Generative AI & Copilots': 'الذكاء الاصطناعي التوليدي والمساعدات',
    'AR / VR': 'الواقع المعزز والافتراضي', 'Lone-Worker Wearables': 'الأجهزة القابلة للارتداء للعاملين المنفردين', '3D Printing': 'الطباعة ثلاثية الأبعاد',
    'Computer Vision': 'الرؤية الحاسوبية', 'Digital Twins': 'التوائم الرقمية',
    'AI/ML Predictive Maintenance': 'الصيانة التنبؤية بالذكاء الاصطناعي', 'AR/VR for Maintenance & Training': 'الواقع المعزز والافتراضي للصيانة والتدريب',
    'BMS/BAS & Autonomous HVAC Optimization': 'أنظمة إدارة المباني وتحسين التكييف الذاتي', 'Drones for Inspection': 'الطائرات المسيّرة للفحص',
    'ESG / Carbon Tracking Platforms': 'منصات الاستدامة وتتبع الكربون', 'Generative AI / AI Copilots': 'الذكاء الاصطناعي التوليدي والمساعدات الذكية',
    'IoT Sensors & Smart Building Platforms': 'مستشعرات إنترنت الأشياء ومنصات المباني الذكية', 'Wearables for Lone Worker Safety': 'أجهزة قابلة للارتداء لسلامة العاملين المنفردين',
    'Workforce Management / Mobile FM Apps': 'إدارة القوى العاملة وتطبيقات المرافق المتنقلة',
    'Frontline Worker Technologies / Mobile Workforce Solution': 'تقنيات العاملين الميدانيين وحلول القوى العاملة المتنقلة',
    'Computer Vision (Space Utilization & Security)': 'الرؤية الحاسوبية (استخدام المساحات والأمن)', '3D Printing for Spare Parts (Additive Mfg)': 'الطباعة ثلاثية الأبعاد لقطع الغيار (التصنيع بالإضافة)',
    // Service groups
    'Hard FM & Technical Maintenance': 'الخدمات الفنية والصيانة التقنية', 'Soft FM & Hospitality Services': 'الخدمات المساندة والضيافة',
    'Energy, Sustainability & Environment': 'الطاقة والاستدامة والبيئة', 'Property, Community & Projects Advisory': 'استشارات العقارات والمجتمعات والمشاريع',
    'Integrated FM, Helpdesk & Command Centre': 'الإدارة المتكاملة للمرافق ومكتب الدعم ومركز التحكم', 'Commercial & Bidding': 'التجاري والمناقصات',
    'Operations & Deployment': 'العمليات والتشغيل', 'Support Functions - HR': 'الوظائف المساندة - الموارد البشرية', 'Support Functions - Finance': 'الوظائف المساندة - المالية',
    'Support Functions - Procurement': 'الوظائف المساندة - المشتريات', 'Hard FM': 'الخدمات الفنية', 'Soft FM': 'الخدمات المساندة', 'Integrated FM': 'الإدارة المتكاملة',
    'Energy & environment': 'الطاقة والبيئة', 'Commercial': 'التجاري', 'Operations': 'العمليات', 'HR': 'الموارد البشرية', 'Finance': 'المالية', 'Procurement': 'المشتريات',
  };
  const stageAr = { Established: 'راسخة', Scaling: 'قيد التوسع', Emerging: 'ناشئة' };
  // Arabic counting for "use case(s)"
  const cases = n => n === 1 ? 'حالة استخدام واحدة' : n === 2 ? 'حالتا استخدام' : n <= 10 ? `${n} حالات استخدام` : `${n} حالة استخدام`;
  const families = n => n === 1 ? 'عائلة واحدة' : n === 2 ? 'عائلتان' : n <= 10 ? `${n} عائلات` : `${n} عائلة`;
  const R = [
    [/^(\d+) use cases?$/, (m, n) => cases(+n)], [/^(\d+) named use cases?$/, (m, n) => cases(+n)],
    [/^(\d+) (Established|Scaling|Emerging)$/, (m, n, s) => `${n} ${stageAr[s]}`],
    [/^(SERVICE|INTERNAL) CASE (\d+)$/, (m, c, n) => `${c === 'SERVICE' ? 'حالة خدمية' : 'حالة داخلية'} ${n}`],
    [/^of (\d+)$/, (m, n) => `من ${n}`], [/^Step (\d+)$/, (m, n) => `الخطوة ${n}`],
    [/^(\d+) families, one planet each\. Select a planet to explore its use cases by maturity\.$/, (m, n) => `${families(+n)}، لكل منها كوكب. اختر كوكبًا لاستكشاف حالات استخدامه حسب النضج.`],
    [/^Al Ghurair Investment: (\d+) business areas, (\d+) live\.$/, (m, a, b) => `الغرير للاستثمار: ${a} قطاعات أعمال، ${b} متاح.`],
    [/^Open (.+)$/, (m, x) => `افتح ${t(x)}`], [/^Explore (.+) use cases$/, (m, x) => `استكشف حالات استخدام ${t(x)}`],
    [/^Open the full card: (.+)$/, (m, x) => `افتح البطاقة الكاملة: ${x}`],
    [/^(.+)\. (Established|Scaling|Emerging)\. Open full card\.$/, (m, x, s) => `${x}. ${stageAr[s]}. افتح البطاقة الكاملة.`],
    [/^(.+)\. (Established|Scaling|Emerging)\. Open description and value realised\.$/, (m, x, s) => `${x}. ${stageAr[s]}. افتح الوصف والقيمة المحققة.`],
    [/^(.+)\. (\d+) use cases? across maturity levels\. Explore family\.$/, (m, x, n) => `${t(x)}. ${cases(+n)} عبر مستويات النضج. استكشف العائلة.`],
    [/^(.+), (\d+) use cases?, (service|internal)$/, (m, x, n, c) => `${t(x)}، ${cases(+n)}، ${c === 'service' ? 'الخدمات' : 'الداخلية'}`],
    [/^(Facilities|Healthcare)\. (Open Facilities|Coming soon)\.$/, (m, x, y) => `${t(x)}. ${t(y)}.`],
    [/^(Collection|Service group|Maturity|Technology domain): (.+)$/, (m, a, b) => `${t(a)}: ${t(b)}`],
    [/^About (Service|Internal) use cases$/, (m, c) => `عن حالات استخدام ${t(c)}`],
  ];
  function t(text) {
    if (D[text] !== undefined) return D[text];
    for (const [pattern, fn] of R) { const m = text.match(pattern); if (m) return fn(...m); }
    // Running text (e.g. hover-card excerpts) may still carry the English markers kept for parsing.
    if (/Step \d+\s*:|The outputs? (?:is|are) |It is needed because /.test(text) && /[\u0600-\u06FF]/.test(text))
      return text.replace(/Step (\d+)\s*:/g, 'الخطوة $1:').replace(/The outputs? (?:is|are) /g, 'الناتج: ').replace(/It is needed because /g, 'والحاجة إليها لأن ');
    for (const sep of [' · ', ' / ']) if (text.includes(sep)) {
      const parts = text.split(sep), mapped = parts.map(part => t(part));
      if (mapped.some((part, i) => part !== parts[i])) return mapped.join(sep === ' / ' ? ' / ' : ' · ');
    }
    return text;
  }
  window.atlasT = t;

  // ---------- Use-case content (from data-ar.js) ----------
  if (lang === 'ar') {
    const data = window.RADAR_DATA, ar = window.RADAR_DATA_AR || {};
    data?.useCases?.forEach(record => {
      const a = ar[record.id]; if (!a) return;
      ['title', 'description', 'value', 'maturityExplanation'].forEach(field => { if (a[field]) record[field] = a[field]; });
    });
  }

  // ---------- Live DOM translation ----------
  const ATTRS = ['aria-label', 'placeholder', 'title', 'data-tooltip'];
  function translateNode(node) {
    if (node.nodeType === 3) {
      const raw = node.nodeValue, trimmed = raw.trim();
      if (!trimmed || !/[A-Za-z]/.test(trimmed) || node.parentElement?.closest('script, style, [data-no-i18n]')) return;
      const out = t(trimmed);
      if (out !== trimmed) node.nodeValue = raw.replace(trimmed, out);
      return;
    }
    if (node.nodeType !== 1 || node.closest('script, style, [data-no-i18n]')) return;
    ATTRS.forEach(attr => { const v = node.getAttribute(attr); if (v && /[A-Za-z]/.test(v)) { const out = t(v.trim()); if (out !== v.trim()) node.setAttribute(attr, out); } });
    if (node.tagName === 'OPTION' && /[A-Za-z]/.test(node.textContent)) { const out = t(node.textContent.trim()); if (out !== node.textContent.trim()) node.textContent = out; }
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let child; while ((child = walker.nextNode())) {
      if (child.nodeType === 3) translateNode(child);
      else ATTRS.forEach(attr => { const v = child.getAttribute(attr); if (v && /[A-Za-z]/.test(v)) { const out = t(v.trim()); if (out !== v.trim()) child.setAttribute(attr, out); } });
    }
  }

  // Language switch: a two-option pill (EN | ع) like the header's other switches; the active language is highlighted.
  function addToggle() {
    const actions = document.querySelector('.command-actions');
    if (!actions || document.getElementById('lang-toggle')) return;
    const group = document.createElement('div');
    group.id = 'lang-toggle'; group.className = 'lang-switch'; group.setAttribute('role', 'group'); group.setAttribute('data-no-i18n', '');
    group.setAttribute('aria-label', lang === 'ar' ? 'اللغة' : 'Language');
    [['en', 'EN', 'English'], ['ar', 'ع', 'العربية']].forEach(([code, text, name]) => {
      const button = document.createElement('button');
      button.type = 'button'; button.lang = code; button.textContent = text; button.className = `lang-option is-${code}`;
      button.setAttribute('aria-label', name); button.setAttribute('aria-pressed', String(code === lang));
      button.addEventListener('click', () => {
        if (code === lang) return;
        try { localStorage.setItem(KEY, code); } catch { /* storage unavailable */ }
        group.dataset.switching = code;
        setTimeout(() => location.reload(), 180);
      });
      group.append(button);
    });
    group.dataset.active = lang;
    actions.prepend(group);
  }

  function start() {
    addToggle();
    if (lang !== 'ar') return;
    translateNode(document.body);
    document.title = 'الغرير — مركز احتضان التقنيات';
    new MutationObserver(records => records.forEach(record => {
      if (record.type === 'characterData') translateNode(record.target);
      else if (record.type === 'attributes') translateNode(record.target);
      else record.addedNodes.forEach(translateNode);
    })).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
