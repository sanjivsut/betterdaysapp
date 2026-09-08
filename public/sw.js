/* Better Days service worker — app-shell caching + installability.
   Intentionally dependency-free and small to keep PWA load fast. */

const VERSION = 'bd-v2';
const APP_SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

// Registered as /sw.js?mode=dev during `next dev` — skip all caching so stale
// build output / HMR is never served, but keep a fetch handler for offline
// navigations (and so the app still counts as installable).
const DEV = self.location.search.indexOf('mode=dev') !== -1;

// Minimal shell so the app is installable and opens offline. Only URLs that
// return 200 without a session — auth-gated paths would fail the precache.
const SHELL_URLS = ['/', '/offline', '/manifest.webmanifest'];

// Last-resort HTML if even /offline isn't in the cache — the user is never
// shown a blank page.
const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline — Better Days</title>
<style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#f7f6f4;color:#1f1b18;text-align:center;padding:24px}
h1{font-size:20px;margin:0}p{color:#5c554e;font-size:14px;max-width:22rem;margin:0}
button{margin-top:8px;border:1px solid #e7e3de;background:#fff;border-radius:999px;padding:8px 16px;font-size:14px;cursor:pointer}</style>
</head><body>
<svg width="44" height="56" viewBox="0 0 49 76" fill="#e8734a" style="opacity:.6"><path d="M25 0 C 11 21, 0 36, 3 56 C 5 68, 16 76, 25 76 C 34 76, 45 68, 47 56 C 49 46, 42 38, 39 41 C 39 50, 32 55, 28 50 C 23 43, 28 34, 19 23 C 14 32, 10 37, 10 42 C 5 37, 10 23, 25 0 Z"/></svg>
<h1>You're offline</h1>
<p>Turn on Wi-Fi or mobile data. This page reloads itself the moment you're back online.</p>
<button onclick="location.reload()">Try again</button>
<script>addEventListener('online',function(){location.reload()});</script>
</body></html>`;

function offlineResponse() {
  return caches
    .match('/offline')
    .then(
      (res) =>
        res ||
        new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
    );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL)
      .then((cache) =>
        // add individually so one failure doesn't drop the whole precache
        Promise.all(
          SHELL_URLS.map((u) => cache.add(u).catch(() => undefined)),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache the API — always hit the network.
  if (url.pathname.startsWith('/api/')) return;

  // Dev: don't cache anything; only give navigations an offline fallback.
  if (DEV) {
    if (request.mode === 'navigate') {
      event.respondWith(fetch(request).catch(() => offlineResponse()));
    }
    return;
  }

  // Navigations: network-first, fall back to a previously cached copy of this
  // page, then the offline page (never blank).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || offlineResponse()),
        ),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

// Web Push — display the notification. Delivery/scheduling is stubbed for now.
self.addEventListener('push', (event) => {
  let data = { title: 'Better Days', body: 'Time to check in on your habits.' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/app/dashboard' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/app/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(target));
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    }),
  );
});
