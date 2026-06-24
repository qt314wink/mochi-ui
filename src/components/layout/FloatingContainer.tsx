import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export interface FloatingContainerProps {
  children: React.ReactNode;
  amplitude?: number;
  frequency?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const FloatingContainer: React.FC<FloatingContainerProps> = ({
  children,
  amplitude = 6,
  frequency = 0.6,
  className,
  style,
}) => {
  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 60, damping: 12, mass: 0.8 });
  const raf = useRef<number>(0);
  const startTime = useRef(performance.now());

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReduced) return;
    const tick = () => {
      const elapsed = (performance.now() - startTime.current) / 1000;
      y.set(Math.sin(elapsed * frequency * Math.PI * 2) * amplitude);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [amplitude, frequency, prefersReduced, y]);

  return (
    <motion.div style={{ y: springY, ...style }} className={className}>
      {children}
    </motion.div>
  );
};

export default FloatingContainer;
