export default function StandardsSection() {
  return (
    <section className="standards" id="proiecte">
      <div className="standards__container">
        <div className="standards__image">
          <picture>
            <source srcSet="/_astro/apply-door.CA6YLUcA_HnYyn.avif 360w, /_astro/apply-door.CA6YLUcA_ZmDXJs.avif 720w, /_astro/apply-door.CA6YLUcA_Z1Wri67.avif 800w" type="image/avif" sizes="(max-width: 820px) 100vw, 800px" />
            <source srcSet="/_astro/apply-door.CA6YLUcA_GOkXG.webp 360w, /_astro/apply-door.CA6YLUcA_ZndCk9.webp 720w, /_astro/apply-door.CA6YLUcA_Z1X0VFN.webp 800w" type="image/webp" sizes="(max-width: 820px) 100vw, 800px" />
            <img src="/_astro/apply-door.CA6YLUcA_Z12L5fE.png" srcSet="/_astro/apply-door.CA6YLUcA_1C4coP.png 360w, /_astro/apply-door.CA6YLUcA_x1e60.png 720w, /_astro/apply-door.CA6YLUcA_Z12L5fE.png 800w" alt="Echipa Green Tech Real Estate pe santier" loading="lazy" decoding="async" sizes="(max-width: 820px) 100vw, 800px" width="800" height="400" />
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
