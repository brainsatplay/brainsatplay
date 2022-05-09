//Run: `node index.js`
import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'

import {HotReload, addHotReloadClient} from './hotreload/hotreload.js'

import { PythonRelay, PythonClient } from './relay/python_relay.js';

export const defaultServer = {
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
    keypath:'packager/node_server/ssl/key.pem'//if using https, this is required. See cert.pfx.md for instructions
    //SERVER
    //SOCKETS
}

let SERVERCONFIG = {};


function exitHandler(options, exitCode) {

    if(typeof SERVERCONFIG.SOCKETS?.py_client != 'undefined') {
        if(SERVERCONFIG.SOCKETS.py_client.ws?.readyState === 1) {
            SERVERCONFIG.SOCKETS.py_client.ws.send('kill');
        }
    }

    if (exitCode || exitCode === 0) console.log('EXIT CODE: ',exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on(2, exitHandler.bind(null,{cleanup:true, exit:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//when a request is made to the server from a user, what should we do with it?
function onRequest(request, response, cfg) {
    if(cfg.debug) console.log('request ', request.url);
    //console.log(request); //debug

    //process the request, in this case simply reading a file based on the request url    
    var requestURL = '.' + request.url;

    if (requestURL == './') { //root should point to start page
        requestURL = cfg.startpage; //point to the start page
    }

    //read the file on the server
    if(fs.existsSync(requestURL)){
        fs.readFile(requestURL, function(error, content) {
            if (error) {
                if(error.code == 'ENOENT') { //page not found: 404
                    fs.readFile(cfg.errpage, function(error, content) {
                        response.writeHead(404, { 'Content-Type': 'text/html' }); //set response headers

                        
                        //add hot reload if specified
                        if(process.env.NODEMON && requestURL.endsWith('.html') && cfg.hotreload) {
                            content = addHotReloadClient(content,`${cfg.socket_protocol}://${cfg.host}:${cfg.port}/hotreload`);
                        }

                        response.end(content, 'utf-8'); //set response content

                        //console.log(content); //debug
                    });
                }
                else { //other error
                    response.writeHead(500); //set response headers
                    response.end('Something went wrong: '+error.code+' ..\n'); //set response content
                }
            }
            else { //file read successfully, serve the content back

                //set content type based on file path extension for the browser to read it properly
                var extname = String(path.extname(requestURL)).toLowerCase();
                var mimeTypes = {
                    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
                    '.png': 'image/png', '.jpg': 'image/jpg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
                    '.wav': 'audio/wav', '.mp4': 'video/mp4',
                    '.woff': 'application/font-woff', '.ttf': 'application/font-ttf', '.eot': 'application/vnd.ms-fontobject', '.otf': 'application/font-otf',
                    '.wasm': 'application/wasm'
                };

                var contentType = mimeTypes[extname] || 'application/octet-stream';

                response.writeHead(200, { 'Content-Type': contentType }); //set response headers

                //html injection
                if(requestURL.endsWith('.html')) {

                    //inject hot reload if specified
                    if(process.env.NODEMON && cfg.hotreload) {
                        content = addHotReloadClient(content,`${cfg.socket_protocol}://${cfg.host}:${cfg.port}/hotreload`);
                    }
                    
                    //inject pwa code
                    if(cfg.pwa && cfg.protocol === 'https') {
                        if(fs.existsSync(cfg.pwa)) {
                            if(!fs.existsSync('manifest.webmanifest')) { //lets create a default webmanifest on the local server if none found
                                fs.writeFileSync('manifest.webmanifest',
                                `{
                                    "short_name": "PWA",
                                    "name": "PWA",
                                    "start_url": ".",
                                    "display": "standalone",
                                    "theme_color": "#000000",
                                    "background_color": "#ffffff",
                                    "description": "PWA Test",
                                    "lang": "en-US",
                                    "permissions": [
                                    "storage"
                                    ]
                                }`
                                )
                            }
                            content = `${content.toString()}\n\n
                                <script>
                                    console.log('Using PWA!');  
                                    if(typeof process !== 'undefined') { //node environment variable in served code        
                                        // Check that service workers are supported
                                        if (process.env.NODE_ENV === 'production' && "serviceWorker" in navigator) addEventListener('load', () => {
                                            navigator.serviceWorker
                                            .register("${cfg.pwa}")
                                            .catch((err) => console.log("Service worker registration failed", err));
                                        });
                                    }
                                </script>`;
                        }
                    }

                }

                response.end(content, 'utf-8'); //set response content

                //console.log(content); //debug
            }
        });
    } else {
        if(cfg.debug) console.log(`File ${requestURL} does not exist on path!`);
    }

    //console.log(response); //debug
}



//Websocket upgrading
function onUpgrade(request, socket, head, cfg, sockets) { //https://github.com/websockets/ws

    if(cfg.debug) console.log("Upgrade request at: ", request.url);
    
    if(request.url === '/' || request.url === '/home') {
        if(cfg.python) {
            sockets.python.wss.handleUpgrade(request, socket, head, (ws) => {
                sockets.python.wss.emit('connection', ws, request);
            });
        }
    } else if(request.url === '/hotreload') {
        if(cfg.hotreload) {
            sockets.hotreload.wss.handleUpgrade(request, socket, head, (ws) => {
                sockets.hotreload.wss.emit('connection', ws, request);
            }); 
        }
    } 
}



//runs when the server starts successfully.
function onStarted(cfg) {      
    
    console.timeEnd(`Node server started!`);
    console.log(`Server running at 
        ${cfg.protocol}://${cfg.host}:${cfg.port}/`
    );
}

// create the http/https server. For hosted servers, use the IP and open ports. Default html port is 80 or sometimes 443
export const serve = (cfg=defaultServer) => {

    console.time(`Node server started!`);

    cfg = Object.assign({}, cfg) // Make modules editable
    SERVERCONFIG = cfg;
    // Create classes to pass

    let sockets = {}; //socket server tools
    
    if (cfg.hotreload) sockets.hotreload = new HotReload(cfg);
    if (cfg.python) {
        sockets.python = new PythonRelay(cfg);
        sockets.py_client = new PythonClient(cfg,sockets.python);
    }
    

    if(cfg.protocol === 'http') {
        
        //var http = require('http');
        let server = http.createServer(
            (request,response) => onRequest(request, response, cfg)
        );

        server.on('error',(err)=>{
            console.error('onupgrade error:',err.toString());
        })
        
        server.on('upgrade', (request, socket, head) => {
            onUpgrade(request, socket, head, cfg, sockets);
        });

        server.listen( //SITE AVAILABLE ON PORT:
            cfg.port,
            cfg.host,
            () => onStarted(cfg)
        );

        cfg.SERVER = server;
    }
    else if (cfg.protocol === 'https') {
        
        //var https = require('https');
        // options are used by the https server
        // pfx handles the certificate file
        var options = {
            key: fs.readFileSync(cfg.keypath),
            cert: fs.readFileSync(cfg.certpath),
            passphrase: "encrypted"
        };
        let server = https.createServer(
            options,
            (request,response) => onRequest(request,response, cfg)
        );

        server.on('error',(err)=>{
            console.error('onupgrade error:',err.toString());
        })
        
        server.on('upgrade', (request, socket, head) => {
            onUpgrade(request, socket, head, cfg, sockets);
        });
        
        server.listen(
            cfg.port,
            cfg.host,
            () => onStarted(cfg)
        );

        cfg.SERVER = server;
    }



    cfg.SOCKETS = sockets;

    return cfg; //return the config with any appended active info like the socket classes
}

