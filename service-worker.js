const CACHE_NAME = 'library-catalog-v3';
const ASSETS_TO_CACHE = [
  '.',
  'index.html',
  'admin.html',
  'manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// تفعيل
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// استراتيجية: الشبكة أولاً، ثم الكاش
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/') || event.request.url.includes('chrome-extension')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});