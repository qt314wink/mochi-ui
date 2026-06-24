import { useEffect, useState } from 'react';

/**
 * Central prefers-reduced-motion signal.
 * Returns true when the user has requested reduced motion.
 * Reacts to changes in real-time (e.g., system preference toggle).
 */
export function useReducedMotion(): boolean {
  const mq = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  const [reduced, setReduced] = useState(mq?.matches ?? false);

  useEffect(() => {
    if (!mq) return;
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mq]);

  return reduced;
}
