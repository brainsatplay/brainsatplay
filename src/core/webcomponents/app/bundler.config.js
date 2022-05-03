import bundle from '../../../bundler.config.js'

bundle({
  entryPoints: ['app.js'],
  outfile: 'dist/app',
  createBrowserJS: true, //plain js format
  createESMJS: false, //.esm format
  createTypes: false, //entry point should be a ts or jsx (or other typescript) file
  createCommonJS: false, //cjs format
  createIIFE: false,     //iife format, this one is compiled temporarily otherwise for correct .d.ts compilation
  createNodeJS: false  //platform = 'node' and any node externals not included. returns a .node.js file
})
