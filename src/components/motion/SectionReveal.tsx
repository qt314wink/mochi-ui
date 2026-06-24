import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface SectionRevealProps {
  children: React.ReactNode;
  delay?: number;
  /** y offset to animate from, default 32 */
  yOffset?: number;
  /** blur amount to animate from (px), default 8 */
  blur?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
}

/**
 * Wraps any section content with a blur+y fade-in on scroll entry.
 * Respects prefers-reduced-motion — falls back to instant opacity only.
 */
export const SectionReveal: React.FC<SectionRevealProps> = ({
  children, delay = 0, yOffset = 32, blur = 8,
  className, style, once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: 0.15 });
  const reduced = useReducedMotion();

  const initial = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: yOffset, filter: `blur(${blur}px)` };

  const animate = inView
    ? reduced
      ? { opacity: 1 }
      : { opacity: 1, y: 0, filter: 'blur(0px)' }
    : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: reduced ? 0.15 : 0.65,
        delay,
        ease: [0.19, 1.0, 0.22, 1.0],
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default SectionReveal;
