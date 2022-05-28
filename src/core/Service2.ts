import { AcyclicGraph, Graph, GraphProperties, OperatorType } from "./Graph";

/**
 * 
 * A service extends acyclic graph to enhance networking operations and aggregate for our microservices
 * 
 */

type RouteProp = { //these are just multiple operations you can apply to call a route/node tag kind of like http requests
    get?:{
        object:any,
        transform:(...args)=>any
    }|((...args)=>any|void),
    post?:OperatorType|((...args)=>any|void),
    put?:(...args)=>any|void,
    head?:(...args)=>any|void,
    delete?:(...args)=>any|void,
    patch?:(...args)=>any|void,
    options?:(...args)=>any|void,
    connect?:(...args)=>any|void,
    trace?:(...args)=>any|void,
    aliases?:string[] 
} & GraphProperties


type Routes = {
    [key:string]:
            Graph |
            GraphProperties |
            OperatorType |
            ((...args)=>any|void) |
            { aliases:string[] } & GraphProperties |
            RouteProp
}

export class Service extends AcyclicGraph {

    name:string=`service${Math.floor(Math.random()*100000000000000)}`;
    protocol:'http'|'socket'|'webrtc'|'osc'|string|undefined;
    routes:Routes = {
        '/':()=>{
            return this.getTree();
        },
        'ping':()=>{
            return 'pong';
        },
        'echo':(...args)=>{
            return args;
        }
    }

    constructor(routes:Routes) {
        super(routes,`Router${Math.floor(Math.random()*1000000000000000)}`);
        if(routes) this.routes = routes;

        this.load(routes);
    }

    
    load(routes:Routes) {     
        if(!routes) return;
        Object.assign(this.routes,routes);   
        if(this.routes) {
            let routes = Object.assign({},this.routes);
            for(const route in this.routes) {
                let r = this.routes[route] as RouteProp;
                if(r.get) {
                    if(typeof r.get == 'object') {
                        
                    }
                }
                if(r.post) {}
                if(r.delete) {}
                if(r.put) {}
                if(r.head) {}
                if(r.patch) {}
                if(r.options) {}
                if(r.connect) {}
                if(r.trace) {}

                if(r.post && !r.operator) {
                    routes[route] = r.post;
                } 

            }

            this.setTree(routes);
        }
    }

    //these are handles to communicate between routers
    transmit(message, method?) {
        //send http request or
        //send socket message
        // or webrtc, osc, etc.
    }

    receive(
        message:{route:string,data:any,method?:string}, //message from server e.g. onRequest for an http server
        node?:string|Graph, //can directly pipe to nodes if we know htem else the message object should have the data
        method?:string
    ) {
        //process http requests, socket messages, webrtc, osc, etc.
        if(node) this.run(node,message); 
        else this.run(message.route,message.data);
    }

    pipe(node:Graph|string,callback:(res)=>any|void) {
        if(node instanceof Graph) {
            if(callback) node.subscribe((res)=>{
                let mod = callback(res);
                this.transmit(mod);
            })
            else this.subscribe(node,(res)=>{ this.transmit(res); });
        }
    }
    
}