import { displayDate, phaseStatus } from '../data/project';
import { useBuildReveal } from './effects/useBuildReveal';
import './ProjectStory.css';

export function WhatComesNext({ project }) {
  const ref = useBuildReveal();
  const nextPhases = (project.phases ?? []).filter(phase => phase.status === 'coming-soon');
  return (
    <section className="build-section build-next" id="what-comes-next" ref={ref} aria-labelledby="build-next-title">
      <div className="build-container">
        <div className="build-section-heading" data-build-reveal><div><p className="build-label">What comes next</p><h2 id="build-next-title">Următorul pas.<br /><span>La fel de important.</span></h2></div><p>Fiecare etapă pregătește ceea ce urmează. Planul continuă cu lucrări coordonate și decizii explicate clar.</p></div>
        {nextPhases.length ? <ol className="build-next__list">{nextPhases.map((phase, index) => <li key={phase.id} data-build-reveal><span>{String(index + 1).padStart(2, '0')}</span><div><p className="build-label">{phase.id === 'completion' ? 'Final phase' : 'Next phase'}</p><h3>{phase.label}</h3>{phase.note && <p>{phase.note}</p>}</div><span className="build-status build-status--coming-soon">{phaseStatus(phase)}</span><i aria-hidden="true">↗</i></li>)}</ol> : <div className="build-next__pending"><span className="build-next__symbol" aria-hidden="true">↗</span><div><h3>Etapele următoare se stabilesc pe baza stadiului actual.</h3><p>Calendarul proiectului va fi publicat după confirmarea succesiunii lucrărilor.</p></div><span className="build-label">În pregătire</span></div>}
      </div>
    </section>
  );
}

export function ProjectJournal({ project }) {
  const ref = useBuildReveal();
  const entries = (project.journal ?? []).filter(entry => entry && displayDate(entry.date)).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section className="build-section build-journal" id="project-journal" ref={ref} aria-labelledby="build-journal-title">
      <div className="build-container">
        <div className="build-section-heading" data-build-reveal><div><p className="build-label">Project journal</p><h2 id="build-journal-title">Din șantier.<br /><span>La zi.</span></h2></div><p>Fotografii, etape și decizii. Un jurnal al lucrărilor, actualizat pe măsură ce proiectul prinde formă.</p></div>
        {entries.length ? <div className="build-journal__entries">{entries.map(entry => <article key={entry.id} className="build-journal__entry" data-build-reveal><div className="build-journal__date"><time dateTime={entry.date}>{displayDate(entry.date)}</time>{entry.week && <span>Week {String(entry.week).padStart(2, '0')}</span>}</div>{entry.image?.src && <img src={entry.image.src} alt={entry.image.alt || entry.title} width={entry.image.width || 1200} height={entry.image.height || 800} loading="lazy" />}<div><p className="build-label">{entry.phase}</p><h3>{entry.title}</h3><p>{entry.summary}</p>{entry.details && <details><summary>Citește actualizarea <span aria-hidden="true">+</span></summary><p>{entry.details}</p></details>}</div></article>)}</div> : <div className="build-journal__empty"><div className="build-journal__lines" aria-hidden="true"><span /><span /><span /></div><div><p className="build-label">Prima însemnare</p><h3>Fiecare construcție<br />are o poveste de spus.</h3><p>Prima actualizare va reuni data, etapa și fotografiile reale ale lucrărilor. Nu există încă însemnări publicate.</p></div></div>}
      </div>
    </section>
  );
}
