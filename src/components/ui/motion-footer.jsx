import { forwardRef, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowUp, FiArrowUpRight, FiPause, FiPlay } from 'react-icons/fi';
import { LegalModal } from './legal-modal';
import { legalPolicies } from '../../data/legal-policies';
import './motion-footer.css';

gsap.registerPlugin(ScrollTrigger);

const curtainQuery = '(min-width: 901px) and (min-height: 860px) and (prefers-reduced-motion: no-preference)';
const mobileCurtainQuery = '(max-width: 900px) and (prefers-reduced-motion: no-preference)';
const principles = ['Precizie', 'Transparență', 'Calitate', 'Responsabilitate', 'Atenție la detalii'];
const navigation = [
  { href: '#servicii', label: 'Servicii' },
  { href: '#proces', label: 'Cum lucrăm' },
  { href: '#de-ce-noi', label: 'De ce noi' },
  { href: '#intrebari', label: 'Întrebări frecvente' },
];

function scrollToPosition(top, immediate = false) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.__greenTechLenis) {
    window.__greenTechLenis.scrollTo(top, { duration: 1, force: true, immediate: immediate || reduced });
  } else window.scrollTo({ top, behavior: immediate || reduced ? 'instant' : 'smooth' });
}

function navigate(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const hash = event.currentTarget.getAttribute('href');
  const target = document.getElementById(hash.slice(1));
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  const offset = (document.querySelector('.gt-nav-bar')?.getBoundingClientRect().bottom ?? 72) + 20;
  scrollToPosition(hash === '#acasa' ? 0 : Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset));
  const heading = target.querySelector('h1, h2, h3') ?? target;
  if (!heading.hasAttribute('tabindex')) {
    heading.setAttribute('tabindex', '-1');
    heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
  }
  heading.focus({ preventScroll: true });
  if (window.location.hash !== hash) window.history.pushState(null, '', hash);
}

const MagneticButton = forwardRef(function MagneticButton({ as: Component = 'a', className = '', children, ...props }, forwardedRef) {
  const localRef = useRef(null);
  const boundsRef = useRef(null);

  useEffect(() => {
    const element = localRef.current;
    const bounds = boundsRef.current;
    const media = gsap.matchMedia();
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const move = event => {
        if (event.pointerType === 'touch' || element.matches(':focus-visible')) return;
        // Measure an unmoving wrapper so movement never feeds back into the bounds.
        const rect = bounds.getBoundingClientRect();
        const x = Math.max(-9, Math.min(9, (event.clientX - rect.left - rect.width / 2) * .12));
        const y = Math.max(-6, Math.min(6, (event.clientY - rect.top - rect.height / 2) * .2));
        gsap.to(element, { x, y, duration: .35, ease: 'power2.out', overwrite: true });
      };
      const reset = () => gsap.to(element, { x: 0, y: 0, duration: .65, ease: 'elastic.out(1, 0.5)', overwrite: true });
      bounds.addEventListener('pointermove', move);
      bounds.addEventListener('pointerleave', reset);
      element.addEventListener('focus', reset);
      return () => {
        bounds.removeEventListener('pointermove', move);
        bounds.removeEventListener('pointerleave', reset);
        element.removeEventListener('focus', reset);
        gsap.killTweensOf(element);
        gsap.set(element, { clearProps: 'transform' });
      };
    });
    return () => media.revert();
  }, []);

  return (
    <span className="gt-footer-magnetic" ref={boundsRef}>
      <Component
        ref={node => {
          localRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={`gt-footer-pill ${className}`}
        {...props}
      >{children}</Component>
    </span>
  );
});

function MarqueeItem() {
  return <div className="gt-cinematic-footer__marquee-group">{principles.map(item => <span key={item}>{item}<i>✦</i></span>)}</div>;
}

