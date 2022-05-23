export * from './esbuild/bundler.js'
export * from './esbuild/streamingImportsPlugin.js'
export * from './esbuild/workerPlugin.js'
export * from './node_server/server.js'
export * from './repo.js'

import * as bundler from './esbuild/bundler.js'
import * as server from './node_server/server.js'
import { parseArgs } from './repo.js'

export const defaultConfig = {
    bundler: bundler.defaultBundler,
    server: server.defaultServer
}

export async function packager(config=defaultConfig, exitOnBundle=true) {
    console.time('🎂🎆 Packager finished!');
    //console.log(config);

    if(process?.argv) { //add any command line arguments
        let parsed = parseArgs(process.argv);
        //console.log('args: ', process.argv);
        //console.log('parsed args: ', parsed);
        
        if(parsed.bundler) Object.assign(config.bundler,parsed.bundler);
        else if ('bundler' in parsed) {
            config.bundler = parsed.bundler;
            if(!parsed.server) delete config.server;
        }
        
        if(parsed.server) Object.assign(config.server,parsed.server);
        else if ('server' in parsed) {
            config.server = parsed.server;
            if(!parsed.bundler) delete parsed.bundler;
        }


        //console.log(parsed);
         
        if(parsed.serve) config.serve = true;
        if(parsed.bundle) config.bundle = true;
    }
    
    //console.log('using config: ',config);

    let packaged = {}
    
    if(config.bundler && !config.serve) {
        packaged.bundles = await bundler.bundle(config.bundler);

        if(config.bundler.bundleHTML) { //serve the bundled app page 
            
            let outfile = config.bundler.outfile;
            if(!outfile && config.bundler.outdir) outfile = config.bundler.outdir[0];
            if(!outfile) outfile = 'dist/index' //defaults

            let path = outfile+'.build.html';

            console.log('Default HTML app bundled: ', path);
                        
            if(config.server) config.server.startpage = path;
        }
    }
    
    if((config.server && !config.bundle) || (!config.bundler && !config.server)) { //now serve the default server
        packaged.server = await server.serve(config.server);
    }
    console.timeEnd('🎂🎆 Packager finished!');

    if(((config.bundle || !config.server) && !(!config.bundler && !config.server)) && exitOnBundle) {
        process.exit();
    }

    return packaged;
}

