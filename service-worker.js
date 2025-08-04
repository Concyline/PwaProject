
const CACHE_NAME = 'meuapp-cache-v9';

const urlsToCache = [
    '/',                     // raiz
    '/index.html',           // SPA principal
    '/offline.html',         // página para quando estiver offline
    '/manifest.json',
    '/img/icon-256.png',
    '/img/icon-512.png'
];

// INSTALAÇÃO: salva os arquivos no cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting(); // força ativação imediata
});

// ATIVAÇÃO: remove caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim(); // assume controle imediatamente
});

// FETCH: intercepta requisições e serve do cache ou rede
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Se encontrar no cache, retorna
            if (response) return response;

            // Se não, tenta buscar da rede
            return fetch(event.request).catch(() => {
                // Se falhar (sem internet), e for navegação ou HTML dinâmico, mostra offline.html

                if (
                    event.request.mode === 'navigate' ||
                    event.request.headers.get('accept')?.includes('text/html')
                ) {
                    return caches.match('/offline.html');
                }
            });
        })
    );
});
