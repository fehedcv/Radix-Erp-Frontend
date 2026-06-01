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
 * Core FCM setup: registers the service worker, fetches the FCM token,
 * saves it to the DB, and wires up the foreground message listener.
 *
 * Private — never call this directly. Use initWebPushIfGranted() for
 * auto-init on mount, or requestWebPushPermission() from a user click.
 */
const _initWebPushMessaging = async (showToast) => {
  if (_isInitialized) return;

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
};

/**
 * Safe to call from useEffect / component mount.
 * Silently initializes FCM only if the user has already granted permission
 * in a previous session. Never shows a permission prompt.
 *
 * @param {function} showToast - toast callback for foreground messages
 */
export const initWebPushIfGranted = async (showToast) => {
  if (_isInitialized) return;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;

  if (await isBrave()) {
    console.info('[WebPush] Skipping — Brave browser blocks FCM');
    return;
  }

  try {
    await _initWebPushMessaging(showToast);
  } catch (err) {
    console.error('[WebPush] Auto-init failed:', err);
  }
};

/**
 * Request notification permission and initialize FCM.
 *
 * ⚠️  MUST be called directly from a synchronous user-generated event handler
 * (e.g. a button's onClick). Browsers enforce that Notification.requestPermission()
 * is only callable inside a short-lived user gesture. Calling it from useEffect,
 * setTimeout, a Promise chain, or any async startup code will throw:
 * "The Notification permission may only be requested from inside a short running
 * user-generated event handler."
 *
 * @param {function} showToast - toast callback for foreground messages
 * @returns {'granted' | 'denied' | 'default' | 'unsupported'}
 */
export const requestWebPushPermission = async (showToast) => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return 'unsupported';
  }

  if (await isBrave()) {
    console.info('[WebPush] Skipping — Brave browser blocks FCM');
    return 'unsupported';
  }

  // Already fully initialized
  if (_isInitialized) return 'granted';

  // User previously blocked — browser won't show prompt; they must change browser settings
  if (Notification.permission === 'denied') return 'denied';

  // Already granted from a previous session — just run init, no prompt needed
  if (Notification.permission === 'granted') {
    try {
      await _initWebPushMessaging(showToast);
    } catch (err) {
      console.error('[WebPush] Init after granted permission failed:', err);
    }
    return 'granted';
  }

  // 'default' — ask the user. This line is only valid inside a user gesture.
  let permission;
  try {
    permission = await Notification.requestPermission();
  } catch (err) {
    console.error('[WebPush] Permission request failed:', err);
    return 'default';
  }

  if (permission !== 'granted') {
    console.warn('[WebPush] Permission not granted:', permission);
    return permission;
  }

  try {
    await _initWebPushMessaging(showToast);
  } catch (err) {
    console.error('[WebPush] Init after permission grant failed:', err);
  }
  return 'granted';
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
