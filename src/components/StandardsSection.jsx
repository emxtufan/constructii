export default function StandardsSection() {
  return (
    <section className="standards" id="proiecte">
      <div className="standards__container">
        <div className="standards__image">
          <picture>
            <img src="/img/standards-project.png" alt="Echipa Green Tech Real Estate pe santier" loading="lazy" decoding="async" sizes="(max-width: 820px) 100vw, 800px" width="800" height="400" />
          </picture>
        </div>
        <div className="standards__content">
          <h2 className="standards__title">
            <span>Proiecte gandite </span>
            <span>pentru viata, </span>
            <span>construite pentru viitor.</span>
          </h2>
          <p className="standards__description">Dezvoltam comunitati rezidentiale verzi, case eficiente energetic, cladiri mixte si reconversii urbane. Fiecare proiect combina arhitectura functionala, spatii verzi si costuri predictibile.</p>
          <div className="flx">
            <a href="#contact" className="pill-btn pill-btn--dark">
              <span className="pill-btn-span">Discuta un proiect</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
