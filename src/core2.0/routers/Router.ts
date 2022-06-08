import { Graph } from "../Graph";
import { Routes, Service, ServiceMessage } from '../services/Service';
//should match existing service names, services have matching frontend and backend names as well
export type Protocol = 'http'|'wss'|'sse'|'webrtc'|'osc'|'worker'|'ble'|'serial'|'unsafe'|'struct'|'fs'|'lsl'|'hdf5'|'unity'|'e2ee'; //??? could make alternates too like express etc. services, everything is pluggable. 


//handle subscriptions
//match i/o protocols to correct services

export class Router { //instead of extending acyclicgraph or service again we are going to keep this its own thing

    id = `router${Math.floor(Math.random()*1000000000000000)}`

    service = new Service(); //global service
    run = this.service.run;
    _run = this.service._run;
    add = this.service.add;
    remove = this.service.remove;
    stopNode = this.service.stopNode;
    subscribe = this.service.subscribe;
    unsubscribe = this.service.unsubscribe;
    get = this.service.get;
    reconstruct = this.service.reconstruct;
    setState = this.service.setState;

    state = this.service.state;

    routes:Routes = {}
    services:{[key:string]:Service} = {};

    [key:string]:any;

    constructor(services:(Service|Routes)[]|{[key:string]:Service|Routes}|any[]) { //preferably pass services but you can pass route objects in too to just add more base routes
        this.load(this.defaultRoutes);
        if(this.routes) 
            if(Object.keys(this.routes).length > 0)
                this.load(this.routes);
        if(Array.isArray(services)){
            services.forEach(s => this.load(s));
        }
        else if (typeof services === 'object') {
            Object.keys(services).forEach(s => this.load(services[s]));
        }
        
    }

    load = (service:Service|Routes|any) => { //load a service class instance or service prototoype class
        if(!(service instanceof Service) && typeof service === 'function')    //class
        {   
            service = new service(undefined, service.name); //we can instantiate a class)
            service.load();
        }
        else if(!service) return;
        if(service instanceof Service) {
            this.services[service.name] = service;
        }
        this.service.load(service);
        
        return this.services[service.name];
    }

    //pipe state updates from a source route/node through an available protocol to a destination route/node
    pipe = (
        source:string|Graph, 
        destination:string, 
        transmitter?:Protocol|string, 
        origin?:string, 
        method?:string, 
        callback?:(res:any)=>any|void
    ) => {
        if(!transmitter && source && destination) {
            
            if(callback) return  this.subscribe(source,(res:any) => { 
                let mod = callback(res);
                if(mod) res = mod;
                this.run(destination, res); 
            }); //local pipe
            return this.subscribe(source,(res:any) => { this.run(destination, res); }); //local pipe
        }
        if(transmitter === 'sockets') transmitter = 'wss';
        const radio = this.services[transmitter];
        if(radio) {
            if(callback) {
                return this.subscribe(source,(res) => {
                    let mod = callback(res);
                    if(mod) res = mod;
                    radio.transmit(
                        {route:destination,args:res,origin,method}
                    );
                });

            }
            else return this.subscribe(source,(res) => {
                radio.transmit({route:destination,args:res,origin,method});
            });
        } else { //search every service connection for a matching path
            let endpoint = this.getEndpointInfo(transmitter);
            if(endpoint) { 
                this.services[endpoint.service].pipe(source,destination,transmitter,origin,method,callback);
            }
        }
    }

    //one-shot callback pipe e.g. to return results back through an endpoint
    pipeOnce = (
        source:string|Graph, 
        destination:string, 
        transmitter?:Protocol|string, 
        origin?:string, 
        method?:string, 
        callback?:(res:any)=>any|void
    ) => {
        if(source instanceof Graph) source = source.tag;
        if(!transmitter && source && destination) {
            if(callback) return  this.state.subscribeTriggerOnce(source,(res:any) => { 
                let mod = callback(res);
                if(mod) res = mod;
                this.run(destination, res); 
            }); //local pipe
            return this.state.subscribeTriggerOnce(source,(res:any) => { this.run(destination, res); }); //local pipe
        }
        if(transmitter === 'sockets') transmitter = 'wss';
        const radio = this.services[transmitter];
        if(radio) {
            if(callback) {
                return this.state.subscribeTriggerOnce(source,(res) => {
                    let mod = callback(res);
                    if(mod) res = mod;
                    radio.transmit(
                        {route:destination,args:res,origin,method}
                    );
                });

            }
            else return this.state.subscribeTriggerOnce(source,(res) => {
                radio.transmit({route:destination,args:res,origin,method});
            });
        } else { //search every service connection for a matching path
            let endpoint = this.getEndpointInfo(transmitter);
            if(endpoint) { 
                this.services[endpoint.service].pipeOnce(source,destination,transmitter,origin,method,callback);
            }
        }
    }


