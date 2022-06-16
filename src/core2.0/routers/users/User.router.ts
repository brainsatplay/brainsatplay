import { GraphNode, GraphNodeProperties, stringifyFast } from "../../Graph";
import { Protocol, Router } from "../Router";
import { Routes, Service, ServiceMessage } from "../../services/Service";

export type UserProps = {
    _id?:string,                      //unique ID
    sockets?:{[key:string]:any},      //websockets info, browser and node use different libraries but have same calls
    wss?:{[key:string]:any},          //websocket server backend info 
    eventsources?:{[key:string]:any}, //sse client or server info
    servers?:{[key:string]:any},      //http servers, e.g. dedicated webpage contexts? *shrug*
    webrtc?:{[key:string]:any},       //webrtc rooms and/or server info
    sessions?:{[key:string]:any},     //game sessions
    sendAll?:Protocol|string|{[key:string]:{[key:string]:any}}, //e.g. user.sendAll.wss['ws://localhost:8080/wss'] should return the connection info object (info in that service)
    onopen?:(connection:any)=>void, 
    onmessage?:(message:any)=>void,  //when a message comes in from an endpoint assigned to this user   
    onclose?:(connection:any)=>void,               //when a connection belonging to this user closes
    send?:(message:any, channel?:string)=>any,        //send function to determine how to communicate to this user's endpoint(s) from this router instance
    request?:(message:ServiceMessage|any, connection?:any, origin?:string, method?:string) => Promise<any> //await a server response for a call 
    latency?:number,                 //should calculate other metrics like latency
    [key:string]:any //other user properties e.g. personally identifying information
} & GraphNodeProperties

//parse from this object/endpoint and send to that object/endpoint, e.g. single users
export type PrivateSessionProps = {
    _id?:string,
    settings?:{
        listener:string,
        source:string,
        propnames:{[key:string]:boolean},
        admins?:{[key:string]:boolean},
        moderators?:{[key:string]:boolean},
        password?:string,
        ownerId?:string,
        onopen?:(session:SharedSessionProps)=>void,
        onmessage?:(session:SharedSessionProps)=>void,
        onclose?:(session:SharedSessionProps)=>void,
        [key:string]:any //arbitrary props e.g. settings, passwords
    },
    data?:{
        [key:string]:any
    },
    lastTransmit?:string|number,
    [key:string]:any //arbitrary props e.g. settings, passwords
}

//sessions for shared user data and game/app logic for synchronous and asynchronous sessions to stream selected properties on user objects as they are updated
export type SharedSessionProps = {
    _id?:string,
    settings?:{
        name:string,
        propnames:{[key:string]:boolean},
        users?:{[key:string]:boolean},
        host?:string, //if there is a host, all users only receive from the host's prop updates
        hostprops?:{[key:string]:boolean},
        admins?:{[key:string]:boolean},
        moderators?:{[key:string]:boolean},
        spectators?:{[key:string]:boolean},
        banned?:{[key:string]:boolean},
        password?:string,
        ownerId?:string,
        onopen?:(session:SharedSessionProps)=>void,
        onmessage?:(session:SharedSessionProps)=>void,
        onclose?:(session:SharedSessionProps)=>void,
        [key:string]:any //arbitrary props e.g. settings, passwords
    },
    data?:{
        shared:{
            [key:string]:{
                [key:string]:any
            }
        },
        private?:{ //host driven sessions will share only what the host shares to all users, while hosts will receive hidden data
            [key:string]:any
        },
        [key:string]:any
    },
    lastTransmit?:string|number,
    [key:string]:any //arbitrary props e.g. settings, passwords
}

//this is to aggregate server activity based on specific Ids provided as origin tags in calls
export class UserRouter extends Router {

    users:{
        [key:string]:GraphNode
    } = {}

    sessions:{
        private:{[key:string]:PrivateSessionProps}, //sync user props <--> user props
        shared:{[key:string]:SharedSessionProps}//sync user props <--> all other users props
    } = {
        private:{},
        shared:{}
    }

    constructor(services:(Service|Routes)[]|{[key:string]:Service|Routes}|any[]) {
        super(services);
        this.load(this.routes);
    }

    //just an alias for service._run with clear usage for user Id as origin, you'll need to wire up how responses are handled at the destination based on user id
    runAs = (
        node:string|GraphNode, 
        userId:string|UserProps|UserProps & GraphNode|undefined, 
        ...args:any[]
    ) => {
        if(userId instanceof Object) userId = (userId as UserProps)._id;
        return this._run(node,userId as string,...args);
    }

    pipeAs = ( //just an alias of service.pipe with clear usage for user Id as origin, you'll need to wire up how responses are handled at the destination based on user id
        source:string | GraphNode, 
        destination:string, 
        transmitter:Protocol|string, 
        userId:string|UserProps|UserProps & GraphNode|undefined,
        method:string, 
        callback:(res:any)=>any|void
    ) => {
        if(typeof userId === 'object') userId = userId._id;
        return this.pipe(source, destination, transmitter, userId, method, callback);
    }

