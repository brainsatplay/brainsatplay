
import { packager, defaultServer } from "tinybuild";
let config = {
    bundler:{
        entryPoints: ['index.js'], //entry file, relative to this file 
        outfile: 'dist/index', //exit file
        //outdir:[] 
        bundleBrowser: true, //plain js format
        bundleESM: false, //.esm format
        bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
        bundleHTML: true //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
    },
    server:defaultServer
}

//bundle and serve
packager(config);
        