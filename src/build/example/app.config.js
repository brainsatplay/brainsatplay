import { packager, defaultServer } from "../index.js";

let config = {
    bundler:{
        entryPoints: ['app.js'],
        outfile: 'dist/app',
        createBrowser: true, //plain js format
        createESM: false, //.esm format
        createTypes: false, //entry point should be a ts or jsx (or other typescript) file
        createHTML: true
      },
    server:defaultServer
}

//bundle and serve
packager(config);