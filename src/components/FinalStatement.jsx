import { useEffect, useRef } from 'react';
import { FiArrowUpRight, FiArrowRight } from 'react-icons/fi';
import { Hero } from './ui/animated-hero';
import './FinalStatement.css';

const closingTitles = [
  "VIITORUL.",
  "ÎNCREDEREA.",
  "CALITATEA.",
  "VISURILE TALE.",
];
function navigateToSection(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const hash = event.currentTarget.getAttribute('href');
  const target = document.querySelector(hash);
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();

  const offset = (document.querySelector('.gt-nav-bar')?.getBoundingClientRect().bottom ?? 72) + 20;
  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.__greenTechLenis) {
    window.__greenTechLenis.scrollTo(top, { duration: 0.9, force: true, immediate: reduced });
  } else window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });

  const heading = target.querySelector('h2, h3') ?? target;
  if (!heading.hasAttribute('tabindex')) {
    heading.setAttribute('tabindex', '-1');
    heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
  }
  heading.focus({ preventScroll: true });
  if (window.location.hash !== hash) window.history.pushState(null, '', hash);
}

export default function FinalStatement() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      section.dataset.revealed = 'true';
      observer.disconnect();
    }, { threshold: 0.15 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="final-statement"
      id="final-statement"
      aria-labelledby="final-statement-title"
      ref={sectionRef}
    >
      <div className="final-statement__container">
        <Hero
          introduction="NU CONSTRUIM DOAR STRUCTURI."
          prefix="CONSTRUIM"
          titles={closingTitles}
          titleId="final-statement-title"
          headingClassName="final-statement__title"
        />
        {/* <div className="final-statement__footer">
          <p>Ai un teren, un plan sau o idee.<br />Hai să discutăm despre următorul pas.</p>
          <div className="final-statement__actions">
            <a className="final-statement__action final-statement__action--primary" href="#contact" onClick={navigateToSection}>Cere o ofertă <FiArrowUpRight aria-hidden="true" /></a>
            <a className="final-statement__action" href="#ground-to-home" onClick={navigateToSection}>Explorează etapele <FiArrowRight aria-hidden="true" /></a>
          </div>
        </div> */}
        <div className="final-statement__rule" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
