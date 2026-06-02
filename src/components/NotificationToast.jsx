import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const Toast = ({ id, title, body, onDismiss }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: 80, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 80, scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    className="flex items-start gap-3 w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4 pointer-events-auto"
  >
    <img src="/pwa-192x192.png" alt="" className="flex-shrink-0 w-8 h-8 rounded-full object-cover mt-0.5" />

    <div className="flex-1 min-w-0">
      {title && (
        <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug">
          {title}
        </p>
      )}
      {body && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed line-clamp-3">
          {body}
        </p>
      )}
    </div>

    <button
      onClick={() => onDismiss(id)}
      className="flex-shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mt-0.5"
      aria-label="Dismiss notification"
    >
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

const NotificationToast = () => {
  const { toasts, dismissToast } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={dismissToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
