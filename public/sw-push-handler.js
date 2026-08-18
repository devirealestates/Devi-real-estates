// Devi Real Estates - Service Worker Push & Notification Click Handler
// This script runs inside the Service Worker to receive real OS device notifications

self.addEventListener('push', function (event) {
  let notificationData = {
    title: 'Devi Real Estates',
    body: 'You have a new update from Devi Real Estates.',
    icon: '/pwa-192x192.png',
    badge: '/favicon.png',
    data: { url: '/' },
    tag: 'dre-general-' + Date.now(),
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      notificationData = {
        ...notificationData,
        ...parsed,
        data: {
          url: parsed.url || parsed.destinationUrl || (parsed.data && parsed.data.url) || '/',
          ...parsed.data,
        },
      };
    } catch (e) {
      try {
        notificationData.body = event.data.text();
      } catch (err) {}
    }
  }

  const title = notificationData.title || 'Devi Real Estates';
  const options = {
    body: notificationData.body || notificationData.message || 'You have a new update from Devi Real Estates.',
    icon: notificationData.icon || '/pwa-192x192.png',
    badge: notificationData.badge || '/favicon.png',
    data: notificationData.data || { url: '/' },
    tag: notificationData.tag || 'dre-update-' + Date.now(),
    renotify: true,
    vibrate: [200, 100, 200],
  };

  if (notificationData.image) {
    options.image = notificationData.image;
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // If a tab is already open with our site, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', function (event) {
  console.log('[SW] Push subscription expired or changed');
});
