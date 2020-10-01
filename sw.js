var cacheName = 'hello-pwa'; //PWA cache version increment for update
var filesToCache = [
  '/',
  '/index.html',
  '/js/main.js'
  //Cache all files that are used offline here
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((resp) => {
        return resp || fetch(event.request).then((response) => {
          let responseClone = response.clone();
          caches.open(cacheName).then((cache) => {
            cache.put(event.request, responseClone);
          });
  
          return response;
        });
      }).catch(() => {
        return caches.match('./images/cat.jpg');
      })
    );
  });

  self.addEventListener('sync', (event) =>{
    //make trigger webhook
    if (event.tag==='image-fetch') {
        event.waitUntil(fetchImage());
    }
  });

  function fetchImage (){
      fetch('/images/dog.jpg').then((response) => {
          return response;
      })
  }