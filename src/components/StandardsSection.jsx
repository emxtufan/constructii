import './ProjectIntro.css';

export default function StandardsSection({ project }) {
  return (
    <section className="standards" id="proiecte">
      <div className="standards__container">
        <div className="standards__image">
          <picture>
            <img src={project?.cover?.src || '/img/standards-project.webp'} alt={project?.cover?.alt || 'Ilustrație conceptuală de arhitectură și execuție'} loading="lazy" decoding="async" sizes="(max-width: 820px) 100vw, 800px" width="800" height="400" />
          </picture>
          <p className="project-intro__caption">{project?.cover?.caption || (project?.cover?.src ? 'Proiectul Green Tech' : 'Ilustrație conceptuală · nu reprezintă stadiul real al șantierului')}</p>
        </div>
        <div className="standards__content">
          <p className="project-intro__label">Project in focus{project?.location ? ` / ${project.location}` : ''}</p>
          <h2 className="standards__title">
            {project?.name || <><span>Proiecte gândite </span><span>pentru viață, </span><span>construite pentru viitor.</span></>}
          </h2>
          <p className="standards__description">{project?.description || 'De la plan la execuție, fiecare decizie contribuie la felul în care va fi trăită o construcție. Descoperă procesul, detaliile și evoluția proiectului într-un singur loc.'}</p>
          <div className="flx">
            <a href="#ground-to-home" className="pill-btn pill-btn--dark">
              <span className="pill-btn-span">Explorează etapele</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
