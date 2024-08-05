const CACHE_NAME = 'pokemon-cache-v1';
const urlsToCache = [
  '/DM1222---PWA/',
  '/DM1222---PWA/index.html',
  '/DM1222---PWA/styles.css',
  '/DM1222---PWA/script.js',
  '/DM1222---PWA/sw.js',
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
                return cache.addAll(urlsToCache)
                    .catch(error => {
                        console.error('Falha ao adicionar arquivos ao cache:', error);
                        // Para identificar quais URLs estão falhando, adicione um log específico para cada URL
                        urlsToCache.forEach(async (url) => {
                            try {
                                await fetch(url);
                            } catch (e) {
                                console.error('Falha ao buscar o recurso:', url, e);
                            }
                        });
                    });
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
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
