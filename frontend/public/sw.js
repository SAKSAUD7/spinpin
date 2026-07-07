self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    // Claim control immediately
    e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
    // Just a passthrough fetch handler to satisfy PWA installability requirements.
    // We don't want to actually cache things heavily in the SW for this site yet
    // because Next.js handles caching via headers and the app router.
    return;
});
