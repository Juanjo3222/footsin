// sw.js - Adaptador de Tráfico Scramjet para GitHub Pages
const SCRAMJET_BACKEND = 'https://proxy.budsin.dev/scram/';

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    // Ignoramos peticiones directas a dependencias globales o al propio VPS
    if (requestUrl.includes('proxy.budsin.dev') || requestUrl.includes('cdnjs.cloudflare.com')) {
        return;
    }

    // Interceptamos cualquier llamada que tenga la firma de la ruta del proxy Scramjet
    if (requestUrl.includes('/scram/')) {
        const urlParts = requestUrl.split('/scram/');
        if (urlParts.length > 1 && urlParts[1]) {
            // Mapeamos la petición directamente hacia el backend de Scramjet en tu VPS
            const scramjetTarget = SCRAMJET_BACKEND + urlParts[1];
            
            event.respondWith(
                fetch(scramjetTarget, {
                    method: event.request.method,
                    headers: event.request.headers,
                    body: event.request.method !== 'GET' && event.request.method !== 'HEAD' ? event.request.blob() : null,
                    mode: 'cors'
                }).catch(err => {
                    console.error('Error en el enrutamiento Scramjet SW:', err);
                    return new Response('Error en el túnel Scramjet de evasión hacia el VPS.', { status: 502 });
                })
            );
        }
    }
});
