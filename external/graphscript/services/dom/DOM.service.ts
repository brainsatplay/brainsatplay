import { DOMElement } from "./DOMElement"; //https://github.com/joshbrew/DOMElement <---- this is the special sauce
import { Graph, GraphNode, GraphNodeProperties, OperatorType, stringifyWithCircularRefs } from '../../Graph';
import { RouteProp, Routes, Service, ServiceMessage, ServiceOptions } from "../Service";

import {CompleteOptions} from './types/general';
import {ElementOptions, ElementInfo, ElementProps} from './types/element';
import {DOMElementProps, ComponentOptions, DOMElementInfo} from './types/component';
import {CanvasElementProps, CanvasOptions, CanvasElementInfo} from './types/canvascomponent';

//alternative base service that additioanlly allows 'DOMRoutes' to be loaded which can tie in html and webcomponent blocks


export type DOMRouteProp = 
    (ElementProps & GraphNodeProperties) |
    (DOMElementProps & GraphNodeProperties) |
    (CanvasElementProps & GraphNodeProperties)

export type DOMRoutes = {
    [key:string]:
        GraphNode |
        GraphNodeProperties |
        Graph |
        OperatorType |
        ((...args)=>any|void) |
        { aliases?:string[] } & GraphNodeProperties |
        RouteProp | 
        DOMRouteProp
}


export class DOMService extends Graph {

    //routes denote paths and properties callable across interfaces and inherited by parent services (adding the service name in the 
    // front of the route like 'http/createServer'.
    routes:DOMRoutes={}
    loadDefaultRoutes = false; //load default routes?
    name:string=`dom${Math.floor(Math.random()*1000000000000000)}`;
    keepState:boolean = true; //routes that don't trigger the graph on receive can still set state
    parentNode:HTMLElement=document.body; //default parent elements for elements added

    constructor(options?:ServiceOptions,parentNode?:HTMLElement) {
            super(undefined,options.name,options.props);
            if('loadDefaultRoutes' in options) this.loadDefaultRoutes = options.loadDefaultRoutes;
            if(options.name) this.name = options.name;

            if(parentNode instanceof HTMLElement) this.parentNode = parentNode;
            else if(options.parentNode instanceof HTMLElement) this.parentNode = parentNode;
            
            if(Array.isArray(options.routes)) {
                options.routes.forEach((r) => {this.load(r);})
            }
            else if(options.routes) this.load(options.routes); //now process the routes for the acyclic graph to load them as graph nodes :-D
    }
    
    elements:{
        [key:string]:ElementInfo
    } = {}

    components:{
        [key:string]:DOMElementInfo|CanvasElementInfo
    } = {}

    templates:{ //pass these in as options for quicker iteration
        [key:string]:DOMElementProps|CanvasElementProps
    } = {}

    addElement=(
        options: ElementOptions,
        generateChildElementNodes=false      
    )=>{

        let elm:HTMLElement = this.createElement(options)

        let oncreate = options.oncreate;
        delete options.oncreate; //so it doesnt trigger on the node

        let node = new GraphNode({
            element:elm,   
            operator:(node,origin,props:{[key:string]:any})=>{ 
                if(typeof props === 'object') 
                    for(const key in props) { 
                        if(node.element) {
                            if(typeof node.element[key] === 'function' && typeof props[key] !== 'function')
                                { //attempt to execute a function with arguments
                                    if(Array.isArray(props[key]))
                                        node.element[key](...props[key]);
                                    else node.element[key](props[key]);
                                } 
                            else if (key === 'style') { Object.assign(node.element[key],props[key])}
                            else node.element[key] = props[key]; 
                        }
                    }
                    
                return props;
            },
            ...options
        },undefined,this);
        
        let divs:any[] = Array.from(elm.querySelectorAll('*'));
        if(generateChildElementNodes) { //convert all child divs to additional nodes
            divs = divs.map((d:HTMLElement,i) => this.addElement({element:d}));
        }

        this.elements[options.id] = {element:elm, node, parentNode: (options as CompleteOptions).parentNode, divs};

        if(options.onresize) {
            let onresize = options.onresize;
            options.onresize = (ev) => { onresize(ev, elm, this.elements[options.id]) };
            window.addEventListener('resize', options.onresize as EventListener);
        }

        
        if(!elm.parentNode) {
            setTimeout(()=>{ //slight delay on appendChild so the graph is up to date after other sync loading calls are finished
                if(typeof options.parentNode === 'object') options.parentNode.appendChild(elm);
                if(oncreate) oncreate(elm,this.elements[options.id]);
            },0.01);
        }


        return this.elements[options.id] as ElementInfo;
    }

