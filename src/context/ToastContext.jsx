import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Trash2 } from 'lucide-react';

const ToastContext = createContext(null);
let _id = 0;

const CONFIG = {
  success: { Icon: CheckCircle2,  color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', bar: '#22C55E' },
  error:   { Icon: XCircle,       color: '#B91C1C', bg: '#FFF5F5', border: '#FECACA', bar: '#EF4444' },
  warning: { Icon: AlertTriangle, color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', bar: '#F59E0B' },
  info:    { Icon: Info,          color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', bar: '#3B82F6' }
};

export function ToastProvider({ children }) {
  const [toasts,   setToasts]   = useState([]);
  const [confirms, setConfirms] = useState([]);
  const timers = useRef({});

  /* ── listen for session-expired events from axios interceptor ── */
  const addToastRef = useRef(null);

  /* ── regular toasts ── */
  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_id;
    setToasts(prev => [...prev.slice(-4), { id, message, type, duration }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Keep a stable ref to addToast so the event listener always calls the latest version
  addToastRef.current = addToast;

  useEffect(() => {
    const handler = (e) => {
      const reason = e.detail?.reason || 'Your session has expired';
      addToastRef.current(
        `Session ended: ${reason}. Please log in again.`,
        'error',
        6000
      );
    };
    window.addEventListener('smartlink:session-expired', handler);
    return () => window.removeEventListener('smartlink:session-expired', handler);
  }, []);

  /* ── confirm dialogs ── */
  const dismissConfirm = useCallback((id) => {
    setConfirms(prev => prev.filter(c => c.id !== id));
  }, []);

  const addConfirm = useCallback((message, onConfirm, options = {}) => {
    const id = ++_id;
    setConfirms(prev => [...prev, {
      id, message,
      confirmLabel: options.confirmLabel || 'Delete',
      cancelLabel:  options.cancelLabel  || 'Cancel',
      danger:       options.danger !== false,
      onConfirm
    }]);
    return id;
  }, []);

  const toast = {
    success: (msg, dur)            => addToast(msg, 'success', dur),
    error:   (msg, dur)            => addToast(msg, 'error',   dur),
    warning: (msg, dur)            => addToast(msg, 'warning', dur),
    info:    (msg, dur)            => addToast(msg, 'info',    dur),
    confirm: (msg, onConfirm, opts) => addConfirm(msg, onConfirm, opts)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer   toasts={toasts}     onDismiss={dismiss} />
      <ConfirmContainer confirms={confirms} onDismiss={dismissConfirm} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

/* ================================================================
   Regular Toast UI
   ================================================================ */
function ToastItem({ toast, onDismiss }) {
  const cfg = CONFIG[toast.type] || CONFIG.info;
  const { Icon } = cfg;
  return (
    <div className="toast-item" style={{ borderColor: cfg.border, background: cfg.bg }}>
      <div className="toast-progress" style={{ background: cfg.bar, animationDuration: `${toast.duration}ms` }} />
      <span className="toast-icon" style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, color: cfg.color }}>
        <Icon style={{ width: 13, height: 13 }} />
      </span>
      <span className="toast-message" style={{ color: '#1E293B' }}>{toast.message}</span>
      <button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
        <X style={{ width: 12, height: 12 }} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  );
}

/* ================================================================
   Confirm Dialog UI
   ================================================================ */
function ConfirmItem({ confirm, onDismiss }) {
  const handleConfirm = () => {
    confirm.onConfirm?.();
    onDismiss(confirm.id);
  };
  const handleCancel = () => onDismiss(confirm.id);

  return (
    /* Full-screen backdrop */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(15,23,42,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 20,
          padding: '28px 28px 24px',
          width: '100%', maxWidth: 380,
          boxShadow: 'var(--shadow-xl)',
          animation: 'scale-in 0.18s cubic-bezier(0.16,1,0.3,1) both'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: confirm.danger ? '#FEE2E2' : '#DBEAFE',
          display: 'grid', placeItems: 'center',
          marginBottom: 16
        }}>
          {confirm.danger
            ? <Trash2 style={{ width: 20, height: 20, color: '#EF4444' }} />
            : <Info   style={{ width: 20, height: 20, color: '#3B82F6' }} />
          }
        </div>

        {/* Message */}
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-text)', marginBottom: 8, lineHeight: 1.4 }}>
          {confirm.message}
        </p>
        <p style={{ fontSize: 13, color: 'var(--c-text-3)', marginBottom: 24, lineHeight: 1.5 }}>
          {confirm.danger ? 'This action cannot be undone.' : 'Please confirm to proceed.'}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '9px 20px', borderRadius: 10,
              border: '1px solid var(--c-border)',
              background: 'var(--c-surface)',
              color: 'var(--c-text-2)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'background 0.12s'
            }}
          >
            {confirm.cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '9px 20px', borderRadius: 10,
              border: 'none',
              background: confirm.danger ? '#EF4444' : 'var(--c-primary)',
              color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background 0.12s, transform 0.1s'
            }}
          >
            {confirm.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmContainer({ confirms, onDismiss }) {
  if (!confirms.length) return null;
  // Show only the latest confirm on top
  const latest = confirms[confirms.length - 1];
  return <ConfirmItem confirm={latest} onDismiss={onDismiss} />;
}
