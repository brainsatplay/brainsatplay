import { DOMElement } from "./DOMElement"; //https://github.com/joshbrew/DOMElement <---- this is the special sauce
import { Graph, GraphNode, GraphNodeProperties, OperatorType } from '../../Graph';
import { RouteProp, Service, ServiceOptions } from "../Service";

import {CompleteOptions} from './types/general';
import {ElementOptions, ElementInfo, ElementProps} from './types/element';
import {DOMElementProps, ComponentOptions, DOMElementInfo} from './types/component';
import {CanvasElementProps, CanvasOptions, CanvasElementInfo} from './types/canvascomponent';

//alternative base service that additioanlly allows 'DOMRoutes' to be loaded which can tie in html and webcomponent blocks


export type DOMRouteProp = 
    ElementProps |
    DOMElementProps |
    CanvasElementProps

export type DOMServiceRoute = 
    GraphNode |
    GraphNodeProperties |
    Graph |
    OperatorType |
    ((...args)=>any|void) |
    { aliases?:string[] } & GraphNodeProperties |
    RouteProp | 
    DOMRouteProp


export type DOMRoutes = {
    [key:string]:DOMServiceRoute
}


export class DOMService extends Service {

    //routes denote paths and properties callable across interfaces and inherited by parent services (adding the service name in the 
    // front of the route like 'http/createServer'.
    loadDefaultRoutes = false; //load default routes?
    name:string=`dom${Math.floor(Math.random()*1000000000000000)}`;
    keepState:boolean = true; //routes that don't trigger the graph on receive can still set state
    parentNode:HTMLElement=document.body; //default parent elements for elements added

    

    customRoutes:ServiceOptions["customRoutes"] = {
        'dom':(r:DOMServiceRoute|any, route:string, routes:DOMRoutes|any) => {

            // console.log(r)
            if(r.template) { //assume its a component node
                if(!r.tag) r.tag = route;
                this.addComponent(r,r.generateChildElementNodes);
            }
            else if(r.context) { //assume its a canvas node
                if(!r.tag) r.tag = route;
                this.addCanvasComponent(r);
            }
            else if(r.tagName || r.element) { //assume its an element node
                if(!r.tag) r.tag = route;
                this.addElement(r,r.generateChildElementNodes);
            }

            return r;
        }
    }

    customChildren:ServiceOptions["customChildren"] = {
        'dom':(rt:DOMServiceRoute|any, routeKey:string, route:any, routes:DOMRoutes, checked:DOMRoutes) => {
            //automatically parent children html routes to parent html routes without needing explicit parentNode definitions
            if((route.tag || route.id) && (route.template || route.context || route.tagName || route.element) && (rt.template || rt.context || rt.tagName || rt.element) && !rt.parentNode) {
                if(route.tag) rt.parentNode = route.tag; 
                if(route.id) rt.parentNode = route.id;
            }
            return rt;
        }
    }

    constructor(options?:ServiceOptions,parentNode?:HTMLElement) {
            super({props:options.props,name:options.name});

            if(parentNode instanceof HTMLElement) this.parentNode = parentNode;
            else if(options.parentNode instanceof HTMLElement) this.parentNode = parentNode;

            this.init(options);
            
    }
    
    elements:{
        [key:string]:ElementInfo
    } = {}

    components:{
        [key:string]:DOMElementInfo|CanvasElementInfo
    } = {}

    templates:{ //pass these in as options for quicker iteration
        [key:string]:DOMElementProps|CanvasElementProps
    } = {}

