// Limited Lab service worker (build 3338a9d70581)
const APP = 'app-3338a9d70581', IMG = 'card-images-v1';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(APP).then((c) => c.addAll(['./', 'manifest.webmanifest', 'apple-touch-icon.png'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== APP && k !== IMG).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // card images: cache first (they never change)
  if (u.hostname === 'cards.scryfall.io' || u.hostname === 'svgs.scryfall.io') {
    e.respondWith(caches.open(IMG).then(async (c) => { const hit = await c.match(e.request); if (hit) return hit; const r = await fetch(e.request); if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }));
    return;
  }
  // the app itself: network first so updates arrive, cache when offline
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then((r) => { if (r.ok) caches.open(APP).then((c) => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request).then((m) => m || caches.match('./'))));
  }
});
