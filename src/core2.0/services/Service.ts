import { AcyclicGraph, Graph, GraphProperties, OperatorType, stringifyWithCircularRefs } from "../Graph";

/**
 * 
 * A service extends acyclic graph to enhance networking operations and aggregate for our microservices
 * 
 */

export type RouteProp = { //these are just multiple methods you can call on a route/node tag kind of like http requests but really it applies to any function you want to add to a route object if you specify that method even beyond these http themed names :D
    get?:{ 
        object:any,
        transform:(...args:any)=>any
    }|((...args:any)=>any|void),
    post?:OperatorType|((...args)=>any|void), 
    put?:(...args:any)=>any|void,
    head?:(...args:any)=>any|void,
    delete?:(...args:any)=>any|void,
    patch?:(...args:any)=>any|void,
    options?:(...args:any)=>any|void,
    connect?:(...args:any)=>any|void,
    trace?:(...args:any)=>any|void,
    aliases?:string[] 
} & GraphProperties


export type Routes = { //same as the tree in the base acyclic graph but adds aliases and RouteProps handling
    [key:string]:
        Graph |
        GraphProperties |
        OperatorType |
        ((...args)=>any|void) |
        { aliases?:string[] } & GraphProperties |
        RouteProp
}

export type ServiceMessage = {
    route:string,  //the function/node to execute
    args?:any, //route args or data depending on what we're handling
    method?:string, //can specify get, post, etc. on http requests or on multiplexed routes using the RouteProp format
    node?:string|Graph, //alt tag for routes
    origin?:string|Graph|AcyclicGraph|Service,
    [key:string]:any //it's an object so do whatever, any messages meant for web protocols need to be stringified or buffered
}


export class Service extends AcyclicGraph {

    //routes denote paths and properties callable across interfaces and inherited by parent services (adding the service name in the 
    // front of the route like 'http/createServer'.
    routes:Routes={}
    firstLoad = true;
    name:string=`service${Math.floor(Math.random()*100000000000000)}`;
    keepState:boolean = true; //routes that don't trigger the graph on receive can still set state

    constructor(routes?:Routes, name?:string) {
        super(undefined,name);
        if(name) this.name = name;
        if(routes) this.load(routes); //now process the routes for the acyclic graph to load them as graph nodes :-D
    }

    
    load = (routes?:Service|Routes|any) => {    
        if(!routes && !this.firstLoad) return;
        //console.log(this.routes);
        let service;
        if(!(routes instanceof Service) && (routes as any)?.name) { //class prototype
            service = new routes();
            service.load();
            routes = service.routes;
        } //we can instantiate a class and load the routes. Routes should run just fine referencing the classes' internal data structures without those being garbage collected.
        else if (routes instanceof Service) { //class instance
            service = routes;
            routes = routes.routes; //or pull routes from an existing class
        }
        if(service instanceof Service) {     
            //the routes provided from a service will add the route name in front of the route so like 'name/route' to minimize conflicts, 
            //incl making generic service routes accessible per service. The services are still independently usable while the loader 
            // service provides routes to the other services
            routes = Object.assign({},routes); //copy props to a new object so we don't delete the original service routes
            for(const prop in routes) { 
                let route = routes[prop];
                delete routes[prop]; 
                routes[service.name+'/'+prop] = route;  //store the routes in the loaded service under aliases including the service name
            }
        }
        
        if(this.firstLoad) {
            let rts = Object.assign({},this.defaultRoutes); //load all default routes
            if(routes) {
                Object.assign(rts,this.routes); //then load declared routesin this object
                routes = Object.assign(rts,routes); //then load new routes in constructor
            } else routes = Object.assign(rts,this.routes); //then load declared routesin this object
            
            //console.log(this.name,this.routes,routes);
            this.firstLoad = false;
        }

        for(const route in routes) {
            if(typeof routes[route] === 'object') {
                let r = routes[route] as RouteProp;
                for(const prop in r) {
                    r[prop.toLowerCase()] = r[prop]; //ensure existence of lower case copies of route props for our method handler
                }
                if(r.get) { //maybe all of the http method mimics should get some shared extra specifications? 
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
                    routes[route].operator = r.post;
                } else if (!r.operator && typeof r.get == 'function') {
                    routes[route].operator = r.get;
                }
                if(this.routes[route]) {
                    if(typeof this.routes[route] === 'object') Object.assign(this.routes[route],routes[route]);
                    else this.routes[route] = routes[route];
                } else this.routes[route] = routes[route];
            } else if(this.routes[route]) {
                if(typeof this.routes[route] === 'object') Object.assign(this.routes[route],routes[route]);
                else this.routes[route] = routes[route];
            } else this.routes[route] = routes[route];
        }

        this.setTree(this.routes);

        for(const prop in this.routes) { //now set the aliases on the routes, the aliases share the same node otherwise
            if((this.routes[prop] as any)?.aliases) {
                let aliases = (this.routes[prop] as any).aliases;
                aliases.forEach((a:string) => {
                    if(service) routes[service.name+'/'+a] = this.routes[prop]; //we're just gonna copy the routes to the aliases for simplicity 
                    else routes[a] = this.routes[prop];
                });

            }
            
        }

        //console.log(this.name,this.routes);
        return this.routes;
    }

