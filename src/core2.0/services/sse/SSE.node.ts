import { Routes, Service, ServiceMessage } from "../Service";
import {createSession, createChannel, Session, SessionState} from 'better-sse'; //third party lib. SSEs really just push notifications to an http endpoint but it's minimal overhead
import http from 'http'
import https from 'https'

export type SSEProps = {
    server:http.Server|https.Server,
    path:string,
    channels?:string[],
    onconnection?:(session:any,sseinfo:any,_id:string,req:http.IncomingMessage,res:http.ServerResponse)=>void,
    onclose?:(sse:any)=>void,
    onconnectionclose?:(session:any,sseinfo:any,_id:string,req:http.IncomingMessage,res:http.ServerResponse)=>void,
    type?:'sse'|string,
    [key:string]:any
}

export type SSESessionInfo = {
    sessions:{
        [key:string]:any
    }
} & SSEProps

export class SSEbackend extends Service {

    name='sse'
    
    debug=false;

    servers:{
        [key:string]:SSESessionInfo
    }={}
    
    eventsources:{ //the session instances
        [key:string]:{ _id:string, session:Session<SessionState>, served:SSESessionInfo }
    }={}

    constructor(routes?:Routes, name?:string) {
        super(routes, name);
    }

    setupSSE = (options:SSEProps) => {

        const server = options.server; 
        let path = options.path;
        
        if(this.servers[path]) {
            return false;
        }

        const channel = createChannel();

        let sse = {
            type:'sse',
            channel,
            sessions:{},
            ...options
        } as SSESessionInfo;
        
        this.servers[path] = sse;

        if(!sse.onconnectionclose) sse.onconnectionclose = (session,sse,id,req,res) => {
            delete sse.sessions[id];
        }

        let onRequest = (req:http.IncomingMessage,res:http.ServerResponse) => {
            if(req.method === 'GET' && req.url?.includes(path)) {
                if(this.debug) console.log('SSE Request', path);

                createSession(req,res).then((session) => {

                    channel.register(session);
                    let _id = `sse${Math.floor(Math.random()*1000000000000000)}`;
                    sse.sessions[_id] = session;

                    this.eventsources[_id] = {
                        _id,
                        session,
                        served:sse
                    };

                    session.push(JSON.stringify({route:'setId',args:_id})); //associate this user's connection with a server generated id 
                    if(options.onconnectionclose) session.on('close',()=>{(options.onconnectionclose as any)(session,sse,_id,req,res)})
                    if(sse.onconnection) {sse.onconnection(session,sse,_id,req,res);}
                
                });
            }
        }

        let requestListeners = server.listeners('request');
        server.removeAllListeners('request');

        const otherListeners = (req:http.IncomingMessage,res:http.ServerResponse) => {
            requestListeners.forEach((l)=> {
                l(req,res);
            });
        }
        
        const sseListener =  (req:http.IncomingMessage,res:http.ServerResponse) => { 
            if(req.url) if(req.url.indexOf(path) > -1) { //redirect requests to this listener if getting this path
                if(!this.servers[path]) { //removes this listener if not found and returns to the original listener array
                    server.removeListener('request',sseListener);
                    server.addListener('request',otherListeners);
                }
                onRequest(req,res);
            }
            else otherListeners(req,res);
        }

        server.addListener('request',sseListener);

        server.addListener('close',()=>{
            if(sse.onclose) sse.onclose(sse);
        });

        return sse;

    }
    
    transmit = (
        data:string | ServiceMessage, 
        path:string, 
        channel:string
    ) => {
        if(typeof data === 'object') {
            if(data.route) {
                if(!path) {
                    let keys = Object.keys(this.servers)
                    if(keys.length > 0) 
                        {
                            let evs = this.servers[keys[0]];
                            if(evs.channels?.includes(data.route)) {
                                path = evs.path;
                                channel = data.route;
                            }
                            else if (evs.channels?.includes((data as any).origin)) {
                                path = evs.path;
                                channel = data.origin as string;
                            }
                        }
                    if(!path && data.route) 
                        if(this.servers[data.route]) 
                            path = data.route;
                    if(!path && typeof data.origin === 'string') 
                        if(this.servers[data.origin]) 
                            path = data.origin;
                }
                
            }
            //if(!channel && data.route) channel = path; //there could be a channel for each route 
            data = JSON.stringify(data);
        }

        if(!path) path = Object.keys(this.servers)[0]; //transmit on default channel

        if(path && channel) {
            this.servers[path].channel.broadcast(data, channel); // specific events broadcasted to all sessions on the event source
        } else if(path) {
            let sessions = this.servers[path].sessions;
            for(const s in sessions) {
                if(sessions[s].isConnected) sessions[s].push(data); // on 'message' event
                else {
                    delete sessions[s]; //removed dead sessions
                }
            }
        } 
    }

    //need to make a backend sse listener too

    terminate = (path:string|SSEProps) => {
        if(typeof path === 'object') delete this.servers[path.path];
        else if(typeof path === 'string') delete this.servers[path];
    }

    routes:Routes = {
        setupSSE:this.setupSSE,
        terminate:this.terminate
    }

}