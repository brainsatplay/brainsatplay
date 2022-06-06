import { Service, Routes, ServiceMessage } from "../Service";

export type WebSocketProps = {
    host:string,
    port:number,
    path?:string,
    onmessage?:(data:string | ArrayBufferLike | Blob | ArrayBufferView,  ws:WebSocket, wsinfo:WebSocketInfo)=>void, //will use this.receive as default
    onopen?:(ev:any, ws:WebSocket, wsinfo:WebSocketInfo)=>void,
    onclose?:(ev:any,  ws:WebSocket, wsinfo:WebSocketInfo)=>void,
    onerror?:(ev:any,  ws:WebSocket, wsinfo:WebSocketInfo)=>void
    protocol?:'ws'|'wss',
    keepState?:boolean,
    type?:'socket',
    _id?:string,
    [key:string]:any
}

export type WebSocketInfo = {
    socket:WebSocket,
    address:string
} & WebSocketProps

//browser side websockets
export class WSSfrontend extends Service {

    name='wss'
    
    sockets:{
        [key:string]:WebSocketInfo
    } = { }

    constructor(routes?:Routes, name?:string) {
        super(routes, name);
    }

    openWS = (
        options:WebSocketProps = {
            host:'localhost',
            port:7000,
            path:undefined,
            protocol:'ws',
            onclose:(ev:any,socket:WebSocket,wsinfo:WebSocketInfo)=>{
                if(ev.target.url) delete this.sockets[ev.target.url];
            }
        }
    ) => {
        let protocol = options.protocol;
        if(!protocol) protocol = 'ws';
        let address = `${protocol}://${options.host}`;

        if(!('keepState' in options)) options.keepState = true;
        if(options.port) address+= ':'+options.port;
        if(options.path && !options.path?.startsWith('/')) address += '/';
        if(options.path) address += options.path;

        if(this.sockets[address]?.socket)
            if(this.sockets[address].socket.readyState === this.sockets[address].socket.OPEN) 
                this.sockets[address].socket.close(); //we'll try refresh the socket

        const socket = new WebSocket(address);

        if(!options.onmessage) {
            options.onmessage = (data:any, ws:WebSocket, wsinfo:WebSocketInfo) => { 
            
                if(Object.getPrototypeOf(data) === String.prototype) {
                    let substr = data.substring(0,8);
                    if(substr.includes('{') || substr.includes('[')) {    
                        if(substr.includes('\\')) data = data.replace(/\\/g,"");
                        if(data[0] === '"') { data = data.substring(1,data.length-1)};
                        //console.log(message)
                        data = JSON.parse(data); //parse stringified objects

                        if(data.route === 'setId') {
                            this.sockets[address]._id = data.args;
                            options.onmessage = (data:any, ws:WebSocket, wsinfo:WebSocketInfo) => { //clear extra logic after id is set
                                let res = this.receive(data); 
                                if(options.keepState) this.setState({[address]:res}); 
                            }
                        }
                    }
                } 
                
                let res = this.receive(data); 
                if(options.keepState) this.setState({[address]:res}); 
            } //default onmessage
        }

        if(options.onmessage) {
            socket.addEventListener('message',(ev)=>{
                options.onmessage(ev.data, socket, this.sockets[address]);
            });
        }
        if(options.onopen) socket.addEventListener('open',(ev)=>{options.onopen(ev,socket, this.sockets[address]);});
        if(options.onclose) socket.addEventListener('close',(ev)=>{options.onclose(ev,socket, this.sockets[address]);});
        if(options.onerror) socket.addEventListener('error',(ev)=>{options.onerror(ev,socket, this.sockets[address]);});

        this.sockets[address] = {
            socket,
            address,
            type:'socket',
            ...options
        };

        return this.sockets[address];
    }

    transmit = (
        data:string | ArrayBufferLike | Blob | ArrayBufferView | ServiceMessage, 
        ws:WebSocket
    ) => {
        if(typeof data === 'object') data = JSON.stringify(data);
        if(!ws) {
            let s = this.sockets[Object.keys(this.sockets)[0]];
            if(s) ws = s.socket;
        }
        if(ws instanceof WebSocket && ws?.readyState === 1) ws.send(data);
    }

    terminate = (ws:WebSocket|string) => {
        if(!ws) {
            let key = Object.keys(this.sockets)[0]
            if(key) ws = this.sockets[key].socket;
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

    request = (message:ServiceMessage|any, ws:WebSocket, origin?:string, method?:string) => { //return a promise which can resolve with a server route result through the socket
        let callbackId = Math.random();
        let req:any = {route:'runRequest', args:message, callbackId};
        if(method) req.method = method;
        if(origin) req.origin = origin;
        return new Promise((res,rej) => {
            let onmessage = (data:any) => {
                if(data.includes('{') || data.includes('[')) data = JSON.parse(data);
                if(data.callbackId === callbackId) {
                    ws.removeEventListener('message',onmessage);
                    res(data);
                }
            }

            ws.addEventListener('message',onmessage);
            ws.send(JSON.stringify(req));
        })
    }

    runRequest = (message:any, ws:WebSocket) => { //send result back
        let res = this.receive(message);
        res = {args:res, callbackId:message.callbackId};
        res = JSON.stringify(res);
        ws.send(res);
    }

    routes:Routes = {
        openWS:this.openWS,
        request:this.request,
        runRequest:this.runRequest,
        terminate:this.terminate
    }

}