    _initConnections = (connections:UserProps) => {
        //pass any connection props and replace them with signaling objects e.g. to set event listeners on messages for this user for these sockets, sse's, rtcs, etc.
        if(connections.sockets && this.services.wss) {
            for(const address in connections.sockets) {
                if(connections.sockets[address]._id) {
                    if(this.services.wss.servers) {
                        for(const addr in this.services.wss.servers) { //check server clients to corroborate frontend/backend connections
                            for(const _id in this.services.wss.servers[addr].clients) {
                                if(_id === connections.sockets[address]._id) {
                                    connections.sockets[address] = { socket:this.services.wss.servers[addr].clients[_id], _id, address };
                                    break;
                                }
                            }
                        }
                    }
                    if(!connections.sockets[address].socket) {
                        for(const s in this.services.wss.sockets) {
                            if(this.services.wss.sockets[s]._id === connections.sockets[address]._id) {
                                connections.sockets[address] = this.services.wss.sockets[address];
                                break;
                            }
                        }
                    }
                }
                if(!connections.sockets[address].socket) {
                    connections.sockets[address] = this.run('wss/openWS',connections.sockets[address]);
                }
                if(connections.onmessage) connections.sockets[address].socket.addEventListener('message',connections.onmessage);
                if(connections.onclose) connections.sockets[address].socket.addEventListener('close',connections.onclose);
            }
        }
        if(connections.wss && this.services.wss) {
            for(const address in connections.wss) {
                if(connections.wss[address]._id) {
                    for(const s in this.services.wss.servers) {
                        if(this.services.wss.servers[s]._id === connections.server[address]._id) {
                            connections.wss[address] = this.services.wss.server[address];
                            break;
                        }
                    }
                }
                if(!connections.wss[address].wss) {
                    connections.wss[address] = this.run('wss/openWSS', connections.wss[address]);
                }
                if(connections.onmessage) connections.wss[address].wss.addEventListener('message',connections.onmessage);
                if(connections.onclose) connections.wss[address].wss.addEventListener('close',connections.onclose);
            }
        }
        if(connections.eventsources && this.services.sse) {
            for(const path in connections.eventsources) {
                if(connections.eventsources[path]._id) {
                    for(const s in this.services.sse.eventsources) {
                        if(this.services.sse.eventsources[s]._id === connections.eventsources[path]._id) {
                            connections.eventsources[path] = this.services.sse.eventsources[s];
                            break;
                        } else if (this.services.sse.eventsources[s].sessions?.[connections.eventsources[path]._id]) {
                            connections.eventsources[path] = {session:this.services.sse.eventsources[s].sessions[connections.eventsources[path]._id], _id:path};
                            break;
                        } else if (this.services.sse.eventsources[s].session?.[connections.eventsources[path]._id]) {
                            connections.eventsources[path] = this.services.sse.eventsources[s];
                            break;
                        } 
                    }
                }
                if(!connections.eventsources[path].source && !connections.eventsources[path].sessions && !connections.eventsources[path].session) {
                    connections.eventsources[path] = this.run('sse/openSSE',connections.eventsources[path]);
                }
                if(connections.eventsources[path].source) {
                    if(connections.onmessage) connections.eventsources[path].source.addEventListener('message',connections.onmessage);
                    if(connections.onclose) connections.eventsources[path].source.addEventListener('close',connections.onclose);
                }
            }
        }
        if(connections.servers && this.services.http) {
            for(const address in connections.servers) {
                if(!connections.servers[address].server) {
                    connections.servers[address] = this.run('http/setupServer',connections.servers[address]);
                }
                if(connections.onmessage) this.subscribe(address,connections.onmessage); //??? unless we want a custom request listener then thats a whole other thing
            }
        }
        if(connections.webrtc && this.services.webrtc) {
            //need to figure out how to connect to other users in an automated way here before I can implement this nicely
            //also the node webrtc lib is gonna be a thing
            for(const _id in connections.webrtc) {
                if(connections.webrtc[_id].rtc) {
                    let channel = connections.webrtc[_id].channels.data
                    if(!channel) channel = connections.webrtc[_id].channels[Object.keys(connections.webrtc[_id].channels)[0]];
                    if(channel) channel.addEventListener('message', connections.onmessage);
                }
            }
        }
        if(connections.sessions && connections._id) {
            //join sessions
            for(const s in connections.sessions) {
                if(typeof connections.sessions[s] === 'string')
                    connections.sessions[s] = this.joinSession(connections.sessions[s],connections._id);
                else if (typeof connections.sessions[s] === 'object')
                    connections.sessions[s] = this.joinSession(s,connections._id,connections.sessions[s]);
            }
        }
    }

