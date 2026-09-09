import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FiPause, FiPlay } from 'react-icons/fi';
import './animated-hero.css';

const defaultTitles = ['WHAT COMES NEXT.'];

export function Hero({ introduction, prefix, titles = defaultTitles, titleId, headingClassName = '', lang = 'en', interval = 2800 }) {
  const rootRef = useRef(null);
  const wordsId = useId();
  const [titleNumber, setTitleNumber] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [supported, setSupported] = useState(false);
  const words = titles.length ? titles : defaultTitles;
  const animated = supported && !reducedMotion && words.length > 1;
  const playing = animated && inView && pageVisible && !paused;
  const activeIndex = animated ? titleNumber % words.length : 0;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(query.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    query.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);

    let observer;
    if ('IntersectionObserver' in window && rootRef.current) {
      setSupported(true);
      observer = new IntersectionObserver(([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.15);
      }, { threshold: [0, 0.15] });
      observer.observe(rootRef.current);
    }

    return () => {
      observer?.disconnect();
      query.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const timeoutId = window.setTimeout(() => {
      setTitleNumber(index => (index + 1) % words.length);
    }, interval);
    return () => window.clearTimeout(timeoutId);
  }, [playing, titleNumber, words.length, interval]);

  return (
    <div className="animated-hero" ref={rootRef} data-playback={!animated ? 'static' : paused ? 'paused' : playing ? 'playing' : 'idle'}>
      <h2 className={`animated-hero__title ${headingClassName}`} id={titleId} lang={lang}>
        <span className="animated-hero__accessible">{introduction} {prefix} {words[0]}</span>
        <span aria-hidden="true">
          <span className="animated-hero__introduction">{introduction}</span>
          <span className="animated-hero__statement">
            <span className="animated-hero__prefix">{prefix}</span>{' '}
            <span className="animated-hero__words" id={wordsId}>
              {/* Every phrase reserves its wrapped height, so the footer never jumps. */}
              {words.map(word => <span className="animated-hero__sizer" key={word}>{word}</span>)}
              {animated ? (
                <AnimatePresence initial={false}>
                  <motion.span
                    className="animated-hero__word"
                    key={activeIndex}
                    initial={{ opacity: 0, y: '110%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '-110%' }}
                    transition={{ type: 'spring', stiffness: 70, damping: 18 }}
                  >
                    {words[activeIndex]}
                  </motion.span>
                </AnimatePresence>
              ) : <span className="animated-hero__word">{words[0]}</span>}
            </span>
          </span>
        </span>
      </h2>
    </div>
  );
}
