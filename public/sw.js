// Devi Real Estates Service Worker
// Imports push and notification click handler
importScripts('/sw-push-handler.js');

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});
