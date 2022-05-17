
## [Node Server](https://nodejs.org)


The node server is no-frills with websocket based hot reloading and basic examples of python backend communication and relaying. It's small and fast and meets our most common development server needs without giant dependencies.

Code: [`tinybuild/node_server`](../node_server)

### Features:
- Serve whatever files
- Hot reload injector
- PWA injector (if you run the `npm run pwa` command below)
- HTTP or HTTPS (with SSL certificate instructions found in node_server/ssl)
- Python (via [Quart](https://pgjones.gitlab.io/quart/)) cross communication or even using python in production to serve the build.


Quick start server from Node:

Create index.html (or any name):
```html
<!DOCTYPE html>
<head></head>
<body>

    Hello World!
    <script>  //OR: <script src='dist/index.js'> or whatever your outfile is to serve a bundle. bundleHTML will automatically create and serve a boilerplate html with the outfile (or first entry in outdir)
       
        alert('Served from ' + window.location.host)
    </script>
</body>
```

Create server.js
```js

import 'serve' from 'tinybuild'

let config = {
    protocol:'http', //'http' or 'https'. HTTPS required for Nodejs <---> Python sockets. If using http, set production to False in python/server.py as well
    host: 'localhost', //'localhost' or '127.0.0.1' etc.
    port: 8080, //e.g. port 80, 443, 8000. Server will be at '[protocol]://[host]:[port]'
    startpage: 'index.html',  //home page
}

serve(config);

```

Then via command line: `node server.js`

## Hot reloading, python, concurrency, bundling then serving, etc:

We recommend these as your package.json settings with tinybuild and to use the concurrent + development server features, choose the devDependencies tag based on if you are using source or the libraries and follow the rest of the instructions to set up the tinybuild.js entry point.
```json
{
    "name": "tinybuildapp",
    "version": "0.0.0",
    "description": "Barebones esbuild and test node server implementation. For building",
    "main": "index.js",
    "type":"module",
    "scripts": {
        "start": "npm run startdev",
        "build": "node tinybuild.js",
        "init": "node tinybuild/init.js",
        "concurrent": "concurrently \"npm run python\" \"npm run startdev\"",
        "dev": "npm run pip && npm i --save-dev concurrently && npm i --save-dev nodemon && npm run concurrent",
        "startdev": "nodemon --exec \"node tinybuild.js\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv",
        "python": "python tinybuild/python/server.py",
        "pip": "pip install quart && pip install websockets",
        "pwa": "npm i workbox-cli && workbox generateSW tinybuild/node_server/pwa/workbox-config.js && npm run build && npm start"
    },
    "keywords": [
        "esbuild"
    ],
    "author": "Joshua Brewster",
    "license": "AGPL-3.0-or-later",
    "dependencies": {
    },
    "devDependencies":{
        "nodemon": "^2.0.15",
        "concurrently": "^7.1.0"
    },
//-------------OR (delete below if using tinybuild instead of source)----------------//
    "devDependencies": {
        "concurrently": "^7.1.0",
        "esbuild": "^0.14.38",
        "esbuild-plugin-d.ts":"^1.1.0",
        "nodemon": "^2.0.15",
        "ws": "^8.5.0"
    },
    "nodemonConfig": {
        "env": {
            "NODEMON": true
        },
        "ignore": [
            "dist/"
        ]
    }
}

```

then `npm install` in the directory with this file.

- Hot reloading is accomplished with `nodemon` and `ws`
- Concurrent python and node is accompished with `concurrently`
- PWA bundling is accomplished with `workbox-cli` installed optionall via `npm run pwa`

## Build & Run Development Server

`npm i` then `npm start`

Find node_server/server_settings.js for easy config for http/https (set socket protocol 'ws' to 'wss' for hosted https). https requires ssl (instructions included in node_server/ssl)

## With Python Server

Requires: Python 3.7 or later and NodeJS LTS or later. 

In server_settings.js, set settings.python to undefined to not use it, or port 7000 is default.

This test runs a websocket and a thread on the [python](https://www.python.org/downloads/) quart server. You can access the Node-served build at `http://localhost:8080` or the quart server build at `http://localhost:7000` to experiment (if on default settings).

Quart enables fast asyncio server streams from python. Bonus thread-generated data in python streaming through websockets to show off the potential.

`npm run pip` should install any missing python packages. See [README](https://github.com/moothyknight/esbuild_base_python/blob/master/python/README.md))

`npm run concurrent` runs both python and node servers concurrently (with hot reloading for FE with a persistent python streaming server backend).

After installing dependencies, 

## Run Python and Node together: 

`npm run concurrent`

Comment out any py_wss or py_client references in node_server/server.js if you want to exclude it altogether else the node server tries to connect to the python port 7000 (only works on https).

## Otherwise

To run: `npm run build` to bundle, then `npm start` to run the node server.

* OR `npm test` to run both commands in sequence

You can specify https and add an ssl certificate if you follow the instructions.

>2 dependencies: `esbuild` 

## Hot reloading (for dev)

`npm run start` 

nodemon restarts the node server automatically when changes to included source files are detected.

The nodemon dev server adds basic frontend hot reloading via websocket and clientside code injection (see [nodeserver/server.js](https://github.com/moothyknight/esbuild_base/blob/master/node_server/server.js) for method).

> 2 dev dependencies: `nodemon` and `ws`

## PWA build:

To test:

Create a manifest.json and a template serviceworker file like so (tinybuild server will write these for you) 

```json
{
    "short_name": "PWA",
    "name": "PWA",
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#000000",
    "background_color": "#ffffff",
    "description": "PWA Test",
    "lang": "en-US",
    "permissions": [
      "storage"
    ]
  }
```

```js
//sw.js

//https://github.com/ibrahima92/pwa-with-vanilla-js
const assets = [
  "/",
  "/index.html",
  "/dist/index.js"
];

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});

```

In your index.html:
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

And run the server with https.

### Other notes:

See README.md files in each folder for more explanation on how to work with these types of applications.
