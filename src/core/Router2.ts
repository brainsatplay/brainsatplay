import { AcyclicGraph, Graph, GraphProperties } from "./Graph";

/**
 * 
 * A router is a simple way to construct a set of graph nodes and handle different message passing 
 * protocols to and from operators
 * 
 */
export class Router extends AcyclicGraph {

    constructor(routes:{[key:string]:GraphProperties|((self:Graph,origin:Graph|AcyclicGraph,...args)=>any)}) {
        super(routes);
    }

}