    addElement=(
        options: ElementOptions,
        generateChildElementNodes=false      
    )=>{

        let elm:HTMLElement = this.createElement(options)

        let oncreate = options.onrender;

        if(!options.element) options.element = elm;
        if(!options.operator) options.operator = (node,origin,props:{[key:string]:any})=>{ 
            if(typeof props === 'object') 
                for(const key in props) { 
                    if(node.element) {
                        if(typeof node.element[key] === 'function' && typeof props[key] !== 'function')
                            { //attempt to execute a function with arguments
                                if(Array.isArray(props[key]))
                                    node.element[key](...props[key]);
                                else node.element[key](props[key]);
                            } 
                        else if (key === 'style') { Object.assign(node.element[key],props[key])}
                        else node.element[key] = props[key]; 
                    }
                }
                
            return props;
        }


        let node:GraphNode;
        if(this.nodes.get(options.id)?.element?.parentNode?.id === options.parentNode || this.nodes.get(options.id)?.parentNode === options.parentNode) {
            node = this.nodes.get(options.id);
            node.element = elm;
        } else {
            node = new GraphNode(
                options,
                options.parentNode ? this.nodes.get(options.parentNode) : this.parentNode,
                this
            );
        }

        (elm as any).node = node; //self.node references the graphnode on the div now
        
        let divs:any[] = Array.from(elm.querySelectorAll('*'));
        if(generateChildElementNodes) { //convert all child divs to additional nodes
            divs = divs.map((d:HTMLElement,i) => this.addElement({element:d}));
        }

        this.elements[options.id] = {element:elm, node, parentNode: (options as CompleteOptions).parentNode, divs};

        if(options.onresize) {
            let onresize = options.onresize;
            options.onresize = (ev) => { onresize(ev, elm, this.elements[options.id]) };
            window.addEventListener('resize', options.onresize as EventListener);
        }

        
        if(!elm.parentNode) {
            setTimeout(()=>{ //slight delay on appendChild so the graph is up to date after other sync loading calls are finished
                if(typeof options.parentNode === 'string') 
                    options.parentNode = document.getElementById(options.parentNode);
                if(typeof options.parentNode === 'object') {
                    // if(options.parentNode.shadowRoot) {
                    //     console.log(options.parentNode.shadowRoot)
                    //     options.parentNode.shadowRoot.appendChild(elm);
                    // } else 
                    options.parentNode.appendChild(elm);
                }

                // // TODO: Figure out why newNode and node don't match...
                // const newNode = this.nodes.get(node.tag)
                // this.elements[options.id].node = newNode
                // // console.log(node.tag, node, newNode, newNode === node)

                if(oncreate) oncreate(elm,this.elements[options.id]);
            },0.01);
        }


        return this.elements[options.id] as ElementInfo;
    }

    createElement = (options: ElementOptions) => {

        let elm: HTMLElement

        if(options.element) {
            if(typeof options.element === 'string') {
                elm = document.querySelector(options.element); //get first element by tag or id 
                if(!elm) elm = document.getElementById(options.element); 
            }
            else elm = options.element;
        }
        else if (options.tagName) elm = document.createElement(options.tagName);
        else if(options.id && document.getElementById(options.id)) elm = document.getElementById(options.id);

        if(!elm) return undefined;
        this.updateOptions(options, elm);

        return elm;
    }

    updateOptions = (options, element): CompleteOptions => {

        if(!options.id && options.tag) options.id = options.tag;
        if(!options.tag && options.id) options.tag = options.id;
        if(!options.id) options.id = `${options.tagName ?? 'element'}${Math.floor(Math.random()*1000000000000000)}`;

        if(typeof options.parentNode === 'string' && document.getElementById(options.parentNode)) 
            options.parentNode = document.getElementById(options.parentNode);
        if(!options.parentNode) {        
            if(!this.parentNode) this.parentNode = document.body;
            options.parentNode = this.parentNode;
        }
       
        element.id = options.id;
        if(options.style) Object.assign(element.style,options.style);
        if(options.innerHTML && element.innerHTML !== options.innerHTML) element.innerHTML = options.innerHTML;
        if(options.innerText && element.innerText !== options.innerText) element.innerText = options.innerText;
        if(options.attributes) Object.assign(element,options.attributes);
        return options;
    }

