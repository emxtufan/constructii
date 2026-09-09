# Blueprint — animație la intrarea în ecran

Verificare țintită ESA, 9 septembrie 2026. Domeniu: `BlueprintDrawing` din
`src/components/CraftSections.jsx` și regulile din `CraftSections.css`.

## Comportament implementat

- Observer local cu praguri `[0, 0.2]`: începe când minimum 20% din figură
  este vizibil, păstrează desenul complet și resetează doar la ieșire completă.
- Secvența SVG furnizată este păstrată: ghidaje, bază (.3 s), stâlpi (1.1 s),
  planșeu (2 s), repere (3.1 s); ultimul traseu se încheie la 4.6 s.
- Eliminată animația veche de deplasare a planșeului, care se suprapunea peste
  noua secvență. Restul animațiilor secțiunilor nu au fost schimbate.
- Fallback static și complet pentru reduced motion sau lipsa observer-ului.
  Listener-ul preferinței de mișcare și observer-ul sunt curățate la unmount.

## Verificări reale

- PASS: `npm.cmd run build`, exit 0, Vite 5.4.21, 475 module, 1.14 s.
  Build: `index-CFxLKntc.css` și `index-MBm6Nm7P.js`.
- PASS: după reload la `/#ground-to-home`, figura aflată în afara ecranului
  avea `data-blueprint-state=waiting` și animation `none`.
- PASS: derularea până la figură a activat `playing` și `gtBlueprintDraw`.
  La terminare, toate cele 10 trasee aveau stroke-dashoffset `0px`, opacity `1`.
- PASS: ieșire completă (top 1299.6875 la viewport height 1000) → `waiting`,
  animation `none`, opacity `0`. Revenire → `playing`, trasee observate la
  offset `1px`/opacity `0`, apoi offset `0px`/opacity `1` după terminare.
- PASS: inspecție vizuală a rezultatului la 1440×1000, 393×852 și 768×1024.
  Pe mobil figura stă deasupra explicațiilor; pe tabletă stă în coloana stângă.
  Schema este încadrată în figură, fără overflow orizontal observat.
- PASS: schimbare live la reduced motion → `static`; toate traseele cu
  animation `none`, dasharray `none`, opacity `1`; ghidaje cu opacity `1`.
  Revenire la no-preference și scroll → secvență activată din nou.
- PASS: fără erori console în verificare; rămâne avertismentul de depreciere
  `THREE.QuadMesh.renderAsync()` din motorul compilat, fără legătură cu acest SVG.
- Preferința de mișcare și viewport-ul au fost restabilite după verificare.

Capturile au fost inspectate în conversație prin browserul guvernat; nu sunt
declarate PNG-uri locale sau un manifest de captură complet. Fallback-ul fără
IntersectionObserver a fost verificat în sursă, nu prin modificarea browserului.
Nu au fost măsurate FPS sau performanțe pe dispozitive fizice. Acest raport nu
schimbă verdictul auditului complet anterior al website-ului.
