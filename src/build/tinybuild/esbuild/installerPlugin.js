//hack to get workers to bundle correctly

import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

export const installerPlugin = { //modified from https://github.com/evanw/esbuild/issues/312#issuecomment-698649833
    name:'installer',
    setup(builder) {
        builder.onResolve({ filter: /.*/}, async (args) => {
            if(args.kind.includes('import') || args.kind.includes('require') && !args.importer.includes('node_modules')){
                if(args.path.includes('@') || !(args.path.includes('/') || args.path.includes('\\'))) {
                    if(!fs.existsSync(path.join('node_modules',path.basename(args.path)))) {
                        try {
                            let dep = await import(args.path)//.meta.resolve(args.path);
                            if(!dep) throw 'Not found';
                        } catch (err) {
                            try { 
                                execSync('npm i '+args.path);
                                let mainfile = fs.readFileSync(path.join(process.cwd(),'node_modules',args.path,'package.json')).toString();
                                mainfile = mainfile.split('\n');
                                let main; mainfile.find((s) => {
                                    if(s.includes('"main"')) {
                                        var arrStr = s.split(/[:"";,]/);
                                        arrStr.pop();
                                        main = arrStr.pop();
                                    }
                                })
                                args.path = path.join(process.cwd(),'node_modules',args.path,main);
                            } catch(err) {
                                console.error(err);
                            }
                        }
                    } else {
                        let mainfile = fs.readFileSync(path.join(process.cwd(),'node_modules',args.path,'package.json')).toString();
                        mainfile = mainfile.split('\n');
                        let main; mainfile.find((s) => {
                            if(s.includes('"main"')) {
                                var arrStr = s.split(/[:"";]/);
                                arrStr.pop();
                                main = arrStr.pop();
                            }
                        })
                        args.path = path.join(process.cwd(),'node_modules',args.path,main);
                
                    }
                }
                return { path: args.path };
            }
        });

        // builder.onLoad({ filter: /.*/},
        //     async (args) => {
        //     });
        // }
    }
}



