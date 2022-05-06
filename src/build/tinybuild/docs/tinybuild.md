
tinybuild is the result of testing a ton of bundlers and development servers and landing on this combination of packages and settings. It is instantaneous (<100ms for bundling and serving, <3 seconds if you are bundling types for modules in mid-size libraries). 


Feature breakdown:

## [esbuild](./esbuild.md)
## [node server](./server.md)
## [python](./python.md)


esbuild supports the full spectrum of javascript bundling needs and we have documented its typical features fairly well with our settings. See their website for more information. 

The node server is no-frills with websocket based hot reloading and basic examples of python backend communication and relaying. It's small and fast and meets our most common development server needs without giant dependencies.

## init

The fastest way to create a tinybuild app with your own settings is to run `node tinybuild/init.js` either after installing tinybuild from npm or cloning the source to your project folder.  It runs with these default settings

```js
defaultRepo = {
    dirName:'example',    
    entryPoint:'index.js', //your head js file
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
            entryPoints: [entryPoint],
            outfile: 'dist/'+entryPoint.slice(0,entryPoint.lastIndexOf('.')),
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

You can customize default repo settings above via command line if you don't want to create your own init file to run `initRepo(dirName='example',entryPoint='index.js',initScript='some stringified script',config={...bundlerConfig},includeCore=boolean)`

Like so `node tinybuild/init.js dir=myApp core=true` to make a directory called myApp that includes the source code and a default package.json and index.js and tinybuild.js bundle+serve file.

```js
// e.g. via command line: 'node tinybuild/init.js dir=myApp core=true'
    if(command.includes('dir')) {
        defaultRepo.dirName = command.split('=').pop()
    }
    if(command.includes('entry')) {
        defaultRepo.entryPoint = command.split('=').pop()
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
        "tinybuild": "~0.0.11",
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

