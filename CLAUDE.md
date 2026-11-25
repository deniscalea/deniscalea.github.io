# site-cv — CALEA

Site personal CV/portofoliu al lui Denis-Alexandru Călin (CTI, UTCN, anul 2), sub brandul **CALEA**. Scop: internship + vitrină pentru proiecte (și pentru ideea de site-uri pentru firme locale, vezi `../IDEI.md`).

## Stack
Static, fără build și fără npm: `index.html`, `assets/css/style.css`, `assets/js/main.js`, `assets/favicon.svg`, `assets/CV_Denis_Calin_EN.pdf` + `_RO.pdf`, `cv/` (sursa CV-ului). Design alb-negru, temă dark/light, RO/EN.

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
- Site-ul e minimalist: 5 ecrane (Start, Proiecte cu carusel orizontal, Studii, CV, Contact). Ce e banal (cursuri, skill-uri, liceu, limbi) stă DOAR în CV-ul PDF.
- CV-ul public: `cv/cv-en.html` + `cv/cv-ro.html` → `bash cv/build-pdf.sh` regenerează `assets/CV_Denis_Calin_EN.pdf`, `_RO.pdf` și preview-urile PNG. Fără telefon în CV-ul public.

## Cum adaugi lucruri pe viitor
Cel mai simplu: îi scrii lui Claude, de exemplu „adaugă proiectul X: ce face, an, tehnologii, link GitHub, poză”. Claude face restul, în ambele limbi.

Ce trebuie atins (pentru Claude sau dacă o faci de mână):
- **Proiect nou:** e un slide nou în caruselul din `#proiecte` din `index.html` (copiezi slide-ul FPGA, pui înaintea slide-ului „În curând”). Schimbi numărul (`P.0X`), anul, link-ul, id-urile (`pX-titlu`) și cheile `data-i18n` (`pX.title`, `pX.desc`…). Textul RO stă direct în HTML, iar traducerea EN se adaugă în dicționarul EN din `assets/js/main.js`. Pozele/capturile intră în `assets/img/` (cu width/height, alt și loading="lazy").
- **Skill / curs nou:** doar în CV (`cv/cv-*.html`), apoi rulezi build-pdf.
- **CV actualizat:** editezi `cv/cv-en.html` și `cv/cv-ro.html`, apoi rulezi `bash cv/build-pdf.sh`. Sursa de adevăr pentru date rămâne `../CV/cv.html`.
- După orice schimbare: verifici în browser la 360px și pe desktop, în ambele limbi.

## Publicare
Live: https://deniscalea.github.io (GitHub Pages, repo `deniscalea/deniscalea.github.io`, branch `main`). Orice `git push` pe main republică site-ul în 1–2 minute, așa că se face doar cu OK-ul lui Denis. Nu urca `assets/Denis_Calin_CV.pdf` (are telefonul).
Vezi `PUBLICARE.md`. Deploy-ul public și cumpărarea domeniului le face Denis (sau doar cu OK-ul lui).
