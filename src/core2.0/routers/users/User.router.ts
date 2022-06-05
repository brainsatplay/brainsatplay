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
        //if(users.webrtc) {}
        //if(users.sessions) {}
            
        if(!(user instanceof Graph)) this.users[user._id] = new Graph(user, undefined, this.service);

        return this.users[user._id];
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
        //if(users.webrtc) {}
        //if(users.sessions) {}

        delete this.users[user._id];
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
            if(options) { return this.updateSession(options,userId); };
            return sesh;
        } 
    }

    leaveSession = (sessionId:string, userId:string, clear?:boolean) => {
        let session:any = this.sessions.private[sessionId];
        if(!session) session = this.sessions.shared[sessionId];
        if(session) {
            if(this.sessions.private[sessionId]) {
                if(userId === session.settings.source || userId === session.settings.listener || session.settings.admins?.[userId] || session.settings.moderators?.[userId]) {
                    delete this.sessions.private[sessionId];
                    if(clear) {
                        if(session.settings.admins?.[userId])     delete this.sessions.shared[sessionId].settings.admins[userId];
                        if(session.settings.moderators?.[userId]) delete this.sessions.shared[sessionId].settings.moderators[userId];
                    }
                } 
            } else if (this.sessions.shared[sessionId]) {
                delete this.sessions.shared.settings.users[userId];
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

    swapHost = (session:PrivateSessionProps|SharedSessionProps|string) => {
        if(typeof session === 'string') {
            if(this.sessions.private[session]) session = this.sessions.private[session];
            else if(this.sessions.shared[session]) session = this.sessions.shared[session];
        }
        if(typeof session === 'object') {
            delete session.settings.host;
            if(session.settings.ownerId) {
                if(session.settings.users[session.settings.ownerId]) session.settings.host = session.settings.ownerId;
            }
            if(session.settings.admins && !session.settings.host) {
                let match = this.getFirstMatch(session.settings.users,session.settings.admins);
                if(match) session.settings.host = match;
            }//prefer leadership when host swapping
            if(session.settings.moderators && !session.settings.host) {
                let match = this.getFirstMatch(session.settings.users,session.settings.moderators);
                if(match) session.settings.host = match;
            }//prefer leadership when host swapping
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
        join:this.joinSession,
        leave:this.leaveSession,
        swapHost:this.swapHost,
        sessionLoop:{
            operator:this.sessionLoop, //this will set state each iteration so we can trigger subscriptions on session updates :O
            loop:10
        }
    }
    //todo: add listeners to each connection type to register user connections, add routes for utils like adding mods or banning etc.
}