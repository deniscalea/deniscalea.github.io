# Cum publici site-ul + domeniu

Prețuri verificate pe web la 25.11.2026. Lei calculați aproximativ (~4,6 lei/USD, ~5 lei/EUR). „[?]” = nu am găsit o sursă oficială din 2026, deci verifică pe site înainte să plătești.

## Cât costă un domeniu pe an

| Unde | .com primul an | .com reînnoire | .ro |
|---|---|---|---|
| Cloudflare Registrar | ~$10,4 (~48 lei) [?] | la fel (preț de cost) | nu vinde .ro |
| Porkbun | ~$10,1 (~46 lei) [?] | ~$11,1 (~51 lei) | — |
| Namecheap | $15,98 (~74 lei) | $19,98 (~92 lei) | — |
| Registrari RO (Hostico, Gazduire.net, ClausWeb) | — | — | cam 6,5–9 EUR/an (~32–45 lei) [?] |
| ROTLD direct | — | — | ~12 EUR + TVA/an [?] |

**Pe scurt:** .com costă cam 45–50 lei/an la Cloudflare sau Porkbun, la fel și reînnoirea. Namecheap e mai scump la reînnoire. .ro iese cam 35–60 lei/an la un registrar românesc, dar verifică prețul de reînnoire și dacă e cu TVA.

**Ce aș alege:** pentru internship-uri și firme din afară, `.com` pe Cloudflare. Pentru clienți locali (cofetării etc.), un `.ro` arată mai „de-al nostru”. Verifică întâi dacă e liber `calea.ro` / `calea.com` (probabil sunt luate), altfel: `calea.dev`, `caleastudio.ro`, `deniscalin.com`, `denis-calin.ro`.

## Hosting gratuit (site static)

| Platformă | Gratuit? | Domeniu propriu + HTTPS | Atenție |
|---|---|---|---|
| **Cloudflare Pages** ⭐ | da, trafic static nelimitat | da | permite uz comercial |
| GitHub Pages | da (repo public) | da | repo privat → plan plătit |
| Netlify | da, 300 credite/lună | da | dacă depășești, site-ul poate fi pus pe pauză |
| Vercel Hobby | da | da | **doar necomercial** (nu merge pentru site-uri de clienți) |

**Recomandare:** Cloudflare Pages. E gratuit, rapid, ține și domeniul în același loc și poți face pe el și site-urile pentru firme.

## Pas cu pas (le faci tu, eu nu creez conturi)

### 1. Pune codul pe GitHub
1. Pe github.com, cu contul tău (`deniscalea`) → **New repository** → nume `site-cv` → Public → Create.
2. Din folderul proiectului:
```powershell
cd C:\Users\Denis\Documents\Proiecte\site-cv
```
```powershell
git init; git add .; git commit -m "Site CV CALEA"
```
```powershell
git branch -M main; git remote add origin https://github.com/deniscalea/site-cv.git; git push -u origin main
```

### 2. Publică pe Cloudflare Pages
1. dash.cloudflare.com → îți faci cont (gratuit).
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → alegi repo-ul `site-cv`.
3. Framework preset: **None**. Build command: gol. Output directory: `/`.
4. **Save and Deploy**. Primești un link `site-cv.pages.dev`, gata publicat.
5. De acum, orice `git push` republică automat site-ul.

(Variantă GitHub Pages: repo → Settings → Pages → Branch `main`, folder `/root` → Save → `deniscalea.github.io/site-cv`.)

### 3. Cumpără domeniul
- **.com:** în Cloudflare → **Domain Registration** → **Register Domains** → cauți numele → plătești cu cardul tău.
- **.ro:** la un registrar RO (de ex. Hostico sau ClausWeb). După cumpărare, schimbi **nameserverele** cu cele pe care ți le dă Cloudflare (Add a site → planul Free).

### 4. Leagă domeniul de site
1. Cloudflare → proiectul Pages `site-cv` → **Custom domains** → **Set up a domain** → scrii domeniul.
2. Dacă domeniul e în Cloudflare, DNS-ul se face singur. HTTPS-ul se activează automat în câteva minute.

### 5. După publicare
- Spune-mi URL-ul final și pun URL-uri absolute în meta + imaginea Open Graph (preview frumos când dai link pe WhatsApp/LinkedIn).
- Pune link-ul în CV, pe GitHub (profil → Website) și pe LinkedIn.
