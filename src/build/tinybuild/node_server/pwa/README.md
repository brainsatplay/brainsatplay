## [Instructions](https://dev.to/digitalplayer1125/custom-service-worker-in-any-app-with-esbuild-3020)


### Compile & inject:

Copy manifest.webmanifest to main folder of your app and customize.

Code to paste or inject into html pages (our server does this if you specify the service-worker path in the server_settings.js file):
```html

<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="src/assets/square.png">
<meta name="apple-mobile-web-app-status-bar" content="#000000">
<meta name="theme-color" content="#000000">
<script> //Service workers for pwa test.  `npm run pwa`
  
    // Check that service workers are supported
    if ("serviceWorker" in navigator) addEventListener('load', () => {
        navigator.serviceWorker
        .register("node_server/pwa/sw.js")
        .catch((err) => console.log("Service worker registration failed", err));
    });
    
</script>

```