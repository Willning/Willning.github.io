window.onload = () => {
    'use strict';
  
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js');

      //Background sync.
      navigator.serviceWorker.ready.then((swRegistration)=> {
        document.getElementById('sync_button').addEventListener('click', ()=> {
          swRegistration.sync.register('sync_event')
        })
      });
    }


    var message_tag = document.getElementById('message');

    let installed = false; 

    //Detect if installed. (i.e. running in standalone mode )
    if ((window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://')) {
      installed = true;
      console.log("is installed");
      message_tag.innerHTML = "App is Installed";
    } else {
      installed = false;
      console.log("not installed");
      message_tag.innerHTML = "App is Not Installed";
    }
    
    //Capture the initial install prompt and reuse it in the button
    let deferredPrompt; 
    window.addEventListener('beforeinstallprompt', (e)=> {
      deferredPrompt = e;
    });

    var install_button = document.getElementById('install_button');
    
    install_button.addEventListener('click', ()=> {
      if (deferredPrompt) {
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            installed = true;            
          }else {
            installed = false; 
          }
        })
      }
    })


    function showNotification() {      
      
      if (Notification.permission === 'granted') {

        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification("Hello", {
            body: "Work",
            icon: 'images/icon.png',
            vibrate: [100,50,100],
          });
          
        });
      }
    }

    var notify_button = document.getElementById('notify');
    notify_button.addEventListener('click', ()=> {
      showNotification();
    })    
    
  }