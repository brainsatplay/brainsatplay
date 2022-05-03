import { packager, defaultServer } from "../index.js";

let config = {
    bundler:{
        entryPoints: ['app.js'],
        outfile: 'dist/app',
        bundleBrowser: true, //plain js format
        bundleESM: false, //.esm format
        bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
        bundleHTML: true
      },
    server:defaultServer
}

//bundle and serve
packager(config);