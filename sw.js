const CACHE = 'weight-tracker-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Запросы к Supabase не кэшируем — данные всегда должны быть свежими
  if (url.hostname.endsWith('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (e.request.method === 'GET' && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});