
//const globalExternals = require('@fal-works/esbuild-plugin-global-externals');


//const cwd = process.cwd()
import esbuild from 'esbuild'
import pkg from 'esbuild-plugin-d.ts';
const {dtsPlugin} = pkg;
import {streamingImportsPlugin} from './streamingImportsPlugin.js'
import {workerPlugin} from './workerPlugin.js'
import { installerPlugin } from './installerPlugin.js';

import fs from 'fs'
import path from 'path'

export const defaultBundler = {
  bundleBrowser:true, //create plain js build? Can include globals and init scripts
  bundleESM:false,     //create esm module js files
  bundleTypes:false,   //create .d.ts files, the entry point must be a typescript file! (ts, tsx, etc)
  bundleNode:false,   //create node platform plain js build, specify platform:'node' to do the rest of the files 
  bundleIIFE:false,   //create an iife build, this is compiled temporarily to create the types files
  bundleCommonJS:false, //cjs format outputted as .cjs.js
  bundleHTML:false,   //wrap the first entry point file as a plain js script in a boilerplate html file, frontend scripts can be run standalone like a .exe!
  entryPoints:['index.js'], //entry point file(s). These can include .js, .mjs, .ts, .jsx, .tsx, or other javascript files. Make sure your entry point is a ts file if you want to generate types
  outfile:'dist/index',     //exit point file, will append .js as well as indicators like .esm.js, .node.js for other build flags
  //outdir:[]               //exit point files, define for multiple bundle files
  bundle:true,
  platform: 'browser', //'node' //bundleNode will use 'node' mode by default
  minify: true,
  sourcemap: false,
  plugins:[streamingImportsPlugin,workerPlugin({blobWorkers:true}),installerPlugin], //{importmap:{imports:{[key:string]: string}}, directory: string}
  //plugins:[cache(defaultBundler.cachePluginSettings), dtsPlugin()],
  external: ['node-fetch'], // [];
  allowOverwrite:true, 
  loader: { //just a bunch of path import resolvers, will supply urls if marked 'file', text if marked 'text', and dataurls (blobs) if marked 'dataurl'
    '.html': 'text', //not always necessary but it doesn't hurt
    '.json': 'text','.txt': 'text','.yaml': 'text', '.toml':'text', '.xml' : 'text','.xhtml': 'text', '.md':'text',
    '.gitignore':'file','.wasm':'file',
    '.png' : 'file','.PNG' : 'file','.jpg' : 'file','.gif' : 'file','.ico' : 'file','.bmp' : 'file',
    '.svg': 'file','.webm': 'file', '.mid': 'file', '.midi': 'file',
    '.woff': 'file','.woff2': 'file','.ttf': 'file','.otf': 'file','.eot': 'file','.fnt': 'file','.fon': 'file',
    '.mp3': 'file','.wav': 'file','.wma': 'file','.aac': 'file',
    '.m4a': 'file','.avi': 'file','.flac': 'file','.flv': 'file',
    '.mov': 'file','.mp4': 'file','.mkv': 'file', '.h264':'file','.3gp':'file',
    '.doc' : 'file', '.docx' : 'file','.pdf' : 'file','.odt':'file', '.ods':'file', '.odp':'file', '.ppt':'file','.pptx': 'file', '.odp': 'file', 
    '.csv' : 'file','.xls' : 'file','.xlsx': 'file','.sql': 'file',
    '.obj': 'file','.collada': 'file','.x3d': 'file','.fbx': 'file',  //3d stuff
    '.3ds': 'file','.flc': 'file','.swf': 'file',
    '.step': 'file','.stl': 'file', 
    '.py': 'file', '.cpy': 'file', '.c': 'file', '.cpp': 'file', '.h': 'file', '.hpp': 'file', '.sh':'file','.cs':'file','.swift':'file','.vb':'file', //code stuff
    '.bin': 'file','.cmd': 'file', '.cmd': 'file', '.msi': 'file', '.com': 'file','.jar': 'file','.class':'file','.rss': 'file','.jsp': 'file','.cgi': 'file',
    '.brd': 'file','.sch': 'file','.gbr': 'file','.gb': 'file','.gerb': 'file','.drl': 'file', //pcb stuff
    '.exe': 'file','.dmg': 'file','.elf': 'file', '.app': 'file', '.ini' : 'file', '.epub': 'file', '.csh':'file', '.rtf':'file', '.jsonld':'file', '.mpkg':'file',
    '.zip': 'file','.7z': 'file', '.rar': 'file','.gz': 'file', '.tar': 'file', '.iso': 'file', '.toast': 'file', '.vcd': 'file',
    '.vcf': 'file', '.cer': 'file', '.pem': 'file', '.pfx': 'file', '.key': 'file',  '.sys': 'file',  '.tmp': 'file',
    '.edf':'file','.bdf':'file','.eeg':'file','.vhdr':'file','.vmrk':'file','.set':'file','.fdt':'file', //bunch of biodata formats
    '.fif':'file','.dir':'file','.sqd':'file','.cnt':'file','.gdf':'file','.egi':'file','.mff':'file','.nxe':'file','.htps':'file','.elc':'file','.sfp':'file',
  },
  outputs:{ //overwrites main config settings for specific use cases
    node:{ 
      external:[] //externals for node environment builds
    },
    //commonjs:{}
    //browser:{}
    //esm:{}
    //iife:{}
  },
  defaultConfig: true //indicates this object is the default config
  //globalThis:null //'brainsatplay'
  //globals:{[this.entryPoints[0]]:['Graph']}
  //init:{[this.entryPoints[0]:function(bundle) { console.log('prepackaged bundle script!', bundle); }]}
}


