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
        let parsed = parseArgs(process.argv);
        //console.log('args: ', process.argv);
        //console.log('parsed args: ', parsed);
        if(parsed?.bundler) Object.assign(config.bundler,parsed.bundler);
        if(parsed?.server) Object.assign(config.server,parsed.server);
    }
    
    //console.log('using config: ',config);

    let packaged = {}
    
    if(config.bundler && !config.serve) {
        packaged.bundles = await bundler.bundle(config.bundler);
    }
    if(config.server && !config.bundle) { //now serve the default server
        if(config.bundler.bundleHTML) { //serve the bundled app page 
            
            let outfile = config.bundler.outfile;
            if(!outfile && config.bundler.outdir) outfile = config.bundler.outdir[0];
            if(!outfile) outfile = 'dist/index' //defaults

            let path = outfile+'.build.html';

            console.log('Default HTML app bundled: ', path);
                        
            config.server.startpage = path;
        }
        packaged.server = await server.serve(config.server);
    }
    console.timeEnd('🎂🎆 App packaged!');

    return packaged;
}

