import { useEffect, useRef } from 'react';

export function useBuildReveal() {
  const ref = useRef(null);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.buildVisible = 'true';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    ref.current?.querySelectorAll('[data-build-reveal]').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export function usePhotoParallax(ref, imageSource) {
  useEffect(() => {
    const image = ref.current?.querySelector('img');
    if (!image || !imageSource || !('IntersectionObserver' in window)) return undefined;
    const query = window.matchMedia('(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      if (!query.matches || !visible) { image.style.removeProperty('transform'); return; }
      const bounds = ref.current.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (bounds.top + bounds.height / 2 - window.innerHeight / 2) / window.innerHeight));
      image.style.transform = `translateY(${progress * 18}px) scale(1.06)`;
    };
    const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(update); };
    const onPreference = () => { if (!query.matches) image.style.removeProperty('transform'); else schedule(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer.observe(ref.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    query.addEventListener('change', onPreference);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      query.removeEventListener('change', onPreference);
      cancelAnimationFrame(frame);
      image.style.removeProperty('transform');
    };
  }, [ref, imageSource]);
}
