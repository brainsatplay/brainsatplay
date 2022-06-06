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
        if(this.routes) 
            if(Object.keys(this.routes).length > 0)
                this.load(this.routes);
        if(Array.isArray(services)){
            services.forEach(s => this.load(s));
        }
        else if (typeof services === 'object') {
            Object.keys(services).forEach(s => this.load(services[s]));
        }
        
        //reference some methods on the service if undefined
        if(!this.run) {
            this.run = this.service.run;
            this._run = this.service._run;
            this.add = this.service.add;
            this.remove = this.service.remove;
            this.subscribe = this.service.subscribe;
            this.unsubscribe = this.service.unsubscribe;
            this.get = this.service.get;
            this.reconstruct = this.service.reconstruct;
            this.setState = this.service.setState;
            this.state = this.service.state; //share the shared state with router too why not
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
}