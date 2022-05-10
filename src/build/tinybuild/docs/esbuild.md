##  [esbuild](https://esbuild.github.io/)


esbuild is an ultra lightweight and fast bundler (based in Rust) used in NodeJS to compile javascript projects. It works using Nodejs and can bundle any javascript and typescript projects generically like other bundlers. It typically takes <100ms to bundle a javascript project, and about 2 seconds if you add the type generation plugin.

esbuild supports the full spectrum of javascript bundling needs we've encountered so far and we have documented and abstracted its typical features fairly well with our settings. See their website for more information. 

Code: [`tinybuild/esbuild`](../esbuild)

## Bundling

Create an index.js (or whatever name) file serving as the entry point script for your webapp or library e.g.:

```js
if(typeof window !== 'undefined') alert('Tinybuild successful!')
console.log('Tinybuild succesful!')
```

Now create a bundler.js file which we'll execute with `node bundler.js`
```js
import {bundle} from 'tinybuild'

bundle({
    entryPoints: ['index.js'],
    outfile: 'dist/index',
    bundleBrowser: true, //plain js format
    bundleESM: false, //.esm format
    bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
    bundleHTML: true
})
```

Our presets will let you quickly bundle apps, browser and node modules, generate types, create "executable" html files from entry points, "webpacked" globals and init scripts, and more with esbuild (minification, sourcemaps, js or browser version targeting, etc.), all with just one input object!

The other half of our preset tools in tinybuild include a boilerplate node development server with optional https, hot reloading, pwa support, python server interoperation examples, and websocket presets so it can work as a quick and dirty production server as well.

## Bundler settings

Any unlisted settings are just typical esbuild settings, which can be configured per build type via the .options tag (e.g. config.options.browser = {...more esbuild settings})
```js

//found in esbuild/bundler.js
const bundlerSettings = {
  bundleBrowser:true, //create plain js build? Can include globals and init scripts
  bundleESM:false,     //create esm module js files
  bundleTypes:false,   //create .d.ts files, the entry point must be a typescript file! (ts, tsx, etc)
  bundleNode:false,   //create node platform plain js build, specify platform:'node' to do the rest of the files 
  bundleIIFE:false,   //create an iife build, this is compiled temporarily to create the types files
  bundleCommonJS:false, //cjs format outputted as .cjs.js
  bundleHTML:false,   //wrap the first entry point file as a plain js script in a boilerplate html file, frontend scripts can be run standalone like a .exe!
  entryPoints:['index.ts'], //entry point file(s). These can include .js, .mjs, .ts, .jsx, .tsx, or other javascript files. Make sure your entry point is a ts file if you want to generate types
  outfile:'dist/index',     //exit point file, will append .js as well as indicators like .esm.js, .node.js for other build flags
  //outdir:[]               //exit point files, define for multiple bundle files
  bundle:true,
  platform: 'browser', //'node' //bundleNode will use 'node' mode by default
  minify: true,
  sourcemap: false,
  external: ['node-fetch'], // []; //we use node-fetch a lot
  allowOverwrite:true, 
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
  outputs:{ //overwrites main config settings for specific use cases
    node:{ 
      external:[] //externals for node environment builds
    }
    //esm:{}
    //commonjs:{}
    //browser:{}
    //iife:{}
  }
  //globalThis:null //'brainsatplay'
  //globals:{[this.entryPoints[0]]:['Graph']}
  //init:{[this.entryPoints[0]]:function(bundle) { console.log('prepackaged bundle script!', bundle); }}
}
//the rest are based on what esbuild offers

```

### Browser Bundling

Browser bundling simply breaks projects down into plain js format, usable e.g. in script tags. 

This includes support for setting module global names as well as specifying specific class names or functions, variables, etc you want to expose via the `globalThis:string` and `globals:{'entryPoints.js':['ClassToSetOnglobalThis']}` settings. 

The `init:{'entryPoints.js':function(bundle){}}` setting lets you specify scripts to append to bundles e.g. to initialize bundled class instances with default settings. It's painless! Currently these extra settings only apply to the browser bundle, which you could override to format for esm via .outputs.browser.format = 'esm' or .outputs.browser.platform = 'node'.

### ESM Bundling

ESM bundles are for enabling the `import`/`export` syntax either in es6 or later javascript environments. Default scripts in browsers or nodejs do not support `import`/`export`. 

### Types Bundling

As long as your entry point is a typescript file, this esbuild plugin can generate .d.ts type files for all of your local script files imported in your project. 

These function sort of like header files in strongly-typed C, which show you all of the functions/classes/variables/etc. and their expected input/output formats (including detailed formatting for objects or array types) in each respective script file. Nice for reference, VSCode otherwise does this on-the-fly even in .js files when working.

### Node Bundling 

This is a setting to generate a plain js file with `platform:'node'` targeted. If you include this setting in the bundler settings object it will apply to all bundles. It allows node modules like `fs` or `ws` etc. to be bundled as needed. 

We use it in some cases to create frontend and backend libraries from the same files that otherwise use the same function calls just with different dependencies if running a client or server, as browsers lack backend server libraries and node lacks frontend tools like animations or the DOM (without an engine anyway). 

### IIFE/CommonJS

These are other bundle formats. We temporarily generate IIFE files so the types plugin runs correctly but it isn't saved unless specified. 

### HTML Bundling

This is an extension to the browser bundler (including the global installs) that will wrap the browser bundle in HTML boilerplate. 

If your script entry point is to your app, then this can automatically be served, and if the app does not require served files etc. then it essentially serves like a built .exe file. 

You may also use it if you want to write quick library or frontend tests with init scripts and test serving scripts to execute in-browser. Currently this test setting only applies to the browser bundle, which you could override to format for esm via .outputs.browser.format = 'esm' or .outputs.browser.platform = 'node'. 

### External

For modules including node libraries that are meant to interoperate with the browser, make sure you exclude them in via the 'external' setting.

### Outputs

To specify specific bundler settings (overwriting the main object), set e.g. settings.outputs.esm = { ...more_esbuild_settings }. Node by default has its own 'external' setting for example so it can include any node modules excluded for browser bundling otherwise.

### And More!

esbuild doesn't have the greatest documentation. You could say there's a lot to... unpack... Anyway, go crazy! This is the best bundler we've used! We've compensated for esbuild's lack of umd support with our globals settings. No complaints so far!
