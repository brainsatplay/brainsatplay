import { AcyclicGraph, Tree } from "./Graph";

/**
 * 
 * A router is a simple way to construct a set of graph nodes and handle different message passing 
 * protocols to and from operators
 * 
 */
export class Router extends AcyclicGraph {

    tree = {
        'ping':()=>{
            return 'pong';
        },
        'echo':(...args)=>{
            return args;
        }
    }

    constructor(routes:Tree) {
        super(routes);
    }

    //handle subscriptions
    //match i/o protocols to correct services
    
}