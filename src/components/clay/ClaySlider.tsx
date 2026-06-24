import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useSpring } from 'motion/react';

export interface ClaySliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  colorway?: 'mint' | 'blue' | 'pink' | 'lavender' | 'peach';
  showTicks?: boolean;
  label?: string;
  disabled?: boolean;
}

// All gradients via token pairs — no hardcoded hex
const colorwayGradients: Record<string, string> = {
  mint:     'linear-gradient(90deg, var(--mochi-mint),          var(--mochi-sage))',
  blue:     'linear-gradient(90deg, var(--mochi-baby-blue),     var(--mochi-sky-blue))',
  pink:     'linear-gradient(90deg, var(--mochi-blush-pink),    var(--mochi-soft-rose))',
  lavender: 'linear-gradient(90deg, var(--mochi-lavender),      var(--mochi-lavender-vivid))',
  peach:    'linear-gradient(90deg, var(--mochi-peach),         var(--mochi-peach-pale))',
};

export const ClaySlider: React.FC<ClaySliderProps> = ({
  value: controlledValue,
  min = 0, max = 100, step = 1,
  onChange,
  colorway = 'mint',
  showTicks = false,
  label,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(min);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const trackRef    = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const knobX      = useSpring(0, { stiffness: 300, damping: 30, mass: 0.5 });
  const knobScale  = useSpring(1, { stiffness: 400, damping: 20 });
  const fillWidth  = useSpring(0, { stiffness: 300, damping: 30 });
  const percentage = ((value - min) / (max - min)) * 100;

  useEffect(() => {
    if (trackRef.current) {
      const w = trackRef.current.getBoundingClientRect().width;
      knobX.set((percentage / 100) * w);
      fillWidth.set((percentage / 100) * w);
    }
  }, [value, percentage, knobX, fillWidth]);

  const handleInteraction = useCallback((clientX: number) => {
    if (!trackRef.current || disabled) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x    = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const raw  = min + (x / rect.width) * (max - min);
    const snapped = Math.max(min, Math.min(max, Math.round(raw / step) * step));
    knobX.set(x); fillWidth.set(x);
    if (controlledValue === undefined) setInternalValue(snapped);
    onChange?.(snapped);
    try { if ('vibrate' in navigator) navigator.vibrate(3); } catch {}
  }, [min, max, step, disabled, onChange, controlledValue, knobX, fillWidth]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove  = (e: MouseEvent)  => handleInteraction(e.clientX);
    const onTouch = (e: TouchEvent) => handleInteraction(e.touches[0].clientX);
    const onEnd   = () => { setIsDragging(false); knobScale.set(1); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onEnd);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchend',  onEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onEnd);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend',  onEnd);
    };
  }, [isDragging, handleInteraction, knobScale]);

  return (
    <div className="clay-slider-wrapper" style={{ opacity: disabled ? 0.5 : 1 }}>
      {label && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginBottom: 'var(--space-2)',
          fontSize: 'var(--type-meta-size)', fontWeight: 500,
          fontFamily: 'var(--font-family)', color: 'var(--text-primary)',
        }}>
          <span>{label}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{value}</span>
        </div>
      )}

      <div style={{ position: 'relative', height: 44, display: 'flex', alignItems: 'center' }}>
        <div
          ref={trackRef}
          style={{
            width: '100%', height: 12,
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg-surface)',
            boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.08), inset -3px -3px 6px rgba(255,255,255,0.8)',
            position: 'relative',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          onMouseDown={(e) => { setIsDragging(true); knobScale.set(1.2); handleInteraction(e.clientX); }}
          onTouchStart={(e) => { setIsDragging(true); knobScale.set(1.2); handleInteraction(e.touches[0].clientX); }}
        >
          <motion.div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            borderRadius: 'var(--radius-pill)',
            background: colorwayGradients[colorway],
            width: fillWidth,
            boxShadow: '1px 1px 3px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.5)',
          }} />

          {/* Thumb — min 44×44px touch target */}
          <motion.div
            role="slider"
            aria-valuenow={value} aria-valuemin={min} aria-valuemax={max}
            aria-label={label}
            tabIndex={disabled ? -1 : 0}
            style={{
              position: 'absolute', top: '50%',
              x: knobX, y: '-50%',
              width: 44, height: 44,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #ffffff, #f0f0f0)',
              boxShadow: '3px 3px 8px rgba(0,0,0,0.15), -2px -2px 4px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,1)',
              scale: knobScale,
              cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
              zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          />
        </div>
      </div>

      {showTicks && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 'var(--space-1)', padding: '0 var(--space-3)',
        }}>
          {[min, (min + max) / 2, max].map((t) => (
            <span key={t} style={{ fontSize: 'var(--type-meta-size)', color: 'var(--text-secondary)' }}>
              {Math.round(t)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaySlider;
