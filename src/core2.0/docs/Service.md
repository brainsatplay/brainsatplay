# Services

Services build on the idea of creating pluggable microservices in a unified programming interface, and seeks to simplify the amount of work required to implement increasing numbers of protocols. This can vastly speed up feature development and feature meshing. 

The Service class here extends the Graph class and adds additional methods for creating and linking execution graphs. 

```ts
type RouteProp = { //these are just multiple methods you can call on a route/node tag kind of like http requests but really it applies to any function you want to add to a route object if you specify that method even beyond these http themed names :D
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
} & GraphNodeProperties


type Routes = { //same as the tree in the base acyclic graph but adds aliases and RouteProps handling
    [key:string]:
        GraphNode |
        GraphNodeProperties |
        OperatorType |
        ((...args)=>any|void) |
        { aliases?:string[] } & GraphNodeProperties |
        RouteProp
}

//these are the same as trees except they can turn get or post into operators,
// this makes more sense when the http server is involved but you can specify any
let routes:Routes = {
    add:{
        post:(a,b) => {
            return a+b;
        },
        aliases:['addition'] //these are in the base graph too as a feature
    }
}

const service = new Service(routes);

```

In a Service you declare "routes" instead of a tree (the 'tree' proprerty still functional internally but not used in the service's constructor), which simply adds an additional graph node prototype that aims to multiplex the operator calls on a route the same way you can get/post/delete etc. to routes on a REST api, or in our case calling any method you specify on a route/node. Every service includes a set of default routes for basic operations like getting/setting/logging/subscribing/etc. so each service is self contained.

Services supply additional functions for piping the outputs of one function to others, including through to other services you've loaded into your main parent service interface. A lot of this is much better explained with code.

## Service Messages

For microservices to be able to talk to each other, we use a common set of keys in an object used for message passing and transmitting/receiving between services and nodes, including those on other servers or threads. 

Detached services on other threads or program instances/remote locations can use the origin as a simple id system to route commands and responses, which we've found several ways to use already to automate a lot of work between the existing services.

```ts
type ServiceMessage = {
    route?:string,  //the function/node to execute
    args?:any, //route args or data depending on what we're handling
    method?:string, //can specify get, post, etc. on http requests or on multiplexed routes using the RouteProp format
    node?:string|GraphNode, //alt tag for routes
    origin?:string|GraphNode|Graph|Service,
    [key:string]:any //it's an object so do whatever, any messages meant for web protocols need to be stringified or buffered
}


let message:ServiceMessage = {route:'add', args:[10,20], method:'post'};

service.transmit(message); //these get customized in services representing their specific protocols e.g. http or websockets to deal with those specific interface requirements

```