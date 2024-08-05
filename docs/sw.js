const CACHE_NAME = 'pokemon-cache-v1';
const urlsToCache = [
  '/',
  '/docs/index.html',
  '/docs/styles.css',
  '/docs/script.js',
  '/docs/sw.js',
  'https://cdn.jsdelivr.net/npm/dexie@3.2.0/dist/dexie.min.js'
];

// Adiciona URLs das imagens dos Pokémon ao cache
for (let id = 152; id <= 251; id++) {
    urlsToCache.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`);
}

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se a resposta existir no cache, retorna a resposta
                if (response) {
                    return response;
                }
                // Caso contrário, faz a requisição normal
                return fetch(event.request).then(
                    response => {
                        // Verifica se a resposta é válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        // Clona a resposta
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
