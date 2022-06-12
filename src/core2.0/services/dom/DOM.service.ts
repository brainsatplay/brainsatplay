import { DOMElement } from "fragelement";
import { GraphNode } from "../../Graph";
import { Routes, Service } from "../Service";

export type DOMElementProps = {
    route:string|GraphNode,
    template?:string|((props:any)=>string), //string or function that passes the modifiable props on the element (the graph node properties)
    parentNode?:string|HTMLElement,
    styles?:string, //will use the shadow DOM automatically in this case
    oncreate?:(props:any,self:DOMElement)=>void,
    onresize?:(props:any,self:DOMElement)=>void,
    ondelete?:(props:any,self:DOMElement)=>void,
    onchanged?:(props:any,self:DOMElement)=>void,
    renderonchanged?:boolean|((props:any,self:DOMElement)=>void)
}

export type DOMElementInfo = {
    element:DOMElement
} & DOMElementProps

export type CanvasElementProps = {
    draw:((props:any,self:DOMElement)=>string),
    context:'2d'|'webgl'|'webgl2'|'bitmaprenderer'|'experimental-webgl'|'xrpresent',
    width?:string,
    height?:string,
    style?:string
} & DOMElementProps

export type CanvasElementInfo = {
    element:DOMElement,
    context:'2d'|'webgl'|'webgl2'|'bitmaprenderer'|'experimental-webgl'|'xrpresent',
    animating:boolean,
    animation:any,
} & CanvasElementProps

export class DOMService extends Service {

    elements:{
        [key:string]:DOMElementInfo|CanvasElementInfo
    } = {}

    templates:{ //pass these in as options for quicker iteration
        [key:string]:DOMElementProps|CanvasElementProps
    }

    //create an element that is tied to a specific node, multiple elements can aggregate
    // with the node
    routeElement=(
        options:{
            route:string|GraphNode,
            template:string|((props:any)=>string), //string or function that passes the modifiable props on the element (the graph node properties)
            parentNode?:string|HTMLElement,
            styles?:string, //will use the shadow DOM automatically in this case
            oncreate?:(props:any,self:DOMElement)=>void,
            onresize?:(props:any,self:DOMElement)=>void,
            ondelete?:(props:any,self:DOMElement)=>void,
            onchanged?:(props:any,self:DOMElement)=>void,
            renderonchanged?:boolean|((props:any,self:DOMElement)=>void), //set true to auto refresh the element render (it re-appends a new fragment in its container)
            _id?:string
        }
    )=>{
        if(typeof options.route === 'string') {
            options.route = this.nodes.get(options.route);
        }
        if(options.route instanceof GraphNode) {
            let elm = new DOMElement();
            elm.props = options.route;
            if(options.template) elm.template = options.template;
            if(options.oncreate) elm.oncreate = options.oncreate;
            if(options.onresize) elm.onresize = options.onresize;
            if(options.ondelete) elm.ondelete = options.ondelete;
            if(options.onchanged) elm.onchanged = options.onchanged;
            if(options.renderonchanged) elm.renderonchanged = options.renderonchanged;


            if(!options._id) options._id = `element${Math.floor(Math.random()*1000000000000000)}`

            if(typeof options.parentNode === 'string') options.parentNode = document.body;
            if(!options.parentNode) options.parentNode = document.body;
            options.parentNode.appendChild(elm);

            this.templates[options._id] = options;

            this.elements[options._id] = {
                element:elm,
                ...options
            };

            return this.elements[options._id];
        }
        return false;
    }

    //create a canvas with a draw loop that can respond to props
    routeCanvas=(
        options:{
            route:string|GraphNode,
            context:'2d'|'webgl'|'webgl2'|'bitmaprenderer'|'experimental-webgl'|'xrpresent', //
            draw:((props:any,self:DOMElement)=>string), //string or function that passes the modifiable props on the element (the graph node properties)
            width?:string,
            height?:string,
            style?:string,
            parentNode?:string|HTMLElement,
            styles?:string, //will use the shadow DOM automatically in this case
            oncreate?:(props:any,self:DOMElement)=>void,
            onresize?:(props:any,self:DOMElement)=>void,
            ondelete?:(props:any,self:DOMElement)=>void,
            onchanged?:(props:any,self:DOMElement)=>void,
            renderonchanged?:boolean|((props:any,self:DOMElement)=>void),
            _id?:string
        } 
    ) => {
        if(typeof options.route === 'string') {
            options.route = this.nodes.get(options.route);
        }
        if(options.route instanceof GraphNode) {
            let elm = new DOMElement();
            elm.props = options.route;
            elm.template = `<canvas `;
            if(options.width) elm.template += `width="${options.width}"`;
            if(options.height) elm.template += `height="${options.height}"`;
            if(options.style) elm.template += `style="${options.style}"`;
            elm.template+=` ></canvas>`;

            if(options.oncreate) elm.oncreate = options.oncreate;
            if(options.onresize) elm.onresize = options.onresize;
            if(options.ondelete) elm.ondelete = options.ondelete;
            if(options.onchanged) elm.onchanged = options.onchanged;
            if(options.renderonchanged) elm.renderonchanged = options.renderonchanged;

            if(!options._id) options._id = `element${Math.floor(Math.random()*1000000000000000)}`

            if(typeof options.parentNode === 'string') options.parentNode = document.body;
            if(!options.parentNode) options.parentNode = document.body;
            options.parentNode.appendChild(elm);

            let animation = () => {
                if((this.elements[options._id as string] as CanvasElementInfo)?.animating) {
                    (this.elements[options._id as string] as CanvasElementInfo).draw(this.elements[options._id as string].route,this.elements[options._id as string].element);
                    requestAnimationFrame(animation);
                }
            }

            this.templates[options._id] = options;

            this.elements[options._id] = {
                element:elm,
                template:elm.template,
                animating:true,
                animation,
                ...options
            };

            (this.elements[options._id] as CanvasElementInfo).animation();

            return this.elements[options._id];
        }
        return false;
    }

    terminate=(element:string|DOMElement|HTMLElement|DOMElementInfo|CanvasElementInfo)=>{
        if(typeof element === 'object') {
            if((element as CanvasElementInfo).animating)
               (element as CanvasElementInfo).animating = false;

            if((element as DOMElementInfo|CanvasElementInfo).element) element = (element as DOMElementInfo|CanvasElementInfo).element;
         }
        else if(typeof element === 'string' && this.elements[element]) {
            if((this.elements[element] as CanvasElementInfo).animating)
            (this.elements[element] as CanvasElementInfo).animating = false; //quits the anim
            element = this.elements[element].element;
        }
        
        if(element instanceof DOMElement)
            element.delete(); //will trigger the ondelete callback
        else if ((element as HTMLElement)?.parentNode)
            (element as any).parentNode.removeChild(element);

        return true;
    }

    routes:Routes = {
        routeElement:this.routeElement,
        routeCanvas:this.routeCanvas,
        terminate:this.terminate
    }
}