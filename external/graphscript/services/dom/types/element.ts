import { GraphNode, GraphNodeProperties } from "../../../Graph";

export type ElementProps = {
    tagName?:string, //e.g. 'div', 'canvas'
    element?:HTMLElement, //alternatively set an element
    style?:CSSStyleDeclaration,
    attributes?:{[key:string]:any}, //specify any attributes/values
    parentNode?:string|HTMLElement,
    oncreate?:(self:HTMLElement,info:ElementInfo)=>void,
    onresize?:(ev,self:HTMLElement,info:ElementInfo)=>void,
    ondelete?:(self:HTMLElement,info:ElementInfo)=>void,
    innerText?:string,
    innerHTML?:string,
    id?:string
}

export type ElementInfo = { //returned from addElement
    element:HTMLElement,
    node:GraphNode,
    parentNode:HTMLElement,
    divs:any[]
} & ElementProps;

export type ElementOptions = {
    tagName?:string, //e.g. 'div', 'canvas'
    element?:HTMLElement, //alternatively set an element
    style?:CSSStyleDeclaration,
    attributes?:{[key:string]:any}, //specify any attributes/values e.g. innerHTML, onclick,...
    parentNode?:string|HTMLElement,
    oncreate?:(self:HTMLElement,info:ElementInfo)=>void,
    onresize?:(ev,self:HTMLElement,info:ElementInfo)=>void,
    ondelete?:(self:HTMLElement,info:ElementInfo)=>void,
    innerText?:string,
    innerHTML?:string,
    id?:string
} & GraphNodeProperties