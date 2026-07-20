const steps = [
  {
    n: '01',
    title: 'Consultanta si concept',
    body: (
      <>Incepem cu obiectivele, terenul si bugetul tau.<br />Analizam potentialul proiectului si construim un plan clar, realist si adaptat stilului tau de viata sau strategiei de investitie.</>
    ),
  },
  {
    n: '02',
    title: 'Proiectare inteligenta',
    body: 'Arhitectura, structura si instalatiile sunt coordonate intr-un singur proces. Optimizam lumina naturala, consumul de energie, materialele si fiecare metru patrat.',
  },
  {
    n: '03',
    title: 'Constructie controlata',
    body: 'Coordonam echipele, furnizorii, materialele si etapele de santier. Urmarim calitatea, costurile si calendarul prin verificari constante si raportare transparenta.',
  },
  {
    n: '04',
    title: 'Predare si suport',
    body: 'Predam proiectul complet, verificat si documentat. Oferim instructiuni de utilizare, garantie si suport dupa finalizare, pentru o investitie valoroasa in timp.',
  },
];

export default function FlowSection() {
  return (
    <section className="flow">
      <div className="flow__wrapper">
        <div className="flow__steps">
          {steps.map((s, i) => (
            <div className="flow__step" data-step={i + 1} key={s.n}>
              <div className="flow__header">
                <div className="flow__number">
                  <span>{s.n}</span>
                </div>
                <h3 className="flow__title">{s.title}</h3>
              </div>
              <div className="flow__body">
                <div className="flow__body-inner">
                  <div className="flow__track">
                    <div className="flow__track-bar">
                      <div className="flow__track-fill"></div>
                    </div>
                  </div>
                  <p className="flow__description">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
