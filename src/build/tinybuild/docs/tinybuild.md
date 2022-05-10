
tinybuild is the result of testing a ton of bundlers and development servers and landing on this combination of packages and settings. It is instantaneous (<100ms for bundling and serving, <3 seconds if you are bundling types for modules in mid-size libraries). 


Feature breakdown:

## [esbuild](./esbuild.md)
## [node server](./server.md)
## [python](./python.md)


esbuild supports the full spectrum of javascript bundling needs and we have documented its typical features fairly well with our settings. See their website for more information. 

The node server is no-frills with websocket based hot reloading and basic examples of python backend communication and relaying. It's small and fast and meets our most common development server needs without giant dependencies.

## global install

`npm i -g tinybuild`

then from an empty project folder, initialize a default app with:

`tinybuild`

Or first create a tinybuild.config.js like so:
```js
//import {defaultBundler, defaultServer, packager} from 'tinybuild'

let entryPoints = ['index.js']

const config = {
    bundler: {
        entryPoints: entryPoints,
        outfile: 'dist/index',
        bundleBrowser: true, //plain js format
        bundleESM: false, //.esm format
        bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
        bundleNode: false, // bundle a package with platform:node and separate externals
        bundleHTML: true //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
    },
    server: { //defaultServer
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
}

export default config;
```

Then run `tinybuild`.

### tinybuild commands:

`tinybuild help` lists accepted arguments, see the boilerplate created in the new repo for more. The `tinybuild` command will use your edited `tinybuild.config.js` or `tinybuild.js` (which includes the library and executes the packager with the bundler and/or server itself for more control) config file after initialization so you can use it generically, else see the created `package.json` for more local commands.

global command:
- `tinybuild` -- runs the boilerplate tinybuild bundler + server settings in the current working directory. It will create missing index.js, package.json (with auto npm/yarn install), and tinybuild.js, and serve with watched folders in the working directory (minus node_modules because it slows down) for hot reloading.

local command:
- `node path/to/tinybuild.js` -- will use the current working directory as reference to run this packager config

