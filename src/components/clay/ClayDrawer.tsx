import React, { useContext, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PhysicsContext, { toSpringConfig } from '../animations/SpringPhysics';

export interface ClayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  side?: 'left' | 'right' | 'bottom';
  width?: number | string;
  height?: number | string;
  colorway?: 'mint' | 'blue' | 'pink' | 'lavender' | 'peach' | 'neutral';
  closeOnOverlay?: boolean;
  showHandle?: boolean;
}

const sideVariants = {
  left:   { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
  right:  { initial: { x: '100%'  }, animate: { x: 0 }, exit: { x: '100%'  } },
  bottom: { initial: { y: '100%'  }, animate: { y: 0 }, exit: { y: '100%'  } },
};

const sideStyle = (side: 'left' | 'right' | 'bottom', width: number | string, height: number | string): React.CSSProperties => {
  if (side === 'bottom') return { bottom: 0, left: 0, right: 0, height, borderRadius: '24px 24px 0 0' };
  if (side === 'left')   return { top: 0, left: 0, bottom: 0, width, borderRadius: '0 24px 24px 0' };
  return { top: 0, right: 0, bottom: 0, width, borderRadius: '24px 0 0 24px' };
};

export const ClayDrawer: React.FC<ClayDrawerProps> = ({
  isOpen, onClose, children, title,
  side = 'right', width = 360, height = '60vh',
  colorway = 'neutral', closeOnOverlay = true, showHandle = true,
}) => {
  const physics = useContext(PhysicsContext);
  const spring  = toSpringConfig(physics);
  const vars    = sideVariants[side];

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKey]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeOnOverlay ? onClose : undefined}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(0,0,0,0.32)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              cursor: closeOnOverlay ? 'pointer' : 'default',
            }}
          />

          {/* Drawer panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Drawer'}
            initial={vars.initial}
            animate={vars.animate}
            exit={vars.exit}
            transition={{ type: 'spring', stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass }}
            style={{
              position: 'fixed', zIndex: 301,
              background: 'var(--bg-card)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.7)',
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
              ...sideStyle(side, width, height),
            }}
          >
            {/* Handle for bottom drawer */}
            {showHandle && side === 'bottom' && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--text-secondary)', opacity: 0.3 }} />
              </div>
            )}

            {/* Header */}
            {title && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                flexShrink: 0,
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: spring.stiffness, damping: spring.damping }}
                  aria-label="Close drawer"
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: 'none',
                    background: 'var(--bg-surface)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ClayDrawer;
