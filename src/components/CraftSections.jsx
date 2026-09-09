import { useEffect, useId, useRef, useState } from 'react';
import './CraftSections.css';

function useCraftEntrance() {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.craftVisible = 'true';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    sectionRef.current?.querySelectorAll('[data-craft-entrance]').forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return sectionRef;
}

function CraftArrow({ direction = 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className={direction === 'left' ? 'gt-craft__arrow--left' : undefined}>
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MissingDetail() {
  return (
    <div className="gt-craft__missing-detail">
      <span className="gt-craft__frame-label">Material record</span>
      <span className="gt-craft__frame-cross" aria-hidden="true" />
      <div>
        <p>Fotografii de detaliu<br />— de adăugat</p>
        <span>Materialele și execuția, documentate în șantier.</span>
      </div>
    </div>
  );
}

function SiteImage({ image, className = '', loading = 'lazy' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [image?.src]);

  if (failed) return <div className={`gt-craft__image-error ${className}`} role="img" aria-label={image.alt || 'Fotografie de șantier'}>Fotografia nu a putut fi încărcată.</div>;

  return <img className={className} src={image.src} alt={image.alt || ''} width={image.width || undefined} height={image.height || undefined} loading={loading} decoding="async" onError={() => setFailed(true)} />;
}

export function MaterialsCraft({ project }) {
  const sectionRef = useCraftEntrance();
  const materials = Array.isArray(project?.materials) ? project.materials : [];
  const featured = materials.find(material => material.image?.src);

  return (
    <section className="gt-craft gt-craft--materials" id="materials-craft" aria-labelledby="materials-craft-title" ref={sectionRef}>
      <div className="gt-craft__container">
        <div className="gt-craft__materials-spread">
          <div className="gt-craft__materials-copy" data-craft-entrance>
            <p className="gt-craft__eyebrow"><span />Built in the details</p>
            <h2 className="gt-craft__title" id="materials-craft-title">Materials<br /><span>&amp; craft.</span></h2>
            <p className="gt-craft__lead">Calitatea începe cu ceea ce alegem. Se vede în felul în care lucrăm.</p>
            <p className="gt-craft__body">Materialele se aleg în raport cu proiectul, utilizarea clădirii și cerințele lucrării. Atenția continuă la punerea în operă, la îmbinări și la detaliile care rămân ascunse după finisare.</p>
            <a className="gt-craft__text-link" href="#engineering-precision">De la alegere la execuție <CraftArrow /></a>
          </div>

          <div className="gt-craft__materials-media" data-craft-entrance>
            {featured ? (
              <figure className="gt-craft__material-figure">
                <SiteImage image={featured.image} />
                <figcaption><span>{featured.title}</span>{featured.image.caption && <p>{featured.image.caption}</p>}</figcaption>
              </figure>
            ) : <MissingDetail />}
          </div>
        </div>

        {materials.length ? (
          <div className="gt-craft__material-records">
            {materials.map((material, index) => (
              <article className="gt-craft__material-record" key={material.id || material.title || index} data-craft-entrance>
                <span className="gt-craft__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{material.title}</h3>{material.description && <p>{material.description}</p>}</div>
                {material !== featured && material.image?.src && <figure><SiteImage image={material.image} />{material.image.caption && <figcaption>{material.image.caption}</figcaption>}</figure>}
              </article>
            ))}
          </div>
        ) : (
          <div className="gt-craft__material-notes" data-craft-entrance>
            <p><span>01 / Alegere</span>Potrivite cerințelor proiectului.</p>
            <p><span>02 / Punere în operă</span>Atenție la fiecare îmbinare.</p>
            <p><span>03 / Detaliu</span>Grijă pentru ceea ce rămâne.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function BehindBuild({ project }) {
  const sectionRef = useCraftEntrance();
  const images = (Array.isArray(project?.gallery) ? project.gallery : []).filter(item => item?.src);
  const [activeIndex, setActiveIndex] = useState(null);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const captionId = useId();
  const titleId = useId();
  const isOpen = activeIndex !== null;
  const currentImage = images[activeIndex] || images[0];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) dialog.showModal();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  useEffect(() => {
    if (!images.length && dialogRef.current?.open) dialogRef.current.close();
    if (activeIndex !== null && images.length && activeIndex >= images.length) setActiveIndex(0);
  }, [images.length, activeIndex]);

  const move = direction => setActiveIndex(index => (index + direction + images.length) % images.length);
  const close = () => dialogRef.current?.close();
  const restoreFocus = () => {
    setActiveIndex(null);
    openerRef.current?.focus({ preventScroll: true });
  };

  return (
    <section className="gt-craft gt-craft--gallery" id="behind-build" aria-labelledby="behind-build-title" ref={sectionRef}>
      <div className="gt-craft__container">
        <div className="gt-craft__gallery-heading" data-craft-entrance>
          <div>
            <p className="gt-craft__eyebrow"><span>Site observations</span></p>
            <h2 className="gt-craft__title" id="behind-build-title">Behind<br /><span>the build.</span></h2>
          </div>
          <p className="gt-craft__body">Dincolo de planșe, construcția înseamnă oameni, materiale și decizii de zi cu zi. Aici își găsesc locul imaginile din timpul execuției.</p>
        </div>

        {images.length ? (
          <div className="gt-craft__gallery-grid">
            {images.map((image, index) => (
              <figure key={image.id || image.src} className="gt-craft__gallery-item" data-craft-entrance>
                <button type="button" className="gt-craft__gallery-open" aria-label={`Mărește fotografia: ${image.alt || image.caption || `fotografia ${index + 1}`}`} aria-haspopup="dialog" onClick={event => { openerRef.current = event.currentTarget; setActiveIndex(index); }}>
                  <SiteImage image={image} />
                  <span className="gt-craft__image-expand" aria-hidden="true">↗</span>
                </button>
                <figcaption><span className="gt-craft__number">{String(index + 1).padStart(2, '0')}</span><div>{image.category && <span className="gt-craft__category">{image.category}</span>}{image.caption && <p>{image.caption}</p>}</div></figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="gt-craft__gallery-empty" data-craft-entrance>
            <div className="gt-craft__empty-mark" aria-hidden="true"><span /><span /><span /></div>
            <div><h3>Jurnalul vizual se construiește aici.</h3><p>Galeria va reuni fotografii autentice ale proiectului: echipă, etape de lucru și detalii din șantier.</p></div>
            <span className="gt-craft__pending-label">Fotografii — de adăugat</span>
          </div>
        )}
      </div>

      <dialog className="gt-craft__lightbox" ref={dialogRef} aria-labelledby={titleId} aria-describedby={captionId} onClose={restoreFocus} data-lenis-prevent onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => {
        if (images.length < 2) return;
        if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      }}>
        <div className="gt-craft__lightbox-content">
          <div className="gt-craft__lightbox-top"><p id={titleId}>Behind the build <span>/ Fotografii din șantier</span></p><button type="button" className="gt-craft__lightbox-close" onClick={close} aria-label="Închide fotografia" autoFocus><span aria-hidden="true">×</span></button></div>
          {isOpen && currentImage && <figure><SiteImage image={currentImage} loading="eager" /><figcaption id={captionId} aria-live="polite"><span>{currentImage.caption || currentImage.alt || 'Fotografie din șantier'}</span><span>{activeIndex + 1} / {images.length}</span></figcaption></figure>}
          {images.length > 1 && <div className="gt-craft__lightbox-nav"><button type="button" onClick={() => move(-1)}><CraftArrow direction="left" />Anterioară</button><span>← / →</span><button type="button" onClick={() => move(1)}>Următoare<CraftArrow /></button></div>}
        </div>
      </dialog>
    </section>
  );
}

function BlueprintDrawing() {
  const figureRef = useRef(null);
  const [playback, setPlayback] = useState('static');

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || !('IntersectionObserver' in window)) return undefined;

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
        // Keep the finished drawing visible until the figure fully leaves view.
      }, { threshold: [0, 0.2] });
      observer.observe(figure);
    };

    observe();
    reducedMotion.addEventListener('change', observe);
    return () => {
      observer?.disconnect();
      reducedMotion.removeEventListener('change', observe);
    };
  }, []);

  const draw = {
    pathLength: 1,
    className: "gt-blueprint-draw",
  };

  return (
    <figure
      ref={figureRef}
      className="gt-craft__blueprint gt-craft__blueprint--animated"
      data-blueprint-state={playback}
      data-craft-entrance
    >
      <div className="gt-craft__blueprint-label">
        <span>Structure study</span>
      </div>

      <svg
        viewBox="0 0 600 440"
        fill="none"
        role="img"
        aria-label="Schemă conceptuală a unei structuri, cu niveluri, stâlpi și axe de trasare, fără cote tehnice"
        focusable="false"
      >
        <g className="gt-craft__blueprint-guides" strokeWidth="0.8">
          <path
            d="M52 290 309 143 555 285M52 320 309 173 555 315M83 358 335 213M137 390 394 244M54 219l436 251M98 158l438 250M305 34v365M169 85v280M436 100v279"
            strokeDasharray="4 7"
          />
          <path d="m52 331 257-147 246 142-257 148Z" />
        </g>

        <g className="gt-craft__blueprint-floor" strokeWidth="1.2">
          <path
            {...draw}
            d="m96 305 207-118 199 115-207 120Z"
          />
          <path
            {...draw}
            d="m96 305 199 115v10L96 315Zm199 115 207-118v10L295 430Z"
          />
        </g>

        <g className="gt-craft__blueprint-columns" strokeWidth="1.6">
          <path
            {...draw}
            d="M120 302V157m88 196V208m93 201V262m102-64v153m77-197v149M307 54v143m-89-98v147"
          />
          <path
            {...draw}
            d="M126 304V156m88 200V207m93 199V263m102-69v153m77-193v146M313 54v143m-89-98v147"
          />
        </g>

        <g className="gt-craft__blueprint-deck" strokeWidth="1.3">
          <path
            {...draw}
            d="m96 143 207-118 199 115-207 120Z"
          />
          <path
            {...draw}
            d="m96 143 199 117v9L96 152Zm199 117 207-120v9L295 269Z"
          />
          <path
            {...draw}
            d="m117 143 186-106 178 103-186 107Z"
          />
          <path
            {...draw}
            d="m169 172 188-107M230 208 418 101M190 101l179 103M251 65l178 103"
            strokeWidth="0.7"
          />
        </g>

        <g className="gt-craft__blueprint-callouts" strokeWidth="0.8">
          <path
            {...draw}
            d="M484 138h51v-43h32M409 276h99v-42h59M310 410h213v-41h44"
          />

          <circle cx="484" cy="138" r="4" />
          <circle cx="409" cy="276" r="4" />
          <circle cx="310" cy="410" r="4" />

          <path
            {...draw}
            d="M558 95h18m-9-9v18m-9 130h18m-9-9v18m-9 135h18m-9-9v18"
          />
        </g>
      </svg>
    </figure>
  );
}

const engineeringNotes = [
  { title: 'Structură', description: 'Pornim de la documentația de proiectare. Soluția structurală și detaliile de execuție dau direcția lucrării.' },
  { title: 'Măsurători', description: 'Trasarea și verificarea reperelor leagă planșele de realitatea din teren, înainte ca lucrările să avanseze.' },
  { title: 'Planificare', description: 'Ordinea operațiunilor, aprovizionarea și coordonarea echipelor se privesc împreună, etapă cu etapă.' },
  { title: 'Controlul execuției', description: 'Urmărim lucrarea în punctele importante. Observațiile se discută și se clarifică înainte de pasul următor.' },
];

export function EngineeringPrecision({ project: _project }) {
  const sectionRef = useCraftEntrance();

  return (
    <section className="gt-craft gt-craft--engineering" id="engineering-precision" aria-labelledby="engineering-precision-title" ref={sectionRef}>
      <div className="gt-craft__container">
        <div className="gt-craft__engineering-heading" data-craft-entrance>
          <h2 className="gt-craft__title" id="engineering-precision-title">Engineering<br /><span>&amp; precision.</span></h2>
          <p className="gt-craft__lead">Precizia leagă intenția<br />de ceea ce construim.</p>
        </div>
        <div className="gt-craft__engineering-spread">
          <BlueprintDrawing />
          <ol className="gt-craft__engineering-notes">
            {engineeringNotes.map((note, index) => (
              <li key={note.title} data-craft-entrance><span className="gt-craft__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{note.title}</h3><p>{note.description}</p></div></li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
