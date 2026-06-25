import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  message: string;
  type?: NotificationType;
  duration?: number;
  action?: { label: string; onClick: () => void };
  dismissible?: boolean;
}

interface ToastItem extends NotificationOptions {
  id: string;
}

interface NotificationContextValue {
  notify: (options: NotificationOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const colorBar: Record<NotificationType, string> = {
  success: 'hsl(142deg 76% 45%)',
  error:   'hsl(0deg 85% 58%)',
  warning: 'hsl(38deg 95% 55%)',
  info:    'hsl(200deg 90% 52%)',
};

const bgMap: Record<NotificationType, string> = {
  success: 'hsl(142deg 76% 94%)',
  error:   'hsl(0deg 85% 96%)',
  warning: 'hsl(38deg 95% 94%)',
  info:    'hsl(200deg 90% 94%)',
};

const icons: Record<NotificationType, string> = {
  success: '✓',
  error:   '✕',
  warning: '!',
  info:    'i',
};

const Toast: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const type = toast.type ?? 'info';
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      timerRef.current = setTimeout(() => onDismiss(toast.id), duration);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.92 }}
      animate={{ opacity: 1, x: 0,  scale: 1    }}
      exit={{    opacity: 0, x: 64, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 280,
        maxWidth: 400,
        borderRadius: 16,
        background: bgMap[type],
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
        overflow: 'hidden',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {/* Left color bar */}
      <div style={{ width: 4, alignSelf: 'stretch', background: colorBar[type], flexShrink: 0 }} />

      {/* Icon */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: colorBar[type],
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, flexShrink: 0,
      }}>
        {icons[type]}
      </div>

      {/* Text */}
      <div style={{ flex: 1, padding: '12px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'hsl(0deg 0% 15%)', lineHeight: 1.4 }}>
          {toast.message}
        </div>
        {toast.action && (
          <button
            onClick={() => { toast.action!.onClick(); onDismiss(toast.id); }}
            style={{
              marginTop: 6, fontSize: 12, fontWeight: 600,
              color: colorBar[type], background: 'none',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss */}
      {(toast.dismissible ?? true) && (
        <button
          onClick={() => onDismiss(toast.id)}
          style={{
            marginRight: 12, width: 24, height: 24,
            borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.08)',
            color: 'hsl(0deg 0% 40%)',
            cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </motion.div>
  );
};

export const ClayNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((options: NotificationOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev.slice(-4), { ...options, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  return (
    <NotificationContext.Provider value={{ notify, dismiss, dismissAll }}>
      {children}
      {/* Toast tray — fixed bottom-right */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <Toast toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside ClayNotificationProvider');
  return ctx;
};

export default ClayNotificationProvider;
