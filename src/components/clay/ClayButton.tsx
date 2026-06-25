import React, { useContext } from 'react';
import { motion } from 'motion/react';
import PhysicsContext, { toSpringConfig } from '../animations/SpringPhysics';

export interface ClayButtonProps {
  children?: React.ReactNode;
  colorway?: 'mint' | 'blue' | 'pink' | 'lavender' | 'peach' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'leading' | 'trailing';
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

const colorwayMap: Record<string, string> = {
  mint:     'var(--mochi-mint)',
  blue:     'var(--mochi-sky-blue)',
  pink:     'var(--mochi-blossom)',
  lavender: 'var(--mochi-lavender)',
  peach:    'var(--mochi-peach)',
  neutral:  'var(--bg-card)',
};

const sizeMap: Record<string, React.CSSProperties> = {
  sm: { padding: '8px 16px',  fontSize: 13, borderRadius: 12 },
  md: { padding: '12px 24px', fontSize: 15, borderRadius: 16 },
  lg: { padding: '16px 32px', fontSize: 17, borderRadius: 20 },
};

export const ClayButton: React.FC<ClayButtonProps> = ({
  children, colorway = 'mint', size = 'md', variant = 'solid',
  disabled, loading, icon, iconPosition = 'leading',
  onClick, style, className, type = 'button', 'aria-label': ariaLabel,
}) => {
  const physics  = useContext(PhysicsContext);
  const spring   = toSpringConfig(physics);
  const isNeutral = colorway === 'neutral';
  const bg        = variant === 'solid' ? colorwayMap[colorway] : 'transparent';
  const color     = variant === 'solid' && !isNeutral ? 'white' : 'var(--text-primary)';
  const border    = variant === 'outline' ? `2px solid ${colorwayMap[colorway]}` : 'none';

  return (
    <motion.button
      type={type}
      aria-label={ariaLabel}
      aria-busy={loading}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
      whileHover={disabled ? {} : { scale: 1.04, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.93, y: 2 }}
      transition={{ type: 'spring', stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 700, border, background: bg, color,
        boxShadow: variant === 'solid'
          ? '0 6px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)'
          : 'none',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        ...sizeMap[size],
        ...style,
      }}
    >
      {icon && iconPosition === 'leading' && icon}
      {loading ? <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : children}
      {icon && iconPosition === 'trailing' && icon}
    </motion.button>
  );
};

export default ClayButton;