    //pass user info and any service connections we want specific to this users. Pass properties of services 
    //   to create fresh connections e.g. with custom callbacks
    addUser = async (user:UserProps|any, timeout=5000) => { 
        if(!user) user = {};
        if(!user._id) user._id = `user${Math.floor(Math.random()*1000000000000000)}` as string;

        user.tag = user._id;
        if(typeof user === 'object') {
            if(!user.onmessage) {
                user.onmessage = (message) => {
                    this.setState({[user.tag as string]:message})
                }
            }

            if(!user.onclose) user.onclose = () => { this.removeUser(user._id); }

            user.operator = user.onmessage; //user.run(...message);

            if(!user.send) { //default send will select first available (fastest) protocol representing the target endpoint, which can be specified with connections
                user.send = (message:ServiceMessage|any, channel?:string) => {
                    //console.log(this.users[user._id].sendAll)
                    if(!this.users[user._id]) return;
                    //use the fastest available endpoint for the user, swap when no longer available to next possible endpoint
                    if(this.users[user._id].sendAll instanceof Object) { //can transmit on multiple endpoints in an object
                        if(message.route && !message.origin) message.origin = user._id;
                        if(message instanceof Object) message = JSON.stringify(message);
                        for(const protocol in this.users[user._id].sendAll) {
                            for(const info in this.users[user._id].sendAll[protocol]) {
                                let obj = this.users[user._id].sendAll[protocol][info];
                                if(obj.socket) { //frontend or backend socket
                                    if(obj.socket.readyState === 1) {
                                        obj.socket.send(message);
                                    } else delete this.users[user._id].sendAll[protocol][info]; //not preferable if it's closed
                                } else if(obj.rtc) { //webrtc peer connection
                                    if(channel && obj.channels[channel])
                                        obj.channels[channel].send(message);
                                    else if(obj.channels.data) //default data channel
                                        obj.channels.data.send(message);
                                    else {
                                        let firstchannel = Object.keys(obj.channels)[0]; 
                                        obj.channels[firstchannel].send(message);
                                    }
                                } else if(obj.wss) { //websocket server
                                    obj.wss.clients.forEach((c:WebSocket) => {c.send(message);})
                                } else if(obj.sessions) { //sse backend
                                    if(channel)
                                        obj.channel.broadcast(message,channel)
                                    else for(const s in obj.sessions) {
                                        if(obj.sessions[s].isConnected) {
                                            obj.sessions[s].push(message);
                                        }
                                    }
                                } else if(obj.session) { //sse backend single session
                                    if(channel)
                                        obj.served.channel.broadcast(message,channel); //this will still boradcast to all channels fyi
                                    else if(obj.session.isConnected) obj.session.push(message);
                                    else delete this.users[user._id].sendAll[protocol][info];
                                } else if(obj.server) { //http server (??)
                                    if(this.services.http)
                                        this.services.http.transmit(message,channel); //??
                                }
                            } //need to despaghettify this 
                        }
                    }
                    else {
                        let connections:any;
                        if(this.users[user._id].sendAll) if(Object.getPrototypeOf(this.users[user._id].sendAll) === String.prototype) 
                            {connections = this.user[this.users[user._id].sendAll]; this.users[user._id].sendAll = {}; }
                        if(connections) {
                            //go through each possible protocol and set an object on user.sendAll for the first open & fastest endpoint
                        } else {
                            this.users[user._id].sendAll = {};
                            if(this.users[user._id].webrtc) {
                                let key = Object.keys(this.users[user._id].webrtc)[0];
                                if(key)
                                    this.users[user._id].sendAll.webrtc = {[key]:this.users[user._id].webrtc[key]};
                            } else if (this.users[user._id].eventsources && this.users[user._id].eventsources[Object.keys(this.users[user._id].eventsources)[0]].session) {
                                let key = Object.keys(this.users[user._id].eventsources)[0];
                                if(key) {
                                    this.users[user._id].sendAll.eventsources = {[key]:this.users[user._id].eventsources[key]} 
                                }
                            } else if (this.users[user._id].eventsources && this.users[user._id].eventsources[Object.keys(this.users[user._id].eventsources)[0]].sessions) {
                                let key = Object.keys(this.users[user._id].eventsources)[0];
                                if(key) {
                                    this.users[user._id].sendAll.eventsources = {[key]:this.users[user._id].eventsources[key]} 
                                }
                            } else if (this.users[user._id].sockets) {
                                let key = Object.keys(this.users[user._id].sockets)[0];
                                if(key)
                                    this.users[user._id].sendAll.sockets = {[key]:this.users[user._id].sockets[key]};
                            } else if (this.users[user._id].wss) {
                                let key = Object.keys(this.users[user._id].wss)[0];
                                if(key)
                                    this.users[user._id].sendAll.wss = {[key]:this.users[user._id].wss[key]};
                            } else if (this.users[user._id].servers) {
                                let key = Object.keys(this.users[user._id].servers)[0];
                                if(key)
                                    this.users[user._id].sendAll.servers = {[key]:this.users[user._id].servers[key]};
                            }

                        }

                        if(this.users[user._id].sendAll) 
                            if(Object.keys(this.users[user._id].sendAll).length>0)  
                                this.users[user._id].send(message,channel);
                    }
                }
            }    

            if(!user.request) {
                user.request = (message:ServiceMessage|any, connection?:any, connectionId?:string, origin?:string, method?:string) => { //return a promise which can resolve with a server route result through the socket
                    if(!connection) {
                        if(this.users[user._id].sockets) for(const prop in this.users[user._id].sockets) {
                            if(this.users[user._id].sockets[prop].socket) {
                                connectionId = this.users[user._id].sockets[prop]._id;
                                if(!connectionId) continue;
                                connection = this.users[user._id].sockets[prop].socket;
                                break;
                            }
                        }
                        if(!connection) if(this.users[user._id].webrtc) for(const prop in this.users[user._id].webrtc) {
                            if(this.users[user._id].webrtc[prop].channels.data) {
                                connectionId = this.users[user._id].webrtc[prop]._id;
                                if(!connectionId) return undefined;
                                connection = this.users[user._id].webrtc[prop].channels.data;
                                break;
                            } else if (Object.keys(this.users[user._id].webrtc[prop].channels).length > 0) {
                                connectionId = this.users[user._id].webrtc[prop]._id;
                                if(!connectionId) return undefined;
                                connection = this.users[user._id].webrtc[prop].channels[Object.keys(this.users[user._id].webrtc[prop].channels)[0]]
                                break;
                            }
                        }
                        if(!connection) return undefined;
                    }
                    let callbackId = `${Math.random()}`;
                    let req:any = {route:'runRequest', args:[message,connectionId,callbackId], origin:user._id};
                    if(method) req.method = method;
                    if(origin) req.origin = origin;
                    return new Promise((res,rej) => {
                        let onmessage = (ev:any) => {
                            let data = ev.data;
                            if(typeof data === 'string') if(data.includes('callbackId')) 
                                data = JSON.parse(data);
                            if(data instanceof Object) if(data.callbackId === callbackId) {
                                connection.removeEventListener('message',onmessage);
                                res(data.args);
                            }
                        }
                        //console.log('sending',req,'to',connection);
                        connection.addEventListener('message',onmessage);
                        connection.send(JSON.stringify(req));
                    });
                }
            }
        

            //pass any connection props and replace them with signaling objects e.g. to set event listeners on messages for this user for these sockets, sse's, rtcs, etc.
            this._initConnections(user);
                
            if(!(user instanceof GraphNode)) this.users[user._id] = new GraphNode(user, undefined, this.service);
            
            //we need to make sure that all of the connections needing IDs have IDs, meaning they've traded with the other ends
            //then we can call addUser on the other end and the ids will get associated 
            if(this.users[user._id].sockets || this.users[user._id].eventsources || this.users[user._id].webrtc) {
                let needsId:any[] = [];
                for(const prop in this.users[user._id].sockets) {
                    if(!this.users[user._id].sockets[prop]._id) {
                        needsId.push(this.users[user._id].sockets[prop]);
                    }
                }
                for(const prop in this.users[user._id].eventsources) {
                    if(!this.users[user._id].eventsources[prop]._id && this.users[user._id].eventsources[prop].source) {
                        needsId.push(this.users[user._id].eventsources[prop]);
                    }
                }
                for(const prop in this.users[user._id].webrtc) {
                    if(!this.users[user._id].webrtc[prop]._id) {
                        needsId.push(this.users[user._id].webrtc[prop]);
                    }
                }
                if(needsId.length > 0) {
                    return await new Promise((res,rej) => {

                        let start = performance.now();
                        let checker = () => {
                            let filtered = needsId.filter((n) => {
                                if(!n._id) return true; //id not returned from server yet
                            });

                            if(filtered.length > 0) {
                                if(performance.now() - start > timeout) {
                                    rej(filtered);
                                    return this.users[user._id];
                                } else {
                                    setTimeout(()=>{
                                        checker();
                                    },100); //check every 100ms
                                }
                            } else {
                                res(this.users[user._id]);
                                return this.users[user._id];
                            }
                        }

                        checker();

                    }).catch((er) => {console.error('Connections timed out:', er); });
                }
            }
        }
        return await this.users[user._id];
    }

