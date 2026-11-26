/* CALEA · Denis-Alexandru Călin · v3
   Interacțiuni, i18n, WebGL (hero + lentilă pe imagini), tranziții, simularea plăcii FPGA.
   Vanilla JS, fără librării. Folosit de index.html și de proiecte/fpga.html. */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var mm = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var reduce = mm('(prefers-reduced-motion: reduce)').matches;
  var finePointer = mm('(hover: hover) and (pointer: fine)').matches;
  var coarse = mm('(pointer: coarse)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var BASE = root.getAttribute('data-base') || '';

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* =========================================================
     i18n: textele RO se citesc din HTML; EN sunt aici
     (pagina de studiu de caz adaugă cheile ei în window.CALEA_EN)
     ========================================================= */
  var EN = {
    'skip': 'Skip to content',
    'nav.aria': 'Main navigation',
    'brand.aria': 'CALEA, back to top',
    'menu.open': 'Open menu',
    'nav.home': 'Start',
    'nav.projects': 'Projects',
    'nav.studies': 'Education',
    'nav.contact': 'Contact',
    'nav.cv': 'CV',
    'lang.aria': 'Site language',
    'theme.aria': 'Toggle theme',
    'theme.label': 'Theme',
    'hero.meta2': 'Cluj-Napoca, Romania',
    'hero.meta3': 'Open to an internship',
    'hero.role': 'Computer Engineering student, software and hardware',
    'hero.lede': 'I build complete systems, from logic gates in VHDL on FPGA up to applications in C++ and Java, and I test everything I build.',
    'hero.cta1': 'See the projects',
    'hero.cta2': 'Download CV',
    'hero.scroll': 'Scroll',
    'hero.touch': 'Move the mouse over the traces',
    'rail.aria': 'Projects',
    'rail.rd': 'carousel',
    'rail.prev': 'Previous project',
    'rail.next': 'Next project',
    'link.code': 'Code on GitHub',
    'link.newtab': ' (opens in a new tab)',
    'tags.aria': 'Technologies',
    'p1.title': 'FPGA Multi-Player Reaction Time Game',
    'p1.img': 'Black-and-white isometric render of an FPGA chip marked TOP_GAME, with traces fanning out from its pins',
    'p1.cap': 'TOP_GAME, the project’s top-level entity',
    'p1.desc': 'A hardware reaction game for up to 4 players and 5 rounds, written entirely in VHDL with no software layer, driven by an FSM control unit.',
    'p1.s1': 'VHDL modules',
    'p1.s4': 'FSM states',
    'p1.s3': 'MHz, divided down to a 1 ms tick',
    'p1.case': 'Read the case study',
    'soon.title': 'More soon',
    'soon.text': 'I am working on the next projects. Meanwhile, everything I have published is on GitHub.',
    'studies.title': 'What I study',
    'studies.img': 'Schematic of a half adder built from two logic gates, XOR and AND, drawn in white on black graph paper over the outline of the letters UTCN',
    'studies.cap': 'Half adder: S = A ⊕ B, C = A · B',
    'studies.when1': '2025 – present, year 2',
    'studies.school1': 'Technical University of Cluj-Napoca',
    'studies.sub1': 'B.Sc. in Computer Science and Information Technology, Faculty of Automation and Computer Science.',
    'cv.title': 'All of it, on one page',
    'cv.alt': 'Preview: the first page of the CV',
    'cv.open': 'Open the CV (PDF) in a new tab',
    'cv.lead': 'Coursework, skills, languages and the rest of the details live in the CV. One A4 page, in English or Romanian.',
    'contact.title': 'Let’s talk',
    'contact.lead': 'Have an internship or a project I can help with? Send me an email.',
    'clock.label': 'Time in Cluj',
    'footer.top': 'Back to top'
  };
  if (window.CALEA_EN) { for (var ek in window.CALEA_EN) EN[ek] = window.CALEA_EN[ek]; }

  /* Texte dinamice, în ambele limbi */
  var DYN = {
    ro: {
      title: document.title,
      menuOpen: 'Deschide meniul', menuClose: 'Închide meniul',
      toLight: 'Comută pe tema luminoasă', toDark: 'Comută pe tema întunecată',
      slide: function (i, n) { return i + ' din ' + n; },
      slideNow: function (i, n) { return 'Slide-ul ' + i + ' din ' + n; },
      cursor: { view: 'Vezi', drag: 'Trage' },
      rig: {
        start: 'Start', react: 'Reacționează', wait: 'Așteaptă…', again: 'Joc nou', fault: 'start fals',
        IDLE: 'Apasă Start. Placa alege o întârziere de 1–5 secunde, apoi aprinde LED_SEMNAL.',
        WAIT_RANDOM: function (r) { return 'Runda ' + r + ' din 5. Așteaptă LED_SEMNAL, nu apăsa înainte.'; },
        PLAY: 'LED_SEMNAL e aprins: apasă!',
        FAULT: 'Start fals: ai apăsat înainte de LED_SEMNAL. Afișajul arată 0, recordul nu se schimbă.',
        EVAL: function (ms) { return 'Timpul tău: ' + ms + ' ms.'; },
        WINNER: function (b) { return b == null ? 'Gata, 5 runde fără niciun timp valid.' : 'Gata, 5 runde. Cel mai bun timp: ' + b + ' ms.'; },
        disp: function (s) { return 'Afișaj: ' + s; },
        none: '–'
      }
    },
    en: {
      title: document.title,
      menuOpen: 'Open menu', menuClose: 'Close menu',
      toLight: 'Switch to light theme', toDark: 'Switch to dark theme',
      slide: function (i, n) { return i + ' of ' + n; },
      slideNow: function (i, n) { return 'Slide ' + i + ' of ' + n; },
      cursor: { view: 'View', drag: 'Drag' },
      rig: {
        start: 'Start', react: 'React', wait: 'Wait…', again: 'New game', fault: 'false start',
        IDLE: 'Press Start. The board picks a 1–5 second delay, then lights LED_SEMNAL.',
        WAIT_RANDOM: function (r) { return 'Round ' + r + ' of 5. Wait for LED_SEMNAL, don’t press early.'; },
        PLAY: 'LED_SEMNAL is on: press!',
        FAULT: 'False start: you pressed before LED_SEMNAL. The display shows 0 and the record stays the same.',
        EVAL: function (ms) { return 'Your time: ' + ms + ' ms.'; },
        WINNER: function (b) { return b == null ? 'Done, 5 rounds with no valid time.' : 'Done, 5 rounds. Best time: ' + b + ' ms.'; },
        disp: function (s) { return 'Display: ' + s; },
        none: '–'
      }
    }
  };
  /* Meta-urile paginii: RO din HTML, EN din data-en-* pe <html> (setate pe fiecare pagină) */
  var metaDesc = $('meta[name="description"]'), ogDesc = $('meta[property="og:description"]');
  DYN.ro.desc = metaDesc ? metaDesc.content : '';
  DYN.ro.ogDesc = ogDesc ? ogDesc.content : '';
  DYN.en.title = root.getAttribute('data-en-title') || DYN.en.title;
  DYN.en.desc = root.getAttribute('data-en-desc') || 'CALEA, the portfolio of Denis-Alexandru Călin: second-year Computer Science and Information Technology student (UTCN, Cluj-Napoca). Projects in VHDL on FPGA, C++, Java and C. Looking for an internship.';
  DYN.en.ogDesc = root.getAttribute('data-en-og') || 'Second-year Computer Science student at UTCN, Cluj-Napoca. From VHDL on FPGA to C++ and Java. Looking for an internship.';

  var RO = {};
  var textEls = $$('[data-i18n]');
  var htmlEls = $$('[data-i18n-html]');
  var ariaEls = $$('[data-i18n-aria]');
  var altEls = $$('[data-i18n-alt]');
  var rdEls = $$('[data-i18n-rd]');
  var slideEls = $$('[data-i18n-slide]');
  textEls.forEach(function (el) { RO[el.getAttribute('data-i18n')] = el.textContent; });
  htmlEls.forEach(function (el) { RO[el.getAttribute('data-i18n-html')] = el.innerHTML; });
  ariaEls.forEach(function (el) { RO[el.getAttribute('data-i18n-aria')] = el.getAttribute('aria-label'); });
  altEls.forEach(function (el) { RO[el.getAttribute('data-i18n-alt')] = el.getAttribute('alt'); });
  rdEls.forEach(function (el) { RO[el.getAttribute('data-i18n-rd')] = el.getAttribute('aria-roledescription'); });

  var lang = root.getAttribute('lang') === 'en' ? 'en' : 'ro';
  function t(key) { var d = lang === 'en' ? EN : RO; return d[key] != null ? d[key] : RO[key]; }
  function D() { return DYN[lang]; }

  /* Titluri: cuvinte în span-uri, apoi grupate pe linii (--l) pentru dezvăluirea linie cu linie */
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var outer = document.createElement('span');
      outer.className = 'w';
      var inner = document.createElement('span');
      inner.className = 'wi';
      inner.textContent = w;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    markLines(el);
  }
  function markLines(el) {
    var top = null, l = -1, wi = 0;
    $$('.w', el).forEach(function (w) {
      var y = w.offsetTop;
      if (top === null || Math.abs(y - top) > 4) { l++; top = y; wi = 0; }
      w.firstChild.style.setProperty('--l', l);
      w.firstChild.style.setProperty('--wi', wi++);
    });
  }
  var splitRt = null;
  window.addEventListener('resize', function () {
    clearTimeout(splitRt);
    splitRt = setTimeout(function () { $$('.split').forEach(markLines); }, 200);
  });

  function setMeta(sel, attr, val) { var m = $(sel); if (m && val) m.setAttribute(attr, val); }

  /* CV-ul descărcat urmează limba site-ului */
  function syncCv() {
    var L = lang.toUpperCase();
    $$('[data-cv]').forEach(function (a) { a.setAttribute('href', BASE + 'assets/CV_Denis_Calin_' + L + '.pdf'); });
    $$('[data-cv-img]').forEach(function (img) { img.setAttribute('src', BASE + 'assets/cv-preview-' + lang + '.png'); });
  }

  function applyLang(next) {
    lang = next === 'en' ? 'en' : 'ro';
    root.setAttribute('lang', lang);
    textEls.forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (el.classList.contains('split')) { el.textContent = v; splitWords(el); }
      else if (el.textContent !== v) el.textContent = v;
    });
    htmlEls.forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    ariaEls.forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
    altEls.forEach(function (el) { el.setAttribute('alt', t(el.getAttribute('data-i18n-alt'))); });
    rdEls.forEach(function (el) { el.setAttribute('aria-roledescription', t(el.getAttribute('data-i18n-rd'))); });
    slideEls.forEach(function (el) { el.setAttribute('aria-label', D().slide(+el.getAttribute('data-i18n-slide'), slideEls.length)); });
    $$('.lang-btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });

    var d = D();
    document.title = d.title;
    setMeta('meta[name="description"]', 'content', d.desc);
    setMeta('meta[property="og:description"]', 'content', d.ogDesc);
    setMeta('meta[property="og:locale"]', 'content', lang === 'en' ? 'en_US' : 'ro_RO');
    setMeta('meta[property="og:locale:alternate"]', 'content', lang === 'en' ? 'ro_RO' : 'en_US');

    syncCv();
    syncMenuLabel();
    syncThemeUi();
    if (cursorApi) cursorApi.relabel();
    if (game) game.relabel();
    if (heroGL) heroGL.retext();
  }

  /* Micro-interacțiune: cursorul comutatorului se întinde, textul trece printr-un blur scurt */
  $$('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = b.getAttribute('data-lang');
      if (l === lang) return;
      store('lang', l);
      var sw = b.closest('.lang-switch');
      if (reduce) { applyLang(l); return; }
      if (sw) { sw.classList.add('is-pulling'); setTimeout(function () { sw.classList.remove('is-pulling'); }, 300); }
      root.classList.add('lang-out');
      setTimeout(function () {
        applyLang(l);
        requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('lang-out'); }); });
      }, 230);
    });
  });

  /* =========================================================
     Temă: cerc care pornește din punctul de click (View Transitions API)
     ========================================================= */
  var themeBtn = $('.theme-toggle');
  var mqLight = mm('(prefers-color-scheme: light)');
  function currentTheme() {
    var th = root.getAttribute('data-theme');
    if (th === 'light' || th === 'dark') return th;
    return mqLight.matches ? 'light' : 'dark';
  }
  function syncThemeUi() {
    var th = currentTheme();
    if (themeBtn) themeBtn.setAttribute('aria-label', th === 'dark' ? D().toLight : D().toDark);
    setMeta('meta[name="theme-color"]', 'content', th === 'dark' ? '#000000' : '#ffffff');
    if (heroGL) heroGL.recolor();
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function (e) {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      var apply = function () { root.setAttribute('data-theme', next); store('theme', next); syncThemeUi(); };
      if (!document.startViewTransition || reduce) { apply(); return; }
      var r = themeBtn.getBoundingClientRect();
      var x = e.clientX || (r.left + r.width / 2), y = e.clientY || (r.top + r.height / 2);
      var rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.classList.add('vt-theme');
      var tr = document.startViewTransition(apply);
      tr.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 900, easing: 'cubic-bezier(0.77, 0, 0.18, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
      tr.finished.then(function () { root.classList.remove('vt-theme'); }, function () { root.classList.remove('vt-theme'); });
    });
  }
  if (mqLight.addEventListener) mqLight.addEventListener('change', syncThemeUi);

  /* =========================================================
     Meniu mobil + header
     ========================================================= */
  var header = $('.site-header');
  var toggle = $('.nav-toggle');
  var panel = $('#meniu');
  function menuOpen() { return toggle && toggle.getAttribute('aria-expanded') === 'true'; }
  function syncMenuLabel() { if (toggle) toggle.setAttribute('aria-label', menuOpen() ? D().menuClose : D().menuOpen); }
  function setMenu(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    if (open) header.classList.remove('is-hidden');
    body.classList.toggle('menu-open', open);
    syncMenuLabel();
  }
  if (toggle && panel) {
    toggle.addEventListener('click', function () { setMenu(!menuOpen()); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) { setMenu(false); toggle.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 900 && menuOpen()) setMenu(false); });
  }

  var lastY = window.pageYOffset;
  var signal = $('.signal');
  function onScroll() {
    var y = window.pageYOffset;
    if (header) {
      header.classList.toggle('is-scrolled', y > 8);
      var down = y > lastY + 4, up = y < lastY - 4;
      if (menuOpen() || header.contains(document.activeElement) || y < 200) header.classList.remove('is-hidden');
      else if (down) header.classList.add('is-hidden');
      else if (up) header.classList.remove('is-hidden');
      if (down || up) lastY = y;
    }
    if (signal) {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      signal.style.setProperty('--p', (y / max).toFixed(4));
    }
  }
  if (header) header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* Ecranul curent: în nav (aria-current) și în indicatorul de semnal */
  var navLinks = $$('.nav-links a[href^="#"]');
  var sigItems = $$('.signal-steps li');
  var screenIds = navLinks.map(function (a) { return a.getAttribute('href').slice(1); });
  function setCurrent(id) {
    navLinks.forEach(function (a) { if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    var i = screenIds.indexOf(id);
    if (signal && i >= 0) {
      signal.style.setProperty('--s', i);
      sigItems.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    }
  }
  if ('IntersectionObserver' in window && screenIds.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setCurrent(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    screenIds.forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }
  $$('.signal-steps button').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = document.getElementById(b.getAttribute('data-go'));
      if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* =========================================================
     Dezvăluiri: un ecran (sau bloc) devine „activ” când ocupă jumătate din viewport.
     Pe pagina principală se resetează când ecranul iese complet, ca să se reia la revenire.
     ========================================================= */
  function fmt(n) { return String(Math.round(n)); }
  function countUp(el) {
    var to = +el.getAttribute('data-to');
    if (reduce || !to) { el.textContent = fmt(to); return; }
    var start = null, dur = 1500;
    el.textContent = '0';
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function activate(el) {
    if (el.classList.contains('is-active')) return;
    el.classList.add('is-active');
    setTimeout(function () { $$('.count', el).forEach(countUp); }, 300);
  }
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var th = [];
    for (var ti = 0; ti <= 20; ti++) th.push(ti / 20);
    var rio = new IntersectionObserver(function (entries) {
      var vh = window.innerHeight;
      entries.forEach(function (en) {
        var el = en.target;
        var vis = en.intersectionRect.height;
        var need = Math.min(vh, en.boundingClientRect.height) * 0.45;
        if (en.isIntersecting && vis >= need) activate(el);
        else if (!en.isIntersecting && el.getAttribute('data-reveal') !== 'once') el.classList.remove('is-active');
      });
    }, { threshold: th });
    revealEls.forEach(function (el) { rio.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-active'); });
  }

  /* Lungimile traseelor desenate în diagrame (pentru stroke-dashoffset) */
  $$('.dg .draw').forEach(function (p) {
    try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
  });

  /* =========================================================
     Cursor custom (punct + inel, stări link / vezi / trage) și butoane magnetice
     ========================================================= */
  var cursorApi = null;
  if (finePointer && !reduce) {
    var cur = $('.cursor');
    if (cur) {
      root.classList.add('has-cursor');
      var cdot = $('.cursor-dot', cur), cring = $('.cursor-ring', cur), clabel = $('.cursor-label', cur);
      var mx = -100, my = -100, rx = -100, ry = -100, craf = null, cstate = '';
      var cloop = function () {
        rx += (mx - rx) * 0.17;
        ry += (my - ry) * 0.17;
        cring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
        cdot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
        craf = (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) ? requestAnimationFrame(cloop) : null;
      };
      var setState = function (target) {
        var s = '';
        var a = target.closest && target.closest('a, button, [role="button"], label, summary');
        if (a && a.hasAttribute('data-cursor')) s = a.getAttribute('data-cursor');
        else if (a) s = 'link';
        else {
          var v = target.closest && target.closest('[data-cursor]');
          if (v) s = v.getAttribute('data-cursor');
        }
        if (s === cstate) return;
        cur.classList.remove('is-' + cstate);
        cstate = s;
        if (s) cur.classList.add('is-' + s);
        clabel.textContent = (D().cursor[s]) || '';
      };
      document.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        mx = e.clientX; my = e.clientY;
        if (rx < -50) { rx = mx; ry = my; }
        cur.classList.add('is-on');
        setState(e.target);
        if (!craf) craf = requestAnimationFrame(cloop);
      }, { passive: true });
      document.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
      document.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
      document.documentElement.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });
      cursorApi = { relabel: function () { clabel.textContent = (D().cursor[cstate]) || ''; } };
    }

    $$('.magnetic').forEach(function (el) {
      var inner = $('.btn-in', el);
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)), dy = (e.clientY - (r.top + r.height / 2));
        el.style.transition = 'transform 0.18s linear';
        el.style.transform = 'translate3d(' + (dx * 0.26).toFixed(1) + 'px,' + (dy * 0.36).toFixed(1) + 'px,0)';
        if (inner) inner.style.transform = 'translate3d(' + (dx * 0.12).toFixed(1) + 'px,' + (dy * 0.16).toFixed(1) + 'px,0)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = '';
        if (inner) inner.style.transform = '';
      });
    });
  }

  /* =========================================================
     Intro: overlay-ul se termină din CSS; aici doar îl scoatem din DOM.
     ========================================================= */
  var hadIntro = root.classList.contains('intro');
  if (hadIntro) setTimeout(function () { var ov = $('.intro-ov'); if (ov) ov.parentNode.removeChild(ov); }, 1500);
  setTimeout(function () { root.classList.add('settled'); }, reduce ? 0 : (hadIntro ? 2700 : 1700));

  /* =========================================================
     Hero WebGL: un câmp de trasee de semnal (ca pe un PCB), cu pulsuri care circulă,
     distorsiune la mouse/touch și wordmark-ul CALEA desenat în shader, dezvăluit de câmp.
     Fallback: grila statică din CSS + wordmark-ul HTML. Pauză off-screen.
     ========================================================= */
  var heroGL = (function () {
    var section = $('.hero'), canvas = $('.hero-gl');
    if (!section || !canvas) return null;
    var gl = null;
    /* failIfMajorPerformanceCaveat: fără GPU (randare software) rămânem pe fallback-ul static */
    try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: true }); } catch (e) {}
    if (!gl) { root.classList.add('no-gl'); return null; }

    var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';
    var FS = [
      'precision highp float;',
      'uniform vec2 uRes; uniform float uTime; uniform float uDpr; uniform float uReveal; uniform float uTextOn;',
      'uniform vec3 uMouse; uniform vec4 uRip0; uniform vec4 uRip1; uniform vec4 uRip2; uniform vec4 uRip3;',
      'uniform sampler2D uText; uniform vec3 uFg; uniform vec3 uBg;',
      'float h21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }',
      'float vnoise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);',
      '  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }',
      'float segd(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a; vec2 ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }',
      /* un strat de trasee: direcție cuantizată la 45° dintr-un câmp de zgomot, benzi pornite/oprite, pulsuri, pad-uri */
      'vec3 circuit(vec2 p, float cell, float t, float seed, float density){',
      '  vec2 g = p / cell; vec2 id = floor(g); vec2 f = fract(g) - 0.5;',
      '  float n = vnoise(id * 0.055 + vec2(seed, t * 0.018)) * 0.75 + vnoise(id * 0.13 + vec2(t * 0.012, seed * 1.7)) * 0.25;',
      '  float q = floor(n * 9.0);',
      '  float ang = q * 0.78539816;',
      '  vec2 dir = vec2(cos(ang), sin(ang));',
      '  vec2 e = dir / max(abs(dir.x), abs(dir.y)) * 0.5;',
      '  vec2 perp = vec2(-e.y, e.x) * 2.0;',
      '  float lane = floor(dot(id, perp) + 0.5);',
      '  float qq = mod(q, 4.0);',
      '  float on = step(density, h21(vec2(lane * 0.731 + seed, qq + 1.3)));',
      '  float d = segd(f, -e, e) * cell;',
      '  float w = 0.55 * uDpr;',
      '  float line = (1.0 - smoothstep(w, w + 1.1 * uDpr, d)) * on;',
      '  float glow = (1.0 - smoothstep(0.0, 3.5 * uDpr, d)) * on;',
      '  float s = dot(g, normalize(e));',
      '  float sp = 0.22 + 0.4 * h21(vec2(lane, 7.1 + qq));',
      '  float ph = fract(s * 0.03 - t * sp + h21(vec2(lane, 3.3 + qq)));',
      '  float pulse = pow(ph, 22.0) * step(0.5, h21(vec2(lane, 11.0 + qq))) * glow;',
      '  float pr = 0.17 * cell;',
      '  float isPad = step(0.955, h21(id + seed * 3.1)) * on;',
      '  float pd = length(f) * cell;',
      '  float ring = (1.0 - smoothstep(0.6 * uDpr, 1.5 * uDpr, abs(pd - pr))) * isPad;',
      '  float dotc = (1.0 - smoothstep(pr * 0.35, pr * 0.35 + uDpr, pd)) * isPad;',
      '  return vec3(line, pulse, max(ring, dotc));',
      '}',
      /* undă care pleacă din punctul de click / touch */
      'vec2 ripple(vec2 fc, vec4 r, float t){',
      '  float age = t - r.z;',
      '  if (age < 0.0 || age > 2.6 || r.w <= 0.0) return vec2(0.0);',
      '  vec2 dv = fc - r.xy; float d = length(dv) + 0.001;',
      '  float front = age * 620.0 * uDpr;',
      '  float band = exp(-pow((d - front) / (90.0 * uDpr), 2.0));',
      '  float amp = r.w * exp(-age * 1.4) * 22.0 * uDpr;',
      '  return dv / d * sin((d - front) / (16.0 * uDpr)) * band * amp;',
      '}',
      'void main(){',
      '  vec2 fc = gl_FragCoord.xy; float t = uTime;',
      '  vec2 disp = ripple(fc, uRip0, t) + ripple(fc, uRip1, t) + ripple(fc, uRip2, t) + ripple(fc, uRip3, t);',
      '  vec2 md = fc - uMouse.xy; float ml = length(md);',
      '  float R = 180.0 * uDpr;',
      '  float lens = exp(-(ml * ml) / (R * R)) * uMouse.z;',
      '  vec2 p = fc - md * lens * 0.24 + disp;',
      '  vec3 c = circuit(p, 24.0 * uDpr, t, 0.0, 0.5);',
      '  float hr = 260.0 * uDpr;',
      '  float halo = exp(-(ml * ml) / (hr * hr)) * uMouse.z;',
      '  float yN = fc.y / uRes.y;',
      '  float fade = mix(0.35, 1.0, smoothstep(0.08, 0.55, yN));',
      '  float base = (c.x * (0.10 + 0.5 * halo) + c.y * 0.9 + c.z * (0.16 + 0.4 * halo)) * fade;',
      '  vec3 tx = texture2D(uText, p / uRes).rgb;',
      '  float m = tx.r * uTextOn; float mg = tx.g * uTextOn;',
      '  float rv = vnoise(fc / (110.0 * uDpr)) * 0.55 + (fc.x / uRes.x) * 0.75 + (1.0 - yN) * 0.1;',
      '  float thr = uReveal * 1.6 - 0.25;',
      '  float vis = 1.0 - smoothstep(thr - 0.06, thr, rv);',
      '  float edge = (1.0 - smoothstep(0.0, 0.12, abs(rv - thr))) * (1.0 - step(0.999, uReveal));',
      '  vec3 c2 = circuit(p + vec2(0.0, t * 6.0 * uDpr), 7.0 * uDpr, t * 1.4, 4.0, 0.35);',
      '  float fill = m * (0.86 + 0.14 * c2.x) * vis;',
      '  float scan = m * edge * (0.4 + 0.6 * c2.x + c2.y);',
      '  float aura = mg * 0.12 * vis * (0.6 + halo);',
      '  float a = clamp(base * (1.0 - m * vis) + fill + scan + aura, 0.0, 1.0);',
      '  vec3 col = mix(uBg, uFg, a);',
      '  col += (h21(fc + fract(t * 7.0) * 113.0) - 0.5) * 0.03;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    }
    var vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
    var prog = vs && fs ? gl.createProgram() : null;
    if (prog) { gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); }
    if (!prog || !gl.getProgramParameter(prog, gl.LINK_STATUS)) { root.classList.add('no-gl'); return null; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['uRes', 'uTime', 'uDpr', 'uReveal', 'uTextOn', 'uMouse', 'uRip0', 'uRip1', 'uRip2', 'uRip3', 'uText', 'uFg', 'uBg'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]));
    gl.uniform1i(U.uText, 0);

    var tc = document.createElement('canvas'), tctx = tc.getContext('2d');
    var W = 1, H = 1, dpr = 1, textOn = 0, fontOk = false;
    var fg = [1, 1, 1], bg = [0, 0, 0];
    var mxp = -9999, myp = -9999, smx = -9999, smy = -9999, mz = 0, hover = 0, lastRip = null, travel = 0;
    var rips = [[0, 0, -10, 0], [0, 0, -10, 0], [0, 0, -10, 0], [0, 0, -10, 0]], ripI = 0;
    var t0 = performance.now(), revealStart = t0 + (hadIntro ? 1150 : 150);
    var visible = true, running = false, rafId = null, lost = false;

    function readColors() {
      var cs = getComputedStyle(root);
      var f = (cs.getPropertyValue('--fg-rgb') || '255,255,255').split(',').map(function (v) { return (+v) / 255; });
      var b = (cs.getPropertyValue('--bg-rgb') || '0,0,0').split(',').map(function (v) { return (+v) / 255; });
      if (f.length === 3) fg = f;
      if (b.length === 3) bg = b;
    }

    /* Textura wordmark-ului: fiecare literă e desenată exact peste litera HTML (aceeași poziție, lățime și linie de bază).
       Canal R = litera, canal G = o aură estompată (prin umbră). */
    function drawText() {
      var wm = $('.wordmark', section);
      tc.width = W; tc.height = H;
      tctx.setTransform(1, 0, 0, 1, 0, 0);
      tctx.fillStyle = '#000';
      tctx.fillRect(0, 0, W, H);
      if (!wm || !fontOk) { upload(); return; }
      var sr = section.getBoundingClientRect();
      var kx = W / Math.max(1, sr.width), ky = H / Math.max(1, sr.height);
      var fs = parseFloat(getComputedStyle(wm).fontSize) * ky;
      tctx.font = '900 ' + fs.toFixed(1) + 'px Archivo, "Helvetica Neue", Arial, sans-serif';
      if ('fontStretch' in tctx) { try { tctx.fontStretch = 'expanded'; } catch (e) {} }
      tctx.textBaseline = 'alphabetic';
      var letters = [];
      $$('.m', wm).forEach(function (m) {
        var ch = m.textContent.trim();
        if (!ch) return;
        var r = m.getBoundingClientRect();
        var probe = document.createElement('i');
        probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        m.appendChild(probe);
        var by = probe.getBoundingClientRect().top;
        m.removeChild(probe);
        var mw = tctx.measureText(ch).width || 1;
        letters.push({ ch: ch, x: (r.left - sr.left) * kx, y: (by - sr.top) * ky, sx: (r.width * kx) / mw });
      });
      tctx.globalCompositeOperation = 'lighter';
      letters.forEach(function (L) {
        tctx.setTransform(L.sx, 0, 0, 1, L.x, L.y);
        tctx.fillStyle = '#ff0000';
        tctx.fillText(L.ch, 0, 0);
      });
      var off = 100000;
      tctx.shadowColor = '#00ff00';
      tctx.shadowBlur = 46 * ky;
      tctx.shadowOffsetX = off;
      letters.forEach(function (L) {
        tctx.setTransform(L.sx, 0, 0, 1, L.x, L.y);
        tctx.fillStyle = '#00ff00';
        tctx.fillText(L.ch, -off / L.sx, 0);
      });
      tctx.shadowColor = 'transparent';
      tctx.globalCompositeOperation = 'source-over';
      upload();
      textOn = 1;
      section.classList.add('gl-ready');
    }
    function upload() {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, tc);
    }

    function resize() {
      var r = section.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5) * (typeof quality === 'number' ? quality : 1);
      var w = Math.max(1, r.width * dpr), h = Math.max(1, r.height * dpr);
      var k = Math.min(1, Math.sqrt(2.4e6 / (w * h)));        // plafon de pixeli, pentru 60 fps
      dpr *= k;
      W = Math.max(1, Math.round(r.width * dpr));
      H = Math.max(1, Math.round(r.height * dpr));
      canvas.width = W; canvas.height = H;
      gl.viewport(0, 0, W, H);
      drawText();
      if (!running) render(performance.now());
    }

    function render(now) {
      if (lost) return;
      var time = reduce ? 14 : (now - t0) / 1000;
      mz += (hover - mz) * 0.06;
      if (smx < -9000) { smx = mxp; smy = myp; }
      smx += (mxp - smx) * 0.16;
      smy += (myp - smy) * 0.16;
      var rv = reduce ? 1 : clamp((now - revealStart) / 1900, 0, 1);
      rv = 1 - Math.pow(1 - rv, 3);
      gl.uniform2f(U.uRes, W, H);
      gl.uniform1f(U.uTime, time);
      gl.uniform1f(U.uDpr, dpr);
      gl.uniform1f(U.uReveal, rv);
      gl.uniform1f(U.uTextOn, textOn);
      gl.uniform3f(U.uMouse, smx, smy, mz);
      for (var i = 0; i < 4; i++) gl.uniform4f(U['uRip' + i], rips[i][0], rips[i][1], rips[i][2], rips[i][3]);
      gl.uniform3f(U.uFg, fg[0], fg[1], fg[2]);
      gl.uniform3f(U.uBg, bg[0], bg[1], bg[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    /* Calitate adaptivă: dacă media cadrelor trece de ~28 ms, scădem rezoluția (de cel mult două ori) */
    var quality = 1, fN = 0, fSum = 0, fLast = 0;
    function frame(now) {
      render(now);
      if (fLast) { fSum += now - fLast; fN++; }
      fLast = now;
      if (fN >= 40) {
        if (fSum / fN > 28 && quality > 0.5) { quality = Math.max(0.5, quality - 0.25); resize(); }
        fN = 0; fSum = 0;
      }
      rafId = running ? requestAnimationFrame(frame) : null;
    }
    function update() {
      var should = visible && !document.hidden && !reduce && !lost;
      if (should && !running) { running = true; fLast = 0; fN = 0; fSum = 0; rafId = requestAnimationFrame(frame); }
      else if (!should && running) { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }
    }

    function toLocal(e) {
      var r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * (W / r.width), (r.bottom - e.clientY) * (H / r.height)];
    }
    function addRipple(x, y, amp) {
      rips[ripI] = [x, y, (performance.now() - t0) / 1000, amp];
      ripI = (ripI + 1) % 4;
      if (reduce) render(performance.now());
    }
    if (!reduce) {
      section.addEventListener('pointermove', function (e) {
        var p = toLocal(e);
        if (e.pointerType === 'mouse') {
          if (lastRip) travel += Math.hypot(p[0] - lastRip[0], p[1] - lastRip[1]) / dpr;
          lastRip = p;
          if (travel > 140) { travel = 0; addRipple(p[0], p[1], 0.32); }
          mxp = p[0]; myp = p[1]; hover = 1;
        }
      }, { passive: true });
      section.addEventListener('pointerleave', function () { hover = 0; lastRip = null; });
      section.addEventListener('pointerdown', function (e) {
        var p = toLocal(e);
        addRipple(p[0], p[1], 1);
        if (e.pointerType !== 'mouse') { mxp = p[0]; myp = p[1]; smx = p[0]; smy = p[1]; hover = 1; setTimeout(function () { hover = 0; }, 700); }
      }, { passive: true });
    }

    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); lost = true; update();
      section.classList.remove('gl-ready'); root.classList.add('no-gl');
    });

    readColors();
    resize();
    if (document.fonts && document.fonts.load) {
      document.fonts.load('900 100px Archivo').then(function () { fontOk = true; drawText(); if (!running) render(performance.now()); }, function () { fontOk = true; drawText(); });
    } else {
      setTimeout(function () { fontOk = true; drawText(); }, 600);
    }
    var rt = null;
    var onResize = function () { clearTimeout(rt); rt = setTimeout(resize, 120); };
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(section);
    else window.addEventListener('resize', onResize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; update(); }).observe(section);
    }
    document.addEventListener('visibilitychange', update);
    update();

    return {
      recolor: function () { requestAnimationFrame(function () { readColors(); if (!running) render(performance.now()); }); },
      retext: function () { /* literele nu depind de limbă; păstrat pentru simetrie */ }
    };
  })();

  /* =========================================================
     Hover pe imagini: o lentilă WebGL subtilă (mărire + undă fină) care urmărește mouse-ul.
     Un singur context, mutat peste imaginea curentă. Fallback CSS: zoom lent (.no-fxgl).
     ========================================================= */
  (function () {
    var imgs = $$('img.fx');
    if (!imgs.length) return;
    if (!finePointer || reduce) { root.classList.add('no-fxgl'); return; }
    var cv = document.createElement('canvas');
    cv.className = 'fx-canvas';
    cv.setAttribute('aria-hidden', 'true');
    var gl = null;
    try { gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, failIfMajorPerformanceCaveat: true }); } catch (e) {}
    if (!gl) { root.classList.add('no-fxgl'); return; }
    var VS = 'attribute vec2 a;varying vec2 v;void main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}';
    var FS = [
      'precision mediump float;',
      'varying vec2 v; uniform sampler2D uT; uniform vec2 uM; uniform float uH; uniform float uTime; uniform float uAsp; uniform vec2 uCov;',
      'void main(){',
      '  vec2 uv = v; vec2 d = uv - uM; d.x *= uAsp; float r = length(d);',
      '  float k = smoothstep(0.34, 0.0, r) * uH;',
      '  uv -= (uv - uM) * k * 0.2;',
      '  float wv = sin(r * 40.0 - uTime * 3.0) * 0.0035 * uH * smoothstep(0.5, 0.0, r);',
      '  uv += normalize(d + 0.00001) * wv * vec2(1.0 / uAsp, 1.0);',
      '  vec2 tuv = (uv - 0.5) * uCov + 0.5;',
      '  vec3 c = texture2D(uT, tuv).rgb + k * 0.05;',
      '  gl_FragColor = vec4(c, 1.0);',
      '}'
    ].join('\n');
    function compile(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { root.classList.add('no-fxgl'); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { root.classList.add('no-fxgl'); return; }
    gl.useProgram(prog);
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var al = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(al);
    gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['uT', 'uM', 'uH', 'uTime', 'uAsp', 'uCov'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    var texs = {}, host = null, img = null, hov = 0, tgt = 0, mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5, raf = null, t0 = performance.now();

    function texFor(im) {
      var key = im.currentSrc || im.src;
      if (texs[key]) return texs[key];
      var tx = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
      texs[key] = tx;
      return tx;
    }
    function attach(im, h) {
      try {
        if (host !== h) { h.appendChild(cv); host = h; }
        img = im;
        var r = h.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d));
        gl.viewport(0, 0, cv.width, cv.height);
        gl.bindTexture(gl.TEXTURE_2D, texFor(im));
        var cA = r.width / Math.max(1, r.height), iA = im.naturalWidth / Math.max(1, im.naturalHeight);
        if (cA > iA) gl.uniform2f(U.uCov, 1, iA / cA); else gl.uniform2f(U.uCov, cA / iA, 1);
        gl.uniform1f(U.uAsp, cA);
        return true;
      } catch (e) { root.classList.add('no-fxgl'); return false; }
    }
    function loop(now) {
      hov += (tgt - hov) * 0.08;
      smx += (mx - smx) * 0.14; smy += (my - smy) * 0.14;
      gl.uniform2f(U.uM, smx, smy);
      gl.uniform1f(U.uH, hov);
      gl.uniform1f(U.uTime, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (tgt === 0 && hov < 0.01) { cv.classList.remove('is-on'); raf = null; return; }
      raf = requestAnimationFrame(loop);
    }
    imgs.forEach(function (im) {
      var h = im.closest('.frame') || im.parentNode;
      h.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse' || !im.complete || !im.naturalWidth) return;
        var curtain = im.closest('.curtain');
        if (curtain && !curtain.closest('.is-active')) return;
        if (!attach(im, h)) return;
        var r = h.getBoundingClientRect();
        mx = smx = (e.clientX - r.left) / r.width; my = smy = 1 - (e.clientY - r.top) / r.height;
        tgt = 1;
        cv.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      h.addEventListener('pointermove', function (e) {
        if (host !== h) return;
        var r = h.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width; my = 1 - (e.clientY - r.top) / r.height;
      });
      h.addEventListener('pointerleave', function () { if (host === h) tgt = 0; });
    });
  })();

  /* =========================================================
     Carusel: scroll-snap nativ + săgeți, taste, drag cu mouse-ul,
     mască (wipe) + parallax intern calculate din poziția de scroll
     ========================================================= */
  (function () {
    var rail = $('#rail');
    if (!rail) return;
    var slides = $$('.slide', rail);
    var n = slides.length;
    var wrap = rail.closest('.sec-projects');
    var curEl = $('.rail-cur', wrap), total = $('.rail-total', wrap), bar = $('.rail-bar', wrap);
    var btns = $$('.rail-btn', wrap);
    var live = $('.rail-live', wrap);
    if (total) total.textContent = pad2(n);

    function index() { return clamp(Math.round(rail.scrollLeft / Math.max(1, rail.clientWidth)), 0, n - 1); }
    function go(i, announce) {
      i = clamp(i, 0, n - 1);
      rail.scrollTo({ left: slides[i].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      if (announce && live) live.textContent = D().slideNow(i + 1, n);
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-disabled') === 'true') return;
        go(index() + (+b.getAttribute('data-dir')), true);
      });
    });
    rail.addEventListener('keydown', function (e) {
      var k = e.key, i = index();
      if (k === 'ArrowRight') go(i + 1, true);
      else if (k === 'ArrowLeft') go(i - 1, true);
      else if (k === 'Home') go(0, true);
      else if (k === 'End') go(n - 1, true);
      else return;
      e.preventDefault();
    });

    /* Drag cu mouse-ul (pe touch rămâne swipe-ul nativ) */
    var drag = null;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, sl: rail.scrollLeft, moved: false };
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; rail.classList.add('is-dragging'); }
      if (drag.moved) rail.scrollLeft = drag.sl - dx;
    });
    window.addEventListener('pointerup', function (e) {
      if (!drag) return;
      var d = drag; drag = null;
      if (!d.moved) return;
      var dx = e.clientX - d.x, i = Math.round(d.sl / Math.max(1, rail.clientWidth));
      var target = Math.abs(dx) > rail.clientWidth * 0.1 ? i + (dx < 0 ? 1 : -1) : i;
      rail.classList.remove('is-dragging');
      var stop = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
      window.addEventListener('click', stop, true);
      setTimeout(function () { window.removeEventListener('click', stop, true); }, 0);
      go(target, true);
    });
    rail.addEventListener('dragstart', function (e) { e.preventDefault(); });

    var rticking = false;
    function sync() {
      rticking = false;
      var i = index(), w = Math.max(1, rail.clientWidth), sl = rail.scrollLeft;
      if (curEl) curEl.textContent = pad2(i + 1);
      if (bar) bar.style.transform = 'scaleX(' + Math.min(1, (sl + w) / Math.max(w, rail.scrollWidth)).toFixed(4) + ')';
      if (btns[0]) btns[0].setAttribute('aria-disabled', String(i === 0));
      if (btns[1]) btns[1].setAttribute('aria-disabled', String(i === n - 1));
      if (reduce) return;
      slides.forEach(function (s) {
        var p = clamp((s.offsetLeft - sl) / w, -1, 1);
        var a = Math.abs(p);
        s.style.setProperty('--ml', (p > 0 ? p * 100 : 0).toFixed(2) + '%');
        s.style.setProperty('--mr', (p < 0 ? -p * 100 : 0).toFixed(2) + '%');
        s.style.setProperty('--px', (-p * 22).toFixed(2) + '%');
        s.style.setProperty('--tx', (p * 14).toFixed(2) + '%');
        var txt = $('.proj-text', s);
        if (txt) txt.style.opacity = a < 0.002 ? '' : Math.max(0, 1 - a * 1.6).toFixed(3);
      });
    }
    rail.addEventListener('scroll', function () {
      if (rticking) return;
      rticking = true;
      requestAnimationFrame(sync);
    }, { passive: true });
    window.addEventListener('resize', function () { requestAnimationFrame(sync); });
    sync();
  })();

  /* =========================================================
     Simularea plăcii (studiul de caz): urmează stările din UC.vhd pentru un singur jucător,
     cu întârzierea aleasă ca în rand_reg.vhd (LFSR pe 16 biți, 1–5 s) și afișajul din DISPLAY_CTRL.vhd.
     ========================================================= */
  var fsmNodes = $$('.fsm [data-state]');
  function fsmSet(name) { fsmNodes.forEach(function (g) { g.classList.toggle('is-now', g.getAttribute('data-state') === name); }); }

  var game = (function () {
    var display = $('#rig-display'), btn = $('#rig-btn'), status = $('#rig-status');
    if (!display || !btn || !status) return null;
    var btnLabel = $('.btn-in', btn) || btn;
    var stateEl = $('#rig-state');
    var ledS = $('[data-led="semnal"]'), ledF = $('[data-led="fault"]');
    var bestEls = $$('[data-round]');

    var NS = 'http://www.w3.org/2000/svg';
    var T = 9, L = 38;
    function hSeg(cx, cy) { var a = L / 2, h = T / 2; return [cx - a, cy, cx - a + h, cy - h, cx + a - h, cy - h, cx + a, cy, cx + a - h, cy + h, cx - a + h, cy + h].join(' '); }
    function vSeg(cx, cy) { var a = L / 2, h = T / 2; return [cx, cy - a, cx + h, cy - a + h, cx + h, cy + a - h, cx, cy + a, cx - h, cy + a - h, cx - h, cy - a + h].join(' '); }
    var SEG = { a: hSeg(30, 6), b: vSeg(52, 28), c: vSeg(52, 72), d: hSeg(30, 94), e: vSeg(8, 72), f: vSeg(8, 28), g: hSeg(30, 50) };
    /* glifele din decodorul de segmente din DISPLAY_CTRL.vhd (inclusiv „U” și „r”) */
    var GLYPH = { '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', 'U': 'bcdef', 'r': 'eg', ' ': '' };
    var digits = [];
    for (var i = 0; i < 8; i++) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '-6 0 74 100');
      svg.setAttribute('class', 'digit');
      svg.setAttribute('aria-hidden', 'true');
      var segs = {};
      for (var k in SEG) {
        var p = document.createElementNS(NS, 'polygon');
        p.setAttribute('points', SEG[k]);
        p.setAttribute('class', 'seg');
        p.setAttribute('transform', 'skewX(-6) translate(6 0)');
        svg.appendChild(p);
        segs[k] = p;
      }
      display.appendChild(svg);
      digits.push(segs);
    }

    var state = 'IDLE', round = 1, held = 0, live = 0, best = null, startedAt = 0, timer = null, raf = null, lastMs = null;
    var rounds = [null, null, null, null, null];

    /* rand_reg.vhd: registru de 16 biți, seed x"ACE1", reacție din biții 15, 13, 12, 10; biții 2..0 aleg întârzierea */
    var lfsr = 0xACE1;
    function lfsrStep() { var bit = ((lfsr >> 15) ^ (lfsr >> 13) ^ (lfsr >> 12) ^ (lfsr >> 10)) & 1; lfsr = ((lfsr << 1) | bit) & 0xffff; }
    function pickDelay() {
      var steps = 1 + (Math.floor(performance.now() * 997) % 4093);   // în hardware registrul avansează la fiecare ceas
      for (var s = 0; s < steps; s++) lfsrStep();
      switch (lfsr & 7) {
        case 0: case 5: return 1000;
        case 1: case 6: return 2000;
        case 2: case 7: return 3000;
        case 3: return 4000;
        default: return 5000;
      }
    }

    function pad4(n) { var s = String(clamp(Math.round(n), 0, 9999)); while (s.length < 4) s = '0' + s; return s; }
    function text() { return 'U1r' + Math.min(round, 5) + pad4(state === 'PLAY' ? live : (state === 'WINNER' ? (best == null ? 0 : best) : held)); }
    function draw() {
      var s = text();
      for (var d = 0; d < 8; d++) {
        var on = GLYPH[s.charAt(d)] || '';
        for (var key in digits[d]) digits[d][key].classList.toggle('on', on.indexOf(key) !== -1);
      }
      display.setAttribute('aria-label', D().rig.disp('U1 r' + Math.min(round, 5) + ' ' + s.slice(4)));
    }
    function setLed(el, on) { if (el) el.classList.toggle('on', !!on); }
    function relabel() {
      var r = D().rig;
      btnLabel.textContent = state === 'IDLE' ? r.start : state === 'WINNER' ? r.again : state === 'PLAY' ? r.react : state === 'WAIT_RANDOM' ? r.react : r.wait;
      var st = r[state];
      if (state === 'WAIT_RANDOM') st = r.WAIT_RANDOM(round);
      else if (state === 'EVAL' || state === 'RESTART_ROUND') st = lastMs == null ? r.FAULT : r.EVAL(lastMs);
      else if (state === 'WINNER') st = r.WINNER(best);
      if (typeof st === 'string') status.textContent = st;
      bestEls.forEach(function (el) { var v = rounds[+el.getAttribute('data-round')]; el.textContent = v == null ? r.none : v < 0 ? r.fault : v + ' ms'; });
    }
    function go(next) {
      state = next;
      if (stateEl) stateEl.textContent = next;
      fsmSet(next);
      btn.classList.toggle('is-go', next === 'PLAY');
      btn.setAttribute('aria-disabled', String(next === 'FAULT' || next === 'EVAL' || next === 'RESTART_ROUND'));
      setLed(ledS, next === 'PLAY');
      setLed(ledF, next === 'FAULT');
      draw();
      relabel();
    }
    function waitRandom() {
      go('WAIT_RANDOM');
      timer = setTimeout(function () {                 // comparator: t_total ≥ t_random → time_done
        startedAt = performance.now(); live = 0;
        go('PLAY');
        var tick = function () { live = performance.now() - startedAt; draw(); raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick);
      }, pickDelay());
    }
    function restartRound() {
      go('RESTART_ROUND');
      if (round >= 5) { go('WINNER'); return; }      // game_done
      round++;
      waitRandom();
    }
    function press() {
      if (state === 'IDLE') { round = 1; held = 0; best = null; lastMs = null; rounds = [null, null, null, null, null]; waitRandom(); }
      else if (state === 'WAIT_RANDOM') {             // react înainte de time_done → FAULT
        clearTimeout(timer);
        held = 0; lastMs = null; rounds[round - 1] = -1;
        go('FAULT');
        timer = setTimeout(function () { go('EVAL'); timer = setTimeout(restartRound, 500); }, 500);   // 50 000 000 de cicluri = 0,5 s
      } else if (state === 'PLAY') {                   // save_if_best
        cancelAnimationFrame(raf);
        var ms = Math.round(performance.now() - startedAt);
        held = ms; lastMs = ms; rounds[round - 1] = ms;
        if (best === null || ms < best) best = ms;
        go('EVAL');
        timer = setTimeout(restartRound, 500);
      } else if (state === 'WINNER') { round = 1; held = 0; go('IDLE'); }
    }
    btn.addEventListener('click', press);
    go('IDLE');
    return { relabel: relabel };
  })();

  /* =========================================================
     Ora locală din Cluj, în footer
     ========================================================= */
  (function () {
    var clocks = $$('.clock');
    if (!clocks.length || !window.Intl) return;
    var f, z;
    try {
      f = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      try { z = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Bucharest', timeZoneName: 'shortOffset' }); } catch (e) { z = null; }
    } catch (e) { return; }
    function tick() {
      var now = new Date(), s = f.format(now), off = '';
      if (z && z.formatToParts) { z.formatToParts(now).forEach(function (p) { if (p.type === 'timeZoneName') off = p.value; }); }
      clocks.forEach(function (c) { var tm = $('.clock-time', c); if (tm) { tm.textContent = s + (off ? ' ' + off : ''); tm.setAttribute('datetime', now.toISOString()); } });
    }
    clocks.forEach(function (c) { c.hidden = false; });
    tick();
    setInterval(tick, 1000);
  })();

  /* =========================================================
     Favicon animat discret: LED-ul din colț clipește scurt la câteva secunde
     ========================================================= */
  (function () {
    var link = $('link[rel="icon"]');
    if (!link || reduce) return;
    function icon(on) {
      return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#000"/><path d="M44.5 21.5A15 15 0 1 0 44.5 42.5" fill="none" stroke="#fff" stroke-width="8"/><rect x="47" y="28" width="8" height="8" fill="#fff" fill-opacity="' + (on ? 1 : 0.15) + '"/></svg>');
    }
    var on = icon(true), off = icon(false);
    setInterval(function () {
      if (document.hidden) return;
      link.setAttribute('href', off);
      setTimeout(function () { link.setAttribute('href', on); }, 260);
    }, 3200);
  })();

  /* Aplică limba (separă și titlurile pentru dezvăluire) */
  applyLang(lang);
})();
