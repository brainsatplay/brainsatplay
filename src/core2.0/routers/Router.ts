import { Graph } from "../Graph";
import { Routes, Service, ServiceMessage } from '../services/Service';

//should match existing service names, services have matching frontend and backend names as well
export type Protocol = 'http'|'wss'|'sse'|'webrtc'|'osc'|'worker'|'ble'|'unsafe'|'struct'|'fs'|'lsl'|'hdf5'|'unity'; //??? could make alternates too like express etc. services, everything is pluggable. 


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

    services:{[key:string]:Service} = {};

    constructor(services:(Service|Routes)[]|{[key:string]:Service|Routes}|any[]) { //preferably pass services but you can pass route objects in too to just add more base routes
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
        if(!(service instanceof Service) && (service as any)?.name)    
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
        const radio = this.services[transmitter];
        if(radio) {
            if(callback) {
                return this.subscribe(source,(res) => {
                    let mod = callback(res);
                    if(mod) res = mod;
                    radio.transmit({route:destination,args:res,origin,method});
                });

            }
            else return this.subscribe(source,(res) => {
                radio.transmit({route:destination,args:res,origin,method});
            });
        }
    }
    
    receive = (message:any|ServiceMessage, service:Protocol|string, ...args) => {
        if(service) for(const key in this.services) {
            if(key === service || this.services[key].name === service) {
                return this.services[key].receive(message, ...args);
            }
        }
        return this.service.receive(message, ...args); //graph call
    }

    transmit = (message:any|ServiceMessage, service:Protocol|string, ...args) => {
        if(service) for(const key in this.services) {
            if(key === service || this.services[key].name === service) {
                return this.services[key].transmit(message, ...args);
            }
        }
        return this.service.transmit(message, ...args); //graph call
    }
}