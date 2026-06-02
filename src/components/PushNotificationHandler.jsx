import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X, Share, PlusSquare, Download } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { useNotification } from '../context/NotificationContext';
import { initializePushNotifications } from '../services/pushNotifications';
import { initWebPushIfGranted, requestWebPushPermission } from '../services/webPush';
import { supabase } from '../supabase/supabaseClient';

const NOTIF_DISMISSED_KEY = 'notif_prompt_dismissed';
const INSTALL_DISMISSED_KEY = 'install_prompt_dismissed';

// True when the app is already running as an installed PWA
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

// True on iOS Safari (not Chrome/Firefox on iOS — those can't install PWAs)
const isIosSafari = () => {
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);
  return isIos && isSafari;
};

/**
 * Mounts inside <BrowserRouter> so it has access to useNavigate.
 *
 * Handles three things:
 *  1. Initializes push notifications once authenticated
 *  2. Shows a notification permission banner (web only, 'default' state)
 *  3. Shows a PWA install banner:
 *       - Android/Chrome: intercepts beforeinstallprompt so we control the timing
 *       - iOS Safari:     shows manual Share → Add to Home Screen instructions
 *         (iOS has no install API; the user must do it manually)
 */
const PushNotificationHandler = ({ userId }) => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const initCalledRef = useRef(false);

  const [showNotifBanner, setShowNotifBanner] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Android/Chrome: the deferred install event
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showAndroidInstall, setShowAndroidInstall] = useState(false);

  // iOS Safari: manual instructions
  const [showIosInstall, setShowIosInstall] = useState(false);

  // ── Push notification init ────────────────────────────────────────────────

  useEffect(() => {
    if (!userId || initCalledRef.current) return;
    initCalledRef.current = true;

    if (Capacitor.isNativePlatform()) {
      initializePushNotifications(navigate, showToast);
      return;
    }

    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      initWebPushIfGranted(showToast);
    } else if (Notification.permission === 'default') {
      if (!sessionStorage.getItem(NOTIF_DISMISSED_KEY)) setShowNotifBanner(true);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── PWA install prompt ────────────────────────────────────────────────────

  useEffect(() => {
    // Skip if already installed as a PWA or running inside Capacitor native shell
    if (isStandalone() || Capacitor.isNativePlatform()) return;
    if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;

    // Android/Chrome — intercept the browser's automatic prompt so we can
    // show it at a better moment (after login, not on first page load)
    const handleBeforeInstall = (e) => {
      e.preventDefault(); // suppress the automatic browser mini-bar
      setInstallPrompt(e);
      setShowAndroidInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // iOS Safari — no install event exists; show manual instructions instead
    if (isIosSafari()) {
      setShowIosInstall(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // ── Service worker navigation messages ───────────────────────────────────

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

  // Handle deep links on Android (com.radix.app://reset-password#access_token=...)
  // Supabase sends password reset emails with this custom scheme on native builds.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener;
    CapApp.addListener('appUrlOpen', async ({ url }) => {
      if (!url.includes('reset-password')) return;

      // Tokens are in the URL hash or query string
      const hashPart = url.split('#')[1] ?? url.split('?')[1] ?? '';
      const params = new URLSearchParams(hashPart);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Restore the recovery session so updateUser() works on the reset page
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }

      navigate('/reset-password', { replace: true });
    }).then(l => { listener = l; });

    return () => { listener?.remove(); };
  }, [navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEnableNotif = async () => {
    setRequesting(true);
    try {
      const result = await requestWebPushPermission(showToast);
      if (result === 'granted' || result === 'denied') {
        setShowNotifBanner(false);
        sessionStorage.setItem(NOTIF_DISMISSED_KEY, '1');
      }
    } finally {
      setRequesting(false);
    }
  };

  const handleDismissNotif = () => {
    setShowNotifBanner(false);
    sessionStorage.setItem(NOTIF_DISMISSED_KEY, '1');
  };

  const handleInstallAndroid = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstallPrompt(null);
    setShowAndroidInstall(false);
    if (outcome === 'dismissed') localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
  };

  const handleDismissInstall = () => {
    setShowAndroidInstall(false);
    setShowIosInstall(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
  };

  // ── UI ────────────────────────────────────────────────────────────────────

  const bannerBase =
    'fixed bottom-6 left-1/2 -translate-x-1/2 z-9998 w-[calc(100%-2rem)] max-w-sm';

  return (
    <>
      {/* ── Android install banner ── */}
      <AnimatePresence>
        {showAndroidInstall && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={bannerBase}
          >
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Download className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Install App</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Add Radix to your home screen for faster access.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleInstallAndroid}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80 transition-opacity"
                >
                  Install
                </button>
                <button onClick={handleDismissInstall} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" aria-label="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── iOS install banner ── */}
      <AnimatePresence>
        {showIosInstall && !showAndroidInstall && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={bannerBase}
          >
            <div className="flex flex-col gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <PlusSquare className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">Install App</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Add to your home screen for the best experience.</p>
                  </div>
                </div>
                <button onClick={handleDismissInstall} className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" aria-label="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* iOS-specific instructions — Safari's Share sheet is the only way */}
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2">
                <span>Tap</span>
                <Share className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Share</span>
                <span>then</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">"Add to Home Screen"</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notification permission banner (shown above install banners) ── */}
      <AnimatePresence>
        {showNotifBanner && !showAndroidInstall && !showIosInstall && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={bannerBase}
          >
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Enable Notifications</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Get alerts for new leads and payments.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleEnableNotif}
                  disabled={requesting}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {requesting ? 'Asking…' : 'Allow'}
                </button>
                <button onClick={handleDismissNotif} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" aria-label="Dismiss">
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
