import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import {execSync, spawn} from 'child_process';
import { defaultServer } from './node_server/server.js';


//https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
export function copyFolderRecursiveSync( source, target ) {
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

//BUG, REQUIRES NODEMON 
export async function runNodemon(script) {
    const nodemon = await import('nodemon').nodemon
    process.env.HOTRELOAD = true; //enables the hot reloading port

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

//spawns a child process when a change is detected in the working repository, e.g. a one-shot bundler script
export function runOnChange(
    command, 
    args=[], 
    ignore=['dist','temp'], 
    extensions=['js','ts','css','html','jpg','png','txt','csv','xls']
) { 

    
    let watchPaths = process.cwd();

    if(args.includes('watch')) { //watch='../../otherlibraryfolder'
        watchPaths = watch.split('=')[1];
        if(watchPaths.includes('[')) watchPaths = JSON.parse(watchPaths).push(process.cwd());
        else {
            watchPaths = watchPaths.split(',');
            watchPaths = [process.cwd(),...watchPaths];
        }
    }

    const watcher = chokidar.watch(
        watchPaths,{
            ignored: /^(?:.*[\\\\\\/])?node_modules(?:[\\\\\\/].*)?$/, // ignore node_modules
            persistent: true,
            ignoreInitial:true,
            interval:100,
            binaryInterval:200
        }
    );

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
            console.log('change detected at', path,'\n...Restarting...');

            let newprocess = spawn(command,args, {
                cwd: process.cwd(),
                env: process.env,
                detached: true
            }); //spawn the new script
            let p = newprocess;
    
            if(p.stderr) {
                p.stderr.on('data',(dat) => {
                    console.error(dat.toString());
                });
    
                p.stderr.pipe(process.stderr);
            }
    
            if(p.stdout) {
    
                p.stdout.on('data',(dat) => {
                    console.log(dat.toString());
                });
            
                p.stdout.pipe(process.stdout);
            }
    
            p.on('message', (msg) => {
                console.log('message from server:', msg);
            });

            p.on('close', ()=>{
                console.log("Child process finished: ", command,...args)
            })
        }
        
    })
    
    console.log("Watching for changes...");

    return watcher;

}

//run a script and watch the directory for changes then restart the script
export function runAndWatch(
    script,
    args=[],
    ignore=['dist','temp'], 
    extensions=['js','ts','css','html','jpg','png','txt','csv','xls'],
    restartDelay=50
) {    
    process.env.HOTRELOAD = true; //enables the hot reloading port

    let watchPaths = process.cwd();

    if(args.includes('watch')) { //watch='../../otherlibraryfolder'
        watchPaths = watch.split('=')[1];
        if(watchPaths.includes('[')) watchPaths = JSON.parse(watchPaths).push(process.cwd());
        else {
            watchPaths = watchPaths.split(',');
            watchPaths = [process.cwd(),...watchPaths];
        }
    }

    const watcher = chokidar.watch(
        watchPaths,{
        ignored: /^(?:.*[\\\\\\/])?node_modules(?:[\\\\\\/].*)?|(?:.*[\\\\\\/])?.git(?:[\\\\\\/].*)?$/, // ignore node_modules
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
    });

    p.on('message', (msg) => {
        console.log('message from server:', msg.toString());
    });

    p.on('exit',(code,sig) => {
        process.exit();
    });

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

            console.log('change detected at', path,'\n...Restarting...');
            const onclose = (code,signal) => {
                let respawn = () => {
                    SERVER_PROCESS.process = spawn('node',[script,...args]);
                    p = SERVER_PROCESS.process;
    
                    if(p.stderr) p.stderr.on('data',(dat) => {
                        let er = dat.toString();
                        if(!p.killed && er.includes('build')) p.kill();
                        console.error(er);
                    });
        
                    if(p.stdout) p.stdout.on('data',(dat) => {
                        let str = dat.toString();
                        console.log(str);
                    })
        
                    p.on('message', (msg) => {
                        console.log('message from server:', msg);
                    })
                }
                if(restartDelay) {
                    setTimeout(()=>{
                        respawn();
                    },
                    restartDelay);
                }
                else respawn();
            }
            p.on('close', onclose);
        

            if(!p.killed) p.kill();
            else onclose();

        }
        
    })

    console.log("Watching for changes...");

    return SERVER_PROCESS;
}

