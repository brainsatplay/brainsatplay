module.exports = {
    globDirectory: "dist/",
    globPatterns: [
      "**/*.{css,eot,html,ico,jpg,js,json,png,svg,ttf,txt,webmanifest,woff,woff2,webm,xml}",
    ],
    globFollow: true,
    globStrict: true,
    globIgnores: [
      "**/*-es5.*.js",
      "3rdpartylicenses.txt",
      "assets/images/icons/icon-*.png",
    ],
    dontCacheBustURLsMatching: new RegExp(".+.[a-f0-9]{20}..+"),
    runtimeCaching: [{
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
        handler: 'CacheFirst',
        options: { cacheName: "images" }
      }],
    maximumFileSizeToCacheInBytes: 10000000,
    swDest: "dist/service-worker.js",
    skipWaiting: true,
};