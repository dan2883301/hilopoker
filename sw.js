/* Offline copy of the game. Network first, so a re-uploaded version shows up as soon as you're online.
   Only a real, successful reply from the site is used or saved: if the site is down, gone or returns an error page (404 etc.), the saved copy is used instead and is never overwritten by the error. */
const CACHE = "hilo-app-v2";
const FILES = ["./", "./index.html", "./desktop.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => fetch(f, {cache:"reload"}).then(r => { if (r.ok) return c.put(f, r); })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }
      return caches.match(e.request).then(m => m || r);
    }).catch(() => caches.match(e.request).then(m => m || caches.match("./index.html")))
  );
});
