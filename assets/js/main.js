/* CALEA · Denis-Alexandru Călin: interacțiuni, i18n, 3D, animații (vanilla JS, fără librării) */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var mm = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var reduceMq = mm('(prefers-reduced-motion: reduce)');
  var finePointer = mm('(hover: hover) and (pointer: fine)').matches;
  var coarse = mm('(pointer: coarse)').matches;
  var reduce = reduceMq.matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* =========================================================
     i18n: textele RO se citesc din HTML; EN sunt aici
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
    'hero.role': 'Computer Engineering Student · Software & Hardware',
    'hero.lede': 'I build complete systems, from logic gates in VHDL on FPGA up to applications in C++ and Java, and I test everything I build.',
    'hero.cta1': 'See the projects',
    'hero.cta2': 'Download CV',
    'hero.scroll': 'Scroll',
    'rail.aria': 'Projects',
    'rail.rd': 'carousel',
    'rail.prev': 'Previous project',
    'rail.next': 'Next project',
    'link.code': 'Code on GitHub',
    'link.newtab': ' (opens in a new tab)',
    'tags.aria': 'Technologies',
    'p1.title': 'FPGA Multi-Player Reaction Time Game',
    'p1.art': 'Line-art illustration of an FPGA board with a 7-segment display, LEDs and buttons',
    'p1.desc': 'A hardware reaction game for up to 4 players and 5 rounds, written entirely in VHDL with no software layer, driven by an FSM control unit.',
    'p1.s1': 'VHDL modules',
    'p1.s2': 'players × rounds',
    'p1.s3': 'MHz → 1 ms tick',
    'game.dispIdle': 'Display: four dashes',
    'game.start': 'Start the test',
    'game.intro': 'Press the button, wait for the display to light up, then press again as fast as you can.',
    'soon.title': 'More soon',
    'soon.text': 'I am working on the next projects. Meanwhile, everything I have published is on GitHub.',
    /* Pentru slide-ul-template comentat din index.html (proiect OOP/C/VBA):
    'p3.thumb': 'Abstract typographic thumbnail for the Java project',
    'p3.title': 'Object-oriented programming project',
    'p3.desc': 'A Java application built for the Object-Oriented Programming course, focused on classes, inheritance and encapsulation.',
    */
    'studies.title': 'What I study',
    'studies.when1': '2025 – present · year 2',
    'studies.school1': 'Technical University of Cluj-Napoca',
    'studies.sub1': 'B.Sc. in Computer Science and Information Technology, Faculty of Automation and Computer Science.',
    'cv.title': 'All of it, on one page',
    'cv.alt': 'Preview: the first page of the CV',
    'cv.open': 'Open the CV (PDF) in a new tab',
    'cv.lead': 'Coursework, skills, languages and the rest of the details live in the CV. One A4 page, in English or Romanian.',
    'contact.title': 'Let’s talk',
    'contact.lead': 'Have an internship or a project I can help with? Send me an email.',
    'footer.top': 'Back to top'
  };

  /* Texte dinamice, în ambele limbi */
  var DYN = {
    ro: {
      title: 'CALEA · Denis-Alexandru Călin',
      desc: 'CALEA, portofoliul lui Denis-Alexandru Călin: student în anul 2 la Calculatoare și Tehnologia Informației (UTCN, Cluj-Napoca). Proiecte în VHDL pe FPGA, C++, Java și C. Caut un internship.',
      ogDesc: 'Student în anul 2 la CTI, UTCN Cluj-Napoca. De la VHDL pe FPGA la C++ și Java. Caut un internship.',
      ogLocale: 'ro_RO', ogAlt: 'en_US',
      menuOpen: 'Deschide meniul', menuClose: 'Închide meniul',
      toLight: 'Comută pe tema luminoasă', toDark: 'Comută pe tema întunecată',
      slide: function (i, n) { return i + ' din ' + n; },
      slideNow: function (i, n) { return 'Slide-ul ' + i + ' din ' + n; },
      wait: 'Așteaptă…', waitStatus: 'Așteaptă să se aprindă afișajul.',
      go: 'Apasă acum!', retry: 'Încearcă din nou',
      result: function (ms, best) { return 'Timpul tău: ' + ms + ' ms. Cel mai bun: ' + best + ' ms.'; },
      falseStart: 'Start fals: ai apăsat înainte să se aprindă afișajul.',
      dIdle: 'Afișaj: patru liniuțe', dOff: 'Afișaj: stins, așteaptă',
      dMs: function (ms) { return 'Afișaj: ' + ms + ' milisecunde'; }, dErr: 'Afișaj: eroare, start fals',
      sep: '.'
    },
    en: {
      title: 'CALEA · Denis-Alexandru Călin',
      desc: 'CALEA, the portfolio of Denis-Alexandru Călin: second-year Computer Science and Information Technology student (UTCN, Cluj-Napoca). Projects in VHDL on FPGA, C++, Java and C. Looking for an internship.',
      ogDesc: 'Second-year Computer Science student at UTCN, Cluj-Napoca. From VHDL on FPGA to C++ and Java. Looking for an internship.',
      ogLocale: 'en_US', ogAlt: 'ro_RO',
      menuOpen: 'Open menu', menuClose: 'Close menu',
      toLight: 'Switch to light theme', toDark: 'Switch to dark theme',
      slide: function (i, n) { return i + ' of ' + n; },
      slideNow: function (i, n) { return 'Slide ' + i + ' of ' + n; },
      wait: 'Wait…', waitStatus: 'Wait for the display to light up.',
      go: 'Press now!', retry: 'Try again',
      result: function (ms, best) { return 'Your time: ' + ms + ' ms. Best: ' + best + ' ms.'; },
      falseStart: 'False start: you pressed before the display lit up.',
      dIdle: 'Display: four dashes', dOff: 'Display: off, waiting',
      dMs: function (ms) { return 'Display: ' + ms + ' milliseconds'; }, dErr: 'Display: error, false start',
      sep: ','
    }
  };

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
  function t(key) {
    var d = lang === 'en' ? EN : RO;
    return d[key] != null ? d[key] : RO[key];
  }
  function D() { return DYN[lang]; }

  /* Împarte un titlu în cuvinte mascate pentru reveal */
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var outer = document.createElement('span');
      outer.className = 'w';
      var inner = document.createElement('span');
      inner.className = 'wi';
      inner.style.setProperty('--i', i);
      inner.textContent = w;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }

  function setMeta(sel, attr, val) { var m = $(sel); if (m) m.setAttribute(attr, val); }

  /* CV-ul descărcat urmează limba site-ului */
  function syncCv() {
    var L = lang.toUpperCase();
    $$('[data-cv]').forEach(function (a) { a.setAttribute('href', 'assets/CV_Denis_Calin_' + L + '.pdf'); });
    $$('[data-cv-img]').forEach(function (img) { img.setAttribute('src', 'assets/cv-preview-' + lang + '.png'); });
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
    setMeta('meta[property="og:locale"]', 'content', d.ogLocale);
    setMeta('meta[property="og:locale:alternate"]', 'content', d.ogAlt);

    syncCv();
    syncMenuLabel();
    syncThemeUi();
    $$('.count').forEach(function (c) { if (!c._running) c.textContent = fmt(+c.getAttribute('data-to')); });
    if (game) game.relabel();
  }

  function fmt(n) {
    var s = String(Math.round(n));
    return s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, D().sep) : s;
  }

  $$('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = b.getAttribute('data-lang');
      if (l === lang) return;
      store('lang', l);
      applyLang(l);
    });
  });

  /* =========================================================
     Temă (tranziție lină prin View Transitions, dacă există)
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
    if (hero) hero.refreshColor();
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      var apply = function () { root.setAttribute('data-theme', next); store('theme', next); syncThemeUi(); };
      if (document.startViewTransition && !reduce) document.startViewTransition(apply);
      else apply();
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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen()) { setMenu(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900 && menuOpen()) setMenu(false); });
  }

  var lastY = window.pageYOffset;
  function onScrollHeader() {
    var y = window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 8);
    var down = y > lastY + 4, up = y < lastY - 4;
    if (menuOpen() || header.contains(document.activeElement) || y < 200) header.classList.remove('is-hidden');
    else if (down) header.classList.add('is-hidden');
    else if (up) header.classList.remove('is-hidden');
    if (down || up) lastY = y;
  }
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScrollHeader(); ticking = false; });
  }, { passive: true });
  onScrollHeader();

  /* Ecranul curent în indicatorul din nav */
  var navLinks = $$('.nav-links a');
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (byId[en.target.id]) byId[en.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* =========================================================
     Reveal-uri lente, contoare
     ========================================================= */
  function countUp(el) {
    var to = +el.getAttribute('data-to');
    if (reduce || !to) { el.textContent = fmt(to); return; }
    var start = null, dur = 1600;
    el._running = true;
    el.textContent = fmt(0);
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
      else el._running = false;
    }
    requestAnimationFrame(step);
  }

  var revealTargets = $$('.rv, .split, .board');
  var counters = $$('.count');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    revealTargets.forEach(function (el) { io.observe(el); });

    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countUp(en.target);
        cio.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* =========================================================
     Cursor custom + butoane magnetice (doar pointer fin)
     ========================================================= */
  if (finePointer && !reduce) {
    var cursor = $('.cursor');
    if (cursor) {
      root.classList.add('has-cursor');
      var cx = -100, cy = -100, tx = -100, ty = -100, craf = null;
      var cloop = function () {
        cx += (tx - cx) * 0.2;
        cy += (ty - cy) * 0.2;
        cursor.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
        craf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(cloop) : null;
      };
      document.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        tx = e.clientX; ty = e.clientY;
        if (cx < -50) { cx = tx; cy = ty; }
        cursor.classList.add('is-on');
        cursor.classList.toggle('is-link', !!e.target.closest('a, button'));
        if (!craf) craf = requestAnimationFrame(cloop);
      }, { passive: true });
      document.addEventListener('pointerleave', function () { cursor.classList.remove('is-on'); });
      document.documentElement.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); });
    }

    $$('.magnetic').forEach(function (el) {
      el.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.38;
        el.style.transition = 'transform 0.15s linear';
        el.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = '';
      });
    });
  }

  /* =========================================================
     Intro: overlay-ul se termină singur din CSS; aici doar îl scoatem din DOM.
     După animația hero, wordmark-ul își primește extrudarea (clasa .settled).
     ========================================================= */
  var hadIntro = root.classList.contains('intro');
  if (hadIntro) {
    setTimeout(function () { var ov = $('.intro'); if (ov) ov.parentNode.removeChild(ov); }, 1300);
  }
  setTimeout(function () { root.classList.add('settled'); }, reduce ? 0 : (hadIntro ? 2600 : 1800));

  /* =========================================================
     Hero 3D: teren de puncte în perspectivă, ca un PCB care curge în adâncime.
     Canvas 2D cu proiecție scrisă de mână; pauză off-screen; static la reduced-motion.
     ========================================================= */
  var hero = (function () {
    var canvas = $('.hero-canvas');
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    var section = canvas.parentNode;
    var wordmark = $('.wordmark', section);
    var W = 0, H = 0, dpr = 1, FOV = 800;
    var SP = coarse ? 0.7 : 0.5;                       // distanța dintre puncte (unități de lume)
    var COLS = coarse ? 45 : 77, ROWS = coarse ? 34 : 56, FAR = ROWS * SP;
    var CAM_H = 2.1, PITCH = 0.27, FLOW = 0.32;
    var rgb = '255,255,255';
    var yaw = 0, pitch = 0, tYaw = 0, tPitch = 0;
    var pulses = [];
    var visible = true, running = false, rafId = null, t0 = performance.now(), lastNow = t0;
    var lastWx = 99, lastWy = 99;

    function readColor() {
      var v = getComputedStyle(root).getPropertyValue('--fg-rgb').trim();
      rgb = v || '255,255,255';
    }

    function height(x, gz, time) {
      return 0.34 * Math.sin(x * 0.33 + time * 0.22) * Math.cos(gz * 0.21 + time * 0.16) +
             0.18 * Math.sin((x + gz) * 0.14 - time * 0.27);
    }

    /* Proiecție: rotație yaw (Y), apoi pitch (X), apoi perspectivă */
    var sinY = 0, cosY = 1, sinP = 0, cosP = 1, out = [0, 0, 0];
    function project(x, y, z) {
      var cx = x * cosY - z * sinY;
      var cz = x * sinY + z * cosY;
      var cy = y - CAM_H;
      var py = cy * cosP + cz * sinP;
      var pz = -cy * sinP + cz * cosP;
      if (pz < 0.4) return false;
      out[0] = W / 2 + cx * FOV / pz;
      out[1] = H * 0.5 - py * FOV / pz;
      out[2] = pz;
      return true;
    }

    function newPulse(flowTotal, anywhere) {
      return {
        x: Math.round((Math.random() - 0.5) * (COLS - 16)),
        gz: (flowTotal + FAR * (anywhere ? 0.15 + Math.random() * 0.8 : 0.7 + Math.random() * 0.28)) / SP,
        dx: 0, dz: -1, run: 0, speed: 1.6 + Math.random() * 1.6,
        trail: []
      };
    }

    function stepPulse(p, dt, flowTotal) {
      var d = p.speed * dt;
      p.x += p.dx * d; p.gz += p.dz * d; p.run += d;
      if (p.run >= 1) {                       // la fiecare nod al grilei: poate face un viraj de 90°, ca un traseu pe PCB
        p.run = 0;
        p.x = Math.round(p.x); p.gz = Math.round(p.gz * 1000) / 1000;
        if (p.dz !== 0 && Math.random() < 0.22) { p.dx = Math.random() < 0.5 ? 1 : -1; p.dz = 0; }
        else if (p.dx !== 0 && Math.random() < 0.55) { p.dx = 0; p.dz = -1; }
      }
      p.trail.push([p.x * SP, p.gz * SP]);
      if (p.trail.length > 34) p.trail.shift();
      var wz = p.gz * SP - flowTotal;
      if (wz < 0.6 || wz > FAR || Math.abs(p.x) > COLS / 2) {
        var q = newPulse(flowTotal, false);
        for (var k in q) p[k] = q[k];
      }
    }

    function resize() {
      var r = section.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      FOV = Math.max(W * 0.6, H * 0.9);
      var ft = ((lastNow - t0) / 1000) * FLOW;
      pulses = [];
      var n = coarse ? 4 : 8;
      for (var i = 0; i < n; i++) pulses.push(newPulse(ft, true));
      if (!running) draw(lastNow, 0);
    }

    function draw(now, dt) {
      var time = (now - t0) / 1000;
      var flowTotal = time * FLOW;
      var off = flowTotal % SP;

      yaw += (tYaw + Math.sin(time * 0.045) * 0.1 - yaw) * 0.035;
      pitch += (tPitch - pitch) * 0.035;
      sinY = Math.sin(yaw); cosY = Math.cos(yaw);
      sinP = Math.sin(PITCH + pitch); cosP = Math.cos(PITCH + pitch);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgb(' + rgb + ')';
      var half = (COLS - 1) / 2;
      for (var j = ROWS; j >= 1; j--) {
        var z = j * SP - off;
        var gz = z + flowTotal;
        var fog = 1 - z / FAR;
        fog = Math.pow(fog, 1.6) * Math.min(1, (z - 0.5) / 1.5);
        if (fog <= 0.01) continue;
        for (var i = 0; i < COLS; i++) {
          var x = (i - half) * SP;
          var y = height(x, gz, time);
          if (!project(x, y, z)) continue;
          var sx = out[0], sy = out[1];
          if (sx < -4 || sx > W + 4 || sy < -4 || sy > H + 4) continue;
          var s = Math.max(0.8, Math.min(2.6, FOV / out[2] * 0.0036));
          ctx.globalAlpha = Math.min(1, fog * (0.38 + (y + 0.5) * 0.4));
          ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
        }
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgb(' + rgb + ')';
      for (var p = 0; p < pulses.length; p++) {
        var pl = pulses[p];
        if (dt) stepPulse(pl, dt, flowTotal);
        var tr = pl.trail, prevOk = false, px0 = 0, py0 = 0;
        for (var k = 0; k < tr.length; k++) {
          var wz = tr[k][1] - flowTotal;
          var ok = project(tr[k][0], height(tr[k][0], tr[k][1], time) + 0.02, wz);
          if (ok && prevOk) {
            var f = 1 - wz / FAR;
            ctx.globalAlpha = Math.max(0, f * f * (k / tr.length) * 0.9);
            ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(out[0], out[1]); ctx.stroke();
          }
          prevOk = ok; px0 = out[0]; py0 = out[1];
        }
        if (prevOk) {
          var hz = tr.length ? tr[tr.length - 1][1] - flowTotal : FAR;
          var hs = Math.max(1.5, Math.min(4, FOV / hz * 0.006));
          ctx.globalAlpha = Math.min(1, (1 - hz / FAR) * 1.4);
          ctx.fillRect(px0 - hs / 2, py0 - hs / 2, hs, hs);
        }
      }
      ctx.globalAlpha = 1;

      /* Wordmark-ul se înclină discret odată cu scena */
      if (wordmark) {
        var wy = (yaw * 14).toFixed(2), wx = (-pitch * 30).toFixed(2);
        if (wy !== lastWy || wx !== lastWx) {
          section.style.setProperty('--wy', wy + 'deg');
          section.style.setProperty('--wx', wx + 'deg');
          lastWy = wy; lastWx = wx;
        }
      }
    }

    function frame(now) {
      var dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      draw(now, dt);
      rafId = running ? requestAnimationFrame(frame) : null;
    }
    function update() {
      var should = visible && !document.hidden && !reduce;
      if (should && !running) { running = true; lastNow = performance.now(); rafId = requestAnimationFrame(frame); }
      else if (!should && running) { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }
    }

    readColor();
    resize();
    var rt = null;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    if (!reduce) {
      section.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = section.getBoundingClientRect();
        tYaw = ((e.clientX - r.left) / r.width - 0.5) * 0.34;
        tPitch = ((e.clientY - r.top) / r.height - 0.5) * 0.08;
      }, { passive: true });
      section.addEventListener('pointerleave', function () { tYaw = 0; tPitch = 0; });
      if (coarse && 'DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', function (e) {
          if (e.gamma == null) return;
          tYaw = Math.max(-1, Math.min(1, e.gamma / 45)) * 0.22;
          tPitch = Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 45)) * 0.06;
        }, { passive: true });
      }
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; update(); }).observe(section);
    }
    document.addEventListener('visibilitychange', update);
    update();

    return {
      refreshColor: function () {
        requestAnimationFrame(function () { readColor(); if (!running) draw(performance.now(), 0); });
      }
    };
  })();

  /* =========================================================
     Placa FPGA 3D: straturi CSS la adâncimi diferite, tilt după mouse cu inerție
     ========================================================= */
  (function () {
    var art = $('.board-art');
    var stage = $('.board-stage');
    if (!art || !stage || !finePointer || reduce) return;
    var fig = art.closest('figure') || art;
    var bx = 0, by = 0, tbx = 0, tby = 0, raf = null;
    function loop() {
      bx += (tbx - bx) * 0.07;
      by += (tby - by) * 0.07;
      stage.style.setProperty('--bx', bx.toFixed(2) + 'deg');
      stage.style.setProperty('--by', by.toFixed(2) + 'deg');
      raf = (Math.abs(tbx - bx) > 0.02 || Math.abs(tby - by) > 0.02) ? requestAnimationFrame(loop) : null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    fig.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = art.getBoundingClientRect();
      var px = Math.max(-0.7, Math.min(0.7, (e.clientX - r.left) / r.width - 0.5));
      var py = Math.max(-0.7, Math.min(0.7, (e.clientY - r.top) / r.height - 0.5));
      tby = px * 18;
      tbx = -py * 14;
      kick();
    }, { passive: true });
    fig.addEventListener('pointerleave', function () { tbx = 0; tby = 0; kick(); });
  })();

  /* =========================================================
     Bandă orizontală de proiecte: scroll-snap nativ + săgeți, taste, contor, progres
     și o tranziție 3D discretă (rotateY / translateZ calculate din poziția de scroll)
     ========================================================= */
  (function () {
    var rail = $('#rail');
    if (!rail) return;
    var slides = $$('.slide', rail);
    var n = slides.length;
    var wrap = rail.closest('.sec-projects');
    var cur = $('.rail-cur', wrap), total = $('.rail-total', wrap), bar = $('.rail-bar', wrap);
    var btns = $$('.rail-btn', wrap);
    var live = $('.rail-live', wrap);
    if (total) total.textContent = pad2(n);
    var depth = !reduce;

    function index() { return Math.max(0, Math.min(n - 1, Math.round(rail.scrollLeft / Math.max(1, rail.clientWidth)))); }
    function go(i, announce) {
      i = Math.max(0, Math.min(n - 1, i));
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

    var rticking = false;
    function sync() {
      rticking = false;
      var i = index(), w = Math.max(1, rail.clientWidth), sl = rail.scrollLeft;
      if (cur) cur.textContent = pad2(i + 1);
      if (bar) bar.style.transform = 'scaleX(' + Math.min(1, (sl + w) / Math.max(w, rail.scrollWidth)).toFixed(4) + ')';
      if (btns[0]) btns[0].setAttribute('aria-disabled', String(i === 0));
      if (btns[1]) btns[1].setAttribute('aria-disabled', String(i === n - 1));
      if (!depth) return;
      slides.forEach(function (s) {
        var inner = s.firstElementChild;
        if (!inner) return;
        var p = Math.max(-1, Math.min(1, (s.offsetLeft - sl) / w));
        var a = Math.abs(p);
        if (a < 0.002) { inner.style.transform = ''; inner.style.opacity = ''; return; }
        inner.style.transform = 'perspective(1800px) rotateY(' + (-p * 18).toFixed(2) + 'deg) translateZ(' + (-a * 160).toFixed(1) + 'px) scale(' + (1 - a * 0.04).toFixed(3) + ')';
        inner.style.opacity = (1 - a * 0.65).toFixed(3);
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
     Jocul de reacție pe 7 segmente (inspirat din proiectul FPGA)
     ========================================================= */
  var game = (function () {
    var display = $('#reaction-display');
    var btn = $('#reaction-btn');
    var status = $('#reaction-status');
    if (!display || !btn || !status) return null;
    var btnLabel = btn.querySelector('.btn-in') || btn;

    var NS = 'http://www.w3.org/2000/svg';
    var T = 9, L = 38;
    function hSeg(cx, cy) { var a = L / 2, h = T / 2; return [cx - a, cy, cx - a + h, cy - h, cx + a - h, cy - h, cx + a, cy, cx + a - h, cy + h, cx - a + h, cy + h].join(' '); }
    function vSeg(cx, cy) { var a = L / 2, h = T / 2; return [cx, cy - a, cx + h, cy - a + h, cx + h, cy + a - h, cx, cy + a, cx - h, cy + a - h, cx - h, cy - a + h].join(' '); }
    var SEG = { a: hSeg(30, 6), b: vSeg(52, 28), c: vSeg(52, 72), d: hSeg(30, 94), e: vSeg(8, 72), f: vSeg(8, 28), g: hSeg(30, 50) };
    var GLYPH = { '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', '-': 'g', ' ': '', 'E': 'adefg', 'r': 'eg' };

    var digits = [];
    for (var i = 0; i < 4; i++) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '-6 0 74 100');
      svg.setAttribute('class', 'digit');
      svg.setAttribute('aria-hidden', 'true');
      var segs = {};
      for (var k in SEG) {
        var p = document.createElementNS(NS, 'polygon');
        p.setAttribute('points', SEG[k]);
        p.setAttribute('class', 'seg');
        svg.appendChild(p);
        segs[k] = p;
      }
      var dp = document.createElementNS(NS, 'circle');
      dp.setAttribute('cx', '63'); dp.setAttribute('cy', '94'); dp.setAttribute('r', '4.5');
      dp.setAttribute('class', 'dp');
      svg.appendChild(dp);
      display.appendChild(svg);
      digits.push(segs);
    }

    var leds = $$('.reaction-leds .led');
    var state = 'idle', timer = null, ledTimer = null, raf = null, startedAt = 0, best = null, last = null;
    var labelKey = 'dIdle', lastMs = null, statusKey = 'intro', btnKey = 'start';

    function show(text) {
      var s = (text + '    ').slice(0, 4);
      for (var d = 0; d < 4; d++) {
        var on = GLYPH[s.charAt(d)] || '';
        for (var key in digits[d]) digits[d][key].classList.toggle('on', on.indexOf(key) !== -1);
      }
    }
    function setLeds(n, cls) {
      leds.forEach(function (l, idx) { l.classList.remove('on', 'bad'); if (idx < n) l.classList.add(cls || 'on'); });
    }
    function pad4(n) { var s = String(Math.min(9999, Math.max(0, Math.round(n)))); while (s.length < 4) s = '0' + s; return s; }

    function relabel() {
      var d = D();
      display.setAttribute('aria-label', labelKey === 'dMs' ? d.dMs(lastMs) : d[labelKey]);
      btnLabel.textContent = btnKey === 'start' ? t('game.start') : d[btnKey];
      status.textContent = statusKey === 'intro' ? t('game.intro') : statusKey === 'result' ? d.result(last, best) : d[statusKey];
    }
    function setUi(lbl, bKey, sKey, cls) {
      labelKey = lbl; btnKey = bKey; statusKey = sKey;
      btn.classList.remove('is-armed', 'is-go');
      if (cls) btn.classList.add(cls);
      relabel();
    }

    /* LFSR pe 16 biți (x^16 + x^14 + x^13 + x^11 + 1), ca în varianta hardware */
    var lfsr = (Date.now() & 0xffff) || 0xace1;
    function lfsrNext() { var bit = (lfsr ^ (lfsr >> 2) ^ (lfsr >> 3) ^ (lfsr >> 5)) & 1; lfsr = (lfsr >> 1) | (bit << 15); return lfsr; }

    function tick() { show(pad4(performance.now() - startedAt)); raf = requestAnimationFrame(tick); }
    function arm() {
      state = 'armed';
      show('    ');
      setUi('dOff', 'wait', 'waitStatus', 'is-armed');
      var delay = 1500 + (lfsrNext() % 2500), lit = 0;
      setLeds(0);
      ledTimer = setInterval(function () { lit = Math.min(leds.length, lit + 1); setLeds(lit); }, delay / (leds.length + 1));
      timer = setTimeout(go, delay);
    }
    function go() {
      clearInterval(ledTimer);
      state = 'go';
      setLeds(leds.length);
      setUi('dOff', 'go', 'waitStatus', 'is-go');
      startedAt = performance.now();
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      var ms = Math.round(performance.now() - startedAt);
      cancelAnimationFrame(raf);
      state = 'idle';
      show(pad4(ms));
      last = ms; lastMs = ms;
      if (best === null || ms < best) best = ms;
      setUi('dMs', 'retry', 'result');
    }
    function falseStart() {
      clearTimeout(timer); clearInterval(ledTimer);
      state = 'idle';
      show('Err ');
      setLeds(leds.length, 'bad');
      setUi('dErr', 'retry', 'falseStart');
    }
    btn.addEventListener('click', function () {
      if (state === 'idle') arm();
      else if (state === 'armed') falseStart();
      else if (state === 'go') stop();
    });
    show('----');
    return { relabel: relabel };
  })();

  /* Aplică limba (separă și titlurile pentru reveal) */
  applyLang(lang);
})();
