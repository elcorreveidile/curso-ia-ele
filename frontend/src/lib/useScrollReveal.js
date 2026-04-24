import { useEffect } from 'react';

/**
 * Global scroll-in animation. Adds `.is-visible` to any `.reveal` element
 * when it enters the viewport. Uses IntersectionObserver with a small
 * threshold so the animation triggers before the element is fully on screen.
 * Respects prefers-reduced-motion via CSS.
 */
export function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal:not(.is-visible)'));
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    // Mark above-the-fold elements as visible immediately (no scroll needed).
    // Anything that starts below the viewport bottom keeps the reveal effect.
    const viewportH = window.innerHeight || 800;
    const belowFold = [];
    els.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      if (top < viewportH - 40) el.classList.add('is-visible');
      else belowFold.push(el);
    });
    if (belowFold.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
    );
    belowFold.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
