/* CALEA · Denis-Alexandru Călin · v4
   i18n, meniu, dezvăluiri, raze WebGL în hero, semnul 3D pe scroll, lentilă WebGL pe imagini,
   parallax, simularea plăcii FPGA, ceasul din footer. Vanilla JS, fără librării.
   Folosit de index.html și de proiecte/fpga.html. */
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
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* =========================================================
     i18n: textele RO se citesc din HTML; EN sunt aici
     (pagina de studiu de caz adaugă cheile ei în window.CALEA_EN)
     ========================================================= */
  var EN = {
    'skip': 'Skip to content',
    'nav.aria': 'Main navigation',
    'brand.aria': 'CALEA, back to top',
    'menu.open': 'Open menu',
    'nav.projects': 'Projects',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.cv': 'Download CV',
    'lang.aria': 'Site language',
    'hero.role': 'Year 2 Computer Engineering student, UTCN · Cluj-Napoca',
    'hero.seek': 'Looking for an internship, in Cluj-Napoca or remote.',
    'hero.cta1': 'See the projects',
    'hero.cta2': 'My CV',
    'sign.title': 'What I do',
    'sign.lede': 'I study Computer Engineering at UTCN and work on projects alongside university. Mostly hardware so far, apps from now on.',
    'sign.s1h': 'Hardware',
    'sign.s1': 'VHDL on an FPGA: a reaction game with 14 modules and an FSM.',
    'sign.s2h': 'Code',
    'sign.s2': 'C/C++ at university. Java and SQL, just getting started.',
    'sign.s3h': 'Apps',
    'sign.s3': 'Now: Bonix, a Flutter app that tracks spending per product.',
    'work.title': 'Selected work',
    'work.note': 'Two channels, each with its own color. Pick one or scroll.',
    'chan.aria': 'Pick a project',
    'p.open': 'Open the project',
    'p2.s1l': 'Android app, in Dart, with SQLite',
    'p2.s2l': 'screens, with swipe between them',
    'p2.s3l': 'categories, from fruit to subscriptions',
    'ph.alt': 'Bonix, the Home screen: 1,726 lei spent in November, the month chart and the categories',
    'ph.cap': 'Screenshots from the app, with its demo data',
    'ph.o1': 'Bananas',
    'chan.read': 'signal',
    'p2.f1': 'Platform',
    'p2.f2': 'Data',
    'p2.f2v': 'local SQLite, no account',
    'p2.f4': 'Screens',
    'p2.f4v': 'Home, Add, Report',
    'p2.rcIn': 'Receipt text',
    'p2.rcOut': 'Clean product',
    'p2.s2': 'Where it stands',
    'p2.d5': 'Scanning the receipt with the camera (on-device OCR)',
    'p1.kind': 'Hardware, VHDL',
    'p1.title': 'FPGA Multi-Player Reaction Time Game',
    'p1.img': 'Isometric render in graphite and silver of an FPGA chip marked TOP_GAME, with traces fanning out from its pins',
    'p1.desc': 'A reaction time game for up to 4 players and 5 rounds, written entirely in VHDL: no processor and no software. The board lights an LED after a random delay and measures the reaction in milliseconds.',
    'p1.s1': 'VHDL modules',
    'p1.s2': 'FSM states',
    'p1.s3': 'tick derived from the 100 MHz clock',
    'p1.case': 'Read the case study',
    'link.code': 'Code on GitHub',
    'link.newtab': ' (opens in a new tab)',
    'tags.aria': 'Technologies',
    'p2.state': 'In progress, since November 2026',
    'p2.kind': 'Mobile app',
    'p2.title': 'Bonix, spending per product',
    'p2.desc': 'I want to know not just how much I spent on food, but how much on bananas. Bonix reads the receipt, recognizes every product (bananas from Lidl and from Kaufland end up in the same place) and shows where the money goes, by week and by month. Everything stays on the phone.',
    'p2.note': 'The code goes on GitHub once receipt scanning works.',
    'about.title': 'About me',
    'about.photo': 'Photo coming soon',
    'about.img': 'Denis-Alexandru Călin',
    'about.lede': 'I am Denis and I study in Cluj. I like understanding a system from the bottom up: from logic gates and VHDL to programs in C++ and Java.',
    'about.p': 'I am looking for an internship in a team I can learn from, in Cluj-Napoca or remote.',
    'about.when': '2025 – present',
    'about.school': 'Technical University of Cluj-Napoca',
    'about.prog': 'Computer Engineering, year 2. Faculty of Automation and Computer Science.',
    'cv.title': 'The CV, on one page',
    'cv.alt': 'Preview: the CV, one A4 page',
    'cv.open': 'Open the CV (PDF) in a new tab',
    'cv.lead': 'Projects, education, languages and the technologies I use. One A4 page, in English or Romanian.',
    'cv.en': 'CV in English',
    'cv.ro': 'CV in Romanian',
    'contact.title': 'Get in touch',
    'contact.lead': 'Have an internship or a project I can help with? I reply by email.',
    'clock.label': 'Time in Cluj',
    'footer.top': 'Back to top'
  };
  if (window.CALEA_EN) { for (var ek in window.CALEA_EN) EN[ek] = window.CALEA_EN[ek]; }

  /* Texte dinamice, în ambele limbi */
  var DYN = {
    ro: {
      title: document.title,
      menuOpen: 'Deschide meniul', menuClose: 'Închide meniul',
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
  var metaDesc = $('meta[name="description"]'), ogDesc = $('meta[property="og:description"]');
  DYN.ro.desc = metaDesc ? metaDesc.content : '';
  DYN.ro.ogDesc = ogDesc ? ogDesc.content : '';
  DYN.en.title = root.getAttribute('data-en-title') || DYN.en.title;
  DYN.en.desc = root.getAttribute('data-en-desc') || 'CALEA, the portfolio of Denis-Alexandru Călin: Year 2 Computer Engineering student (UTCN, Cluj-Napoca). A reaction game written in VHDL on an FPGA and an expense app in the works. Looking for an internship, in Cluj-Napoca or remote.';
  DYN.en.ogDesc = root.getAttribute('data-en-og') || 'Year 2 Computer Engineering student at UTCN, Cluj-Napoca. From logic gates in VHDL to apps. Looking for an internship.';

  var RO = {};
  var textEls = $$('[data-i18n]');
  var htmlEls = $$('[data-i18n-html]');
  var ariaEls = $$('[data-i18n-aria]');
  var altEls = $$('[data-i18n-alt]');
  textEls.forEach(function (el) { RO[el.getAttribute('data-i18n')] = el.textContent; });
  htmlEls.forEach(function (el) { RO[el.getAttribute('data-i18n-html')] = el.innerHTML; });
  ariaEls.forEach(function (el) { RO[el.getAttribute('data-i18n-aria')] = el.getAttribute('aria-label'); });
  altEls.forEach(function (el) { RO[el.getAttribute('data-i18n-alt')] = el.getAttribute('alt'); });

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
    $$('.lang-btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });

    var d = D();
    document.title = d.title;
    setMeta('meta[name="description"]', 'content', d.desc);
    setMeta('meta[property="og:description"]', 'content', d.ogDesc);
    setMeta('meta[property="og:locale"]', 'content', lang === 'en' ? 'en_US' : 'ro_RO');
    setMeta('meta[property="og:locale:alternate"]', 'content', lang === 'en' ? 'ro_RO' : 'en_US');

    syncCv();
    syncMenuLabel();
    if (game) game.relabel();
    if (typeof channels !== 'undefined' && channels) setTimeout(channels.place, 60);
  }

  /* Comutatorul de limbă: cursorul se întinde, textul trece printr-un blur scurt */
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

  /* Un singur handler de scroll (rAF): header, parallax, progresul semnului */
  var lastY = window.pageYOffset;
  var scrollSubs = [];
  function onScroll() {
    var y = window.pageYOffset;
    if (header) {
      header.classList.toggle('is-scrolled', y > 8);
      var down = y > lastY + 4, up = y < lastY - 4;
      if (menuOpen() || header.contains(document.activeElement) || y < 200) header.classList.remove('is-hidden');
      else if (down) header.classList.add('is-hidden');
      else if (up) header.classList.remove('is-hidden');
      if (down || up) lastY = y;
      body.classList.toggle('header-shown', !header.classList.contains('is-hidden'));
    }
    for (var i = 0; i < scrollSubs.length; i++) scrollSubs[i]();
  }
  if (header) header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
  var ticking = false;
  function requestScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);

  /* Secțiunea curentă în nav (aria-current) */
  var navLinks = $$('.nav-links a[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var el = document.getElementById(a.getAttribute('href').slice(1)); if (el) spy.observe(el); });
  }

  /* =========================================================
     Dezvăluiri: un bloc devine „activ” (o singură dată) când ocupă ~45% din viewport
     ========================================================= */
  function countUp(el) {
    var to = +el.getAttribute('data-to');
    if (reduce || !to) { el.textContent = String(to); return; }
    var start = null, dur = 1500;
    el.textContent = '0';
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = String(Math.round(to * e));
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
        var need = Math.min(vh, en.boundingClientRect.height) * 0.4;
        if (en.isIntersecting && en.intersectionRect.height >= need) { activate(en.target); rio.unobserve(en.target); }
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

  /* Butoane magnetice (doar mouse, fără reduced-motion). Cursorul rămâne cel nativ. */
  if (finePointer && !reduce) {
    $$('.magnetic').forEach(function (el) {
      var inner = $('.btn-in', el);
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)), dy = (e.clientY - (r.top + r.height / 2));
        el.style.transition = 'transform 0.18s linear, box-shadow 0.5s ease';
        el.style.transform = 'translate3d(' + (dx * 0.2).toFixed(1) + 'px,' + (dy * 0.3).toFixed(1) + 'px,0)';
        if (inner) inner.style.transform = 'translate3d(' + (dx * 0.1).toFixed(1) + 'px,' + (dy * 0.14).toFixed(1) + 'px,0)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease';
        el.style.transform = '';
        if (inner) inner.style.transform = '';
      });
    });
  }

  /* =========================================================
     Utilitare WebGL
     ========================================================= */
  function glContext(canvas, opts) {
    var o = { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: true, premultipliedAlpha: true };
    for (var k in opts) o[k] = opts[k];
    try { return canvas.getContext('webgl', o) || null; } catch (e) { return null; }
  }
  function program(gl, vsSrc, fsSrc) {
    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (window.console) console.warn(gl.getShaderInfoLog(s)); gl.deleteShader(s); return null; }
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, vsSrc), fs = sh(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }
  function uniforms(gl, prog, names) { var U = {}; names.forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); }); return U; }
  /* rulează doar cât elementul e pe ecran și tab-ul e vizibil */
  function visLoop(el, frame) {
    var visible = false, running = false, raf = null;
    function tick(now) { frame(now); raf = running ? requestAnimationFrame(tick) : null; }
    function update() {
      var should = visible && !document.hidden;
      if (should && !running) { running = true; raf = requestAnimationFrame(tick); }
      else if (!should && running) { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; update(); }).observe(el);
    else { visible = true; }
    document.addEventListener('visibilitychange', update);
    update();
    return { stop: function () { visible = false; update(); }, running: function () { return running; } };
  }

  /* =========================================================
     1. Hero: raze de lumină volumetrice, reci, din spatele literelor CALEA.
     Lumina stă în spatele cuvântului; literele (o mască desenată exact peste literele HTML) o blochează,
     iar razele ies printre ele (radial blur spre sursă). Plus fascicule fine de sus și praf în lumină.
     Randat la jumătate de rezoluție (lumina e moale), pauză off-screen, cadru static la reduced-motion.
     ========================================================= */
  (function () {
    var section = $('.hero'), canvas = $('.hero-gl'), wm = $('.wordmark');
    if (!section || !canvas || !wm) return;
    var gl = glContext(canvas, {});
    if (!gl) { root.classList.add('no-gl'); return; }
    var N = coarse ? 28 : 48;
    var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';
    var FS = [
      'precision highp float;',
      '#define N ' + N,
      'uniform vec2 uRes; uniform float uTime; uniform float uIntro; uniform float uMaskOn; uniform vec2 uLight; uniform sampler2D uMask;',
      'float h21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }',
      'float vn(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);',
      '  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }',
      'void main(){',
      '  vec2 uv = gl_FragCoord.xy / uRes;',
      '  vec2 asp = vec2(uRes.x / uRes.y, 1.0);',
      '  vec2 L = uLight;',
      '  vec2 d = (uv - L) * asp;',
      '  float dist = length(d);',
      '  float ang = atan(d.y, d.x);',
      /* raze ocluzate: mergem de la pixel spre sursă și adunăm lumina care nu e blocată de litere */
      '  vec2 st = (L - uv) / float(N) * 0.94;',
      '  vec2 p = uv; float acc = 0.0; float w = 1.0; float wsum = 0.0;',
      '  for (int i = 0; i < N; i++) {',
      '    p += st;',
      '    float occ = 1.0 - texture2D(uMask, p).r * uMaskOn;',
      '    vec2 q = (p - L) * asp;',
      '    float core = exp(-dot(q, q) * 7.0);',
      '    acc += occ * core * w; wsum += w;',
      '    w *= 0.955;',
      '  }',
      '  acc /= wsum;',
      '  float streak = vn(vec2(ang * 10.0, uTime * 0.06)) * 0.62 + vn(vec2(ang * 27.0 + 4.0, uTime * 0.1)) * 0.38;',
      '  float beams = 0.12 + 1.6 * streak * streak * streak;',
      '  float rays = acc * beams * exp(-dist * 1.7) * 1.25;',
      '  float glow = exp(-dist * dist * 12.0) * 0.16 + exp(-dist * 3.2) * 0.035;',
      /* fascicule largi care coboară de sus, foarte discrete */
      '  vec2 S = vec2(0.5 + 0.1 * sin(uTime * 0.04), 1.45);',
      '  vec2 ds = (uv - S) * asp;',
      '  float as = atan(ds.x, -ds.y);',
      '  float shafts = pow(vn(vec2(as * 8.0, uTime * 0.035)), 4.0) * smoothstep(2.2, 0.3, length(ds)) * 0.07;',
      '  float light = rays + glow + shafts;',
      /* praf care plutește încet în lumină */
      '  vec2 mp = vec2(uv.x * asp.x, uv.y + uTime * 0.008) * 18.0;',
      '  vec2 id = floor(mp); vec2 f = fract(mp) - 0.5;',
      '  vec2 o = (vec2(h21(id), h21(id + 7.31)) - 0.5) * 0.7;',
      '  float mote = smoothstep(0.07, 0.0, length(f - o)) * step(0.8, h21(id + 3.7)) * (0.55 + 0.45 * sin(uTime * 1.1 + h21(id) * 40.0));',
      '  vec3 bg = vec3(0.027, 0.027, 0.031);',
      '  vec3 cold = vec3(0.80, 0.86, 0.95);',
      '  vec3 col = bg + cold * (1.0 - exp(-light * 1.15)) * uIntro;',
      '  col += cold * mote * (0.04 + light * 1.2) * uIntro;',
      '  col += (h21(gl_FragCoord.xy + fract(uTime * 7.0) * 113.0) - 0.5) * 0.018;',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');
    var prog = program(gl, VS, FS);
    if (!prog) { root.classList.add('no-gl'); return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    var U = uniforms(gl, prog, ['uRes', 'uTime', 'uIntro', 'uMaskOn', 'uLight', 'uMask']);

    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]));
    gl.uniform1i(U.uMask, 0);

    var tc = document.createElement('canvas'), tctx = tc.getContext('2d');
    var W = 1, H = 1, maskOn = 0, fontOk = false, lost = false;
    var center = [0.5, 0.6], mx = 0, my = 0, smx = 0, smy = 0;
    var t0 = performance.now();

    /* Masca: fiecare literă desenată exact peste litera HTML (aceeași poziție, lățime, linie de bază) */
    function drawMask() {
      tc.width = W; tc.height = H;
      tctx.setTransform(1, 0, 0, 1, 0, 0);
      tctx.fillStyle = '#000';
      tctx.fillRect(0, 0, W, H);
      var sr = section.getBoundingClientRect();
      var wr = wm.getBoundingClientRect();
      center = [(wr.left + wr.width / 2 - sr.left) / sr.width, 1 - (wr.top + wr.height * 0.42 - sr.top) / sr.height];
      if (!fontOk) { upload(); return; }
      var kx = W / Math.max(1, sr.width), ky = H / Math.max(1, sr.height);
      var fs = parseFloat(getComputedStyle(wm).fontSize) * ky;
      tctx.font = '900 ' + fs.toFixed(1) + 'px Archivo, "Helvetica Neue", Arial, sans-serif';
      if ('fontStretch' in tctx) { try { tctx.fontStretch = 'expanded'; } catch (e) {} }
      tctx.textBaseline = 'alphabetic';
      tctx.fillStyle = '#fff';
      $$('.m', wm).forEach(function (m) {
        var ch = m.textContent.trim();
        if (!ch) return;
        var inner = m.firstElementChild || m;
        var r = inner.getBoundingClientRect();
        var probe = document.createElement('i');
        probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        inner.appendChild(probe);
        var by = probe.getBoundingClientRect().top;
        inner.removeChild(probe);
        /* în timpul intrării literele sunt translatate în jos: folosim poziția finală */
        var tr = getComputedStyle(inner).transform, dy = 0;
        if (tr && tr !== 'none') { var mt = tr.match(/matrix\(([^)]+)\)/); if (mt) dy = parseFloat(mt[1].split(',')[5]) || 0; }
        var mw = tctx.measureText(ch).width || 1;
        tctx.setTransform((r.width * kx) / mw, 0, 0, 1, (r.left - sr.left) * kx, (by - dy - sr.top) * ky);
        tctx.fillText(ch, 0, 0);
      });
      upload();
      maskOn = 1;
    }
    function upload() {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, tc);
    }
    function resize() {
      var r = section.getBoundingClientRect();
      var k = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
      W = Math.max(1, Math.round(r.width * k));
      H = Math.max(1, Math.round(r.height * k));
      canvas.width = W; canvas.height = H;
      gl.viewport(0, 0, W, H);
      drawMask();
      render(performance.now());
    }
    function render(now) {
      if (lost) return;
      var time = reduce ? 18 : (now - t0) / 1000;
      var intro = reduce ? 1 : smooth(0.25, 2.8, time);
      smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
      gl.uniform2f(U.uRes, W, H);
      gl.uniform1f(U.uTime, time);
      gl.uniform1f(U.uIntro, intro);
      gl.uniform1f(U.uMaskOn, maskOn);
      gl.uniform2f(U.uLight, center[0] + smx * 0.07, center[1] + 0.02 + smy * 0.04);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (!reduce) {
      section.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = section.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = -((e.clientY - r.top) / r.height - 0.5) * 2;
      }, { passive: true });
      section.addEventListener('pointerleave', function () { mx = 0; my = 0; });
    }
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); lost = true;
      section.classList.remove('gl-ready'); root.classList.add('no-gl');
    });

    resize();
    section.classList.add('gl-ready');
    var whenFont = document.fonts && document.fonts.load ? document.fonts.load('900 100px Archivo') : Promise.resolve();
    whenFont.then(function () { fontOk = true; drawMask(); render(performance.now()); }, function () { fontOk = true; drawMask(); });
    /* după intrarea literelor, re-măsurăm (fonturile și layout-ul sunt sigur gata) */
    setTimeout(function () { fontOk = true; drawMask(); if (reduce) render(performance.now()); }, 1800);
    var rt = null;
    var onResize = function () { clearTimeout(rt); rt = setTimeout(resize, 120); };
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(section);
    else window.addEventListener('resize', onResize);
    if (!reduce) visLoop(section, render);
  })();

  /* =========================================================
     2. Semnul: un „C” din CALEA, construit din celule de grilă (cutii extrudate) cu trasee de PCB pe față.
     Pe scroll (secțiunea e înaltă, interiorul e position: sticky) se rotește și se desface pe liniile grilei.
     Scroll-ul rămâne nativ: doar citim progresul. Fără WebGL sau cu reduced-motion: SVG-ul static din HTML
     (la reduced-motion, WebGL randează un singur cadru, fără pin).
     ========================================================= */
  var signApi = (function () {
    var section = $('.sign'), canvas = $('.sign-gl');
    if (!section || !canvas) return null;
    var gl = glContext(canvas, { antialias: true, alpha: true, depth: true });
    if (!gl) return null;
    var deriv = gl.getExtension('OES_standard_derivatives');

    /* celulele „C”-ului: grilă 12 × 15, colțuri teșite, gol interior, gura spre dreapta */
    var cells = [];
    for (var j = 0; j < 15; j++) {
      for (var i = 0; i < 12; i++) {
        var dx = i + 0.5 - 6, dy = j + 0.5 - 7.5;
        if (Math.abs(dx) + Math.abs(dy) > 10.5) continue;
        if (Math.abs(dx) < 2 && Math.abs(dy) < 3.5 && Math.abs(dx) + Math.abs(dy) < 4.5) continue;
        if (dx > 1 && Math.abs(dy) <= 2) continue;
        cells.push([dx, dy]);
      }
    }
    var seed = 3;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var HS = 0.47, HD = 0.85;
    var FACES = [
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
      [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
      [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]]
    ];
    var ext = [HS, HS, HD];
    var data = [];
    cells.forEach(function (c) {
      var r = rnd();
      FACES.forEach(function (F) {
        var n = F[0], u = F[1], v = F[2];
        var corners = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
        corners.forEach(function (k) {
          for (var a = 0; a < 3; a++) data.push((n[a] + u[a] * k[0] + v[a] * k[1]) * ext[a]);
          data.push(n[0], n[1], n[2], c[0], c[1], r);
        });
      });
    });
    var COUNT = data.length / 9;

    var VS = [
      'attribute vec3 aPos; attribute vec3 aNrm; attribute vec3 aCell;',
      'uniform mat4 uProj; uniform mat3 uRot; uniform float uExp; uniform float uTime; uniform float uDist; uniform vec2 uShift;',
      'varying vec3 vN; varying vec3 vV; varying vec3 vObj; varying vec3 vLoc; varying float vFront; varying float vR;',
      'void main(){',
      '  float r = aCell.z;',
      '  float e = clamp(uExp * 1.55 - r * 0.55, 0.0, 1.0); e = e * e * (3.0 - 2.0 * e);',
      '  vec3 off = vec3(aCell.xy * 0.4 * e, ((r - 0.5) * 10.0 + sin(r * 41.0 + uTime * 0.5) * 0.35) * e);',
      '  vec3 obj = aPos + vec3(aCell.xy, 0.0);',
      '  vec3 w = uRot * (obj + off);',
      '  vN = uRot * aNrm;',
      '  vec3 pos = w + vec3(0.0, 0.0, -uDist);',
      '  vV = -pos; vObj = obj; vLoc = aPos; vFront = aNrm.z; vR = r;',
      '  gl_Position = uProj * vec4(pos, 1.0);',
      '  gl_Position.xy += uShift * gl_Position.w;',
      '}'
    ].join('\n');
    var FS = [
      deriv ? '#extension GL_OES_standard_derivatives : enable' : '',
      'precision highp float;',
      'varying vec3 vN; varying vec3 vV; varying vec3 vObj; varying vec3 vLoc; varying float vFront; varying float vR;',
      'uniform float uTime;',
      'float h21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }',
      /* distanța „teșită” de la golul din mijloc: liniile ei de nivel sunt traseele concentrice, cu colțuri la 45° */
      'float sdc(vec2 p){ vec2 a = abs(p); return max(max(a.x - 2.0, a.y - 3.5), (a.x + a.y - 4.5) * 0.70710678); }',
      'float aa(float x, float w){',
      deriv ? '  float fw = fwidth(x) * 1.2;' : '  float fw = 0.04;',
      '  return 1.0 - smoothstep(w - fw, w + fw, x);',
      '}',
      'void main(){',
      '  vec3 N = normalize(vN); vec3 V = normalize(vV);',
      '  vec3 L1 = normalize(vec3(-0.45, 0.75, 0.55));',
      '  vec3 R = reflect(-V, N);',
      /* mediu de studio fictiv: un softbox sus, o linie de orizont, întuneric jos */
      '  float env = 0.02 + 0.85 * smoothstep(0.25, 0.95, R.y) * (0.55 + 0.45 * smoothstep(-0.6, 0.4, R.x))',
      '            + 0.22 * exp(-pow((R.y + 0.05) * 7.0, 2.0)) + 0.12 * smoothstep(0.6, 1.0, -R.x);',
      '  float ndl = max(dot(N, L1), 0.0);',
      '  float spec = pow(max(dot(N, normalize(L1 + V)), 0.0), 70.0);',
      '  float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);',
      '  vec3 metal = vec3(0.70, 0.74, 0.80);',
      '  vec3 col;',
      '  if (vFront > 0.5) {',
      /* fața: mască de lipire grafit + trasee argintii + vias + un puls care circulă pe trasee */
      '    float d = sdc(vObj.xy);',
      '    float tt = d * 2.0;',
      '    float k = floor(tt + 0.5);',
      '    float ld = abs(tt - k);',
      '    float inRing = step(0.25, d) * step(d, 3.85);',
      '    float tr = aa(ld, 0.14) * inRing;',
      '    float ang = atan(vObj.y, vObj.x) / 6.2831853 + 0.5;',
      '    float ph = fract(ang * 1.0 - uTime * (0.05 + 0.025 * mod(k, 3.0)) + k * 0.37);',
      '    float pulse = pow(ph, 26.0) * tr;',
      '    vec2 cid = floor(vObj.xy + vec2(6.0, 7.5));',
      '    float isVia = step(0.84, h21(cid + 2.3));',
      '    float vd = length(vLoc.xy);',
      '    float via = (aa(abs(vd - 0.16), 0.045) + aa(vd, 0.06)) * isVia;',
      '    float edge = smoothstep(0.40, 0.47, max(abs(vLoc.x), abs(vLoc.y)));',
      '    vec3 maskc = vec3(0.045, 0.047, 0.053) * (0.6 + 0.6 * ndl) + metal * env * 0.07;',
      '    vec3 copper = metal * (0.28 + 0.75 * env + 0.6 * spec + 0.25 * ndl);',
      '    col = mix(maskc, copper, clamp(tr + via, 0.0, 1.0));',
      '    col += vec3(0.85, 0.92, 1.0) * pulse * 1.4;',
      '    col += metal * edge * (0.08 + 0.4 * env);',
      '  } else if (vFront < -0.5) {',
      '    col = vec3(0.03, 0.031, 0.035) + metal * env * 0.1;',
      '  } else {',
      /* laturile: gunmetal periat */
      '    float br = 0.9 + 0.1 * sin(dot(vLoc, vec3(0.0, 0.0, 1.0)) * 140.0 + vR * 30.0);',
      '    vec3 base = vec3(0.10, 0.105, 0.115);',
      '    col = base * (0.3 + 0.9 * ndl) * br + metal * (env * 0.5 + spec * 0.9) * br;',
      '  }',
      '  col += metal * fres * 0.22;',
      '  col *= vec3(0.96, 0.98, 1.03);',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');
    var prog = program(gl, VS, FS);
    if (!prog) return null;
    gl.useProgram(prog);
    var vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    var S = 36;
    [['aPos', 0], ['aNrm', 12], ['aCell', 24]].forEach(function (a) {
      var l = gl.getAttribLocation(prog, a[0]);
      gl.enableVertexAttribArray(l);
      gl.vertexAttribPointer(l, 3, gl.FLOAT, false, S, a[1]);
    });
    var U = uniforms(gl, prog, ['uProj', 'uRot', 'uExp', 'uTime', 'uDist', 'uShift']);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 0);

    var steps = $$('.sign-steps li', section);
    var W = 1, H = 1, aspect = 1, dist = 40, shift = [0, 0], t0 = performance.now(), lost = false;
    var target = reduce ? 0.45 : 0, prog01 = target, curStep = -1;
    var FOV = 32 * Math.PI / 180, TANF = Math.tan(FOV / 2);
    /* fără secvență blocată la scroll: pagina curge direct în jos, iar semnul se rotește singur, lent */
    var useScroll = false;
    if (useScroll) section.classList.add('sign-scroll');

    function persp(a) {
      var f = 1 / TANF, n = 1, fa = 300;
      return new Float32Array([f / a, 0, 0, 0, 0, f, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, (2 * fa * n) / (n - fa), 0]);
    }
    function rotm(yaw, pitch) {
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      /* R = Rx(pitch) * Ry(yaw), coloană cu coloană */
      return new Float32Array([cy, sp * sy, -cp * sy, 0, cp, sp, sy, -sp * cy, cp * cy]);
    }
    function resize() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75);
      W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
      canvas.width = W; canvas.height = H;
      gl.viewport(0, 0, W, H);
      aspect = W / H;
      var narrow = r.width < 761;
      if (narrow) {
        /* telefon: semnul sus, în ~40% din înălțime */
        var fracH = useScroll ? 0.36 : 0.62;
        dist = Math.max(16.5 / (fracH * 2 * TANF), 13 / (0.7 * 2 * TANF * aspect));
        shift = [0, useScroll ? 0.36 : 0];
      } else {
        dist = Math.max(16.5 / (0.66 * 2 * TANF), 13 / (0.42 * 2 * TANF * aspect));
        shift = [r.width > 1100 ? 0.36 : 0.42, 0];
      }
      gl.uniformMatrix4fv(U.uProj, false, persp(aspect));
      draw(performance.now());
    }
    function progress() {
      var r = section.getBoundingClientRect();
      var span = Math.max(1, r.height - window.innerHeight);
      return clamp(-r.top / span, 0, 1);
    }
    function draw(now) {
      if (lost) return;
      var time = reduce ? 6 : (now - t0) / 1000;
      if (!reduce && !useScroll) target = 0.42 + 0.3 * Math.sin(time * 0.22);
      if (!reduce) prog01 += (target - prog01) * 0.1;
      var p = prog01;
      var e = smooth(0.2, 0.62, p) * (1 - 0.6 * smooth(0.82, 1.0, p));
      var idle = reduce ? 0 : Math.sin(time * 0.35) * 0.06;
      var yaw = -0.78 + p * 1.75 + idle;
      var pitch = 0.3 - p * 0.42 + (reduce ? 0 : Math.cos(time * 0.27) * 0.03);
      gl.uniformMatrix3fv(U.uRot, false, rotm(yaw, pitch));
      gl.uniform1f(U.uExp, e);
      gl.uniform1f(U.uTime, time);
      gl.uniform1f(U.uDist, dist);
      gl.uniform2f(U.uShift, shift[0], shift[1]);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, COUNT);
      if (useScroll) {
        var s = p < 0.36 ? 0 : p < 0.7 ? 1 : 2;
        if (s !== curStep) { curStep = s; steps.forEach(function (li, k) { li.classList.toggle('is-on', k === s); }); }
      }
    }
    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault(); lost = true;
      section.classList.remove('gl-ready');
    });
    if (useScroll) { target = prog01 = progress(); scrollSubs.push(function () { target = progress(); }); }
    else steps.forEach(function (li) { li.classList.remove('is-on'); });
    resize();
    section.classList.add('gl-ready');
    var rt = null;
    var onResize = function () { clearTimeout(rt); rt = setTimeout(resize, 120); };
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(canvas);
    else window.addEventListener('resize', onResize);
    if (!reduce) visLoop($('.sign-pin', section) || section, draw);
    return {};
  })();

  /* =========================================================
     Parallax intern pe imaginile .par (imaginea e mărită 1.12 și alunecă ±6% în cadru)
     ========================================================= */
  var parImgs = reduce ? [] : $$('img.par');
  function parallax() {
    var vh = window.innerHeight;
    for (var i = 0; i < parImgs.length; i++) {
      var im = parImgs[i], fr = im.parentNode, r = fr.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      var c = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      var py = clamp(-c, -1, 1) * r.height * 0.05;
      im.style.setProperty('--py', py.toFixed(1) + 'px');
      im._py = py / Math.max(1, r.height);
    }
  }
  if (parImgs.length) { scrollSubs.push(parallax); parallax(); }

  /* =========================================================
     Hover pe imagini: o lentilă WebGL subtilă (mărire + undă fină) care urmărește mouse-ul.
     Un singur context, mutat peste imaginea curentă. Ține cont de zoom-ul și parallax-ul imaginii.
     Fallback CSS: zoom lent (.no-fxgl).
     ========================================================= */
  (function () {
    var imgs = $$('img.fx');
    if (!imgs.length) return;
    if (!finePointer || reduce) { root.classList.add('no-fxgl'); return; }
    var cv = document.createElement('canvas');
    cv.className = 'fx-canvas';
    cv.setAttribute('aria-hidden', 'true');
    var gl = glContext(cv, {});
    if (!gl) { root.classList.add('no-fxgl'); return; }
    var VS = 'attribute vec2 a;varying vec2 v;void main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}';
    var FS = [
      'precision mediump float;',
      'varying vec2 v; uniform sampler2D uT; uniform vec2 uM; uniform float uH; uniform float uTime; uniform float uAsp; uniform vec2 uCov; uniform vec2 uZ;',
      'void main(){',
      '  vec2 uv = v; vec2 d = uv - uM; d.x *= uAsp; float r = length(d);',
      '  float k = smoothstep(0.34, 0.0, r) * uH;',
      '  uv -= (uv - uM) * k * 0.2;',
      '  float wv = sin(r * 40.0 - uTime * 3.0) * 0.0035 * uH * smoothstep(0.5, 0.0, r);',
      '  uv += normalize(d + 0.00001) * wv * vec2(1.0 / uAsp, 1.0);',
      '  uv = (uv - 0.5 + vec2(0.0, uZ.y)) / uZ.x + 0.5;',
      '  vec2 tuv = (uv - 0.5) * uCov + 0.5;',
      '  vec3 c = texture2D(uT, tuv).rgb + k * vec3(0.04, 0.045, 0.05);',
      '  gl_FragColor = vec4(c, 1.0);',
      '}'
    ].join('\n');
    var prog = program(gl, VS, FS);
    if (!prog) { root.classList.add('no-fxgl'); return; }
    gl.useProgram(prog);
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var al = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(al);
    gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    var U = uniforms(gl, prog, ['uT', 'uM', 'uH', 'uTime', 'uAsp', 'uCov', 'uZ']);
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
      var par = img && img.classList.contains('par');
      gl.uniform2f(U.uZ, par ? 1.12 : 1, par ? (img._py || 0) : 0);
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
      return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f3f5"/><stop offset=".48" stop-color="#8a9098"/><stop offset=".52" stop-color="#4b5057"/><stop offset="1" stop-color="#d6dade"/></linearGradient></defs><rect width="64" height="64" rx="12" fill="#0b0b0c"/><path d="M44.5 21.5A15 15 0 1 0 44.5 42.5" fill="none" stroke="url(#s)" stroke-width="8"/><rect x="47" y="28" width="8" height="8" fill="#c9ced5" fill-opacity="' + (on ? 1 : 0.15) + '"/></svg>');
    }
    var on = icon(true), off = icon(false);
    setInterval(function () {
      if (document.hidden) return;
      link.setAttribute('href', off);
      setTimeout(function () { link.setAttribute('href', on); }, 260);
    }, 3200);
  })();

  /* =========================================================
     v5 · Canalele: fiecare proiect are „fosforul” lui. Pe scroll, culoarea se amestecă în OKLab
     între canalele vecine, se „încarcă” la intrarea în proiecte și se descarcă la ieșire.
     Bara de canale arată canalul curent; sonda se umple cu progresul din el.
     ========================================================= */
  var channels = (function () {
    var sec = $('.chapters');
    if (!sec) return null;
    var chs = $$('.ch', sec), tabs = $$('.chan-tab', sec), probe = $('.chan-probe', sec), pct = $('.chan-pct', sec);
    var inner = $('.chan-in', sec);
    if (!chs.length) return null;

    function parse(s) { return s.trim().split(/\s+/).map(Number); }
    var COL = chs.map(function (ch) {
      var tab = $('.chan-tab[data-ch="' + ch.getAttribute('data-ch') + '"]', sec);
      var m = tab && /--c:\s*([\d\s]+)/.exec(tab.getAttribute('style') || '');
      return m ? parse(m[1]) : [200, 210, 225];
    });
    var NEUTRAL = [200, 210, 225];

    /* sRGB ↔ OKLab, ca amestecul dintre roșu și cyan să nu treacă printr-un gri murdar */
    function lin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    function unlin(c) { c = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; return clamp(Math.round(c * 255), 0, 255); }
    function toLab(rgb) {
      var r = lin(rgb[0]), g = lin(rgb[1]), b = lin(rgb[2]);
      var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
      var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
      var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
      return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
    }
    function fromLab(L) {
      var l = Math.pow(L[0] + 0.3963377774 * L[1] + 0.2158037573 * L[2], 3);
      var m = Math.pow(L[0] - 0.1055613458 * L[1] - 0.0638541728 * L[2], 3);
      var s = Math.pow(L[0] - 0.0894841775 * L[1] - 1.291485548 * L[2], 3);
      return [unlin(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), unlin(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), unlin(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)];
    }
    var LAB = COL.map(toLab), NLAB = toLab(NEUTRAL);
    function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

    var active = -1, lastKey = '';
    function setActive(i) {
      if (i === active) return;
      var first = active === -1;
      active = i;
      tabs.forEach(function (t) { if (t.getAttribute('data-ch') === chs[i].getAttribute('data-ch')) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
      placeProbe();
      if (!first && !reduce) {                     // „trigger”: o linie trece peste ecran în culoarea noului canal
        sec.classList.remove('is-trigger');
        void sec.offsetWidth;
        sec.classList.add('is-trigger');
      }
    }
    function placeProbe() {
      if (!probe || !inner || active < 0) return;
      var tab = tabs[active]; if (!tab) return;
      var a = inner.getBoundingClientRect(), r = tab.getBoundingClientRect();
      probe.style.left = (r.left - a.left) + 'px';
      probe.style.width = r.width + 'px';
      /* pe telefon, canalul activ intră în ecran în bara derulabilă */
      var list = tab.parentNode.parentNode;
      if (list && list.scrollWidth > list.clientWidth + 2) {
        var lr = list.getBoundingClientRect();
        if (r.left < lr.left || r.right > lr.right) list.scrollTo({ left: list.scrollLeft + (r.left - lr.left) - 12, behavior: reduce ? 'auto' : 'smooth' });
      }
    }

    function update() {
      var vh = window.innerHeight, mid = vh * 0.5;
      var sr = sec.getBoundingClientRect();
      if (sr.bottom < -vh || sr.top > vh * 2) return;
      var rects = chs.map(function (c) { return c.getBoundingClientRect(); });
      var i = 0;
      for (var k = 0; k < rects.length; k++) if (rects[k].top <= mid) i = k;
      var r = rects[i], cp = clamp((mid - r.top) / Math.max(1, r.height), 0, 1);

      /* culoarea: în mijlocul canalului e a lui; la granițe se amestecă cu vecinul (0,5 fix pe linie) */
      var EDGE = Math.min(0.22, (vh * 0.35) / Math.max(1, r.height));
      var lab = LAB[i];
      if (cp < EDGE && i > 0) lab = mix(LAB[i - 1], LAB[i], 0.5 + 0.5 * smooth(0, 1, cp / EDGE));
      else if (cp > 1 - EDGE && i < LAB.length - 1) lab = mix(LAB[i], LAB[i + 1], 0.5 * smooth(0, 1, (cp - (1 - EDGE)) / EDGE));

      /* încărcarea: crește când primul canal urcă în ecran, scade după ultimul */
      var charge = smooth(vh * 0.95, vh * 0.25, rects[0].top) * smooth(vh * 0.05, vh * 0.65, rects[rects.length - 1].bottom);
      lab = mix(NLAB, lab, 0.35 + 0.65 * charge);
      var rgb = fromLab(lab);
      var prog = clamp((mid - rects[0].top) / Math.max(1, rects[rects.length - 1].bottom - rects[0].top), 0, 1);

      var key = rgb.join(' ') + '|' + charge.toFixed(3) + '|' + prog.toFixed(4) + '|' + cp.toFixed(3);
      if (key !== lastKey) {
        lastKey = key;
        sec.style.setProperty('--tint', rgb.join(' '));
        sec.style.setProperty('--charge', charge.toFixed(3));
        sec.style.setProperty('--prog', prog.toFixed(4));
        sec.style.setProperty('--cp', cp.toFixed(3));
        if (pct) { var p = Math.round(cp * 100); pct.textContent = (p < 10 ? '0' : '') + p; }
      }
      setActive(i);
    }
    scrollSubs.push(update);
    window.addEventListener('resize', function () { lastKey = ''; placeProbe(); update(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeProbe);
    update();
    return { update: update, place: placeProbe };
  })();

  /* Aplică limba (separă și titlurile pentru dezvăluire), apoi starea inițială a scroll-ului */
  applyLang(lang);
  onScroll();
})();
