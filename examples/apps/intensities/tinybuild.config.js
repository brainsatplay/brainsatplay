
import { defaultServer } from "../../../src/build/tinybuild.js";

const config = {
    bundler:{
        entryPoints: ['app.js'],
        outfile: 'dist/app',
        bundleBrowser: true, //plain js format
        bundleESM: false, //.esm format
        bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
        bundleHTML: false
      },
    server:defaultServer
}

export default config
