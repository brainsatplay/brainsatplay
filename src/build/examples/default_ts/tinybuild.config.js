
const config = {
    bundler: { //esbuild settings, set false to skip build step or add bundle:true to config object to only bundle (alt methods)
        entryPoints: [ //entry point file(s). These can include .js, .mjs, .ts, .jsx, .tsx, or other javascript files. Make sure your entry point is a ts file if you want to generate types
        "index.ts"
        ],
        outfile: "dist/index", //exit point file, will append .js as well as indicators like .esm.js, .node.js for other build flags
        //outdir:[]               //exit point files, define for multiple bundle files
        bundleBrowser: true, //create plain js build? Can include globals and init scripts
        bundleESM: false, //create esm module js files
        bundleTypes: false, //create .d.ts files, the entry point must be a typescript file! (ts, tsx, etc)
        bundleNode: false, //create node platform plain js build, specify platform:'node' to do the rest of the files 
        bundleHTML: false, //wrap the first entry point file as a plain js script in a boilerplate html file, frontend scripts can be run standalone like a .exe! Server serves this as start page if set to true.
        minify: true,
        sourcemap: false
        //globalThis:null //'mymodule'
        //globals:{'index.js':['Graph']}
        //init:{'index.js':function(bundle) { console.log('prepackaged bundle script!', bundle); }}      
     },
    server: {  //node server settings, set false to skip server step or add serve:true to config object to only serve (alt methods)
        debug: false,
        protocol: "http",  //'http' or 'https'. HTTPS required for Nodejs <---> Python sockets. If using http, set production to False in python/server.py as well
        host: "localhost", //'localhost' or '127.0.0.1' etc.
        port: 8080, //e.g. port 80, 443, 8000
        startpage: "index.html", //home page
        socket_protocol: "ws", //frontend socket protocol, wss for served, ws for localhost
        hotreload: 5000,  //hotreload websocket server port
        //watch: ['../'], //watch additional directories other than the current working directory
        pwa: "dist/service-worker.js",  //pwa mode? Injects service worker registry code in (see pwa README.md)
        python: false,//7000,  //quart server port (configured via the python server script file still)
        python_node: 7001, //websocket relay port (relays messages to client from nodejs that were sent to it by python)
        errpage: "node_modules/tinybuild/tinybuild/node_server/other/404.html",  //default error page, etc.
        certpath: "node_modules/tinybuild/tinybuild/node_server/ssl/cert.pem", //if using https, this is required. See cert.pfx.md for instructions
        keypath: "node_modules/tinybuild/tinybuild/node_server/ssl/key.pem" //if using https, this is required. See cert.pfx.md for instructions
    }
}

export default config; //module.exports = config; //es5