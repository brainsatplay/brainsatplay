
//import {defaultBundler, defaultServer, packager} from 'tinybuild'

let entryPoints = ['app/index.js']

const config = {
    bundler: {
        entryPoints: entryPoints,
        outfile: 'dist/index',
        bundleBrowser: true, //plain js format
        bundleESM: false, //.esm format
        bundleTypes: false, //entry point should be a ts or jsx (or other typescript) file
        bundleNode: false, // bundle a package with platform:node and separate externals
        bundleHTML: false //can wrap the built outfile (or first file in outdir) automatically and serve it or click and run the file without hosting.
    },
    server: { //defaultServer
        debug:false, //print debog messages?
        protocol:'http', //'http' or 'https'. HTTPS required for Nodejs <---> Python sockets. If using http, set production to False in python/server.py as well
        host: 'localhost', //'localhost' or '127.0.0.1' etc.
        port: 8080, //e.g. port 80, 443, 8000
        startpage: 'index.html',  //home page
        socket_protocol: 'ws', //frontend socket protocol, wss for served, ws for localhost
        hotreload: 5000, //hotreload websocket server port
        pwa:'dist/service-worker.js', //pwa mode? Injects service worker registry code in (see pwa README.md)
        python: false,//7000,  //quart server port (configured via the python server script file still)
        python_node:7001, //websocket relay port (relays messages to client from nodejs that were sent to it by python)
        errpage: 'packager/node_server/other/404.html', //default error page, etc.
        certpath:'packager/node_server/ssl/cert.pem',//if using https, this is required. See cert.pfx.md for instructions
        keypath:'packager/node_server/ssl/key.pem', //if using https, this is required. See cert.pfx.md for instructions
    }
}

export default config;
