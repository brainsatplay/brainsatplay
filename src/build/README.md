# tinybuild
Minimal [esbuild](https://esbuild.github.io/getting-started/#your-first-bundle), [Nodejs](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework), and [Python Quart](https://pgjones.gitlab.io/quart/) concurrent build and test env.  


`npm i tinybuild` or copy source

Create a javascript app entry point
```js


    document.body.style.backgroundColor = '#101010'; //page color
    document.body.style.color = 'white'; //text color
    let div = document.createElement('div');
    div.innerHTML = 'Hello World!';
    document.body.appendChild(div);
    
    alert('tinybuild successful!');

```

Create a tinybuild script
```js

    //use command 'node tinybuild.js' to build and run after doing npm install!

    import {packager, defaultServer, initRepo} from 'tinybuild'
    let config = {
        bundler:{
            entryPoints: ['app.js'],
            outfile: 'dist/app',
            bundleBrowser: true, //plain js format
            bundleESM: false, //.esm format
            bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
            bundleHTML: true
        },
        server:defaultServer
    }
    
    //bundle and serve
    packager(config);

```

Create a package.json

```json

{
    "name": "tinybuild",
    "version": "0.0.0",
    "description": "Barebones esbuild and test node server implementation. For building",
    "main": "index.js",
    "type":"module",
    "scripts": {
        "start": "npm run startdev",
        "build": "node tinybuild.js",
        "concurrent": "concurrently \"npm run python\" \"npm run startdev\"",
        "dev": "npm run pip && npm i --save-dev concurrently && npm i --save-dev nodemon && npm run concurrent",
        "startdev": "nodemon --exec \"node tinybuild.js\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv",
        "python": "python python/server.py",
        "pip": "pip install quart && pip install websockets",
        "pwa": "npm i workbox-cli && workbox generateSW node_server/pwa/workbox-config.js && npm run build && npm start"
    },
    "keywords": [
        "esbuild"
    ],
    "author": "Joshua Brewster",
    "license": "AGPL-3.0-or-later",
    "dependencies": {
    },
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

Then `npm install` and `npm start`!


## Bundler settings

Any unlisted settings are just typical esbuild settings, which can be configured per build type via the .options tag (e.g. config.options.browser = {...more esbuild settings})
```js

export const defaultBundler = {
  bundleBrowser:true, //create plain js build? Can include globals and init scripts
  bundleESM:false,     //create esm module js files
  bundleTypes:false,   //create .d.ts files, the entry point must be a typescript file! (ts, tsx, etc)
  bundleNode:false,   //create node platform plain js build, specify platform:'node' to do the rest of the files 
  bundleIIFE:false,   //create an iife build, this is compiled temporarily to create the types files
  bundleCommonJS:false, //cjs format outputted as .cjs.js
  bundleHTML:false,   //wrap the first entry point file as a plain js script in a boilerplate html file, frontend scripts can be run standalone like a .exe!
  entryPoints:['index.ts'], //entry point file(s)
  outfile:'dist/index',     //exit point file
  //outdir:[]               //exit point files, define for multiple bundle files
  bundle:true,
  platform: 'browser', //'node' //bundleNode will use 'node' mode by default
  minify: true,
  sourcemap: false,
  external: ['node-fetch'], // [];
  allowOverwrite:true, 
  loader: {
    '.html': 'text', //not always necessary but it doesn't hurt
    '.png' : 'file',
    '.jpg' : 'file',
    '.gif' : 'file',
    '.svg': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.ttf': 'file',
    '.eot': 'file',
    '.mp3': 'file',
    '.mp4': 'file',
    '.json': 'text',
  },
  outputs:{ //overwrites main config settings for specific use cases
    node:{ 
      external:[] //externals for node environment builds
    }
    //esm:{}
    //commonjs:{}
    //browser:{}
    //iife:{}
  },
  defaultConfig: true //indicates this object is the default config
  //globalThis:null
  //globals:{[this.entryPoints[0]]:['Graph']}
  //init:{[this.entryPoints[0]:function(bundle) { console.log('prepackaged bundle script!', bundle); }]}
}
//the rest are based on what esbuild offers

```

## Server settings

```js

export const defaultServer = {
    debug:false, //print debog messages?
    protocol:'http', //'http' or 'https'. HTTPS required for Nodejs <---> Python sockets. If using http, set production to False in python/server.py as well
    host: 'localhost', //'localhost' or '127.0.0.1' etc.
    port: 8080, //e.g. port 80, 443, 8000
    startpage: 'index.html',  //home page
    socket_protocol: 'ws', //frontend socket protocol, wss for served, ws for localhost
    hotreload: 5000, //hotreload websocket server port
    pwa:'dist/service-worker.js', //pwa mode? Injects service worker registry code in (see pwa README.md)
    python: false,//7000,  //quart server port (configured via the python server script file still)
    python_node:7001, //websocket relay port (relays messages to client from nodejs that were sent to it by python)
    errpage: 'packager/node_server/other/404.html', //default error page, etc.
    certpath:'packager/node_server/ssl/cert.pem',//if using https, this is required. See cert.pfx.md for instructions
    keypath:'packager/node_server/ssl/key.pem'//if using https, this is required. See cert.pfx.md for instructions
}


```


## Build & Run Development Server

`npm i` then `npm start`

Find node_server/server_settings.js for easy config for http/https (set socket protocol 'ws' to 'wss' for hosted https). https requires ssl (instructions included in node_server/ssl)

## With Python Server

Requires: Python 3.7 or later and NodeJS LTS or later. 

In server_settings.js, set settings.python to undefined to not use it, or port 7000 is default.

This test runs a websocket and a thread on the [python](https://www.python.org/downloads/) quart server. You can access the Node-served test page at `http://localhost:8080` or the quart server test page at `http://localhost:7000` to experiment (add `/build` at port 7000 to access the node build through python (minus hot reload)). 

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

>2 dependencies: `esbuild` and [`fragelement`](https://github.com/brainsatplay/domelement)

## Hot reloading (for dev)

`npm run start` 

nodemon restarts the node server automatically when changes to included source files are detected.

The nodemon dev server adds basic frontend hot reloading via websocket and clientside code injection (see [nodeserver/server.js](https://github.com/moothyknight/esbuild_base/blob/master/node_server/server.js) for method).

> 2 dev dependencies: `nodemon` and `ws`

## PWA build:

To test:

`npm run pwa` 

This installs workbox-cli, generates the service worker, bundles and then starts the application. Run once if you don't need to modify the service-worker further.

> 1 additional dependency: `workbox-cli`

### Other notes:

See README.md files in each folder for more explanation on how to work with these types of applications.
