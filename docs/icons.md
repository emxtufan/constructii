# Pictograme și metadate

Sursa este logo-ul real `public/img/greentech-logo.svg`. Pictogramele folosesc simbolul clădirii extras din geometria originală, în negru și auriu; imaginea socială folosește logo-ul complet GREENTECH. Scriptul regenerează inclusiv `public/favicon.svg`, înlocuind simbolul albastru al șablonului. Fișierele se generează în `public`, apoi Vite le copiază în `dist`; nu edita doar copia din dist.

`scripts/generate-icons.mjs` folosește Sharp disponibil local sau indicat prin variabila `SHARP_MODULE_PATH`. Nu este necesar Sharp la pornirea serverului sau la un build normal; imaginile generate sunt incluse în repository.

```powershell
# SHARP_MODULE_PATH poate indica o copie Sharp deja disponibilă în mediul local.
node scripts/generate-icons.mjs
npm.cmd run build
```

Generate: favicon PNG 16/32/48/96 px, favicon ICO cu 16/32/48 px, Apple 152/167/180 px, manifest 192/512 px, maskable 512 px, Windows tile 150 px, Safari pinned SVG monocrom și imagine socială 1200×630 px. Faviconul SVG adaptează părțile închise pentru dark mode; PNG-urile păstrează culorile logo-ului. Pictogramele Apple și aplicație au fundal opac și spațiu de protecție; varianta maskable are margini mai largi. Referințele din metadate includ `?v=greentech-logo` pentru a înlocui în cache pictogramele anterioare.

Metadatele sunt în `index.html`, manifestul în `public/icons/site.webmanifest`, iar configurația Windows în `public/icons/browserconfig.xml`. Manifestul folosește numele Green Tech Real Estate. Referințele OG/Twitter rămân relative ca restul proiectului; pentru validarea cu crawlere sociale trebuie stabilit domeniul public final și folosite URL-uri absolute pentru imagine și pagina canonică.

## Verificare efectuată la 2026-09-10

- Inspectate vizual imaginile generate Apple 180×180 și social 1200×630, fără deformarea sau tăierea desenului.
- Verificate dimensiunile PNG și directorul ICO 16/32/48.
- Toate cele 17 resurse indicate de metadate/manifest/configurație răspund HTTP 200 pe serverul local și sunt identice cu fișierele din dist.
- Metadatele finale au fost citite și din DOM-ul browserului după reload.
- Build final PASS cu `npm.cmd run build -- --emptyOutDir false`; curățarea standard a dist a fost blocată de Windows cu EPERM la dist/icons.
- Nu s-au verificat instalarea pe dispozitive Apple/Android fizice sau previzualizările crawlere-lor sociale. Nu s-a publicat pe serverul extern.