tinybuild arguments (applies to packager or tinybuild commands):
- `start` -- runs the equivalent of `node tinybuild.js` in the current working directory.
- `bundle` -- runs the esbuild bundler, can specify config with `config={"bundler":{}}` via a jsonified (and URI-encoded if there are spaces) object
- `serve` -- runs the node development server, can specify config with `config={"server":{}}` via a jsonified object and (URI-encoded if there are spaces) object
- `mode=python` -- runs the development server as well as python which also serves the dist from a separate port (7000 by default). 
- `mode=dev` for the dev server mode (used by default if you just type `tinybuild` on boilerplate)
- `path=custom.js` -- target a custom equivalent tinybuild.js entry file (to run the packager or bundler/server)st` - host name for the server, localhost by default

esbuild arguments:
- `entryPoints=index.js` -- set an entry point for your script, can also be a JSONified array of strings.
- `outfile=dist/index` -- set the output directory and file name (minus the extension name)
- `outdir=['dist/index']` -- alternatively use outdir when using multiple entry points
- `bundleBrowser=true` -- produce a plain .js bundle that is browser-friendly, true by default. 
- `bundleESM=false` -- produce an ESM module bundle, false by default, Will be identified by .esm.js
- `bundleTypes=false` -- produce .d.ts files, false by default, entry point needs to by a typescript file but it will attempt to generate types for js files in the repo otherwise. The files are organized like your repo in the dist folder used. 
- `bundleNode=false` -- create a separate bundle set to include node dependencies. Identified by .node.js
- `bundleHTML=true` -- bundle an HTML boilerplate that wraps and executes the browser bundle as a quick test. If true the packager command will set this file as the startpage, otherwise you have an index.html you can customize and use that has the same base boilerplate. Find e.g. index.build.html in dist.
- `external=['node-fetch']` -- mark externals in your repo, node-fetch is used in a lot of our work so it's there by default, the node bundle has its own excludes (see our esbuild options in readme)
- `platform=browser` -- the non-node bundles use browser by default, set to node to have all bundles target the node platform. Externals must be set appropriately.
- `globalThis=myCustomBundle` -- You can set any exports on your entry points on the bundleBrowser setting to be accessible as a global variable. Not set by default.
- `globals={[entryPoint]:['myFunction']}` -- you can specify any additional functions, classes, variables etc. exported from your bundle to be installed as globals on the bundleBrowser setting.

Server arguments:
- `host=localhost` -- set the hostname for the server, localhost by default. You can set it to your server url or IP address when serving. Generally use port 80 when serving.
- `port=8080` - port for the server, 8080 by default
- `protocol=http` - http or https? You need ssl cert and key to run https
- `python=7000` - port for python server so the node server can send a kill signal, 7000 by default. Run the python server concurrently or use `mode=python`
- `hotreload=5000` - hotreload port for the node server, 5000 by default
- `startpage=index.html` - entry html page for the home '/' page, index.html by default
- `certpath=tinybuild/node_server/ssl/cert.pem` - cert file for https 
- `keypath=tinybuild/node_server/ssl/key.pem` - key file for https
- `pwa=tinybuild/pwa/workbox-config.js` - service worker config for pwa using workbox-cli (installed separately via package.json), the server will install a manifest.json in the main folder if not found, https required
- `config="{"server":{},"bundler":{}}"` -- pass a jsonified config object for the packager. See the bundler and server settings in the docs.
- `init` -- initialize a folder as a new tinybuild repository with the necessary files, you can include the source using the below command
- `core=true` -- include the tinybuild source in the new repository with an appropriate package.json
- `entry=index.js` --name the entry point file you want to create, defaults to index.js
- `script=console.log("Hello%20World!")` -- pass a jsonified and URI-encoded (for spaces etc.) javascript string, defaults to a console.log of Hello World!



## init

A more detailed way to create an app is to use `initRepo` in `node tinybuild/init.js`, you can apply all of these settings through the main `tinybuild` command by passing the arguments in the help command. 

```js
defaultRepo = {
    dirName:`example',    
    entryPoints:'index.js', //your head js file
    initScript:`
        /* 
            esbuild + nodejs (with asyncio python) development/production server. 
            Begin your javascript application here. This file serves as a simplified entry point to your app, 
            all other scripts you want to build can stem from here if you don't want to define more entryPoints 
            and an outdir in the bundler settings.
        */
        document.body.style.backgroundColor = '#101010'; //page color
        document.body.style.color = 'white'; //text color
        let div = document.createElement('div');
        div.innerHTML = 'Hello World!';
        document.body.appendChild(div);
        alert('tinybuild successful!');
    `,
    config:{
        bundler:{
            entryPoints: [this.entryPoints],
            outfile: 'dist/'+this.entryPoints.slice(0,this.entryPoints.lastIndexOf('.')),
            bundleBrowser: true, //plain js format
            bundleESM: false, //.esm format
            bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
            bundleHTML: true
        },
        server:server.defaultServer
    }, //can set the config here
    includeCore:true, //include the core bundler and node server files, not necessary if you are building libraries or quickly testing an app.js
}
```

### Command line settings

You can customize default repo settings above via command line if you don't want to create your own init file to run `initRepo(dirName='example',entryPoints='index.js',initScript='some stringified script',config={...bundlerConfig},includeCore=boolean)`

Like so `node tinybuild/init.js dir=myApp core=true` to make a directory called myApp that includes the source code and a default package.json, app or library entry point .js file, and tinybuild.js bundle+serve file for you to customize following our documentation.

```js
// e.g. via command line: 'node tinybuild/init.js dir=myApp core=true'
    if(command.includes('dir')) {
        defaultRepo.dirName = command.split('=').pop()
    }
    if(command.includes('entry')) {
        defaultRepo.entryPoints = command.split('=').pop()
    }
    if(command.includes('core')) {
        defaultRepo.includeCore = command.split('=').pop()
    }
    if(command.includes('script')) {
        defaultRepo.initScript = decodeURIComponent(command.split('=').pop())
    }
    if(command.includes('config')) {
        defaultRepo.config = decodeURIComponent(command.split('=').pop())
    }
```


## tinybuild quick start:
Create a package.json if you don't have one. You an use these scripts to run the server.
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
//-------------OR (delete above if using source)----------------//
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


Then `npm i` or copy source folder into your project. We recommend the above settings to run the development server for hot reloading and concurrent python support.

Create a javascript app entry point
```js


    document.body.style.backgroundColor = '#101010'; //page color
    document.body.style.color = 'white'; //text color
    let div = document.createElement('div');
    div.innerHTML = 'Hello World!';
    document.body.appendChild(div);
    
    alert('tinybuild successful!');

```

Create a tinybuild.js script in your main folder:
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

Then run `node tinybuild.js`

The function 
```js
packager(config)
``` 
simply combines the [bundle()] and [serve()] functions and settings objects to run sequentially using a combined object labeled as above. We provide `defaultBundler` and `defaultServer` for quick setup (or `defaultConfig` for combined). 

