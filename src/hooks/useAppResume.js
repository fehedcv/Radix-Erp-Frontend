import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Fires `callback` every time the app returns to the foreground.
 *
 * Architecture:
 *   Native — App.jsx listens to Capacitor appStateChange and dispatches the
 *             custom 'app-resume' DOM event. This hook listens for that event.
 *             Individual pages don't need Capacitor imports.
 *   Web    — listens to document visibilitychange directly.
 *
 * The callback ref is updated on every render — no useCallback needed.
 */
const useAppResume = (callback) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // App.jsx dispatches 'app-resume' from its appStateChange handler.
      // Listening here keeps pages decoupled from Capacitor APIs.
      const handler = () => {
        console.log('[useAppResume] app-resume event received');
        callbackRef.current?.();
      };
      window.addEventListener('app-resume', handler);
      return () => window.removeEventListener('app-resume', handler);
    }

    // Web fallback
    const handler = () => {
      if (document.visibilityState === 'visible') {
        callbackRef.current?.();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

// Re-export App listener helper for App.jsx to set up the source
export const initAppResumeListener = () => {
  if (!Capacitor.isNativePlatform()) return () => {};

  let handle = null;
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      window.dispatchEvent(new CustomEvent('app-resume'));
    }
  }).then((h) => { handle = h; });

  return () => handle?.remove();
};

export default useAppResume;
