# Instrucțiuni permanente pentru proiectul constructii

Aceste instrucțiuni se aplică întregului repository, în toate sarcinile viitoare,
atât agentului principal, cât și subagenților care lucrează la proiect.

## Workflow obligatoriu

La cererea explicită a utilizatorului, folosește permanent
`esa-web-design-workflow` ca workflow de referință pentru acest proiect.

- Înainte de analiza, planificarea sau modificarea proiectului, citește
  [.agents/skills/esa-web-design-workflow/SKILL.md](.agents/skills/esa-web-design-workflow/SKILL.md).
  Dacă l-ai citit deja în sesiunea curentă și nu s-a schimbat, aplică instrucțiunile
  fără să îl recitești inutil.
- Folosește copia din repository; nu depinde de existența arhivei din Downloads.
  Pachetul a fost importat integral din
  `C:\Users\GPRO\Downloads\esa-web-design-workflow.zip` la 2026-09-07.
- Respectă domeniul și proporțiile definite de skill: workflow complet pentru
  site nou sau redesign substanțial; inspecție și verificări țintite pentru
  modificări vizuale restrânse; analiză fără modificări pentru cereri de review.
  Pentru sarcini fără componentă de design, urmează delimitările skill-ului.
- Citește referințele cerute de skill înaintea etapelor relevante. Pentru scena
  3D, animații sau derulare, include `references/motion-and-3d.md`.
- Aplică regulile privind dovezile reale, verificarea responsive și interacțiunile,
  păstrarea cerințelor utilizatorului și bugetul de reparații. Distinge verificările
  efectuate de cele neefectuate; un build reușit nu ține loc de verificare vizuală.
- Nu crea un contract complet `design/` și `qa/` doar pentru a instala skill-ul sau
  pentru o schimbare minoră; urmează nivelul de lucru cerut de skill și de sarcină.
- Dacă skill-ul lipsește sau nu poate fi citit, semnalează problema concretă;
  nu pretinde că l-ai aplicat.

## Agenți și delegare

- Păstrează configurația inclusă în pachet:
  [.agents/skills/esa-web-design-workflow/agents/openai.yaml](.agents/skills/esa-web-design-workflow/agents/openai.yaml).
  Acest fișier conține metadatele și politica de invocare a skill-ului; pachetul
  primit nu include definiții de subagenți separați.
- Pentru sarcini ample care au subtasks independente, folosește delegarea către
  subagenții disponibili, conform cererii utilizatorului. Nu crea sarcini Codex
  separate în sidebar doar pentru delegare.
- Include în fiecare delegare cerința de a citi acest `AGENTS.md` și skill-ul ESA,
  precum și obiectivul concret, fișierele în responsabilitate și verificările
  necesare. Evită editarea simultană a acelorași fișiere.
- Agentul principal integrează rezultatele și verifică experiența completă;
  toate rezultatele delegate trebuie să respecte același workflow ESA.

## Particularități ale proiectului

- Păstrează identitatea Green Tech Real Estate, conținutul și stack-ul existent,
  dacă utilizatorul nu cere schimbarea lor.
- Scena 3D și unele interacțiuni sunt inițializate în `src/App.jsx` din motorul
  compilat aflat în `public/_astro/`. Verifică dependențele de clase, ID-uri și
  structură DOM înainte de a modifica secțiunile sau animațiile.
- În PowerShell folosește `npm.cmd`; build-ul proiectului este `npm.cmd run build`.
- Instrucțiunile explicite ale utilizatorului și regulile mediului au prioritate
  față de acest fișier și față de skill. Nu adăuga confirmări fără un motiv concret.
