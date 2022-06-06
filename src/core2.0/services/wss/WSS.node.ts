import { Routes, Service, ServiceMessage } from "../Service";
import WebSocket, { WebSocketServer } from 'ws'; //third party lib. //createWebSocketStream <-- use this for cross-node instance communication
import http from 'http'
import https from 'https'
//import { Graph } from "../Graph";

export type SocketServerProps = {
    server:http.Server|https.Server,
    host:'localhost'|'127.0.0.1'|string,
    port:7000|number,
    path:'wss'|'hotreload'|'python'|string,
    onmessage?:(data:any, ws:WebSocket, serverinfo:SocketServerInfo)=>void,
    onclose?:(wss:WebSocketServer, serverinfo:SocketServerInfo)=>void,
    onconnection?:(ws:WebSocket,request:http.IncomingMessage, serverinfo:SocketServerInfo, clientId:string)=>void,
    onconnectionclosed?:(code:number,reason:Buffer,ws:WebSocket, serverinfo:SocketServerInfo, clientId:string)=>void,
    onerror?:(err:Error, wss:WebSocketServer, serverinfo:SocketServerInfo)=>void,
    onupgrade?:(ws:WebSocket, serverinfo:SocketServerInfo, request:http.IncomingMessage, socket:any, head:Buffer)=>void, //after handleUpgrade is called
    keepState?:boolean,
    type?:'wss',
    [key:string]:any
}

export type SocketServerInfo = {
    wss:WebSocketServer,
    clients:{[key:string]:WebSocket},
    address:string
} & SocketServerProps;

export type SocketProps = {
    host:string,
    port:number,
    path?:string,
    serverOptions?:WebSocket.ServerOptions
    onmessage?:(data:string | ArrayBufferLike | Blob | ArrayBufferView | Buffer[], ws:WebSocket,wsinfo:SocketProps)=>void,  //will use this.receive as default
    onopen?:(ws:WebSocket,wsinfo:SocketProps)=>void,
    onclose?:(code:any,reason:any,ws:WebSocket,wsinfo:SocketProps)=>void,
    onerror?:(er:Error, ws:WebSocket,wsinfo:SocketProps)=>void,
    protocol?:'ws'|'wss',
    type?:'socket',
    _id?:string,
    keepState?:boolean
}

export type SocketInfo = {
    socket:WebSocket,
    address?:string
} & SocketProps;

//server side (node) websockets
export class WSSbackend extends Service {

    name='wss'

    debug:boolean=false;
    
    //servers
    servers:{
        [key:string]:SocketServerInfo
    }={};

    //clients
    sockets:{
        [key:string]:SocketInfo
    }={};

    constructor(routes?:Routes, name?:string) {
        super(routes, name);
    }

    setupWSS = (
        options:SocketServerProps,
    ) => {

        const host = options.host;
        const port = options.port;
        let path = options.path;
        const server = options.server;
        delete options.server
        if(!('keepState' in options)) options.keepState = true;

        let opts = {
            host,
            port
        };
        if(typeof options.serverOptions) Object.assign(opts,options.serverOptions)

        const wss = new WebSocketServer(opts);

        let address = `${host}:${port}/`;
        if(path) {
            if(path.startsWith('/')) path = path.substring(1);
            address += path;
        }

        this.servers[address] = {
            type:'wss',
            wss,
            clients:{},
            address,
            ...options
        };


        wss.on('connection',(ws,request) => {
            if(this.debug) console.log(`New socket connection on ${address}`);

            let clientId = `socket${Math.floor(Math.random()*1000000000000)}`;
            this.servers[address].clients[clientId] = ws;

            ws.send(JSON.stringify({ route:'setId', args:clientId }));

            if(options.onconnection) options.onconnection(ws,request,this.servers[address], clientId);//can overwrite the default onmesssage response 
            
            if(!options.onmessage) options.onmessage = (data) => {  //default onmessage

                const result = this.receive(data, wss, this.servers[address]); 
                if(options.keepState) this.setState({[address]:result}); 
    
            }

            if(options.onmessage) ws.on('message',(data)=>{options.onmessage(data,ws,this.servers[address])}) //default onmessage response
            if(options.onconnectionclosed) ws.on('close',(code,reason)=>{
                if(options.onconnectionclosed) options.onconnectionclosed(code,reason,ws, this.servers[address], clientId);
            });
        });

        wss.on('error',(err) => {
            if(this.debug) console.log("Socket Error:",err);
            if(options.onerror) options.onerror(err, wss, this.servers[address]);   
            else console.error(err);
        })

        let onUpgrade = (request:http.IncomingMessage,socket:any,head:Buffer) => { //https://github.com/websockets/ws
            
            if(this.debug) console.log("Upgrade request at: ", request.url);
            let addr = request.headers.host.split(':')[0];
            addr += ':'+port;
            addr += request.url.split('?')[0];

            if(addr === address && this.servers[addr]) {
                this.servers[addr].wss.handleUpgrade(request,socket,head, (ws) => {
                    if(options.onupgrade) options.onupgrade(ws, this.servers[address], request, socket, head);
                    this.servers[addr].wss.emit('connection',ws,request);
                });
            }
        }

        server.addListener('upgrade',onUpgrade);

        wss.on('close',()=> {
            server.removeListener('upgrade',onUpgrade);
            if(options.onclose) options.onclose(wss, this.servers[address]);
            else console.log(`wss closed: ${address}`);
        })

        return this.servers[address];
    }

