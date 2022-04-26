//Run: `node server.js`

const cfg = require('./server_settings.js');

var fs = require('fs');
var path = require('path');
var hotreload = require('./hotreload/hotreload.js');

//when a request is made to the server from a user, what should we do with it?
function onRequest(request, response) {
    console.log('request ', request.url);
    //console.log(request); //debug

    //process the request, in this case simply reading a file based on the request url    
    var requestURL = '.' + request.url;

    if (requestURL == './') { //root should point to start page
        requestURL = cfg.settings.startpage; //point to the start page
    }

    //read the file on the server
    if(fs.existsSync(requestURL)){
        fs.readFile(requestURL, function(error, content) {
            if (error) {
                if(error.code == 'ENOENT') { //page not found: 404
                    fs.readFile(cfg.settings.errpage, function(error, content) {
                        response.writeHead(404, { 'Content-Type': 'text/html' }); //set response headers

                        
                        //add hot reload if specified
                        if(process.env.NODEMON && requestURL.endsWith('.html') && typeof hotreload !== 'undefined') {
                            content = hotreload.addhotload(content);
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

                //add hot reload if specified
                if(process.env.NODEMON && requestURL.endsWith('.html') && typeof hotreload !== 'undefined') {
                    content = hotreload.addhotload(content);
                }
                
                response.end(content, 'utf-8'); //set response content

                //console.log(content); //debug
            }
        });
    } else console.log(`File ${requestURL} does not exist on path!`)

    //console.log(response); //debug
}


//runs when the server starts successfully.
function onStarted() {      
    console.log(`Server running at 
        ${cfg.settings.protocol}://${cfg.settings.host}:${cfg.settings.port}/`
    );
}


//now create the http/https server. For hosted servers, use the IP and open ports. Default html port is 80 or sometimes 443
if(cfg.settings.protocol === 'http') {
    
    var http = require('http');
    http.createServer(
        onRequest
    ).listen( //SITE AVAILABLE ON PORT:
        cfg.settings.port,
        cfg.settings.host,
        onStarted
    );
}
else if (cfg.settings.protocol === 'https') {
    
    var https = require('https');
    // Options is used by the servers
    // pfx handles the certificate file
    var options = {
        pfx: fs.readFileSync(cfg.settings.sslpath),
        passphrase: "encrypted"
    };
    https.createServer(
        options,
        onRequest
    )
    .listen(
        cfg.settings.port,
        cfg.settings.host,
        onStarted
    );

}

