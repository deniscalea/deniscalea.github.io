# site-cv — CALEA

Site personal CV/portofoliu al lui Denis-Alexandru Călin (CTI, UTCN, anul 2), sub brandul **CALEA**. Scop: internship + vitrină pentru proiecte (și pentru ideea de site-uri pentru firme locale, vezi `../IDEI.md`).

## Stack
Static, fără build și fără npm (v3): `index.html`, `proiecte/fpga.html` (studiu de caz), `assets/css/style.css`, `assets/js/main.js` (comun ambelor pagini: i18n, temă, WebGL în hero, lentilă WebGL pe imagini, tranziții, carusel, simularea plăcii, ceasul din footer), `assets/js/i18n-fpga.js` (textele EN ale studiului de caz), `assets/img/*.webp` (imagini randate din `art/`), `assets/og.png` (Open Graph 1200×630), `assets/favicon.svg`, `assets/CV_Denis_Calin_EN.pdf` + `_RO.pdf`, `cv/` (sursa CV-ului). Design alb-negru, temă dark/light, RO/EN. Fonturile vin din Google Fonts; altfel nimic extern.

## Pornire locală
Din `C:\Users\Denis\Documents\Proiecte`:
```
python -m http.server 5173 --directory site-cv
```
apoi http://localhost:5173 (în app: preview „site-cv” din `.claude/launch.json`).

## Reguli
- Date reale doar din `../CV/cv.html`; nu inventa note, premii sau experiență.
- Fără număr de telefon pe site. Fără formulare care trimit date.
- Placeholder-ele sunt marcate `<!-- TODO Denis: ... -->` în `index.html`.
- Verifică la 360px, 375px și desktop, în ambele teme și ambele limbi.
- Site-ul e minimalist: 5 ecrane (Start, Proiecte cu carusel orizontal, Studii, CV, Contact) + pagini de studiu de caz în `proiecte/`. Ce e banal (cursuri, skill-uri, liceu, limbi) stă DOAR în CV-ul PDF.
- WebGL-ul pornește doar cu GPU (`failIfMajorPerformanceCaveat`); fără el rămâne fallback-ul static. `prefers-reduced-motion` oprește animațiile și intro-ul.
- CV-ul public: `cv/cv-en.html` + `cv/cv-ro.html` → `bash cv/build-pdf.sh` regenerează `assets/CV_Denis_Calin_EN.pdf`, `_RO.pdf` și preview-urile PNG. Fără telefon în CV-ul public.

## Cum adaugi lucruri pe viitor
Cel mai simplu: îi scrii lui Claude, de exemplu „adaugă proiectul X: ce face, an, tehnologii, link GitHub, poză”. Claude face restul, în ambele limbi.

Ce trebuie atins (pentru Claude sau dacă o faci de mână):
- **Proiect nou:** e un slide nou în caruselul din `#proiecte` din `index.html` (copiezi slide-ul FPGA, îl pui înaintea slide-ului „În curând”). Schimbi numărul (`P.0X`), anul, link-ul, id-urile (`pX-titlu`), cheile `data-i18n` (`pX.title`, `pX.desc`…) și `aria-label="N din M"` / `data-i18n-slide` pe toate slide-urile. Textul RO stă direct în HTML, traducerea EN în dicționarul `EN` din `assets/js/main.js`.
- **Imagine nouă:** sursa e un HTML/SVG în `art/` (vezi `art/fpga-chip.html` ca model), apoi `bash art/render.sh` (sau `ONLY="nume" bash art/render.sh`) o randează cu Edge headless în `assets/img/nume.webp`. Adaugi numele în lista `JOBS` din script. Conversia WebP are nevoie de serverul local pornit. În pagină: `<img class="fx" …>` (lentila WebGL la hover) într-un `<span class="curtain"><span class="frame">…</span></span>` (dezvăluire tip cortină), cu `width`/`height`, `alt` + `data-i18n-alt`.
- **Studiu de caz nou:** copiezi `proiecte/fpga.html` (păstrează `data-base="../"` pe `<html>` și `data-en-*` pentru titlu/descriere EN), pui textele EN într-un fișier ca `assets/js/i18n-fpga.js` încărcat înainte de `main.js`. Secțiunile au `data-reveal="once"`. Tot ce scrii trebuie să vină din cod/README sau din `../CV/cv.html`.
- **Ecranele paginii principale** au `data-reveal`: devin `.is-active` când ocupă jumătate din ecran; titlurile cu clasa `split` se dezvăluie pe linii, blocurile cu `lift` urcă, imaginile `.curtain` se deschid, liniile `rule-t`/`rule-b` se desenează.
- **Skill / curs nou:** doar în CV (`cv/cv-*.html`), apoi rulezi build-pdf.
- **CV actualizat:** editezi `cv/cv-en.html` și `cv/cv-ro.html`, apoi rulezi `bash cv/build-pdf.sh`. Sursa de adevăr pentru date rămâne `../CV/cv.html`.
- **După orice schimbare de CSS/JS:** crești `?v=` din `index.html` și `proiecte/fpga.html` (cache-ul GitHub Pages), apoi verifici în browser la 360px și pe desktop, în ambele limbi și ambele teme, fără erori în consolă (`node --check` pe JS).

## Publicare
Live: https://deniscalea.github.io (GitHub Pages, repo `deniscalea/deniscalea.github.io`, branch `main`). Orice `git push` pe main republică site-ul în 1–2 minute, așa că se face doar cu OK-ul lui Denis. Nu urca `assets/Denis_Calin_CV.pdf` (are telefonul).
Vezi `PUBLICARE.md`. Deploy-ul public și cumpărarea domeniului le face Denis (sau doar cu OK-ul lui).
