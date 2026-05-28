import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const icons = {
  success: <CheckCircle size={18} color="var(--color-success)" />,
  error: <XCircle size={18} color="var(--color-danger)" />,
  warning: <AlertCircle size={18} color="var(--color-warning)" />,
  info: <Info size={18} color="var(--color-info)" />,
};

const colors = {
  success: 'var(--color-success-light)',
  error: 'var(--color-danger-light)',
  warning: 'var(--color-warning-light)',
  info: 'var(--color-info-light)',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 'var(--z-toast)' as any, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380 }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            style={{
              background: colors[toast.type],
              border: `1px solid`,
              borderColor: toast.type === 'success' ? 'var(--color-success)' : toast.type === 'error' ? 'var(--color-danger)' : toast.type === 'warning' ? 'var(--color-warning)' : 'var(--color-info)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {icons[toast.type]}
            <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 500 }}>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--color-muted)' }}>
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