export async function bundle(configs) {


  console.time('✨ esbuild');
  console.log('✨ esbuild starting! ✨');
  
  if (!Array.isArray(configs)) configs = [configs];


  await Promise.all(configs.map(async (config, i) => {

    config = Object.assign(defaultBundler, config);
    // ------------------ START PROVISIONAL CODE ------------------
    // NOTE: This object works for all Brains@Play bundles. 
    // To save time, I've just conformed some early syntax to this model.
    // TODO: In the future, we should use this format (similar to Rollup) for the bundle() function

    // ------------------ END PROVISIONAL CODE ------------------
    if(config.entryPoints && !Array.isArray(config.entryPoints)) config.entryPoints = [config.entryPoints]; 
    if(config.input)
      config.entryPoints = Array.isArray(config.index) ? config.input : [config.input]
    
    // TODO: Make sure that relative references are fully maintained

    const bundles = {
      config
    }
    
    if(config.bundleBrowser){ // kinda UMD
      bundles.browser = await bundleBrowser(config);
    }
    
    // console.log('CONFIG', config)
    if(config.bundleESM) {
      bundles.esm = await bundleESM(config);
    }

    if(config.bundleNode) {
      bundles.node = await bundleNode(config);
    }
    
    if(config.bundleCommonJS) {
      bundles.commonjs = await bundleCommonJS(config);
    }

    // Create Types Once
    if(config.bundleTypes == true) {
      bundles.ts = await bundleTypes(config);
    }

    return bundles;

  }))


  console.log('✨ esbuild completed! ✨')
  console.timeEnd('✨ esbuild');
  //process.exit(0); // Manually make process exit
}

//run after bundling
export function bundleHTML(fromJSPath, config) {

  let split = fromJSPath.split('.'); split.pop();
  let p = split.join('.')+'.build.html';

  let template =     
  `<!DOCTYPE html>
  <head>
`

let outfile;
if(config.outdir) outfile = config.outdir[0];
else outfile = config.outfile;

if(fs.existsSync(path.join(process.cwd(),outfile+'.css'))) {
  template += `<style>${fs.readFileSync(path.join(process.cwd(),outfile+'.css')).toString()}</style>` 
}

template += `</head>
<body>  
  <script>
    ${fs.readFileSync(fromJSPath).toString()}
  </script>
</body>
`

  return fs.writeFileSync(
    p,
    template
  );
}


