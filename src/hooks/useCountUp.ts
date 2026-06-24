import { useEffect, useRef, useState } from 'react';

export interface UseCountUpOptions {
  from?: number;
  to: number;
  duration?: number;   // ms, default 1200
  decimals?: number;   // decimal places, default 0
  prefix?: string;
  suffix?: string;
  easing?: (t: number) => number;
}

// Ease-out expo — fast start, soft landing
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function useCountUp({
  from = 0, to, duration = 1200, decimals = 0,
  prefix = '', suffix = '',
  easing = easeOutExpo,
}: UseCountUpOptions) {
  const [display, setDisplay] = useState(`${prefix}${from.toFixed(decimals)}${suffix}`);
  const rafRef   = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const entryRef = useRef<HTMLElement | null>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!triggered) return;
    const start = (ts: number) => {
      startRef.current ??= ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const value = from + (to - from) * easing(t);
      setDisplay(`${prefix}${value.toFixed(decimals)}${suffix}`);
      if (t < 1) rafRef.current = requestAnimationFrame(start);
    };
    rafRef.current = requestAnimationFrame(start);
    return () => cancelAnimationFrame(rafRef.current);
  }, [triggered, from, to, duration, decimals, prefix, suffix, easing]);

  // Returns a ref callback — attach to any element and count starts on IntersectionObserver entry
  const ref = (el: HTMLElement | null) => {
    entryRef.current = el;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
  };

  return { display, ref };
}
