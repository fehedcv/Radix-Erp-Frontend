import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useNotification } from '../context/NotificationContext';
import { initializePushNotifications } from '../services/pushNotifications';
import { initWebPushIfGranted, requestWebPushPermission } from '../services/webPush';

const DISMISSED_KEY = 'notif_prompt_dismissed';

/**
 * Mounts inside <BrowserRouter> so it has access to useNavigate.
 * Initializes push notifications once the user is authenticated.
 * On web, shows a permission prompt banner when permission is 'default'.
 * The actual Notification.requestPermission() call lives inside the banner's
 * button onClick — browsers require it to be inside a user gesture.
 */
const PushNotificationHandler = ({ userId }) => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const initCalledRef = useRef(false);

  // Only show the banner on web, when logged in, and permission not yet decided
  const [showBanner, setShowBanner] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!userId || initCalledRef.current) return;
    initCalledRef.current = true;

    if (Capacitor.isNativePlatform()) {
      initializePushNotifications(navigate, showToast);
      return;
    }

    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      // Already granted — silently init FCM, no prompt needed
      initWebPushIfGranted(showToast);
    } else if (Notification.permission === 'default') {
      // Show the banner only if the user hasn't dismissed it this session
      const dismissed = sessionStorage.getItem(DISMISSED_KEY);
      if (!dismissed) setShowBanner(true);
    }
    // 'denied' — do nothing, user must change browser settings manually
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle FCM_NAVIGATE messages from the service worker (web background taps)
  useEffect(() => {
    if (Capacitor.isNativePlatform() || !('serviceWorker' in navigator)) return;

    const handleSwMessage = (event) => {
      if (event.data?.type === 'FCM_NAVIGATE' && event.data?.route) {
        navigate(event.data.route);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSwMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
  }, [navigate]);

  // Called from button onClick — this IS the user gesture the browser requires
  const handleEnable = async () => {
    setRequesting(true);
    try {
      const result = await requestWebPushPermission(showToast);
      if (result === 'granted' || result === 'denied') {
        setShowBanner(false);
        sessionStorage.setItem(DISMISSED_KEY, '1');
      }
    } finally {
      setRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem(DISMISSED_KEY, '1');
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-9998 w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug">
                  Enable Notifications
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Get alerts for new leads and payments.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleEnable}
                  disabled={requesting}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {requesting ? 'Asking…' : 'Allow'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PushNotificationHandler;