    //create an element that is tied to a specific node, multiple elements can aggregate
    // with the node
    addComponent=(
        options: ComponentOptions,
        generateChildElementNodes=true
    )=>{
        
        if(options.onrender) {
            let oncreate = options.onrender;
            (options.onrender as any) = (self:DOMElement) => {
                oncreate(self, options as DOMElementInfo);
            }
        }
        if(options.onresize) {
            let onresize = options.onresize;
            (options.onresize as any) = (self:DOMElement) => {
                onresize(self, options as DOMElementInfo);
            }
        }
        if(options.ondelete) {
            let ondelete = options.ondelete;
            (options.ondelete as any) = (self:DOMElement) => {
                ondelete(self, options as DOMElementInfo);
            }
        }
        if(typeof options.renderonchanged === 'function') {
            let renderonchanged = options.renderonchanged;
            (options.renderonchanged as any) = (self:DOMElement) => {
                renderonchanged(self, options as DOMElementInfo);
            }
        }

        class CustomElement extends DOMElement {
            props = options.props;
            styles = options.styles;
            useShadow = options.useShadow;
            template = options.template as any;
            oncreate = options.onrender;
            onresize = options.onresize;
            ondelete = options.ondelete;
            renderonchanged = options.renderonchanged as any;
        }

        if(!options.tagName) options.tagName = `custom-element${Math.random()*1000000000000000}`;

        CustomElement.addElement(options.tagName); 

        let elm = document.createElement(options.tagName);
        let completeOptions = this.updateOptions(options, elm) as DOMElementProps
        this.templates[completeOptions.id] = completeOptions;

        let divs:any[] = Array.from(elm.querySelectorAll('*'));
        if(generateChildElementNodes) { //convert all child divs to additional nodes
            divs = divs.map((d:HTMLElement) => this.addElement({element:d}));
        }

        if(!options.element) options.element = elm;
        if(!options.operator) options.operator = (node,origin,props:{[key:string]:any})=>{ 
            if(typeof props === 'object') 
                for(const key in props) { 
                    if(node.element) {
                        if(typeof node.element[key] === 'function' && typeof props[key] !== 'function')
                            { //attempt to execute a function with arguments
                                if(Array.isArray(props[key]))
                                    node.element[key](...props[key]);
                                else node.element[key](props[key]);
                            } 
                        else if (key === 'style') { Object.assign(node.element[key],props[key])}
                        else node.element[key] = props[key]; 
                    }
                }
                
            return props;
        }

        
        let node:GraphNode;
        if(this.nodes.get(options.id)?.element?.parentNode?.id === options.parentNode || this.nodes.get(options.id)?.parentNode === options.parentNode) {
            node = this.nodes.get(options.id);
            node.element = elm;
        } else {
            node = new GraphNode(
                options,
                options.parentNode ? this.nodes.get(options.parentNode) : this.parentNode,
                this
            );
        }

        (elm as any).node = node; //self.node references the graphnode on the div now

        this.components[completeOptions.id] = {
            element:elm as any,
            class:CustomElement,
            node,
            divs,
            ...completeOptions
        };

                
        if(!elm.parentNode) {
            setTimeout(()=>{ //slight delay on appendChild so the graph is up to date after other sync tree/route loading calls are finished
                if(typeof options.parentNode === 'string') options.parentNode = document.getElementById(options.parentNode);
                if(typeof options.parentNode === 'object') {
                    // if(options.parentNode.shadowRoot)
                    //     options.parentNode.shadowRoot.appendChild(elm);
                    // else 
                    options.parentNode.appendChild(elm);
                }
            },0.01);
        }

        return this.components[completeOptions.id] as DOMElementInfo;
    }

