
//import {defaultBundler, defaultServer, packager} from 'tinybuild'

const config = {
    bundler: {
        entryPoints: ['./index.ts'],
        outfile: 'dist/worker.service',
        bundleBrowser: true, //plain js format
        bundleESM: true, //.esm format
        bundleTypes: true, //entry point should be a ts or jsx (or other typescript) file
        bundleNode: true, // bundle a package with platform:node and separate externals
        bundleHTML: false, //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
        globalThis: 'brainsatplay',
        minify:true
    },
    server: false //{ //defaultServer
    //     debug:false, //print debog messages?
    //     protocol:'http', //'http' or 'https'. HTTPS required for Nodejs <---> Python sockets. If using http, set production to False in python/server.py as well
    //     host: 'localhost', //'localhost' or '127.0.0.1' etc.
    //     port: 8080, //e.g. port 80, 443, 8000
    //     startpage: 'index.html',  //home page
    //     socket_protocol: 'ws', //frontend socket protocol, wss for served, ws for localhost
    //     hotreload: 5000, //hotreload websocket server port
    //     pwa:'dist/service-worker.js', //pwa mode? Injects service worker registry code in (see pwa README.md)
    //     python: false,//7000,  //quart server port (configured via the python server script file still)
    //     python_node:7001, //websocket relay port (relays messages to client from nodejs that were sent to it by python)
    //     errpage: 'tinybuild/node_server/other/404.html', //default error page, etc.
    //     certpath:'tinybuild/node_server/ssl/cert.pem',//if using https, this is required. See cert.pfx.md for instructions
    //     keypath:'tinybuild/node_server/ssl/key.pem'//if using https, this is required. See cert.pfx.md for instructions
    // }
}

export default config;