export function CinematicFooter() {
  const wrapperRef = useRef(null);
  const surfaceRef = useRef(null);
  const giantRef = useRef(null);
  const headingRef = useRef(null);
  const linksRef = useRef(null);
  const revealRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [activePolicy, setActivePolicy] = useState(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduced(query.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    query.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 }) : null;
    observer?.observe(wrapperRef.current);
    return () => {
      observer?.disconnect();
      query.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    const media = gsap.matchMedia(wrapperRef.current);
    const layoutTriggers = new Set();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      revealRef.current = gsap.fromTo([headingRef.current, linksRef.current], { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: .85, stagger: .12, ease: 'power3.out',
        scrollTrigger: { trigger: wrapperRef.current, start: 'top 65%', once: true },
      });
      const trigger = revealRef.current.scrollTrigger;
      layoutTriggers.add(trigger);
      return () => { layoutTriggers.delete(trigger); revealRef.current = null; };
    });
    media.add(`${curtainQuery}, ${mobileCurtainQuery}`, () => {
      const animation = gsap.fromTo(giantRef.current, { y: 70, scale: .92 }, {
        y: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: wrapperRef.current, start: 'top bottom', end: 'bottom bottom', scrub: .8 },
      });
      const trigger = animation.scrollTrigger;
      layoutTriggers.add(trigger);
      return () => layoutTriggers.delete(trigger);
    });

    let refreshFrame;
    let mounted = true;
    let pendingRefresh = false;
    let lastWidth;
    let lastHeight;
    const refreshWhenIdle = () => {
      if (!mounted || !pendingRefresh || ScrollTrigger.isScrolling()) return;
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        if (!mounted || ScrollTrigger.isScrolling()) return;
        pendingRefresh = false;
        layoutTriggers.forEach(trigger => trigger.refresh());
      });
    };
    const refreshLayout = (force = false) => {
      if (!mounted) return;
      const { offsetWidth: width, offsetHeight: height } = wrapperRef.current;
      if (!force && width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      pendingRefresh = true;
      refreshWhenIdle();
    };
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => refreshLayout()) : null;
    resizeObserver?.observe(wrapperRef.current);
    ScrollTrigger.addEventListener('scrollEnd', refreshWhenIdle);
    document.fonts?.ready.then(() => refreshLayout(true));
    return () => {
      mounted = false;
      cancelAnimationFrame(refreshFrame);
      resizeObserver?.disconnect();
      ScrollTrigger.removeEventListener('scrollEnd', refreshWhenIdle);
      media.revert();
      layoutTriggers.clear();
    };
  }, []);

  const revealForFocus = event => {
    // A touch/pointer focus must not force-scroll the page during a gesture.
    if (!event.target.matches(':focus-visible')) return;
    revealRef.current?.progress(1);
    if (window.matchMedia(mobileCurtainQuery).matches) {
      const wrapper = wrapperRef.current;
      const rect = wrapper.getBoundingClientRect();
      const control = event.target.getBoundingClientRect();
      const restingTop = Math.max(0, window.innerHeight - wrapper.offsetHeight);
      const navBottom = (document.querySelector('.gt-nav-bar')?.getBoundingClientRect().bottom ?? 72) + 20;
      if (rect.top > restingTop + 1 || control.top < navBottom || control.bottom > window.innerHeight - 16) {
        const controlBottom = control.bottom - surfaceRef.current.getBoundingClientRect().top;
        const top = window.scrollY + rect.top + Math.max(0, controlBottom - window.innerHeight + 24);
        scrollToPosition(top, true);
      }
      return;
    }
    // Fixed, clipped content needs its in-flow wrapper scrolled into view on Tab.
    if (!window.matchMedia(curtainQuery).matches) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    if (rect.top > 1) scrollToPosition(window.scrollY + rect.top, true);
  };

  const running = inView && pageVisible && !reduced && !paused && !activePolicy;

  return (
    <>
    <footer className="gt-cinematic-footer" id="site-footer" ref={wrapperRef} aria-labelledby="gt-footer-title" data-motion={running ? 'running' : 'paused'} onFocusCapture={revealForFocus}>
      <div className="gt-cinematic-footer__track">
      <div className="gt-cinematic-footer__surface" ref={surfaceRef}>
        <div className="gt-cinematic-footer__aurora" aria-hidden="true" />
        <div className="gt-cinematic-footer__grid" aria-hidden="true" />
        <div className="gt-cinematic-footer__giant" aria-hidden="true"><span ref={giantRef}>GREENTECH</span></div>

        <div className="gt-cinematic-footer__marquee" aria-hidden="true">
          <div className="gt-cinematic-footer__marquee-track"><MarqueeItem /><MarqueeItem /></div>
        </div>

        <div className="gt-cinematic-footer__content">
          <img className="gt-cinematic-footer__logo" src="/img/greentech-logo-light.svg" alt="Green Tech Real Estate" width="282" height="38" loading="lazy" />
          <div ref={headingRef}>
            
            <h2 className="gt-cinematic-footer__title" id="gt-footer-title">Ce construim<br /><span>împreună?</span></h2>
            {/* <p className="gt-cinematic-footer__description">De la prima idee la ultimul detaliu.<br />Hai să dăm formă proiectului tău.</p> */}
          </div>
          <div className="gt-cinematic-footer__links" ref={linksRef}>
            <div className="gt-cinematic-footer__primary">
              <MagneticButton href="#contact" onClick={navigate} className="gt-footer-pill--primary">Cere o ofertă <FiArrowUpRight aria-hidden="true" /></MagneticButton>
              {/* <MagneticButton href="#proiecte" onClick={navigate} className="gt-footer-pill--large">Descoperă proiectul <FiArrowUpRight aria-hidden="true" /></MagneticButton> */}
            </div>
            {/* <nav className="gt-cinematic-footer__nav" aria-label="Navigare în subsol">
              {navigation.map(item => <MagneticButton key={item.href} href={item.href} onClick={navigate}>{item.label}</MagneticButton>)}
            </nav> */}
          </div>
        </div>

        <div className="gt-cinematic-footer__bottom">
          <div className="gt-cinematic-footer__legal-row">
            <p>© {new Date().getFullYear()} Esa Coder Solutions</p>
            <nav className="gt-cinematic-footer__legal-links" aria-label="Informații legale">
              {legalPolicies.map(policy => (
                <button key={policy.id} type="button" aria-haspopup="dialog" onClick={() => setActivePolicy(policy)}>{policy.label}</button>
              ))}
            </nav>
          </div>
          {/* {!reduced && <button className="gt-cinematic-footer__pause" type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}{paused ? 'Reia animațiile' : 'Pauză animații'}</button>} */}
          <MagneticButton className="gt-footer-pill--top" href="#acasa" onClick={navigate} aria-label="Înapoi sus, la începutul paginii"><FiArrowUp aria-hidden="true" /></MagneticButton>
        </div>
      </div>
      </div>
    </footer>
    {activePolicy && <LegalModal policy={activePolicy} onClose={() => setActivePolicy(null)} />}
    </>
  );
}
