self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }

  const title = data.title || 'OWLS Vision';
  const body = data.body || '';
  const view = data.view || 'accueil';

  const options = {
    body,
    icon: 'icon-192.png',
    badge: 'favicon-32.png',
    data: { view },
    tag: view,
    renotify: true,
  };

  event.waitUntil((async () => {
    await self.registration.showNotification(title, options);
    try {
      if (typeof self.setAppBadge === 'function') {
        await self.setAppBadge();
      } else if (self.navigator && typeof self.navigator.setAppBadge === 'function') {
        await self.navigator.setAppBadge();
      }
    } catch (e) {}
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const view = (event.notification.data && event.notification.data.view) || 'accueil';
  const targetUrl = new URL('./index.html?n=' + encodeURIComponent(view), self.registration.scope).href;

  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) {
        client.postMessage({ type: 'ov-navigate', view });
        return client.focus();
      }
    }
    if (self.clients.openWindow) {
      return self.clients.openWindow(targetUrl);
    }
  })());
});
