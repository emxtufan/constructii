# Imagini pentru From ground to home — 9 septembrie 2026

Verificare țintită ESA pentru integrarea imaginilor în `#ground-to-home`.
Nu reprezintă o reluare sau un verdict al auditului complet al website-ului.

## Modificare

- Cele șase fișiere furnizate în `public/img` sunt asociate celor șapte etape
  din `src/data/project.js`. Imaginea `instalatie.png` este reutilizată la
  instalații și pregătirea interioarelor; nu există o imagine distinctă de finisaje.
- Alt-uri descriptive, dimensiuni intrinseci și texte generale ale procesului.
- Cadru 3:2 pentru poveste pe desktop/tabletă și 4:3 pe mobil, păstrând
  tranziția existentă și parallax-ul condiționat de preferințele utilizatorului.
- Imaginile sunt prezentate ca ilustrarea etapelor, nu ca documentare verificată
  a stadiului actual. Nu au fost deduse statusuri, procente, date sau clienți.

## Verificări efectuate

- PASS — `npm.cmd run build`, exit 0: Vite 5.4.21, 475 module, 1.29 s.
  Artefacte: `index-WSorx3PA.css`, `index-XXVOUAFF.js`.
- PASS — previzualizare a build-ului la `http://127.0.0.1:4176/#ground-to-home`.
  Serverul oprit inițial a fost pornit prin API-ul Vite preview, fără schimbarea
  configurației proiectului.
- PASS — clic pe fiecare dintre cei șapte pași: imaginea și titlul se schimbă,
  dimensiunile naturale corespund fișierelor. Fișierele mai mari observate în
  curs de încărcare au fost reverificate încărcate la Structura, Instalațiile
  și Predarea. Numele fișierului cu spații de la Predarea se încarcă normal.
- PASS — inspecție vizuală în browser la 1440×1000, 393×852 și 768×1024.
  Nu s-a detectat overflow orizontal al paginii la aceste dimensiuni.
  Capturi inspectate în conversație: introducere și teren pe desktop,
  structura pe desktop, instalații și predare pe mobil, zidărie pe tabletă.
  Subiectele principale rămân vizibile, imaginea mobilă și textul se stivuiesc,
  iar navigarea etapelor se derulează în containerul propriu.
- PASS — tastatura Home/End schimbă prima/ultima etapă, mută focusul pe
  butonul selectat și aduce butonul în zona vizibilă pe mobil.
- PASS — parallax activ observat pe desktop (`matrix(1.06, 0, 0, 1.06, 0, 1.08984)`).
  Cu `prefers-reduced-motion: reduce`, imaginea are transform `none`, iar
  tranziția cadrului are animation `none`. Preferința și viewport-ul au fost resetate.
- PASS — fără erori console în verificarea efectuată. Un avertisment existent
  de depreciere THREE.QuadMesh `renderAsync()` provine din motorul compilat
  `public/_astro/vendor.BgqcyBjU.js`, fără legătură cu imaginile etapelor.

## Limite

Capturile au fost emise și inspectate prin browserul guvernat în conversație;
nu sunt declarate PNG-uri salvate local sau manifest complet de captură.
Performanța pe rețele mobile și un audit integral de accesibilitate: NOT_RUN.
Fișierele originale nu au fost recomprimate; imaginile se încarcă lazy, pentru
etapa afișată. Galeria, comparația și stadiul actual nu au fost populate prin
această modificare, care privește exclusiv fotografiile etapelor.
