//hack to get workers to bundle correctly

import path from 'path';
import fs from 'fs';
import { build } from "esbuild";

export const workerPlugin = {
    name:'workerloader',
    setup(builder) {
        builder.onResolve({ filter: /worker.js/}, (args) => {
            if(args.kind.includes('import') || args.kind.includes('require'))
                return { path: path.join(process.cwd(),args.path)};
        });

        builder.onLoad({ filter: /worker.js/},
        async (args) => {
            let outfile = path.join("dist", path.basename(args.path));
            try {
                // bundle worker entry in a sub-process
                //console.time('👷 Bundled worker!')
                await build({
                    entryPoints: [args.path],
                    outfile,
                    minify: true,
                    bundle: true,
                });

                console.log('👷 Bundled worker!', args)
        
                // return the bundled path

                let pkg = fs.readFileSync(path.join(process.cwd(),'package.json')).toString();
                let split = pkg.split('\n');
                
                let name = split.find((ln) => {
                    if(ln.includes('"name"')) {
                        return true;
                    }
                });
                if(name) {
                    name = name.split(':')[1].split('"')[1];
                    //console.log(name);
                }

                return { 
                    contents: `
                    let url;
                    if(typeof process !== 'undefined') {
                        //node
                        url = path.join(process.cwd(),node_modules,${name},${path.basename(args.path)});
                    }
                    else url = window.location.origin+'/node_modules/${name}/${path.basename(args.path)}'; 
                    export default url;
                ` };
            } catch (e) {
                // ...
                console.error("Error bundling worker:", e);
            }
        });
    }
}
