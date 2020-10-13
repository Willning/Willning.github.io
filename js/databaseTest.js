if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    
  } else {
      var request = window.indexedDB.open("Test",1,console.log.bind("needs upgrade"));
      //indexDB is local store of info.

      
      request.onsuccess = (event) => {
        var db = event.target.result;
        //Transaction to add entry
        var transaction = db.transaction("test","readwrite").objectStore("test");
        transaction.add({name:"Larry", id:1});
        db.close();

        //Transaction to get entry 
        // db.transaction("test").objectStore('test').get(1).onsuccess = (evt)=> {
        //     console.log(evt.target.result.name);
        // }

      };

      request.onupgradeneeded = (event) => {
          var db =event.target.result;
          db.createObjectStore("test", {keyPath: "id"});
      };

      request.onerror = (event) => {
        console.log(event);
    };
  }
  