    openWS = (
        options:SocketProps,
    ) => {
        let protocol = options.protocol;
        if(!protocol) protocol = 'wss';
        let address = `${protocol}://${options.host}`;
        if(options.port) address+= ':'+options.port;
        if(!options.path || options.path?.startsWith('/')) address += '/';
        if(options.path) address += options.path;

        const socket = new WebSocket(address);

        if(!('keepState' in options)) options.keepState = true;

        if(options.onmessage) socket.on('message',(data)=>{options.onmessage(data,socket,this.sockets[address]);}); 
        else {
            let socketonmessage = (data:any)=>{ 
          
                if(Object.getPrototypeOf(data) === String.prototype) { //pulling this out of receive to check if setId was called
                    let substr = data.substring(0,8);
                    if(substr.includes('{') || substr.includes('[')) {    
                        if(substr.includes('\\')) data = data.replace(/\\/g,"");
                        if(data[0] === '"') { data = data.substring(1,data.length-1)};
                        //console.log(message)
                        data = JSON.parse(data); //parse stringified objects

                        if(data.route === 'setId') {
                            this.sockets[address]._id = data.args;
                            socket.removeEventListener('message',socketonmessage);
                            socket.on('message', (data:any)=> {
                                const result = this.receive(data,socket,this.sockets[address]); 
                                if(options.keepState) this.setState({[address]:result}); 
                            }); //clear this extra logic after id is set
                        }
                    }
                } 

                const result = this.receive(data,socket,this.sockets[address]); 
                if(options.keepState) this.setState({[address]:result}); 
            }
            socket.on('message',socketonmessage); //add default callback if none specified
        }
        if(options.onopen) socket.on('open',()=>{options.onopen(socket,this.sockets[address]);});
        if(options.onclose) socket.on('close',(code,reason)=>{options.onclose(code,reason,socket,this.sockets[address]);});
        if(options.onerror) socket.on('error',(er)=>{options.onerror(er,socket,this.sockets[address]);});

        this.sockets[address] = {
            type:'socket',
            socket,
            address,
            ...options
        }

        return socket;
    }

    transmit = (
        message:string | ArrayBufferLike | Blob | ArrayBufferView | Buffer[] | ServiceMessage, 
        ws:WebSocketServer|WebSocket,
    ) => {
        if(typeof message === 'object') message = JSON.stringify(message);

        if(!ws) {
            
            let served = this.servers[Object.keys(this.servers)[0]];
            if(served) ws = served.wss; //select first websocket server to transmit to all clients
            else {//else select first active socket to transmit to one endpoint
                let s = this.sockets[Object.keys(this.sockets)[0]];
                if(s) ws = s.socket; 
            };
        }
        if(ws instanceof WebSocketServer) { //broadcast to all clients
            ws.clients.forEach((c:WebSocket) => {c.send(message)})
        }
        else if(ws instanceof WebSocket) ws.send(message);
    }

    closeWS = (ws:WebSocket|string) => {
        if(!ws) {   
            let s = this.sockets[Object.keys(this.sockets)[0]];
            if(s) ws = s.socket; 
        }
        else if(typeof ws === 'string') {
            for(const k in this.sockets) {
                if(k.includes(ws)) {
                    ws = this.sockets[k].socket;
                    break;
                }
            }
        }
        
        if(ws instanceof WebSocket) 
            if(ws.readyState === ws.OPEN) 
                ws.close();
    }

    terminate = (ws:WebSocketServer|WebSocket|string) => {
        if(!ws) {
            let served = this.servers[Object.keys(this.servers)[0]];
            if(served) ws = served.wss; //select first websocket server to transmit to all clients
        }
        else if(typeof ws === 'string') {
            for(const k in this.servers) {
                if(k.includes(ws)) {
                    ws = this.servers[k].wss;
                    break;
                }
            }
            if(!ws) {
                for(const k in this.sockets) {
                    if(k.includes(ws as string)) {
                        ws = this.sockets[k].socket;
                        break;
                    }
                }
            }
        }

        if(ws instanceof WebSocketServer) 
            ws.close((er) => {if(er) console.error(er);});
        else if(ws instanceof WebSocket)
            if(ws.readyState === ws.OPEN) 
                ws.close();
    }

    routes:Routes={
        setupWSS:this.setupWSS,
        openWS:this.openWS,
        closeWS:this.closeWS,
        terminate:(path:string) => {
            if(path) {
                for (const address in this.servers) {
                    if(address.includes(path)) {
                        this.terminate(this.servers[address].wss);
                        delete this.servers[address];

                    }
                }
            } else {
                path = Object.keys(this.servers)[0];
                this.terminate(this.servers[path].wss);
                delete this.servers[path];
            }
        }
    }

}