//bundle browser-exectuable js with optional globals and init functions (e.g. to set window variables)
export async function bundleBrowser(config) {
  console.time('\n ☄️ Built UMD-like .js file(s) for browser');

  const tempDir = `.temp`;
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  if(!config.defaultConfig) config = Object.assign(JSON.parse(JSON.stringify(defaultBundler)),config); //add defaults 

  let entryPoints = config.entryPoints;
  const cwd = process.cwd()
  if(!config.entryPoints[0]?.includes(cwd)) config.entryPoints = config.entryPoints.map(v => cwd+'/'+v) // Append file name to current dir to get it in node
  
  let cfg = Object.assign({},config);
  let modifier;
  if(typeof config.bundleBrowser === 'object') modifier = config.bundleBrowser;
  else if(config.outputs?.browser) modifier = config.outputs.browser;
  if(modifier) {
    Object.assign(cfg,modifier);
    if(modifier.entryPoints) {
      cfg.entryPoints = modifier.entryPoints.map(v => `${cwd}/${v}`);
    }
  }
  cfg.logLevel = 'error';
  if(cfg.format) delete cfg.format;
  if(cfg.outfile) {
    cfg.outfile += '.js';
  }
  else if (cfg.outdir) {
    if(cfg.outfile) delete cfg.outfile;
    cfg.outdir = cfg.outdir.map(v => v+'.js');
  }

  cleanupConfig(cfg);
  
  // Globals   
  let temp_files = [...config.entryPoints];
  if(modifier?.entryPoints) {
    temp_files = [...modifier.entryPoints];
    entryPoints = modifier.entryPoints;
  }

  cfg.entryPoints = temp_files;

  entryPoints.forEach((f,i)=>{  
    if(config.globalThis || config.init || config.globals) {

      let ext = f.split('.')[f.split('.').length-1];
      let subpath = f.substring(0,f.indexOf('.'+ext));

      let propname = config.globalThis;
  
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

      if(propname) {    
        bundleWrapper += `   
          if(typeof globalThis['${propname}'] !== 'undefined') Object.assign(globalThis['${propname}'],bundle); //we can keep assigning the same namespaces more module objects without error!
          else globalThis['${propname}'] = bundle;
        `
      }

      //declare any keys in the bundle as globals
      if(typeof config.globals === 'object') {
        if(config.globals[f]) { //e.g. {globals:{entryPoints[0]:['Graph','Router','AcyclicGraph']}
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
      if(typeof config.init === 'object') {
        if(config.init[f]) { 
          bundleWrapper += `eval(${o.inif[f].toString()})(bundle)`;
        }
      }

      if(propname) {    
        const tempName = cwd + '/' + tempDir + '/temp_'+f.split('/').pop();
        fs.writeFileSync( //lets make temp files to bundle our bundles (a wrapper) into globalThis properties (still import-friendly in esm!)
          tempName,
          bundleWrapper
        );

        temp_files[i] = tempName;  
      }

    }
  });

  return await esbuild.build(cfg).then(()=>{
    console.timeEnd('\n ☄️ Built UMD-like .js file(s) for browser');

    if(config.bundleHTML) { //bundle the outfile into a boilerplate html

      let outfile = cfg.outfile;
      if(!outfile) outfile = cfg.outdir[0]

      bundleHTML(outfile, config);

    }
  
    //clean temp files we wrote extra code to
    if(fs.existsSync(tempDir)) fs.rmSync(tempDir,{ recursive: true })


  }).catch((er)=>{console.error('Exited with error:',er); process.exit();});
}

//bundle .esm.js
export async function bundleESM(config) {
  console.time('\n 🌌 Built .esm.js file(s)')
  
  if(!config.defaultConfig) config = Object.assign(JSON.parse(JSON.stringify(defaultBundler)),config); //add defaults 

  const cwd = process.cwd()
  if(!config.entryPoints[0]?.includes(cwd)) config.entryPoints = config.entryPoints.map(v => cwd+'/'+v) // Append file name to current dir to get it in node

  let cfg = Object.assign({}, config);
  let modifier;
  if(typeof config.bundleESM === 'object') modifier = config.bundleESM;
  else if(config.outputs?.esm) modifier = config.outputs.esm;
  if(modifier) {
    Object.assign(cfg,modifier);
    if(modifier.entryPoints) {
      cfg.entryPoints = modifier.entryPoints.map(v => `${cwd}/${v}`);
    }
  }
  
  cfg.format = 'esm';
  if(cfg.outfile) {
    cfg.outfile += '.esm.js';
  }
  else if (cfg.outdir) {
    if(cfg.outfile) delete cfg.outfile;
    cfg.outdir = cfg.outdir.map(v => v+'.esm.js');
  }

  cleanupConfig(cfg);

  return await esbuild.build(cfg).then(()=>{
    console.timeEnd('\n 🌌 Built .esm.js file(s)');
  }).catch((er)=>{console.error('Exited with error:', er); process.exit();});
}

//bundle node defaults
export async function bundleNode(config) {
  console.time('\n ☀️ Built node .js file(s)');
  
  if(!config.defaultConfig) config = Object.assign(JSON.parse(JSON.stringify(defaultBundler)),config); //add defaults 

  const cwd = process.cwd()
  if(!config.entryPoints[0]?.includes(cwd)) config.entryPoints = config.entryPoints.map(v => cwd+'/'+v) // Append file name to current dir to get it in node

  let cfg = Object.assign({},config);
  cfg.external = config.node_external;
  let modifier;
  if(typeof config.bundleNode === 'object') modifier = config.bundleNode;
  else if(config.outputs?.node) modifier = config.outputs.node;
  if(modifier) {
    Object.assign(cfg,modifier);
    if(modifier.entryPoints) {
      cfg.entryPoints = modifier.entryPoints.map(v => `${cwd}/${v}`);
    }
  }
  cfg.platform = 'node';
  cfg.logLevel = 'error';
  if(cfg.format) delete cfg.format;
  if(cfg.outfile) {
    cfg.outfile += '.node.js';
  }
  else if (cfg.outdir) {
    if(cfg.outfile) delete cfg.outfile;
    cfg.outdir = cfg.outdir.map(v => v+'.node.js');
  }

  cleanupConfig(cfg);

  return await esbuild.build(cfg).then(()=>{
    console.timeEnd('\n ☀️ Built node .js file(s)');
  }).catch((er)=>{console.error('Exited with error:', er); process.exit();});
}

//bundle commonjs
export async function bundleCommonJS(config) {
  console.time('\n 🌙 Built .cjs');
  
  if(!config.defaultConfig) config = Object.assign(JSON.parse(JSON.stringify(defaultBundler)),config); //add defaults 

  const cwd = process.cwd()
  if(!config.entryPoints[0]?.includes(cwd)) config.entryPoints = config.entryPoints.map(v => cwd+'/'+v) // Append file name to current dir to get it in node

  let cfg = Object.assign({},config);
  let modifier;
  if(typeof config.bundleCommonJS === 'object') modifier = config.bundleCommonJS;
  else if(config.outputs?.commonjs) modifier = config.outputs.commonjs;
  if(modifier) {
    Object.assign(cfg,modifier);
    if(modifier.entryPoints) {
      cfg.entryPoints = modifier.entryPoints.map(v => `${cwd}/${v}`);
    }
  }
  cfg.logLevel = 'error';
  cfg.format = 'cjs';
  if(cfg.outfile) {
    cfg.outfile += '.cjs';
  }
  else if (cfg.outdir) {
    if(cfg.outfile) delete cfg.outfile;
    cfg.outdir = cfg.outdir.map(v => v+'.cjs');
  }

  cleanupConfig(cfg);

  return await esbuild.build(cfg).then(()=>{
    console.timeEnd('\n 🌙 Built .cjs');
  }).catch((er)=>{console.error('Exited with error:', er); process.exit();});
}

///bundle .d.ts and .iife.js files
export async function bundleTypes(config) {
  console.time(`\n 🪐 Built .d.ts files`);
  
  if(!config.defaultConfig) config = Object.assign(JSON.parse(JSON.stringify(defaultBundler)),config); //add defaults 

  const cwd = process.cwd()
  if(!config.entryPoints[0]?.includes(cwd)) config.entryPoints = config.entryPoints.map(v => cwd+'/'+v) // Append file name to current dir to get it in node

  let cfg = Object.assign({},config);
  let modifier;
  if(typeof config.bundleIIFE === 'object') modifier = config.bundleIIFE;
  else if(config.outputs?.iife) modifier = config.outputs.iife;
  if(modifier) {
    Object.assign(cfg,modifier);
    if(modifier.entryPoints) {
      cfg.entryPoints = modifier.entryPoints.map(v => `${cwd}/${v}`);
    }
  }
  cfg.logLevel = 'error';
  cfg.format = 'iife';
  if(cfg.outfile) {
    cfg.outfile += '.iife.js';
  }
  else if (cfg.outdir) {
    if(cfg.outfile) delete cfg.outfile;
    cfg.outdir = cfg.outdir.map(v => v+'.iife.js');
  }
  cfg.plugins = [
    streamingImportsPlugin,
    dtsPlugin()
  ];

  cleanupConfig(cfg);

  //generates types correctly
  return await esbuild.build(cfg).then(()=>{
    if(!(config.bundleIIFE)) { 
      if(cfg.outfile) {
        fs.unlink(cfg.outfile, () => {}); //remove the extraneous iife file
      }
      else if (cfg.outdir) {
        cfg.outdir.map(v => fs.unlink(v,()=>{}));
      }
    }
    console.timeEnd(`\n 🪐 Built .d.ts files`);
  }).catch((er)=>{console.error('Exited with error:', er); process.exit();});
}


//deletes any optional keys we use to customize configs
function cleanupConfig(cfg={}) { //should just use a defaults list for the esbuild object
  delete cfg.bundleBrowser;
  delete cfg.bundleESM;
  delete cfg.bundleIIFE;
  delete cfg.bundleNode;
  delete cfg.bundleCommonJS;
  delete cfg.bundleTypes;
  delete cfg.outputs;
  delete cfg.globalThis;
  delete cfg.globals;
  delete cfg.init;
  delete cfg.bundleHTML;
  delete cfg.defaultConfig;
}




// const pkg = { main: 'dist/index.js', module: 'dist/index.esm.js' }

// const genericBAPInputObject = {
//   input: config.entryPoints[0] ?? './index.ts', // our source file
//   output: [
//     {
//       file: config.outfile ?? pkg.main,
//       format: 'browser', // the preferred format
//       // exports: 'named',
//       name: config.globalThis,
//       globals: config.globals,
//       init: config.init,
//       html: config.html
//     },
//     {
//       file: pkg.module,
//       format: 'esm'
//      }]
//    }
//     config = genericBAPInputObject
//     console.log(config)

//   // ------------------ END PROVISIONAL CODE ------------------

//   config = Object.assign(defaultConfig, config)
//   config.entryPoints = Array.isArray(config.index) ? config.input : [config.input]
//   config.entryPoints = config.entryPoints.map(v => v.split('/').slice(1).join('/')) // Remove first folder
//   // TODO: Make sure that relative references are fully maintained

//   let temp_files = [...config.entryPoints];

//  await Promise.all(config.output.map(async o => {

//     // const dir = o.dir ?? 'dist'
//     const outfile = `${cwd}/${o.file}`

//     switch(o.format){


//   case 'esm': 
//     console.time('\n Built .esm.js file(s)')
//     await esbuild.build({ //es modules
//       entryPoints: config.entryPoints.map(v => `${cwd}/${v}`),//:temp_files,
//       bundle:true,
//       outfile,
//       //outdir:outfile, // for multiple entry points
//       format:'esm',
//       //platform:'node',
//       external: config.external,
//       minify: config.minify,
//       sourcemap: config.sourcemap,
//       loader: config.loader
//     }).then(()=>{
//       console.timeEnd('\n Built .esm.js file(s)');
//     });
//     break;
  
//   case 'browser': // kinda UMD
//     console.time('\n Built UMD-like .js file(s) for browser');

//     // Globals
//       config.entryPoints.forEach((f,i)=>{  
//         if(o.name || o.init || o.globals) {
    