# Verificare țintită: loader cu procente

Scop: ecranul de încărcare, sincronizarea cu resursele și scena, eroare/continuare, fallback HTTP. Workflow ESA aplicat ca modificare restrânsă; nu este un audit complet al website-ului.

## Sursa verificată

- `dist/assets/index-DgC2lwE2.css`: SHA256 `49A13D900A355CCC4922227FA0DFD9268B985C169D35455D60ED9667D778C292`.
- `dist/assets/index-BNvGCWS5.js`: SHA256 `B28E44280C69579C6A2A99D4348F145ADDD4B245CC7B8A0572F765B74E9221C2`.
- `public/_astro/greentech-loading.js`: SHA256 `C3CE1EBA429366F10CA17C7741140C5A34C36B8D6F9EF391AF0FE50D9812E272`.

Build-ul standard a trecut înaintea ajustării finale de layout pentru fallback. La compilarea finală, Windows a returnat EPERM pentru ștergerea `dist/icons`; build-ul final a trecut cu `npm.cmd run build -- --emptyOutDir false` (489 module). Fișierele de mai sus provin din acest build final.

## Dovezi efectuate

Inspecție în browserul IAB, prin CUA. Capturile reale au fost afișate și inspectate în conversație; nu sunt salvate ca fișiere PNG în repository. Verificările DOM au citit progresul ARIA, starea loaderului, geometria secțiunilor și vizibilitatea paginii.

| Verificare | Rezultat | Observație |
| --- | --- | --- |
| Desktop 1440 × 1000, cache dezactivat, 1 MB/s și latență 100 ms | PASS | Capturat loaderul la 16%; logo centrat, bară și procent. După restaurarea vitezei, 100%, loader dismissed, un canvas, scroll deblocat, fără overflow orizontal. |
| Mobil 393 × 852, aceleași condiții | PASS | Loader vizibil la 16%, apoi 44% și 100%. Imaginile încărcate, scena vizibilă. Meniul se deschide și se închide după loader. |
| GLB blocat cu Network.setBlockedURLs | PASS | Eroare la 40%; nu apare 100%. Butoanele Reîncearcă și Continuă pe site sunt vizibile. |
| Continuă pe site, desktop și mobil | PASS | Loader ascuns, hero vizibil, scroll deblocat, meniu utilizabil pe mobil. Intro-ul nu revine după continuare. |
| Fallback fără suprapuneri, build final | PASS | După corecția scoped, hero bottom = flow top: 505.125 px mobil și 583.96875 px desktop. CTA separat de proces și descrieri vizibile. |
| HTTP pe IP local, fără secure context | PASS | Loader 100%, fallback activ, fără script CommonScripts sau canvas. Fără erori în logul verificat. |
| Reduced motion, HTTP mobil | PASS | Loader finalizat, transition-duration 0s, fără overflow orizontal. |
| Teste logice | PASS | 12/12: ponderare și prag100, streams cu/fără Content-Length, stream întrerupt, gating pagină/scenă, anulare și eroare tardivă. |

## Limite

Nu s-au testat telefoane fizice, Safari, WebGL context loss după intro, toate interacțiunile website-ului sau formularul SMTP. Butonul Reîncearcă a fost inspectat, nu apăsat. Serverul public nu a fost modificat; necesită publicarea întregului dist. Calea offscreen a motorului este inactivă și nu este certificată de aceste verificări. Nu s-a rulat gate-ul complet ESA și nu se revendică un verdict complet de accesibilitate sau performanță.

