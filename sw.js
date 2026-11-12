
const CACHE_NAME = "nbe-tools-v139";

const FILES_TO_CACHE = [
  "/-nbe-sales/",
  "/-nbe-sales/index.html",
  "/-nbe-sales/iscore.html",
  "/-nbe-sales/rates.html",
  "/-nbe-sales/certificates.html",
  "/-nbe-sales/certificates-i18n.js",
  "/-nbe-sales/manifest.json",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(FILES_TO_CACHE)
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => (key.startsWith("nbe-sales-") || key.startsWith("nbe-tools-")) && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, copy)
          );
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
