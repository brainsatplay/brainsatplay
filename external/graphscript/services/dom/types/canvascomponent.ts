import { DOMElementProps } from "./component"
import { DOMElement } from "../DOMElement"
import { GraphNode, GraphNodeProperties } from "../../../Graph"

export type CanvasElementProps = {
    tagName?:string, //custom node tag name, requires a '-' in it 
    parentNode?:string|HTMLElement,
    styles?:string, //will use the shadow DOM automatically in this case
    onchanged?:(props:any)=>void,
    id?:string,
    canvas?:HTMLCanvasElement,
    context:'2d'|'webgl'|'webgl2'|'bitmaprenderer'|'experimental-webgl'|'xrpresent'|RenderingContext, //
    draw:((self:DOMElement,info:CanvasElementInfo)=>void), //string or function that passes the modifiable props on the element (the graph node properties)
    width?:string, //e.g. '300px'
    height?:string, //e.g. '300px'
    oncreate?:(self:DOMElement,info?:CanvasElementInfo)=>void, //use self.querySelector to select nested elements without worrying about the rest of the page.
    onresize?:(self:DOMElement,info?:CanvasElementInfo)=>void,
    ondelete?:(self:DOMElement,info?:CanvasElementInfo)=>void,
    renderonchanged?:boolean|((self:DOMElement,info?:CanvasElementInfo)=>void),
} & GraphNodeProperties

export type CanvasElementInfo = { //returned from addCanvasComponent
    element:DOMElement & {canvas:HTMLCanvasElement, context:RenderingContext},
    draw:((self:DOMElement,info:CanvasElementInfo)=>void),
    canvas:HTMLCanvasElement,
    context:RenderingContext,
    animating:boolean,
    animation:any,
    width?:string,
    height?:string,
    style?:string,
    class:any, //the customized DOMElement class
    node:GraphNode
} & CanvasElementProps


export type CanvasOptions = {
    element:DOMElement & {canvas:HTMLCanvasElement, context:RenderingContext},
    tagName?:string, //custom element tagName, requires a '-' in the tag or it gets added to the end
    canvas?:HTMLCanvasElement,
    context:'2d'|'webgl'|'webgl2'|'bitmaprenderer'|'experimental-webgl'|'xrpresent'|RenderingContext, //
    draw:((self:DOMElement,info:CanvasElementInfo)=>void), //string or function that passes the modifiable props on the element (the graph node properties)
    width?:string, //e.g. '300px'
    height?:string, //e.g. '300px'
    style?:CSSStyleDeclaration, //canvas inline style string
    parentNode?:string|HTMLElement,
    styles?:string, //stylesheet text, goes inside a <style> tag. This will use the shadow DOM automatically in this case
    oncreate?:(self:DOMElement,info?:CanvasElementInfo)=>void, //use self.querySelector to select nested elements without worrying about the rest of the page.
    onresize?:(self:DOMElement,info?:CanvasElementInfo)=>void,
    ondelete?:(self:DOMElement,info?:CanvasElementInfo)=>void,
    onchanged?:(props:any)=>void,
    renderonchanged?:boolean|((self:DOMElement,info?:CanvasElementInfo)=>void),
    props?:{[key:string]:any}
    id?:string
} & GraphNodeProperties