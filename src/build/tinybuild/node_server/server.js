//Run: `node index.js`
import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'

import {HotReload, addHotReloadClient} from './hotreload/hotreload.js'

import { PythonRelay, PythonClient } from './relay/python_relay.js';
import { parseArgs } from '../repo.js'

export const defaultServer = {
    debug:false, //print debug messages?
    protocol:'http', //'http' or 'https'. HTTPS required for Nodejs <---> Python sockets. If using http, set production to False in python/server.py as well
    host: 'localhost', //'localhost' or '127.0.0.1' etc.
    port: 8080, //e.g. port 80, 443, 8000
    startpage: 'index.html',  //home page
    socket_protocol: 'ws', //frontend socket protocol, wss for served, ws for localhost
    hotreload: 5000, //hotreload websocket server port
     //watch: ['../'], //watch additional directories other than the current working directory
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

let foundArgs;
if(process.argv) foundArgs = parseArgs(process.argv);

const mimeTypes = {
    '.html': 'text/html', '.htm': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt':'text/plain',
    '.png': 'image/png', '.jpg': 'image/jpg', '.jpeg': 'image/jpg','.gif': 'image/gif', '.svg': 'image/svg+xml', '.xhtml':'application/xhtml+xml', '.bmp':'image/bmp',
    '.wav': 'audio/wav', '.mp3':'audio/mpeg', '.mp4': 'video/mp4', '.xml':'application/xml', '.webm':'video/webm', '.webp':'image/webp', '.weba':'audio/webm',
    '.woff': 'font/woff', 'woff2':'font/woff2', '.ttf': 'application/font-ttf', '.eot': 'application/vnd.ms-fontobject', '.otf': 'application/font-otf',
    '.wasm': 'application/wasm', '.zip':'application/zip','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.tif':'image/tiff',
    '.sh':'application/x-sh', '.csh':'application/x-csh', '.rar':'application/vnd.rar','.ppt':'application/vnd.ms-powerpoint', '.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.odt':'application/vnd.oasis.opendocument.text','.ods':'application/vnd.oasis.opendocument.spreadsheet','.odp':'application/vnd.oasis.opendocument.presentation',
    '.mpeg':'video/mpeg','.mjs':'text/javascript','.cjs':'text/javascript','.jsonld':'application/ld+json', '.jar':'application/java-archive', '.ico':'image/vnd.microsoft.icon',
    '.gz':'application/gzip', 'epub':'application/epub+zip', '.doc':'application/msword', '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.csv':'text/csv', '.avi':'video/x-msvideo', '.aac':'audio/aac', '.mpkg':'application/vnd.apple.installer+xml','.oga':'audio/ogg','.ogv':'video/ogg','ogx':'application/ogg',
    '.php':'application/x-httpd-php', '.rtf':'application/rtf', '.swf':'application/x-shockwave-flash', '.7z':'application/x-7z-compressed', '.3gp':'video/3gpp'
};

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
        fs.readFile(requestURL, (error, content) => {
            if (error) {
                if(error.code == 'ENOENT') { //page not found: 404
                    fs.readFile(cfg.errpage, (error, content) => {
                        response.writeHead(404, { 'Content-Type': 'text/html' }); //set response headers

                        
                        //add hot reload if specified
                        if(process.env.HOTRELOAD && requestURL.endsWith('.html') && cfg.hotreload) {
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

                var contentType = mimeTypes[extname] || 'application/octet-stream';

                response.writeHead(200, { 'Content-Type': contentType }); //set response headers

                //html injection
                if(requestURL.endsWith('.html')) {

                    //inject hot reload if specified
                    if(process.env.HOTRELOAD && cfg.hotreload) {
                        content = addHotReloadClient(content,`${cfg.socket_protocol}://${cfg.host}:${cfg.port}/hotreload`);
                    }
                    
                    //inject pwa code
                    if(cfg.pwa && cfg.protocol === 'https') {
                        if(fs.existsSync(path.join(process.cwd(),cfg.pwa))) {
                            if(!fs.existsSync(path.join(process.cwd(),'manifest.webmanifest'))) { //lets create a default webmanifest on the local server if none found
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
                            if(!fs.existsSync(path.join(process.cwd(),cfg.pwa))) { //lets create a default webmanifest on the local server if none found
                                fs.writeFileSync(path.join(process.cwd(),cfg.pwa),
                                `//https://github.com/ibrahima92/pwa-with-vanilla-js
                                const assets = [
                                  "/",
                                  "/index.html",
                                  "/dist/index.js"
                                ];
                                
                                self.addEventListener("install", installEvent => {
                                  installEvent.waitUntil(
                                    caches.open(staticDevCoffee).then(cache => {
                                      cache.addAll(assets);
                                    })
                                  );
                                });
                                
                                self.addEventListener("fetch", fetchEvent => {
                                  fetchEvent.respondWith(
                                    caches.match(fetchEvent.request).then(res => {
                                      return res || fetch(fetchEvent.request);
                                    })
                                  );
                                });`
                                )
                            }
                            let cstr = content;
                            if(typeof cstr !== 'string') cstr = cstr.toString();
                            content = `${cstr}\n\n
                                <link rel="manifest" href="manifest.webmanifest">
                                <script>
                                    // Check that service workers are supported

                                    const isLocalhost = Boolean(
                                        window.location.hostname === 'localhost' ||
                                          // [::1] is the IPv6 localhost address.
                                          window.location.hostname === '[::1]' ||
                                          // 127.0.0.1/8 is considered localhost for IPv4.
                                          window.location.hostname.match(
                                            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
                                          )
                                    );

                                    function registerSW() {
                                        navigator.serviceWorker
                                        .register("${cfg.pwa}")
                                        .then(registration => {
                                            registration.onupdatefound = () => {
                                              const installingWorker = registration.installing;
                                              if (installingWorker == null) {
                                                return;
                                              }
                                              installingWorker.onstatechange = () => {
                                                if (installingWorker.state === 'installed') {
                                                  if (navigator.serviceWorker.controller) {
                                                    // At this point, the updated pre-cached content has been fetched,
                                                    // but the previous service worker will still serve the older
                                                    // content until all client tabs are closed.
                                                    console.log(
                                                      'New content is available and will be used when all ' +
                                                        'tabs for this page are closed. See https://bit.ly/CRA-PWA.'
                                                    );
                                      
                                                  } else {
                                                    // At this point, everything has been pre-cached.
                                                    // It's the perfect time to display a
                                                    // "Content is cached for offline use." message.
                                                    console.log('Content is cached for offline use.');
                                      
                                                  }
                                                }
                                              };
                                            };
                                        })
                                        .catch(error => {
                                        console.error('Error during service worker registration:', error);
                                        });
                                    }

                                    if ("serviceWorker" in navigator) addEventListener('load', () => {
                                        if(isLocalhost) {
                                            // Add some additional logging to localhost, pointing developers to the
                                            
                                            // Check if the service worker can be found. If it can't reload the page.
                                            fetch("${cfg.pwa}")
                                            .then(response => {
                                                // Ensure service worker exists, and that we really are getting a JS file.
                                                const contentType = response.headers.get('content-type');
                                                if (
                                                response.status === 404 ||
                                                (contentType != null && contentType.indexOf('javascript') === -1)
                                                ) {
                                                // No service worker found. Probably a different app. Reload the page.
                                                navigator.serviceWorker.ready.then(registration => {
                                                    registration.unregister().then(() => {
                                                    window.location.reload();
                                                    });
                                                });
                                                } else {
                                                // Service worker found. Proceed as normal.
                                                    registerSW();
                                                }
                                            })
                                            .catch(() => {
                                                console.log(
                                                'No internet connection found. App is running in offline mode.'
                                                );
                                            });
                                            
                                            // service worker/PWA documentation.
                                            navigator.serviceWorker.ready.then(() => {
                                                console.log('This web app is being served cache-first by a service worker.');
                                            });
                                        }
                                        else {
                                            registerSW();
                                        } 
                                    });
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
    
    console.timeEnd(`🐱 Node server started!`);
    console.log(`Server running at 
        ${cfg.protocol}://${cfg.host}:${cfg.port}/`
    );
}

// create the http/https server. For hosted servers, use the IP and open ports. Default html port is 80 or sometimes 443
export const serve = (cfg=defaultServer) => {

    function exitHandler(options, exitCode) {

        if(typeof SERVERCONFIG.SOCKETS?.py_client != 'undefined') {
            if(SERVERCONFIG.SOCKETS.py_client.ws?.readyState === 1) {
                SERVERCONFIG.SOCKETS.py_client.ws.send('kill');
            }
        }
    
        if (exitCode || exitCode === 0) console.log('SERVER EXITED WITH CODE: ',exitCode);
        if (options.exit) process.exit();
    }
    
    //do something when app is closing
    process.on('exit', exitHandler.bind(null,{cleanup:true}));
    process.on(2, exitHandler.bind(null,{cleanup:true, exit:true}));
    
    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, {exit:true}));

    console.time(`🐱 Node server started!`);


    let obj = Object.assign({}, defaultServer); // Make modules editable
    for(const prop in cfg) {
        if(cfg[prop] === undefined) delete cfg[prop];
    }
    cfg = Object.assign(obj,cfg); //overwrite non-default values

    let foundArgs;
    if(process.argv) parseArgs(process.argv);
    if(foundArgs) {
        cfg = Object.assign(cfg,foundArgs);
    }
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

