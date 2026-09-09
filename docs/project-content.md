# Actualizarea proiectului real

Datele întregului proiect sunt în `src/data/project.js`. Nu sunt necesare
modificări în fiecare secțiune pentru a adăuga fotografii sau actualizări.

Fișierul actual nu conține nume, procent sau cronologie inventate.
Valorile `null` și listele goale produc stări editoriale explicite. Acestea
trebuie completate înainte de prezentarea paginii ca documentare finalizată.

## Informațiile necesare

- `name`, `location`, `description`: denumirea și descrierea confirmate de proprietar.
- `currentPhaseId`: ID-ul unei etape din `phases`, cu status confirmat.
- `progress`: procent măsurat/confirmat, între 0 și 100, sau `null`. Nu îl deduce
  automat din numărul de etape, fiindcă acestea au durate și ponderi diferite.
- `updatedAt`: data reală a actualizării, în format `YYYY-MM-DD`.
- `phases`: numai etapele aplicabile proiectului. Ordinea inițială este un format
  editorial de lucru, nu cronologia documentată a unei construcții.
- `status`: `completed`, `in-progress`, `coming-soon` sau `null` dacă nu e confirmat.
  Se pot desfășura lucrări în paralel; statusurile nu sunt deduse din index.

## Fotografii

La 9 septembrie 2026, cele șase imagini furnizate în `public/img` au fost
asociate celor șapte etape din „Din teren. În locul numit acasă.”. Imaginea
`instalatie.png` apare atât la instalații, cât și la pregătirea interioarelor;
poate fi înlocuită separat la `interiors` când este disponibilă o altă imagine.
Acestea sunt imagini de prezentare, nu dovezi ale stadiului real. Descrierile
etapelor explică procesul în general; statusurile și datele rămân neconfirmate.

Comparația „Același loc. O altă perspectivă.” folosește imaginile furnizate
`a2e4a6fa-cc06-4205-a3c5-4a234d3b6713.png` (teren) și
`01ace805-8f36-44ba-a05b-b76f1fd5441e.png` (construcție) în `before` și `current`.
Ambele au 1672 × 941 px. Sliderul păstrează același raport și încadrare pentru
ambele, inclusiv pe mobil. Asocierea imaginilor nu completează automat
procentul, data sau statusurile proiectului.

Copiază fotografiile autentice într-un folder ca `public/img/project/`, apoi
setează un obiect imagine cu `src` (de exemplu calea locală `/img/project/...`),
`alt`, `caption`, `width`, `height`. Nu folosi fotografia conceptuală existentă
ca dovadă de execuție. Nu publica persoane/documente fără drepturile necesare.

- `cover`: fotografia de prezentare.
- `phases[].image`: fotografia relevantă pentru fiecare etapă; `note` este
  descrierea confirmată a lucrărilor, nu o deducție din imagine.
- `before`, `current`: cele două fotografii ale aceluiași proiect pentru comparație.
  Alege unghiuri și încadrări apropiate; sliderul se activează când există ambele.
- `materials[]`: `{ id, title, description, image }`; specificațiile trebuie
  confirmate, nu deduse din aspectul fotografiei.
- `gallery[]`: obiecte imagine cu `id` și, opțional, `category`.

Galeria se activează automat când sunt adăugate imagini: dialog, săgeți, Escape,
anterior/următor. Imaginile reale trebuie verificate în browser după adăugare.
Nu s-a verificat încă această experiență cu materialele autentice lipsă.

## Jurnal

Adaugă în `journal` obiecte cu `id`, `date` (`YYYY-MM-DD`), `phase`, `title`,
`summary`, opțional `details`, `image` și `week` (numai săptămâna confirmată).
Intrările se afișează de la cea mai recentă. Datele invalide sau lipsă sunt
omise, pentru a evita publicarea unei cronologii false.

Exemplele de săptămâni din brief nu au fost introduse ca actualizări reale.
Etapele viitoare se afișează în What Comes Next numai dacă au `coming-soon`.

## Formular

REQUEST A QUOTE pregătește un rezumat în pagină. Utilizatorul poate reveni la
câmpuri, copia cererea sau deschide aplicația sa de email. Nu există API de
expediere, stocare a cererilor ori upload de planuri; planurile se atașează în
email. Adresa existentă trebuie confirmată înainte de utilizare publică.

## După actualizare

Rulează `npm.cmd run build`, actualizează previzualizarea și verifică etapele,
procentul, datele, imaginile, galeria și comparația pe mobil/tabletă/desktop.
Completarea fișierului nu constituie o verificare a autenticității materialelor.
