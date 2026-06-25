import React, { useContext, useRef, useCallback } from 'react';
import { motion, useSpring } from 'motion/react';
import PhysicsContext, { toSpringConfig } from '../animations/SpringPhysics';

export interface ClaySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  colorway?: 'mint' | 'blue' | 'pink' | 'lavender' | 'peach' | 'neutral';
  showTicks?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const colorwayMap: Record<string, string> = {
  mint:     'var(--mochi-mint)',
  blue:     'var(--mochi-sky-blue)',
  pink:     'var(--mochi-blossom)',
  lavender: 'var(--mochi-lavender)',
  peach:    'var(--mochi-peach)',
  neutral:  'var(--text-secondary)',
};

export const ClaySlider: React.FC<ClaySliderProps> = ({
  value, onChange, min = 0, max = 100, step = 1,
  label, colorway = 'mint', showTicks = false, disabled, style,
}) => {
  const physics    = useContext(PhysicsContext);
  const spring     = toSpringConfig(physics);
  const pct        = ((value - min) / (max - min)) * 100;
  const thumbScale = useSpring(1, { stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  const color = colorwayMap[colorway];

  return (
    <div style={{ width: '100%', ...style }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
        </div>
      )}
      <div style={{ position: 'relative', height: 40, display: 'flex', alignItems: 'center' }}>
        {/* track */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 8,
          background: 'var(--bg-surface, #f0ebe3)',
          boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.6)',
        }}>
          <motion.div style={{
            width: `${pct}%`, height: '100%', borderRadius: 8,
            background: color,
            boxShadow: `0 2px 8px ${color}55`,
          }} />
        </div>
        {/* native range (invisible, handles a11y + drag) */}
        <input
          type="range" min={min} max={max} step={step} value={value}
          disabled={disabled}
          onChange={handleChange}
          onPointerDown={() => thumbScale.set(1.3)}
          onPointerUp={() => thumbScale.set(1)}
          style={{
            position: 'absolute', inset: 0, opacity: 0,
            width: '100%', height: '100%', cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          aria-label={label}
          aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
        />
        {/* custom thumb */}
        <motion.div style={{
          position: 'absolute',
          left: `calc(${pct}% - 12px)`,
          width: 24, height: 24, borderRadius: '50%',
          background: color,
          boxShadow: `0 4px 12px ${color}66, inset 0 1px 0 rgba(255,255,255,0.6)`,
          scale: thumbScale,
          pointerEvents: 'none',
        }} />
      </div>
      {showTicks && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {[min, Math.round((min + max) / 2), max].map(t => (
            <span key={t} style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaySlider;