export function checkNodeModules() {
            
    if(!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
        console.log('Installing node modules...')
        if(process.argv.includes('yarn')) execSync(`yarn`); //install the node modules in the global repo
        else execSync(`npm i`); //install the node modules in the global repo
        console.log('Installed node modules!')
    }
}

export function checkCoreExists() {
    if(!fs.existsSync(path.join(process.cwd(), 'tinybuild'))) {
        const nodeMods = path.join('node_modules', 'tinybuild','tinybuild');
        if(fs.existsSync(nodeMods)) {
            copyFolderRecursiveSync(nodeMods,'tinybuild');
        }
    }
}


export async function checkConfig(cfgpath = path.join(process.cwd(),'tinybuild.config.js')) {
    let cfgexists = fs.existsSync(cfgpath)

    // Create Configuration File
    if(cfgexists) return false;
    else {

        let template = `
const config = {
    bundler: { //esbuild settings, set false to skip build step or add bundle:true to config object to only bundle (alt methods)
        entryPoints: [ //entry point file(s). These can include .js, .mjs, .ts, .jsx, .tsx, or other javascript files. Make sure your entry point is a ts file if you want to generate types
        "index.js"
        ],
        outfile: "dist/index", //exit point file, will append .js as well as indicators like .esm.js, .node.js for other build flags
        //outdir:[]               //exit point files, define for multiple bundle files
        bundleBrowser: true, //create plain js build? Can include globals and init scripts
        bundleESM: false, //create esm module js files
        bundleTypes: false, //create .d.ts files, the entry point must be a typescript file! (ts, tsx, etc)
        bundleNode: false, //create node platform plain js build, specify platform:'node' to do the rest of the files 
        bundleHTML: false, //wrap the first entry point file as a plain js script in a boilerplate html file, frontend scripts can be run standalone like a .exe! Server serves this as start page if set to true.
        minify: true,
        sourcemap: false
        //globalThis:null //'mymodule'
        //globals:{'index.js':['Graph']}
        //init:{'index.js':function(bundle) { console.log('prepackaged bundle script!', bundle); }}      
     },
    server: {  //node server settings, set false to skip server step or add serve:true to config object to only serve (alt methods)
        debug: false,
        protocol: "http",  //'http' or 'https'. HTTPS required for Nodejs <---> Python sockets. If using http, set production to False in python/server.py as well
        host: "localhost", //'localhost' or '127.0.0.1' etc.
        port: 8080, //e.g. port 80, 443, 8000
        startpage: "index.html", //home page
        socket_protocol: "ws", //frontend socket protocol, wss for served, ws for localhost
        hotreload: 5000,  //hotreload websocket server port
        //watch: ['../'], //watch additional directories other than the current working directory
        pwa: "dist/service-worker.js",  //pwa mode? Injects service worker registry code in (see pwa README.md)
        python: false,//7000,  //quart server port (configured via the python server script file still)
        python_node: 7001, //websocket relay port (relays messages to client from nodejs that were sent to it by python)
        errpage: "packager/node_server/other/404.html",  //default error page, etc.
        certpath: "packager/node_server/ssl/cert.pem", //if using https, this is required. See cert.pfx.md for instructions
        keypath: "packager/node_server/ssl/key.pem" //if using https, this is required. See cert.pfx.md for instructions
    }
}

`;

        if(fs.existsSync(path.join(process.cwd(),'package.json'))) {
            let contents = fs.readFileSync(path.join(process.cwd(),'package.json'));
            if(!contents.includes('"module"')) template += 'module.exports = config; //export default config; //es6' //es5
            else template += 'export default config; //module.exports = config; //es5' //es6

        } else template += 'export default config; //module.exports = config; //es5' //es6


        fs.writeFileSync(cfgpath,template);

        return true;
    }
}

