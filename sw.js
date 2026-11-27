// Offline: every app file is cached on install, and the app is served from the cache, so it opens
// and saves with no signal. A new version (SW_VERSION below) makes a new cache and drops the old one.
// SW_VERSION: the release version, kept equal to version.js (dev/sw.test.mjs fails if they differ). It is here so that the
// bytes of sw.js change with every release: iOS Safari updates a service worker only when sw.js itself changes, not when
// only an imported script (version.js) changes (found 27-Nov-2026). Every release changes the version in BOTH files.
const SW_VERSION = "1.8.0";
importScripts("./version.js");
// Cache name from SW_VERSION, not from version.js: the imported version.js can come from the browser's HTTP cache
// (GitHub Pages max-age=600) and name the new cache after the old version (seen 27-Nov-2026). Owner's "yes", 27-Nov-2026.
const CACHE = "rope-record-" + SW_VERSION;
const FILES = ["./", "./index.html", "./styles.css", "./version.js", "./calc.js", "./app.js", "./calculator.js", "./makers.json", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./icons/acumen-logo.png", "./icons/apple-touch-icon.png", "./vendor/qrcode.js"];

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
