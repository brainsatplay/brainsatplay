//tinybuid.js

export * from './tinybuild/packager.js'

//uncomment and run `node tinybuild.js`
import { packager, defaultBundler, defaultServer } from "./tinybuild/packager.js";

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



// TINYBUILD SCRIPTS

import * as fs from 'fs';
import * as path from 'path';
import {fileURLToPath} from 'url';
import {exec, execSync, spawn} from 'child_process';


let argIdx = null;
let tick = 0;
const __filename = fileURLToPath(import.meta.url);
var fileName = path.basename(__filename);
//let fileName = __filename.split('/'); fileName = fileName[fileName.length-1]; //try to account for command line position and if the commands are for the current file

let mode = 'default' //python

let tinybuild = {}


process.argv.forEach((val, idx, array) => {
    //idx = 0: 'node'
    //idx = 1: 'tinybuild/init.js
    // dir='example'
    // entry='index.js'
    // core=false/true
    // script=``   //no spaces
    // config={} //no spaces
    
    let command = val;

    if(argIdx && tick < 5){ //after 5 args we probably aren't on these args anymore
        if(command.includes('mode=')) {
            mode = command.split('=').pop();
            tinybuild.mode = mode;
        }
        if(command.includes('init')) {
            tinybuild.init = true;
        }
        if(command.includes('start')) {
            tinybuild.start = true;
        }
        if(command.includes('bundle')) {
            tinybuild.bundle = true;
        }
        if(command.includes('serve')) {
            tinybuild.serve = true;
        }
        if(command.includes('path')) {
            tinybuild.path = command.split('=').pop()
        }
        if(command.includes('entry')) {
            tinybuild.entryPoint = command.split('=').pop()
        }
        if(command.includes('core')) {
            tinybuild.includeCore = command.split('=').pop()
        }
        if(command.includes('script')) {
            tinybuild.initScript = decodeURIComponent(command.split('=').pop())
        }
        if(command.includes('config')) {
            tinybuild.config = decodeURIComponent(command.split('=').pop())
        }
        tick++;
    }
    if(val === fileName) argIdx = true;

});


//scenarios:
/*     
    "start": "npm run startdev",
    "build": "cd example && node tinybuild.js",
    "init": "node tinybuild/init.js",
    "concurrent": "concurrently \"npm run python\" \"npm run startdev\"",
    "dev": "npm run pip && npm i --save-dev concurrently && npm i --save-dev nodemon && npm run concurrent",
    "startdev": "nodemon --exec \"cd example && node tinybuild.js\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv",
    "python": "python tinybuild/python/server.py",
    "pip": "pip install quart && pip install websockets",
    "pwa": "npm i workbox-cli && workbox generateSW tinybuild/node_server/pwa/workbox-config.js && npm run build && npm start"
 */

//e.g. typing 'parcel' with a global install will target your entry files and bundle/serve with the dev server.
// 'tinybuild' should look for the necessary basic files (index.js, index.html, and package.json), if core=true it looks for the source folder
//     if any not found create the missing ones
//  if found run the default bundle and serve configurations as if running the default packager.
//      if bundle/serve configs found in init (using URI encoded stringified objects) apply those settings
//  if mode=python, copy and run the python server in the project repo (since its meant as a template) 
//  if mode=library disable the server and generate the esm files (just a quick setting I thought of)
//  otherwise can apply additional settings used in tinybuild/init.js

// with the extra settings we can apply them to the packager config

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


let scriptsrc = process.cwd()+'/';
if(tinybuild.path) scriptsrc += tinybuild.path;
else scriptsrc += 'tinybuild.js';


if(Object.keys(tinybuild).length > 0) {

    if(tinybuild.start) { //execute the tinybuild.js in the working directory instead of our straight packager.

        if(!fs.existsSync(scriptsrc)) {
            fs.writeFileSync(scriptsrc,
            `
            import { packager, defaultServer } from "./tinybuild/packager.js";
            let config = {
                bundler:{
                    entryPoints: ['index.js'], //entry file, relative to this file 
                    outfile: 'dist/index', //exit file
                    //outdir:[] 
                    bundleBrowser: true, //plain js format
                    bundleESM: false, //.esm format
                    bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
                    bundleHTML: true //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
                },
                server:defaultServer
            }

            //bundle and serve
            packager(config);
            `);
        }


        exec('node '+scriptsrc,(err,stdout,stderr) => {});

    }
    else if (tinybuild.mode === 'python') {
        //check if python server.py folder exists, copy if not
        if(!fs.existsSync('python')) {
            if(!fs.existsSync('tinybuild') && fs.existsSync('node_modules/tinybuild')) {
                copyFolderRecursiveSync('node_modules/tinybuild/python','python');
            }
            else if (fs.existsSync('tinybuild')) copyFolderRecursiveSync('tinybuild/python','python');
        }

        spawn('python',['python/server.py']);



    }
    else if (tinybuild.mode === 'dev') { //run a local dev server copy
        //check if dev server folder exists, copy if not
        if(!fs.existsSync('node_server')) {
            if(!fs.existsSync('tinybuild') && fs.existsSync('node_modules/tinybuild')) {
                copyFolderRecursiveSync('node_modules/tinybuild/node_server','node_server');
            }
            else if (fs.existsSync('tinybuild')) copyFolderRecursiveSync('tinybuild/node_server','node_server');
        }    
        
        if(!fs.existsSync('tinybuild.js')) {
            fs.writeFileSync('tinybuild.js',
            `
            import { packager, defaultServer } from "./tinybuild/packager.js";
            let config = {
                bundler:{
                    entryPoints: ['index.js'], //entry file, relative to this file 
                    outfile: 'dist/index', //exit file
                    //outdir:[] 
                    bundleBrowser: true, //plain js format
                    bundleESM: false, //.esm format
                    bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
                    bundleHTML: true //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
                },
                server:defaultServer
            }

            //bundle and serve
            packager(config);
            `);
        }

        exec("nodemon --exec \"node tinybuild.js\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv")
    }
    else if (tinybuild.bundle) {
        packager({bundler:defaultBundler});
    }
    else if (tinybuild.serve) {
        packager({server:defaultServer});
    }



} else {


    if(fs.existsSync(scriptsrc)) {
        exec('node '+scriptsrc,(err,stdout,stderr) => {});
    }
    else {

    if(!fs.existsSync('package.json')) {
        fs.writeFileSync('package.json',
        `{
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
                "tinybuild": "~0.0.14",
                "concurrently": "^7.1.0",
                "nodemon": "^2.0.15"
            },
            "nodemonConfig": {
                "env": {
                    "NODEMON": true
                },
                "ignore": [
                    "dist/"
                ]
            }
        }`);

        execSync('npm i');
    }


    //first check if the index.js exists, if not make them.
    if(!fs.existsSync('index.js')) {
        fs.writeFileSync('index.js','console.log("Hello World!");')
    }

    if(!fs.existsSync('tinybuild.js')) { //we need
        fs.writeFileSync('tinybuild.js',
        `
        import { packager, defaultServer } from "tinybuild";
        let config = {
            bundler:{
                entryPoints: ['index.js'], //entry file, relative to this file 
                outfile: 'dist/index', //exit file
                //outdir:[] 
                bundleBrowser: true, //plain js format
                bundleESM: false, //.esm format
                bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
                bundleHTML: true //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
            },
            server:defaultServer
        }

        //bundle and serve
        packager(config);
        `);
    }

        exec("nodemon --exec \"node "+scriptsrc+"\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv"); //should just watch the directory and otherwise restart this script and run the packager here for even smaller footprint
    }
}


