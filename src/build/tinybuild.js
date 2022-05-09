//tinybuid.js


export * from './tinybuild/packager.js'

//uncomment and run `node tinybuild.js`
import { packager, defaultBundler, defaultServer } from "./tinybuild/packager.js";
import { parseArgs } from './tinybuild/repo.js'

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
import * as chokidar from 'chokidar';
import {fileURLToPath} from 'url';
import {exec, execSync, spawn} from 'child_process';
//import nodemon from 'nodemon';



function exitHandler(options, exitCode) {

    if (exitCode || exitCode === 0) console.log('EXIT CODE: ',exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));


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

//BUG
function runNodemon(script) {
    process.env.NODEMON = true;

    console.log("nodemon watching for changes...");
    let NODEMON_PROCESS = nodemon(`--ignore ${process.cwd()}/dist/ --ignore ${process.cwd()}/node_modules/ --ignore ${process.cwd()}/.temp/ --exec 'node ${script}' -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv`);
    NODEMON_PROCESS.on('restart',()=>{console.log('nodemon restarted')})
    NODEMON_PROCESS.on('start',()=>{console.log('nodemon started')})
    //NODEMON_PROCESS.on('exit',()=>{console.log('nodemon exited'); process.exit()})
    NODEMON_PROCESS.on('crash',()=>{console.log('nodemon CRASHED'); process.exit()})
    NODEMON_PROCESS.on('log',(msg)=>{console.log('nodemon: ', msg.message)});
    // // let process = spawn("nodemon", [`--exec \"node ${script}\"`, "-e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv"]); //should just watch the directory and otherwise restart this script and run the packager here for even smaller footprint
    
    // console.log(NODEMON_PROCESS.config);
    if(NODEMON_PROCESS.stdout) NODEMON_PROCESS.stdout.on('data',(data)=>{
        console.log('nodemon: ',data.toString());
    });

    if(NODEMON_PROCESS.stderr) NODEMON_PROCESS.stderr.on('data',(data)=>{
        console.log('nodemon error: ',data.message.toString());
    });

    return NODEMON_PROCESS;
}

//run a script and watch the directory for changes
function runAndWatch(script,args=[],ignore=['dist','temp'], extensions=['js','ts','css','html','jpg','png','txt','csv','xls']) {    
    process.env.NODEMON = true;

    const watcher = chokidar.watch(process.cwd(),{
        ignored: /^(?:.*[\\\\\\/])?node_modules(?:[\\\\\\/].*)?$/, // ignore node_modules
        persistent: true,
        ignoreInitial:true,
        interval:100,
        binaryInterval:200
    });

    let SERVER_PROCESS = {process:spawn('node',[script,...args])}
    let p = SERVER_PROCESS.process;

    if(p.stderr) p.stderr.on('data',(dat) => {
        console.error(dat.toString());
    });

    if(p.stdout) p.stdout.on('data',(dat) => {
        console.log(dat.toString());
    })

    p.on('message', (msg) => {
        console.log('message from server:', msg.toString());
    })

    watcher.on('change',(path,stats)=>{
        let skip = false;
        ignore.forEach((p) => {
            if(path.includes(p)) {
                skip = true;
            }
        });
        if(!skip) {
            let extension = path.split('.').pop();
            extensions.forEach((ex) => {
            if(extension.includes(ex)) {
                skip = false;
            }
            })
        }

        if(!skip) {

            console.log('change detected at', path,'... Restarting...');
            p.on('close', (code,signal) => {
                SERVER_PROCESS.process = spawn('node',[script,...args]);
                p = SERVER_PROCESS.process;

                if(p.stderr) p.stderr.on('data',(dat) => {
                    console.error(dat.toString());
                });
    
                if(p.stdout) p.stdout.on('data',(dat) => {
                    console.log(dat.toString());
                })
    
                p.on('message', (msg) => {
                    console.log('message from server:', msg);
                })
            })
        

            if(!p.killed) p.kill();

        }
        
    })

    return SERVER_PROCESS;
}

function checkNodeModules() {
            
    if(!fs.existsSync(process.cwd()+'/node_modules')) {
        console.log('Installing node modules...')
        if(process.argv.includes('yarn')) execSync(`yarn`); //install the node modules in the global repo
        else execSync(`npm i`); //install the node modules in the global repo
        console.log('Installed node modules!')
    }
}

function checkCoreExists() {
    if(!fs.existsSync(process.cwd()+'/tinybuild')) {
        if(fs.existsSync('node_modules/tinybuild')) {
            copyFolderRecursiveSync('node_modules/tinybuild','tinybuild');
        }
    }
}

