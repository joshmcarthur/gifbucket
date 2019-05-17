if ('function' === typeof importScripts) {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js'
  );
  /* global workbox, self */
  if (workbox) {
    console.log('Workbox is loaded');

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([
  {
    "url": "icons/icon-128x128.png",
    "revision": "7db059b7dd21ee7a923ffa9df09864d8"
  },
  {
    "url": "icons/icon-144x144.png",
    "revision": "16e13b3fe6acb02d76b65ac3d6a436d4"
  },
  {
    "url": "icons/icon-152x152.png",
    "revision": "d212e33630a3d1c7ec571c2884a8a267"
  },
  {
    "url": "icons/icon-192x192.png",
    "revision": "0c49ec9f8f0721f86fc12398742642d0"
  },
  {
    "url": "icons/icon-384x384.png",
    "revision": "824aedbad50c43e742279511ecd8d8e3"
  },
  {
    "url": "icons/icon-512x512.png",
    "revision": "075264884143af1e76770e91743e6210"
  },
  {
    "url": "icons/icon-72x72.png",
    "revision": "606be79eadf62e1895901b71e2631cff"
  },
  {
    "url": "icons/icon-96x96.png",
    "revision": "1e3a6d0ac17f3e61839ab94ecc6f40bd"
  },
  {
    "url": "index.html",
    "revision": "052504791fda829e73cdc6ee61064e41"
  },
  {
    "url": "static/css/main.494adcef.chunk.css",
    "revision": "4ef2e8b71d02cf71c77dd1e81854b598"
  },
  {
    "url": "static/js/2.f919e3b8.chunk.js",
    "revision": "74d77bf5da3444600d0e50b393ae7e96"
  },
  {
    "url": "static/js/main.2cc72312.chunk.js",
    "revision": "6a5eeb349859009a5371cdfa04078b50"
  },
  {
    "url": "static/js/runtime~main.a8a9905a.js",
    "revision": "238c9148d722c1b6291779bd879837a1"
  }
]);

    /* custom cache rules*/
    workbox.routing.registerNavigationRoute('/index.html', {
      blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
    });

    workbox.routing.registerRoute(
      /\.(?:png|gif|jpg|jpeg)$/,
      workbox.strategies.cacheFirst({
        cacheName: 'images',
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          }),
        ],
      })
    );

    /* global self */
    self.addEventListener("fetch", () => { });

  } else {
    console.log('Workbox could not be loaded. No Offline support');
  }
}