# Fotografii WebP

Cele 9 fotografii PNG/JPG din `public/img` au fost convertite în WebP, fără redimensionare. Conversia folosește Sharp: quality 86, alphaQuality 100, effort 6, smartSubsample și aplicarea orientării EXIF. Este compresie cu pierderi; rezoluțiile și transparența efectivă sunt verificate la conversie.

- Înainte: 21.292.283 bytes.
- După: 2.470.770 bytes.
- Reducere: 88,4% pentru cele 9 fotografii.

Originalele sunt păstrate în `assets/originals/img`, în afara folderului public. `public/img` și `dist/img` conțin acum fotografiile WebP, textura existentă `smoke.webp` și cele două logo-uri SVG vectoriale. Iconurile PNG din `public/icons` rămân în formatul necesar metadatelor Apple/manifest.

Referințele active sunt actualizate în `src/data/project.js` și `src/components/StandardsSection.jsx`. Loaderul, etapele și comparația Before/After folosesc aceleași date și noile URL-uri.

Pentru regenerare, cu Sharp local sau `SHARP_MODULE_PATH` către un modul deja disponibil:

```powershell
node scripts/convert-images-webp.mjs assets/originals/img
npm.cmd run build
```

Verificări efectuate la 2026-09-10: toate dimensiunile fotografiilor păstrate; comparată vizual fotografia structurii înainte/după conversie; toate cele 10 WebP din img răspund HTTP 200 cu `image/webp` și sunt identice în public, dist și serverul local. Loaderul ajunge la 100%; imaginile Before/After și etapa Predarea (nume cu spații) se încarcă. Inspectate în browser etapa Fundația la 1440×1000 și Structura la 393×852, fără imagini rupte sau overflow orizontal. Capturile au fost inspectate în conversație.

Build final PASS cu `npm.cmd run build -- --emptyOutDir false`, bundle `index-C1lz_PdM.js`; folosită această variantă din cauza blocajului Windows existent la curățarea dist/icons. Cele 9 copii PNG/JPG vechi au fost eliminate doar din dist/img după verificarea hash-urilor față de originalele arhivate. Nu s-a publicat pe serverul extern și nu s-a efectuat un audit complet al paginii sau al dispozitivelor fizice.
