/* Mi Día V6.3 — network-first for app shell, cache fallback only offline. */
const CACHE_NAME = "mi-dia-v6-3-shell";
const APP_SHELL = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("mi-dia-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Never cache API/data responses.
  const isAppAsset = request.mode === "navigate" || /\.(?:html|js|css|webmanifest|svg)$/.test(url.pathname);
  if (!isAppAsset) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const fresh = await fetch(request, {cache:"no-store"});
      if (fresh.ok) await cache.put(request, fresh.clone());
      return fresh;
    } catch (_) {
      return (await cache.match(request)) || (await cache.match("./index.html")) || Response.error();
    }
  })());
});
