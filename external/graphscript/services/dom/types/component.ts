import { DOMElement } from "../DOMElement"
import { GraphNode, GraphNodeProperties } from "../../../Graph"

export type DOMElementProps = {
    tagName?:string, //custom node tag name, requires a '-' in it 
    template?:string|((props:any)=>string|HTMLElement)|HTMLElement, //string or function that passes the modifiable props on the element (the graph node properties)
    parentNode?:string|HTMLElement,
    styles?:string, //will use the shadow DOM automatically in this case
    oncreate?:(self:DOMElement,info?:DOMElementInfo)=>void, //use self.querySelector to select nested elements without worrying about the rest of the page.
    onresize?:(self:DOMElement,info?:DOMElementInfo)=>void,
    ondelete?:(self:DOMElement,info?:DOMElementInfo)=>void,
    onchanged?:(props:any)=>void,
    renderonchanged?:boolean|((self:DOMElement,info:DOMElementInfo)=>void), //set true to auto refresh the element render (it re-appends a new fragment in its container)
    innerText?:string,
    innerHTML?:string,
    id?:string
} & GraphNodeProperties

export type DOMElementInfo = { //returned from addComponent
    element:DOMElement,
    class:any, //the customized DOMElement class
    node:GraphNode,
    divs:any[]
} & DOMElementProps


export type ComponentOptions = {
    tagName?:string,
    template?:string|((props:any)=>string|HTMLElement)|HTMLElement, //string or function that passes the modifiable props on the element (the graph node properties)
    parentNode?:string|HTMLElement,
    styles?:string, //will use the shadow DOM automatically in this case
    oncreate?:(self:DOMElement,info?:DOMElementInfo)=>void, //use self.querySelector to select nested elements without worrying about the rest of the page.
    onresize?:(self:DOMElement,info?:DOMElementInfo)=>void,
    ondelete?:(self:DOMElement,info?:DOMElementInfo)=>void,
    onchanged?:(props:any)=>void,
    renderonchanged?:boolean|((self:DOMElement,info:DOMElementInfo)=>void), //set true to auto refresh the element render (it re-appends a new fragment in its container)
    props?:{[key:string]:any},
    innerText?:string,
    innerHTML?:string,
    id?:string
} & GraphNodeProperties