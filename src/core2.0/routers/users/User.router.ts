import { Graph, GraphProperties } from "../../Graph";
import { Protocol, Router } from "../Router";
import { Routes, Service } from "../../services/Service";

export type UserProps = {
    _id:string,                      //unique ID
    sockets:{[key:string]:any},      //websockets info, browser and node use different libraries but have same calls
    wss:{[key:string]:any},          //websocket server backend info 
    eventsources:{[key:string]:any}, //sse client or server info
    servers:{[key:string]:any},      //http servers, e.g. dedicated webpage contexts? *shrug*
    webrtc:{[key:string]:any},       //webrtc rooms and/or server info
    sessions:{[key:string]:any},     //game sessions
    latency?:number,                 //should calculate other metrics like latency
    [key:string]:any //other user properties e.g. personally identifying information
} & GraphProperties

//this is to aggregate server activity based on specific Ids provided as origin tags in calls
export class UserRouter extends Router {

    users:{
        [key:string]:Graph
    } = {}

    constructor(services:(Service|Routes)[]|{[key:string]:Service|Routes}|any[]) {
        super(services);
    }

    //just a macro for service._run with clear usage for user Id as origin, you'll need to wire up how responses are handled at the destination based on user id
    runAs = (
        node:string|Graph, 
        userId:string, 
        ...args:any[]
    ) => {
        return this._run(node,userId,...args);
    }

    pipeAs = ( //just macro of service.pipe with clear usage for user Id as origin, you'll need to wire up how responses are handled at the destination based on user id
        source:string | Graph, 
        destination:string, 
        transmitter:Protocol|string, 
        userId:string,
        method:string, 
        callback:(res:any)=>any|void
    ) => {
        return this.pipe(source, destination, transmitter, userId, method, callback);
    }

    //pass user info and any service connections we want specific to this users. Pass properties of services 
    //   to create fresh connections e.g. with custom callbacks
    addUser(user:UserProps) { 
        if(!user?._id) user._id = `user${Math.floor(Math.random()*1000000000000000)}`;
            
        //pass any connection props and replace them with signaling objects e.g. to set event listeners on messages for this user for these sockets, sse's, rtcs, etc.
        if(user.sockets) {
            for(const address in user.sockets) {
                if(!user.sockets[address].socket) {
                    user.sockets[address] = this.run('wss/openWS',user.sockets[address]);
                }
            }
        }
        if(user.wss) {
            for(const address in user.wss) {
                if(!user.wss[address].wss) {
                    user.wss[address] = this.run('wss/openWSS',user.wss[address]);
                }
            }
        }
        if(user.eventsources) {
            for(const path in user.eventsources) {
                if(!user.eventsources[path].source && !user.eventsources[path].sessions) {
                    user.eventsources[path] = this.run('wss/openSSE',user.eventsources[path]);
                }
            }
        }
        if(user.servers) {
            for(const address in user.servers) {
                if(!user.servers[address].server) {
                    user.servers[address] = this.run('http/setupServer',user.servers[address]);
                }
            }
        }
        //if(users.webrtc)
        //if(users.sessions)
            
        if(!(user instanceof Graph)) this.users[user._id] = new Graph(user, undefined, this.service);

        return this.users[user._id];
    }

    //need to close all user connections
    removeUser = (user:UserProps & Graph) => {
        if(user.sockets) {
            for(const address in user.sockets) {
                if(!user.sockets[address].socket) {
                    this.run('wss/terminate',address);
                }
            }
        }
        if(user.wss) {
            for(const address in user.wss) {
                if(!user.wss[address].wss) {
                    this.run('wss/terminate',address);
                }
            }
        }
        if(user.eventsources) {
            for(const path in user.eventsources) {
                if(!user.eventsources[path].source && !user.eventsources[path].sessions) {
                    this.run('sse/terminate',path);
                }
            }
        }
        if(user.servers) {
            for(const address in user.servers) {
                if(!user.servers[address].server) {
                    this.run('http/terminate',address);
                }
            }
        }

        delete this.users[user._id];
    }

}