    unload = (routes:Service|Routes|any=this.routes) => { //tries to delete the nodes along with the routes, incl stopping any looping nodes
        if(!routes) return; 
        let service;
        if(!(routes instanceof Service) && typeof routes === 'function') {
            service = new Service();
            routes = service.routes;
        } //we can instantiate a class and load the routes. Routes should run just fine referencing the classes' internal data structures without those being garbage collected.
        else if (routes instanceof Service) {
            routes = routes.routes; //or pull routes from an existing class
        }
        for(const r in routes) {
            delete this.routes[r]; //this is its own object separate from the node tree map
            if(this.nodes.get(r)) this.remove(r);
        }

        return this.routes;
    }

    handleMethod = (
        route:string, 
        method:string, 
        args:any, 
        origin?:string|Graph|AcyclicGraph|Service
    ) => { //For handling RouteProp or other routes with multiple methods 
        let m = method.toLowerCase(); //lower case is enforced in the route keys
        if(m === 'get' && ((this.routes[route] as RouteProp)?.get as any)?.transform instanceof Function) { //make alt formats for specific methods and execute them a certain way
            if(Array.isArray(args)) return ((this.routes[route] as RouteProp).get as any).transform(...args);
            else return ((this.routes[route] as RouteProp).get as any).transform(args);
        }
        if(this.routes[route]?.[m]) {
            if(!(this.routes[route][m] instanceof Function)) {
                return this.routes[route][m]; //could just be a stored local variable we are returning like a string or object
            }// else if(origin) { return this.routes[route][m](origin,data); }//put origin in first position
            else return this.routes[route][m](args); 
            
        }//these could be any function or property call
        else return this.handleServiceMessage({route,args,method,origin}) //process normally if the method doesn't return
    }

    handleServiceMessage(message:ServiceMessage) {
        let call; if(message.route) call = message.route; else if (message.node) call = message.node;
        if(call) {
            if(message.origin) { //origin will be second argument in this case
                if(Array.isArray(message.args)) return this._run(call,message.origin,...message.args);
                else return this._run(call,message.origin,message.args);
            } else {
                if(Array.isArray(message.args)) return this.run(call,...message.args);
                else return this.run(call,message.args);
            }
        } else return message;
    }

    handleGraphCall(route:string|Graph, args:any, origin?:string|Graph|AcyclicGraph) {
        if(!route) return args;
        if((args as ServiceMessage)?.args) {
            this.handleServiceMessage(args);
        }
        else if(origin) {
            if(Array.isArray(args)) return this._run(route, origin, ...args);
            else return this._run(route, origin, args);
        }
        else if(Array.isArray(args)) return this.run(route,...args);
        else return this.run(route, args);
    }

    //transmit http requests, socket messages, webrtc, osc, etc. with this customizable callback
    transmit:(...args)=>any|void = (
        ...args:[ServiceMessage|any,...any[]]|any[]
    ) => {
        if(args[0] instanceof Object) {
            if(Object.getPrototypeOf(args[0].method) === String.prototype) { //run a route method directly, results not linked to graph
                return this.handleMethod(args[0].route, args[0].method, args[0].args);
            } else if(Object.getPrototypeOf(args[0].route) === String.prototype) {
                return this.handleServiceMessage(args[0]);
            } else if ((Object.getPrototypeOf(args[0].node) === String.prototype || args[0].node instanceof Graph)) {
                return this.handleGraphCall(args[0].node, args[0].args, args[0].origin);
            } else if(this.keepState) {    
                if(args[0].route)
                    this.setState({[args[0].route]:args[0].args});
                if(args[0].node)
                    this.setState({[args[0].node]:args[0].args});
            }
        } else return args;
    } 

    //process http requests, socket messages, webrtc, osc, etc. with this customizable callback. This default still works in some scenarios
    receive:(...args)=>any|void = (
        ...args:[ServiceMessage|any,...any[]]|any[] //generalized args for customizing, it looks weird I know
    ) => {
        if(Object.getPrototypeOf(args[0]) === String.prototype) {
            let substr = args[0].substring(0,8);
            if(substr.includes('{') || substr.includes('[')) {    
                if(substr.includes('\\')) args[0] = args[0].replace(/\\/g,"");
                if(args[0][0] === '"') { args[0] = args[0].substring(1,args[0].length-1)};
                //console.log(args[0])
                args[0] = JSON.parse(args[0]); //parse stringified args
            }
        }

        if(args[0] instanceof Object) {
            if(Object.getPrototypeOf(args[0].method) === String.prototype) { //run a route method directly, results not linked to graph
                return this.handleMethod(args[0].route, args[0].method, args[0].args);
            } else if(Object.getPrototypeOf(args[0].route) === String.prototype) {
                return this.handleServiceMessage(args[0]);
            } else if ((Object.getPrototypeOf(args[0].node) === String.prototype || args[0].node instanceof Graph)) {
                return this.handleGraphCall(args[0].node, args[0].args, args[0].origin);
            } else if(this.keepState) {    
                if(args[0].route)
                    this.setState({[args[0].route]:args[0].args});
                if(args[0].node)
                    this.setState({[args[0].node]:args[0].args});
            }
        } else return args;
    }//these are fairly identical on the base template plus json parsing on the receive end

