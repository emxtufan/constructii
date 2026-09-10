import { useRef, useState } from 'react';
import { currentPhase, phaseStatus, projectProgress, displayDate } from '../data/project';
import { useBuildReveal, usePhotoParallax } from './effects/useBuildReveal';
import './ProjectStory.css';

export function ProjectPhoto({ image, label, className = '', parallax = false }) {
  const frameRef = useRef(null);
  usePhotoParallax(frameRef, parallax ? image?.src : null);
  return (
    <figure className={`build-photo ${image?.src ? '' : 'build-photo--pending'} ${className}`} ref={frameRef}>
      {image?.src ? (
        <>
          <img src={image.src} alt={image.alt || label} width={image.width || 1600} height={image.height || 1000} loading="lazy" decoding="async" />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </>
      ) : (
        <div className="build-photo__pending">
          <span className="build-photo__frame" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="build-label">Documentarea proiectului</span>
          <strong>{label}</strong>
          <p>Fotografie reală — de adăugat</p>
        </div>
      )}
    </figure>
  );
}

export function GroundToHome({ project }) {
  const ref = useBuildReveal();
  const current = currentPhase(project);
  const phases = project.phases ?? [];
  const [selectedId, setSelectedId] = useState(current?.id ?? phases[0]?.id);
  const selected = phases.find(phase => phase.id === selectedId) ?? phases[0];
  const phaseRefs = useRef([]);

  if (!selected) return <section id="ground-to-home" className="build-section build-story" ref={ref}><div className="build-container"><p className="build-label">From ground to home</p><h2>Etapele proiectului</h2><p className="build-editorial-note">Parcursul proiectului este în curs de documentare.</p></div></section>;

  const selectWithKeyboard = (event, index) => {
    let target;
    if (event.key === 'ArrowRight') target = (index + 1) % project.phases.length;
    if (event.key === 'ArrowLeft') target = (index - 1 + project.phases.length) % project.phases.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = project.phases.length - 1;
    if (target === undefined) return;
    event.preventDefault();
    setSelectedId(project.phases[target].id);
    phaseRefs.current[target]?.focus();
  };

  return (
    <section id="ground-to-home" className="build-section build-story" ref={ref} aria-labelledby="build-story-title" style={{ backroundColor: 'white' }}>
      <div className="build-container">
        <div className="build-section-heading" data-build-reveal>
          <div><h2 id="build-story-title">Din teren.<br /><span>În locul numit acasă.</span></h2></div>
          <p>Un singur proiect, urmărit etapă cu etapă. De la primul contur pe teren până la forma pe care o construim împreună.</p>
        </div>
        {/* {!project.name && <p className="build-editorial-note">Imagini de prezentare ale etapelor. Identitatea și stadiul actual al proiectului urmează să fie confirmate.</p>} */}
        <div className="build-phase-nav" role="group" aria-label="Explorează etapele proiectului">
          {project.phases.map((phase, index) => (
            <button
              key={phase.id} type="button" className={`build-phase ${phase.id === selected.id ? 'is-selected' : ''} ${phase.id === current?.id ? 'is-current' : ''}`}
              aria-pressed={phase.id === selected.id} aria-current={phase.id === current?.id ? 'step' : undefined} aria-controls="build-stage-view"
              ref={element => { phaseRefs.current[index] = element; }}
              onClick={() => setSelectedId(phase.id)} onKeyDown={event => selectWithKeyboard(event, index)}
            >
              <span className="build-phase__index">{String(index + 1).padStart(2, '0')}<i aria-hidden="true">{phase.status === 'completed' ? '✓' : ''}</i></span>
              <strong>{phase.title}</strong>
            </button>
          ))}
        </div>
        <div id="build-stage-view" className="build-stage-view">
          <div className="build-stage-view__photo" key={selected.id}>
            <ProjectPhoto image={selected.image} label={selected.title} parallax />
          </div>
          {/* <div className="build-stage-caption" aria-live="polite" aria-atomic="true">
            <div><span className="build-label">{selected.label}</span><h3>{selected.title}</h3></div>
            <p>{selected.note || 'Povestea acestei etape va fi completată cu imagini și informații din șantier.'}</p>
            {selected.id === current?.id && <span className={`build-status build-status--${current.status}`}>Etapa actuală · {phaseStatus(current)}</span>}
          </div> */}
        </div>
      </div>
    </section>
  );
}

