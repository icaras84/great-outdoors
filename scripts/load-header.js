class GO_HeaderLoaded{
    subscribers = [];
    constructor(){
        this.subscribers = [];
    }

    pushSubscribers(subscribers){
        for(let subscriber of subscribers){
            this.subscribers.push(subscriber);
        }
    }

    notifySubscribers(){
        for(let subscriber of this.subscribers){
            subscriber();
        }
    }
}

let headerLoadedEventManager = new GO_HeaderLoaded();
window.GO_HeaderLoaded = headerLoadedEventManager;

// js/load-header.js
fetch('./header.txt')
  .then(r => r.text())
  .then(txt => {
      let header = document.getElementById('site-header');
      header.innerHTML = txt;
      headerLoadedEventManager.notifySubscribers();
  });