
const CACHE_NAME = "notetaker-cache-v1";
const DATA_CACHE_NAME = "notedata-cache-v1";

const FILES_TO_CACHE = [
  '/',
  '/app.js',
  '/index.html',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/assets/images/icons/icon-72x72.png',
  '/assets/images/icons/icon-96x96.png',
  '/assets/images/icons/icon-128x128.png',
  '/assets/images/icons/icon-144x144.png',
  '/assets/images/icons/icon-152x152.png',
  '/assets/images/icons/icon-192x192.png',
  '/assets/images/icons/icon-384x384.png',
  '/assets/images/icons/icon-512x512.png',
];

  // install
  self.addEventListener("install", function (evt) {
    // pre cache image data
    evt.waitUntil(
      caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/all"))
      );
      
    // pre cache all static assets
    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );

    // tell the browser to activate this service worker immediately once it
    // has finished installing
    self.skipWaiting();
  });

  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );

    self.clients.claim();
  });

  self.addEventListener('fetch', function(evt) {
      if(evt.request.url.includes('/find/')) {
          console.log('[Service Worker] Fetch (data)', evt.request.url);

          evt.respondWith(
              caches.open(DATA_CACHE_NAME).then(cache =>{
                  return fetch(evt.request)
                  .then(response =>{
                      if(response.status === 200){
                          cache.put(evt.request.url, response.clone());
                      }
                      return response
                  })
                  .catch(err => {
                      return cache.match(evt.request);
                  })
              })
          )
          return
      }
    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
          });
        })
      );
    });