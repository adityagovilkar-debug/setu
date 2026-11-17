// Keeps a copy of the app on the device so it opens without internet after the first visit.
// Online: always fetch the newest files. Offline: use the saved copy.
const CACHE = 'setu-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('message', (e) => {
  const list = e.data && e.data.cache;
  if (Array.isArray(list)) e.waitUntil(caches.open(CACHE).then((c) => Promise.all(list.map((u) => c.add(u).catch(() => {})))));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./')))
  );
});
