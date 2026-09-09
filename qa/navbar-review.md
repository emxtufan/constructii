# Verificare țintită — navbar Green Tech

Data: 2026-09-07. Referință vizuală inspectată: https://www.supaste.com/.
Scope: înlocuirea navbarului, meniul mobil, ancorele și integrarea cu scena existentă.
Workflow ESA aplicat ca modificare vizuală restrânsă; nu s-a rulat gate-ul complet
pentru un redesign al întregului site.

## Implementare

- Bară compactă, centrată, atașată marginii superioare, cu colțuri concave sus
  și rotunjite jos, inspirată de referință. Identitate Green Tech alb/auriu.
- Componente React independente de selectorii meniului din motorul compilat.
- Navigare la servicii, proces, proiecte, întrebări și formular, cu offset calculat
  din înălțimea barei. Linkurile directe sunt restaurate după loader.
- Meniu mobil cu focus controlat, fundal inert, Escape, închidere din exterior,
  scroll propriu pe ecrane scurte și respectarea mișcării reduse.
- Corectarea handlerului global de ancore pentru clickurile cu modificatori.
- Inputul invizibil de fișiere avea lățime intrinsecă de 344px și lărgea pagina
  la 320px. Limitarea sa la 1px elimină overflow-ul fără a schimba uploadul.

## Verificări efectuate

Build: `npm.cmd run build` — PASS. Vite a generat build-ul fără erori.
Preview: build-ul local servit pe `http://127.0.0.1:4176/`, verificat în browserul
integrat Codex. Au fost inspectate capturi de viewport și cropuri de navbar
returnate în conversație de browser; nu sunt fișiere PNG salvate în repository.

| Verificare | Rezultat observat |
| --- | --- |
| 320px, meniu închis/deschis | Navbar lizibil; după corecția inputului, clientWidth și scrollWidth sunt ambele 305px (scrollbar vertical de 15px). |
| 390px, meniu închis/deschis | Logo, linkuri și CTA încadrate; panou lizibil și fără overflow orizontal. |
| 768px, tabletă | Bară de maximum 600px; panou și CTA vizibile. |
| 900px / 901px | Comutare meniu mobil / navigare desktop; bara nu depășește lățimea disponibilă. |
| 1280px / 1440px | Logo, patru linkuri și CTA pe un rând; scena 3D continuă să se afișeze. |
| 667 × 375px | Panoul se derulează intern; scrollTop 130px și marginea inferioară CTA la 331px, în viewportul de 375px. |
| Meniu deschis → desktop | Meniu închis, backdrop eliminat, atribut inert eliminat, overflow restaurat. |
| Escape și Tab / Shift+Tab | Focusul rămâne în meniu, se înfășoară între primul și ultimul control și revine la toggle la închidere. |
| Click în exterior | Meniul se închide și pagina devine interactivă. |
| Wheel pe backdrop | scrollY a rămas 8347px înainte și după tentativa de derulare. |
| Navigare desktop | Toate cele patru destinații verificate la top 92px, sub bara de 72px; focus pe titlul secțiunii. |
| Link direct după reload | `#contact` restaurat la top 86px, sub bara mobilă de 66px. |
| Înapoi în browser | Revenire la `#proiecte`, top 92px. |
| Ctrl+click | Deschide tab separat către `#proiecte`; pagina inițială rămâne la `#contact`. |
| Reduced motion | Animația panoului: `none`; tranziția toggle: `0s`; navigarea instantanee verificată. |
| FAQ existent | Deschiderea celei de-a doua întrebări închide prima și actualizează aria-expanded. |
| Consolă | Nicio eroare observată; avertisment preexistent Three.js despre `renderAsync()`. |

## Limite

Verificare în browser desktop cu dimensiuni și media emulate; nu pe telefoane
fizice, Safari sau cu screen reader. Nu s-au trimis formulare și nu s-a realizat
audit de performanță ori de accesibilitate complet. Reduced motion a fost verificat
pentru navbar; motorul 3D existent are propriul comportament. Paginile și resursele
lipsă identificate anterior rămân în afara acestei modificări.
