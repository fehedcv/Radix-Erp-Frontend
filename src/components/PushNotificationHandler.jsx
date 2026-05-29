import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useNotification } from '../context/NotificationContext';
import { initializePushNotifications } from '../services/pushNotifications';
import { initializeWebPush } from '../services/webPush';

/**
 * Mounts inside <BrowserRouter> so it has access to useNavigate.
 * Initializes push notifications once the user is authenticated.
 * Handles web service-worker navigation messages.
 *
 * Props:
 *   userId {string} — authenticated user's id; pass null/undefined to skip init
 */
const PushNotificationHandler = ({ userId }) => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const initCalledRef = useRef(false);

  // Initialize push for the authenticated user
  useEffect(() => {
    if (!userId || initCalledRef.current) return;
    initCalledRef.current = true;

    if (Capacitor.isNativePlatform()) {
      initializePushNotifications(navigate, showToast);
    } else {
      initializeWebPush(showToast);
    }
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

  return null;
};

export default PushNotificationHandler;
