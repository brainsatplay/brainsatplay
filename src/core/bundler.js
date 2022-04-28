
//const globalExternals = require('@fal-works/esbuild-plugin-global-externals');


console.time('esbuild');
console.log('esbuild starting!');

const esbuild = require('esbuild');
const {dtsPlugin} = require('esbuild-plugin-d.ts');
const fs = require('fs');



//setup

const entryPoints = ['index.ts'];
const outfile = 'dist/index'; 
//outdir = ['dist/index','dist/index2']; //for multiple files

const createBrowserJS = true; //plain js format
const createESMJS = true; //.esm format
const createTypes = true; //entry point should be a ts or jsx (or other typescript) file
const createCommonJS = false; //cjs format
const createIIFE = false;     //iife format, this one is compiled temporarily otherwise for correct .d.ts compilation

const minify = true;
const sourcemap = false;

const platform = 'browser'; //'node'; //set node for node module compilation, uncomment 
const external = ['node-fetch']; // [];

const INSTALL_GLOBALLY = {
  //install bundles with additionally available global variables? Makes it browser scripting-compatible with window variables for bundles.
  //globalThis key : imported module (or import * as key from value)
  brainsatplay: entryPoints[0] //set key values for variables to be accessable from browser script via window/globalThis.key.function() etc.
}; //our very own esbuild plugin




const loader = {
  '.html': 'text', //not always necessary but it doesn't hurt
  '.png' : 'file',
  '.jpg' : 'file',
  '.gif' : 'file',
  '.svg': 'file',
  '.woff': 'file',
  '.woff2': 'file',
  '.ttf': 'file',
  '.eot': 'file',
  '.mp3': 'file',
  '.mp4': 'file',
  '.json': 'text',
};



async function bundle() {

  let temp_files = [...entryPoints];
  let to_clean = [];
  if(Object.keys(INSTALL_GLOBALLY).length > 0) {

    entryPoints.forEach((f,i)=>{  

      let ext = f.split('.')[f.split('.').length-1];
      let subpath = f.substring(0,f.indexOf('.'+ext));
      //console.log(f,subpath,ext);

      let propname;

      for(const prop in INSTALL_GLOBALLY) { 
        if(INSTALL_GLOBALLY[prop] === f) {
          propname = prop;
        }
      }

      if(propname) {
        fs.writeFileSync( //lets make temp files to bundle our bundles (a wrapper) into globalThis properties (still import-friendly in node!)
          'temp_'+f,
          `
          //we can't circularly export a namespace for index.ts so this is the intermediary
          //import * as bundle from './x' then set INSTALL_GLOBALS[key] = bundle; The only other option is dynamic importing or a bigger bundler with more of these features built in
          
          export * from './${subpath}' //still works in esm
          
          //this takes all of the re-exported modules in index.ts and contains them in an object
          import * as bundle from './${subpath}'
          
          //webpack? i.e. set the bundled index.ts modules to be globally available? 
          // You can set many modules and assign more functions etc. to the same globals without error
          
          //globals are not declared by default in browser scripts, these files are function scopes!
        
          if(typeof globalThis['${propname}'] !== 'undefined') Object.assign(globalThis['${propname}'],bundle); //we can keep assigning the same namespaces more module objects without error!
          else globalThis['${propname}'] = bundle;
        
          ` //we could do more with this with other settings! It just builds this file instead of the original one then deletes the temp file.
        );

        temp_files[i] = 'temp_'+f;  
        to_clean.push(temp_files[i]);

      }

    });

  }


  if(createESMJS) {
    console.time('\n Built .esm.js file(s)')
    await esbuild.build({ //es modules
      entryPoints,
      bundle:true,
      outfile:outfile+'.esm.js',
      //outdir:outfile, // for multiple entry points
      format:'esm',
      //platform:'node',
      external:external,
      minify:minify,
      sourcemap:sourcemap,
      loader
    }).then(()=>{
      console.timeEnd('\n Built .esm.js file(s)');
    });
  }

  if(createBrowserJS) {
    console.time('\n Built browser .js file(s)');
    
    await esbuild.build({ //browser-friendly scripting globals
      entryPoints:temp_files, //use the modified files with the globals
      bundle:true,
      logLevel:'error',
      outfile:outfile+'.js', //'.browser.js
        //outdir:outfile, // for multiple entry points
      platform:platform,
      external:external,
      minify:minify,
      loader
    }).then(()=>{
      console.timeEnd('\n Built browser .js file(s)');
    });
      
  }

  if(createCommonJS) {
    console.time('\n Built .cjs.js');
    await esbuild.build({
      entryPoints,
      bundle:true,
      logLevel:'error',
      outfile:outfile+'.cjs.js',
       //outdir:outfile, // for multiple entry points
      platform:platform,
      external:external,
      format:'cjs',
      minify:minify,
      loader
    }).then(()=>{
      console.timeEnd('\n Built .cjs.js');
    });
  }

  if(createTypes) {
    console.time('\n Built .d.ts files');
    await esbuild.build({ //generates types correctly
      entryPoints, //entry point should be a ts file
      bundle:true,
      logLevel:'error',
      outfile:outfile+'.iife.js', //don't need this one
       //outdir:outfile, // for multiple entry points
      format:'iife',
      platform:platform,
      external:external,
      minify:minify,
      plugins:[ 
        dtsPlugin() 
      ],
      loader
    }).then(()=>{
      if(!createIIFE) {
        entryPoints.forEach((path) => {
          fs.unlinkSync(outfile+'.iife.js'); //remove the extraneous iife file
        });
      }
      console.timeEnd('\n Built .d.ts files');
    });
  }

  //clean temp files we wrote extra code to
  to_clean.map(f => fs.unlinkSync(f));


  console.log('esbuild completed!')
  console.timeEnd('esbuild');

}


bundle();

