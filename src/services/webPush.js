import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { getFirebaseMessaging } from '../firebase/firebase';
import { supabase } from '../supabase/supabaseClient';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let _isInitialized = false;
let _currentToken = null;
let _unsubscribe = null;

const isBrave = async () => {
  try {
    return !!(navigator.brave && await navigator.brave.isBrave());
  } catch {
    return false;
  }
};

/**
 * Initializes Firebase Cloud Messaging for web browsers.
 * Skipped on Brave — Brave Shields block Google's FCM CDN causing the
 * service worker to hang on install, which freezes the app.
 *
 * @param {function} showToast - toast callback({ title, body, data }) for foreground display
 */
export const initializeWebPush = async (showToast) => {
  if (_isInitialized) return;

  try {
    if (await isBrave()) {
      console.info('[WebPush] Skipping — Brave browser blocks FCM');
      return;
    }

    if (!('Notification' in window)) {
      console.warn('[WebPush] Browser does not support notifications');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('[WebPush] Service workers not supported');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[WebPush] Permission denied by user');
      return;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('[WebPush] Firebase Messaging not supported in this environment');
      return;
    }

    let swRegistration;
    try {
      swRegistration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/' }
      );
      console.log('[WebPush] Service worker registered');
    } catch (err) {
      console.error('[WebPush] Service worker registration failed:', err);
      return;
    }

    let token;
    try {
      token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });
    } catch (err) {
      console.error('[WebPush] Failed to get FCM token:', err);
      return;
    }

    if (!token) {
      console.warn('[WebPush] No registration token available');
      return;
    }

    _currentToken = token;
    console.log('[WebPush] FCM token received');

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[WebPush] No authenticated user when saving token:', userError?.message);
      return;
    }

    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        { user_id: user.id, token, platform: 'web' },
        { onConflict: 'token' }
      );

    if (error) {
      console.error('[WebPush] Failed to save token:', error.message);
    } else {
      console.log('[WebPush] Token saved successfully');
    }

    _unsubscribe = onMessage(messaging, (payload) => {
      console.log('[WebPush] Foreground message received');
      if (showToast) {
        showToast({
          title: payload.notification?.title,
          body: payload.notification?.body,
          data: payload.data,
        });
      }
    });

    _isInitialized = true;
    console.log('[WebPush] Web push initialized');
  } catch (err) {
    console.error('[WebPush] Initialization failed:', err);
  }
};

/**
 * Deletes the current browser token from FCM and push_tokens table.
 * Call on user logout.
 */
export const cleanupWebPush = async () => {
  if (_unsubscribe) {
    try { _unsubscribe(); } catch {}
    _unsubscribe = null;
  }

  try {
    const messaging = await getFirebaseMessaging();
    if (messaging) await deleteToken(messaging);
  } catch (err) {
    console.warn('[WebPush] Failed to delete FCM token:', err);
  }

  if (_currentToken) {
    try {
      await supabase.from('push_tokens').delete().eq('token', _currentToken);
      console.log('[WebPush] Token removed on logout');
    } catch (err) {
      console.warn('[WebPush] Failed to remove token from DB:', err);
    }
  }

  _currentToken = null;
  _isInitialized = false;
};
