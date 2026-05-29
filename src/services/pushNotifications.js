import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../supabase/supabaseClient';

let _isInitialized = false;
let _currentToken = null;

/**
 * Initializes FCM push notifications for Android (Capacitor native).
 *
 * @param {function} navigate  - react-router navigate() for routing from notification tap
 * @param {function} showToast - toast callback({ title, body, data }) for foreground display
 */
export const initializePushNotifications = async (navigate, showToast) => {
  if (!Capacitor.isNativePlatform()) return;
  if (_isInitialized) return;

  try {
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.warn('[Push] Permission denied by user');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      _currentToken = token.value;
      console.log('[Push] FCM token received');

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('[Push] No authenticated user when saving token:', userError?.message);
          return;
        }

        const { error } = await supabase
          .from('push_tokens')
          .upsert(
            { user_id: user.id, token: token.value, platform: 'android' },
            { onConflict: 'token' }
          );

        if (error) {
          console.error('[Push] Failed to save token:', error.message);
        } else {
          console.log('[Push] Token saved successfully');
        }
      } catch (err) {
        console.error('[Push] Error saving token:', err);
      }
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] FCM registration error:', err.error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Foreground notification received');
      if (showToast) {
        showToast({
          title: notification.title,
          body: notification.body,
          data: notification.data,
        });
      }
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[Push] Notification tapped');
      const route = action.notification?.data?.route;
      if (route && navigate) {
        navigate(route);
      }
    });

    _isInitialized = true;
    console.log('[Push] Android push notifications initialized');
  } catch (err) {
    console.error('[Push] Initialization failed:', err);
  }
};

/**
 * Removes the current device token from push_tokens and resets state.
 * Call on user logout.
 */
export const cleanupPushNotifications = async () => {
  if (!_currentToken) return;

  try {
    await supabase
      .from('push_tokens')
      .delete()
      .eq('token', _currentToken);

    console.log('[Push] Token removed on logout');
  } catch (err) {
    console.warn('[Push] Failed to remove token on logout:', err);
  } finally {
    _currentToken = null;
    _isInitialized = false;
  }
};
