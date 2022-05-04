export * from './esbuild/bundler.js'
export * from './node_server/server.js'

import * as bundler from './esbuild/bundler.js'
import * as server from './node_server/server.js'

import * as fs from 'fs';
import * as path from 'path'

export const defaultConfig = {
    bundler: bundler.defaultBundler,
    server: server.defaultServer
}

export async function packager(config=defaultConfig) {
    console.time('App packaged!');

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
    console.timeEnd('App packaged!');

    return packaged;
}


//initialize a project repo with a simplified packager set up for you.
// If you set includeCore to true then the new repo can be used as a template for creating more repos with standalone tinybuild files
export async function initRepo(
    dirName='example',    
    entryPoint='index.js', //your head js file
    initScript=`
        /* 
            esbuild + nodejs (with asyncio python) development/production server. 
            Begin your javascript application here. This file serves as a simplified entry point to your app, 
            all other scripts you want to build can stem from here if you don't want to define more entryPoints 
            and an outdir in the bundler settings.
        */

        document.body.style.backgroundColor = '#101010'; //page color
        document.body.style.color = 'white'; //text color
        let div = document.createElement('div');
        div.innerHTML = 'Hello World!';
        document.body.appendChild(div);

        alert('tinybuild successful!');
    `,
    config={
        bundler:{
            entryPoints: [entryPoint],
            outfile: 'dist/'+entryPoint.slice(0,entryPoint.lastIndexOf('.')),
            bundleBrowser: true, //plain js format
            bundleESM: false, //.esm format
            bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
            bundleHTML: true
        },
        server:server.defaultServer
    }, //can set the config here
    includeCore=true, //include the core bundler and node server files, not necessary if you are building libraries or quickly testing an app.js
    ) {

    if(!fs.existsSync(dirName)) fs.mkdirSync(dirName); //will be made in the folder calling the init script

    fs.writeFileSync(dirName+'/'+entryPoint,
        // app initial entry point
        initScript
    )


    //copy the bundler files
    if(!includeCore){
        //tinybuild.js file using the npm package 
        fs.writeFileSync(dirName+'/tinybuild.js',
        `
            //use command 'node tinybuild.js' to build and run after doing npm install!

            import {packager, defaultServer, initRepo} from 'tinybuild'
            let config = ${JSON.stringify(config)};
            
            //bundle and serve
            packager(config);
        `);
    
            
        //package.json, used to run npm install then npm start
        fs.writeFileSync(dirName+'/package.json',`
        {
            "name": "tinybuild",
            "version": "0.0.0",
            "description": "Barebones esbuild and test node server implementation. For building",
            "main": "index.js",
            "type":"module",
            "scripts": {
                "start": "npm run startdev",
                "build": "node tinybuild.js",
                "concurrent": "concurrently \"npm run python\" \"npm run startdev\"",
                "dev": "npm run pip && npm i --save-dev concurrently && npm i --save-dev nodemon && npm run concurrent",
                "startdev": "nodemon --exec \"node tinybuild.js\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv",
                "python": "python python/server.py",
                "pip": "pip install quart && pip install websockets",
                "pwa": "npm i workbox-cli && workbox generateSW node_server/pwa/workbox-config.js && npm run build && npm start"
            },
            "keywords": [
                "esbuild"
            ],
            "author": "Joshua Brewster",
            "license": "AGPL-3.0-or-later",
            "dependencies": {
            },
            "devDependencies": {
                "tinybuild: "~0.0.6",
                "concurrently": "^7.1.0",
                "nodemon": "^2.0.15",
                "ws": "^8.5.0",
            },
            "nodemonConfig": {
                "env": {
                "NODEMON": true
                },
                "ignore": [
                "dist/"
                ]
            }
        }
        `);


    }
    else { //tinybuild js using a copy of the source and other prepared build files
        config.bundler.bundleHTML = false; //we'll target the index.html file instead of building this one

        let outfile = config.bundler.outfile;
        if(config.bundler.outdir) outfile = outdir[0];

        //index.html file
        fs.writeFileSync(dirName+'/index.html',
        `<!DOCTYPE html>
        <head></head>
        <body>
            <script src='${outfile}.js'></script>
        </body>`);

        //https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
        function copyFolderRecursiveSync( source, target ) {
            var files = [];
        
            // Check if folder needs to be created or integrated
            var targetFolder = path.join( target, path.basename( source ) );
            if ( !fs.existsSync( targetFolder ) ) {
                fs.mkdirSync( targetFolder );
            }
        
            // Copy
            if ( fs.lstatSync( source ).isDirectory() ) {
                files = fs.readdirSync( source );
                files.forEach( function ( file ) {
                    var curSource = path.join( source, file );
                    if ( fs.lstatSync( curSource ).isDirectory() ) {
                        copyFolderRecursiveSync( curSource, targetFolder );
                    } else {
                        copyFileSync( curSource, targetFolder );
                    }
                } );
            }
        }

        copyFolderRecursiveSync('tinybuild',dirName+'/tinybuild');

        fs.writeFileSync(dirName+'/tinybuild.js',`
            //create an init script (see example)
            //node init.js to run the packager function
            
            export * from './tinybuild/packager'
            import { packager, defaultServer, initRepo } from './tinybuild/packager'
        
            let config = ${JSON.stringify(config)};
            
            //bundle and serve
            packager(config);
        `);

            
        //package.json, used to run npm install then npm start
        fs.writeFileSync(dirName+'/package.json',`
        {
            "name": "tinybuild",
            "version": "0.0.0",
            "description": "Barebones esbuild and test node server implementation. For building",
            "main": "index.js",
            "type":"module",
            "scripts": {
                "start": "npm run startdev",
                "build": "node tinybuild.js",
                "concurrent": "concurrently \"npm run python\" \"npm run startdev\"",
                "dev": "npm run pip && npm i --save-dev concurrently && npm i --save-dev nodemon && npm run concurrent",
                "startdev": "nodemon --exec \"node tinybuild.js\" -e ejs,js,ts,jsx,tsx,css,html,jpg,png,scss,txt,csv",
                "python": "python python/server.py",
                "pip": "pip install quart && pip install websockets",
                "pwa": "npm i workbox-cli && workbox generateSW node_server/pwa/workbox-config.js && npm run build && npm start"
            },
            "keywords": [
                "esbuild"
            ],
            "author": "Joshua Brewster",
            "license": "AGPL-3.0-or-later",
            "dependencies": {
            },
            "devDependencies": {
                "concurrently": "^7.1.0",
                "esbuild": "^0.14.38",
                "esbuild-plugin-d.ts":"^1.1.0",
                "nodemon": "^2.0.15",
                "ws": "^8.5.0",
            },
            "nodemonConfig": {
                "env": {
                "NODEMON": true
                },
                "ignore": [
                "dist/"
                ]
            }
        }
        `);


        fs.writeFileSync(dirName+'/.gitignore',
        `
        dist
        **/node_modules/**
        **/*.pem
        **/*.pfxs
        **/*.key
        **/*.lock
        **/package-lock.json
        **/*.key
        **/*.log
        `
        )

    }

}