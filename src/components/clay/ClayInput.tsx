import React, { useState, useRef, useId } from 'react';
import { motion, useSpring } from 'motion/react';

export interface ClayInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  icon?: React.ReactNode;
  label?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  style?: React.CSSProperties;
}

export const ClayInput: React.FC<ClayInputProps> = ({
  type = 'text', placeholder,
  value: controlledValue, onChange,
  icon, label, error,
  disabled = false, autoFocus = false, style,
}) => {
  const [internal, setInternal] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  const value = controlledValue !== undefined ? controlledValue : internal;
  const inputType = type === 'password' ? (showPass ? 'text' : 'password') : type;

  const scale       = useSpring(1,  { stiffness: 400, damping: 25 });
  const glowOpacity = useSpring(0,  { stiffness: 300, damping: 20 });

  const handleFocus  = () => { setIsFocused(true);  scale.set(1.02); glowOpacity.set(1); };
  const handleBlur   = () => { setIsFocused(false); scale.set(1);    glowOpacity.set(0); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (controlledValue === undefined) setInternal(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div style={{ width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={uid}
          style={{
            display: 'block',
            marginBottom: 'var(--space-2)',
            fontSize: 'var(--type-meta-size)',
            fontWeight: 600,
            fontFamily: 'var(--font-family)',
            color: error ? 'var(--mochi-soft-rose)' : 'var(--text-primary)',
          }}
        >
          {label}
        </label>
      )}

      <motion.div style={{ position: 'relative', scale }}>
        {/* Glow halo on focus */}
        <motion.div style={{
          position: 'absolute', inset: -3,
          borderRadius: 'calc(var(--radius-squircle-sm) + 3px)',
          background: 'var(--mochi-mint)',
          opacity: glowOpacity,
          filter: 'blur(8px)',
          zIndex: -1,
        }} />

        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          minHeight: 44,
          borderRadius: 'var(--radius-squircle-sm)',
          background: 'var(--bg-surface)',
          // outline-based focus ring — never clipped by overflow:hidden
          outline: isFocused
            ? '2px solid var(--mochi-mint-vivid)'
            : '2px solid transparent',
          outlineOffset: 2,
          boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.05), inset -4px -4px 8px rgba(255,255,255,0.8)',
          transition: 'outline-color 0.15s ease',
        }}>
          {icon && (
            <span style={{
              color: isFocused ? 'var(--mochi-mint-vivid)' : 'var(--text-secondary)',
              transition: 'color 0.15s ease', flexShrink: 0,
            }}>
              {icon}
            </span>
          )}

          <input
            id={uid}
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            aria-invalid={!!error}
            aria-describedby={error ? `${uid}-error` : undefined}
            style={{
              flex: 1, border: 'none',
              background: 'transparent', outline: 'none',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--type-body-size)',
              color: 'var(--text-primary)',
              caretColor: 'var(--mochi-mint-vivid)',
              minWidth: 0,
            }}
          />

          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', padding: 'var(--space-1)',
                color: 'var(--text-secondary)', flexShrink: 0,
                minWidth: 32, minHeight: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.p
          id={`${uid}-error`}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            margin: 'var(--space-1) 0 0',
            fontSize: 'var(--type-meta-size)',
            color: 'var(--mochi-soft-rose)',
            fontWeight: 500,
            fontFamily: 'var(--font-family)',
          }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default ClayInput;
