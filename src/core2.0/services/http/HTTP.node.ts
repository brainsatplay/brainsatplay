import { RouteProp, Routes, Service, ServiceMessage } from "../Service";
import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'


export type ServerProps = {
    host:string,
    port:number,
    certpath?:string, 
    keypath?:string,
    passphrase?:string,
    startpage?: string,
    errpage?:string,
    pageOptions?:{
        [key:'all'|string]:{
            inject:{[key:string]:{}|null}|string[]|string| ((...args:any)=>any) //append html      
        }
    },
    protocol?:'http'|'https',
    keepState?:boolean, //setState whenever a route is run? State will be available at the address (same key of the object storing it here)
    [key:string]:any
}

export type ServerInfo = {
    server:https.Server|http.Server,
    address:string
} & ServerProps

export type ReqOptions = {
    protocol:'http'|'https'|string
    host:string,
    port:number,
    method:string,
    path?:string,
    headers?:{
        [key:string]:string | number | string[],
        'Content-Type'?:string, //e.g...
        'Content-Length'?:number
    }
}

//http/s server 
export class HTTPbackend extends Service {

    name='http';

    server:any

    debug:boolean=false

    servers:{
        [key:string]:ServerInfo
    }={}

    mimeTypes:{[key:string]:string} = { 
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

    constructor(routes?:Routes, name?:string, settings?:{ host?:string, port?:number, protocol?:'http'|'https', certpath?:string, keypath?:string }) {
        super(routes, name);

        if(settings) {
            if(settings.protocol === 'https') {
                this.setupHTTPSserver( settings as any )
            } else this.setupHTTPserver( settings as any);
        }
    
    }

    //on server started
    onStarted = (protocol:'http'|'https'|string,host:string,port:number) => {
        console.log(`🐱 Node server running at 
            ${protocol}://${host}:${port}/`
        );
    }

    setupServer = (
        options:ServerProps={
            protocol:'http',
            host:'localhost',
            port:8080,
            startpage:'index.html'
        },
        requestListener?:http.RequestListener,
        onStarted?:()=>void
    )=>{
        if(options.protocol === 'https') {
            return this.setupHTTPSserver(options as any,requestListener, onStarted);
        }
        else
            return this.setupHTTPserver(options, requestListener, onStarted);
    }
    
    //insecure server
    setupHTTPserver = (
        options:ServerProps={
            host:'localhost' as string,
            port:8080 as number,
            startpage:'index.html',
            errpage:undefined
        },
        requestListener?:http.RequestListener,
        onStarted:()=>void = ()=>{this.onStarted('http',options.host,options.port)}
    ) => {

        const host = options.host;
        const port = options.port;
        options.protocol = 'http';

        if(!host || !port) return;

        const address = `${host}:${port}`;

        if(this.servers[address]) this.terminate(this.servers[address]);

        if(!('keepState' in options)) options.keepState = true; //default true

        const served = {
            server:undefined,
            address,
            ...options
        }

        if(!requestListener) requestListener =  (request:http.IncomingMessage,response:http.ServerResponse) => { 
            this.receive({route:request.url.slice(1), args:{request, response}, method:request.method, served}); 
        } //default requestListener

        //var http = require('http');
        const server = http.createServer(
            requestListener
        );

        served.server = server;

        // server.on('upgrade', (request, socket, head) => {
        //     this.onUpgrade(request, socket, head);
        // });

        this.servers[address] = served;

        //SITE AVAILABLE ON PORT:
        return new Promise((resolve,reject) => {
            server.on('error',(err)=>{
                console.error('Server error:', err.toString());
                reject(err);
            });
            server.listen( 
                port,host,
                ()=>{onStarted(); resolve(served);}
            );
        });
    }

    //secure server
    setupHTTPSserver = (
        options:ServerProps = {
            host:'localhost' as string,
            port:8080 as number,
            startpage:'index.html',
            certpath:'cert.pem' as string, 
            keypath:'key.pem' as string,
            passphrase:'encryption' as string,
            errpage:undefined as undefined|string
        },
        requestListener?:http.RequestListener,
        onStarted:()=>void = ()=>{this.onStarted('https',options.host,options.port)}
    ) => {

        const host = options.host;
        const port = options.port;
        options.protocol = 'https';

        if(!host || !port || !options.certpath || !options.keypath) return;
    
        if(this.servers[`${host}:${port}`]) this.terminate(this.servers[`${host}:${port}`])

        var opts = {
            key: fs.readFileSync(options.keypath),
            cert: fs.readFileSync(options.certpath),
            passphrase:options.passphrase
        };

        if(!('keepState' in options)) options.keepState = true; //default true

        const served = {
            server:undefined,
            address:`${host}:${port}`,
            ...options
        }

        //default requestListener
        if(!requestListener) requestListener = (request:http.IncomingMessage,response:http.ServerResponse) => { 
            this.receive({
                route:request.url.slice(1), //gets rid of the '/' for the node tree to interpret... 
                args:{request, response}, 
                method:request.method, 
                served
            }); 
        } //default requestListener

        //var http = require('http');
        const server = https.createServer(
            opts,
            requestListener 
        );

        served.server = server;
        
        // server.on('upgrade', (request, socket, head) => {
        //     this.onUpgrade(request, socket, head);
        // });

        this.servers[`${host}:${port}`] = served;

        //SITE AVAILABLE ON PORT:
        return new Promise((resolve,reject) => {
            server.on('error',(err)=>{
                console.error('Server error:', err.toString());
                reject(err);
            })
            server.listen( 
                port,host,
                ()=>{onStarted(); resolve(served); }
            );
        });
    }

    transmit = ( //generalized http request. The default will try to post back to the first server in the list
        message:any | ServiceMessage, 
        options:{
            protocol:'http'|'https'|string
            host:string,
            port:number,
            method:string,
            path?:string,
            headers?:{
                [key:string]:string | number | string[],
                'Content-Type'?:string,
                'Content-Length'?:number
            }
        },
        ondata?:(chunk:any)=>void,
        onend?:()=>void

    ) => {
        let input = message;
        if(typeof input === 'object') input = JSON.stringify(input);
        if(!options) { //fill a generic post request for the first server if none provided
            let server = this.servers[Object.keys(this.servers)[0]];
            options = {
                protocol:server.protocol,
                host:server.host,
                port:server.port,
                method:'POST',
                path:message.route,
                headers:{
                    'Content-Type':'application/json',
                    'Content-Length':input.length
                }
            };
        } //get first server and use its settings for a generic post request
        else if (!options.headers) {
            options.headers = {
                'Content-Type':'application/json',
                'Content-Length':input.length
            }
        }

        return this.request(options,input,ondata,onend);
    }

    withResult = (
        response:http.ServerResponse,
        result:any,
        message:{
            route:string, 
            args:{request:http.IncomingMessage,response:http.ServerResponse},  //data will be an object containing request, response
            method?:string,
            origin?:string,
            served?:ServerInfo //server deets
        }
    ) => {
        if(result && !response.writableEnded && !response.destroyed) {
        
            if(typeof result === 'string') {
                if(result.includes('<') && result.includes('>') && (result.indexOf('<') < result.indexOf('>'))) //probably an html template
                    {
                        if(message?.served?.pageOptions?.all || message?.served?.pageOptions[message.route]) {
                            result = this.injectPageCode(result,message.route,message.served) as any;
                        }
                        response.writeHead(200,{'Content-Type':'text/html'});
                        response.end(result,'utf-8');
                        return;
                    }
            }
            
            let mimeType = 'text/plain';

            if(typeof result === 'object') {
                result = JSON.stringify(result);
                mimeType = 'application/json';
            }

            response.writeHead(200,{'Content-Type':mimeType});
            response.end(result,'utf-8');
        }
    }

    injectPageCode = (
        templateString:string, 
        url:string,             
        served:ServerInfo 
    ) => { 
        
        if (served?.pageOptions[url]?.inject) { //inject per url
            if(typeof served.pageOptions[url].inject === 'object') 
                templateString = this.buildPage(served.pageOptions[url].inject, templateString);
            else if (typeof served.pageOptions[url].inject === 'function') 
                templateString += (served.pageOptions[url].inject as any)();
            else if (typeof served.pageOptions[url].inject === 'string' || typeof served.pageOptions[url].inject === 'number') 
                templateString += served.pageOptions[url].inject;
        }
        if(served?.pageOptions.all?.inject) { //any per server
            if(typeof served.pageOptions.all.inject === 'object') 
                templateString = this.buildPage(served.pageOptions.all.inject, templateString);
            else if (typeof served.pageOptions.all.inject === 'function') 
                templateString += served.pageOptions.all.inject();
            else if (typeof served.pageOptions.all.inject === 'string' || typeof served.pageOptions.all.inject === 'number') 
                templateString += served.pageOptions.all.inject;
        }  
        return templateString;
    }

    receive = ( //our fancy request response handler
        message:{
            route:string, 
            args:{request:http.IncomingMessage,response:http.ServerResponse},  //data will be an object containing request, response
            method?:string,
            origin?:string,
            served?:ServerInfo //server deets
        }
    ) => {
        const request = message.args.request; 
        const response = message.args.response; 
        const method = message.method; 
        const served = message.served;
        //const origin = message.origin;

        if(this.debug) console.log(request.method, request.url);
        //console.log(request); //debug

        let result = new Promise((resolve,reject) => {

            response.on('error', (err) => {
                if(!response.writableEnded || !response.destroyed ) {
                    response.statusCode = 400;
                    response.end(undefined,undefined,()=>{                
                        reject(err);
                    });
                }
            });

            let getFailed = () => {
                if(response.writableEnded || response.destroyed) reject(requestURL); 
                if(requestURL == './' || requestURL == served?.startpage) {
                    let template = `<!DOCTYPE html><html><head></head><body style='background-color:#101010 color:white;'><h1>Brains@Play Server</h1></body></html>`; //start page dummy
                    if(served.pageOptions?.all || served.pageOptions?.error) {
                        template = this.injectPageCode(template,message.route,served) as any;
                    }
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(template,'utf-8',() => {
                        resolve(template);
                    }); //write some boilerplate server page, we should make this an interactive debug page
                    if(served.keepState) this.setState({[served.address]:template});
                    //return;
                }
                else if(this.debug) console.log(`File ${requestURL} does not exist on path!`);
                response.writeHead(500); //set response headers
                response.end(undefined,undefined,()=>{
                    reject(requestURL);
                });
               
                //return;
            }

            if(method === 'GET' || method === 'get') {
                //process the request, in this case simply reading a file based on the request url    
                var requestURL = '.' + request.url;
    
                if (requestURL == './' && served?.startpage) { //root should point to start page
                    requestURL = served.startpage; //point to the start page
                }
                
                //console.log(path.join(process.cwd(),requestURL),fs.existsSync(path.join(process.cwd(),requestURL)));
                if(fs.existsSync(path.join(process.cwd(),requestURL))) {
                    if(response.writableEnded || response.destroyed) reject(requestURL);
                    //read the file on the server
                    fs.readFile(path.join(process.cwd(),requestURL), (error, content) => {
                        if (error) {
                            if(error.code == 'ENOENT') { //page not found: 404
                                if(served?.errpage) {
                                    fs.readFile(served.errpage, (er, content) => {
                                        response.writeHead(404, { 'Content-Type': 'text/html' }); //set response headers
    
                                        
                                        //add hot reload if specified
                                        // if(process.env.HOTRELOAD && requestURL.endsWith('.html') && cfg.hotreload) {
                                        //     content = addHotReloadClient(content,`${cfg.socket_protocol}://${cfg.host}:${cfg.port}/hotreload`);
                                        // }

                                        if(served.pageOptions?.all || served.pageOptions?.error) {
                                            content = this.injectPageCode(content.toString(),message.route,served) as any;
                                        }
    
                                        response.end(content, 'utf-8'); //set response content
                                        reject(content);
                                        //console.log(content); //debug
                                    });
                                }
                                else {
                                    response.writeHead(404, { 'Content-Type': 'text/html' });
                                    let content = `<!DOCTYPE html><html><head></head><body style='background-color:#101010 color:white;'><h1>Error: ${error.code}</h1></body></html>`
                                    if(served.pageOptions?.all || served.pageOptions[message.route]) {
                                        content = this.injectPageCode(content.toString(),message.route,served) as any;
                                    }
                                    response.end(content,'utf-8', () => {
                                        reject(error.code);
                                    });
                                    //return;
                                }
                            }
                            else { //other error
                                response.writeHead(500); //set response headers
                                response.end('Something went wrong: '+error.code+' ..\n','utf-8', () => {
                                    reject(error.code);
                                }); //set response content
                                //return;
                            }
                        }
                        else { //file read successfully, serve the content back
    
                            //set content type based on file path extension for the browser to read it properly
                            var extname = String(path.extname(requestURL)).toLowerCase();
    
                            var contentType = this.mimeTypes[extname] || 'application/octet-stream';

                            if(contentType === 'text/html' && (served.pageOptions?.all || served.pageOptions[message.route])) {
                                content = this.injectPageCode(content.toString(),message.route,served) as any;
                            }

                            response.writeHead(200, { 'Content-Type': contentType }); //set response headers
                            response.end(content, 'utf-8', () => {
                                //console.log(response,content,contentType);
                                resolve(content);
                            }); //set response content
                            
                            //console.log(content); //debug
                            //return;
                        }
                    });
                } else if (message.route) {
                    let route = this.routes[message.route];
                    if(!route) {
                        route = this.routes[request.url];
                    }
                    if(route) {
                        let res:any;
                        if(message.method) {
                            res = this.handleMethod(message.route, message.method, message.args, message.origin); //these methods are being passed request/response in the data here, post methods will parse the command objects instead while this can be used to get html templates or play with req/res custom callbakcs
                        }
                        else res = this.handleServiceMessage(message);
    
                        if(res instanceof Promise) res.then((r) => {
                            if(served.keepState) this.setState({[served.address]:res});
                            this.withResult(response,r,message);
                            resolve(res);
                            
                            //return;
                        })
                        else if(res) {
                            if(served.keepState) this.setState({[served.address]:res});
                            this.withResult(response,res,message);
                            resolve(res);
                           // return;
                        } //else we can move on to check the get post
                    } 
                    else getFailed();
                } else getFailed();
            } else {
                //get post/put/etc body if any
                let body:any = [];
                request.on('data',(chunk)=>{ //https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
                    body.push(chunk);
                }).on('end',() => {
                    body = Buffer.concat(body).toString(); //now it's a string
                            
                    if(typeof body === 'string') {
                        if(body.includes('{') || body.includes('[')) body = JSON.parse(body); //parse stringified args, this is safer in a step
                    }
                    
                    let route,method,args,origin;
                    if(body?.route){ //if arguments were posted 
                        route = this.routes[body.route];
                        method = body.method;
                        args = body.args;
                        origin = body.origin;
                        if(!route) {
                            if(typeof body.route === 'string') if(body.route.includes('/') && body.route.length > 1) body.route = body.route.split('/').pop();
                            route = this.routes[body.route];
                        }
                    }
                    if(!route) { //body post did not provide argument so use the request route
                        if (message?.route) {
                            let route = this.routes[message.route];
                            method = message.method;
                            args = message.args;
                            origin = message.origin;
                            if(!route) {
                                if(typeof message.route === 'string') if(message.route.includes('/') && message.route.length > 1) message.route = message.route.split('/').pop();
                                route = this.routes[message.route];
                            }
                        }
                    }
                    let res:any = body;
                    if(route) {
                        if(body.method) {
                            res = this.handleMethod(route, method, args, origin);
                        }
                        else res = this.handleServiceMessage({route, args:args, method:method, origin:origin});
                        
                        if(res instanceof Promise) res.then((r) => {
                            this.withResult(response,r,message);
                            if(served.keepState) this.setState({[served.address]:res});
                            resolve(res);
                        })
                        else {
                            this.withResult(response,res,message);
                            if(served.keepState) this.setState({[served.address]:res});
                            resolve(res);
                        }
                    }
                    else if(!response.writableEnded || !response.destroyed) {
                        response.statusCode = 200;
                        response.end(undefined,undefined, () => {
                            resolve(res);
                        }); //posts etc. shouldn't return anything but a 200 usually
                    } else resolve(res); //get requests resolve first and return otherwise this will resolve 
                });

            }

    
        }).catch((er)=>{ console.error("Request Error:", er); });

        return result;
    }

    request = ( 
        options:ReqOptions,
        send?:any,
        ondata?:(chunk:any)=>void,
        onend?:()=>void
    ) => {

        let client = http;
        
        if ((options.protocol as string)?.includes('https')) {
            client = https as any;
        }
    
        delete options.protocol;

        const req = client.request(options,(res)=>{
            if(ondata) res.on('data',ondata)
            if(onend) res.on('end',onend);
        });

        if(options.headers) {
            for(const head in options.headers) {
                req.setHeader(head,options.headers[head])
            }
        }

        if(send) req.write(send);
        req.end();

        return req;
    }

    post = (
        url:string|URL,
        data:any,
        headers?:{
            'Content-Type'?:string,
            'Content-Length'?:number,
            [key:string]:string | number | string[]
        }
    ) => {

        let urlstring = url;
        if(urlstring instanceof URL) urlstring = url.toString();
        let protocol = urlstring.startsWith('https') ? 'https' : 'http';
        let host, port,path;
        let split = urlstring.split('/');
        split.forEach((s) => {
            if(s.includes(':')) {
                let ss = s.split(':');
                host = ss[0]; port = ss[1];
            }
        });

        if(split.length > 3) {
            path = split.slice(3).join('/');
        }

        let req = this.request(
            {
                protocol,
                host,
                port,
                path,
                method:'POST',
                headers
            },
            data
        );

        return req;
    }

    get = (url:string|URL|http.RequestOptions) => {
        return new Promise<Buffer>((resolve, reject) => {
        
            let client = http;
        
            let urlstring = url;
            if(url instanceof URL) urlstring = url.toString();
            
            if ((urlstring as string).includes('https')) {
                client = https as any;
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

    terminate = (served:string|{server:http.Server|https.Server}) => {
        if(typeof served === 'string') served = this.servers[served];

        if(typeof served === 'object') {
            served.server.close();
        }
    }

    getRequestBody(req:http.IncomingMessage) {
        let chunks = [];
        return new Promise<Buffer>((resolve,reject) => {
            req.on('data',(chunk) => {
                chunks.push(chunk);
            }).on('end',() => {
                resolve(Buffer.concat(chunks));
            }).on('error',(er)=>{
                reject(er);
            })
        });
    }

    //??? just need a way to pass a fake request/response in
    // spoofRequest = (url:string, body:any, type:string='json', server:http.Server|https.Server) => {
    //     return this.receive({
    //         route:url,
    //         args:{request:{
    //             url,
    //         } as http.IncomingMessage, response:{} as http.ServerResponse},
    //         method:'GET'
    //     })
    // }

    addPage = (path:string, template:string) => { //add an html page template
        if(typeof template === 'string') {
            if(!template.includes('<html')) template = '<!DOCTYPE html><html>'+template+'</html>'; //add a root
        }
        if(typeof this.routes[path] === 'object') (this.routes[path] as any).get = template;
        else this.load({
                [path]: {
                    get:template
                }
            });
    }

    addHTML = (path:string, template:string) => { //add an html component template e.g. route: component/button then set up logic to chain
        if(typeof template === 'string') {
            if(!template.includes('<') || (!template.includes('>'))) template = '<div>'+template+'</div>';
        }
        if(typeof this.routes[path] === 'object') (this.routes[path] as any).get = template;
        else this.load({
                [path]: {
                    get:template
                }
            });
    }

    buildPage = (pageStructure:{[key:string]:{}|null|any} | string[] | string | ((...args:any)=>any), baseTemplate:string) => { //construct a page from available components, child component templates will be inserted before the last '<' symbol or at end of the previous string depending
        let result = ``; if(baseTemplate) result += baseTemplate;

        let appendTemplate = (obj:{[key:string]:{}|null|any}|string[],r:string|any, res:string) => {
            //console.log(obj,r,res)
            if(typeof obj[r] === 'object') {
                for(const key in obj) {
                    appendTemplate(obj,key,res); //recursive append
                }
            } else if((this.routes[r] as RouteProp)?.get) {
                let toAdd = (this.routes[r] as RouteProp).get;
                if(typeof toAdd === 'function') toAdd = toAdd(obj[r]);
                if(typeof toAdd === 'string')  {
                    let lastDiv = res.lastIndexOf('<');
                    if(lastDiv > 0) {
                        let end = res.substring(lastDiv)
                        res = res.substring(0,lastDiv) + toAdd + end;
                    } res += toAdd; 
                }
                
            } else if (typeof this.routes[r] === 'function') {
                let routeresult = (this.routes[r] as Function)(obj[r]); //template function, pass props
                if(typeof routeresult === 'string') {   
                    let lastDiv = res.lastIndexOf('<');
                    if(lastDiv > 0) {
                        let end = res.substring(lastDiv)
                        res = res.substring(0,lastDiv) + routeresult + end;
                    } 
                    else res += routeresult;
                    //console.log(lastDiv, res, routeresult)
                }
                //console.log(routeresult)
            } else if (typeof this.routes[r] === 'string') res += this.routes[r];
            return res;
        }

        if(Array.isArray(pageStructure)) {  
            pageStructure.forEach((r)=>{
                result = appendTemplate(pageStructure,r,result);
            })
        } else if (typeof pageStructure === 'object') {
            for(const r in pageStructure) {
                result = appendTemplate(pageStructure,r,result);
            }
        } else if (typeof pageStructure === 'string') result += pageStructure;
        else if (typeof pageStructure === 'function') result += pageStructure();
        //console.log(result,pageStructure,this.routes)
        return result;
    }

    routes:Routes={
        setupServer:this.setupServer,
        terminate:(path:string|number)=>{
            for(const address in this.servers) {
                if(address.includes(`${path}`)) {
                    this.terminate(this.servers[address]);
                    delete this.servers[address];
                }
            }
        },
        GET:this.get, //generic get from url
        POST:this.post, //generic post to url
        addPage:this.addPage,
        addHTML:this.addHTML,
        buildPage:this.buildPage,
        getRequestBody:this.getRequestBody,

        // provides injectable browser websocket-based hot reload template, 
        //  you still need to enable a websocket server separately
        hotreload:(socketURL:string|URL=`http://localhost:8080/wss`) => { 
            
            if(socketURL instanceof URL) socketURL = socketURL.toString();

            const HotReloadClient = (url=`http://localhost:8080/wss`) => {
                //hot reload code injected from backend
                //const socketUrl = `ws://${cfg.host}:${cfg.hotreload}`;
                let socket = new WebSocket(url);
                socket.addEventListener('close',()=>{
                  // Then the server has been turned off,
                  // either due to file-change-triggered reboot,
                  // or to truly being turned off.
              
                  // Attempt to re-establish a connection until it works,
                  // failing after a few seconds (at that point things are likely
                  // turned off/permanantly broken instead of rebooting)
                  const interAttemptTimeoutMilliseconds = 100;
                  const maxDisconnectedTimeMilliseconds = 3000;
                  const maxAttempts = Math.round(maxDisconnectedTimeMilliseconds/interAttemptTimeoutMilliseconds);
                  let attempts = 0;
                  const reloadIfCanConnect = ()=>{
                    attempts ++ ;
                    if(attempts > maxAttempts){
                      console.error("Could not reconnect to dev server.");
                      return;
                    }
                    socket = new WebSocket(url);
                    socket.onerror = (er) => {
                      console.error(`Hot reload port disconnected, will reload on reconnected. Attempt ${attempts} of ${maxAttempts}`);
                    }
                    socket.addEventListener('error',()=>{
                      setTimeout(reloadIfCanConnect,interAttemptTimeoutMilliseconds);
                    });
                    socket.addEventListener('open',()=>{
                      location.reload();
                    });
                  };
                  reloadIfCanConnect();
                });
            }
            
            return `
                <script>
                    console.log('Hot Reload port available at ${socketURL}');  
                    (`+HotReloadClient.toString()+`)('${socketURL}') 
                </script>
            `
        },
        pwa:(serviceWorkerPath:string|URL, manifestPath?:string|URL) => {} //pwa template injector
    }

}