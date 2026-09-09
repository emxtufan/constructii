import { useEffect, useRef, useState } from 'react';
import './WhyUsSection.css';

const principles = [
  {
    title: 'Precizie',
    description: 'Fiecare proiect începe cu o structură clară de lucru. Planificarea și verificarea detaliilor ghidează fiecare etapă.',
  },
  {
    title: 'Transparență',
    description: 'Costuri și etape explicate clar. Comunicăm progresul și pașii următori, ca să poți lua decizii informate.',
  },
  {
    title: 'Calitate',
    description: 'Punem accent pe calitatea lucrării, nu doar pe finalizarea ei. Materialele și modul în care sunt puse în operă contează împreună.',
  },
  {
    title: 'Responsabilitate',
    description: 'Ne asumăm lucrările pe care le executăm. Tratăm fiecare proiect cu seriozitatea pe care o merită.',
  },
  {
    title: 'Măiestrie în execuție',
    description: 'Atenția se vede în îmbinări, aliniamente și finisaje. Acordăm fiecărui detaliu timpul și grija de care are nevoie.',
  },
];

// Five architectural layers echo the stacked forms of the Green Tech identity.
// Decorative SVG keeps the section lightweight and independent of the 3D scene.
function FoundationIllustration() {
  const drawingRef = useRef(null);
  const [playback, setPlayback] = useState('static');

  useEffect(() => {
    const drawing = drawingRef.current;
    if (!drawing || !('IntersectionObserver' in window)) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;

    const observe = () => {
      observer?.disconnect();
      if (reducedMotion.matches) {
        setPlayback('static');
        return;
      }

      setPlayback('waiting');
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio === 0) {
          setPlayback('waiting');
        } else if (entry.intersectionRatio >= 0.2) {
          setPlayback('playing');
        }
        // Hold the completed layers until the whole drawing leaves the viewport.
      }, { threshold: [0, 0.2] });
      observer.observe(drawing);
    };

    observe();
    reducedMotion.addEventListener('change', observe);
    return () => {
      observer?.disconnect();
      reducedMotion.removeEventListener('change', observe);
    };
  }, []);

  return (
    <div className="why-us__drawing" ref={drawingRef} data-foundation-state={playback} aria-hidden="true">
      <svg viewBox="0 0 400 270" fill="none" focusable="false">
        <g className="why-us__guides">
          <path d="M28 197 200 111 372 197 200 253Z" />
          <path d="M200 20v237M24 166l352 0M60 220l280-140M60 80l280 140" strokeDasharray="3 6" />
          <path d="M28 189v16m-8-8h16m328-8v16m-8-8h16M192 253h16m-8-8v16" />
        </g>
        {[4, 3, 2, 1, 0].map(layer => (
          <g
            className="why-us__slab"
            key={layer}
            style={{ '--layer-delay': `${300 + (4 - layer) * 260}ms` }}
          >
            <g transform={`translate(0 ${layer * 28})`}>
              <path className="why-us__slab-edge" pathLength={1} d="m76 83 124 56 124-56v10l-124 56L76 93Z" />
              <path className="why-us__slab-top" pathLength={1} d="m76 83 124-56 124 56-124 56Z" />
              <path className="why-us__slab-detail" pathLength={1} d="m107 83 93-42 93 42-93 42Zm93-42v84m-93-42h186" />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function WhyUsSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.revealed = 'true';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    sectionRef.current?.querySelectorAll('[data-why-reveal]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="why-us" id="de-ce-noi" aria-labelledby="why-us-title" ref={sectionRef}>
      <div className="why-us__container">
        <div className="why-us__intro">
          <div data-why-reveal className="why-us__intro-copy">
            <h2 className="why-us__title" id="why-us-title">
              Construim bine.<br />
              <span>De la prima<br className="why-us__desktop-break" /> discuție.</span>
            </h2>
            <p className="why-us__description">
              Încrederea se construiește prin lucruri concrete. Așa lucrăm, de la primul plan până la ultimul detaliu.
            </p>
          </div>
          <FoundationIllustration />
        </div>

        <ol className="why-us__principles" aria-label="Cele cinci principii de lucru">
          {principles.map((principle, index) => (
            <li className="why-us__principle" data-why-reveal key={principle.title}>
              <span className="why-us__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="why-us__principle-copy">
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </div>
              <span className="why-us__marker" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
