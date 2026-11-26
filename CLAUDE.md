# site-cv — CALEA

Site personal CV/portofoliu al lui Denis-Alexandru Călin (CTI, UTCN, anul 2), sub brandul **CALEA**. Scop: internship + vitrină pentru proiecte (și pentru ideea de site-uri pentru firme locale, vezi `../IDEI.md`).

## Stack
Static, fără build și fără npm (v4): `index.html`, `proiecte/fpga.html` (studiu de caz), `assets/css/style.css`, `assets/js/main.js` (comun ambelor pagini: i18n, meniu, dezvăluiri, raze WebGL în hero, semnul 3D „C” pe scroll, lentilă WebGL pe imagini, parallax, simularea plăcii, ceasul din footer), `assets/js/i18n-fpga.js` (textele EN ale studiului de caz), `assets/img/*.webp` (imagini randate din `art/`), `assets/og.png` (Open Graph 1200×630), `assets/favicon.svg`, `assets/CV_Denis_Calin_EN.pdf` + `_RO.pdf`, `cv/` (sursa CV-ului). Paletă închisă (negru #070708, grafit, gunmetal, argint periat), fără culoare de accent și fără temă light; RO/EN. Fără cursor custom. Fonturile vin din Google Fonts; altfel nimic extern.

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
- Verifică la 360px, 375px și desktop (1440), în ambele limbi.
- Pagina principală: Hero (raze + CALEA metalic) → Semnul CALEA (secțiune înaltă cu `position: sticky`, fără scroll-jacking) → Proiecte (carduri mari) → Despre + studii (cu poză) → CV → Contact. Plus studii de caz în `proiecte/`. Ce e banal (cursuri, skill-uri, liceu, limbi) stă DOAR în CV-ul PDF.
- Aplicația de cheltuieli e PLANIFICATĂ (start noiembrie 2026): rămâne marcată „Urmează” până există cod; imaginea ei e un concept.
- WebGL-ul pornește doar cu GPU (`failIfMajorPerformanceCaveat`); fără el rămân fallback-urile statice (lumina CSS din hero, SVG-ul semnului). `prefers-reduced-motion`: fără animații, semnul e un singur cadru, fără pin.
- CV-ul public: `cv/cv-en.html` + `cv/cv-ro.html` → `bash cv/build-pdf.sh` regenerează `assets/CV_Denis_Calin_EN.pdf`, `_RO.pdf` și preview-urile PNG. Fără telefon în CV-ul public.

## Cum adaugi lucruri pe viitor
Cel mai simplu: îi scrii lui Claude, de exemplu „adaugă proiectul X: ce face, an, tehnologii, link GitHub, poză”. Claude face restul, în ambele limbi.

Ce trebuie atins (pentru Claude sau dacă o faci de mână):
- **Proiect nou:** un `<article class="work">` nou în `.works` din `index.html` (copiezi cardul FPGA). Cardurile alternează imaginea stânga/dreapta: al doilea, al patrulea… primesc clasa `work-next` (sau una nouă cu aceleași reguli din CSS). Schimbi anul, link-urile, id-ul titlului (`pX-titlu`), cheile `data-i18n` (`pX.title`, `pX.desc`…). Textul RO stă direct în HTML, traducerea EN în dicționarul `EN` din `assets/js/main.js`. Când aplicația de cheltuieli are cod: scoți `work-note`, pui starea reală în `work-meta` și link spre GitHub.
- **Poza lui Denis:** pui fișierul în `assets/img/denis.jpg` (portret 4:5) și decomentezi `<img>`-ul din `.portrait` (vezi TODO-ul din `index.html`), apoi ștergi `.portrait-empty`. CSS-ul o face monocromă.
- **Imagine nouă:** sursa e un HTML/SVG în `art/` (model: `art/fpga-chip.html`, `art/next-app.html`), desenată în gri; `bash art/render.sh` (sau `ONLY="nume" bash art/render.sh`) o randează cu Edge headless și îi aplică tonul site-ului (duotone grafit→argint, în `art/to-webp.html`; `inv=1` pentru surse pe hârtie deschisă). Adaugi numele în lista `JOBS`. Conversia are nevoie de serverul local pornit. În pagină: `<img class="fx par" …>` (lentila WebGL la hover + parallax) într-un `.curtain` > `.frame`, cu `width`/`height`, `alt` + `data-i18n-alt`.
- **Studiu de caz nou:** copiezi `proiecte/fpga.html` (păstrează `data-base="../"` pe `<html>` și `data-en-*` pentru titlu/descriere EN), pui textele EN într-un fișier ca `assets/js/i18n-fpga.js` încărcat înainte de `main.js`. Secțiunile au `data-reveal="once"`. Tot ce scrii trebuie să vină din cod/README sau din `../CV/cv.html`.
- **Dezvăluiri:** blocurile cu `data-reveal="once"` devin `.is-active` o singură dată, când ~40% din ele e pe ecran; titlurile `split` apar pe linii, `lift` urcă, `.curtain` se deschide.
- **Semnul CALEA:** forma „C”-ului e definită în `main.js` (grila 12 × 15 din `signApi`) și, identic, în SVG-ul static din `index.html` (fallback). Dacă schimbi forma, le schimbi pe amândouă.
- **Skill / curs nou:** doar în CV (`cv/cv-*.html`), apoi rulezi build-pdf.
- **CV actualizat:** editezi `cv/cv-en.html` și `cv/cv-ro.html` (structură: antet, Profile, Projects, Education, Spoken languages, Technical skills; o pagină A4), apoi `bash cv/build-pdf.sh` și verifici că PDF-urile au `/Count 1`. Sursa de adevăr pentru date rămâne `../CV/cv.html`.
- **După orice schimbare de CSS/JS:** crești `?v=` din `index.html` și `proiecte/fpga.html` (cache-ul GitHub Pages), apoi verifici în browser la 360px, 375px și 1440px, în ambele limbi, fără erori în consolă și fără scroll orizontal (`node --check` pe JS).

## Publicare
Live: https://deniscalea.github.io (GitHub Pages, repo `deniscalea/deniscalea.github.io`, branch `main`). Orice `git push` pe main republică site-ul în 1–2 minute, așa că se face doar cu OK-ul lui Denis. Nu urca `assets/Denis_Calin_CV.pdf` (are telefonul).
Vezi `PUBLICARE.md`. Deploy-ul public și cumpărarea domeniului le face Denis (sau doar cu OK-ul lui).
