//tinybuid.js


export * from './tinybuild/packager.js'
import path from 'path'

//uncomment and run `node tinybuild.js`
<<<<<<< Updated upstream
import { packager, defaultBundler, defaultServer, serve, bundle } from "./src/packager.js";
import { parseArgs } from './src/repo.js'
=======
import { checkBoilerPlate, checkCoreExists, checkNodeModules, runAndWatch, runOnChange } from './tinybuild/repo.js'
>>>>>>> Stashed changes

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
import {exec, execSync, spawn} from 'child_process';

//import nodemon from 'nodemon';



function exitHandler(options, exitCode) {

    //if (exitCode || exitCode === 0) console.log('tinybuild exit code: ',exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));



//pass string argument array or pass a config object
export function runTinybuild(args) {

<<<<<<< Updated upstream
    const tinybuildPath = path.join(process.cwd(), 'tinybuild.js')

    if(!fs.existsSync(tinybuildPath)) {
        fs.writeFileSync(tinybuildPath,
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


async function runTinybuild() {
=======
    let tinybuildCfg = {}
    let cmdargs = [];
>>>>>>> Stashed changes

    if(Array.isArray(args)) {
        cmdargs = args;
        tinybuildCfg = parseArgs(args);
    } //to pass to the restart scripts
    if (typeof args === 'object') tinybuildCfg = args;
    console.time('🚀 Starting tinybuild...');

    //check global module path for node_modules folder

    let SERVER_PROCESS;
<<<<<<< Updated upstream
    
    if(typeof __filename =='undefined') {
        globalThis['__filename'] = import.meta.url;
        let dirname = fileURLToPath(import.meta.url);
        dirname = dirname.split(path.sep);
        dirname.pop();
        globalThis['__dirname'] = dirname.join(path.sep);

        fileName = path.basename(globalThis['__filename']);
    } else {
        fileName = path.basename(__filename);
    }
=======
>>>>>>> Stashed changes

    //let fileName = __filename.split('/'); fileName = fileName[fileName.length-1]; //try to account for command line position and if the commands are for the current file

    // Get CLI Arguments
    const cliArgs = parseArgs(process.argv)
    let scriptsrc = path.join(process.cwd(), (cliArgs.path) ? cliArgs.path : 'tinybuild.js')
    const hasScript= fs.existsSync(scriptsrc)

<<<<<<< Updated upstream
    // Load Config
    let tinybuildCfg = {}
    try {
        tinybuildCfg = (await import(path.join(process.cwd(), cliArgs.config ?? 'tinybuild.config.js'))).default
        console.log('Found tinybuild.config.js file! Still not using though...')
    } catch (e){ 
        if (e.code) console.log('No tinybuild.config.js file')
        else console.log(e)
        console.log('Defaulting to `node tinybuild.js` command.')
    }

    const hasConfig = Object.keys(tinybuildCfg).length > 0

    

    // console.log(tinybuildCfg)

    let argIdx = null;
    let tick = 0;
    var fileName;
=======
    if(!tinybuildCfg.path && tinybuildCfg.GLOBAL) tinybuildCfg.path = path.join(tinybuildCfg.GLOBAL,'global_packager.js');
    if(!tinybuildCfg.path) tinybuildCfg.path = 'tinybuild.js';
>>>>>>> Stashed changes

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

    if(!fs.existsSync(path.join(process.cwd(),'node_modules','tinybuild'))) { 
        execSync('npm link tinybuild',(err)=>{console.log(err)});
    }

<<<<<<< Updated upstream
    // Option 0. Print Help Message
    if (cliArgs.help) {
        console.log(
            `
tinybuild commands:

--------- GLOBAL ---------
'tinybuild' -- runs the boilerplate tinybuild bundler + server settings in the current working directory. It will create missing index.js, package.json (with auto npm/yarn install), and tinybuild.js, and serve on nodemon for hot reloading.

--------- ARGUMENTS ---------
'start' -- runs the equivalent of 'node tinybuild.js' in the current working directory.
'bundle' -- runs the esbuild bundler, can specify config with 'config={"bundler":{}}' via a jsonified (and URI-encoded if there are spaces) object
'serve' -- runs the node development server, can specify config with 'config={"server":{}}' via a jsonified object and (URI-encoded if there are spaces) object
'mode=python' -- runs the development server as well as python which also serves the dist from a separate port (7000 by default). Use 'mode=dev' for the dev server mode (used by default if you just type 'tinybuild')
'path=custom.js' -- target a custom equivalent tinybuild.js entry file (to run the packager or bundler/server)
'port=8080' -- node server port, 8080 by default
'host=localhost' -- node server hostname, localhost by default
'protocol=http' -- node server protocol, http or https
'init' -- initialize a folder as a new tinybuild repository with the necessary files, you can include the source using the below command
'core=true' -- include the tinybuild source in the new repository with an appropriate package.json
'entry=index.js' --name the entry point file you want to create, defaults to index.js
'script=console.log("Hello%20World!")' -- pass a jsonified and URI-encoded (for spaces etc.) javascript string, defaults to a console.log of Hello World!
'config={"server":{},"bundler":{}} -- pass a jsonified and URI-encoded (for spaces etc.) config object for the packager. See the bundler and server settings in the docs.
`
        )
    } 
    
    // Option 1. Run Granular Functions if Config Exists
    else if(hasConfig) {
        if(cliArgs.start) { //execute the tinybuild.js in the working directory instead of our straight packager.

            if(!hasScript) {
                fs.writeFileSync(scriptsrc,
=======
    if(Object.keys(tinybuildCfg).length > 2 || Object.keys(tinybuildCfg?.bundler).length > 0 || Object.keys(tinybuildCfg?.server).length > 0 ) {

        if(tinybuildCfg.start) { //execute the tinybuild.js in the working directory instead of our straight packager.

            if(!fs.existsSync(tinybuildCfg.path)) {
                fs.writeFileSync(tinybuildCfg.path,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    server:{
        host:'${cliArgs.host}',
        port:'${cliArgs.port}',
        protocol:'${cliArgs.protocol}'
    }
=======
    server:${JSON.stringify(tinybuildCfg.server)}
>>>>>>> Stashed changes
}

//bundle and serve
packager(config);
`);
            }

<<<<<<< Updated upstream
            exec('node '+ scriptsrc,(err,stdout,stderr) => {});
=======
            exec('node '+ tinybuildCfg.path,(err,stdout,stderr) => {});

>>>>>>> Stashed changes
        }
        else if (cliArgs.mode === 'python') { //make sure your node_server config includes a python port otherwise it will serve the index.html and dist
            //check if python server.py folder exists, copy if not
            checkCoreExists();

            let distpath = 'dist/index.js';
<<<<<<< Updated upstream
            if(tinybuildCfg.outfile) distpath = tinybuildCfg.outfile + '.js';
            else if (tinybuildCfg.entryPoint) {
                let entry = tinybuildCfg.entryPoint.split('.');
=======
            if(tinybuildCfg.bundler?.outfile) distpath = tinybuildCfg.bundler.outfile + '.js';
            else if (tinybuildCfg.bundler.entryPoints) {
                let entry = tinybuildCfg.bundler.entryPoints.split('.');
>>>>>>> Stashed changes
                entry.pop();
                entry.join('.');
                entry.split('/');
                entry = entry.pop();
                distpath = 'dist/'+entry;
            }

            spawn('python',['tinybuild/python/server.py']); //this can exit independently or the node server will send a kill signal

            checkBoilerPlate()

<<<<<<< Updated upstream
            console.log("nodemon watching for changes...")
            SERVER_PROCESS = runAndWatch(scriptsrc); //runNodemon(scriptsrc);
=======
            SERVER_PROCESS = runAndWatch(tinybuildCfg.path, cmdargs); //runNodemon(tinybuildCfg.path);

>>>>>>> Stashed changes
        }
        else if (cliArgs.mode === 'dev') { //run a local dev server copy
            //check if dev server folder exists, copy if not
            checkCoreExists();
            checkNodeModules();
            checkBoilerPlate();

            SERVER_PROCESS = runAndWatch(tinybuildCfg.path, cmdargs); //runNodemon(tinybuildCfg.path);
        }
<<<<<<< Updated upstream

        // Bundle Only
        else if (cliArgs.bundle) {
            if(tinybuildCfg.bundler) bundle(tinybuildCfg.bundler);
            else bundle(defaultBundler);
        }

        // Serve Only
        else if (cliArgs.serve) {
            if(tinybuildCfg.server) serve(tinybuildCfg);
            else serve(defaultConfig);
        } 
        
        // Whole Packager
        else {
            if(tinybuildCfg.server) packager(tinybuildCfg);
            else packager(defaultConfig);
        }

    } 
    
    // Option 2. Run Script if Ecists
    else if (hasScript) {
            SERVER_PROCESS = runAndWatch(scriptsrc); //runNodemon(scriptsrc);
=======
        else if (tinybuildCfg.bundle) {
            if(tinybuildCfg.bundler) {
                let cfgstring = encodeURIComponent(JSON.stringify(tinybuildCfg.bundler));
                runOnChange('node',[tinybuildCfg.path, `config=${cfgstring}`]) //uses linked global repository
            } else {
                runOnChange('node',[tinybuildCfg.path, ...cmdargs])
            }
        }
        else if (tinybuildCfg.serve) {
            if(tinybuildCfg.server) {
                let cfgstring = encodeURIComponent(JSON.stringify(tinybuildCfg.server));
                SERVER_PROCESS = runAndWatch(tinybuildCfg.path, [`config=${cfgstring}`]);
            }
            else {
                SERVER_PROCESS = runAndWatch(tinybuildCfg.path, cmdargs);
            }
        }
        else {
            SERVER_PROCESS = runAndWatch(tinybuildCfg.path, cmdargs);
        }

    } else if (mode !== 'help') {


        if(fs.existsSync(tinybuildCfg.path)) {

            SERVER_PROCESS = runAndWatch(tinybuildCfg.path, cmdargs); //runNodemon(tinybuildCfg.path);
>>>>>>> Stashed changes
            //execSync('nodemon --exec \"cd example && node tinybuild.js\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv --ignore dist/ --ignore .temp/')
            //let NODEMON_PROCESS = nodemon("-e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv --ignore dist/ --ignore .temp/ --exec node "+tinybuildCfg.path+" --watch "+process.cwd()+"");
            // let NODEMON_PROCESS = spawn(
            //     'nodemon',['--exec', '\'node '+tinybuildCfg.path+'\'','-e', 'ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv','--ignore', 'dist/','--ignore', '.temp/'],
            //     {stdio: ['pipe', 'pipe', 'pipe', 'ipc']});
<<<<<<< Updated upstream
    } 
    
    // Option 3. Generate Boiler (if necessary)
    else {
        checkBoilerPlate();
        console.log("nodemon watching for changes...", process.cwd())
        SERVER_PROCESS = runAndWatch(scriptsrc); //runNodemon(scriptsrc);
=======
        }
        else {

            checkBoilerPlate();

            SERVER_PROCESS = runAndWatch(tinybuildCfg.path); //runNodemon(tinybuildCfg.path);
        }
>>>>>>> Stashed changes
    }


    if(!SERVER_PROCESS) console.timeEnd('🚀 Starting tinybuild...');
<<<<<<< Updated upstream
    else SERVER_PROCESS.process.on('spawn', () => console.timeEnd('🚀 Starting tinybuild...'))
}

if(process.argv.includes('GLOBAL')) runTinybuild();
=======
    else {
        SERVER_PROCESS.process.on('spawn',()=>{
            console.timeEnd('🚀 Starting tinybuild...');
        })
    }

    return SERVER_PROCESS;
}

if(process.argv.find((a) => {
    if(a.includes('GLOBAL')) return true;
})) {
    if(fs.existsSync(path.join(process.cwd(),'tinybuild.config.js'))) {
        import('file:///'+process.cwd()+'/tinybuild.config.js').then((m) => {
            if(typeof m.default?.bundler || typeof mv.default.server) {
                console.log('Using local tinybuild.config.js')
                runTinybuild(m.default);
            } else {
                runTinybuild(process.argv);
            }
        })
    }   
    else runTinybuild(process.argv);
}
>>>>>>> Stashed changes

