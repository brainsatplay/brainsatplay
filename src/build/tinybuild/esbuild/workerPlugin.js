//hack to get workers to bundle correctly

import path from 'path';
import fs from 'fs';
import pkg from 'esbuild';
const { build } = pkg;

export const workerPlugin = (config={blobWorkers:true}) => {
    return { //modified from https://github.com/evanw/esbuild/issues/312#issuecomment-698649833
        name:'workerloader',
        setup(builder) {
            builder.onResolve({ filter: /worker.js/}, (args) => {
                if(args.kind.includes('import') || args.kind.includes('require')){
                    return { path: path.join(args.resolveDir,args.path)};
                }
            });
    
            builder.onLoad({ filter: /worker.js/},
            async (args) => {
                let outfile = path.join("dist", path.basename(args.path));
                try {
                    // bundle worker entry in a sub-process
                    //console.time('👷 Bundled worker!')
                    //console.log('onLoad',args,builder);
    
                    await build({
                        entryPoints: [args.path],//[path.join(process.cwd(),'.temp','workerwrapper.js')],
                        outfile,
                        minify: true,
                        bundle: true,
                    });
    
                    console.log('👷 Bundled worker!', args)
            
                    // return the bundled path
    
                    let pkg = fs.readFileSync(
                        path.join(process.cwd(),'package.json')
                    ).toString();
                    
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
    
                    //console.log(outfile);
                    if(config?.blobWorkers) {
                        return { //resolve the file as an object url
                            contents:`
                                let url = URL.createObjectURL(new Blob([String(${JSON.stringify(fs.readFileSync(outfile).toString())})],{type:"text/javascript"}));
                                export default url;
                            `
                        }
                    }
                    return {  //resolve the file as a url
                        contents: `
                        let url;
                        if(typeof process !== 'undefined') {
                            //node
                            url = path.join(process.cwd(),'node_modules','${name}','${outfile}');
                        }
                        else url = window.location.origin+'/node_modules/${name}/${outfile.split(path.sep).join('/')}'; 
                        export default url;
                    ` };
                } catch (e) {
                    // ...
                    console.error("Error bundling worker:", e);
                }
            });
        }
    }

}

