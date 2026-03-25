const CACHE_NAME = 'iptv-pwa-dynamic-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Instalación: Guarda los archivos iniciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activación: Limpia rastros de versiones viejas si las hubiera
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Interceptar peticiones (ESTRATEGIA: Network First)
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // REGLA DE ORO: Nunca cachear los videos ni las llamadas a la API de IPTV
  if (requestUrl.includes('player_api.php') || 
      requestUrl.endsWith('.m3u8') || 
      requestUrl.endsWith('.ts') || 
      requestUrl.endsWith('.mp4') || 
      requestUrl.endsWith('.mkv')) {
      return; // Deja que la petición pase directo a internet sin intervenir
  }

  // Para tu HTML, CSS, JS e Iconos:
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // A. Si hay internet: Devuelve lo más nuevo de GitHub y guarda una copia fresca en el caché
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // B. Si NO hay internet: Busca en el caché la última copia que guardó
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si por algún motivo extremo falla todo y es una navegación de página, fuerza el index
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});