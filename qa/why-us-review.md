# Verificare țintită — De ce noi?

## Actualizare — mutarea secțiunii, 2026-09-07

La cererea utilizatorului, ordinea actuală este `#proiecte` → `#de-ce-noi` →
`#intrebari`. S-a schimbat numai ordinea componentelor în `Main.jsx`.
Build-ul `index-DQ50BSI7.js` a trecut `npm.cmd run build`; după reload în
browser, `previousElementSibling.id` este `proiecte`, iar
`nextElementSibling.id` este `intrebari`. Verificările detaliate de mai jos
documentează implementarea inițială, înaintea acestei mutări.

## Verificarea implementării inițiale

Data: 2026-09-07.
Scope: secțiunea `#de-ce-noi`, introdusă după servicii și imediat înainte de
`#proiecte` / „Proiecte gandite pentru viata, construite pentru viitor.”
Workflow ESA aplicat proporțional unei secțiuni noi într-un site existent;
nu s-a inițializat contractul sau rulat gate-ul pentru redesignul întregului site.

## Implementare

- Cele cinci principii cerute, cu text în română, vizibile integral într-o listă semantică.
- Fundal opac verde închis, text deschis, accente aurii și numerotare discretă.
- Ilustrație SVG originală cu cinci straturi arhitecturale, inspirate de formele
  suprapuse din identitatea Green Tech; nu reprezintă un proiect executat.
- Desktop/tabletă: două coloane. Sub 761px: introducere deasupra listei;
  sub 541px: ilustrația decorativă este ascunsă pentru a prioritiza textul.
- Intrare de 700ms pentru text și 900ms pentru straturile ilustrației, cu decalaj
  de 100ms, declanșată o singură dată la intrarea în viewport. Fără bucle continue.
- Namespace propriu, fără schimbări ale motorului 3D, wrapperilor ori scrollerelor.

## Dovezi și verificări

Build: `npm.cmd run build` — PASS, Vite 5.4.21, 463 module.
Preview verificat: `http://127.0.0.1:4176/`, servind build-ul actual
`index-CF9MbxCq.js` / `index-CyD88GsM.css`.

Capturile reale de viewport au fost inspectate prin browserul integrat Codex
și returnate în conversație; nu s-au salvat fișiere PNG în repository.

| Caz | Rezultat observat |
| --- | --- |
| Desktop 1280 × 720 | Titlu și listă în două coloane; integrarea cromatică și poziția secțiunii au fost inspectate. |
| Desktop 1440 × 1000 | Toate cele cinci principii și ilustrația vizibile, cu separatoare și aliniere coerente. clientWidth = scrollWidth = 1425px. |
| Tabletă 768 × 1024 | Două coloane lizibile, toate cele cinci principii încadrate. clientWidth = scrollWidth = 753px. |
| Intermediar 600 × 900 | Introducere și ilustrație mică deasupra listei într-o singură coloană. clientWidth = scrollWidth = 585px. |
| Mobil 390 × 844 | Titlu compact, listă verticală; toate cele cinci principii inspectate în capturi succesive prin derulare. clientWidth = scrollWidth = 375px. |
| Mobil 320 × 720 | Textul lung „Responsabilitate” încape; descrierile se rearanjează fără trunchiere. clientWidth = scrollWidth = 305px. |
| Ordine și vecini | `nextElementSibling.id` al secțiunii este `proiecte`; trecerea către imaginea și titlul existente a fost inspectată pe desktop și mobil. |
| Animații la scroll | După reload la 320px, primele două principii au `data-revealed=true`, ultimele trei nu; acestea au opacity 1 și animation none până la intrarea în viewport. După wheel, toate cinci au `why-us-enter` și opacity 1 la final. |
| Reduced motion | Schimbarea preferinței în browser dezactivează animația textului și a tuturor celor cinci straturi SVG (`none`); tranzițiile devin `0s`, textele rămân opacity 1. Preferința temporară a fost resetată. |
| Navigare mobilă | Din noua secțiune, deschiderea meniului și alegerea „Proiecte” închid meniul și actualizează URL-ul la `#proiecte`; secțiunea țintă începe la 86px, sub navbar. |
| Link direct | Reload la `#de-ce-noi` restaurează secțiunea după loader, la aproximativ 86px pe mobil. |
| Consolă | Nicio eroare observată. Persistă avertismentul preexistent Three.js despre deprecierea `renderAsync()`. |
| Sursă | `git diff --check` fără erori de whitespace; review separat read-only pentru integrarea scenei, cleanup și semantică. |

Review static de accesibilitate: secțiune cu nume accesibil, h2/h3, listă ol,
decorațiuni aria-hidden și conținut vizibil implicit dacă IntersectionObserver
lipsește. Contrast calculat pe fundal: text 14,05:1; text secundar 8,64:1;
accent 7,16:1. Aceste verificări nu reprezintă o certificare de accesibilitate.

Sursa verificată (SHA-256):

- `src/components/WhyUsSection.jsx`: `F5214349D9EA58FFFBBA5D403A8F66270E9783EC2A7C11DCD85539CFD87B9094`
- `src/components/WhyUsSection.css`: `96242DA2EBF69C281B4A20B94C4DAF9A1DB75C6F57EF48A810D01E5486C459AD`
- `src/components/Main.jsx`: `3BECF9C957FB632A3B80755D4B5D24AB9D04468FF8ED2BEE33844D3B3B9570C3`

## Limite

NOT_RUN: telefoane fizice, Safari, screen reader, audit complet de accesibilitate,
măsurători de performanță/FPS, simulare runtime fără IntersectionObserver.
Fallback-ul fără observer a fost verificat în sursă; preferința reduced motion
a fost verificată în browser. Nu s-au trimis formulare și nu s-au adăugat
dependențe, integrări externe ori afirmații comerciale cantitative.
