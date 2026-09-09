# Animated Hero în FinalStatement

Componenta din prompt este adaptată în `src/components/ui/animated-hero.jsx`,
cu stiluri locale în `animated-hero.css`. Folderul `ui` separă componentele
reutilizabile de secțiunile specifice website-ului. Integrarea și conținutul
Green Tech sunt în `src/components/FinalStatement.jsx`.

Proiectul folosește React 18, JSX, Vite și Tailwind 4, deja configurat prin
`src/index.css`. Biblioteca instalată `motion/react` reexportă Framer Motion;
iconurile sunt furnizate de `react-icons/fi`, disponibil în proiect. Nu sunt
necesare instalări noi, un provider, migrare TypeScript sau inițializare shadcn
pentru această integrare. Button/Radix/CVA din demo nu sunt necesare: acțiunile
au destinații reale în pagină, iar pauza este un buton HTML nativ.

Props: `introduction`, `prefix`, `titles`, `titleId`, `headingClassName`,
`lang` și `interval` (implicit 2800 ms). `titles` este o listă de expresii unice.
Prima expresie completează mesajul static accesibil și fallback-ul fără animație.

Textul rotativ folosește intrare/ieșire verticală și spring, cu înălțime rezervată
pentru cea mai înaltă expresie. Timerul rulează numai în viewport, într-un document
vizibil, fără pauză manuală și fără reduced motion. Observer-ul, timeout-ul și
listener-ele media/visibility sunt curățate la demontare.

Conținutul demonstrativ despre SaaS, articolul de lansare și imaginile stock din
prompt nu au fost introduse în website. Finalul păstrează mesajul de brand și
adaugă acțiunile „Cere o ofertă” și „Explorează etapele”, cu focus transferat
către secțiunea destinație inclusiv la navigarea din tastatură.
