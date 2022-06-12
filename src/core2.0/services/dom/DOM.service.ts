import { DOMElement } from "fragelement";
import { GraphNode } from "../../Graph";
import { Service } from "../Service";

export type DOMElementProps = {
    _id:string,
    element:DOMElement,
    
}


export class DOMService extends Service {

    elements:{
        [key:string]:{}
    } = {}

    //create an element that is tied to a specific node, multiple elements can aggregate
    // with the node
    routeElement=(route:string|GraphNode,parentNode?,oncreate?,ondelete?,onresize?,onchange?)=>{
        if(typeof route === 'string') {
            
        }
    }
}