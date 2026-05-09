const CACHE_NAME = "red-servicio-gualeguay-v8-pwa";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./login-prestador.html",
  "./prestador-registro.html",
  "./prestador-panel.html",
  "./login.html",
  "./admin.html",
  "./servicios.html",
  "./css/styles.css",
  "./css/login.css",
  "./js/index.js",
  "./js/login-prestador.js",
  "./js/prestador-registro.js",
  "./js/prestador-panel.js",
  "./js/login.js",
  "./js/admin.js",
  "./js/servicios.js",
  "./js/pwa.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
  "./img/3a2974dc-daa1-4b56-8654-e9f65ea8de66.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // Firebase, Google APIs y Storage siempre se consultan online para no guardar datos sensibles ni quedar desactualizados.
  if (
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("gstatic.com") ||
    url.hostname.includes("google.com")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => cached);
    })
  );
});
