
//const globalExternals = require('@fal-works/esbuild-plugin-global-externals');



console.time('esbuild');
console.log('esbuild starting!');
const cwd = process.cwd()
import esbuild from 'esbuild'
import {dtsPlugin} from 'esbuild-plugin-d.ts'
import fs from 'fs'

const defaultConfig = {
  platform: 'browser', //createNodeJS will use 'node' mode by default
  minify: true,
  sourcemap: false,
  external: ['node-fetch'], // [];
  node_external: [], //externals for node environment builds
  loader: {
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
  },
}

export default async function bundle(configs, createTypes=false) {

  if (!Array.isArray(configs)) configs = [configs]
  const tempDir = `.temp`

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)

  await Promise.all(configs.map(async (config, i) => {

    // ------------------ START PROVISIONAL CODE ------------------
    // NOTE: This object works for all Brains@Play bundles. 
    // To save time, I've just conformed some early syntax to this model.
    // TODO: In the future, we should use this format (similar to Rollup) for the bundle() function
    const pkg = { main: 'index.js', module: 'index.esm.js' }

    const genericBAPInputObject = {
      input: './index.ts', // our source file
      output: [
        {
          file: pkg.main,
          format: 'browser', // the preferred format
          // exports: 'named',
          name: config.globalThis,
          globals: config.globals,
          init: config.init
        },
        {
          file: pkg.module,
          format: 'esm'
        }
      ]
    }

    config = genericBAPInputObject

  // ------------------ END PROVISIONAL CODE ------------------

  config = Object.assign(defaultConfig, config)
  config.entryPoints = Array.isArray(config.index) ? config.input : [config.input]
  config.entryPoints = config.entryPoints.map(v => v.split('/').slice(1).join('/')) // Remove first folder
  // TODO: Make sure that relative references are fully maintained

  let temp_files = [...config.entryPoints];

 await Promise.all(config.output.map(async o => {

    const dir = o.dir ?? 'dist'
    const outfile = `${cwd}/${dir}/${o.file}`

    switch(o.format){


  case 'esm': 
    console.time('\n Built .esm.js file(s)')
    await esbuild.build({ //es modules
      entryPoints: config.entryPoints.map(v => `${cwd}/${v}`),//:temp_files,
      bundle:true,
      outfile,
      //outdir:outfile, // for multiple entry points
      format:'esm',
      //platform:'node',
      external: config.external,
      minify: config.minify,
      sourcemap: config.sourcemap,
      loader: config.loader
    }).then(()=>{
      console.timeEnd('\n Built .esm.js file(s)');
    });
    break;
  
  case 'browser': // kinda UMD
    console.time('\n Built UMD-like .js file(s) for browser');

    // Globals
      config.entryPoints.forEach((f,i)=>{  
        if(o.name || o.init || o.globals) {
    
          let ext = f.split('.')[f.split('.').length-1];
          let subpath = f.substring(0,f.indexOf('.'+ext));
    
          let propname = o.name;
      
          let bundleWrapper = `
    
          //we can't circularly export a namespace for index.ts so this is the intermediary
          //import * as bundle from './x' then set globalThis[key] = bundle; The only other option is dynamic importing or a bigger bundler with more of these features built in
          
          export * from '../${subpath}' //still works in esm, getting out of .temp
          
          //this takes all of the re-exported modules in index.ts and contains them in an object
          import * as bundle from '../${subpath}' // getting out of .temp
          
          //webpack? i.e. set the bundled index.ts modules to be globally available? 
          // You can set many modules and assign more functions etc. to the same globals without error
          
          //globals are not declared by default in browser scripts, these files are function scopes!
    
        
          ` //we could do more with this with other settings! It just builds this file instead of the original one then deletes the temp file.
    
          if(o.name) {    
            bundleWrapper += `   
              if(typeof globalThis['${o.name}'] !== 'undefined') Object.assign(globalThis['${o.name}'],bundle); //we can keep assigning the same namespaces more module objects without error!
              else globalThis['${o.name}'] = bundle;
            `
          }

          //declare any keys in the bundle as globals
          if(typeof o.globals === 'object') {
            if(o.globals[f]) { //e.g. {globals:{entryPoints[0]:['Graph','Router','AcyclicGraph']}
              bundleWrapper += `
              (${JSON.stringify(otherkeys)}).forEach((key) => {
                if(bundle[key]) {
                  globalThis[key] = bundle[key];
                }
              });
              `
            }
          }

          /** init scripts per entry point
          e.g. {[entryPoints[0]]:function index(bundle) {
                  console.log('this is a prebundled script to provide some initial values! bundle:', bundle);
                }}
          */
          if(typeof o.init === 'object') {
            if(o.init[f]) { 
              bundleWrapper += `eval(${o.inif[f].toString()})(bundle)`;
            }
          }
    
          if(propname) {
    
            const tempName = tempDir + '/temp_'+f
            fs.writeFileSync( //lets make temp files to bundle our bundles (a wrapper) into globalThis properties (still import-friendly in esm!)
              tempName,
              bundleWrapper
            );
    
            temp_files[i] = tempName;  
          }
    
        }
      });
  


    
    await esbuild.build({ //browser-friendly scripting globals
      entryPoints:temp_files.map(v => `${cwd}/${v}`), //use the modified files with the globals
      bundle:true,
      logLevel:'error',
      outfile, //'.browser.js
        //outdir:outfile, // for multiple entry points
      platform: config.platform,
      external: config.external,
      minify: config.minify,
      loader: config.loader
    }).then(()=>{
      console.timeEnd('\n Built UMD-like .js file(s) for browser');
    });
    break;

  case 'node': 
    console.time('\n Built node .js file(s)');
    
    await esbuild.build({ 
      entryPoints: config.entryPoints.map(v => `${cwd}/${v}`), //use the modified files with the globals
      bundle:true,
      logLevel:'error',
      outfile, //'.browser.js
        //outdir:outfile, // for multiple entry points
      platform:'node',
      external:config.node_external,
      minify: config.minify,
      loader: config.loader
    }).then(()=>{
      console.timeEnd('\n Built node .js file(s)');
    });
    break;

  case 'commonjs': 
    console.time('\n Built .cjs.js');
    await esbuild.build({
      entryPoints: config.entryPoints.map(v => `${cwd}/${v}`),
      bundle:true,
      logLevel:'error',
      outfile,
       //outdir:outfile, // for multiple entry points
      platform: config.platform,
      external: config.external,
      format:'cjs',
      minify: config.minify,
      loader: config.loader
    }).then(()=>{
      console.timeEnd('\n Built .cjs.js');
    });
    break;
  }
}))

  // Create Types Once
  if(createTypes) {
    console.time(`\n Built .d.ts files (${i})`);
    const dir = 'dist' // NOTE: Really just temporary...
    const outfile = `${cwd}/${dir}/index.iife.js`
    await esbuild.build({ //generates types correctly
      entryPoints: config.entryPoints.map(v => `${cwd}/${v}`), //entry point should be a ts file
      bundle:true,
      logLevel:'error',
      outfile, 
      format:'iife',
      platform: config.platform,
      external: config.external,
      minify: config.minify,
      plugins:[ 
        dtsPlugin() 
      ],
      loader: config.loader
    }).then(()=>{
      // TODO: Add actual IIFE support 
      if(!(config.createIIFE)) { 
        //config.entryPoints.forEach((path) => {  
        fs.unlink(outfile, () => {}); //remove the extraneous iife file
        //});
      }
      console.timeEnd(`\n Built .d.ts files (${i})`);
    });
  }

}))

//clean temp files we wrote extra code to
fs.rm(tempDir,{ recursive: true }, () => {})

  console.log('esbuild completed!')
  console.timeEnd('esbuild');
}