    //need to close all user connections
    removeUser = (user:UserProps & GraphNode|string) => {
        if(typeof user === 'string') user = this.users[user];

        if(!user) return false;
        if(user.sockets) {
            for(const address in user.sockets) {
                if(user.sockets[address].socket) {
                    this.run('wss/terminate',address);
                }
            }
        }
        if(user.wss) {
            for(const address in user.wss) {
                if(user.wss[address].wss) {
                    this.run('wss/terminate',address);
                }
            }
        }
        if(user.eventsources) {
            for(const path in user.eventsources) {
                if(user.eventsources[path].source || user.eventsources[path].sessions) {
                    this.run('sse/terminate',path);
                }
            }
        }
        if(user.servers) {
            for(const address in user.servers) {
                if(user.servers[address].server) {
                    this.run('http/terminate',address);
                }
            }
        }
        if(user.webrtc) {
            for(const id in user.webrtc) {
                if(user.webrtc[id].rtc) {
                    this.run('webrtc/terminate',id);
                }
            }
        }
        if(user.sessions) {
            //these clean themselves up since they're internal
        }

        delete this.users[user._id as any];
        return true;
    }

    updateUser = (user:UserProps & GraphNode|string, options:UserProps) => {
        if(typeof user === 'string') user = this.users[user];
        if(!user) return false;
            this._initConnections(options); //init any new connections provided if need be

            if(options._id !== user._id) {
                delete this.users[user._id as string];
                user._id = options._id;
                this.users[user._id as string] = user; //change the _id the user is registered under. Do this before joining sessions and stuff unless you really want to error check all that too (you don't)
            }   

            this.recursivelyAssign(this.users[user._id as string],options);
        
        return user;
    }



    setUser = (user:string|UserProps & GraphNode, props:{[key:string]:any}|string) => {
        if(user) if(Object.getPrototypeOf(user) === String.prototype) {
            user = this.users[user as string];
            if(!user) return false;
        }
        if(props) if(Object.getPrototypeOf(props) === String.prototype) {
            props = JSON.parse(props as string);
        }

        this.recursivelyAssign(user,props);

        //console.log(user,props)
        return true;
    }
            
    getConnectionInfo = (user:UserProps|UserProps & GraphNode) => {
        let connectionInfo:any = {
            _id:user._id
        };
        if(user.sockets) {
            connectionInfo.sockets = {};
            for(const prop in user.sockets) {
                if(user.sockets[prop]._id) connectionInfo.sockets[prop] = { 
                    _id:user.sockets[prop]._id, 
                    host:user.sockets[prop].host, 
                    port:user.sockets[prop].port, 
                    path:user.sockets[prop].path, 
                    address:user.sockets[prop].address 
                }
            }
        }
        if(user.eventsources) {
            connectionInfo.eventsources = {};
            for(const prop in user.eventsources) {
                if(user.eventsources[prop]._id)
                    connectionInfo.eventsources[prop] = {
                        _id:user.eventsources[prop]._id,
                        url:user.eventsources[prop].url
                    }
            }
        }
        if(user.webrtc) {
            connectionInfo.webrtc = {};
            for(const prop in user.webrtc) {
                if(user.webrtc[prop]._id)
                    connectionInfo.webrtc[prop] = {
                        _id:user.webrtc[prop]._id,
                        icecandidate:user.webrtc[prop].icecandidate
                    }
            }
        }
        if(user.servers) {
            connectionInfo.servers = {};
            for(const prop in user.servers) {
                if(user.servers[prop].server)
                    connectionInfo.servers[prop] = {
                        host:user.servers[prop].host,
                        port:user.servers[prop].port,
                        protocol:user.servers[prop].protocol,
                        address:user.servers[prop].address
                    }
            }
        }
        if(user.wss) {
            connectionInfo.wss = {};
            for(const prop in user.wss) {
                if(user.wss[prop]._id)
                    connectionInfo.wss[prop] = {
                        host:user.wss[prop].host,
                        port:user.wss[prop].port,
                        path:user.wss[prop].path,
                        address:user.wss[prop].address,
                    }
            }
        }
        if(user.sessions) {
            connectionInfo.sessions = {};
            for(const prop in user.sessions) {
                if(user.sessions[prop]._id)
                    connectionInfo.sessions[prop] = {
                        _id:user.sessions[prop]._id,
                        type:user.sessions[prop].type,
                        users:user.sessions[prop].users
                    };
            }
        }
        return connectionInfo;
    }

    getSessionInfo = (
        sessionId?:string, //id or name (on shared sessions)
        userId?:string|UserProps & GraphNode
    ) => {
        if(userId instanceof Object) userId = (userId as any)._id;
        if(!sessionId) {
            return this.sessions.shared;
        }
        else {
            if(this.sessions.private[sessionId]) {
                let s = this.sessions.private[sessionId];
                if(s.settings)
                    if(s.settings.source === userId || s.settings.listener === userId || s.settings.ownerId === userId || s.settings.admins?.[userId as string] || s.settings.moderators?.[userId as string])
                        return {private:{[sessionId]:s}};
            } else if(this.sessions.shared[sessionId]) {
                return {shared:{[sessionId]:this.sessions.shared[sessionId]}};
            } else {
                let res = {};
                for(const id in this.sessions.shared) {
                    if(this.sessions.shared[id].settings?.name) //get by name
                        res[id] = this.sessions.shared.settings;
                }
                if(Object.keys(res).length > 0) return res;
            }
        }
    }

