# Animația FoundationIllustration — 9 septembrie 2026

Verificare ESA țintită pentru `WhyUsSection.jsx` și `WhyUsSection.css`.

## Modificare

Ilustrația are observer propriu: pornește la 20% vizibilitate, păstrează
straturile complete și se resetează doar când iese complet din viewport.
Nu mai este observată de animația generală de intrare a textelor.

Cele cinci straturi apar de jos în sus cu întârzieri de 300, 560, 820, 1080
și 1340 ms. Fiecare strat se așază și își desenează contururile; detaliile au
încă 200 ms întârziere. Secvența CSS se încheie la 2740 ms. Geometria SVG și
translațiile interioare originale sunt păstrate. Ghidajele punctate doar apar
gradual. Sub 540 px desenul este acum vizibil, centrat și limitat la 300 px.

Fallback-ul implicit este static. Reduced motion dezactivează animațiile și
afișează toate straturile. Observer-ul și listener-ul media sunt curățate la
unmount; celelalte animații din pagină nu au fost modificate.

## Verificare efectuată

- PASS: build final `npm.cmd run build`, exit 0, Vite 5.4.21, 475 module,
  1.30 s; artefacte `index-C3CfPb1W.css`, `index-Wnx0ZAFB.js`.
- PASS: la reload, desenul aflat sub viewport era în `waiting`, cu animation
  `none`. La scroll în cadru a trecut în `playing`.
- PASS: la terminare toate cele cinci straturi aveau opacity 1 și contururi
  cu dashoffset 0. Întârzierile stratului și detaliilor au fost citite din
  stilurile calculate în browser și corespund secvenței definite.
- PASS: ieșire completă (top 1500.03125 la viewport height 1000) → waiting,
  animation none. Revenire → playing și straturi complet vizibile la final.
- PASS: capturi inspectate în conversație la 1440×1000, 393×852 și 768×1024.
  Desenul păstrează proporțiile și nu acoperă textul. Pe telefon are
  300×202.5 px; pe tabletă 292.046875×197.125 px. Fără overflow orizontal
  observat pe mobil și tabletă.
- PASS: schimbare live la reduced motion → static; toate straturile opacity 1,
  transform none, animații none și dasharray none. Ghidajele rămân vizibile.
  Revenirea la no-preference reactivează observarea și desenarea la intrare.
- PASS: fără erori console în verificare. Rămâne avertismentul de depreciere
  THREE.QuadMesh.renderAsync() al motorului compilat existent.
- Viewport-ul și preferința de mișcare au fost resetate; previzualizarea este
  la `/#de-ce-noi`.

Capturile au fost inspectate prin browserul guvernat, fără PNG-uri locale
declarate. Nu s-au măsurat FPS sau performanțe pe dispozitive fizice. Fallback-ul
fără IntersectionObserver a fost verificat în cod. Acest raport țintit nu
schimbă verdictul auditului complet anterior al website-ului.
