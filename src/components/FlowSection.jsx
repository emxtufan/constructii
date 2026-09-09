const steps = [
  {
    n: '01',
    title: 'Prima discuție',
    body: (
      <>Începem cu ce vrei să construiești.<br />Discutăm despre teren, suprafață, buget și stadiul proiectului. Clarificăm lucrările de care ai nevoie și informațiile necesare pentru o estimare.</>
    ),
  },
  {
    n: '02',
    title: 'Proiectare și planificare',
    body: 'Punem în ordine documentația, soluțiile tehnice și succesiunea lucrărilor. Stabilim împreună scopul colaborării, responsabilitățile și etapele înainte de începerea execuției.',
  },
  {
    n: '03',
    title: 'Execuție și coordonare',
    body: 'Coordonăm echipele, materialele și lucrările din șantier. Urmărim execuția față de proiect și discutăm progresul, deciziile necesare și eventualele schimbări de cost sau calendar.',
  },
  {
    n: '04',
    title: 'Verificare și predare',
    body: 'Parcurgem lucrările executate și documentele aferente împreună cu clientul. Clarificăm observațiile, pașii de recepție și condițiile de utilizare și întreținere aplicabile proiectului.',
  },
];

export default function FlowSection() {
  return (
    <section className="flow" id="proces">
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
