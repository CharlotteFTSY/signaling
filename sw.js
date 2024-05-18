const CACHE_NAME = 'offline-cache-v1';
const urlsToCache = [
  '/signaling/index.html',
  '/signaling/sw.js',
  '/signaling/',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // 跳过等待状态，立即激活新的 Service Worker
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 检查缓存中是否有匹配的资源，如果有则直接返回缓存的资源
        if (response) {
          return response;
        }

        // 如果缓存中没有匹配的资源，则通过网络请求获取最新的资源
        return fetch(event.request)
          .then(response => {
            // 检查是否成功获取到资源，如果成功则将资源添加到缓存中并返回给页面
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// 当新的 Service Worker 安装完成后，立即激活新的 Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
