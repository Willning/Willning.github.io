window.onload = () => {
    'use strict';
  
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
               .register('./sw.js')
               .then(registration=>navigator.serviceWorker.ready)
               .then(registration => {
                 document.getElementById("sync_button").addEventListener('click',()=> {
                     registration.sync.register('image-fetch')
                   }
                 )
               });
               //Register the service worker
    }
  }