    openPrivateSession = (
        options:PrivateSessionProps={}, 
        userId?:string|UserProps|UserProps & GraphNode
    ) => {
        if(typeof userId === 'object') userId = userId._id;
        if(!options._id) {
            options._id = `private${Math.floor(Math.random()*1000000000000000)}`;       
            if(this.sessions.private[options._id]) {
                delete options._id;
                this.openPrivateSession(options,userId); //regen id
            }
        }   
        if(options._id) {
            if(userId){
                if(!options.settings) options.settings = { listener:userId, source:userId, propnames:{latency:true}, admins:{[userId]:true}, ownerId:userId };
                if(!options.settings.listener) options.settings.listener = userId;
                if(!options.settings.source) options.settings.source = userId;
                if(!this.users[userId].sessions) this.users[userId].sessions = {};
                this.users[userId].sessions[options._id] = options;
            }
            if(!options.data) options.data = {};
            if(this.sessions.private[options._id]) {
                return this.updateSession(options,userId);
            }
            else if(options.settings?.listener && options.settings.source) 
                this.sessions.private[options._id] = options; //need the bare min in here
        }
        return options;
    }

    openSharedSession = (
        options:SharedSessionProps, 
        userId:string|UserProps|UserProps & GraphNode
    ) => {
        if(typeof userId === 'object') userId = userId._id as string;
        if(!options._id) {
            options._id = `shared${Math.floor(Math.random()*1000000000000000)}`;
            if(this.sessions.shared[options._id]) {
                delete options._id;
                this.openSharedSession(options,userId); //regen id
            }
        } 
        if(options._id){  
            if(typeof userId === 'string') {
                if(!options.settings) options.settings = { name:'shared', propnames:{latency:true}, users:{[userId]:true}, admins:{[userId]:true}, ownerId:userId };
                
                if(!options.settings.users) options.settings.users = {[userId]:true};
                if(!options.settings.admins) options.settings.admins = {[userId]:true};
                if(!options.settings.ownerId) options.settings.ownerId = userId;
                if(!this.users[userId].sessions) this.users[userId].sessions = {};
                this.users[userId].sessions[options._id] = options;
            } else if (!options.settings) options.settings = {name:'shared', propnames:{latency:true}, users:{}};
            if(!options.data) options.data = { private:{}, shared:{} };
            if(!options.settings.name) options.name = options.id;
            if(this.sessions.shared[options._id]) {
                return this.updateSession(options,userId);
            }
            else this.sessions.shared[options._id] = options;
        }
        return options;
    }

    //update session properties, also invoke basic permissions checks for who is updating
    updateSession = (
        options:PrivateSessionProps | SharedSessionProps, 
        userId?:string|UserProps|UserProps & GraphNode
    ) => {
        if(typeof userId === 'object') userId = userId._id;
        //add permissions checks based on which user ID is submitting the update
        let session:any;
        if(options._id && typeof userId === 'string'){ 
            session = this.sessions.private[options._id];
            if(!session) session = this.sessions.shared[options._id];
            if(this.sesh.private[options._id]) {
                let sesh = this.sessions.shared[options._id];
                if(sesh.settings && (sesh?.settings.source === userId || sesh.settings.admins?.[userId] || sesh.settings.moderators?.[userId] || sesh.settings.ownerId === userId)) {
                    return Object.assign(this.session.shared[options._id],options);
                }
            } else if(options.settings?.source) {
                return this.openPrivateSession(options as PrivateSessionProps,userId);
            } else return this.openSharedSession(options as SharedSessionProps,userId);
        }
        return false;
    }

    //add a user id to a session, supply options e.g. to make them a moderator or update properties to be streamed dynamically
    joinSession = (   
        sessionId:string, 
        userId:string|UserProps|UserProps & GraphNode, 
        options?:SharedSessionProps|PrivateSessionProps
    ) => {
        if(typeof userId === 'object') userId = userId._id as string;
        if(!userId) return false;
        let sesh = this.sessions.shared[sessionId];
        //console.log(sessionId,userId,sesh,this.sessions);
        if(sesh?.settings) {
            if(sesh.settings?.banned) {
                if(sesh.settings.banned[userId]) return false;
            }
            if(sesh.settings?.password) {
                if(!options?.settings?.password) return false;
                if(options.settings.password !== sesh.settings.password) return false
            }
            (sesh.settings.users as any)[userId] = true;
            if(!this.users[userId].sessions) this.users[userId].sessions = {};
            this.users[userId].sessions[sessionId] = sesh;
            if(options) { return this.updateSession(options,userId); };
            //console.log(sesh)
            return sesh;
        } else if (options?.source || options?.listener) return this.openPrivateSession(options as PrivateSessionProps,userId);
        else if (options) return this.openSharedSession(options as SharedSessionProps,userId);
        return false;
    }

    leaveSession = (
        sessionId:string, 
        userId:string|UserProps|UserProps & GraphNode, 
        clear:boolean=true //clear all data related to this user incl permissions
    ) => {
        if(typeof userId === 'object') userId = userId._id as string;
        let session:any = this.sessions.private[sessionId];
        if(!session) session = this.sessions.shared[sessionId];
        if(session) {
            if(this.sessions.private[sessionId]) {
                if(userId === session.settings.source || userId === session.settings.listener || session.settings.admins?.[userId] || session.settings.moderators?.[userId]) {
                    delete this.sessions.private[sessionId];
                    delete this.users[userId].sessions[sessionId];
                    if(clear) {
                        if(session.settings.admins?.[userId])     delete (this.sessions.shared[sessionId].settings?.admins as any)[userId];
                        if(session.settings.moderators?.[userId]) delete (this.sessions.shared[sessionId].settings?.moderators as any)[userId];
                    }
                } 
            } else if (this.sessions.shared[sessionId]) {
                delete this.sessions.shared.settings.users[userId];
                delete this.users[userId].sessions[sessionId];
                if(clear) {
                    if(session.settings.admins?.[userId])     delete (this.sessions.shared[sessionId].settings?.admins as any)[userId];
                    if(session.settings.moderators?.[userId]) delete (this.sessions.shared[sessionId].settings?.moderators as any)[userId];
                    if(session.data.shared[userId]) delete this.sessions.shared[sessionId].data?.shared[userId];
                    if(session.settings.host === userId) {
                        delete session.settings.host;
                        delete session.data.shared;
                        session.data.shared = {};
                        this.swapHost(session);
                    }
                }
            }
            return true;
        }
        return false;
    }

