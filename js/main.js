window.onload = () => {
    'use strict';
  
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js');

      //Background sync.
      navigator.serviceWorker.ready.then((swRegistration)=> {
        document.getElementById('sync_button').addEventListener('click', ()=> {
          Notification.requestPermission();
          swRegistration.sync.register('sync_event');
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
    
    //Capture the initial install prompt and reuse it when the button is pressed
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


    //On page notificiation
    function showNotification() {     
      if (Notification.permission === 'granted') {

        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification("Hello", {
            body: "Will this work?",
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

    

    //Push notifications
    const applicationServerPublicKey = 'BDL6S2C706gO9ZzxvaPV_BKVM3gO4aeoCMFWbREmBMDMlshqd4rA9ybl5PHqtKRPKQCkfoE2K560mwIY5TK4seM';

    function subscribeUser() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: applicationServerPublicKey }) 
          .then( (sub) => {

            var sub_json = JSON.parse(JSON.stringify(sub)); //lmao what?            
            queueServerPost(sub_json.endpoint, sub_json['keys']['auth'],sub_json['keys']['p256dh']);
            
          });;
        })
      }
    }

    async function queueServerPost(endpoint,auth_key,hash_key) {
      const response = await fetch("http://localhost:3000/push_test?" + new URLSearchParams({
        url_endpoint: endpoint,
        auth_key: auth_key,
        hash_key: hash_key,
        })        
      );
    }

    var subscribe_button = document.getElementById('subscribe');

    subscribe_button.addEventListener('click', ()=> {
      subscribeUser(); 
    })
    
  }