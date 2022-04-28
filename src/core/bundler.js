
//import globalExternals from '@fal-works/esbuild-plugin-global-externals'


console.time('es');
console.log('esbuild starting!');



const entryPoints = ['index.ts'];
const moduleGlobalsEntryPoints = ['index_globals.ts'];
const outfile = 'dist/index';

const createESMJS = true;
const createTypes = true;
const createBrowserJS = true;
const createCommonJS = false;

const minify = true;
const sourcemap = false;

const platform = 'browser'; //'node'; //set node for node module compilation, uncomment 
const external = ['node-fetch']; // [];

const esbuild = require('esbuild');
const {dtsPlugin} = require('esbuild-plugin-d.ts');
//import esbuild from 'esbuild'
//import { dtsPlugin } from 'esbuild-plugin-d.ts'

async function bundle() {

  if(createESMJS) {
    await esbuild.build({ //es modules
      entryPoints,
      bundle:true,
      outfile:outfile+'.esm.js',
      //outdir:outfile, // for multiple entry points
      format:'esm',
      //platform:'node',
      external:external,
      minify:minify,
      sourcemap:sourcemap
    }).then(()=>{
        
    });
  }

  if(createBrowserJS) {
    if(moduleGlobalsEntryPoints.length > 0) { //this has globals declared for bundled modules
      await esbuild.build({ //browser-friendly scripting globals
        entryPoints:moduleGlobalsEntryPoints,
        bundle:true,
        outfile:outfile+'.js',
         //outdir:outfile, // for multiple entry points
        platform:platform,
        external:external,
        minify:minify
      }).then(()=>{
        
      });
    } else {
      await esbuild.build({
        entryPoints,
        bundle:true,
        outfile:outfile+'.js',
         //outdir:outfile, // for multiple entry points
        platform:platform,
        external:external,
        minify:minify
      }).then(()=>{
        
      });
    }
  }

  if(createCommonJS) {
    await esbuild.build({
      entryPoints,
      bundle:true,
      outfile:outfile+'.cjs.js',
       //outdir:outfile, // for multiple entry points
      platform:platform,
      external:external,
      format:'cjs',
      minify:minify
    }).then(()=>{
        
    });
  }

  if(createTypes) {
    await esbuild.build({ //generates types correctly
      entryPoints, //entry point should be a ts file
      bundle:true,
      outfile:outfile+'.iife.js', //don't need this one
       //outdir:outfile, // for multiple entry points
      format:'iife',
      platform:platform,
      external:external,
      minify:minify,
      plugins:[ 
        dtsPlugin() 
      ]
    }).then(()=>{
        
    });
  }



  console.log('esbuild completed!')
  console.timeEnd('es');

}

bundle();

