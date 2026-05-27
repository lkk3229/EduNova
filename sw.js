/* ============================================
   EduNova — Service Worker (PWA)
   Enables offline access + app install
   ============================================ */

const CACHE_NAME = 'edunova-v1.0.0';
const STATIC_CACHE = 'edunova-static-v1.0.0';
const DYNAMIC_CACHE = 'edunova-dynamic-v1.0.0';

// Core shell files — always cached
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/courses.html',
    '/login.html',
    '/register-student.html',
    '/register-teacher.html',
    '/student-dashboard.html',
    '/teacher-dashboard.html',
    '/meeting.html',
    '/library.html',
    '/english-speaking.html',
    '/css/style.css',
    '/css/animations.css',
    '/css/dashboard.css',
    '/css/responsive.css',
    '/css/chatbot.css',
    '/css/meeting.css',
    '/css/library.css',
    '/css/english-speaking.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/courses.js',
    '/js/dashboard.js',
    '/js/currency.js',
    '/js/chatbot.js',
    '/js/meeting.js',
    '/js/library.js',
    '/js/library-data.js',
    '/js/student-dashboard.js',
    '/js/teacher-dashboard.js',
    '/js/certificate.js',
    '/js/english-speaking.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// ---- Install: pre-cache static shell ----
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Pre-caching static shell');
                // addAll fails if any asset 404s; use individual adds to be safe
                return Promise.allSettled(
                    STATIC_ASSETS.map(url =>
                        cache.add(url).catch(err =>
                            console.warn('[SW] Could not cache:', url, err.message)
                        )
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

// ---- Activate: purge old caches ----
self.addEventListener('activate', event => {
    const allowedCaches = [STATIC_CACHE, DYNAMIC_CACHE];
    event.waitUntil(
        caches.keys()
            .then(keys =>
                Promise.all(
                    keys
                        .filter(key => !allowedCaches.includes(key))
                        .map(key => {
                            console.log('[SW] Deleting old cache:', key);
                            return caches.delete(key);
                        })
                )
            )
            .then(() => self.clients.claim())
    );
});

// ---- Fetch: Cache-first for static, network-first for API ----
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Skip non-GET and cross-origin requests (fonts, CDN, etc.)
    if (event.request.method !== 'GET') return;
    if (url.origin !== location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) return;

    // API requests: network-first, no cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request).catch(() =>
                new Response(JSON.stringify({ error: 'You are offline. Please reconnect.' }), {
                    headers: { 'Content-Type': 'application/json' }
                })
            )
        );
        return;
    }

    // Static assets: cache-first
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) return cachedResponse;

                // Not in cache — fetch, then dynamically cache
                return fetch(event.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(DYNAMIC_CACHE).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Offline fallback for HTML navigations
                        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// ---- Push notifications (placeholder for future use) ----
self.addEventListener('push', event => {
    if (!event.data) return;
    const data = event.data.json();
    const options = {
        body: data.body || 'New update from EduNova',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' }
    };
    event.waitUntil(
        self.registration.showNotification(data.title || 'EduNova', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
