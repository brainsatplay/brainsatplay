//node tinybuild/init.js

import { initRepo } from "./repo";

let defaultRepo = {
    dirName:'example',    
    entryPoints:'index.js', //your head js file
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
            entryPoints: [this.entryPoints],
            outfile: 'dist/'+this.entryPoints.slice(0,this.entryPoints.lastIndexOf('.')),
            bundleBrowser: true, //plain js format
            bundleESM: false, //.esm format
            bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
            bundleHTML: true  //wrap the first entry point file as a plain js script in a boilerplate html file, frontend scripts can be run standalone like a .exe!
        },
        server:server.defaultServer
    }, //can set the config here
    includeCore:true, //include the core bundler and node server files, not necessary if you are building libraries or quickly testing an app.js
}

let argIdx = null;
let tick = 0;
var fileName;
if(typeof __filename =='undefined') 
    fileName = path.basename(fileURLToPath(import.meta.url));
else
    fileName = path.basename(__filename);

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
        if(command.includes('dir')) {
            defaultRepo.dirName = command.split('=').pop()
        }
        if(command.includes('entry')) {
            defaultRepo.entryPoints = command.split('=').pop()
        }
        if(command.includes('core')) {
            defaultRepo.includeCore = command.split('=').pop()
        }
        if(command.includes('script')) {
            defaultRepo.initScript = decodeURIComponent(command.split('=').pop())
        }
        if(command.includes('config')) {
            defaultRepo.config = JSON.parse(decodeURIComponent(command.split('=').pop()))
        }
        tick++;
    }
    if(val === fileName) argIdx = true;

});

initRepo(
    defaultRepo.dirName,    
    defaultRepo.entryPoints, //your head js file
    defaultRepo.initScript,
    defaultRepo.config, //can set the config here
    defaultRepo.includeCore, //include the core bundler and node server files, not necessary if you are building libraries or quickly testing an app.js
)
