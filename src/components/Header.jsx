import { useEffect, useRef, useState } from 'react';
import './Header.css';

const links = [
  { href: '#proiecte', label: 'Proiectul' },
  { href: '#proces', label: 'Cum lucrăm' },
  { href: '#project-journal', label: 'Jurnal' },
  { href: '#intrebari', label: 'Întrebări' },
];
const desktopQuery = '(min-width: 901px)';

function scrollToSection(hash, immediate = false) {
  const target = document.getElementById(hash.slice(1));
  if (!target) return;
  const offset = document.querySelector('.gt-nav-bar')?.getBoundingClientRect().bottom ?? 72;
  const top = hash === '#acasa' ? 0 : Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset - 20);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.__greenTechLenis) {
    window.__greenTechLenis.scrollTo(top, { duration: 0.9, force: true, immediate: immediate || reducedMotion });
  } else {
    window.scrollTo({ top, behavior: immediate || reducedMotion ? 'instant' : 'smooth' });
  }
  const focusTarget = target.querySelector('h1, h2, h3') ?? target;
  if (!focusTarget.hasAttribute('tabindex')) {
    focusTarget.setAttribute('tabindex', '-1');
    focusTarget.addEventListener('blur', () => focusTarget.removeAttribute('tabindex'), { once: true });
  }
  focusTarget.focus({ preventScroll: true });
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const navigationFrame = useRef(null);

  useEffect(() => {
    let frame;
    let observer;
    const restoreHash = () => {
      setIsOpen(false);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => scrollToSection(window.location.hash || '#acasa', true));
    };
    // The scene resets scroll during its entrance. Restore direct section links
    // only after the loader has finished and section positions are established.
    if (window.location.hash) {
      const loader = document.getElementById('loader');
      if (loader && getComputedStyle(loader).display !== 'none') {
        observer = new MutationObserver(() => {
          if (!loader.isConnected || getComputedStyle(loader).display === 'none') {
            observer.disconnect();
            restoreHash();
          }
        });
        observer.observe(loader, { attributes: true, attributeFilter: ['style'] });
        observer.observe(loader.parentNode, { childList: true });
      } else restoreHash();
    }
    window.addEventListener('popstate', restoreHash);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('popstate', restoreHash);
    };
  }, []);

  useEffect(() => {
    let frame;
    const update = () => {
      setIsScrolled(window.scrollY > 24);
      const section = [...links, { href: '#contact' }]
        .map(link => ({ href: link.href, top: document.querySelector(link.href)?.getBoundingClientRect().top ?? Infinity }))
        .filter(item => item.top <= 160)
        .sort((a, b) => b.top - a.top)[0];
      setActiveSection(section?.href ?? '');
      frame = null;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const media = window.matchMedia(desktopQuery);
    const onResize = () => { if (media.matches) setIsOpen(false); onScroll(); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(navigationFrame.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const header = headerRef.current;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const scroller = window.__greenTechLenis;
    const wasStopped = scroller?.isStopped;
    scroller?.stop();
    const background = [...document.querySelectorAll('main, footer')].map(element => ({ element, inert: element.inert }));
    background.forEach(({ element }) => { element.inert = true; });
    body.style.overflow = 'hidden';
    panelRef.current?.querySelector('a')?.focus({ preventScroll: true });

    // The legacy scene owns a second scroller. Stop events before either scroller
    // handles them, while preserving native scrolling inside the menu panel.
    const containScroll = event => {
      event.stopPropagation();
      if (!panelRef.current?.contains(event.target)) event.preventDefault();
    };
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
      if (event.key !== 'Tab') return;
      const focusable = [...header.querySelectorAll('a[href], button')].filter(element => element.getClientRects().length);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || !header.contains(document.activeElement))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !header.contains(document.activeElement))) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('wheel', containScroll, { capture: true, passive: false });
    document.addEventListener('touchmove', containScroll, { capture: true, passive: false });
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('wheel', containScroll, true);
      document.removeEventListener('touchmove', containScroll, true);
      if (body.style.overflow === 'hidden') body.style.overflow = previousOverflow;
      if (!wasStopped) scroller?.start();
      background.forEach(({ element, inert }) => { element.inert = inert; });
      if (!window.matchMedia(desktopQuery).matches) toggleRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const navigate = event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = event.currentTarget.getAttribute('href');
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(false);
    cancelAnimationFrame(navigationFrame.current);
    navigationFrame.current = requestAnimationFrame(() => {
      scrollToSection(hash);
      if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    });
  };

  return (
    <>
      {isOpen && <div className="gt-nav-backdrop" aria-hidden="true" onClick={() => setIsOpen(false)} />}
      <header
        ref={headerRef}
        className={`gt-header${isOpen ? ' gt-header--open' : ''}${isScrolled ? ' gt-header--scrolled' : ''}`}
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? 'true' : undefined}
        aria-label={isOpen ? 'Meniu principal' : undefined}
      >
        <div className="gt-nav-bar">
          <a className="gt-nav-brand" href="#acasa" onClick={navigate} aria-label="Green Tech Real Estate — Acasă">
            <img src="/img/greentech-logo-light.svg" alt="Green Tech Real Estate" width="282" height="38" />
          </a>
          <nav className="gt-nav-desktop" aria-label="Navigare principală">
            {links.map(link => (
              <a key={link.href} href={link.href} onClick={navigate} aria-current={activeSection === link.href ? 'location' : undefined}>
                {link.label}
              </a>
            ))}
          </nav>
          <a className="gt-nav-cta gt-nav-cta--desktop" href="#contact" onClick={navigate}>
            Cere ofertă <ArrowIcon />
          </a>
          <button
            ref={toggleRef}
            className="gt-nav-toggle"
            type="button"
            aria-label={isOpen ? 'Închide meniul' : 'Deschide meniul'}
            aria-expanded={isOpen}
            aria-controls="gt-mobile-menu"
            onClick={() => setIsOpen(open => !open)}
          >
            <span className="gt-nav-toggle__label">Meniu</span>
            <span className="gt-nav-toggle__icon" aria-hidden="true"><span /><span /></span>
          </button>
        </div>
        <div ref={panelRef} id="gt-mobile-menu" className="gt-nav-panel" hidden={!isOpen} data-lenis-prevent>
          <nav aria-label="Navigare mobilă">
            {links.map((link, index) => (
              <a key={link.href} href={link.href} onClick={navigate} aria-current={activeSection === link.href ? 'location' : undefined}>
                <span className="gt-nav-index" aria-hidden="true">0{index + 1}</span>
                <span>{link.label}</span>
                <ArrowIcon />
              </a>
            ))}
          </nav>
          <div className="gt-nav-panel__footer">
            <p>Construcții & dezvoltare imobiliară</p>
            <a className="gt-nav-cta" href="#contact" onClick={navigate}>Să discutăm proiectul tău <ArrowIcon /></a>
          </div>
        </div>
      </header>
    </>
  );
}