function checkBoilerPlate() {
    if(!fs.existsSync(process.cwd()+'/package.json')) {
        fs.writeFileSync(process.cwd()+'/package.json',
`{
    "name": "tinybuildapp",
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
            "dist/",
            ".temp/"
        ]
    }
}`);

        //console.log("Installing node modules...");
        
        // if(process.argv.includes('yarn')) execSync('yarn')
        // else execSync('npm i');

        //console.log("Installed node modules!");

        execSync('npm link tinybuild');
        
    }

    let distpath = 'dist/index.js';
    if(!fs.existsSync(process.cwd()+'/index.html')) { //the python server needs the index.html
        fs.writeFileSync(process.cwd()+'/index.html',`
<!DOCTYPE html>
    <head>
    </head>
    <body>  
        <script src="${distpath}">
    </script>
</body>
        `)
    }

    //first check if the index.js exists, if not make them.
    if(!fs.existsSync(process.cwd()+'/index.js')) {
        fs.writeFileSync(process.cwd()+'/index.js','console.log("Hello World!"); if(typeof alert !== "undefined") alert("Hello world!");')
    }

    if(!fs.existsSync(process.cwd()+'/tinybuild.js')) {
        fs.writeFileSync(process.cwd()+'/tinybuild.js',
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
}


function runTinybuild() {

    console.time('🚀 Starting tinybuild...');

    //check global module path for node_modules folder

    let SERVER_PROCESS;
    
    if(typeof __filename =='undefined') {
        globalThis['__filename'] = import.meta.url;
        let dirname = fileURLToPath(import.meta.url);
        dirname = dirname.split('\\');
        if(dirname.length === 1) dirname = dirname[0].split('/');
        dirname.pop();
        globalThis['__dirname'] = dirname.join('/');

        fileName = path.basename(globalThis['__filename']);
    } else {
        fileName = path.basename(__filename);
    }
    //let fileName = __filename.split('/'); fileName = fileName[fileName.length-1]; //try to account for command line position and if the commands are for the current file

    let mode = 'default' //python, dev

    let tinybuildCfg = {}

    let argIdx = null;
    let tick = 0;
    var fileName;

    tinybuildCfg = parseArgs(process.argv);

    let scriptsrc = process.cwd()+'\\';
    if(tinybuildCfg.path) scriptsrc += tinybuildCfg.path;
    else scriptsrc += 'tinybuild.js';
    

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

    if(!fs.existsSync(process.cwd()+'/node_modules/tinybuild')) { 
        execSync('npm link tinybuild',(err)=>{console.log(err)});
    }

    if(Object.keys(tinybuildCfg).length > 0) {

        if(tinybuildCfg.start) { //execute the tinybuild.js in the working directory instead of our straight packager.

            if(!fs.existsSync(scriptsrc)) {
                fs.writeFileSync(scriptsrc,
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
    server:{
        host:'${tinybuildCfg.host}',
        port:'${tinybuildCfg.port}',
        protocol:'${tinybuildCfg.protocol}'
    }
}

//bundle and serve
packager(config);
`);
            }

            exec('node '+ scriptsrc,(err,stdout,stderr) => {});

        }
        else if (tinybuildCfg.mode === 'python') { //make sure your node_server config includes a python port otherwise it will serve the index.html and dist
            //check if python server.py folder exists, copy if not
            checkCoreExists();

            let distpath = 'dist/index.js';
            if(tinybuildCfg.config?.outfile) distpath = tinybuildCfg.config.outfile + '.js';
            else if (tinybuildCfg.config?.entryPoint) {
                let entry = tinybuildCfg.config.entryPoint.split('.');
                entry.pop();
                entry.join('.');
                entry.split('/');
                entry = entry.pop();
                distpath = 'dist/'+entry;
            }

            spawn('python',['tinybuild/python/server.py']);

            checkBoilerPlate()

            console.log("nodemon watching for changes...")
            SERVER_PROCESS = runAndWatch(scriptsrc); //runNodemon(scriptsrc);

        }
        else if (tinybuildCfg.mode === 'dev') { //run a local dev server copy
            //check if dev server folder exists, copy if not
            checkCoreExists();
            checkNodeModules();
            checkBoilerPlate();

            console.log("nodemon watching for changes...")
            SERVER_PROCESS = runAndWatch(scriptsrc); //runNodemon(scriptsrc);
        }
        else if (tinybuildCfg.bundle) {
            if(tinybuildCfg.config?.bundler) packager({bundler:config.bundler});
            else packager({bundler:defaultBundler});
        }
        else if (tinybuildCfg.serve) {
            if(tinybuildCfg.config?.server) packager({server:config.server});
            else packager({server:defaultServer});
        }



    } else if(mode !== 'help') {


        if(fs.existsSync(scriptsrc)) {

            SERVER_PROCESS = runAndWatch(scriptsrc); //runNodemon(scriptsrc);
            //execSync('nodemon --exec \"cd example && node tinybuild.js\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv --ignore dist/ --ignore .temp/')
            //let NODEMON_PROCESS = nodemon("-e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv --ignore dist/ --ignore .temp/ --exec node "+scriptsrc+" --watch "+process.cwd()+"");
            // let NODEMON_PROCESS = spawn(
            //     'nodemon',['--exec', '\'node '+scriptsrc+'\'','-e', 'ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv','--ignore', 'dist/','--ignore', '.temp/'],
            //     {stdio: ['pipe', 'pipe', 'pipe', 'ipc']});


        
        }
        else {

            checkBoilerPlate();

            console.log("nodemon watching for changes...", process.cwd())
            SERVER_PROCESS = runAndWatch(scriptsrc); //runNodemon(scriptsrc);
        }
    }


    if(!SERVER_PROCESS) console.timeEnd('🚀 Starting tinybuild...');
    else {
        SERVER_PROCESS.process.on('spawn',()=>{
            console.timeEnd('🚀 Starting tinybuild...');
        })
    }
}

if(process.argv.includes('GLOBAL')) {
    runTinybuild();
}

