import { AcyclicGraph, Graph, GraphProperties, OperatorType, Tree } from "./Graph";

/**
 * 
 * A router is a simple way to construct a set of graph nodes and handle different message passing 
 * protocols to and from operators
 * 
 */

type Route = {
    [key:string]:
            Graph |
            GraphProperties |
            OperatorType |
            ((...args)=>any|void) |
            { aliases:string[] & GraphProperties } |
            {
                route:string,
                get?:{
                    object:any,
                    transform:(any,...args)=>any
                },
                post?:OperatorType|((...args)=>any|void)
                operator?:OperatorType|((...args)=>any|void)
                aliases?:string[]
            }
}

export class Router extends AcyclicGraph {

    routes:Tree = {
        'ping':()=>{
            return 'pong';
        },
        'echo':(...args)=>{
            return args;
        }
    }


    constructor(routes:Tree) {
        super(routes);
        if(this.routes) this.setTree(this.routes);
    }

    //handle subscriptions
    //match i/o protocols to correct services
    
}