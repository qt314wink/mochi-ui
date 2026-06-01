import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useResponsive } from '../responsive/ResponsiveSystem';

gsap.registerPlugin(ScrollTrigger);

// Scroll-Triggered Clay Reveal
export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, direction = 'up', delay = 0, duration = 0.8, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useResponsive();

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;

    const el = ref.current;
    const fromVars: gsap.TweenVars = {
      opacity: 0,
      scale: 0.9,
    };

    switch (direction) {
      case 'up': fromVars.y = 60; break;
      case 'down': fromVars.y = -60; break;
      case 'left': fromVars.x = 60; break;
      case 'right': fromVars.x = -60; break;
    }

    gsap.from(el, {
      ...fromVars,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
      },
    });
  }, [direction, delay, duration, prefersReducedMotion]);

  return (
    <div ref={ref} className={className} style={{ opacity: prefersReducedMotion ? 1 : undefined }}>
      {children}
    </div>
  );
};

// Parallax Clay Layer
export const ParallaxLayer: React.FC<{
  children: React.ReactNode;
  speed?: number;
  className?: string;
}> = ({ children, speed = 0.5, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useResponsive();

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;

    gsap.to(ref.current, {
      y: () => speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, [speed, prefersReducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// Pin and Scrub Section
export const PinSection: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useResponsive();

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
      },
    });

    tl.to('.clay-element', {
      scale: 1.2,
      rotateY: 15,
      duration: 1,
    })
    .to('.clay-element', {
      scale: 1,
      rotateY: 0,
      duration: 1,
    });

    return () => {
      tl.kill();
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={ref} className={className} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
};

// Horizontal Scroll Gallery
export const HorizontalScroll: React.FC<{
  children: React.ReactNode[];
  className?: string;
}> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useResponsive();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current || !trackRef.current) return;

    const track = trackRef.current;
    const items = track.children;
    const totalWidth = Array.from(items).reduce((acc, item) => acc + (item as HTMLElement).offsetWidth + 24, 0);

    gsap.to(track, {
      x: () => -(totalWidth - window.innerWidth + 100),
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: () => `+=${totalWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'hidden' }}>
      <div ref={trackRef} style={{ display: 'flex', gap: 24, padding: '0 48px' }}>
        {children}
      </div>
    </div>
  );
};

export default ScrollReveal;