    getFirstMatch(obj1:{[key:string]:any},obj2:{[key:string]:any}) {
        for(const i in obj1) {
            for(const j in obj2) {
                if(i === j) return i;
            }
        }
        return false;
    }

    swapHost = (
        session:PrivateSessionProps|SharedSessionProps|string, 
        newHostId?:string
    ) => {
        if(typeof session === 'string') {
            if(this.sessions.private[session]) session = this.sessions.private[session];
            else if(this.sessions.shared[session]) session = this.sessions.shared[session];
        }
        if(typeof session === 'object' && session.settings) {
            delete session.settings.host;
            if(newHostId) {
                if(session.settings.users[newHostId]) session.settings.host = newHostId;
            }
            if(session.settings.ownerId && !session.settings.host) {
                if(session.settings.users[session.settings.ownerId]) session.settings.host = session.settings.ownerId;
            }
            if(session.settings.admins && !session.settings.host) {
                let match = this.getFirstMatch(session.settings.users,session.settings.admins);
                if(match) session.settings.host = match;
            }//sendAll leadership when host swapping
            if(session.settings.moderators && !session.settings.host) {
                let match = this.getFirstMatch(session.settings.users,session.settings.moderators);
                if(match) session.settings.host = match;
            }//sendAll leadership when host swapping
            if(!session.settings.host) session.settings.host = Object.keys(session.settings.users)[0]; //replace host 
            return true;
        }
        return false;
    }

    deleteSession = (sessionId:string, userId:string|UserProps) => {
        if(typeof userId === 'object') userId = userId._id as string;
        let session:any = this.sessions.private[sessionId];
        if(!session) session = this.sessions.shared[sessionId];
        if(session) {
            if(session.source === userId || session.listener === userId || session.admins?.[userId] || session.ownerId === userId) {
                for(const user in session.settings.users) {
                    delete this.users.sessions[sessionId];
                }
                if(this.sessions.private[sessionId]) delete this.sessions.private[sessionId]
                else if(this.sessions.shared[sessionId]) delete this.sessions.private[sessionId]
            }
        }
        return true;
    }

    subscribeToSession = (
        session:SharedSessionProps|PrivateSessionProps|string, 
        userId:string|UserProps|UserProps & GraphNode, 
        onmessage?:(session:SharedSessionProps|PrivateSessionProps, userId:string)=>void, 
        onopen?:(session:SharedSessionProps|PrivateSessionProps, userId:string)=>void,
        onclose?:(session:SharedSessionProps|PrivateSessionProps, userId:string)=>void
    ) => {
        if(userId instanceof Object) userId = (userId as UserProps)._id as string;
        if(typeof session === 'string') {
            let s = this.sessions.private[session];
            if(!s) s = this.sessions.shared[session] as any;
            if(!s) return undefined;
            session = s;
        } 

        if(typeof session.onopen === 'function') {
            let sub = this.subscribe('joinSession',(res) => {
                if(res._id === (session as any)._id) (session as any).onopen(session, userId);
                this.unsubscribe('joinSession', sub as number);
            })
        }

        if(session instanceof Object) { //we need to fire onmessage events when the session updates (setState for sessionId) and when the user updates

            if(onmessage) session.onmessage = onmessage;
            if(onopen) session.onclose = onopen;
            if(onclose) session.onclose = onclose;

           
            // if(typeof session.onmessage === 'function') 
            //     this.subscribe(session._id,(session)=>{ session.onmessage(session,userId); });
            
            // this.setState({[session._id]:session});
        }
        return session;
    }

