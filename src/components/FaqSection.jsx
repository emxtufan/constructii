import './FaqSection.css';

const faqs = [
  {
    question: 'Ce informații sunt utile pentru o primă discuție?',
    answer: 'Tipul lucrării, locația, suprafața aproximativă și stadiul în care se află proiectul sunt un bun punct de plecare. Adaugă serviciile de care ai nevoie și un buget orientativ, dacă l-ai stabilit. Planurile și fotografiile disponibile pot completa discuția.',
  },
  {
    question: 'Pot cere o ofertă dacă nu am încă proiectul complet?',
    answer: 'Poți începe prin a descrie ideea și informațiile pe care le ai. O cerere inițială ajută la clarificarea lucrării; o estimare relevantă depinde de definirea soluției, a cantităților și a condițiilor de execuție.',
  },
  {
    question: 'Cum se stabilește bugetul unei lucrări?',
    answer: 'Bugetul se construiește din lucrările necesare, cantități, materiale, manoperă și particularitățile amplasamentului. Compararea ofertelor are sens atunci când este clar ce include fiecare. Modificările de proiect trebuie discutate împreună cu efectul lor asupra costurilor.',
  },
  {
    question: 'Cât durează un proiect?',
    answer: 'Durata depinde de amploarea lucrării, documentație, autorizări, accesul la amplasament, aprovizionare și succesiunea etapelor. Calendarul se poate discuta după clarificarea acestor condiții; o durată generică nu descrie corect fiecare proiect.',
  },
  {
    question: 'Cum sunt alese materialele și soluțiile tehnice?',
    answer: 'Alegerile trebuie corelate cu proiectul, utilizarea clădirii, condițiile de pe teren și bugetul. Specificațiile și alternativele se discută pe baza documentației tehnice. Imaginile de prezentare nu țin loc de specificații pentru lucrarea ta.',
  },
  {
    question: 'Pot solicita doar anumite etape ale lucrării?',
    answer: 'Indică în cerere ce ai deja realizat și unde ai nevoie de sprijin: consultanță, proiectare, construcție, renovare sau management de proiect. Delimitarea etapelor și a responsabilităților este necesară înainte de stabilirea unei colaborări.',
  },
  {
    question: 'Cum trimit cererea și planurile?',
    answer: 'Completează formularul de mai jos și apasă „Trimite cererea”. Mesajul ajunge prin website la echipa noastră, fără să deschizi aplicația de email. Planurile și fotografiile se trimit separat la contact@greentechrealestate.ro.',
  },
];

export default function FaqSection() {
  return (
    <section className="build-faq" id="intrebari" aria-labelledby="build-faq-title">
      <div className="build-faq__container">
        <div className="build-faq__intro">
          <h2 id="build-faq-title">Good questions.<br /><span>Clear beginnings.</span></h2>
          <p className="build-faq__description">Câteva repere pentru o discuție bine pregătită, de la prima idee până la definirea lucrării.</p>
        </div>
        <div className="build-faq__items">
          {faqs.map((item, index) => (
            <details className="build-faq__item" key={item.question}>
              <summary>
                <span className="build-faq__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="build-faq__question">{item.question}</span>
                <span className="build-faq__icon" aria-hidden="true"><span /><span /></span>
              </summary>
              <div className="build-faq__answer"><p>{item.answer}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
