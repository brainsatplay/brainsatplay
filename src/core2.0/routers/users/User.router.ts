import { Graph, GraphProperties } from "../../Graph";
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
    sendOn?:Protocol|string|{[key:string]:{[key:string]:any}}, //e.g. user.sendOn.wss['ws://localhost:8080/wss'] should return the connection info object (info in that service)
    onmessage?:(message:any)=>void,  //when a message comes in from an endpoint assigned to this user
    onclose?:(connection:any)=>void,               //when a connection belonging to this user closes
    send?:(message:any, channel?:string)=>any,        //send function to determine how to communicate to this user's endpoint(s) from this router instance
    latency?:number,                 //should calculate other metrics like latency
    [key:string]:any //other user properties e.g. personally identifying information
} & GraphProperties

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
        users:{[key:string]:boolean},
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
        [key:string]:Graph
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
    }

    //just an alias for service._run with clear usage for user Id as origin, you'll need to wire up how responses are handled at the destination based on user id
    runAs = (
        node:string|Graph, 
        userId:string, 
        ...args:any[]
    ) => {
        return this._run(node,userId,...args);
    }

    pipeAs = ( //just an alias of service.pipe with clear usage for user Id as origin, you'll need to wire up how responses are handled at the destination based on user id
        source:string | Graph, 
        destination:string, 
        transmitter:Protocol|string, 
        userId:string,
        method:string, 
        callback:(res:any)=>any|void
    ) => {
        return this.pipe(source, destination, transmitter, userId, method, callback);
    }

    _initConnections = (connections:any) => {
        //pass any connection props and replace them with signaling objects e.g. to set event listeners on messages for this user for these sockets, sse's, rtcs, etc.
        if(connections.sockets && this.services.wss) {
            for(const address in connections.sockets) {
                if(connections.sockets[address]._id) {
                    if(this.services.wss.servers) {
                        for(const addr in this.services.wss.servers) { //check server clients to corroborate frontend/backend connections
                            for(const id in this.services.wss.servers[addr].clients) {
                                if(id === connections.sockets[address]._id) {
                                    connections.sockets[address] = { socket:this.services.wss.servers[addr].clients[id], id, address };
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
                            connections.sse[path] = this.services.sse.eventsources[path];
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
            for(const id in connections.webrtc) {
                if(connections.webrtc[id].rtc) {
                    let channel = connections.webrtc[id].channels.data
                    if(!channel) channel = connections.webrtc[id].channels[Object.keys(connections.webrtc[id].channels)[0]];
                    if(channel) channel.addEventListener('message', connections.onmessage);
                }
            }
        }
        if(connections.sessions) {
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
    addUser = async (user:UserProps, timeout=5000) => { 
        if(!user?._id) user._id = `user${Math.floor(Math.random()*1000000000000000)}`;
        user.tag = user._id;
        
        if(!user.onmessage) {
            user.onmessage = (message) => {
                this.setState({[user.tag]:message})
            }
        }

        user.operator = user.onmessage; //user.run(...message);

        if(!user.send) { //default send will select first available (fastest) protocol representing the target endpoint, which can be specified with user.sendOn
            user.send = (message:ServiceMessage|any, channel?:string) => {
                if(message instanceof Object) message = JSON.stringify(message);
                //use the fastest available endpoint for the user, swap when no longer available to next possible endpoint
                if(user.sendOn instanceof Object) { //can transmit on multiple endpoints in an object
                    for(const protocol in user.sendOn) {
                        for(const info in user.sendOn[protocol]) {
                            let obj = user.sendOn[protocol][info];
                            if(obj.socket) { //frontend or backend socket
                                if(obj.socket.readyState === 1) {
                                    obj.socket.send(message);
                                } else delete user.sendOn[protocol][info]; //not preferable if it's closed
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
                                else delete user.sendOn[protocol][info];
                            } else if(obj.rtc) { //webrtc peer connection
                                if(channel && obj.channels[channel])
                                    obj.channels[channel].send(message);
                                else if(obj.channels.data) //default data channel
                                    obj.channels.data.send(message);
                                else {
                                    let firstchannel = Object.keys(obj.channels)[0]; 
                                    obj.channels[firstchannel].send(message);
                                }
                            } else if(obj.server) { //http server (??)
                                if(this.services.http)
                                    this.services.http.transmit(message,channel); //??
                            }
                        } //need to despaghettify this 
                    }
                }
                else {
                    let connections:any;
                    if(Object.getPrototypeOf(user.sendOn) === String.prototype) 
                        {connections = this.user[user.sendOn]; user.sendOn = {}; }
                    if(connections) {
                        //go through each possible protocol and set an object on user.sendOn for the first open & fastest endpoint
                    } else {
                        user.sendOn = {};
                        if(this.user.webrtc) {
                            user.sendOn.webrtc = this.user.webrtc[Object.keys(this.user.webrtc)[0]];
                        } else if (this.user.eventsources) {
                            user.sendOn.eventsources = this.user.eventsources[Object.keys(this.user.eventsources)[0]];
                        } else if (this.user.sockets) {
                            user.sendOn.sockets = this.user.sockets[Object.keys(this.user.sockets)[0]];
                        } else if (this.user.wss) {
                            user.sendOn.wss = this.user.wss[Object.keys(this.user.wss)[0]];
                        } else if (this.user.servers) {
                            user.sendOn.servers = this.user.servers[Object.keys(this.user.servers)[0]];
                        }
                    }
                }
            }
        }    

        if(!user.request) {
            user.request = (message:ServiceMessage|any, connection:any, origin?:string, method?:string) => { //return a promise which can resolve with a server route result through the socket
                if(!connection) {
                    for(const prop in this.user.webrtc) {
                        if(this.user.webrtc[prop].channels.data) {
                            connection = this.user.webrtc[prop].channelsdata;
                            break;
                        } else if (Object.keys(this.user.webrtc[prop].channels).length > 0) {
                            connection = this.user.webrtc[prop].channels[Object.keys(this.user.webrtc[prop].channels)[0]]
                            break;
                        }
                    }
                    if(!connection) for(const prop in this.user.sockets) {
                        if(this.user.sockets[prop].socket) {
                            this.user.sockets[prop].socket;
                            break;
                        }
                    }
                }
                let callbackId = Math.random();
                let req:any = {route:'runRequest', args:message, callbackId};
                if(method) req.method = method;
                if(origin) req.origin = origin;
                return new Promise((res,rej) => {
                    let onmessage = (data:any) => {
                        if(data.includes('{') || data.includes('[')) data = JSON.parse(data);
                        if(data.callbackId === callbackId) {
                            connection.removeEventListener('message',onmessage);
                            res(data.args);
                        }
                    }

                    connection.addEventListener('message',onmessage);
                    connection.send(JSON.stringify(req));
                })
            }
        }
        

        //pass any connection props and replace them with signaling objects e.g. to set event listeners on messages for this user for these sockets, sse's, rtcs, etc.
        this._initConnections(user);
            
        if(!(user instanceof Graph)) this.users[user._id] = new Graph(user, undefined, this.service);

        //we need to make sure that all of the connections needing IDs have IDs, meaning they've traded with the other ends
        //then we can call addUser on the other end and the ids will get associated 
        if(this.user.sockets || this.user.eventsources || this.user.webrtc) {
            let needsId = [];
            for(const prop in this.user.sockets) {
                if(!this.user.sockets[prop]._id) {
                    needsId.push(this.user.sockets[prop]);
                }
            }
            for(const prop in this.user.eventsources) {
                if(!this.user.eventsources[prop]._id) {
                    needsId.push(this.user.eventsources[prop]);
                }
            }
            for(const prop in this.user.webrtc) {
                if(!this.user.webrtc[prop]._id) {
                    needsId.push(this.user.webrtc[prop]);
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

                }).catch((er) => {console.error('Connections timed out:', er); });
            }
        }
        
        return await this.users[user._id];
    }

    //need to close all user connections
    removeUser = (user:UserProps & Graph) => {
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

        delete this.users[user._id];
        return true;
    }

    updateUser = (user:UserProps & Graph|string, options:UserProps) => {
        if(typeof user === 'string') user = this.users[user];
        if(!user) return false;

        this._initConnections(options); //init any new connections provided if need be

        if(options._id !== user._id) {
            delete this.users[user._id];
            user._id = options._id;
            this.users[user._id] = user; //change the _id the user is registered under. Do this before joining sessions and stuff unless you really want to error check all that too (you don't)
        }   

        Object.assign(this.users[user._id],options);

        return user;
    }

            
    getConnectionInfo = (user:UserProps) => {
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
                        address:user.sessions[prop].address,
                    }
            }
        }
        return connectionInfo;
    }



    openPrivateSession = (options:PrivateSessionProps={}, userId?:string) => {
        if(!options._id) {
            options._id = `private${Math.floor(Math.random()*1000000000000000)}`;
        }          
        if(this.sessions.private[options._id]) {
            delete options._id;
            this.openPrivateSession(options,userId); //regen id
        }
        if(userId){
            if(!options.settings) options.settings = { listener:userId, source:userId, propnames:{latency:true}, admins:{[userId]:true}, ownerId:userId };
            if(!options.settings.listener) options.settings.listener = userId;
            if(!options.settings.source) options.settings.source = userId;
            this.users[userId].sessions[options._id] = options;
        }
        if(!options.data) options.data = {};
        if(this.sessions.private[options._id]) {
            return this.updateSession(options,userId);
        }
        else if(options.settings.listener && options.settings.source) this.sessions.private[options._id] = options; //need the bare min in here

        return options;
    }

    openSharedSession = (
        options:SharedSessionProps, 
        userId:string
    ) => {
        if(!options._id) {
            options._id = `shared${Math.floor(Math.random()*1000000000000000)}`;
        }         
        if(this.sessions.shared[options._id]) {
            delete options._id;
            this.openSharedSession(options,userId); //regen id
        }
        if(userId) {
            if(!options.settings) options.settings = { name:'shared', propnames:{latency:true}, users:{[userId]:true}, admins:{[userId]:true}, ownerId:userId };
            if(!options.settings.users) options.settings.users = {[userId]:true};
            if(!options.settings.admins) options.settings.admins = {[userId]:true};
            if(!options.settings.ownerId) options.settings.ownerId = userId;
            this.users[userId].sessions[options._id] = options;
        } else if (!options.settings) options.settings = {name:'shared', propnames:{latency:true}, users:{}};
        if(!options.name) options.name = 'shared'; 
        if(!options.data) options.data = { private:{}, shared:{}};
        
        else this.sessions.shared[options._id] = options;
        
        return options;
    }

    //update session properties, also invoke basic permissions checks for who is updating
    updateSession = (
        options:PrivateSessionProps | SharedSessionProps, 
        userId?:string
    ) => {
        //add permissions checks based on which user ID is submitting the update
        let session:any;
        session = this.sessions.private[options._id];
        if(!session) session = this.sessions.shared[options._id];
        if(this.sesh.private[options._id]) {
            let sesh = this.sessions.shared[options._id];
            if(sesh?.settings.source === userId || sesh.settings.admins?.userId || sesh.settings.moderators?.userId || sesh.settings.ownerId === userId) {
                return Object.assign(this.session.shared[options._id],options);
            }
        } else if(options.settings.source) {
            return this.openPrivateSession(options as PrivateSessionProps,userId);
        } else return this.openSharedSession(options as SharedSessionProps,userId);
        return undefined;
    }

    //add a user id to a session, supply options e.g. to make them a moderator or update properties to be streamed dynamically
    joinSession = (   
        sessionId:string, 
        userId:string, 
        options?:SharedSessionProps|PrivateSessionProps
    ) => {
        let sesh = this.sessions.shared[sessionId];
        if(sesh) {
            if(sesh.settings?.banned) {
                if(sesh.settings.banned.userId) return false;
            }
            if(sesh.settings.password) {
                if(!options?.settings?.password) return false;
                if(options.settings.password !== sesh.settings.password) return false
            }
            sesh.settings.users.userId = true;
            this.users[userId].sessions[sessionId] = options;
            if(options) { return this.updateSession(options,userId); };
            return sesh;
        } else if (options?.source || options?.listener) return this.openPrivateSession(options as PrivateSessionProps,userId);
        else if (options) return this.openSharedSession(options as SharedSessionProps,userId);
        return false;
    }

    leaveSession = (sessionId:string, userId:string, clear?:boolean) => {
        let session:any = this.sessions.private[sessionId];
        if(!session) session = this.sessions.shared[sessionId];
        if(session) {
            if(this.sessions.private[sessionId]) {
                if(userId === session.settings.source || userId === session.settings.listener || session.settings.admins?.[userId] || session.settings.moderators?.[userId]) {
                    delete this.sessions.private[sessionId];
                    delete this.users[userId].sessions[sessionId];
                    if(clear) {
                        if(session.settings.admins?.[userId])     delete this.sessions.shared[sessionId].settings.admins[userId];
                        if(session.settings.moderators?.[userId]) delete this.sessions.shared[sessionId].settings.moderators[userId];
                    }
                } 
            } else if (this.sessions.shared[sessionId]) {
                delete this.sessions.shared.settings.users[userId];
                delete this.users[userId].sessions[sessionId];
                if(clear) {
                    if(session.settings.admins?.[userId])     delete this.sessions.shared[sessionId].settings.admins[userId];
                    if(session.settings.moderators?.[userId]) delete this.sessions.shared[sessionId].settings.moderators[userId];
                    if(session.data.shared[userId]) delete this.sessions.shared[sessionId].data.shared[userId];
                    if(session.settings.host === userId) {
                        delete session.settings.host;
                        delete session.data.shared;
                        session.data.shared = {};
                        this.swapHost(session);
                    }
                }
            }
        }
    }

    getFirstMatch(obj1:{[key:string]:any},obj2:{[key:string]:any}) {
        for(const i in obj1) {
            for(const j in obj2) {
                if(i === j) return i;
            }
        }
        return undefined;
    }

    swapHost = (session:PrivateSessionProps|SharedSessionProps|string, newHost?:string) => {
        if(typeof session === 'string') {
            if(this.sessions.private[session]) session = this.sessions.private[session];
            else if(this.sessions.shared[session]) session = this.sessions.shared[session];
        }
        if(typeof session === 'object') {
            delete session.settings.host;
            if(newHost) {
                if(session.settings.users[newHost]) session.settings.host = newHost;
            }
            if(session.settings.ownerId && !session.settings.host) {
                if(session.settings.users[session.settings.ownerId]) session.settings.host = session.settings.ownerId;
            }
            if(session.settings.admins && !session.settings.host) {
                let match = this.getFirstMatch(session.settings.users,session.settings.admins);
                if(match) session.settings.host = match;
            }//sendOn leadership when host swapping
            if(session.settings.moderators && !session.settings.host) {
                let match = this.getFirstMatch(session.settings.users,session.settings.moderators);
                if(match) session.settings.host = match;
            }//sendOn leadership when host swapping
            if(!session.settings.host) session.settings.host = Object.keys(session.settings.users)[0]; //replace host 
            return true;
        }
        return false;
    }

    deleteSession = (sessionId:string, userId:string) => {
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
    }

    //iterate all subscriptions
    sessionLoop = () => {
        let updates = {
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
            for(const prop in sesh.settings.propnames) {
                if(this.sessions.private[session].data) {
                    if(this.users[sesh.source][prop] && (sesh.data[prop] !== this.users[sesh.source][prop] || !(prop in sesh.data))) 
                        updateObj.data[prop] = this.users[sesh.source][prop];
                }
                else updateObj.data[prop] = this.users[sesh.source][prop];
            }
            if(Object.keys(updateObj.data).length > 0) {
                Object.assign(this.sessions.private[session].data, updateObj); //set latest data on the source object as reference
                updates.private[sesh._id] = updateObj;
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
            if(sesh.settings.host) {
                //host receives object of all other users
                const privateData = {}; //host receives all users' props
                const sharedData = {}; //users receive host props       
                for(const user in sesh.settings.users) {
                    if(!this.users[user]) {
                        delete sesh.users[user]; //dont need to delete admins, mods, etc as they might want to come back <_<
                        if(sesh.settings.host === user) this.swapHost(sesh);
                        break;
                    }
                    if(user !== sesh.settings.host) {
                        privateData[user] = {};
                        for(const prop in sesh.settings.propnames) {
                            if(!(user in sesh.data.private)) 
                                privateData[user][prop] = this.users[user][prop];
                            else if(this.users[user][prop] && sesh.data.private[prop] !== this.users[user][prop]) 
                                privateData[user][prop] = this.users[user][prop];
                        }
                        if(Object.keys(privateData[user]).length === 0) delete privateData[user];
                    } else {
                        sharedData[user] = {};
                        for(const prop in sesh.settings.hostprops) {
                            if(!(user in sesh.data.shared)) 
                                sharedData[user][prop] = this.users[user][prop];
                            else if(this.users[user][prop] && sesh.data.shared[user]?.[prop] !== this.users[user][prop]) 
                                sharedData[user][prop] = this.users[user][prop];
                        }
                    }
                }
                if(Object.keys(privateData).length > 0) {
                    updateObj.data.private = privateData;
                }
                if(Object.keys(sharedData).length > 0) {
                    updateObj.data.shared = sharedData;
                }
            } else { //all users receive the update
                const sharedData = {}; //users receive all other user's props
                for(const user in sesh.settings.users) {
                    sharedData[user] = {};
                    for(const prop in sesh.settings.propnames) {
                        if(sesh.data.shared?.[user] !== this.users[user][prop]) sharedData[user][prop] = this.users[user][prop];
                    }
                    if(Object.keys(sharedData[user]).length === 0) delete sharedData[user];
                }
                if(Object.keys(sharedData).length > 0) {
                    updateObj.data.shared = sharedData;
                }
            }
            if(updateObj.data.shared || updateObj.data.private) {
                updates.shared[sesh._id] = updateObj;
                Object.assign(this.sessions.shared[session].data,updateObj); //set latest data on the source object as reference
            }
        }

        if(Object.keys(updates.private).length === 0) delete updates.private;
        if(Object.keys(updates.shared).length === 0) delete updates.shared;
        if(Object.keys(updates).length === 0) return undefined;
        return updates; //this will setState on the node which should trigger message passing on servers when it's wired up
        // setTimeout(()=>{
        //     if(this.RUNNING) this.sessionLoop(Date.now());
        // }, this.DELAY)
        
    }

    routes:Routes = {
        runAs:this.runAs,
        pipeAs:this.pipeAs,
        addUser:this.addUser,
        removeUser:this.removeUser,
        updateUser:this.updateUser,
        getConnectionInfo:this.getConnectionInfo,
        openPrivateSession:this.openPrivateSession,
        openSharedSession:this.openSharedSession,
        joinSession:this.joinSession,
        leaveSession:this.leaveSession,
        swapHost:this.swapHost,
        sessionLoop:{
            operator:this.sessionLoop, //this will set state each iteration so we can trigger subscriptions on session updates :O
            loop:10
        }
    }
    //todo: add listeners to each connection type to register user connections, add routes for utils like adding mods or banning etc.
}