export function CurrentProgress({ project }) {
  const ref = useBuildReveal();
  const current = currentPhase(project);
  const progress = projectProgress(project);
  const updated = displayDate(project.updatedAt);
  return (
    <section id="current-progress" className="build-section build-current" ref={ref} aria-labelledby="build-current-title">
      <div className="build-container build-current__grid">
        <div className="build-current__copy" data-build-reveal>
          <p className="build-label">Current progress</p>
          <h2 id="build-current-title">Aici suntem.<br /><span>De aici continuăm.</span></h2>
          <div className="build-current__stage"><span>Stadiul actual</span><strong>{current?.title ?? 'În curs de documentare'}</strong>{current && <span className={`build-status build-status--${current.status}`}>{phaseStatus(current)}</span>}</div>
          {progress !== null ? (
            <div className="build-progress"><div><span>Progres confirmat</span><strong>{progress}%</strong></div><progress max="100" value={progress} aria-label="Progresul confirmat al proiectului">{progress}%</progress></div>
          ) : (
            <div className="build-progress build-progress--pending"><div><span>Progresul execuției</span><span>De confirmat</span></div><div className="build-progress__unconfirmed" aria-hidden="true" /><p>Indicatorul va reflecta stadiul confirmat al lucrărilor.</p></div>
          )}
          {updated && <p className="build-current__updated">Actualizat la <time dateTime={project.updatedAt}>{updated}</time></p>}
          <a className="build-text-link" href="#project-journal">Urmărește jurnalul proiectului <span aria-hidden="true">↗</span></a>
        </div>
        <ProjectPhoto image={project.current ?? current?.image} label="Stadiul actual al șantierului" className="build-current__photo" parallax />
      </div>
    </section>
  );
}

export function BeforeCurrent({ project }) {
  const ref = useBuildReveal();
  const [position, setPosition] = useState(50);
  const ready = Boolean(project.before?.src && project.current?.src);
  return (
    <section id="before-current" className="build-section build-comparison" ref={ref} aria-labelledby="build-comparison-title">
      <div className="build-container">
        <div className="build-section-heading" data-build-reveal><div><h2 id="build-comparison-title">Același loc.<br /><span>O altă perspectivă.</span></h2></div><p>{ready ? 'Compară terenul liber și construcția în lucru, din același unghi. Trage reperul pentru a vedea transformarea.' : 'Începutul și stadiul actual, privite împreună. Două momente din evoluția aceleiași construcții, documentate prin fotografii reale.'}</p></div>
        {ready ? (
          <div className="build-compare" style={{ '--compare-position': `${position}%`, '--compare-aspect': `${project.before.width || 1600} / ${project.before.height || 1000}` }}>
            <img className="build-compare__image" src={project.current.src} alt={project.current.alt || 'Stadiul actual al proiectului'} width={project.current.width || 1600} height={project.current.height || 1000} loading="lazy" decoding="async" draggable="false" />
            <div className="build-compare__before"><img className="build-compare__image" src={project.before.src} alt={project.before.alt || 'Stadiul inițial al proiectului'} width={project.before.width || 1600} height={project.before.height || 1000} loading="lazy" decoding="async" draggable="false" /></div>
            <span className="build-compare__label build-compare__label--before">Before</span><span className="build-compare__label build-compare__label--current">After</span>
            <span className="build-compare__divider" aria-hidden="true"><span><img src="/img/before-after.svg" alt="" width="28" height="28" draggable="false" /></span></span>
            <input type="range" min="0" max="100" value={position} onChange={event => setPosition(Number(event.target.value))} aria-label="Compară stadiul inițial cu stadiul actual" aria-valuetext={`${position}% din imaginea inițială vizibilă`} />
          </div>
        ) : (
          <div className="build-compare-pending"><div><span className="build-label">Before</span><strong>Terenul, la început.</strong></div><div><span className="build-label">Current progress</span><strong>Construcția, astăzi.</strong></div><p>Comparația va fi disponibilă când sunt adăugate cele două fotografii reale.</p></div>
        )}
        {ready && <div className="build-compare__caption"><span>{project.before.caption}</span><span>{project.current.caption}</span></div>}
      </div>
    </section>
  );
}
