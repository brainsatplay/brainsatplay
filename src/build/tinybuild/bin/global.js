#!/usr/bin/env node
//^^^ allows node execution of this file as a node process, else 'tinybuild' will just cd to this file
import {execSync, fork} from 'child_process';
import * as fs from 'fs';
import {fileURLToPath} from 'url';

const thismodule = fileURLToPath(import.meta.url);

let path = thismodule.split('\\');
let globalpath = path.pop();
globalpath = path.join('/');


path.pop();
path.pop();
let mainpath = path.join('/')

//console.log(globalpath,fs.existsSync(mainpath+'/node_modules'));


if(!fs.existsSync(mainpath+'/node_modules')) {
    console.log('Installing node modules for tinybuild...')
    if(process.argv.includes('yarn'))  execSync(`cd ${mainpath} && yarn && cd ${process.cwd()}`); //install the node modules in the global repo
    else execSync(`cd ${mainpath} && npm i && cd ${process.cwd()}`); //install the node modules in the global repo
    console.log('Installed node modules for tinybuild!')
}

//console.log(process.argv);

let CHILDPROCESS = fork(mainpath+'/tinybuild.js', process.argv.splice(2), {cwd:process.cwd()});

// CHILDPROCESS.on('error',(er)=>{console.error(er);});
CHILDPROCESS.on('close',(er)=>{console.log("EXIT: ",er); process.exit()});
CHILDPROCESS.on('exit',(er)=>{console.log("EXIT: ",er); process.exit()});
// CHILDPROCESS.on('crash',(er)=>{console.log('crash');});
// if(CHILDPROCESS.stderr) CHILDPROCESS.stderr.on('data',(er)=>{console.error(er);});
// if(CHILDPROCESS.stdout) CHILDPROCESS.stdout.on('data',(dat)=>{console.error(dat.toString());});

