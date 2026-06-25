import React, { useContext } from 'react';
import { motion } from 'motion/react';
import PhysicsContext, { toSpringConfig } from '../animations/SpringPhysics';

export interface ClayCardProps {
  children?: React.ReactNode;
  colorway?: 'mint' | 'blue' | 'pink' | 'lavender' | 'peach' | 'neutral';
  variant?: 'default' | 'elevated' | 'inset' | 'stats';
  interactive?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

const tintMap: Record<string, string> = {
  mint:     'rgba(94,231,176,0.08)',
  blue:     'rgba(124,185,245,0.08)',
  pink:     'rgba(255,182,193,0.08)',
  lavender: 'rgba(201,167,245,0.08)',
  peach:    'rgba(255,209,170,0.08)',
  neutral:  'transparent',
};

export const ClayCard: React.FC<ClayCardProps> = ({
  children, colorway = 'neutral', variant = 'default',
  interactive = true, onClick, style, className,
}) => {
  const physics = useContext(PhysicsContext);
  const spring  = toSpringConfig(physics);

  const baseStyle: React.CSSProperties = {
    background: `var(--bg-card, #fffaf5)`,
    borderRadius: 24,
    padding: 24,
    boxShadow: variant === 'inset'
      ? 'inset 4px 4px 10px rgba(0,0,0,0.06), inset -4px -4px 10px rgba(255,255,255,0.8)'
      : variant === 'elevated'
      ? '0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)'
      : '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
    backgroundImage: tintMap[colorway]
      ? `linear-gradient(135deg, ${tintMap[colorway]} 0%, transparent 100%)`
      : undefined,
    cursor: interactive ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  if (!interactive) {
    return <div className={className} style={baseStyle}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={baseStyle}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: 'spring', stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass }}
    >
      {children}
    </motion.div>
  );
};

export default ClayCard;