    //send to protocols based on a specifier object, if say multiple event sources or webrtc connections are being called you can specify a channel
    sendAll = (
        message:ServiceMessage|any, 
        connections:{[key:string]:{[key:string]:any}}, //e.g. {wss:{'socket1':socketinfo}} //provide list of objects associating connection types and active connection info objects
        channel?:string
    ) => {
        let sent = false;
        if(connections instanceof Object) { //can transmit on multiple endpoints in an object
            for(const protocol in connections) {
                for(const info in connections[protocol]) {
                    let obj = connections[protocol][info];
                    if(obj.socket) { //frontend or backend socket
                        if(obj.socket.readyState === 1) {
                            obj.socket.send(message);
                            sent = true;
                        } else delete connections[protocol][info]; //not preferable if it's closed
                    } else if(obj.wss) { //websocket server
                        obj.wss.clients.forEach((c:WebSocket) => {c.send(message);})
                        sent = true;
                    } else if(obj.sessions) { //sse backend
                        if(channel) {
                            obj.channel.broadcast(message,channel)
                            sent = true;
                        } else for(const s in obj.sessions) {
                            if(obj.sessions[s].isConnected) {
                                obj.sessions[s].push(message);
                                sent = true;
                            }
                        }
                    } else if(obj.session) { //sse backend single session
                        if(channel) {
                            obj.served.channel.broadcast(message,channel); //this will still boradcast to all channels fyi
                            sent = true;
                        } else if(obj.session.isConnected) { 
                            obj.session.push(message);
                            sent = true;
                        } else delete connections[protocol][info];
                    } else if(obj.rtc) { //webrtc peer connection
                        if(channel && obj.channels[channel]) {
                            obj.channels[channel].send(message);
                            sent = true;
                        } else if(obj.channels.data) { //default data channel
                            obj.channels.data.send(message);
                            sent = true;
                        } else {
                            let firstchannel = Object.keys(obj.channels)[0]; 
                            obj.channels[firstchannel].send(message);
                            sent = true;
                        }
                    } else if(obj.server) { //http server (??)
                        if(this.services.http) {
                            this.services.http.transmit(message,channel); //??
                            sent = true;
                        }
                    }
                } //need to despaghettify this 
            }
        }
    }


    //get endpoint info e.g. a socket server or sse object based on the address it's stored as
    getEndpointInfo = (
        path:string,
        service?:string
    ) => {
        if(!path) return undefined;

        let testpath = (path:string,service:string) => {
            if(this.services[service]) {
                
                if(this.services[service].rtc?.[path]) {
                    return this.services[service].rtc[path];
                }
                else if(this.services[service].servers?.[path]) {
                    return this.services[service].servers[path];
                }
                else if(this.services[service].sockets?.[path]) {
                    return this.services[service].sockets[path];
                }
                else if(this.services[service].eventsources?.[path]) {
                    return this.services[service].eventsources[path];
                }
                else if(this.services[service].workers?.[path]) {
                    return this.services[service].workers[path];
                } 
            }
             
            return undefined;
        }
        
        if(service) {
            let found = testpath(path,service);
            if(found) 
                return {
                    endpoint:found,
                    service
                };
        } 
        for(const s in this.services) {
            let found = testpath(path,s);
            if(found) 
                return {
                    endpoint:found,
                    service:s
                };
        }
        
        return undefined;
    }

    //  We only really want this function for users trying to communicate 
    //    to a single endpoint where we want the fastest possible  
    pipeFastest = (
        source:string|Graph, 
        destination:string, 
        origin?:string, 
        method?:string, 
        callback?:(res:any)=>any|void,
        services=this.services //can choose from selected services
    ) => {
        for(const service in services) {          
            if(services[service].rtc) {
               return this.pipe(source,destination,'webrtc',origin,method,callback);
            }
            if(services[service].eventsources) {
                let keys = Object.keys(services[service].eventsources);
                if(keys[0])
                    if(this.services[service].eventsources[keys[0]].sessions)
                        return this.pipe(source,destination,'sse',origin,method,callback);
            }
            if(services[service].sockets) {
                return this.pipe(source,destination,'wss',origin,method,callback);
            }
            if(services[service].servers) {
                return this.pipe(source,destination,'http',origin,method,callback);
            }
            if(services[service].workers) { //workers aren't remote but whatever it's in here 
                return this.pipe(source,destination,'worker',origin,method,callback);
            }
        }
    }
    
