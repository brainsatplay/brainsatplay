import { Routes, Service, ServiceMessage } from "../Service";
import {createSession, createChannel} from 'better-sse'; //third party lib. SSEs really just 
import http from 'http'
import https from 'https'

export type SSEProps = {
    server:http.Server|https.Server,
    path:string,
    channels?:string[],
    onconnection?:(session:any,sseinfo:any,req:http.IncomingMessage,res:http.ServerResponse)=>void,
    onclose?:(sse:any)=>void,
    onsessionclose:(session:any,sseinfo:any)=>void,
    [key:string]:any
}

export type SSESessionInfo = {
    sessions:{
        [key:string]:any
    }
} & SSEProps

export class SSEbackend extends Service {

    name='sse'
    
    eventsources:{
        [key:string]:SSESessionInfo
    }={}

    constructor(routes?:Routes, name?:string) {
        super(routes, name);
    }

    setupSSE = (options:SSEProps) => {

        const server = options.server; 
        let path = options.path;
        
        if(this.eventsources[path]) {
            return false;
        }

        const channel = createChannel();
        
        let sse = {
            channel,
            sessions:{},
            ...options
        }
        
        this.eventsources[path] = sse;

        let onRequest = (req:http.IncomingMessage,res:http.ServerResponse) => {
            if(req.method === 'GET' && req.url.includes(path)) {
                console.log('SSE Request', path);
                createSession(req,res).then((session) => {

                    channel.register(session);
                    sse.sessions[`sse${Math.floor(Math.random()*1000000000000000)}`] = session;

                    if(sse.onconnection) {sse.onconnection(session,sse,req,res);}
                
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
            if(req.url.indexOf(path) > -1) { //redirect requests to this listener if getting this path
                if(!this.eventsources[path]) { //removes this listener if not found and returns to the original listener array
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
                    let keys = Object.keys(this.eventsources)
                    if(keys.length > 0) 
                        {
                            let evs = this.eventsources[keys[0]];
                            if(evs.channels.includes(data.route)) {
                                path = evs.path;
                                channel = data.route;
                            }
                            else if (evs.channels.includes((data as any).origin)) {
                                path = evs.path;
                                channel = data.origin as string;
                            }
                        }
                    if(!path && data.route) 
                        if(this.eventsources[data.route]) 
                            path = data.route;
                    if(!path && typeof data.origin === 'string') 
                        if(this.eventsources[data.origin]) 
                            path = data.origin;
                }
                
            }
            //if(!channel && data.route) channel = path; //there could be a channel for each route 
            data = JSON.stringify(data);
        }

        if(!path) path = Object.keys(this.eventsources)[0]; //transmit on default channel

        if(path && channel) {
            this.eventsources[path].channel.broadcast(data, channel); //specific events broadcasted to all sessions on the event source
        } else if(path) {
            let sessions = this.eventsources[path].sessions;
            for(const s in sessions) {
                if(sessions[s].isConnected) sessions[s].push(data);//on 'message' event
                else {
                    if(this.eventsources[path].onsessionclose) this.eventsources[path].onsessionclose(sessions[s], this.eventsources[path])
                    delete sessions[s]; //removed dead sessions
                }
            }
        } 
    }

    //need to make a backend sse listener too

    terminate = (path:string|SSEProps) => {
        if(typeof path === 'object') delete this.eventsources[path.path];
        else if(typeof path === 'string') delete this.eventsources[path];
    }

    routes:Routes = {
        setupSSE:this.setupSSE,
        terminate:this.terminate
    }

}