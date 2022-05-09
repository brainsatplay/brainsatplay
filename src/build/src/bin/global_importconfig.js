#!/usr/bin/env node
//^^^ allows node execution of this file as a node process, else 'tinybuild' will just cd to this file
import {execSync, fork} from 'child_process';
import * as fs from 'fs';
import path from 'path';
import * as tinybuild from '../../tinybuild.js'

import {fileURLToPath} from 'url';

const thismodule = fileURLToPath(import.meta.url);

let dirName = thismodule.split(path.sep);
dirName.pop();
let globalpath = dirName.join(path.sep);

dirName.pop();
dirName.pop();

let mainpath = dirName.join(path.sep);
const config = await import(path.join(process.cwd(), 'tinybuild.config.js'))
tinybuild.packager(config)
//console.log(process.argv);

// function exitHandler(options, exitCode) {

//     if (exitCode || exitCode === 0) console.log('EXIT CODE: ',exitCode);
//     if (options.exit) process.exit();
// }

// //do something when app is closing
// process.on('exit', exitHandler.bind(null,{cleanup:true}));

// //catches ctrl+c event
// process.on('SIGINT', exitHandler.bind(null, {exit:true}));




// let CHILDPROCESS = fork(mainpath+'/tinybuild.js', [...process.argv.splice(2),'GLOBAL'], {cwd:process.cwd()});

// // CHILDPROCESS.on('error',(er)=>{console.error(er);});
// CHILDPROCESS.on('close',(er)=>{console.log("EXIT: ",er); process.exit()});
// CHILDPROCESS.on('exit',(er)=>{console.log("EXIT: ",er); process.exit()});
// // CHILDPROCESS.on('crash',(er)=>{console.log('crash');});
// // if(CHILDPROCESS.stderr) CHILDPROCESS.stderr.on('data',(er)=>{console.error(er);});
// // if(CHILDPROCESS.stdout) CHILDPROCESS.stdout.on('data',(dat)=>{console.error(dat.toString());});