    //get the first remote endpoint that exists on this router in order of fastest. 
    //  We only really want this function for users trying to communicate 
    //    to a single endpoint where we want the fastest possible  
    getFirstRemoteEndpoint = (
        services=this.services
    ) => { 
        let serviceInfo:any;

        for(const service in services) {          
            if(services[service].rtc) {
                serviceInfo = services[service].rtc;
            }
            if(services[service].eventsources && !serviceInfo) {
                let keys = Object.keys(services[service].eventsources);
                if(keys[0])
                    if(this.services[service].eventsources[keys[0]]?.sessions)
                        serviceInfo = services[service].eventsources;
            }
            if(services[service].sockets && !serviceInfo) {
                serviceInfo = services[service].sockets;
            }
            if(services[service].servers && !serviceInfo) {
                serviceInfo = services[service].servers;
            }
            if(services[service].workers && !serviceInfo) { //workers aren't remote but whatever it's in here 
                serviceInfo = services[service].workers;
            }
        }

        let keys = Object.keys(serviceInfo);
        if(keys[0])
            return serviceInfo[keys[0]];
    }



    
	STREAMLATEST = 0;
	STREAMALLLATEST = 1;
    streamSettings:{
        [key:string]:{
            object:{[key:string]:any}, //the object we want to watch
            settings:{ //the settings for how we are handling the transform on the watch loop
                keys?: string[]
                callback?:0|1|Function,
                lastRead?:number,
                [key:string]:any
            }
        }
    } = {};

    streamFunctions = {
        //these default functions will only send the latest of an array or value if changes are detected, and can handle single nested objects 
        // you can use the setting to create watch properties (e.g. lastRead for these functions). 
        // All data must be JSONifiable
        allLatestValues:(prop:any, setting:any)=>{ //return arrays of hte latest values on an object e.g. real time data streams. More efficient would be typedarrays or something
            let result = undefined;

            if(Array.isArray(prop)) {
                if(prop.length !== setting.lastRead) {
                    result = prop.slice(setting.lastRead);
                    setting.lastRead = prop.length;
                }
            }
            else if (typeof prop === 'object') {
                result = {};
                for(const p in prop) {
                    if(Array.isArray(prop[p])) {
                        if(typeof setting === 'number') setting = {[p]:{lastRead:undefined}}; //convert to an object for the sub-object keys
                        else if(!setting[p]) setting[p] = {lastRead:undefined};
                        
                        if(prop[p].length !== setting[p].lastRead) {
                            result[p] = prop[p].slice(setting[p].lastRead);
                            setting[p].lastRead = prop[p].length;
                        }
                    }
                    else {
                        if(typeof setting === 'number') setting = {[p]:{lastRead:undefined}}; //convert to an object for the sub-object keys
                        else if(!setting[p]) setting[p] = {lastRead:undefined};

                        if(setting[p].lastRead !== prop[p]) {
                            result[p] = prop[p];
                            setting[p].lastRead = prop[p];
                        }
                    }
                }
                if(Object.keys(result).length === 0) result = undefined;
            }
            else { 
                if(setting.lastRead !== prop) {
                    result = prop;
                    setting.lastRead = prop;
                } 
            }

            return result;

            
        },
        latestValue:(prop:any,setting:any)=>{
            let result = undefined;
            if(Array.isArray(prop)) {
                if(prop.length !== setting.lastRead) {
                    result = prop[prop.length-1];
                    setting.lastRead = prop.length;
                }
            }
            else if (typeof prop === 'object') {
                result = {};
                for(const p in prop) {
                    if(Array.isArray(prop[p])) {
                        if(typeof setting === 'number') setting = {[p]:{lastRead:undefined}}; //convert to an object for the sub-object keys
                        else if(!setting[p]) setting[p] = {lastRead:undefined};
                        
                        if(prop[p].length !== setting[p].lastRead) {
                            result[p] = prop[p][prop[p].length-1];
                            setting[p].lastRead = prop[p].length;
                        }
                    }
                    else {
                        if(typeof setting === 'number') setting = {[p]:{lastRead:undefined}}; //convert to an object for the sub-object keys
                        else if(!setting[p]) setting[p] = {lastRead:undefined};

                        if(setting[p].lastRead !== prop[p]) {
                            result[p] = prop[p];
                            setting[p].lastRead = prop[p];
                        }
                    }
                }
            }
            else { 
                if(setting.lastRead !== prop) {
                    result = prop;
                    setting.lastRead = prop;
                } 
            }

            return result;
        },
    };

	setStreamFunc = (
        name:string,
        key:string,
        callback:0|1|Function=this.streamFunctions.allLatestValues) => {
		if(!this.streamSettings[name].settings[key]) 
			this.streamSettings[name].settings[key] = {lastRead:0};
		
		if(callback === this.STREAMLATEST) 
			this.streamSettings[name].settings[key].callback = this.streamFunctions.latestValue; //stream the latest value 
		else if(callback === this.STREAMALLLATEST) 
			this.streamSettings[name].settings[key].callback = this.streamFunctions.allLatestValues; //stream all of the latest buffered data
		else if (typeof callback === 'string') 
			this.streamSettings[name].settings[key].callback = this.streamFunctions[callback]; //indexed functions
		else if (typeof callback === 'function')
			this.streamSettings[name].settings[key].callback = callback; //custom function

		if(!this.streamSettings[name].settings[key].callback) this.streamSettings[name].settings[key].callback = this.streamFunctions.allLatestValues; //default
		
	}

