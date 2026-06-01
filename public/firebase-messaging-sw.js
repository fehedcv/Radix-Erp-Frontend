/**
 * Firebase Cloud Messaging Service Worker
 *
 * SETUP REQUIRED:
 * Replace the placeholder values below with your Firebase project config.
 * These values come from Firebase Console → Project Settings → General → Your Apps.
 * Firebase client config is NOT secret — it is safe to commit.
 *
 * Matching env vars in your .env file:
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCYKU7R_zLOVNQgUMcw8P7D8wRQwRWddM0",

  authDomain: "radix-81e11.firebaseapp.com",

  projectId: "radix-81e11",

  storageBucket: "radix-81e11.firebasestorage.app",

  messagingSenderId: "331888105358",

  appId: "1:331888105358:web:cac62306e46fe51e7ef6df",

  measurementId: "G-JVECS3BD39"

});

const messaging = firebase.messaging();

// Handle background messages (app is closed or in background tab)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received');

  const title = payload.notification?.title || 'New Notification';
  const body = payload.notification?.body || '';
  const route = payload.data?.route || null;

  const options = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: { route },
    requireInteraction: false,
  };

  self.registration.showNotification(title, options);
});

// Handle notification click — navigate to route inside the open app or open a new window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const route = event.notification.data?.route;
  if (!route) return;

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to use an existing open window
        for (const client of clientList) {
          if ('navigate' in client && 'focus' in client) {
            // Post message so the React app can handle navigation via react-router
            client.postMessage({ type: 'FCM_NAVIGATE', route });
            return client.focus();
          }
        }
        // No existing window — open a new one
        return clients.openWindow(route);
      })
  );
});
