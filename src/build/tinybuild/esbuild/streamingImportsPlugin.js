

import fs from 'fs'
import path from 'path';

export const streamingImportsPlugin = {
  name:'streamImports',
  setup(build) {
    // Handle all import/require paths starting with "http://" or "https://"
    build.onResolve({ filter: /^https?:\/\// }, async (args) => {
      if(args.kind?.includes('import') || args.kind?.includes('require')) {
        let cachepath = path.join(process.cwd(),'node_modules','.cache',path.basename(args.path));
        
        if(!path.extname(cachepath)){ 
          cachepath += '.js'; //should account for other file types like css if they can be imported without extensions
        }
        //if(!cachepath.endsWith('.js') < 0) cachepath += '.js';
        //request http/s resource
        //write file to cache
        //resolve new path to local cache for bundler to target 

        if(!fs.existsSync(cachepath)) {
          if(!fs.existsSync(path.join('node_modules','.cache'))) fs.mkdirSync(path.join('node_modules','.cache'));
          console.time('esbuild cached streamed http(s) import at ' + cachepath);
          let text = await (await httpGet(args.path)).toString('utf-8');
          fs.writeFileSync(cachepath, text); //cache cdn imports etc.
        
        //we should handle skypack stuff too which has nested import/exports from urls (this is a snowpack provided site to turn cdn links into esm bundles)
        // let split = text.split('\n'); 
        // split.forEach((ln,i) => {
        //   if(ln.includes('export ') || ln.includes('import ')) {
        //     ln[i] = 
        //   }
        // })
        // console.log(text.split('\n'));
          console.timeEnd('esbuild cached streamed http(s) import at ' + cachepath);
        }

        return { path:path.join(cachepath) }
      }
    });
  }
}

import http from 'http';
import https from 'https';
//custom plugin to resolve http imports
export function httpGet(url) {
  return new Promise((resolve, reject) => {

    let client = http;

    if (url.toString().indexOf("https") === 0) {
      client = https;
    }

    client.get(url, (resp) => {
      let chunks = [];

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        chunks.push(chunk);
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

    }).on("error", (err) => {
      reject(err);
    });
  });
}