    //create a canvas with a draw loop that can respond to props
    addCanvasComponent=(
        options: CanvasOptions
    ) => {

        if(!options.canvas) {
            options.template = `<canvas `;
            if(options.width) options.template += `width="${options.width}"`;
            if(options.height) options.template += `height="${options.height}"`;
            options.template+=` ></canvas>`;
        } else options.template = options.canvas;
                
        if(options.onrender) {
            let oncreate = options.onrender;
            (options.onrender as any) = (self:DOMElement) => {
                oncreate(self, options as any);
            }
        }
        if(options.onresize) {
            let onresize = options.onresize;
            (options.onresize as any) = (self:DOMElement) => {
                onresize(self, options as any);
            }
        }
        if(options.ondelete) {
            let ondelete = options.ondelete;
            (options.ondelete as any) = (self:DOMElement) => {
                ondelete(self, options as any);
            }
        }
        if(typeof options.renderonchanged === 'function') {
            let renderonchanged = options.renderonchanged;
            (options.renderonchanged as any) = (self:DOMElement) => {
                renderonchanged(self, options as any);
            }
        }

        
        class CustomElement extends DOMElement {
            props = options.props;
            styles = options.styles;
            template = options.template;
            oncreate = options.onrender;
            onresize = options.onresize;
            ondelete = options.ondelete;
            renderonchanged = options.renderonchanged as any;
        }

        if(!options.tagName) options.tagName = `custom-element${Math.random()*1000000000000000}`;

        CustomElement.addElement(options.tagName);         
        let elm = document.createElement(options.tagName);
        const completeOptions = this.updateOptions(options, elm) as CanvasElementProps


        let animation = () => { //default animation
            if((this.components[completeOptions.id as string] as CanvasElementInfo)?.animating) {
                (this.components[completeOptions.id as string] as CanvasElementInfo).draw(this.components[completeOptions.id as string].element,this.components[completeOptions.id as string] as CanvasElementInfo);
                requestAnimationFrame(animation);
            }
        }

        this.templates[completeOptions.id] = completeOptions;

        if(!options.element) options.element = elm;
        if(!options.operator) options.operator = (node,origin,props:{[key:string]:any})=>{ 
            if(typeof props === 'object') 
                for(const key in props) { 
                    if(node.element) {
                        if(typeof node.element[key] === 'function' && typeof props[key] !== 'function')
                            { //attempt to execute a function with arguments
                                if(Array.isArray(props[key]))
                                    node.element[key](...props[key]);
                                else node.element[key](props[key]);
                            } 
                        else if (key === 'style') { Object.assign(node.element[key],props[key])}
                        else node.element[key] = props[key]; 
                    }
                }
                
            return props;
        }

        let node:GraphNode;
        if(this.nodes.get(options.id)?.element?.parentNode?.id === options.parentNode || this.nodes.get(options.id)?.parentNode === options.parentNode) {
            node = this.nodes.get(options.id);
            node.element = elm;
        } else {
            node = new GraphNode(
                options,
                options.parentNode ? this.nodes.get(options.parentNode) : this.parentNode,
                this
            );
        }

        (elm as any).node = node; //self.node references the graphnode on the div now

        let canvas = elm.querySelector('canvas');
        if(completeOptions.style) Object.assign(canvas.style,completeOptions.style); //assign the style object

        let context;
        if(typeof completeOptions.context === 'object') context = options.context;
        else if(typeof completeOptions.context === 'string') context = (canvas as HTMLCanvasElement).getContext(completeOptions.context);

        this.components[completeOptions.id] = {
            element:elm,
            class:CustomElement,
            template:completeOptions.template,
            canvas,
            node,
            ...completeOptions
        } as any;

        (this.components[completeOptions.id] as CanvasElementInfo).context = context;

        (elm as any).canvas = canvas; //make sure everything is accessible;
        (elm as any).context = context; 
        node.canvas = canvas; //make sure everything is accessible;
        node.context = context;
      
        if(!elm.parentNode) {
            setTimeout(()=>{ //slight delay on appendChild so the graph is up to date after other sync tree/route loading calls are finished
                if(typeof options.parentNode === 'string') options.parentNode = document.getElementById(options.parentNode);
                if(typeof options.parentNode === 'object') {
                    // if(options.parentNode.shadowRoot)
                    //     options.parentNode.shadowRoot.appendChild(elm);
                    // else 
                    options.parentNode.appendChild(elm);
                }
            },0.01);
        }
        
        node.runAnimation(animation); //update the animation by calling this function again or setting node.animation manually

        return this.components[completeOptions.id] as CanvasElementInfo;

    }
    