    //we may want to auto pipe outputs from a node through our frontend<-->backend service protocol
    pipe = (
        source:Graph|string, 
        destination:string, 
        endpoint?:string|any, //the address or websocket etc. of the endpoint on the service we're using, this is different e.g. for sockets or http
        origin?:string, 
        method?:string, 
        callback?:(res:any)=>any|void
    ) => {
        if(source instanceof Graph) {
            if(callback) return source.subscribe((res)=>{
                let mod = callback(res); //either a modifier or a void function to do a thing before transmitting the data
                if(mod !== undefined) this.transmit({route:destination, args:mod, origin, method});
                else this.transmit({route:destination, args:res, origin, method},endpoint);
            })
            else return this.subscribe(source,(res)=>{ this.transmit({route:destination, args:res, origin, method},endpoint); });
        }
        else if(typeof source === 'string') 
            return this.subscribe(source,(res)=>{ 
                this.transmit({route:destination, args:res, origin, method},endpoint); 
            });
    }

    //one-shot callback pipe e.g. to return results back through an endpoint
    pipeOnce = (
        source:Graph|string, 
        destination:string, 
        endpoint?:string|any, //the address or websocket etc. of the endpoint on the service we're using, this is different e.g. for sockets or http
        origin?:string, 
        method?:string, 
        callback?:(res:any)=>any|void
    ) => {
        if(source instanceof Graph) {
            if(callback) return source.state.subscribeTriggerOnce(source.tag,(res)=>{
                let mod = callback(res); //either a modifier or a void function to do a thing before transmitting the data
                if(mod !== undefined) this.transmit({route:destination, args:mod, origin, method});
                else this.transmit({route:destination, args:res, origin, method},endpoint);
            })
            else return this.state.subscribeTriggerOnce(source.tag,(res)=>{ this.transmit({route:destination, args:res, origin, method},endpoint); });
        }
        else if(typeof source === 'string') 
            return this.state.subscribeTriggerOnce(source,(res)=>{ 
                this.transmit({route:destination, args:res, origin, method},endpoint); 
            });
    }

    terminate = (...args:any) => {
       this.nodes.forEach((n) => {
           n.stopNode(); //stops any loops
       });
    }
    
    isTypedArray(x:any) { //https://stackoverflow.com/a/40319428
        return (ArrayBuffer.isView(x) && Object.prototype.toString.call(x) !== "[object DataView]");
    }

    defaultRoutes:Routes = { //declared at the end so everything on this class is defined to pass through as node props
        '/':{ //if no start page provided to HTTPbackend this will print instead on GET
            get:()=>{ //if only a get or post are defined the will become the operator for making graph calls
                return this.print();
            },
            aliases:['']
        } as RouteProp,
        ping:()=>{ //define functions, graph props, etc. All methods defined in a route object are callable
            console.log('ping');//this.transmit('pong');
            return 'pong';
        },
        echo:(...args:any)=>{ //this transmits input arguments, so to echo on a specific service do e.g. 'wss/echo'
            this.transmit(...args);
            return args;
        },
        log:{ //console.log/info
            post:(...args:any)=>{
                console.log("Log: ",...args);
            },
            aliases:['info']
        } as RouteProp,
        error:(message:string)=>{ //console.error
            let er = new Error(message);
            console.error(message);
            return er;
        },
        state:(key?:string) => { //get state values
            if(key) {
                return this.state.data[key];
            }
            else return this.state.data;
        },
        printState:(key?:string) => {
            if(key) {
                return stringifyWithCircularRefs(this.state.data[key]);
            } else return stringifyWithCircularRefs(this.state.data);
        },
        //bunch of methods generically available on routes for each service e.g. 'http/run' :-O
        transmit:this.transmit,
        receive:this.receive,
        load:this.load,
        unload:this.unload,
        pipe:this.pipe,
        terminate:this.terminate,
        run:this.run,
        _run:this._run,
        subscribe:this.subscribe,
        unsubscribe:this.unsubscribe,
        stopNode:this.stopNode,
        get:this.get,
        add:this.add,
        remove:this.remove,
        setTree:this.setTree,
        print:this.print,
        reconstruct:this.reconstruct,
        handleMethod:this.handleMethod,
        handleServiceMessage:this.handleServiceMessage,
        handleGraphCall:this.handleGraphCall
    }

}