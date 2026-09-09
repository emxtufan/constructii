# FoundationIllustration — dimensiune desktop

Schimbare ESA țintită: la viewport peste 1000 px, lățimea maximă a desenului
crește de la 340 la 560 px, limitată în continuare la lățimea coloanei.

- PASS: build `npm.cmd run build`, exit 0, 475 module, 1.23 s;
  `index-BQCkYjBj.css`, `index-CqQS2Udl.js`.
- PASS: browser 1440×1000, desen 560×378 px, captură inspectată în conversație.
  Desenul încape în coloana sa, separat de textele principiilor.
- PASS: browser 393×852, lățimea desenului rămâne 300 px.
- Fără overflow orizontal observat la ambele dimensiuni. Viewport-ul resetat.

Geometria SVG și logica animației nu au fost modificate; auditul integral nu
a fost reluat pentru această schimbare de dimensiune.
