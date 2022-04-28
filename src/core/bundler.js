
//const globalExternals = require('@fal-works/esbuild-plugin-global-externals');


console.time('esbuild');
console.log('esbuild starting!');

const esbuild = require('esbuild');
const {dtsPlugin} = require('esbuild-plugin-d.ts');
const fs = require('fs');


const entryPoints = ['index.ts'];
const moduleGlobalsEntryPoints = ['index_globals.ts'];
const outfile = 'dist/index'; 
//outdir = ['dist/index','dist/index2']; //for multiple files

const createESMJS = true;
const createTypes = true;
const createBrowserJS = true;
const createCommonJS = false;
const createIIFE = false;

const minify = true;
const sourcemap = false;

const platform = 'browser'; //'node'; //set node for node module compilation, uncomment 
const external = ['node-fetch']; // [];


const loader = {
  '.html': 'text',
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
    if(moduleGlobalsEntryPoints.length > 0) { //this has globals declared for bundled modules
      await esbuild.build({ //browser-friendly scripting globals
        entryPoints:moduleGlobalsEntryPoints,
        bundle:true,
        logLevel:'error',
        outfile:outfile+'.js',
         //outdir:outfile, // for multiple entry points
        platform:platform,
        external:external,
        minify:minify,
        loader
      }).then(()=>{
        console.timeEnd('\n Built browser .js file(s)');
      });
    } else {
      await esbuild.build({
        entryPoints,
        bundle:true,
        logLevel:'error',
        outfile:outfile+'.js',
         //outdir:outfile, // for multiple entry points
        platform:platform,
        external:external,
        minify:minify,
        loader
      }).then(()=>{
        console.timeEnd('\n Built browser .js file(s)');
      });
    }
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
    console.time('\n Built .d.ts and .iife.js files');
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



  console.log('esbuild completed!')
  console.timeEnd('esbuild');

}

bundle();