    createElement = (options: ElementOptions) => {

        let elm: HTMLElement

        if(options.element) {
            if(typeof options.element === 'string') {
                elm = document.querySelector(options.element); //get first element by tag or id 
                if(!elm) elm = document.getElementById(options.element); 
            }
            else elm = options.element;
        }
        else if (options.tagName) elm = document.createElement(options.tagName);
        else if(options.id && document.getElementById(options.id)) elm = document.getElementById(options.id);

        if(!elm) return undefined;
        this.updateOptions(options, elm);

        return elm;
    }

    updateOptions = (options, element): CompleteOptions => {

        if(!options.id) options.id = `${options.tagName ?? 'element'}${Math.floor(Math.random()*1000000000000000)}`;

        if(!options.id && options.tag) options.id = options.tag;
        if(!options.tag && options.id) options.tag = options.id;
        if(!options.id) options.id = options.tagName;

        if(typeof options.parentNode === 'string') options.parentNode = document.getElementById(options.parentNode);
        if(!options.parentNode) {        
            if(!this.parentNode) this.parentNode = document.body;
            options.parentNode = this.parentNode;
        }
       
        element.id = options.id;
        if(options.style) Object.assign(element.style,options.style);
        if(options.innerHTML && element.innerHTML !== options.innerHTML) element.innerHTML = options.innerHTML;
        if(options.innerText && element.innerText !== options.innerText) element.innerText = options.innerText;
        if(options.attributes) Object.assign(element,options.attributes);
        return options;
    }

    //create an element that is tied to a specific node, multiple elements can aggregate
    // with the node
    addComponent=(
        options: ComponentOptions,
        generateChildElementNodes=true
    )=>{
        
        if(options.oncreate) {
            let oncreate = options.oncreate;
            (options.oncreate as any) = (self:DOMElement) => {
                oncreate(self, options as DOMElementInfo);
            }
        }
        if(options.onresize) {
            let onresize = options.onresize;
            (options.onresize as any) = (self:DOMElement) => {
                onresize(self, options as DOMElementInfo);
            }
        }
        if(options.ondelete) {
            let ondelete = options.ondelete;
            (options.ondelete as any) = (self:DOMElement) => {
                ondelete(self, options as DOMElementInfo);
            }
        }
        if(typeof options.renderonchanged === 'function') {
            let renderonchanged = options.renderonchanged;
            (options.renderonchanged as any) = (self:DOMElement) => {
                renderonchanged(self, options as DOMElementInfo);
            }
        }

        class CustomElement extends DOMElement {
            props = options.props;
            styles = options.styles;
            template = options.template as any;
            oncreate = options.oncreate;
            onresize = options.onresize;
            ondelete = options.ondelete;
            renderonchanged = options.renderonchanged as any;
        }

        delete options.oncreate; //so it doesn't trigger on the node

        if(!options.tagName) options.tagName = `custom-element${Math.random()*1000000000000000}`;

        CustomElement.addElement(options.tagName); 

        let elm = document.createElement(options.tagName);
        let completeOptions = this.updateOptions(options, elm) as DOMElementProps
        this.templates[completeOptions.id] = completeOptions;

        let divs:any[] = Array.from(elm.querySelectorAll('*'));
        if(generateChildElementNodes) { //convert all child divs to additional nodes
            divs = divs.map((d:HTMLElement) => this.addElement({element:d}));
        }
     
        let node = new GraphNode(
            {
                element:elm,   
                operator:(node,origin,props:{[key:string]:any})=>{ 
                    if(typeof props === 'object') 
                        for(const key in props) { 
                            if(node.element) {
                                if(typeof node.element[key] === 'function' && typeof props[key] !== 'function')
                                    { //attempt to execute a function with arguments
                                        if(Array.isArray(props[key]))
                                            node.element[key](...props[key]);
                                        else node.element[key](props[key]);
                                    } 
                                else node.element[key] = props[key]; 
                            }
                        }
                        
                    return props;
                },
                ...completeOptions
            },
            undefined,
            this
        );

        this.components[completeOptions.id] = {
            element:elm as any,
            class:CustomElement,
            node,
            divs,
            ...completeOptions
        };

                
        if(!elm.parentNode) {
            setTimeout(()=>{ //slight delay on appendChild so the graph is up to date after other sync tree/route loading calls are finished
                if(typeof options.parentNode === 'object') options.parentNode.appendChild(elm);
            },0.01);
        }

        return this.components[completeOptions.id] as DOMElementInfo;
    }

