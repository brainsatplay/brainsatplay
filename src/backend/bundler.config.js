import {bundle} from '../build/tinybuild.js'

bundle({
  globalThis: 'backend',
  bundleBrowser: false, //plain js format
  bundleESM: true, //.esm format
  bundleTypes: true, //entry point should be a ts or jsx (or other typescript) file
  bundleCommonJS: false, //cjs format
  bundleIIFE: false,     //iife format, this one is compiled temporarily otherwise for correct .d.ts compilation
  bundleNode: true  //platform = 'node' and any node externals not included. returns a .node.js file
})