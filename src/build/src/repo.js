import * as fs from 'fs';
import path from 'path';

//initialize a project repo with a simplified packager set up for you.
// If you set includeCore to true then the new repo can be used as a template for creating more repos with standalone tinybuild files
export async function initRepo(
    dirName='example',    
    entryPoint='index.js', //your head js file
    initScript=`
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
    config={
        bundler:{
            entryPoints: [entryPoint],
            outfile: 'dist/'+entryPoint.slice(0,entryPoint.lastIndexOf('.')),
            bundleBrowser: true, //plain js format
            bundleESM: false, //.esm format
            bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
            bundleHTML: true //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
        },
        server:server.defaultServer
    }, //can set the config here
    includeCore=true, //include the core bundler and node server files, not necessary if you are building libraries or quickly testing an app.js
    ) {

    if(!fs.existsSync(dirName)) fs.mkdirSync(dirName); //will be made in the folder calling the init script

    fs.writeFileSync(dirName+'/'+entryPoint,
        // app initial entry point
        initScript
    )


    //copy the bundler files
    const tinybuildPath = path.join(dirName, 'tinybuild.js')

    if(!includeCore){
        //tinybuild.js file using the npm package 
        fs.writeFileSync(tinybuildPath,
        `
//use command 'node tinybuild.js' to build and run after doing npm install!

import {packager, defaultServer, initRepo} from 'tinybuild'
let config = ${JSON.stringify(config)};

//bundle and serve
packager(config);
        `);
    
        //package.json, used to run npm install then npm start
        fs.writeFileSync(dirName+'/package.json',`
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
        "concurrent": "concurrently \\"npm run python\\" \\"npm run startdev\\"",
        "dev": "npm run pip && npm i --save-dev concurrently && npm i --save-dev nodemon && npm run concurrent",
        "startdev": "nodemon --exec \\"node tinybuild.js\\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv",
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
        `);


    }
    else { //tinybuild js using a copy of the source and other prepared build files
        config.bundler.bundleHTML = false; //we'll target the index.html file instead of building this one

        let outfile = config.bundler.outfile;
        if(config.bundler.outdir) outfile = outdir[0];

        //index.html file
        fs.writeFileSync(dirName+'/index.html',
        `
<!DOCTYPE html>
<head></head>
<body>
    <script src='${outfile}.js'></script>
</body>
        `);

        //https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
        function copyFolderRecursiveSync( source, target ) {
            var files = [];
        
            // Check if folder needs to be created or integrated
            var targetFolder = path.join( target, path.basename( source ) );
            if ( !fs.existsSync( targetFolder ) ) {
                fs.mkdirSync( targetFolder );
            }
        
            // Copy
            if ( fs.lstatSync( source ).isDirectory() ) {
                files = fs.readdirSync( source );
                files.forEach( function ( file ) {
                    var curSource = path.join( source, file );
                    if ( fs.lstatSync( curSource ).isDirectory() ) {
                        copyFolderRecursiveSync( curSource, targetFolder );
                    } else {
                        fs.copyFileSync( curSource, targetFolder );
                    }
                } );
            }
        }

        copyFolderRecursiveSync('tinybuild',tinybuildPath);

        fs.writeFileSync(tinybuildPath,`
//create an init script (see example)
//node init.js to run the packager function

export * from './tinybuild/packager'
import { packager, defaultServer } from './tinybuild/packager'

let config = ${JSON.stringify(config)};

//bundle and serve
packager(config);
        `);

            
        //package.json, used to run npm install then npm start
        fs.writeFileSync(dirName+'/package.json',`
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
        "concurrent": "concurrently \\"npm run python\\" \\"npm run startdev\\"",
        "dev": "npm run pip && npm i --save-dev concurrently && npm i --save-dev nodemon && npm run concurrent",
        "startdev": "nodemon --exec \\"node tinybuild.js\\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv",
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
        `);


        fs.writeFileSync(dirName+'/.gitignore',
`
dist
**/node_modules/**
**/*.pem
**/*.pfxs
**/*.key
**/*.lock
**/package-lock.json
**/*.key
**/*.log
`
        )

    }

}



export function parseArgs(args=process.argv) {
    let tinybuildCfg = {}
    let argIdx = null;
    let tick = 0;
    var fileName;
    args.forEach((v,i,arr) => {

            //idx = 0: 'node'
            //idx = 1: 'tinybuild/init.js
            // dir='example'
            // entry='index.js'
            // core=false/true
            // script=``   //no spaces
            // config={} //no spaces
            
            let command = v;

            let getArgVal = (str) => {
                var regex = /=(.+)/;
                var matches = str.match(regex);
                if (matches) return matches[1];
            }
    
            // if(argIdx){ //after 5 args we probably aren't on these args anymore
                const argVal = getArgVal(command); //extra modes are 'python' and 'dev'. 
                if(command.includes('help')) {
                    tinybuildCfg.help = true
                }
                if(command.includes('mode=')) {
                    if (argVal) tinybuildCfg.mode = argVal;
                }
                if(command.includes('start')) {
                    tinybuildCfg.start = true; //starts the entrypoint with 'node tinybuild.js' (or specified path), does not use nodemon (e.g. for production), just run tinybuild without 'start' to use the dev server config by default
                }
                if(command.includes('bundle')) {
                    tinybuildCfg.bundle = true; //bundle the local app?
                }
                if(command.includes('serve')) {
                    tinybuildCfg.serve = true; //serve the local (assumed built) dist?
                }
                if(command.includes('path')) { //path to the tinybuild script where the packager or plain bundler etc. are being run. defaults to look for 'tinybuild.js'
                if (argVal) tinybuildCfg.path = argVal;
                }
                if(command.includes('init')) {
                    tinybuildCfg.init = true; //initialize a repo with the below settings?
                }
                if(command.includes('entry')) {
                    if (argVal) tinybuildCfg.entryPoint = argVal; //entry point script name to be created
                }
                if(command.includes('debug')) {
                    if (argVal)  tinybuildCfg.debug = JSON.parse(argVal) //debug?
                }
                if(command.includes('socket_protocol')) {
                    if (argVal) tinybuildCfg.debug = argVal; //node server socket protocol (wss for hosted, or ws for localhost, depends)
                }
                if(command.includes('pwa')) {
                    if (argVal) tinybuildCfg.pwa = argVal; //pwa service worker relative path
                }
                if(command.includes('hotreload')) {
                    if (argVal) tinybuildCfg.hotreload = argVal; //pwa service worker relative path
                }
                if(command.includes('keypath')) {
                    if (argVal) tinybuildCfg.keypath = argVal; //pwa service worker relative path
                }
                if(command.includes('certpath')) {
                    if (argVal) tinybuildCfg.certpath = argVal; //pwa service worker relative path
                }
                if(command.includes('python')) {
                    if (argVal) tinybuildCfg.python = argVal; //python port
                }
                if(command.includes('host')) {
                    if (argVal) tinybuildCfg.host = argVal; //node host
                }
                if(command.includes('port')) {
                    if (argVal) tinybuildCfg.port = argVal; //node port
                }
                if(command.includes('protocol')) {
                    if (argVal) tinybuildCfg.protocol = argVal; //node http or https protocols
                }
                if(command.includes('startpage')) {
                    if (argVal) tinybuildCfg.startpage = argVal; //node http or https protocols
                }
                if(command.includes('core')) {
                    if (argVal) tinybuildCfg.includeCore = argVal; //use tinybuild's source instead of the npm packages?
                }
                if(command.includes('script')) {
                    if (argVal) tinybuildCfg.initScript = decodeURIComponent(argVal) //encoded URI string of a javascript file
                }
                if(command.includes('config')) {
                    if (argVal) tinybuildCfg.config = argVal;
                }
                tick++;
            // }
            // if(v === fileName) argIdx = true;
    
    })

    return tinybuildCfg;
}