//The worker thread. 
//This can run all of the web interfaces as well as serial interfaces. 
//The web interfaces need their own env setup e.g. mongoose or express instances
//if on frontend, the workers can't run backend env-required APIs like mongodb or http/socket/event routers
//if on backend, the workers can't run DOM-related or rendering APIs like canvas or threejs

import SessionsService from"../sessions/sessions.service";
import UnsafeService from "../unsafe/unsafe.service";
import DatabaseService from "../database/database.service";
//can import all

let services = {
    SessionsService ,
    DatabaseService ,
    UnsafeService
};

import { Router } from "../../core/Router";
import { Service } from "../../core/Service";
import { randomId } from "../../common/id.utils";
import { parseFunctionFromText, } from "../../common/parse.utils";

const DONOTSEND = 'DONOTSEND';

//check if in node ENV (enables backend)
// let NODE = false;
try {
    if(typeof process === 'object') { //indicates node
        // NODE = true;
        const WebsocketBackend = require("src/backend/websocket/websocket.service").default;
        const HTTPBackend = require('src/backend/http/http.service').default;
        const EventsService = require('src/backend/http/events.service').default;
        const OSCBackend = require('src/backend/osc/osc.service').default;
        const WebRTCBackend = require('src/backend/webrtc/webrtc.backend').default;
        services['WebsocketBackend'] = WebsocketBackend;
        services['HTTPBackend'] = HTTPBackend;
        services['EventsService'] = EventsService;
        services['OSCBackend'] = OSCBackend;
        services['WebRTCBackend'] = WebRTCBackend;
    }
} catch (err) {}




export class ServerWorker extends Service {
    name:string='worker';
    id=randomId('worker');
    Router:Router;
    responses=[];
    httpServer:any;

    routes = [
        {
            route:'workerPost',
            post:(self,graphOrigin,router,origin,...args)=>{
              console.log('worker message received!', args, origin);
              return;
            }
        },
        {
            route:'addservice',
            post:(self,graphOrigin,router,origin,...args)=>{
                //provide service name and setup arguments (e.g. duplicating server details etc)
                if(services[args[0]]) {
                    let service;
                    //TODO: test mongodb in thread

                    //add http service and set httpServer
                    if(args[0] === 'WebsocketBackend')
                        if(self.httpServer) service = new services[args[0]](self.httpServer);
                    else {
                        service = new services[args[0]](this.Router,...args.slice(1)); //some constructors take the router and other args so add them
                    }

                    if(service) this.Router.load(service);
                    return true;
                }
                return;
            }
        },
        {
            route:'removeservice',
            post:(self,graphOrigin,router,origin,...args)=>{
                return;
            }
        },
        { //MessageChannel port, it just runs the whole callback system to keep it pain-free, while allowing messages from other workers
            route: 'addport', 
            post: (self,graphOrigin,router,origin,...args) => { //args[0] = eventName, args[1] = case, only fires event if from specific same origin
                let port = args[1]; //messageport 
                this[`${origin}`] = port; //message ports will have the origin marked as the worker id 
                port.onmessage = onmessage; //port messages get processed generically, an argument will denote they are from a worker 
                return true;
            }
        },
        {
            route:'postMessagePort', //send a message to another worker via a message port
            post:(self,graphOrigin,router,origin,...args) => {
                if(!args[1]){
                    if(this[`${origin}`]) 
                        this[`${origin}`].postMessage(JSON.stringify(args[0]),undefined,args[2]); //0 is whatever, 2 is transfer array
                } else {
                    if(this[`${args[1]}`])
                        this[`${args[1]}`].postMessage(JSON.stringify(args[0]),undefined,args[2]);
                }
                return;
            }
        },
        {
            route:'postMessage', //post back to main thread
            post:(self,graphOrigin,router,origin,...args)=>{
                postMessage(args[0],undefined,args[1]); //0 is args, 1 is transfer array
                return;
            }
        },
        {
            route:'addcallback',
            post:(self,graphOrigin,router,origin,...args)=>{
                if(!args[0] && !args[1]) return;
                let func = parseFunctionFromText(args[1]);
                if(func) this.addCallback(args[0],func);
                return true;
            }
        },
        {
            route:'removecallback',
            post:(self,graphOrigin,router,origin,...args)=>{
                if(args[0]) this.removeCallback(args[0]);
                return true;
            }
        },
        {
            route:'run',
            post:(self,graphOrigin,router,origin,...args)=>{
                let c = this.responses.find((o) => {
                    if(o.name === args[0]) {
                        return true;
                    }
                });
                if(c && args[1]) return c.callback(args[1]); 
                return;
            }
        }
    ]

    constructor(Router?:Router) {
        super(Router)
    }

        //automated responses
    addCallback(name='',callback=(result)=>{}) {
        if(name.length > 0 && !this.responses.find((o)=>{if(typeof o === 'object') {if(o.name === name) return true;} return})) {
            this.responses.push({name:name,callback:callback});
        }
    }
    
    //remove automated response by name
    removeCallback(nameOrIdx='') {
        if(nameOrIdx.length > 0) {
            let idx;
            if(this.responses.find((o,i)=>{if(typeof o === 'object') {if(o.name === nameOrIdx) { idx = i; return true;}}  return})) {
            if (idx) this.responses.splice(idx,1);
            }
        } else if (typeof nameOrIdx === 'number') {
            this.responses.splice(nameOrIdx,1);
        }
    }
}

let router = new Router({debug:false});
let worker = new ServerWorker();
router.load(worker);

//message from main thread or port
self.onmessage = async (event) => {

    //do the thing with the router
    if(event.data.workerId) {
        worker.id = event.data.workerId;
        if(event.data.port) worker[event.data.origin] = event.data.port; //set the message channel port by the origin worker id to send return outputs to that thread (incl main thread)
    }
    else if(event.data) {
        let result = await worker.notify(event.data,undefined,event.data.origin);
        if(result !== DONOTSEND) { //pass result back
            let output = {output:result, route:event.data.route, id:worker.id, origin:event.data.origin, callbackId:event.data.callbackId}
            let transfer = undefined; 
            if(result.__proto__?.__proto__?.constructor.name === 'TypedArray') transfer = [result];
            else if(typeof result === 'object') {
                for(const key in result) {
                    if(result[key].__proto__?.__proto__?.constructor.name === 'TypedArray') { 
                        if(!transfer) transfer = [result[key]]; 
                        else transfer.push(result[key]);
                    }
                }
            }
            if(worker[event.data.origin]) worker[event.data.origin].postMessage(output,transfer);
            else self.postMessage(output,transfer);
        }
    }
    //if origin is a message port, pass through the port
    //if origin is main thread, pass to main thread
    //else pass to respective web apis

    // Run worker response callbacks
    worker.responses.forEach((foo,_) => {
        if(typeof foo === 'object') foo.callback(event.data);
        else if (typeof foo === 'function') foo(event.data);
    });
    
}

export default self;