    //iterate all subscriptions
    sessionLoop = (sendAll=true) => {
        let updates:any = {
            private:{},
            shared:{}
        };

        for(const session in this.sessions.private) {
            const sesh = this.sessions.private[session];
            const updateObj = {
                _id:sesh._id,
                settings:{
                    listener:sesh.listener,
                    source:sesh.source
                },
                data:{}
            } as any; //pull user's updated props and send to listener
            if(!this.users[sesh.source]) {
                delete this.sessions.private[session]
                break;
            }
            if(sesh.settings && sesh.data) {
                for(const prop in sesh.settings.propnames) {
                    if( this.users[sesh.source][prop]) {
                        if(this.sessions.private[session].data) { 
                            if(sesh.data[prop] instanceof Object) {
                                if(this.users[sesh.source][prop] && (stringifyFast(sesh.data[prop]) !== stringifyFast(this.users[sesh.source][prop]) || !(prop in sesh.data))) 
                                    updateObj.data[prop] = this.users[sesh.source][prop];
                            }
                            else if(this.users[sesh.source][prop] && (sesh.data[prop] !== this.users[sesh.source][prop] || !(prop in sesh.data))) 
                                updateObj.data[prop] = this.users[sesh.source][prop];
                        }
                        else updateObj.data[prop] = this.users[sesh.source][prop];
                    } else if(this.sessions.private[session]?.data?.[prop]) delete (this.sessions.private[session].data as any)[prop];
                }
            }
            if(Object.keys(updateObj.data).length > 0) {
                this.recursivelyAssign(this.sessions.private[session].data, updateObj.data); //set latest data on the source object as reference
                updates.private[sesh._id as string] = updateObj;
            }
        }

        for(const session in this.sessions.shared) {
            const sesh = this.sessions.shared[session];
            const updateObj = {
                _id:sesh._id,
                settings:{
                    name:sesh.name
                },
                data:{}
            } as any;
            if(sesh.settings?.host) {
                //host receives object of all other users
                const privateData = {}; //host receives all users' props
                const sharedData = {}; //users receive host props       
                for(const user in sesh.settings.users) {
                    if(!this.users[user]) {
                        delete sesh.settings.users[user]; //dont need to delete admins, mods, etc as they might want to come back <_<
                        if( sesh.data?.shared[user]) delete sesh.data.shared[user];
                        if( sesh.data?.private?.[user]) delete sesh.data.shared[user];
                        if(sesh.settings.host === user) this.swapHost(sesh);
                        updateObj.settings.users = sesh.settings.users;
                        updateObj.settings.host = sesh.settings.host;
                        continue;
                    }
                    if(user !== sesh.settings.host) {
                        privateData[user] = {};
                        for(const prop in sesh.settings.propnames) {
                            if(this.users[user][prop]) {
                                if(sesh.data?.private && !(user in sesh.data.private)) {
                                    if(this.users[user][prop] instanceof Object) privateData[user][prop] = this.recursivelyAssign({},this.users[user][prop]);
                                    else privateData[user][prop] = this.users[user][prop];
                                } else if(privateData[user][prop] instanceof Object && sesh.data) {
                                    if(this.users[user][prop] && (stringifyFast(sesh.data?.shared[user][prop]) !== stringifyFast(this.users[user][prop]) || !(prop in sesh.data))) 
                                        privateData[user][prop] =  this.users[user][prop];
                                }
                                else if(this.users[user][prop] && sesh.data?.private?.[prop] !== this.users[user][prop]) 
                                    privateData[user][prop] = this.users[user][prop];
                            } else if (sesh.data?.private?.[user]?.[prop]) delete sesh.data.private[user][prop]; //if user deleted the prop, session can delete it
                        }
                        if(Object.keys(privateData[user]).length === 0) delete privateData[user];
                    } else {
                        sharedData[user] = {};
                        for(const prop in sesh.settings.hostprops) {
                            if(this.users[user][prop]) {
                                if(sesh.data && !(user in sesh.data.shared)) {
                                    if(this.users[user][prop] instanceof Object) sharedData[user][prop] = this.recursivelyAssign({},this.users[user][prop]);
                                    else sharedData[user][prop] = this.users[user][prop];
                                } else if(sharedData[user][prop] instanceof Object && sesh.data) {
                                    if(this.users[user][prop] && (stringifyFast(sesh.data?.shared[user][prop]) !== stringifyFast(this.users[user][prop]) || !(prop in sesh.data.shared[user]))) 
                                        sharedData[user][prop] = this.users[user][prop];
                                }
                                else if(this.users[user][prop] && sesh.data?.shared[user][prop] !== this.users[user][prop]) 
                                    sharedData[user][prop] = this.users[user][prop];
                            } else if (sesh.data?.shared[user]?.[prop]) delete sesh.data.shared[user][prop]; //if user deleted the prop, session can delete it
                        }
                    }
                }
                if(Object.keys(privateData).length > 0) {
                    updateObj.data.private = privateData;
                }
                if(Object.keys(sharedData).length > 0) {
                    updateObj.data.shared = sharedData;
                }
            } else { //all users receive the same update when no host set
                const sharedData = {}; //users receive all other user's props
                if(sesh.settings?.users) {
                    for(const user in sesh.settings.users) {
                        if(!this.users[user]) {
                            delete sesh.settings.users[user]; //dont need to delete admins, mods, etc as they might want to come back <_<
                            if( sesh.data?.shared[user]) delete sesh.data.shared[user];
                            if( sesh.data?.private?.[user]) delete sesh.data.shared[user];
                            if(sesh.settings.host === user) this.swapHost(sesh);
                            updateObj.settings.users = sesh.settings.users;
                            updateObj.settings.host = sesh.settings.host;
                            continue;
                        }
                        sharedData[user] = {};
                        for(const prop in sesh.settings.propnames) {
                            if(this.users[user][prop]) {
                                if(sesh.data && !(user in sesh.data.shared)) {
                                    if(this.users[user][prop] instanceof Object) sharedData[user][prop] = this.recursivelyAssign({},this.users[user][prop]);
                                    else sharedData[user][prop] = this.users[user][prop];
                                } else if(sesh.data?.shared[user][prop] instanceof Object) {
                                    if((stringifyFast(sesh.data.shared[user][prop]) !== stringifyFast(this.users[user][prop]) || !(prop in sesh.data.shared[user]))) { 
                                        //if(stringifyFast(this.users[user][prop]).includes('peer')) console.log(stringifyFast(this.users[user][prop]))
                                        sharedData[user][prop] = this.users[user][prop]; 
                                    }
                                }
                                else if(sesh.data?.shared[user][prop] !== this.users[user][prop]) 
                                    sharedData[user][prop] = this.users[user][prop];
                            } else if (sesh.data?.shared[user]?.[prop]) delete sesh.data.shared[user][prop]; //if user deleted the prop, session can delete it 
                        }
                        if(Object.keys(sharedData[user]).length === 0) delete sharedData[user];
                    }
                    if(Object.keys(sharedData).length > 0) {
                        //console.log(sharedData);
                        updateObj.data.shared = sharedData;
                    } 
            } 
            }

            if(updateObj.data.shared || updateObj.data.private) 
                updates.shared[sesh._id as string] = updateObj;

            if(updateObj.data.shared) {
                this.recursivelyAssign(this.sessions.shared[session].data?.shared,updateObj.data.shared)
               //set latest data on the source object as reference
            }
            if(updateObj.data.private) {
                this.recursivelyAssign(this.sessions.shared[session].data?.private,updateObj.data.private)
                //set latest data on the source object as reference
            }
           
        }

        if(Object.keys(updates.private).length === 0) delete updates.private;
        if(Object.keys(updates.shared).length === 0) delete updates.shared;
        if(Object.keys(updates).length === 0) return undefined;

        if(sendAll) this.transmitSessionUpdates(updates);

        return updates; //this will setState on the node which should trigger message passing on servers when it's wired up
        // setTimeout(()=>{
        //     if(this.RUNNING) this.sessionLoop(Date.now());
        // }, this.DELAY)
        
    }

