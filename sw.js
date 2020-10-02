var cacheName = 'hello-pwa3'; //PWA cache version increment for update
var filesToCache = [
  '/',
  '/index.html',
  '/js/main.js',
  '/js/matter.min.js',
  '/js/game.js'
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



self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});


self.addEventListener('activate', event => {
  // delete any caches that aren't in expectedCaches
  // which will get rid of static-v1
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (cacheName !== key) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('V2 now ready to handle fetches!');
    })
  );
});


self.addEventListener('sync', (event) =>{
   //make trigger webhook
   if (event.tag==='image-fetch') {
       //event.waitUntil(setTimeout(sendWebhook(),5000));
  }
});

function fetchImage (){
    fetch('/images/dog.jpg').then((response) => {
        return response;
    })
}

function sendWebhook () {
    data = {
        content:"Sent from PWA",
        files: "",
        embeds: "",
    };

    fetch('https://discordapp.com/api/webhooks/746174010244595824/riQhloUSEV2Dxx5SAvpdEJ1a4T5WgR0b_H-Qx6JtSIDllRpYqsh1Nt0asTAhtdK1Rp3K', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
        console.log(response);
        return response;
      });
  }