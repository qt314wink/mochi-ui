import React, { useRef } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

export interface ClayReboundProps {
  children: React.ReactNode;
  trigger?: boolean;
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Wraps a child element and plays a spring-rebound squish animation
 * whenever `trigger` flips to true.
 */
export const ClayRebound: React.FC<ClayReboundProps> = ({
  children,
  trigger,
  intensity = 1,
  className,
  style,
}) => {
  const scaleX = useSpring(1, { stiffness: 400 * intensity, damping: 18, mass: 0.6 });
  const scaleY = useSpring(1, { stiffness: 400 * intensity, damping: 18, mass: 0.6 });
  const prevTrigger = useRef(trigger);

  if (trigger && !prevTrigger.current) {
    // compress horizontally, expand vertically, then spring back
    scaleX.set(0.88);
    scaleY.set(1.12);
    setTimeout(() => { scaleX.set(1); scaleY.set(1); }, 80);
  }
  prevTrigger.current = trigger;

  return (
    <motion.div
      style={{ display: 'inline-flex', scaleX, scaleY, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ClayRebound;
