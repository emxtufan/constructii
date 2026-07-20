const features = [
  {
    icon: '/icons/features/rapid-activation.svg',
    alt: 'Constructii rezidentiale',
    title: 'Constructii rezidentiale',
    desc: 'Construim case, vile si ansambluri rezidentiale cu planuri functionale, finisaje durabile si tehnologii care reduc consumul si costurile de intretinere.',
  },
  {
    icon: '/icons/features/rigorous-selection.svg',
    alt: 'Dezvoltare imobiliara',
    title: 'Dezvoltare imobiliara',
    desc: 'Identificam oportunitati, evaluam terenuri si dezvoltam proiecte atractive pentru locuire sau investitie, cu o viziune clara asupra valorii pe termen lung.',
  },
  {
    icon: '/icons/features/verified.svg',
    alt: 'Renovari si modernizari',
    title: 'Renovari si modernizari',
    desc: 'Transformam cladiri existente prin recompartimentare, consolidare, termoizolare, instalatii moderne si finisaje adaptate standardelor actuale.',
  },
  {
    icon: '/icons/features/controlled-outcomes.svg',
    alt: 'Management de proiect',
    title: 'Management de proiect',
    desc: 'Planificam bugetul, calendarul, achizitiile si executia. Clientul primeste un singur punct de contact, informatii clare si control real asupra proiectului.',
  }
];

export default function FeaturesSection() {
  return (
    <section className="features" id="servicii">
      <div className="features__sticky">
        <h2 className="features__title">
          Solutii complete pentru constructii,<br className="pc" />de la teren la proprietate finalizata.
        </h2>
        <div className="features__grid">
          {features.map((f) => (
            <article className="feature-item" key={f.title}>
              <div className="feature-item__content">
                <div className="feature-item__icon">
                  <img src={f.icon} alt={f.alt} loading="lazy" decoding="async" width="96" height="96" />
                </div>
                <div className="feature-item__text">
                  <h3 className="feature-item__title">{f.title}</h3>
                  <p className="feature-item__description">{f.desc}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