	addStreamFunc = (name,callback=(data)=>{}) => {
		this.streamFunctions[name] = callback;
	}

				
	// 		object:{key:[1,2,3],key2:0,key3:'abc'}, 		// Object we are buffering data from
	//		settings:{
	//      	callback:0, 	// Default data streaming mode for all keys
	//			keys:['key','key2'], 	// Keys of the object we want to buffer into the stream
	// 			key:{
	//				callback:0 //specific modes for specific keys or can be custom functions
	// 				lastRead:0,	
	//			} //just dont name an object key 'keys' :P
	//		}
	setStream = (
		object={},   //the object you want to watch
		settings: {
			keys?: string[]
			callback?: Function
		}={}, //settings object to specify how data is pulled from the object keys
		streamName=`stream${Math.floor(Math.random()*10000000000)}` //used to remove or modify the stream by name later
	) => {

		///stream all of the keys from the object if none specified
		if(settings.keys) { 
			if(settings.keys.length === 0) {
				let k = Object.keys(object);
				if(k.length > 0) {
					settings.keys = Array.from(k);
				}
			}
		} else {
			settings.keys = Array.from(Object.keys(object));
		}

		this.streamSettings[streamName] = {
			object,
			settings
		};

		// if(!settings.callback) settings.callback = this.STREAMALLLATEST;

		settings.keys.forEach((prop) => {
			if(settings[prop]?.callback)
				this.setStreamFunc(streamName,prop,settings[prop].callback);
			else
				this.setStreamFunc(streamName,prop,settings.callback);
		});

		return this.streamSettings[streamName];

	}

	//can remove a whole stream or just a key from a stream if supplied
	removeStream = (streamName,key) => {
		if(streamName && !key) delete this.streamSettings[streamName];
		else if (key) {
			let idx = this.streamSettings[streamName].settings.keys.indexOf(key);
			if(idx > -1) 
				this.streamSettings[streamName].settings.keys.splice(idx,1);
			if(this.streamSettings[streamName].settings[key]) 
				delete this.streamSettings[streamName].settings[key];
		}
	}

	//can update a stream object by object assignment (if you don't have a direct reference)
	updateStreamData = (streamName, data={}) => {
		if(this.streamSettings[streamName]) {
			Object.assign(this.streamSettings[streamName].object,data);
			return this.streamSettings[streamName].object;
		}
		return undefined;
	} 

    streamLoop = (
        connections?:{[key:string]:{[key:string]:any}}, //e.g. {wss:{'socket1':socketinfo}} //provide list of objects associating connection types and active connection info objects
        channel?:string
    ) => {
        let updateObj = {};

        for(const prop in this.streamSettings) {
            this.streamSettings[prop].settings.keys.forEach((key) => {
                if(this.streamSettings[prop].settings[key]) {
                    let data = this.streamSettings[prop].settings[key].callback(
                        this.streamSettings[prop].object[key],
                        this.streamSettings[prop].settings[key]
                    );
                    if(data !== undefined) updateObj[key] = data; //overlapping props will be overwritten (e.g. duplicated controller inputs)
                }
            });
        }

        if(connections) {
            this.sendAll(updateObj,connections,channel);
        }

        return updateObj; //if no connection endpoints specified, you can otherwise subscribe to state for the streamLoop
        
        //setTimeout(()=>{this.streamLoop()},this.delay);
		
	}

    receive = (
        message:any|ServiceMessage, 
        service:Protocol|string, 
        ...args:any[]
    ) => {
        if(service) for(const key in this.services) {
            if(key === service || this.services[key].name === service) {
                return this.services[key].receive(message, ...args);
            }
        }
        return this.service.receive(message, ...args); //graph call
    }

    transmit = (
        message:any|ServiceMessage, 
        service:Protocol|string, 
        ...args:any[]
    ) => {
        if(service) for(const key in this.services) {
            if(key === service || this.services[key].name === service) {
                return this.services[key].transmit(message, ...args);
            }
        }
        return this.service.transmit(message, ...args); //graph call
    }

    defaultRoutes:Routes = {
        getEndpointInfo:this.getEndpointInfo,
        pipeOnce:this.pipeOnce,
        pipeFastest:this.pipeFastest,
        setStream:this.setStream,
        removeStream:this.removeStream,
        updateStreamData:this.updateStreamData,
        addStreamFunc:this.addStreamFunc,
        setStreamFunc:this.setStreamFunc,
        sendAll:this.sendAll,
        streamLoop:{
            operator:this.streamLoop,
            loop:10
        }
    }
}