    //create a canvas with a draw loop that can respond to props
    addCanvasComponent=(
        options: CanvasOptions
    ) => {

        if(!options.canvas) {
            options.template = `<canvas `;
            if(options.width) options.template += `width="${options.width}"`;
            if(options.height) options.template += `height="${options.height}"`;
            options.template+=` ></canvas>`;
        } else options.template = options.canvas;
                
        if(options.oncreate) {
            let oncreate = options.oncreate;
            (options.oncreate as any) = (self:DOMElement) => {
                oncreate(self, options as any);
            }
        }
        if(options.onresize) {
            let onresize = options.onresize;
            (options.onresize as any) = (self:DOMElement) => {
                onresize(self, options as any);
            }
        }
        if(options.ondelete) {
            let ondelete = options.ondelete;
            (options.ondelete as any) = (self:DOMElement) => {
                ondelete(self, options as any);
            }
        }
        if(typeof options.renderonchanged === 'function') {
            let renderonchanged = options.renderonchanged;
            (options.renderonchanged as any) = (self:DOMElement) => {
                renderonchanged(self, options as any);
            }
        }

        
        class CustomElement extends DOMElement {
            props = options.props;
            styles = options.styles;
            template = options.template;
            oncreate = options.oncreate;
            onresize = options.onresize;
            ondelete = options.ondelete;
            renderonchanged = options.renderonchanged as any;
        }
        delete options.oncreate; //so it doesnt trigger on the node

        if(!options.tagName) options.tagName = `custom-element${Math.random()*1000000000000000}`;

        CustomElement.addElement(options.tagName);         
        let elm = document.createElement(options.tagName);
        const completeOptions = this.updateOptions(options, elm) as CanvasElementProps


        let animation = () => { //default animation
            if((this.components[completeOptions.id as string] as CanvasElementInfo)?.animating) {
                (this.components[completeOptions.id as string] as CanvasElementInfo).draw(this.components[completeOptions.id as string].element,this.components[completeOptions.id as string] as CanvasElementInfo);
                requestAnimationFrame(animation);
            }
        }

        this.templates[completeOptions.id] = completeOptions;
                
        let node = new GraphNode({
            element:elm,   
            operator:(node,origin,props:{[key:string]:any})=>{ 
                if(typeof props === 'object') 
                    for(const key in props) { 
                        if(node.element) {
                            if(typeof node.element[key] === 'function' && typeof props[key] !== 'function')
                                { //attempt to execute a function with arguments
                                    if(Array.isArray(props[key]))
                                        node.element[key](...props[key]);
                                    else node.element[key](props[key]);
                                } 
                            else node.element[key] = props[key]; 
                        }
                    }
                return props;
            },
            ...completeOptions
        }, undefined,this);

        let canvas = elm.querySelector('canvas');
        if(completeOptions.style) Object.assign(canvas.style,completeOptions.style); //assign the style object

        let context;
        if(typeof completeOptions.context === 'object') context = options.context;
        else if(typeof completeOptions.context === 'string') context = (canvas as HTMLCanvasElement).getContext(completeOptions.context);

        this.components[completeOptions.id] = {
            element:elm,
            class:CustomElement,
            template:completeOptions.template,
            canvas,
            node,
            ...completeOptions
        } as any;

        (this.components[completeOptions.id] as CanvasElementInfo).context = context;

        (elm as any).canvas = canvas; //make sure everything is accessible;
        (elm as any).context = context; 
        node.canvas = canvas; //make sure everything is accessible;
        node.context = context;
      
        if(!elm.parentNode) {
            setTimeout(()=>{ //slight delay on appendChild so the graph is up to date after other sync tree/route loading calls are finished
                if(typeof options.parentNode === 'object') options.parentNode.appendChild(elm);
            },0.01);
        }
        
        node.runAnimation(animation); //update the animation by calling this function again or setting node.animation manually

        return this.components[completeOptions.id] as CanvasElementInfo;

    }
    
