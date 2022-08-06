import { DOMElement } from "../DOMElement"
import { Graph, GraphNode, GraphNodeProperties } from "../../../Graph"
import { ElementProps } from "./element"
import { CanvasElementProps } from "./canvascomponent"

export type DOMElementProps = GraphNodeProperties & {
    tagName?:string, //custom node tag name, requires a '-' in it 
    template?:string|((self:DOMElement, props:any)=>string|HTMLElement)|HTMLElement, //string or function that passes the modifiable props on the element (the graph node properties)
    parentNode?:string|HTMLElement,
    styles?:string, //will use the shadow DOM automatically in this case
    onrender?:(self:DOMElement,info?:DOMElementInfo)=>void, //use self.querySelector to select nested elements without worrying about the rest of the page.
    onresize?:(self:DOMElement,info?:DOMElementInfo)=>void,
    ondelete?:(self:DOMElement,info?:DOMElementInfo)=>void,
    onchanged?:(props:any)=>void,
    renderonchanged?:boolean|((self:DOMElement,info:DOMElementInfo)=>void), //set true to auto refresh the element render (it re-appends a new fragment in its container)
    innerText?:string,
    innerHTML?:string,
    id?:string,
    children?:{[key:string]:string|boolean|undefined|GraphNodeProperties|GraphNode|Graph|DOMElementProps|ElementProps|CanvasElementProps},
    generateChildElementNodes?:boolean //generate these element info and graphnodes for every node in an element hierarchy
}

export type DOMElementInfo = { //returned from addComponent
    element:DOMElement,
    class:any, //the customized DOMElement class
    node:GraphNode,
    divs:any[]
} & DOMElementProps


export type ComponentOptions = GraphNodeProperties & {
    tagName?:string,
    template?:string|((self:DOMElement, props:any)=>string|HTMLElement)|HTMLElement, //string or function that passes the modifiable props on the element (the graph node properties)
    parentNode?:string|HTMLElement,
    styles?:string, //Insert a stylesheet in front of the template
    useShadow?:boolean, //use the shadow root for style/html nesting? breaks document.querySelector...
    onrender?:(self:DOMElement,info?:DOMElementInfo)=>void, //use self.querySelector to select nested elements without worrying about the rest of the page.
    onresize?:(self:DOMElement,info?:DOMElementInfo)=>void,
    onremove?:(self:DOMElement,info?:DOMElementInfo)=>void,
    onchanged?:(props:any)=>void,
    renderonchanged?:boolean|((self:DOMElement,info:DOMElementInfo)=>void), //set true to auto refresh the element render (it re-appends a new fragment in its container)
    props?:{[key:string]:any},
    innerText?:string,
    innerHTML?:string,
    children?:{[key:string]:string|boolean|undefined|GraphNodeProperties|GraphNode|Graph|DOMElementProps|ElementProps|CanvasElementProps},
    id?:string
}