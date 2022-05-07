//tinybuid.js

export * from './tinybuild/packager.js'

//uncomment and run `node tinybuild.js`
// import { packager, defaultServer } from "./tinybuild/packager.js";

// let config = {
//     bundler:{
//         entryPoints: ['test.js'], //entry file, relative to this file 
//         outfile: 'dist/built', //exit file
//         //outdir:[] 
//         bundleBrowser: true, //plain js format
//         bundleESM: false, //.esm format
//         bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
//         bundleHTML: true //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
//       },
//     server:defaultServer
// }

// //bundle and serve
// packager(config);


// /// or import and run initRepo, cd to that repo and run the tinybuild.js.

import * as concurrently from 'concurrently'
import * as path from 'path'
import {fileURLToPath} from 'url';

let argIdx = null;
let tick = 0;
const __filename = fileURLToPath(import.meta.url);
var fileName = path.basename(__filename);
//let fileName = __filename.split('/'); fileName = fileName[fileName.length-1]; //try to account for command line position and if the commands are for the current file

let mode = 'default' //python, bundle, serve, library

let repoSettings = {}


// process.argv.forEach((val, idx, array) => {
//     //idx = 0: 'node'
//     //idx = 1: 'tinybuild/init.js
//     // dir='example'
//     // entry='index.js'
//     // core=false/true
//     // script=``   //no spaces
//     // config={} //no spaces
    
//     let command = val;

//     if(argIdx && tick < 5){ //after 5 args we probably aren't on these args anymore
//         if(command.includes('mode=')) {
//             mode = command.split('=').pop();
//         }
//         if(command.includes('init')) {
//             repoSettings.init = true;
//         }
//         if(command.includes('entry')) {
//             repoSettings.entryPoint = command.split('=').pop()
//         }
//         if(command.includes('core')) {
//             repoSettings.includeCore = command.split('=').pop()
//         }
//         if(command.includes('script')) {
//             repoSettings.initScript = decodeURIComponent(command.split('=').pop())
//         }
//         if(command.includes('config')) {
//             repoSettings.config = decodeURIComponent(command.split('=').pop())
//         }
//         tick++;
//     }
//     if(val === fileName) argIdx = true;

// });

/**
 *     "start": "npm run startdev",
    "build": "cd example && node tinybuild.js",
    "init": "node tinybuild/init.js",
    "concurrent": "concurrently \"npm run python\" \"npm run startdev\"",
    "dev": "npm run pip && npm i --save-dev concurrently && npm i --save-dev nodemon && npm run concurrent",
    "startdev": "nodemon --exec \"cd example && node tinybuild.js\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv",
    "python": "python tinybuild/python/server.py",
    "pip": "pip install quart && pip install websockets",
    "pwa": "npm i workbox-cli && workbox generateSW tinybuild/node_server/pwa/workbox-config.js && npm run build && npm start"
 */