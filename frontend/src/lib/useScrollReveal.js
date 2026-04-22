import { useEffect } from 'react';

/**
 * Global scroll-in animation. Adds `.is-visible` to any `.reveal` element
 * when it enters the viewport. Uses IntersectionObserver with a small
 * threshold so the animation triggers before the element is fully on screen.
 * Respects prefers-reduced-motion via CSS.
 */
export function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}
