import React, { useContext, useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PhysicsContext, { toSpringConfig } from '../animations/SpringPhysics';

export interface ClaySelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ClaySelectProps {
  options: ClaySelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  colorway?: 'mint' | 'blue' | 'pink' | 'lavender' | 'peach' | 'neutral';
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const colorwayMap: Record<string, string> = {
  mint:     'var(--mochi-mint)',
  blue:     'var(--mochi-sky-blue)',
  pink:     'var(--mochi-blossom)',
  lavender: 'var(--mochi-lavender)',
  peach:    'var(--mochi-peach)',
  neutral:  'var(--text-secondary)',
};

export const ClaySelect: React.FC<ClaySelectProps> = ({
  options, value, onChange, placeholder = 'Select…',
  label, colorway = 'mint', disabled, style, className,
}) => {
  const physics  = useContext(PhysicsContext);
  const spring   = toSpringConfig(physics);
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);
  const accent   = colorwayMap[colorway];

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open, close]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); }
    if (e.key === 'ArrowDown' && open) {
      const idx = options.findIndex(o => o.value === value);
      const next = options[idx + 1];
      if (next && !next.disabled) onChange?.(next.value);
    }
    if (e.key === 'ArrowUp' && open) {
      const idx = options.findIndex(o => o.value === value);
      const prev = options[idx - 1];
      if (prev && !prev.disabled) onChange?.(prev.value);
    }
  }, [open, options, value, onChange, close]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', ...style }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <motion.button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={() => !disabled && setOpen(o => !o)}
        onKeyDown={handleKey}
        whileTap={disabled ? {} : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass }}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: 16, border: 'none',
          background: 'var(--bg-card)',
          boxShadow: focused
            ? `0 0 0 2px ${accent}, 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.7)`
            : '0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
          fontSize: 15, fontWeight: 500,
          color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <motion.svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: spring.stiffness, damping: spring.damping }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              background: 'var(--bg-card)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
              borderRadius: 16, padding: '8px 0',
              listStyle: 'none', margin: 0, zIndex: 200,
              maxHeight: 240, overflowY: 'auto',
            }}
          >
            {options.map(opt => (
              <motion.li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                aria-disabled={opt.disabled}
                whileHover={opt.disabled ? {} : { backgroundColor: `${accent}18`, x: 2 }}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange?.(opt.value);
                  close();
                }}
                style={{
                  padding: '10px 16px', fontSize: 15,
                  color: opt.disabled ? 'var(--text-secondary)' : 'var(--text-primary)',
                  fontWeight: opt.value === value ? 700 : 400,
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  background: opt.value === value ? `${accent}15` : 'transparent',
                  opacity: opt.disabled ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                {opt.label}
                {opt.value === value && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClaySelect;
