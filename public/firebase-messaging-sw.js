// Official Firebase Cloud Messaging (FCM) Service Worker for Devi Real Estates
// Handles background push notifications when the app/PWA is closed or running in background

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCeM9qLBU7BevplyqW9m6u9KJHKzfe4DNc",
  authDomain: "devirealestates-a550f.firebaseapp.com",
  projectId: "devirealestates-a550f",
  storageBucket: "devirealestates-a550f.firebasestorage.app",
  messagingSenderId: "33925963339",
  appId: "1:33925963339:web:674ffbb087ccb83d4477ce",
});

const messaging = firebase.messaging();

// Handle background notification delivery
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  const title =
    payload.notification?.title ||
    payload.data?.title ||
    'Devi Real Estates Update';

  const body =
    payload.notification?.body ||
    payload.data?.body ||
    payload.data?.message ||
    'A new update is available on Devi Real Estates.';

  const icon =
    payload.notification?.icon ||
    payload.data?.icon ||
    '/pwa-192x192.png';

  const targetUrl =
    payload.data?.url ||
    payload.fcmOptions?.link ||
    payload.notification?.click_action ||
    '/';

  const notificationOptions = {
    body: body,
    icon: icon,
    badge: '/favicon.png',
    data: {
      url: targetUrl,
      timestamp: Date.now(),
    },
    vibrate: [200, 100, 200],
    tag: payload.data?.tag || 'fcm-dre-' + Date.now(),
    renotify: true,
  };

  if (payload.notification?.image || payload.data?.image) {
    notificationOptions.image = payload.notification?.image || payload.data?.image;
  }

  return self.registration.showNotification(title, notificationOptions);
});

// Handle tap/click on background notification to open PWA to deep-linked page
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl =
    (event.notification.data && event.notification.data.url)
      ? event.notification.data.url
      : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
