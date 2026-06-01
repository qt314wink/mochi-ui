import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useResponsive } from '../responsive/ResponsiveSystem';

gsap.registerPlugin(ScrollTrigger);

// Lenis Smooth Scroll Provider
// Syncs with GSAP ScrollTrigger for buttery-smooth scroll-driven animations
export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const { prefersReducedMotion } = useResponsive();

  useEffect(() => {
    // Respect reduced motion preference
    if (prefersReducedMotion) return;

    // Initialize Lenis with 2026 recommended settings
    const lenis = new Lenis({
      lerp: 0.08,              // Smooth interpolation
      wheelMultiplier: 1.4,     // Wheel scroll multiplier
      syncTouch: true,          // Replace deprecated smoothTouch
      autoRaf: false,           // Manual RAF for GSAP sync
    });

    lenisRef.current = lenis;
    (window as any).__lenis = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis RAF to GSAP ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);  // Convert seconds to ms
    });

    // Disable GSAP lag smoothing for instant response
    gsap.ticker.lagSmoothing(0);

    // Handle visibility changes
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        lenis.stop();
      } else {
        lenis.start();
        lenis.resize();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, [prefersReducedMotion]);

  return <>{children}</>;
};

// Scroll-to utility with clay easing
export const scrollTo = (target: string | number, options?: {
  offset?: number;
  duration?: number;
  easing?: (t: number) => number;
}) => {
  const lenis = (window as any).__lenis;
  if (!lenis) return;

  lenis.scrollTo(target, {
    offset: options?.offset || 0,
    duration: options?.duration || 1.2,
    easing: options?.easing || ((t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
  });
};

// Scroll velocity hook for dynamic effects
export const useScrollVelocity = () => {
  const [velocity, setVelocity] = React.useState(0);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (!lenis) return;

    lenisRef.current = lenis;

    const updateVelocity = () => {
      setVelocity(lenis.velocity);
    };

    lenis.on('scroll', updateVelocity);
    return () => lenis.off('scroll', updateVelocity);
  }, []);

  return velocity;
};

// Scroll progress hook
export const useScrollProgress = () => {
  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (!lenis) return;

    const updateProgress = () => {
      setProgress(lenis.progress);
    };

    lenis.on('scroll', updateProgress);
    return () => lenis.off('scroll', updateProgress);
  }, []);

  return progress;
};

export default SmoothScrollProvider;
