import ScrollStack, { ScrollStackItem } from './effects/ScrollStack';

const stackItems = [
  {
    title: 'Planificare precisa',
    text: 'Stabilim etapele, bugetul si responsabilitatile inainte ca proiectul sa intre in executie.',
  },
  {
    title: 'Executie coordonata',
    text: 'Echipele, materialele si furnizorii sunt sincronizati pentru un santier predictibil si controlat.',
  },
  {
    title: 'Predare verificata',
    text: 'La final, livram documentatia, verificarile si suportul necesar pentru utilizare fara surprize.',
  },
];

export default function ScrollStackSection() {
  return (
    <section className="scroll-stack-section">
      <div className="scroll-stack-section__header">
        <h2 className="scroll-stack-section__title">Proces clar, etapa cu etapa.</h2>
        <p className="scroll-stack-section__text">
          Cardurile se aseaza in stack pe masura ce parcurgi sectiunea, pastrand fiecare etapa usor de urmarit.
        </p>
      </div>
      <div className="scroll-stack-section__stage">
        <ScrollStack itemDistance={80} itemStackDistance={24} baseScale={0.88} blurAmount={0.6}>
          {stackItems.map((item, index) => (
            <ScrollStackItem key={item.title} itemClassName={`scroll-stack-card--${index + 1}`}>
              <span className="scroll-stack-section__eyebrow">{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}
