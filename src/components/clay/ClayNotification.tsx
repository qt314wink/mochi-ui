import React, { useContext, useEffect, useCallback, createContext, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PhysicsContext, { toSpringConfig } from '../animations/SpringPhysics';

// ─── Types ───

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
  id: string;
  message: string;
  type?: NotificationType;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface NotificationContextValue {
  notify: (item: Omit<NotificationItem, 'id'>) => string;
  dismiss: (id: string) => void;
}

// ─── Context ───

const NotificationContext = createContext<NotificationContextValue>({
  notify: () => '',
  dismiss: () => {},
});

export const useNotification = () => useContext(NotificationContext);

// ─── Icons ───

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  success: {
    color: 'var(--mochi-mint)',
    bg: 'rgba(94,231,176,0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
  },
  error: {
    color: '#f87171',
    bg: 'rgba(248,113,113,0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  },
  warning: {
    color: 'var(--mochi-peach)',
    bg: 'rgba(255,209,170,0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  info: {
    color: 'var(--mochi-sky-blue)',
    bg: 'rgba(124,185,245,0.12)',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  },
};

// ─── Single toast ───

const Toast: React.FC<{ item: NotificationItem; onDismiss: (id: string) => void }> = ({ item, onDismiss }) => {
  const physics  = useContext(PhysicsContext);
  const spring   = toSpringConfig(physics);
  const cfg      = typeConfig[item.type ?? 'info'];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dur = item.duration ?? 4000;
    if (dur > 0) {
      timerRef.current = setTimeout(() => onDismiss(item.id), dur);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [item.id, item.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass }}
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px',
        background: 'var(--bg-card)',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
        minWidth: 280, maxWidth: 380,
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => onDismiss(item.id)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* color bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: cfg.color, borderRadius: '16px 0 0 16px' }} />
      {/* icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginLeft: 4,
        background: cfg.bg, color: cfg.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {cfg.icon}
      </div>
      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {item.message}
        </p>
        {item.action && (
          <button
            onClick={(e) => { e.stopPropagation(); item.action!.onClick(); onDismiss(item.id); }}
            style={{
              marginTop: 6, padding: '4px 10px', borderRadius: 8, border: 'none',
              background: cfg.bg, color: cfg.color,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {item.action.label}
          </button>
        )}
      </div>
      {/* close */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        style={{ flexShrink: 0, opacity: 0.4, marginTop: 2 }}>
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </motion.div>
  );
};

// ─── Provider ───

export const ClayNotificationProvider: React.FC<{
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}> = ({ children, position = 'bottom-right' }) => {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const notify = useCallback((item: Omit<NotificationItem, 'id'>): string => {
    const id = Math.random().toString(36).slice(2);
    setItems(prev => [...prev, { ...item, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const posStyle: React.CSSProperties = {
    position: 'fixed', zIndex: 500,
    display: 'flex', flexDirection: 'column', gap: 10,
    padding: 16,
    ...(position.includes('top')    ? { top: 0 }    : { bottom: 0 }),
    ...(position.includes('right')  ? { right: 0 }  : {}),
    ...(position.includes('left')   ? { left: 0 }   : {}),
    ...(position.includes('center') ? { left: '50%', transform: 'translateX(-50%)' } : {}),
    pointerEvents: 'none',
  };

  return (
    <NotificationContext.Provider value={{ notify, dismiss }}>
      {children}
      <div style={posStyle}>
        <AnimatePresence mode="popLayout">
          {items.map(item => (
            <div key={item.id} style={{ pointerEvents: 'auto' }}>
              <Toast item={item} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export type { NotificationContextValue };
export default ClayNotificationProvider;
