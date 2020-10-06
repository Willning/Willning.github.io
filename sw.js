var cacheName = 'hello-pwa5'; //PWA cache version increment for update
var filesToCache = [
  '/',
  '/index.html',
  '/js/main.js',
  '/js/matter.min.js',
  '/js/game.js',
  '/css/style.css',
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
  // delete any caches that aren't the current cache
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (cacheName !== key) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('New version installed');
    })
  );
});


self.addEventListener('sync', (event) =>{
   //make trigger webhook
   if (event.tag==='sync_event') {
       event.waitUntil(setTimeout(sendWebhook(),5000));
  }
});


self.addEventListener('push', function(event) {
    
    if (event.data) {
      console.log('Just got a push event ', event.data.text())
    } else {
      console.log('Got a push event but no data')
    }
    console.log(event);

    //Show the notification
    if (event.data) {        
        self.registration.showNotification("Push notification", {
            body: event.data.text(),
            icon:'images/icon.png',
            vibrate: [100,50,100],
        });
    }   

  });


async function sendWebhook () {
    data = {
        content:"Sent from PWA",
        files: "",
        embeds: "",
    };
    message_sent = false;
    attempts = 0;
    while(!message_sent || attempts >= 5) {
        try {
            attempts++;
            const response = await fetch('https://discordapp.com/api/webhooks/746174010244595824/riQhloUSEV2Dxx5SAvpdEJ1a4T5WgR0b_H-Qx6JtSIDllRpYqsh1Nt0asTAhtdK1Rp3K', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                message_sent = true;
            } else {
                //Bad response
                console.log("Bad response");
                //Timed backoff
                await new Promise(r => setTimeout(r, (attempts+1)*1000));
            }           
        }catch(err) {
            //No response.
            console.log(err);
            await new Promise(r => setTimeout(r, (attempts+1)*1000));
        }
    } 

}