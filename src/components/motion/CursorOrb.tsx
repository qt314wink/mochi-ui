import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export interface CursorOrbProps {
  /** Base size in px */
  size?: number;
  /** Lerp factor 0–1 (lower = more lag) */
  lerp?: number;
  /** Expand size on interactive element hover */
  hoverSize?: number;
}

/**
 * Desktop-only ambient cursor orb.
 * Attaches to document mousemove and follows at a spring-damped lag.
 * Expands and shifts colorway on hover over [data-cursor-color] elements.
 */
export const CursorOrb: React.FC<CursorOrbProps> = ({
  size = 32, lerp = 0.12, hoverSize = 52,
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [isHovering, setIsHovering]  = useState(false);

  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);
  const x = useSpring(rawX, { stiffness: 120, damping: 28, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 120, damping: 28, mass: 0.6 });

  useEffect(() => {
    // Only mount on non-touch desktop
    setIsDesktop(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX - (isHovering ? hoverSize : size) / 2);
      rawY.set(e.clientY - (isHovering ? hoverSize : size) / 2);

      // Detect [data-cursor-color] ancestor
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const colored = el?.closest('[data-cursor-color]');
      if (colored) {
        const color = colored.getAttribute('data-cursor-color');
        setHoverColor(color);
        setIsHovering(true);
      } else {
        setHoverColor(null);
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, [isDesktop, isHovering, size, hoverSize, rawX, rawY]);

  if (!isDesktop) return null;

  const currentSize = isHovering ? hoverSize : size;
  const bg = hoverColor
    ? `var(--mochi-${hoverColor}, var(--mochi-mint))`
    : 'var(--mochi-mint)';

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        x, y,
        width: currentSize,
        height: currentSize,
        borderRadius: '50%',
        background: bg,
        opacity: 0.18,
        filter: 'blur(4px)',
        mixBlendMode: 'multiply',
        transition: 'width 0.2s var(--ease-clay), height 0.2s var(--ease-clay), background 0.3s ease',
      }}
    />
  );
};

export default CursorOrb;