    //transmit updates to users
    transmitSessionUpdates = (updates:{private:{[key:string]:any},shared:{[key:string]:any}}) => {
        let users = {};
        if(updates.private) {
            for(const s in updates.private) {
                let session = this.sessions.private[s];
                if(session?.settings) {
                    let u = session.settings.listener;
                    if(!users[u]) users[u] = {private:{}};
                    if(!users[u].private) users[u].private = {};
                    users[u].private[s] = updates.private[s];
                }
            }
        }
        if(updates.shared) {
            for(const s in updates.shared) {
                let session = this.sessions.shared[s];
                if(session?.settings) {
                    let copy;
                    if(session.settings.host) {
                        copy = Object.assign({},updates.shared[s]);
                        delete copy.data.private; 
                    }
                    for(const u in session.settings.users) {
                        if(!users[u]) users[u] = {shared:{}};
                        if(!users[u].shared) users[u].shared = {};
                        if(session.settings.host) {
                            if(u !== session.settings.host) {
                                users[u].shared[s] = copy;
                            } else users[u].shared[s] = updates.shared[s];
                        } 
                        else users[u].shared[s] = updates.shared[s];
                    }
                }
            }
        }
 
        //console.log(users)

        let message = {route:'receiveSessionUpdates', args:null as any, origin:null as any}
        for(const u in users) {
            message.args = users[u];
            message.origin = u;
            if(this.users[u].send) this.users[u].send(JSON.stringify(message));
        }

        return users;
    }

    //receive updates as users
    receiveSessionUpdates = (self=this, origin:any, update:{private:{[key:string]:any},shared:{[key:string]:any}}|string) => { //following operator format we get the origin passed
        if(update) if(Object.getPrototypeOf(update) === String.prototype) update = JSON.parse(update as string);
        if(update instanceof Object) {
            if(typeof origin === 'object') origin = origin._id;
            let user = this.users[origin];
            if(!user) return undefined;
            if(!user.sessions) user.sessions = {};

            if(update.private) {
                for(const key in update.private) {
                    if(!user.sessions[key]) continue;
                    this.recursivelyAssign(user.sessions[key].data,update.private[key].data);
                    if(user.sessions[key].onmessage)
                        user.sessions[key].onmessage(user.sessions[key],user._id)
                }
            }
            if(update.shared) {
                for(const key in update.shared) {
                    if(!user.sessions[key]) continue;
                    if(update.shared[key].settings.users) user.sessions[key].settings.users = update.shared[key].settings.users;
                    if(update.shared[key].settings.host) user.sessions[key].settings.host = update.shared[key].settings.host;
                    if(update.shared[key].data.private) this.recursivelyAssign(user.sessions[key].data.private, update.shared[key].data.private);
                    if(update.shared[key].data.shared)  this.recursivelyAssign(user.sessions[key].data.shared, update.shared[key].data.shared);
                    if(user.sessions[key].onmessage)
                        user.sessions[key].onmessage(user.sessions[key],user._id)
                }
            }
            return user;
        }
    }

    //you either need to run this loop on a session to 
    // pass updates up to the server from your user manually
    userUpdateLoop = (user:UserProps & GraphNode) => {
        if(user.sessions) {
            const updateObj = {};
            for(const key in user.sessions) {
                let s = user.sessions[key];
                if(s.settings.users[user._id as string] || s.settings.source === user._id) {
                    if(!s.settings.spectators?.[user._id as string]) {
                        if(s.settings.host === user._id) {
                            for(const prop in s.settings.hostprops) {
                                if(!updateObj[prop] && user[prop] && user[prop] !== undefined) {
                                    if(s.data.shared?.[user._id as string]?.[prop]) {
                                        if(user[prop] instanceof Object) {
                                            if(stringifyFast(s.data.shared[user._id as string][prop]) !== stringifyFast(user[prop]))
                                                updateObj[prop] = user[prop];
                                        }
                                        else if (s.data.shared[user._id as string][prop] !== user[prop]) updateObj[prop] = user[prop];   
                                    } else updateObj[prop] = user[prop]
                                }
                            }   
                        } else {
                            for(const prop in s.settings.propnames) {
                                if(!updateObj[prop] && user[prop] !== undefined) {
                                    if(s.settings.source) {
                                        if(user[prop] instanceof Object && s.data[prop] !== undefined) {
                                            if(stringifyFast(s.data[prop]) !== stringifyFast(user[prop]))
                                                updateObj[prop] = user[prop];
                                        }
                                        else if (s.data[prop] !== user[prop]) updateObj[prop] = user[prop];  
                                    }
                                    else {
                                        if(s.data.shared?.[user._id as string]?.[prop]) { //host only sessions have a little less efficiency in this setup
                                            if(user[prop] instanceof Object) {
                                                let split  = stringifyFast(user[prop]).split('');
                                                if(stringifyFast(s.data.shared[user._id as string][prop]) !== stringifyFast(user[prop]))
                                                    updateObj[prop] = user[prop];
                                            }
                                            else if (s.data.shared[user._id as string][prop] !== user[prop]) updateObj[prop] = user[prop];
                                        }  else updateObj[prop] = user[prop]
                                    }
                                }
                            }
                        }
                    }
                    
                }
            }

            //console.log(updateObj)

            if(Object.keys(updateObj).length > 0) {
                if(user.send) user.send({ route:'setUser', args:updateObj, origin:user._id });
                return updateObj;
            } 
        }
        return undefined; //state won't trigger if returning undefined on the loop
    }

    routes:Routes = {
        runAs:this.runAs,
        pipeAs:this.pipeAs,
        addUser:this.addUser,
        setUser:(self,origin,update)=>{
            return this.setUser(origin,update);
        },
        removeUser:this.removeUser,
        updateUser:this.updateUser,
        getConnectionInfo:this.getConnectionInfo,
        getSessionInfo:this.getSessionInfo,
        openPrivateSession:this.openPrivateSession,
        openSharedSession:this.openSharedSession,
        joinSession:this.joinSession,
        leaveSession:this.leaveSession,
        subscribeToSession:this.subscribeToSession,
        transmitSessionUpdates:this.transmitSessionUpdates,
        receiveSessionUpdates:this.receiveSessionUpdates,
        swapHost:this.swapHost,
        userUpdateLoop:{ //this node loop will run separately from the one below it
            operator:this.userUpdateLoop, 
            loop:10//this will set state each iteration so we can trigger subscriptions on session updates :O
        },
        sessionLoop:{
            operator:this.sessionLoop, 
            loop:10//this will set state each iteration so we can trigger subscriptions on session updates :O
        }
    }
    //todo: add listeners to each connection type to register user connections, add routes for utils like adding mods or banning etc.
}