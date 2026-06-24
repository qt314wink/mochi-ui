import React from 'react';
import { motion, useInView } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface StaggerGridProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

/**
 * Renders children in a staggered scroll-enter animation.
 * Each child scales from 0.96→1 and blurs from 4px→0 with a per-item delay.
 * Respects prefers-reduced-motion.
 */
export const StaggerGrid: React.FC<StaggerGridProps> = ({
  children, staggerDelay = 0.07,
  className, style, itemStyle,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className={className} style={style}>
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
          animate={inView
            ? reduced ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' }
            : undefined
          }
          transition={{
            duration: reduced ? 0.1 : 0.5,
            delay: i * staggerDelay,
            ease: [0.19, 1.0, 0.22, 1.0],
          }}
          style={itemStyle}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export default StaggerGrid;
