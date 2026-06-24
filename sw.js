// sw.js - Adaptador Scramjet con Bypass CORP
const SCRAMJET_BACKEND = 'https://proxy.budsin.dev/scram/';

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    if (requestUrl.includes('proxy.budsin.dev') || requestUrl.includes('cdnjs.cloudflare.com')) {
        return;
    }

    if (requestUrl.includes('/scram/')) {
        const urlParts = requestUrl.split('/scram/');
        if (urlParts.length > 1 && urlParts[1]) {
            const scramjetTarget = SCRAMJET_BACKEND + urlParts[1];
            
            // Determinamos si es una imagen o una petición de datos (API)
            // Las imágenes a veces requieren modo 'no-cors' si el servidor remoto es estricto
            const isImage = requestUrl.endsWith('.webp') || requestUrl.endsWith('.png') || requestUrl.endsWith('.jpg');

            event.respondWith(
                fetch(scramjetTarget, {
                    method: event.request.method,
                    headers: event.request.headers,
                    body: event.request.method !== 'GET' && event.request.method !== 'HEAD' ? event.request.blob() : null,
                    mode: isImage ? 'no-cors' : 'cors', // Mitiga el error CORP en elementos multimedia
                    credentials: 'omit'
                }).catch(err => {
                    console.error('Error en el enrutamiento Scramjet SW:', err);
                    return new Response('Error en el túnel Scramjet.', { status: 502 });
                })
            );
        }
    }
});