    terminate = (element:string|DOMElement|HTMLElement|DOMElementInfo|CanvasElementInfo)=>{
        if(typeof element === 'object') {
            if((element as CanvasElementInfo).animating)
               (element as CanvasElementInfo).animating = false;

            if((element as DOMElementInfo|CanvasElementInfo).element) element = (element as DOMElementInfo|CanvasElementInfo).element;
         }
        else if(typeof element === 'string' && this.components[element]) {
            if((this.components[element] as CanvasElementInfo).node.isAnimating)
                (this.components[element] as CanvasElementInfo).node.stopNode();
            if((this.components[element] as DOMElementInfo).divs)
                (this.components[element] as DOMElementInfo).divs.forEach((d) => this.terminate(d));
                
            let temp = this.components[element].element;
            delete this.components[element]
            element = temp;
        }
        else if(typeof element === 'string' && this.elements[element]) {
            if(this.elements[element].divs)
                this.elements[element].divs.forEach((d) => this.terminate(d));
            let temp = this.elements[element].element;
            if(this.elements[element].onresize) window.removeEventListener('resize',this.elements[element].onresize as EventListener);
            if(this.elements[element].ondelete) this.elements[element].ondelete(temp,this.elements[element]);
            delete this.elements[element];
            element = temp;
        }
        
        if(element) {
            if(this.nodes.get((element as any).id)) {
                this.removeTree((element as any).id);
            }

            if(element instanceof DOMElement)
                element.delete(); //will trigger the ondelete callback
            else if ((element as HTMLElement)?.parentNode) {
                (element as any).parentNode.removeChild(element);
            }

            return true;
        }
        return false;
    }
    
    defaultRoutes:DOMRoutes = { //declared at the end so everything on this class is defined to pass through as node props
        addElement:this.addElement,
        addComponent:this.addComponent,
        addCanvasComponent:this.addCanvasComponent,
        terminate:this.terminate
    }

}

/**
 * Usage
 */

// import {Router} from '../../routers/Router'

// let router = new Router([
//     DOMService
// ]);

// let elem = router.html.addElement(
// {
//     tagName:'div', //for an existing element, just pass the element object e.g. document.getElementById('testdiv')
//     style:{backgroundColor:'black', width:'100px', height:'100px' },
//     parentNode:document.body,
//     id:'testdiv'
// }
// ); //this adds the element and creates a node that allows you to modify the HTMLElement properties or run functions e.g. click()

// let node = elem.node;
// let div = elem.element; //or node.element 

// setTimeout(()=>{
//     node.run('testdiv',{style:{backgroundColor:'red'}}) //now we can modify properties on the element via node trees, function names can be called to pass an argument or array of arguments (wrap arrays in an array if its a single argument requiring an array)
//     setTimeout(()=>{
//         router.html.run('testdiv',{style:{backgroundColor:'black'}}) //equivalent call via the service stack
//     },1000);
// },1000);


// let comp = router.html.addComponent({
//     template:` 
//         <div>
//             <button>Hello World!</button>
//         </div>
//     `, //or load an html file (if bundling)
//     parentNode:document.body,
//     styles:`
//         div {
//             background-color:black;
//             width:100px;
//             height:100px;
//         }

//         button {
//             background-color: green;
//             color: red;
//         }
//     `, //or load a css file (if bundling, scss also supported natively in esbuild)
//     oncreate:(self:DOMElement,props:any) => { 
//         let button = self.querySelector('button');
//         button.onclick = (ev) => { alert('Hello World!'); }
//     }
// });

// let ccomp = router.html.addCanvasComponent({
//     context:'2d',
//     draw:(self:DOMElement,props:any)=>{
//         let canvas = self.canvas as HTMLCanvasElement;
//         let context = self.context as CanvasRenderingContext2D;

//         context.clearRect(0,0,canvas.width,canvas.height);

//         context.fillStyle = `rgb(0,0,${Math.sin(performance.now()*0.001)*255})`;
//         context.fillRect(0,0,canvas.width,canvas.height);
//     },
//     width:'300px',
//     height:'300px',
//     style:{width:'300px', height:'300px'}
// });