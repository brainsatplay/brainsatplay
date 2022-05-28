import { state } from "./Graph";
import { Service } from "./Service2";


export type Protocol = 'http'|'socket'|'webrtc'|'osc'|string|undefined;

type AvailableServices = {
    [key:string]:{
        protocol:Protocol, //communication protocol we want to use
        service: Service //the service which will aggregate the message if the protocol is specified
    }
}

//handle subscriptions
//match i/o protocols to correct services

export class Router {

    state = state; //share the shared state with router too

    services:AvailableServices
    constructor(services:Service[]|AvailableServices) {
        if(Array.isArray(services)){
            services.forEach(s => this.load(s));
        }
        else if (typeof services === 'object') this.services = services;
    }

    load(service:Service) {
        this.services[service.name] = {
            protocol:service.protocol,
            service
        };
    }

    subscribe( //a state trigger can be set to transmit on a service protocol, callbacks can be used to modify results before sending (return something in the callback!!) 
        tag:string, //the output we are subscribing to
        destination?:Protocol|string, //the protocol or service to transmit the result with
        callback?:((res)=>any) //return a modified result before transmitting
    ) {
        if(destination) {
            let dest;
            for(const key in this.services) {
                if(key === destination || this.services[key].protocol === destination) {
                    dest = this.services[key];
                    break;
                }
            }
            if(!dest) return false;
            let cb;
            if(callback) {
                cb = (res) => {
                    let mod = callback(res);
                    dest.transmit(mod);
                }
            } else cb = (res) => {dest.transmit(res);};
            this.state.subscribeTrigger(tag,cb);
        }
        else if(callback) return this.state.subscribeTrigger(tag,callback);
    }

    unsubscribe(
        tag,
        sub
    ) {
        return this.state.unsubscribeTrigger(tag,sub);
    }

    inbound(message:any, destination:Protocol|string, method?:string) {
        for(const key in this.services) {
            if(key === destination || this.services[key].protocol === destination) {
                this.services[key].service.receive(message, method);
                break;
            }
        }
    }

    outbound(message:any, destination:Protocol|string, method?:string) {
        for(const key in this.services) {
            if(key === destination || this.services[key].protocol === destination) {
                this.services[key].service.transmit(message,method);
                break;
            }
        }
    }
}