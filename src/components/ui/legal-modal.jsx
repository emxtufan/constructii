import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiArrowUpRight, FiX } from 'react-icons/fi';
import { legalContact } from '../../data/legal-policies';
import './legal-modal.css';

export function LegalModal({ policy, onClose }) {
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const scrollRef = useRef(null);
  const backdropPressRef = useRef(false);
  const firstControlRef = useRef(null);
  const lastControlRef = useRef(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const invoker = document.activeElement;
    const body = document.body;
    const root = document.documentElement;
    const previousOverflow = body.style.overflow;
    const previousGutter = root.style.scrollbarGutter;
    const scroller = window.__greenTechLenis;
    const wasStopped = scroller?.isStopped;
    // Preserve the page's line wrapping when a desktop/emulated scrollbar hides.
    // Reserve it before Lenis.stop(), which also hides the root scrollbar.
    if (window.innerWidth > root.clientWidth && getComputedStyle(root).scrollbarGutter === 'auto') {
      root.style.scrollbarGutter = 'stable';
    }
    scroller?.stop();
    body.style.overflow = 'hidden';
    dialog.showModal();
    headingRef.current?.focus({ preventScroll: true });

    // The legacy scene has a second scroll owner. Let the dialog scroll natively
    // while keeping both smooth scrollers from handling the same wheel/gesture.
    const containScroll = event => {
      event.stopPropagation();
      if (!scrollRef.current?.contains(event.target)) event.preventDefault();
    };
    document.addEventListener('wheel', containScroll, { capture: true, passive: false });
    document.addEventListener('touchmove', containScroll, { capture: true, passive: false });
    return () => {
      document.removeEventListener('wheel', containScroll, true);
      document.removeEventListener('touchmove', containScroll, true);
      body.style.overflow = previousOverflow;
      if (!wasStopped) scroller?.start();
      root.style.scrollbarGutter = previousGutter;
      if (dialog.open) dialog.close();
      if (invoker?.isConnected) invoker.focus({ preventScroll: true });
    };
  }, []);

  const isBackdrop = event => {
    if (event.target !== event.currentTarget) return false;
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };

  return createPortal(
    <dialog
      className="gt-legal-modal"
      id="gt-legal-dialog"
      ref={dialogRef}
      aria-labelledby="gt-legal-title"
      data-lenis-prevent
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClose={onClose}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const active = document.activeElement;
        if (event.shiftKey && (active === firstControlRef.current || active === headingRef.current)) {
          event.preventDefault();
          lastControlRef.current?.focus({ preventScroll: true });
        } else if (!event.shiftKey && active === lastControlRef.current) {
          event.preventDefault();
          firstControlRef.current?.focus({ preventScroll: true });
        }
      }}
      onPointerDown={event => { backdropPressRef.current = isBackdrop(event); }}
      onClick={event => { if (backdropPressRef.current && isBackdrop(event)) onClose(); }}
    >
      <div className="gt-legal-modal__header">
        <div>
          <p className="gt-legal-modal__eyebrow">Green Tech Real Estate · Informații legale</p>
          <h2 id="gt-legal-title" ref={headingRef} tabIndex={-1}>{policy.title}</h2>
        </div>
        <button className="gt-legal-modal__close" ref={firstControlRef} type="button" onClick={onClose} aria-label="Închide fereastra">
          <FiX aria-hidden="true" />
        </button>
      </div>

      <div className="gt-legal-modal__body" ref={scrollRef} data-lenis-prevent tabIndex={0} role="region" aria-label={`Conținut: ${policy.title}`}>
        <p className="gt-legal-modal__intro">{policy.intro}</p>
        {policy.sections.map((section, index) => (
          <section className="gt-legal-modal__section" key={section.title}>
            <h3><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{section.title}</h3>
            {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.items?.length > 0 && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
          </section>
        ))}
        <div className="gt-legal-modal__sources">
          <p>Resurse oficiale</p>
          {policy.sources.map(source => <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer">{source.label}<FiArrowUpRight aria-hidden="true" /><span className="gt-legal-modal__sr-only"> (se deschide într-o filă nouă)</span></a>)}
        </div>
      </div>

      <div className="gt-legal-modal__footer">
        <div><span>Contact pentru date personale</span><a href={`mailto:${legalContact}`}>{legalContact}</a></div>
        <button type="button" ref={lastControlRef} onClick={onClose}>Închide</button>
      </div>
    </dialog>,
    document.body,
  );
}
