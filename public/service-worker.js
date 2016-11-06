var cacheName = 'koala-todo-shellv2';
var filesToCache = [
  '/css/styles.css',
  '/js/app.js',
  '/js/firebase.js',
  '/icons/launcher-icon-1x.png',
  '/icons/launcher-icon-2x.png',
  '/icons/launcher-icon-3x.png',
  '/icons/launcher-icon-4x.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');

  firebase.initializeApp({
    apiKey: "AIzaSyC7pZTERxpFWuDaXoOM4sYY_Hg9-n-Qc98",
    authDomain: "koala-todo.firebaseapp.com",
    databaseURL: "https://koala-todo.firebaseio.com",
    storageBucket: "koala-todo.appspot.com",
    messagingSenderId: "46769945984"
  })

  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );

});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);

  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );

});
