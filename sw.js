// Offline: every app file is cached on install, and the app is served from the cache, so it opens
// and saves with no signal. A new version (version.js) makes a new cache and drops the old one.
importScripts("./version.js");
const CACHE = "rope-record-" + self.RR_VERSION.version;
const FILES = ["./", "./index.html", "./styles.css", "./version.js", "./calc.js", "./app.js", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("rope-record-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit
      || (req.mode === "navigate" ? caches.match("./index.html") : null)
      || fetch(req))
  );
});
