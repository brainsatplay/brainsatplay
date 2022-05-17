## [Instructions](https://dev.to/digitalplayer1125/custom-service-worker-in-any-app-with-esbuild-3020)


### Compile & inject:

Required dependency:
`npm i workbox-cli`

Compile:
`workbox generateSW node_server/pwa/workbox-config.js`

Copy manifest.webmanifest to main folder of your app and customize.

Code to paste or inject into html pages (our server does this if you specify the service-worker path in the server_settings.js file):
```html

<script> //Service workers for pwa test.  `npm run pwa`
  
    // Check that service workers are supported
    if ("serviceWorker" in navigator) addEventListener('load', () => {
        navigator.serviceWorker
        .register("dist/service-worker.js")
        .catch((err) => console.log("Service worker registration failed", err));
    });
    
</script>

```