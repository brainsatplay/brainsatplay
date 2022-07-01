import {bundle} from '../../build/tinybuild.js'


bundle({
  globalThis: 'webrtc',
  createBrowserJS: true, //plain js format
  createESMJS: true, //.esm format
  createTypes: true, //entry point should be a ts or jsx (or other typescript) file
  createCommonJS: false, //cjs format
  createIIFE: false,     //iife format, this one is compiled temporarily otherwise for correct .d.ts compilation
  createNodeJS: true  //platform = 'node' and any node externals not included. returns a .node.js file
})