    load = (
        routes?:Service|Graph|DOMRoutes|{name:string,module:{[key:string]:any}}|any,
        enumRoutes:boolean=true //enumerate routes with the service or class name so they are run as e.g. 'http/createServer' so services don't accidentally overlap
    ) => {    
        if(!routes && !this.loadDefaultRoutes) return;
        //console.log(this.routes);
        let service;
        if(!(routes instanceof Graph) && (routes as any)?.name) { //class prototype
            if(routes.module) {
                let mod = routes;
                routes = {};
                Object.getOwnPropertyNames(routes.module).forEach((prop) => { //iterate through 
                    if(enumRoutes) routes[mod.name+'/'+prop] = routes.module[prop];
                    else routes[prop] =  routes.module[prop];
                });
            } else if(typeof routes === 'function') { //it's a service prototype... probably
                service = new routes();
                service.load();
                routes = service.routes;
            }
        } //we can instantiate a class and load the routes. Routes should run just fine referencing the classes' internal data structures without those being garbage collected.
        else if (routes instanceof Graph && (routes.routes || routes.tree)) { //class instance
            service = routes;
            if(routes.routes) routes = routes.routes; //or pull routes from an existing class
            else if(routes.tree) routes = routes.tree;
        }
        else if (typeof routes === 'object') {
            let name = routes.constructor.name;
            if(name === 'Object') {
                name = Object.prototype.toString.call(routes);
                if(name) name = name.split(' ')[1];
                if(name) name = name.split(']')[0];
            } 
            if(name && name !== 'Object') { 
                let module = routes;
                routes = {};
                Object.getOwnPropertyNames(module).forEach((route) => {
                    if(enumRoutes) routes[name+'/'+route] = module[route];
                    else routes[route] = module[route];
                });
            }
        }

        if(service instanceof Graph && service.name) {     
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
        
        if(this.loadDefaultRoutes) {
            let rts = Object.assign({},this.defaultRoutes); //load all default routes
            if(routes) {
                Object.assign(rts,this.routes); //then load declared routesin this object
                routes = Object.assign(rts,routes); //then load new routes in constructor
            } else routes = Object.assign(rts,this.routes); //then load declared routesin this object
            
            //console.log(this.name,this.routes,routes);
            this.loadDefaultRoutes = false;
        }
        
        //load any children into routes too if tags exist
        for(const tag in routes) {
            let childrenIter = (route:RouteProp) => {
                if(typeof route?.children === 'object') {
                    for(const key in route.children) {
                        if(typeof route.children[key] === 'object') {
                            let rt = (route.children[key] as any);
                            if(!rt.parent) rt.parent = tag;
                            if(rt.tag) {
                                routes[rt.tag] = route.children[key];
                                childrenIter(routes[rt.tag]);
                            } else if (rt.id) {
                                rt.tag = rt.id;
                                routes[rt.tag] = route.children[key];
                                childrenIter(routes[rt.tag]);
                            }
                        }
                    }
                }
            }
            childrenIter(routes[tag]);
        }

        for(const route in routes) {
            if(typeof routes[route] === 'object') {
                let r = routes[route] as RouteProp | DOMRouteProp;
                
                if(typeof r === 'object') {
                    if(r.template) { //assume its a component node
                        if(!routes[route].tag) routes[route].tag = route;
                        this.addComponent(routes[route]);
                    }
                    else if(r.context) { //assume its a canvas node
                        if(!routes[route].tag) routes[route].tag = route;
                        this.addCanvasComponent(routes[route]);
                    }
                    else if(r.tagName || r.element) { //assume its an element node
                        if(!routes[route].tag) routes[route].tag = route;
                        this.addElement(routes[route]);
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
        args?:any, 
        origin?:string|GraphNode|Graph|Service
    ) => { //For handling RouteProp or other routes with multiple methods 
        let m = method.toLowerCase(); //lower case is enforced in the route keys
        if(m === 'get' && ((this.routes[route] as RouteProp)?.get as any)?.transform instanceof Function) { //make alt formats for specific methods and execute them a certain way
            if(Array.isArray(args)) return ((this.routes[route] as RouteProp).get as any).transform(...args);
            else return ((this.routes[route] as RouteProp).get as any).transform(args);
        }
        if(this.routes[route]?.[m]) {
            if(!(this.routes[route][m] instanceof Function)) {
                if(args) this.routes[route][m] = args; //if args were passed set the value
                return this.routes[route][m]; //could just be a stored local variable we are returning like a string or object
            }// else if(origin) { return this.routes[route][m](origin,data); }//put origin in first position
            else return this.routes[route][m](args); 
            
        }//these could be any function or property call
        else return this.handleServiceMessage({route,args,method,origin}) //process normally if the method doesn't return
    }

    handleServiceMessage(message:ServiceMessage) {
        let call; 
        if(typeof message === 'object') {
            if(message.route) call = message.route; else if (message.node) call = message.node;
        }
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

    handleGraphNodeCall(route:string|GraphNode, args:any, origin?:string|GraphNode|Graph) {
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
        if(typeof args[0] === 'object') {
            if(args[0].method) { //run a route method directly, results not linked to graph
                return this.handleMethod(args[0].route, args[0].method, args[0].args);
            } else if(args[0].route) {
                return this.handleServiceMessage(args[0]);
            } else if (args[0].node){
                return this.handleGraphNodeCall(args[0].node, args[0].args, args[0].origin);
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
        if(args[0]) if(typeof args[0] === 'string') {
            let substr = args[0].substring(0,8);
            if(substr.includes('{') || substr.includes('[')) {    
                if(substr.includes('\\')) args[0] = args[0].replace(/\\/g,"");
                if(args[0][0] === '"') { args[0] = args[0].substring(1,args[0].length-1)};
                //console.log(args[0])
                args[0] = JSON.parse(args[0]); //parse stringified args
            }
        }

        if(typeof args[0] === 'object') {
            if(args[0].method) { //run a route method directly, results not linked to graph
                return this.handleMethod(args[0].route, args[0].method, args[0].args);
            } else if(args[0].route) {
                return this.handleServiceMessage(args[0]);
            } else if (args[0].node){
                return this.handleGraphNodeCall(args[0].node, args[0].args, args[0].origin);
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
        source:GraphNode|string, 
        destination:string, 
        endpoint?:string|any, //the address or websocket etc. of the endpoint on the service we're using, this is different e.g. for sockets or http
        origin?:string, 
        method?:string, 
        callback?:(res:any)=>any|void
    ) => {
        if(source instanceof GraphNode) {
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
        source:GraphNode|string, 
        destination:string, 
        endpoint?:string|any, //the address or websocket etc. of the endpoint on the service we're using, this is different e.g. for sockets or http
        origin?:string, 
        method?:string, 
        callback?:(res:any)=>any|void
    ) => {
        if(source instanceof GraphNode) {
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

    terminate = (element:string|DOMElement|HTMLElement|DOMElementInfo|CanvasElementInfo)=>{
        if(typeof element === 'object') {
            if((element as CanvasElementInfo).animating)
               (element as CanvasElementInfo).animating = false;

            if((element as DOMElementInfo|CanvasElementInfo).element) element = (element as DOMElementInfo|CanvasElementInfo).element;
         }
        else if(typeof element === 'string' && this.components[element]) {
            if((this.components[element] as CanvasElementInfo).node.isAnimating)
                (this.components[element] as CanvasElementInfo).node.stopNode();
            if((this.components[element] as DOMElementInfo).divs)
                (this.components[element] as DOMElementInfo).divs.forEach((d) => this.terminate(d));
                
            let temp = this.components[element].element;
            delete this.components[element]
            element = temp;
        }
        else if(typeof element === 'string' && this.elements[element]) {
            if(this.elements[element].divs)
                this.elements[element].divs.forEach((d) => this.terminate(d));
            let temp = this.elements[element].element;
            if(this.elements[element].onresize) window.removeEventListener('resize',this.elements[element].onresize as EventListener);
            if(this.elements[element].ondelete) this.elements[element].ondelete(temp,this.elements[element]);
            delete this.elements[element];
            element = temp;
        }
        
        if(element) {
            if(this.nodes.get((element as any).id)) {
                this.removeTree((element as any).id);
            }

            if(element instanceof DOMElement)
                element.delete(); //will trigger the ondelete callback
            else if ((element as HTMLElement)?.parentNode) {
                (element as any).parentNode.removeChild(element);
            }

            return true;
        }
        return false;
    }
    
    isTypedArray(x:any) { //https://stackoverflow.com/a/40319428
        return (ArrayBuffer.isView(x) && Object.prototype.toString.call(x) !== "[object DataView]");
    }

    recursivelyAssign = (target,obj) => {
        for(const key in obj) {
            if(typeof obj[key] === 'object') {
                if(typeof target[key] === 'object') this.recursivelyAssign(target[key], obj[key]);
                else target[key] = this.recursivelyAssign({},obj[key]); 
            } else target[key] = obj[key];
        }

        return target;
    }
    
    defaultRoutes:DOMRoutes = { //declared at the end so everything on this class is defined to pass through as node props
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
        assign:(source:{[key:string]:any}) => { //assign source to this
            if(typeof source === 'object') 
            {Object.assign(this,source);
            return true;} return false;
        },
        recursivelyAssign:(source:{[key:string]:any}) => { //assign source object to this
            if(typeof source === 'object') 
            {this.recursivelyAssign(this,source);
            return true;} return false;
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
        setState:this.setState,
        print:this.print,
        reconstruct:this.reconstruct,
        handleMethod:this.handleMethod,
        handleServiceMessage:this.handleServiceMessage,
        handleGraphNodeCall:this.handleGraphNodeCall,
        addElement:this.addElement,
        addComponent:this.addComponent,
        addCanvasComponent:this.addCanvasComponent
    }

}

/**
 * Usage
 */

// import {Router} from '../../routers/Router'

// let router = new Router([
//     DOMService
// ]);

// let elem = router.html.addElement(
// {
//     tagName:'div', //for an existing element, just pass the element object e.g. document.getElementById('testdiv')
//     style:{backgroundColor:'black', width:'100px', height:'100px' },
//     parentNode:document.body,
//     id:'testdiv'
// }
// ); //this adds the element and creates a node that allows you to modify the HTMLElement properties or run functions e.g. click()

// let node = elem.node;
// let div = elem.element; //or node.element 

// setTimeout(()=>{
//     node.run('testdiv',{style:{backgroundColor:'red'}}) //now we can modify properties on the element via node trees, function names can be called to pass an argument or array of arguments (wrap arrays in an array if its a single argument requiring an array)
//     setTimeout(()=>{
//         router.html.run('testdiv',{style:{backgroundColor:'black'}}) //equivalent call via the service stack
//     },1000);
// },1000);


// let comp = router.html.addComponent({
//     template:` 
//         <div>
//             <button>Hello World!</button>
//         </div>
//     `, //or load an html file (if bundling)
//     parentNode:document.body,
//     styles:`
//         div {
//             background-color:black;
//             width:100px;
//             height:100px;
//         }

//         button {
//             background-color: green;
//             color: red;
//         }
//     `, //or load a css file (if bundling, scss also supported natively in esbuild)
//     oncreate:(self:DOMElement,props:any) => { 
//         let button = self.querySelector('button');
//         button.onclick = (ev) => { alert('Hello World!'); }
//     }
// });

// let ccomp = router.html.addCanvasComponent({
//     context:'2d',
//     draw:(self:DOMElement,props:any)=>{
//         let canvas = self.canvas as HTMLCanvasElement;
//         let context = self.context as CanvasRenderingContext2D;

//         context.clearRect(0,0,canvas.width,canvas.height);

//         context.fillStyle = `rgb(0,0,${Math.sin(performance.now()*0.001)*255})`;
//         context.fillRect(0,0,canvas.width,canvas.height);
//     },
//     width:'300px',
//     height:'300px',
//     style:{width:'300px', height:'300px'}
// });