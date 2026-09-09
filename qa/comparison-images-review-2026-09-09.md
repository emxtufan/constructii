# Comparație Before / Current — 9 septembrie 2026

Verificare ESA țintită pentru integrarea celor două imagini furnizate în
„Același loc. O altă perspectivă.” (`#before-current`).

## Integrare

- Before: `a2e4a6fa-cc06-4205-a3c5-4a234d3b6713.png` — teren liber.
- Current: `01ace805-8f36-44ba-a05b-b76f1fd5441e.png` — construcție în lucru.
- Ambele fișiere au 1672 × 941 px. Reperele fixe au fost inspectate în imaginile
  originale: gard, fațade laterale, copac, felinar și bordură.
- Raportul imaginii este păstrat pe toate dimensiunile. Cele două imagini ocupă
  aceeași ramă, cu aceeași poziție centrală, fără transformări individuale.
- Sliderul existent dezvăluie imaginea inițială prin clip-path. Au fost completate
  dimensiunile, alt-urile, descrierea și legendele. Fișierele originale nu au
  fost modificate. Nu au fost deduse procente, date sau statusuri.

## Verificări reale

- PASS — `npm.cmd run build`, exit 0, Vite 5.4.21, 475 module, 1.28 s.
  Artefacte: `index-DcBdKsM_.css`, `index-DD-lZvTu.js`.
- PASS — după refresh, ambele imagini sunt încărcate complet în browser cu
  dimensiunile naturale 1672 × 941.
- PASS — desktop 1440×1000: cele două elemente imagine au exact aceeași
  geometrie (1320 × 742.890625), inspecție vizuală a separatorului la 50%.
- PASS — Home → 0%, clip `inset(0px 100% 0px 0px)`; End → 100%, clip
  `inset(0px 0% 0px 0px)`. Tragere cu mouse-ul → 72%, clip 28%.
- PASS — mobil 393×852: ambele imagini au aceeași geometrie (330 × 185.71875),
  object-fit cover și object-position 50% 50%; fără overflow orizontal.
  Tragere cu pointerul la această dimensiune → 29%, aria-valuetext actualizat.
- PASS — tabletă 768×1024: geometrie identică pentru imagini (689 × 387.765625),
  fără overflow; inspecție vizuală a cadrului integral și a legendelor.
- PASS — Home urmat de cinci PageUp readuce valoarea la 50%. Viewport-ul a fost
  resetat, iar previzualizarea lăsată la `/#before-current`.
- PASS — fără erori în consola verificată. Persistă avertismentul de depreciere
  THREE.QuadMesh.renderAsync() din motorul compilat, fără legătură cu această schimbare.

## Limite

Capturile au fost inspectate în conversație prin browserul guvernat; nu sunt
declarate PNG-uri locale sau un audit complet al paginii. Testul de gest tactil
nativ este NOT_RUN: browserul in-app nu suportă Input.dispatchTouchEvent.
Tragerea cu pointerul și tastatura au fost verificate; nu s-a testat un telefon
fizic și nu s-a măsurat performanța pe o rețea mobilă. Acest raport nu schimbă
verdictul auditului complet anterior.
