import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

const variantTokens: Record<ToastVariant, { bg: string; color: string; icon: string }> = {
  success: { bg: 'var(--mochi-mint)',       color: 'hsl(142deg 70% 18%)', icon: '✓' },
  error:   { bg: 'var(--mochi-soft-rose)',  color: '#fff',                icon: '✕' },
  warning: { bg: 'var(--mochi-peach)',      color: 'hsl(25deg 75% 18%)', icon: '⚠' },
  info:    { bg: 'var(--mochi-baby-blue)',  color: 'hsl(200deg 70% 18%)', icon: 'ℹ' },
};

export interface ClayToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'bottom-right' | 'bottom-center';
}

export const ClayToast: React.FC<ClayToastProps> = ({
  toasts, onDismiss, position = 'bottom-right',
}) => {
  const posStyles: React.CSSProperties =
    position === 'bottom-right'  ? { bottom: 24, right: 24 } :
    position === 'bottom-center' ? { bottom: 24, left: '50%', transform: 'translateX(-50%)' } :
                                   { top: 24, right: 24 };

  return (
    <div style={{
      position: 'fixed', zIndex: 9000,
      display: 'flex', flexDirection: 'column-reverse', gap: 'var(--space-3)',
      pointerEvents: 'none',
      ...posStyles,
    }}>
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 4000;
  const v = variantTokens[toast.variant ?? 'info'];

  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      } else {
        onDismiss(toast.id);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [toast.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      exit={{    opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      style={{
        pointerEvents: 'all',
        minWidth: 280, maxWidth: 360,
        borderRadius: 'var(--radius-squircle-md)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-clay)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
      }}>
        <span style={{
          width: 32, height: 32, flexShrink: 0,
          borderRadius: 'var(--radius-squircle-xs)',
          background: v.bg, color: v.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700,
        }}>
          {v.icon}
        </span>
        <span style={{
          flex: 1,
          fontSize: 'var(--type-body-size)',
          fontFamily: 'var(--font-family)',
          color: 'var(--text-primary)',
          lineHeight: 'var(--type-body-line)',
        }}>
          {toast.message}
        </span>
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', padding: 'var(--space-1)',
            color: 'var(--text-tertiary)',
            fontSize: 18, lineHeight: 1,
            minWidth: 32, minHeight: 32,
          }}
        >×</button>
      </div>
      {/* Auto-dismiss progress bar */}
      <div style={{ height: 3, background: 'var(--bg-inset)' }}>
        <motion.div
          style={{ height: '100%', background: v.bg, width: `${progress}%`, transformOrigin: 'left' }}
        />
      </div>
    </motion.div>
  );
};

// Convenience hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const add = useCallback((message: string, variant: ToastVariant = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { id, message, variant, duration }]);
  }, []);
  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  return { toasts, add, dismiss };
}

export default ClayToast;
