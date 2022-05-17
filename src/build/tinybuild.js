//tinybuid.js


export * from './tinybuild/packager.js'
import path from 'path'

//uncomment and run `node tinybuild.js`
import {packager} from './tinybuild/packager.js'
import { checkBoilerPlate, checkCoreExists, checkNodeModules, runAndWatch, runOnChange, parseArgs } from './tinybuild/repo.js'

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
export async function runTinybuild(args) {

    console.time('🚀 Starting tinybuild...');

    //console.log(args)
    let tinybuildCfg = {}
    let cmdargs = [];

    if(Array.isArray(args)) {
        cmdargs = args;
        tinybuildCfg = parseArgs(args);
    } //to pass to the restart scripts
    else if (typeof args === 'object') tinybuildCfg = args;
    //check global module path for node_modules folder

    let SERVER_PROCESS;

    //let fileName = __filename.split('/'); fileName = fileName[fileName.length-1]; //try to account for command line position and if the commands are for the current file

    // Get CLI Arguments
    const cliArgs = parseArgs(process.argv)
    // let scriptsrc = path.join(process.cwd(), (cliArgs.path) ? cliArgs.path : 'tinybuild.js')
    // const hasScript= fs.existsSync(scriptsrc)

    if(!tinybuildCfg.path && tinybuildCfg.GLOBAL && fs.existsSync(path.join(process.cwd(),'tinybuild.config.js')))  tinybuildCfg.path = path.join(tinybuildCfg.GLOBAL,'global_packager.js');
    if(!tinybuildCfg.path && fs.existsSync(path.join(process.cwd(),'tinybuild.js'))) tinybuildCfg.path = path.join(process.cwd(),'tinybuild.js')
    if(!tinybuildCfg.path && tinybuildCfg.GLOBAL) tinybuildCfg.path = path.join(tinybuildCfg.GLOBAL,'global_packager.js');
    if(!tinybuildCfg.path) tinybuildCfg.path = 'tinybuild.js';

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

    if(!fs.existsSync(path.join(process.cwd(),'node_modules','tinybuild')) && !fs.existsSync(path.join(process.cwd(),'tinybuild'))) { 
        execSync('npm link tinybuild');
    }

    if(cliArgs.mode !== 'help') {

        if(tinybuildCfg.start) { //execute the tinybuild.js in the working directory instead of our straight packager.

            if(!fs.existsSync(path.join(process.cwd(),'package.json')) || !fs.existsSync(path.join(process.cwd(),tinybuildCfg.path))) {
                await checkBoilerPlate();
            }

            exec('node '+ tinybuildCfg.path,(err,stdout,stderr) => {});

        }
        else if (cliArgs.mode === 'python') { //make sure your node_server config includes a python port otherwise it will serve the index.html and dist
            //check if python server.py folder exists, copy if not
            if(!fs.existsSync(path.join(process.cwd(),'package.json')) || !fs.existsSync(path.join(process.cwd(),tinybuildCfg.path)) || !fs.existsSync(path.join(process.cwd(),'tinybuild'))) {
                checkCoreExists();
                await checkBoilerPlate();
            }

            let distpath = 'dist/index.js';
            if(tinybuildCfg.bundler?.outfile) distpath = tinybuildCfg.bundler.outfile + '.js';
            else if (tinybuildCfg.bundler.entryPoints) {
                let entry = tinybuildCfg.bundler.entryPoints.split('.');
                entry.pop();
                entry.join('.');
                entry.split('/');
                entry = entry.pop();
                distpath = 'dist/'+entry;
            }

            spawn('python',['tinybuild/python/server.py']); //this can exit independently or the node server will send a kill signal

            if(!fs.existsSync(path.join(process.cwd(),'package.json')) || !fs.existsSync(path.join(process.cwd(),tinybuildCfg.path)))
                await checkBoilerPlate()

            SERVER_PROCESS = runAndWatch(tinybuildCfg.path, cmdargs); //runNodemon(tinybuildCfg.path);

        }
        else if (cliArgs.mode === 'dev') { //run a local dev server copy
            //check if dev server folder exists, copy if not
        
            if(!fs.existsSync(path.join(process.cwd(),'package.json')) || !fs.existsSync(path.join(process.cwd(),tinybuildCfg.path)) || !fs.existsSync(path.join(process.cwd(),'tinybuild'))) {
                checkCoreExists();
                checkNodeModules();
                await checkBoilerPlate();
            }

            SERVER_PROCESS = runAndWatch(tinybuildCfg.path, cmdargs); //runNodemon(tinybuildCfg.path);
        }
        else if (tinybuildCfg.bundle) {
            delete tinybuildCfg.serve; //don't use either arg to run both
            tinybuildCfg.server = null;
            runOnChange('node',[tinybuildCfg.path, `config=${(JSON.stringify(tinybuildCfg))}`, ...cmdargs])
        }
        else if (tinybuildCfg.serve) {
            delete tinybuildCfg.bundle; //don't use either arg to run both
            tinybuildCfg.bundler = null;
            SERVER_PROCESS = runAndWatch(tinybuildCfg.path,  [`config=${(JSON.stringify(tinybuildCfg))}`,...cmdargs]);
        }
        else {

            if(!fs.existsSync(path.join(process.cwd(),'package.json')) || !fs.existsSync(path.join(process.cwd(),'tinybuild.config.js')))
                await checkBoilerPlate(); //install boilerplate if repo lacks package.json
            
            if(tinybuildCfg.server !== false) SERVER_PROCESS = runAndWatch(tinybuildCfg.path, [`config=${(JSON.stringify(tinybuildCfg))}`,...cmdargs]);
            else packager(tinybuildCfg); //else just run the bundler and quit
        }

    } 


    if(!SERVER_PROCESS) console.timeEnd('🚀 Starting tinybuild...');
    else {
        SERVER_PROCESS.process.on('spawn',()=>{
            console.timeEnd('🚀 Starting tinybuild...');
        })
    }

    return SERVER_PROCESS;
}


let GLOBALPATH = process.argv.find((a) => {
    if(a.includes('GLOBAL')) return true;
});

if(GLOBALPATH) {
    if(fs.existsSync(path.join(process.cwd(),'tinybuild.config.js'))) {
        import('file:///'+process.cwd()+'/tinybuild.config.js').then((m) => {
            if(typeof m.default?.bundler || typeof mv.default.server) {
                console.log('Using local tinybuild.config.js')
                runTinybuild(Object.assign({GLOBAL:GLOBALPATH.split('=').pop()},m.default));
            } else {
                runTinybuild(process.argv);
            }
        })
    }   
    else runTinybuild(process.argv);
}