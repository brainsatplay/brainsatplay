import bundle from '../bundler.config.js'

bundle({
  globalThis: 'frontend',
  createBrowser: true, //plain js format
  createESM: true, //.esm format
  createTypes: true, //entry point should be a ts or jsx (or other typescript) file
  createCommon: false, //cjs format
  createIIFE: false,     //iife format, this one is compiled temporarily otherwise for correct .d.ts compilation
  createNode: false  //platform = 'node' and any node externals not included. returns a .node.js file
})