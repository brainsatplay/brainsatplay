import StateManager from 'anotherstatemanager'
import { SettingsObject, UserObject } from "../../common/general.types";
import { DONOTSEND } from "../../core/index";
import { Service } from "../../core/Service";
import StreamService from '../stream/stream.service';

//TODO: one-off data calls based on session configs
//      reimplement callbacks
class SessionsService extends Service {
    name = 'sessions'

    // Frontend
    user: any
    state = new StateManager();

    // Backend
     //should revamp this to use maps or plain objects
     userSubscriptions=[]; //User to user data subscriptions
     appSubscriptions=[]; //Synchronous apps (all players receive each other's data)
     hostSubscriptions=[]; //Asynchronous apps (host receives all users data, users receive host data only)
     
     userSubs = {};
     appSubs = {};

     sessionTimeout = 20 * 60*1000; //min*s*ms game session timeout with no activity. 20 min default
     
     LOOPING: boolean = true
     delay = 10; //ms loop timer delay

    constructor(Router, userinfo={_id:'user'+Math.floor(Math.random()*10000000000)}, running=true) {
        super(Router)



		this.user = userinfo;
		
		this.services.stream = new StreamService(userinfo);

		//  Pass Datastream Values to the Router
		this.services.stream.subscribe((o) => {
			this.notify(o)
		})

        this.LOOPING = running;

        if(Router) this.delay = Router.INTERVAL;

        //FYI "this" scope references this class, "self" scope references the controller scope.
        this.routes = [

            // Frontend
            {
                route: 'sessionData',
                post: (self, router, args)=>{
                    if(args[0]) {
                        this.state.setState(args[0],args[1]); // id, message
                    }
                },
            },

            // Backend
            {
                route:'updateUserStreamData',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._updateUserStreamData(user,args[0]); // TODO: The second argument is probably wrong
                }
            },
            {
                route:'createSession',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._createSession(user,args[0],args[1]);
                }
            },
            {
                route:'subscribeToSession',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    if(self.USERS[args[0]])
                        return this._subscribeToUser(user,args[0],user.id,args[1],args[2]); //can input arguments according to the type of session you're subscribing to
                    else return this._subscribeToSession(user,args[0],args[1],args[2]);
                }
            },
            {
                route:'unsubscribeFromSession',
                aliases:['kickUser'],
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    if(!args[0]) return this._unsubscribeFromSession(user,user.id,args[1]);
                    return this._unsubscribeFromSession(user,args[0],args[1]);
                }
            },
            {
                route:'getSessionData',
                post:(self, router,args,origin) => {
                    return this._getSessionData(args[0]);
                }
            }, 
            {
                route:'deleteSession',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._deleteSession(user,args[0]);
                }
            }, 
            {
                route:'makeHost',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._makeHost(user,args[0],args[1]);
                }
            }, 
            {
                route:'makeOwner',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._makeOwner(user,args[0],args[1]);
                }
            }, 
            {
                route:'makeAdmin',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._makeAdmin(user,args[0],args[1]);
                }
            }, 
            {
                route:'makeModerator',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._makeModerator(user,args[0],args[1]);
                }
            }, 
            {
                route:'removeAdmin',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._removeAdmin(user,args[0],args[1]);
                }
            }, 
            {
                route:'removeModerator',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._removeModerator(user,args[0],args[1]);
                }
            }, 
            {
                route:'banUser',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._banUser(user,args[0],args[1]);
                }
            }, 
            {
                route:'unbanUser',
                post:(self, router,args,origin) => {
                    const user = self.USERS[origin]
                    if (!user) return false
                    return this._unbanUser(user,args[0],args[1]);
                }
            }, 
            { //some manual overrides for the update loops
                route:'updateSessionUsers',
                post:(self, router,args,origin) => {
                    return this._updateSessionUsers(args[0]);
                }
            }, 
            {
                route:'updateUserStream',
                post:(self, router,args,origin) => {
                    return this._updateUserStream(args[0]);
                }
            }
        ]
    
        // if(running)
        //     this.subscriptionLoop();
    }


    // 
    // Frontend Services (OG)
    // 

	async getUser(userId,callback=(result)=>{}) {
		let res = await this.notify({route: 'getUserStreamData', message: [userId]})
		callback(res)
		return res
	}

	async getUsersInSession(sessionId,callback=(result)=>{}) {
		let res = await this.notify({route: 'getSessionUsers', message: [sessionId]})
		callback(res)
		return res
	}

	async getSessionsFromServer(appname,callback=(result)=>{}) {
		let res = await this.notify({route: 'getSessions', message: [appname]})
		callback(res)
		return res
	}

	async getSessionData(sessionId,callback=(result)=>{}) {
		let res = await this.notify({route: 'getSessionData', message: [sessionId]})
		callback(res)
		return res
	}

	//create and subscribe to a live data session
	async createSession(
		options: SettingsObject = {
			type:'room', //'user','room','hostroom'
			appname:`app${Math.floor(Math.random()*1000000000000)}`,
			//id:'user123', //alternatively supply a user id to subscribe to
			object:{},  //data structure the outgoing datastream (see DataStreaming class)
			settings:{} //settings for the outgoing datastream (see DataStreaming class)
		}, 
		callback=(result)=>{}, 	//runs once on return
		onupdate=undefined, 	//per-update responses e.g. sequential data operations
		onframe=undefined   	//frame tick responses e.g. frontend updates
	) {
		//first some idiotproofing
		if(!options.appname && options.type !== 'user') options.appname=`app${Math.floor(Math.random()*1000000000000)}`;
		else if (!options.id && options.type === 'user') return false;
		if(!options.type) options.type = 'room';
		if(!options.object) options.object = {test:0};
		if(!options.settings) options.settings = {};
		if(!options.settings.keys) options.settings.keys = Array.from(Object.keys(options.object));

		//set up the data stream
		this.services.stream.setStream(
			options.object,
			options.settings,
			options.appname 
		);

		//set up the session
		let sessionSettings = {
			propnames:options.settings.keys
		};

		for(const prop in options) {
			if(prop !== 'object' && prop !== 'type' && prop !== 'settings')
				sessionSettings[prop] = options[prop]; //add arbitrary settings
		}

		if(options.type === 'room' || options.type === 'hostedroom') {
			let info = await this.notify({route: 'createSession', message: [
				options.appname,
				options.type,
				sessionSettings
			]})
			callback(info)

			if(info?.message?.id) 
			{	
				this.state.setState(info.message.id,info.message);
				if(typeof onupdate === 'function') this.state.subscribeTrigger(info.message.id, onupdate);
			if(typeof onframe === 'function') this.state.subscribe(info.message.id, onframe);
			}
			return info;
		}
		else if (options.type === 'user') {
			return await this.subscribeToUser(
				options.id,
				options.propnames,
				callback,
				onupdate,
				onframe
			);
		}
		
	}

	async subscribeToUser(
		userId, //id of user to subscribe to
		propnames=[], //props of the user to listen to
		callback=(result)=>{}, //one-off callback
		onupdate=undefined,  //per-update responses e.g. sequential data operations
		onframe=undefined //frame tick responses e.g. frontend updates
	) {

		let info = await this.notify({route: 'subscribeToUser', message: [
			userId,
			propnames
		]})
		callback(info)
		if(info.message?.id) 
		{	
			this.state.setState(info.message.id,info.message);
			if(typeof onupdate === 'function') this.state.subscribeTrigger(info.message.id, onupdate);
			if(typeof onframe === 'function') this.state.subscribe(info.message.id, onframe);
		}
		return info;
	}

	//subscribe to a game session
	async subscribeToSession(
		sessionId,				//id of the session you are subscribing to
		defaultStreamSetup=true, //default streaming setup (All Latest Values supplied to object)
		callback=(result)=>{}, //runs once on return
		onupdate=undefined, //per-update responses e.g. sequential data operations
		onframe=undefined, //frame tick responses e.g. frontend updates
		
	) {
		let info = await this.notify({route: 'subscribeToSession', message: [sessionId]})
		callback(info)
	
		if(info.message?.id) 
		{	

			if(defaultStreamSetup) {
				let object = {};
				for(const prop in info.message.propnames) {
					object[prop] = undefined;
				}

				//set up the data stream
				this.services.stream.setStream(
					object,
					{
						keys:info.message.propnames
					},
					info.message.appname 
				);

				//do this.services.stream.updateStreamData(info.message.appname, {propname:'newdata'})
			}

			this.state.setState(info.message.id,info.message);
			if(typeof onupdate === 'function') this.state.subscribeTrigger(info.message.id, onupdate);
			if(typeof onframe === 'function') this.state.subscribe(info.message.id, onframe);
		}
		return info;
	}

	async unsubscribeFromSession( //can kick yourself or another user from a session
		sessionId, //session id to unsubscribe from
		userId=this.user._id, //user id to unsubscribe from session (yours by default)
		callback=(result)=>{}
	) {
		let result = await this.notify({route: 'unsubscribeFromSession', message: [userId, sessionId]})
		callback(result)
		if(result.message) {
			this.state.unsubscribeAll(sessionId);
		}
		
	}

	//alias
	kick = this.unsubscribeFromSession

	//set values in a session, careful not to overwrite important stuff
	async setSessionSettings(
		sessionId,
		settings={}, //e.g. {propnames:['abc']}
		callback=(result)=>{}
	) {
		let res = await this.notify({route: 'setSessionSettings', message: [sessionId, settings]})
		callback(res)
		return res
	}

	//delete a user or room session
	async deleteSession(
		sessionId, 
		callback=(res)=>{}
	) {
		if(!sessionId) return undefined;
		let res = await this.notify({route: 'deleteSession', message: [sessionId]})
		callback(res)

		if(res.message) {
			this.state.unsubscribeAll(sessionId);
		}

		return res;
	}

	async makeHost( 
		userId,
		sessionId,
		callback=(result)=>{}
	) {
		if(!userId || !sessionId) return undefined;
		let res = await this.notify({route: 'makeHost', message: [userId, sessionId]})
		callback(res)
		return res
	}

	//admins can make mods or kick and ban, only owners can make admins
	async makeAdmin( 
		userId,
		sessionId,
		callback=(result)=>{}
	) {
		if(!userId || !sessionId) return undefined;
		let res = await this.notify({route: 'makeAdmin', message: [userId, sessionId]})
		callback(res)
		return res
	}

	//mods can kick and ban or make more mods
	async makeModerator( 
		userId,
		sessionId,
		callback=(result)=>{}
	) {
		if(!userId || !sessionId) return undefined;
		let res = await this.notify({route: 'makeModerator', message: [userId, sessionId]})
		callback(res)
		return res
	}

	async makeOwner( 
		userId,
		sessionId,
		callback=(result)=>{}
	) {
		if(!userId || !sessionId) return undefined;
		let res = await this.notify({route: 'makeOwner', message: [userId, sessionId]})
		callback(res)
		return res
	}

	async removeAdmin( 
		userId,
		sessionId,
		callback=(result)=>{}
	) {
		if(!userId || !sessionId) return undefined;
		let res = await this.notify({route: 'removeAdmin', message: [userId, sessionId]})
		callback(res)
		return res
	}

	async removeModerator( 
		userId,
		sessionId,
		callback=(result)=>{}
	) {
		if(!userId || !sessionId) return undefined;
		let res = await this.notify({route: 'removeModerator', message: [userId, sessionId]})
		callback(res)
		return res
	}	

	//user will not be able to rejoin
	async banUser( 
		userId,
		sessionId,
		callback=(result)=>{}
	) {
		if(!userId || !sessionId) return undefined;
		let res = await this.notify({route: 'banUser', message: [userId, sessionId]})
		callback(res)
		return res
	}

	async unbanUser( 
		userId,
		sessionId,
		callback=(result)=>{}
	) {
		if(!userId || !sessionId) return undefined;
		let res = await this.notify({route: 'unbanUser', message: [userId, sessionId]})
		callback(res)
		return res
	}
	
	//manual stream updates if the server isn't looping automatically, ignore otherwise
	async updateUserStream( 
		sessionId,
		callback=(result)=>{}
	) {
		if(!sessionId) return undefined;
		let res = await this.notify({route: 'updateUserStream', message: [sessionId]})
		callback(res)
		return res
	}
		
	async updateSessionUsers( 
		sessionId,
		callback=(result)=>{}
	) {
		if(!sessionId) return undefined;
		let res = await this.notify({route: 'updateSessionUsers', message: [sessionId]})
		callback(res)
		return res
	}


    // 
    // Backend Services (OG)
    // 

    //Received user data from a user socket, now parse it into system
	_updateUserStreamData(user:Partial<UserObject>={}, data:{
        id?: string
        args: {}
    }={args: {}}){ 
		//Send previous data off to storage
        
        let u;
        if(data.id)
            u = this.router.USERS[data.id];
        else u = this.router.USERS[data.id];

        if(!u) return undefined;

        for(const prop in data.args) {
            u.props[prop] = data.args[prop];
            if(u.updatedPropnames.indexOf(prop) < 0)
                u.updatedPropnames.push(prop);
        }

        let now = Date.now();
        u.latency = now-u.lastUpdate;
        u.lastUpdate = now;
        
        return DONOTSEND;
	}

    _createSession(
        user: Partial<UserObject>={},
        type='room', 
        settings: Partial<SettingsObject> = {}
    ) {
        if(type === 'room' || type === 'hostroom') {

            let sessionId;
            if(settings.id) sessionId = settings.id;
            else sessionId = `session${Math.floor(Math.random()*1000000000000)}`;

            if(!settings.appname) 
                settings.appname=`app${Math.floor(Math.random()*1000000000000)}`;
        
            let session = {
                appname:settings.appname,          //app name (can overlap with others for specific applications)
                id:sessionId,             //session unique id
                type:type,                //'room' or 'hostedroom' decides the stream loop outputs to users
                ownerId:user.id,            //session owner, super admin
                propnames:[], //user streaming props
                host:user.id,       //host unique id
                hostprops:[], //host streaming props in a hosted room (host receives all user data, users receive only host data)
                admins:[],  //admins stay moderators after leaving, added by owner initially
                moderators:[], //moderators can kick/ban/make host, these are temp priveleges
                users:[],           //user ids
                spectators:[], //usernames of spectators
                banned:[], //users unable to join the session
                lastTransmit:Date.now(), 
                devices:undefined,       //optional device requirement info e.g. sensors or controllers
                appSettings:undefined  //e.g. a config object for an app
            };

            if(user.id) { 
                if(!session.users.includes(user.id)) session.users.push(user.id); 
                if(!session.admins.includes(user.id)) session.admins.push(user.id); 
            }

            Object.assign(session,settings); //apply any supplied settings e.g. propnames, hostprops (if a hostedroom), admin and mod settings, or arbitrary values

            this.appSubs[sessionId] = session;

            return session;

        }
        else if (type === 'user') {
            if(user.id && settings.id && settings.propnames) {
                return this._subscribeToUser(user, settings.id, user.id, settings.propnames);
            }
        }
    }

    //For 2+ user sessions or asynchronous 'host' room communication
    _subscribeToSession(user:Partial<UserObject>={}, userId, sessionId, spectating=true) {
        let session = this.appSubs[sessionId];
        
        if(session) {
            if(!userId && !user.id) return undefined;
            if(!userId && user.id) userId = user.id;
            

            let newUser = this.router.USERS[userId];
            if(!newUser) return undefined;

        
            if(!session.banned.includes(userId)) {
                if(!session.users?.includes(userId))
                    session.users.push(userId);
                if(spectating && !session.spectators.includes(userId))
                    session.spectators.push(userId);
                if(session.host && !session.users.includes(session.host))
                    session.host = userId; //makes user the new host if they are not present

                let result = JSON.parse(JSON.stringify(session))
                result.userData = {};

                if(session.host !== user.id || session.type !== 'hostedroom') { //get all the user data
                    session.users.forEach((id) => {
                        let u = this.router.USERS[id];
                        if(u) {
                            result.userData[id] = {};
                            session.propnames.forEach((p) => {
                                if(u.props[p]) result.userData[id][p] = u.props[p]
                            });
                            if(Object.keys(result.userData[id]).length === 0) delete result.userData[id];
                        }
                    });
                } else { //only get the host's data in this case
                    let u = this.router.USERS[session.host];
                    if(u) {
                        result.hostData = {};
                        session.hostprops.forEach((p) => {
                            if(u.props[p]) result.userData[session.host][p] = u.props[p];
                        });
                    }
                }
                if(user.id !== userId) { //make sure the new user receives the data
                    newUser.send({route:'sessionData',message:result});
                    newUser.sessions.push(session.id);
                } else if(user.sessions) user.sessions.push(session.id);
                
                return result; //return the session object with the latest data for setup
            }
            
        } 
        else return undefined;
    }

    //Listen to a user's updates
	_subscribeToUser(user, sourceId, listenerId, propnames=[], settings={}, override=false) {

        if(!sourceId) return undefined;
        if(!listenerId) listenerId = user.id;

        let source = this.router.USERS[sourceId];

        let listener = this.router.USERS[listenerId];
        if(!listener) return undefined;

        if(propnames.length === 0) propnames = Array.from(Object.keys(source.props)); //stream ALL of the available props instead
        
        if(user.id !== listenerId && user.id !== sourceId && override === false) return undefined;
        if(!source || source.blocked.includes(listenerId) || source.blocked.includes(user.id)) return undefined; //blocked users can't make one-on-one streams

        if(this.router.DEBUG) console.log(listenerId, sourceId)
        
        let sub = undefined;
        for(const prop in this.userSubs) {
            let o = this.userSubs[prop];
            if(o.listener === listenerId && o.source === sourceId) {
                sub = o;
                o.propnames = propnames;
                return true;
            }
        }

        if(!sub) {
            if(propnames.length === 0) {
                for(const propname in source.props) {
                    propnames.push(propname);
                }
            }
            let u = this.router.USERS[listenerId];
            if(u !== undefined && source !== undefined) {
                let obj = {
                    type:'user',
                    ownerId:user.id,
                    listener:listenerId,
                    source:sourceId,
                    id:`${sourceId}${Math.floor(Math.random()*10000000000)}`,
                    propnames:propnames,
                    lastTransmit:0
                }

                for(const prop in settings) {
                    if(!obj[prop]) obj[prop] = settings[prop]; //append any extra settings 
                }

                this.userSubs[obj.id] = obj;

                let result = JSON.parse(JSON.stringify(obj));
                result.userData = {[sourceId]:{}};
                for(const prop in propnames) {
                    if(source.props[prop]) result.userData[sourceId][prop] = source.props[prop];
                }

                u.sessions.push(obj.id);
                return result;
            }
            else {
                return undefined;
            }
            
        }
        else { 
            return sub;
        }
	}

    
    //kick a user from an app session
    _kickUser(user:Partial<UserObject>={}, userId, sessionId, override=false) {
        let session = this.appSubs[sessionId];

        if((!user.id && !userId) || !sessionId) return undefined;
        if(user.id && !userId) userId = user.id;

        if(session) {
            if(!session.admins.includes(user.id) && !session.moderators.includes(user.id) && override === false)
                return undefined; //no priveleges

            let idx = session.users.indexOf(userId);
            if(idx) {
                session.users.splice(idx,1);
                let u = this.router.USERS[userId];
                if(u) {
                    let i = u.sessions.indexOf(sessionId);
                    if(i > -1) { u.sessions.splice(i,1); }
                } 

                if(session.host === userId) session.host = session.users[0]; //make the first user the host
                if(session.spectators.includes(userId)) 
                    session.spectators.splice(session.spectators.indexOf(userId));
                if(session.moderators.includes(userId))
                    session.moderators.splice(session.moderators.indexOf(userId));
                return {id:sessionId, user:userId, kicked:true}; //kicked!  
            }
        } else { //try kicking user from a one-on-one stream if the ids match
            if(this.userSubs[sessionId]) {
                this._removeUserToUserStream(user,sessionId);
                return {id:sessionId, user:userId, kicked:true}; //kicked!
            } else { //search
                for(const prop in this.userSubs) {
                    if(this.userSubs[prop].source === userId || this.userSubs[prop].listener === userId) {
                        this._removeUserToUserStream(user,userId);
                        return {id:sessionId, user:userId, kicked:true}; //kicked!
                    }
                }
            }
        }
        return undefined; //not kicked!
    }

    //aliases
    _kick = this._kickUser;
    _unsubscribeFromSession = this._kickUser;

    //delete a session. It will time out otherwise
    _deleteSession(user:Partial<UserObject>={}, sessionId, override=false) {

        if(this.appSubs[sessionId]) {
            if(override === true || this.appSubs[sessionId].ownerId === user.id || this.appSubs[sessionId].admins.includes(user.id)) {
                delete this.appSubs[sessionId];
                return {id:sessionId, deleted:true};
            }
        }
        else if(this.userSubs[sessionId]) {
            if(override === true || this.userSubs[sessionId].ownerId === user.id || this.userSubs[sessionId].source === user.id || this.userSubs[sessionId].listener ===  user.id) {
                delete this.userSubs[sessionId];
                return {id:sessionId, deleted:true};
            }
        }
    
        return undefined;
    }


    //remove single user -> user streams, or just props from the stream         
    _removeUserToUserStream(user, streamId, propnames=undefined,override=false) { //delete stream or just particular props
        let sub = this.userSubs[streamId];
        if(!sub) {
            //try to search for the user id
            for(const prop in this.userSubs) {
                if(
                    (this.userSubs[prop].source === streamId && this.userSubs[prop].listener === user.id) ||
                    (this.userSubs[prop].listener === streamId && this.userSubs[prop].source === user.id)
                ) 
                {
                    streamId = prop;
                    sub = this.userSubs[prop];
                    break;
                }
            }
        }
        if(sub) {
            if(user.id !== sub.listener && user.id !== sub.source && override === false) return undefined;
       
            if(Array.isArray(propnames)) { //delete props from the sub
                propnames.forEach((p) => {
                    let i = sub.propnames.indexOf(p);
                    if(i > -1)
                        sub.propnames.splice(i,1);
                });
            }
            else {
                let source = this.router.USERS[sub.source];
                let i1 = source.sessions.indexOf(sub.id);
                if(i1 > -1) source.sessions.splice(i1,1);
                
                let listener = this.router.USERS[sub.listener];
                let i2 = listener.sessions.indexOf(sub.id);
                if(i2 > -1) listener.sessions.splice(i2,1);

                delete this.userSubs[streamId]; //or delete the whole sub
            }

            return {id:sub.id, user:sub.listener, kicked:true};
        }    
        else return undefined;
    }

    _makeHost(user:Partial<UserObject>={}, userId, sessionId, override=false) {
        let session = this.appSubs[sessionId];

        if(session) {
            if(override === true || session.admins.indexOf(user.id) > -1 || session.moderators.indexOf(user.id) > -1) {
                session.host = userId;
                return {id:sessionId, user:userId, host:true};
            }
        }
        return undefined;
    }

    //only owner can make other users owner
    _makeOwner(user:Partial<UserObject>={}, userId, sessionId, override=false) {
        let session = this.appSubs[sessionId];

        if(session) { 
            if(override === true || (user.id === session.ownerId && user.id !== userId)) {
                session.ownerId = userId;
                return {id:sessionId, user:userId, owner:true};
            }
        }
        return undefined;
    }

    //only owner can make users admin
    _makeAdmin(user:Partial<UserObject>={}, userId, sessionId, override=false) {
        let session = this.appSubs[sessionId];

        if(session) { 
            if(override === true || (user.id === session.ownerId && session.admins.indexOf(userId) < 0)) {
                session.admins.push(userId);
                return {id:sessionId, user:userId, admin:true};
            }
        }
        return undefined;
    }

    //only owner can remove admins. admins can set settings and kick and ban or delete a session
    _removeAdmin(user:Partial<UserObject>={}, userId, sessionId, override=false) {
        let session = this.appSubs[sessionId];

        if(session) {
            if(override === true || (session.admins.includes(userId) && session.ownerId !== userId)) {
                session.admins.splice(session.admins.indexOf(userId));
                return {id:sessionId, user:userId, admin:false};
            }
        }
        return undefined;
    }
 
    //admins and mods can make other users mods. mods can kick and ban. admins can set settings
    _makeModerator(user:Partial<UserObject>={}, userId, sessionId, override=false) {
        let session = this.appSubs[sessionId];

        if(session) { 
            if(override === true || ((session.admins.indexOf(user.id) > -1 || session.moderators.indexOf(user.id) > -1) && session.moderators.indexOf(userId) < 0)) {
                session.moderators.push(userId);
                return {id:sessionId, user:userId, moderator:true};
            }
        }
        return undefined;
    }   

    //only owner can remove admins. admins can set settings and kick and ban or delete a session
    _removeModerator(user:Partial<UserObject>={}, userId, sessionId, override=false) {
        let session = this.appSubs[sessionId];

        if(session) {
            if(override === true || (session.admins.includes(userId) && session.ownerId !== userId)) {
                session.moderators.splice(session.moderators.indexOf(userId));
                return {id:sessionId, user:userId, moderator:false};
            }
        }
        return undefined;
    }

    //ban a user from an app session
    _banUser(user:Partial<UserObject>={}, userId, sessionId, override=false) {
        
        this._kickUser(user, userId, sessionId);
        
        let session = this.appSubs[sessionId];

        if(session) {
            if( ( session.ownerId !== userId && !session.banned.includes(userId)
                && ( session.admins.includes(user.id) || session.moderators.includes(user.id) ) ) 
                || override === true ) 
            { 
                session.banned.push(userId);
                if(session.admins.includes(userId))  {
                    session.admins.splice(
                        session.admins.indexOf(userId)
                    );
                    return {id:sessionId, user:userId, banned:true};
                }
            }
        }
        return undefined;
    }

    //unban a user from an app session
    _unbanUser(user:Partial<UserObject>={}, userId, sessionId, override=false) {
        
        let session = this.appSubs[sessionId]
        if(session) { 
            if( 
                (   session.banned.includes(userId) 
                    && (session.admins.includes(user.id) || session.moderators.includes(user.id)) 
                ) || override === true 
            ) {
                session.banned.splice(session.banned.indexOf(userId),1);
                return {id:sessionId, user:userId, banned:false};
            }
        }
        return undefined;
    }

    //this is an override to assign arbitrary key:value pairs to a session (danger!)
    //users will be updated on the next loop, returns the session info
    _setSessionSettings(user:Partial<UserObject>={},sessionId,settings={},override=false) {
        if(this.appSubs[sessionId]) {
            if(
                this.appSubs[sessionId].admins.includes(user.id) 
                || this.appSubs[sessionId].ownerId === user.id 
                || override === true
            ) {
                Object.assign(this.appSubs[sessionId],settings);
                return this.appSubs[sessionId];
            }
        }
        else if (this.userSubs[sessionId]) {
            if(
                this.userSubs[sessionId].source === user.id 
                || this.userSubs[sessionId].listener === user.id 
                || this.userSubs[sessionId].ownerId === user.id || override === true
            ) {
                Object.assign(this.userSubs[sessionId], settings);
                return this.userSubs[sessionId];
            }
        }
        return undefined;
    }

    _getUserStreamData(sessionId) {
        let session = this.userSubs[sessionId];
        if(session) {
            let result = JSON.parse(JSON.stringify(session));
            result.userData = {};

            session.users.forEach((sourceId) => {
                result.userData[sourceId] = {}
                let source = this.router.USERS[session.source];

                if(!source) this._removeUserToUserStream(undefined,session.id,undefined,true);
                
                for(const prop in session.propnames) {
                    if(source.props[prop]) result.userData[sourceId][prop] = source.props[prop];
                }
            })


            return result;
        }
        return undefined;
    }

    _getSessionData(sessionId) {
        let session = this.userSubs[sessionId];
        if(session) {
            let result = JSON.parse(JSON.stringify(session));
            result.userData = {};
            session.users.forEach((id) => {
                result.userData[id] = {};
                for(const prop in session.propnames) {
                    let u = this.router.USERS[id];
                    if(u) {
                        if(!session.spectators.includes(id)) {
                            for(const prop in session.propnames) {
                                if(u.props[prop]) result.userData[id][prop] = u.props[prop];
                            }
                        }
                    } else this._kickUser(undefined,id,session.id,true);
                    if(Object.keys(result.userData[id]).length === 0) 
                        delete result.userData[id];
                }
            });   

            return result;
        }
        else return this._getUserStreamData(sessionId); //will return undefined if user sub not found
    }

    _updateSessionUsers(sessionId) {
        
        let updatedUsers = {};

        let session = this.appSubs[sessionId];
        if(!session) return undefined;

        if(session.users.length === 0) {
            if(session.lastTransmit - Date.now() >= this.sessionTimeout) delete this.appSubs[sessionId];
            return undefined; 
        }
        let updateObj = JSON.parse(JSON.stringify(session));
            
        if(session.type === 'hostroom') {

            updateObj.hostData = {};
            let host = this.router.USERS[session.host];
            if(!host && session.host) {
                this._kickUser(undefined,session.host,session.id,true);
            } else {
                session.host = session.users[0];
                if(!session.host) return false; //no users to update, continue
                else host = this.router.USERS[session.host];
            }

            session.hostprops.forEach((prop) => {
                if(host.updatedPropNames.includes(prop)) updateObj.hostData[prop] = host.props[prop];
            });
            
            if(Object.keys(updateObj.hostData).length > 0) {
                let toKick = [];
                session.users.forEach((user) => {
                    let u = this.router.USERS[user];
                    if(!u) toKick.push(user);
                    else if (user !== session.host && u.send) u.send({route:'sessionData',message:updateObj})   
                    updatedUsers[user] = true;
                });
                toKick.forEach((id) => {
                    this._kickUser(undefined,id,session.id,true);
                });
            }
            delete updateObj.hostData;
        }

        updateObj.userData = {};
        let toKick = [];
        session.users.forEach((user) => {
            let u = this.router.USERS[user];
            if(!u) toKick.push(user);
            else {
                updateObj.userData[user] = {};
                session.propnames.forEach((prop) => {
                    if(!session.spectators.includes(user)) {
                        if(u.updatedPropNames.includes(prop)) 
                            updateObj.userData[user][prop] = u.props[prop];
                    }
                });
                if(Object.keys(updateObj.userData[user]).length === 0) 
                    delete updateObj.userData[user]; //no need to pass an empty object
            }
        });
        toKick.forEach((id) => {
            this._kickUser(undefined,id,session.id,true);
        });

        //now send the data out
        if(session.type === 'hostroom') {
            let host = this.router.USERS[session.host];
            if(host) {
                if (host.send) host.send({route:'sessionData',message:updateObj})   
                updatedUsers[session.host] = true;
            }
            session.lastTransmit = Date.now();
        }   
        else {
            session.users.forEach((user) => {
                let u = this.router.USERS[user];
                if(u) {
                    if (u.send) u.send({route:'sessionData',message:updateObj})   
                    updatedUsers[user] = true;
                }
            });
            session.lastTransmit = Date.now();
        }

        return updatedUsers;

    }

    _updateUserStream(sessionId) {
        let updatedUsers = {};

        let session = this.userSubs[sessionId];   
        if(!session) return undefined;

        let updateObj = JSON.parse(JSON.stringify(session));

        let source = this.router.USERS[session.source];
        let listener = this.router.USERS[session.listener];
        if(!source || !listener) {
            this._removeUserToUserStream(undefined,session.id,undefined,true);
            return undefined;
        }
        if(session.lastTransmit - Date.now() >= this.sessionTimeout) {
            delete this.userSubs[sessionId];
            return undefined;
        }

        updateObj.userData = {[session.source]:{}};
        session.propnames.forEach((p) => {
            if(source.updatedPropNames.includes(p)) 
                updateObj.userData[session.source][p] = source.props[p];
        });

        if(Object.keys(updateObj.userData).length > 0) {
            const u = this.router.USERS[session.listenerId]
            if (u) {
                if (u.send) u.send({route:'sessionData',message:updateObj})   
                updatedUsers[u.id] = true;
                session.lastTransmit = Date.now();
            }
        }
        
        return updatedUsers;

    }

    streamLoop = () => {

        if(this.LOOPING){

            let updatedUsers = {};

            //handle session streams
            for(const prop in this.appSubs) {
                let updated = this._updateSessionUsers(prop);
                if(updated) Object.assign(updatedUsers,updated);
            }

            //handle user-user streams
            for(const prop in this.userSubs) {
                let updated = this._updateUserStream(prop);
                if(updated) Object.assign(updatedUsers,updated);
            }

            //clear update flags
            for(const prop in updatedUsers) {
                let u = this.router.USERS[prop];
                if(u) u.updatedPropNames = [];
            }

            setTimeout(this.streamLoop,this.delay);

        }
    }

}

export default SessionsService