//'tinybuild' will trigger this script otherwise if it exists
export async function checkBuildScript() {

    const tinybuildPath = path.join(process.cwd(), 'tinybuild.js')

    if(!fs.existsSync(tinybuildPath)) {
        fs.writeFileSync(tinybuildPath,
`
import { packager } from "tinybuild";

let config = {
    bundler: {
        entryPoints: ['index.js'],
        outfile: 'dist/index',
        bundleBrowser: true, //plain js format
        bundleESM: false, //.esm format
        bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
        bundleNode: false, // bundle a package with platform:node and separate externals
        bundleHTML: true, //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
        minify: true,
        sourcemap: false
        //globalThis:null //'mymodule'
        //globals:{'index.js':['Graph']}
        //init:{'index.js':function(bundle) { console.log('prepackaged bundle script!', bundle); }}      
    },
    server: defaultServer
}


packager(config); // bundle and serve
`);
        return true;
    }
    return false;
}


// NOTE: At a minimum, boilerplate includes a (1) a script / config , (1) a package.json and (3) an index.html file.
// If these files exist, none of the others are created.
// IMPORTANT: Using the tinybuild.config.js file at process.cwd() OR a generated one.
export async function checkBoilerPlate(onlyConfig=true) {
    //const config = await ((onlyConfig) ? createConfig() : checkBuildScript()); //this is borderline unreadable, also the import thing doesnt work unless the package is type:module, this builds on es5 packages now
    
    let config; 
    if(!onlyConfig) {
        checkBuildScript();
    }
    checkConfig();
    
    const packagePath = path.join(process.cwd(),'package.json')
    const htmlPath = process.cwd()+'/index.html'

    const entryFile = 'index.js';
    const entryFilePath = path.join(process.cwd(), entryFile) // assign index by first entrypoint

    const needPackage = !fs.existsSync(packagePath)
    const needHTML = !fs.existsSync(htmlPath)
    const needEntry = !fs.existsSync(entryFilePath)


    if(needPackage) {

        console.log('Creating package.json')
        fs.writeFileSync(packagePath,
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
        
    }


    // Auto-assign distpath
    if(needHTML) { //the python server needs the index.html

        console.log('Creating index.html')

        fs.writeFileSync(htmlPath,`
<!DOCTYPE html>
<html>
    <head>
    </head>
    <body>  
        <script src="dist/${entryFile}">
        </script>
    </body>
</html>
        `)
    }

    if(needEntry) {

        console.log('Creating entry file: ', entryFile)

        // Make index.js if it doesn't exist
        if (needEntry) fs.writeFileSync(entryFilePath,'console.log("Hello World!"); if(typeof alert !== "undefined") alert("Hello world!");')
    }
}



//initialize a project repo with a simplified packager set up for you.
// If you set includeCore to true then the new repo can be used as a template for creating more repos with standalone tinybuild files
export async function initRepo(
    dirName='example',    
    entryPoints='index.js', //your head js file
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
            entryPoints: [entryPoints],
            outfile: 'dist/'+entryPoints.slice(0,entryPoints.lastIndexOf('.')),
            bundleBrowser: true, //plain js format
            bundleESM: false, //.esm format
            bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
            bundleHTML: true //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
        },
        server:server.defaultServer
    }, //can set the config here
    includeCore=true, //include the core bundler and node server files, not necessary if you are building libraries or quickly testing an app.js
    ) {

        console.log('ACTUAL INIT REPO')

    if(!fs.existsSync(dirName)) fs.mkdirSync(dirName); //will be made in the folder calling the init script


    fs.writeFileSync(dirName+'/'+entryPoints,
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
        "pwa": "npm i -g workbox-cli && workbox generateSW node_server/pwa/workbox-config.js && npm run build && npm start"
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
            "HOTRELOAD": true,
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
        fs.writeFileSync(path.join(dirName,'/index.html'),
        `
<!DOCTYPE html>
<html>
    <head></head>
    <body>
        <script src='${outfile}.js'></script>
    </body>
</html>
        `);

        copyFolderRecursiveSync('tinybuild',tinybuildPath);

        fs.writeFileSync(tinybuildPath,`
//create an init script (see example)
//node init.js to run the packager function

export * from './tinybuild/packager.js'
import { packager, defaultServer } from './tinybuild/packager.js'

let config = ${JSON.stringify(config)};

//bundle and serve
packager(config);
        `);

            
        //package.json, used to run npm install then npm start
        fs.writeFileSync(path.join(dirName,'package.json'),`
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
        "pwa": "npm i -g workbox-cli && workbox generateSW node_server/pwa/workbox-config.js && npm run build && npm start"
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
        "HOTRELOAD": true,
        "NODEMON": true
        },
        "ignore": [
        "dist/"
        ]
    }
}
        `);


        fs.writeFileSync(path.join(dirName,'.gitignore'),
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
    let tinybuildCfg = {
        server:{},
        bundler:{}
    }

    let argIdx = null;
    let tick = 0;
    let fileName;

    if(typeof __filename =='undefined') {
        globalThis['__filename'] = args[1];
        let dirname = args[1];
        dirname = dirname.split(path.sep);
        dirname.pop();
        globalThis['__dirname'] = dirname.join(path.sep);

        fileName = path.basename(globalThis['__filename']);
    } else {
        fileName = path.basename(__filename);
    }

    args.forEach((v,i,arr) => {

            //idx = 0: 'node'
            //idx = 1: 'tinybuild/init.js
            // dir='example'
            // entry='index.js'
            // core=false/true
            // script=``   //no spaces
            // config={} //no spaces
            
            let command = v;
    
            if(argIdx){ //after 5 args we probably aren't on these args anymore
                if(command.includes('help')) {
                    tinybuildCfg.mode = 'help';
                    console.log(
`
tinybuild commands:

global command:
- 'tinybuild' -- runs the boilerplate tinybuild bundler + server settings in the current working directory. It will create missing index.js, package.json (with auto npm/yarn install), and tinybuild.js, and serve with watched folders in the working directory (minus node_modules because it slows down) for hot reloading.

local command:
- 'node path/to/tinybuild.js' -- will use the current working directory as reference to run this packager config

tinybuild arguments (applies to packager or tinybuild commands):
- 'start' -- runs the equivalent of 'node tinybuild.js' in the current working directory.
- 'bundle' -- runs the esbuild bundler, can specify config with 'config={"bundler":{}}' via a jsonified (and URI-encoded if there are spaces) object
- 'serve' -- runs the node development server, can specify config with 'config={"server":{}}' via a jsonified object and (URI-encoded if there are spaces) object
- 'mode=python' -- runs the development server as well as python which also serves the dist from a separate port (7000 by default). 
- 'mode=dev' for the dev server mode (used by default if you just type 'tinybuild' on boilerplate)
- 'path=custom.js' -- target a custom equivalent tinybuild.js entry file (to run the packager or bundler/server)st' - host name for the server, localhost by default

esbuild arguments:
- 'entryPoints=index.js' -- set an entry point for your script, can also be a JSONified array of strings.
- 'outfile=dist/index' -- set the output directory and file name (minus the extension name)
- 'outdir=['dist/index']' -- alternatively use outdir when using multiple entry points
- 'bundleBrowser=true' -- produce a plain .js bundle that is browser-friendly, true by default. 
- 'bundleESM=false' -- produce an ESM module bundle, false by default, Will be identified by .esm.js
- 'bundleTypes=false' -- produce .d.ts files, false by default, entry point needs to by a typescript file but it will attempt to generate types for js files in the repo otherwise. The files are organized like your repo in the dist folder used. 
- 'bundleNode=false' -- create a separate bundle set to include node dependencies. Identified by .node.js
- 'bundleHTML=true' -- bundle an HTML boilerplate that wraps and executes the browser bundle as a quick test. If true the packager command will set this file as the startpage, otherwise you have an index.html you can customize and use that has the same base boilerplate. Find e.g. index.build.html in dist.
- 'external=['node-fetch']' -- mark externals in your repo, node-fetch is used in a lot of our work so it's there by default, the node bundle has its own excludes (see our esbuild options in readme)
- 'platform=browser' -- the non-node bundles use browser by default, set to node to have all bundles target the node platform. Externals must be set appropriately.
- 'globalThis=myCustomBundle' -- You can set any exports on your entry points on the bundleBrowser setting to be accessible as a global variable. Not set by default.
- 'globals={['index.js']:['myFunction']}' -- you can specify any additional functions, classes, variables etc. exported from your bundle to be installed as globals on the bundleBrowser setting.

Server arguments:
- 'host=localhost' -- set the hostname for the server, localhost by default. You can set it to your server url or IP address when serving. Generally use port 80 when serving.
- 'port=8080' - port for the server, 8080 by default
- 'protocol=http' - http or https? You need ssl cert and key to run https
- 'python=7000' - port for python server so the node server can send a kill signal, 7000 by default. Run the python server concurrently or use 'mode=python'
- 'hotreload=5000' - hotreload port for the node server, 5000 by default
- 'watch=../../path/to/other/src' - watch extra folders other than anything under the current working directory
- 'startpage=index.html' - entry html page for the home '/' page, index.html by default
- 'certpath=tinybuild/node_server/ssl/cert.pem' - cert file for https 
- 'keypath=tinybuild/node_server/ssl/key.pem' - key file for https
- 'pwa=tinybuild/pwa/workbox-config.js' - service worker config for pwa using workbox-cli (installed separately via package.json), the server will install a manifest.json in the main folder if not found, https required
- 'config="{"server":{},"bundler":{}}"' -- pass a jsonified config object for the packager. See the bundler and server settings in the docs.
- 'init' -- initialize a folder as a new tinybuild repository with the necessary files, you can include the source using the below command
- 'core=true' -- include the tinybuild source in the new repository with an appropriate package.json
- 'entry=index.js' --name the entry point file you want to create, defaults to index.js
- 'script=console.log("Hello%20World!")' -- pass a jsonified and URI-encoded (for spaces etc.) javascript string, defaults to a console.log of Hello World!
`
                    )
                    process.exit();
                }
                if(command.includes('mode=')) {
                    tinybuildCfg.mode = command.split('=').pop(); //extra modes are 'python' and 'dev'. 
                }
                if(command.includes('GLOBAL')) { //path to global bin file inserted when running the 'tinybuild' script, which will run tinybuild and the restarting server as a child process
                    tinybuildCfg.GLOBAL = command.split('=').pop()
                }
                if(command.includes('start')) {
                    tinybuildCfg.start = true; //starts the entryPoints with 'node tinybuild.js' (or specified path), does not use nodemon (e.g. for production), just run tinybuild without 'start' to use the dev server config by default
                }
                if(command.includes('bundle') && !command.includes('bundler')) {
                    tinybuildCfg.bundle = true; //bundle the local app?
                }
                if(command.includes('serve') && !command.includes('server')) {
                    tinybuildCfg.serve = true; //serve the local (assumed built) dist?
                }
                if(command.includes('path')) { //path to the tinybuild script where the packager or plain bundler etc. are being run. defaults to look for 'tinybuild.js'
                    tinybuildCfg.path = command.split('=').pop()
                }
                if(command.includes('init')) {
                    tinybuildCfg.init = true; //initialize a repo with the below settings?
                }
                if(command.includes('debug')) {
                    tinybuildCfg.server.debug = JSON.parse(command.split('=').pop()) //debug?
                }
                if(command.includes('socket_protocol')) {
                    tinybuildCfg.server.socket_protocol = command.split('=').pop() //node server socket protocol (wss for hosted, or ws for localhost, depends)
                }
                if(command.includes('pwa')) {
                    tinybuildCfg.server.pwa = command.split('=').pop() //pwa service worker relative path
                }
                if(command.includes('hotreload')) {
                    tinybuildCfg.server.hotreload = command.split('=').pop() //pwa service worker relative path
                }
                if(command.includes('keypath')) {
                    tinybuildCfg.server.keypath = command.split('=').pop() //pwa service worker relative path
                }
                if(command.includes('certpath')) {
                    tinybuildCfg.server.certpath = command.split('=').pop() //pwa service worker relative path
                }
                if(command.includes('watch')) {
                    tinybuildCfg.server.watch = command.split('=').pop() //pwa service worker relative path
                }
                if(command.includes('python')) {
                    tinybuildCfg.server.python = command.split('=').pop() //python port
                }
                if(command.includes('host')) {
                    tinybuildCfg.server.host = command.split('=').pop() //node host
                }
                if(command.includes('port')) {
                    tinybuildCfg.server.port = command.split('=').pop() //node port
                }
                if(command.includes('protocol')) {
                    tinybuildCfg.server.protocol = command.split('=').pop() //node http or https protocols
                }
                if(command.includes('startpage')) {
                    tinybuildCfg.server.startpage = command.split('=').pop() //node http or https protocols
                }
                if(command.includes('core')) {
                    tinybuildCfg.includeCore = command.split('=').pop() //use tinybuild's source instead of the npm packages?
                }
                if(command.includes('bundleBrowser')) {
                    tinybuildCfg.bundler.bundleBrowser = JSON.parse(command.split('=').pop())
                }
                if(command.includes('bundleESM')) {
                    tinybuildCfg.bundler.bundleESM = JSON.parse(command.split('=').pop())
                }
                if(command.includes('bundleTypes')) {
                    tinybuildCfg.bundler.bundleTypes = JSON.parse(command.split('=').pop())
                }
                if(command.includes('bundleNode')) {
                    tinybuildCfg.bundler.bundleNode = JSON.parse(command.split('=').pop())
                }
                if(command.includes('bundleHTML')) {
                    tinybuildCfg.bundler.bundleHTML = JSON.parse(command.split('=').pop())
                }
                if(command.includes('entryPoints')) {
                    tinybuildCfg.bundler.entryPoints = [command.split('=').pop()]; //entry point script name to be created
                    if(tinybuildCfg.bundler.entryPoints.includes('[')) tinybuildCfg.bundler.entryPoints = JSON.parse(tinybuildCfg.bundler.entryPoints);
                }
                if(command.includes('outfile')) {
                    tinybuildCfg.bundler.outfile = JSON.parse(command.split('=').pop())
                }
                if(command.includes('outdir')) {
                    tinybuildCfg.bundler.outdir = JSON.parse(command.split('=').pop())
                }
                if(command.includes('platform')) {
                    tinybuildCfg.bundler.platform = JSON.parse(command.split('=').pop())
                }
                if(command.includes('external')) {
                    tinybuildCfg.bundler.external = JSON.parse(command.split('=').pop())
                }
                if(command.includes('globalThis')) {
                    tinybuildCfg.bundler.globalThis = JSON.parse(command.split('=').pop())
                }
                if(command.includes('globals')) {
                    tinybuildCfg.bundler.globals = JSON.parse(decodeURIComponent(command.split('=').pop()))
                }
                if(command.includes('minify')) {
                    tinybuildCfg.bundler.minify = JSON.parse(command.split('=').pop())
                }
                if(command.includes('script')) {
                    let parsed = decodeURIComponent(command.slice(command.indexOf('=')+1));
                    //console.log('script parsed: ', parsed);
                    tinybuildCfg.initScript = parsed; //encoded URI string of a javascript file
                }
                if(command.includes('config')) {
                    let parsed = JSON.parse(command.split('=').pop());
                    //console.log('config parsed: ', parsed);
                    Object.assign(tinybuildCfg, parsed); //encoded URI string of a packager config.
                }
                tick++;
            }
            if(v.includes(fileName)) argIdx = true;
    
    })

    if(Object.keys(tinybuildCfg.server).length === 0) delete tinybuildCfg.server;
    if(Object.keys(tinybuildCfg.bundler).length === 0) delete tinybuildCfg.bundler; 

    return tinybuildCfg;
}