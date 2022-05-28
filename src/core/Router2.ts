import { AcyclicGraph, Graph, GraphProperties, OperatorType, Tree } from "./Graph";

/**
 * 
 * A router is a simple way to construct a set of graph nodes and handle different message passing 
 * protocols to and from operators
 * 
 */

type Routes = {
    [key:string]:
            Graph |
            GraphProperties |
            OperatorType |
            ((...args)=>any|void) |
            { aliases:string[] } & GraphProperties |
            {
                get?:{
                    object:any,
                    transform:(...args)=>any
                },
                post?:OperatorType|((...args)=>any|void)
                aliases?:string[] 
            } & GraphProperties
}

export class Router extends AcyclicGraph {

    routes:Routes = {
        'ping':()=>{
            return 'pong';
        },
        'echo':(...args)=>{
            return args;
        }
    }


    constructor(routes:Routes) {
        super(routes);
        if(routes) this.routes = routes;
        if(this.routes) this.setTree(this.routes);
    }

    //handle subscriptions
    //match i/o protocols to correct services
    
}