export * from './esbuild/bundler.js'
export * from './node_server/server.js'
export * from './repo.js'

import * as bundler from './esbuild/bundler.js'
import * as server from './node_server/server.js'
import { parseArgs } from './repo.js'

export const defaultConfig = {
    bundler: bundler.defaultBundler,
    server: server.defaultServer
}

export async function packager(config=defaultConfig) {
    console.time('🎂🎆 App packaged!');

    if(process?.argv) { //add any command line arguments
        Object.assign(config,parseArgs(process.argv))
    }

    let packaged = {}
    
    if(config.bundler) {
        packaged.bundles = await bundler.bundle(config.bundler);
    
        if(config.server) { //now serve the default server
            if(config.bundler.bundleHTML) { //serve the bundled app page 
                
                let outfile = config.bundler.outfile;
                if(!outfile) outfile = config.bundler.outdir[0];

                let path = outfile+'.build.html';

                console.log('Default HTML app bundled: ', path);
                            
                config.server.startpage = path;
            }
            packaged.server = await server.serve(config.server);
        }
    }
    console.timeEnd('🎂🎆 App packaged!');

    return packaged;
}

