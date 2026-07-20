// Accordion toggling is owned by the compiled scene engine (it swaps `faq-item--open`
// and `aria-expanded` on `.faq-item__header`). We render the exact initial DOM — first
// item open, the rest closed — and let the engine drive it, so we don't duplicate logic.
const faqs = [
  {
    q: 'Ce tipuri de proiecte realizati?',
    a: 'Realizam case individuale, ansambluri rezidentiale, cladiri cu functiuni mixte, renovari complete si modernizari energetice. Putem prelua intregul proiect sau doar etapele dorite.',
  },
  {
    q: 'Puteti gestiona proiectul de la idee la cheie?',
    a: 'Da. Analizam terenul, definim conceptul, coordonam proiectarea si autorizarea, organizam executia si predam constructia finalizata. Bugetul si calendarul sunt stabilite de la inceput.',
  },
  {
    q: 'Cum controlati bugetul si termenul?',
    a: 'Lucram pe baza unui deviz detaliat, a unui calendar pe etape si a unor aprobari clare pentru orice modificare. Comunicarea periodica ofera control asupra progresului si costurilor.',
  },
  {
    q: 'Ce inseamna o constructie Green Tech?',
    a: 'Inseamna orientare corecta, izolatie performanta, instalatii eficiente, materiale alese responsabil si solutii pregatite pentru energie regenerabila. Rezultatul este confort sporit si consum redus.',
  },
];

export default function FaqSection() {
  return (
    <section className="faq">
      <div className="faq__container">
        <div className="faq__left">
          <h2 className="faq__title">Raspunsuri clare inainte sa incepem constructia.</h2>
        </div>
        <div className="faq_split_bar"></div>
        <div className="faq__right">
          {faqs.map((item, i) => {
            const open = i === 0;
            return (
              <div className={open ? 'faq-item faq-item--open' : 'faq-item '} key={item.q}>
                <button className="faq-item__header" type="button" aria-expanded={open ? 'true' : 'false'}>
                  <span className="faq-item__question">{item.q}</span>
                  <span className="faq-item__icon">
                    <img src="/icons/chevron-down.svg" alt="" loading="lazy" decoding="async" />
                  </span>
                </button>
                <div className="faq-item__content">
                  <p className="faq-item__answer">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
