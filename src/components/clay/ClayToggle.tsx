import React, { useState, useCallback } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

export interface ClayToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  colorway?: 'mint' | 'blue' | 'pink' | 'lavender';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label?: string;
}

// Token-resolved active backgrounds — no raw hsl()
const colorwayActive: Record<string, string> = {
  mint:     'var(--mochi-mint)',
  blue:     'var(--mochi-baby-blue)',
  pink:     'var(--mochi-blush-pink)',
  lavender: 'var(--mochi-lavender)',
};

const sizes = {
  sm: { width: 52, height: 30, knob: 22 },
  md: { width: 64, height: 36, knob: 28 },
  lg: { width: 80, height: 44, knob: 36 },
};

export const ClayToggle: React.FC<ClayToggleProps> = ({
  checked: controlledChecked,
  onChange, colorway = 'mint', size = 'md', disabled = false, label,
}) => {
  const [internal, setInternal] = useState(false);
  const isChecked = controlledChecked !== undefined ? controlledChecked : internal;
  const dims = sizes[size];
  const spring = { stiffness: 400, damping: 25, mass: 0.8 };

  const knobX  = useSpring(isChecked ? dims.width - dims.knob - 4 : 4, spring);
  const scale  = useSpring(1, { stiffness: 500, damping: 20 });
  const shadowX = useTransform(knobX, (x) => x > dims.width / 2 ? -2 : 2);
  const shadowStr = useTransform(shadowX, (sx) =>
    `${sx}px 2px 6px rgba(0,0,0,0.15), ${-sx}px -1px 3px rgba(255,255,255,0.9)`
  );

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const next = !isChecked;
    scale.set(0.9);
    setTimeout(() => scale.set(1), 150);
    knobX.set(next ? dims.width - dims.knob - 4 : 4);
    try { if ('vibrate' in navigator) navigator.vibrate(next ? [10, 5, 15] : [8]); } catch {}
    if (controlledChecked === undefined) setInternal(next);
    onChange?.(next);
  }, [isChecked, disabled, onChange, controlledChecked, knobX, scale, dims]);

  // Minimum tap target: entire wrapper row is at least 44px tall
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: 'var(--space-3)',
      minHeight: 44,
      opacity: disabled ? 0.5 : 1,
    }}>
      {label && (
        <span style={{
          fontSize: 'var(--type-body-size)',
          fontWeight: 500,
          fontFamily: 'var(--font-family)',
          color: 'var(--text-primary)',
        }}>
          {label}
        </span>
      )}

      <motion.div
        role="switch"
        aria-checked={isChecked}
        aria-label={label}
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleToggle(); }}
        style={{
          width: dims.width, height: dims.height,
          borderRadius: 'var(--radius-pill)',
          background: isChecked ? colorwayActive[colorway] : 'var(--bg-surface)',
          boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative', flexShrink: 0,
          scale,
        }}
        whileTap={{ scale: 0.95 }}
        data-checked={isChecked}
      >
        <motion.div style={{
          position: 'absolute',
          width: dims.knob, height: dims.knob,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #ffffff, #f0f0f0)',
          x: knobX,
          y: (dims.height - dims.knob) / 2,
          boxShadow: shadowStr,
        }} />
      </motion.div>
    </div>
  );
};

export default ClayToggle;
