
import {addCustomElement} from 'fragelement';

import {NodeDiv} from '../graph.node.js'
import component from './canvas.node.html'
if(typeof component !== 'string') component = component.default;


//See: https://github.com/brainsatplay/domelement
export class CanvasNode extends NodeDiv {
    props={
        
        animation:(
            node,
            origin,
            input
        )=>{
            this.draw(node,origin,input);
            for(let i = 0; i < this.drawFuncs.length; i++) { //lets use other nodes to send draw functions to the canvas
                let f = this.drawFuncs[i];
                if(typeof f === 'function') {
                    f(node,origin,input); //pass the args in (need these if you pass arrow functions)
                }
            }
        },
        operator:(
            node,
            origin,
            input,
        )=>{ 

            //if(cmd === 'animate') {
                //draw loop
                
            //} else {
                //e.g. input commands
                if(typeof input === 'object') {
                    
                } else if (typeof input === 'number') {
                    
                } else if (typeof input === 'string') {
                    
                } else {
                    
                }
            //}
        },
        forward:true, //pass output to child nodes
        backward:false, //pass output to parent node
        children:undefined, //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
        parent:undefined, //parent graph node
        delay:false, //ms delay to fire the node
        repeat:false, // set repeat as an integer to repeat the input n times
        recursive:false, //or set recursive with an integer to pass the output back in as the next input n times
        animate:true, //true or false
        loop:undefined, //milliseconds or false
        tag:undefined, //generated if not specified, or use to get another node by tag instead of generating a new one
        input:undefined,// can set on the attribute etc
        graph:undefined, //parent AcyclicGraph instance, can set manually or via enclosing acyclic-graph div
        node:undefined, //GraphNode instance, can set manually or as a string to grab a node by tag (or use tag)
    }; //can specify properties of the element which can be subscribed to for changes.

    //set the template string or function (which can input props to return a modified string)
    template=component;

    draw(node,origin,...input) {
        let canvas = this.props.canvas;
        let ctx = this.props.ctx;
    }

    addDraw(f) {
        if(typeof f === 'function') this.drawFuncs.push(f);
    }

    drawFuncs = []; // draw(input,args,origin,cmd){} <--- passes operator args
    
    //DOMElement custom callbacks:
    oncreate=(props)=>{
        this.canvas = this.querySelector('canvas');
        if(props.width) {
            this.canvas.width = props.width;
            this.canvas.style.height = props.height;
        }
        if(props.height) {
            this.canvas.height = props.height;
            this.canvas.style.height = props.height;
        }
        if(props.style) {
            this.canvas.style = props.style;
            setTimeout(()=>{
                this.canvas.height = this.canvas.clientHeight;
                this.canvas.width = this.canvas.clientWidth;
            },10); //slight recalculation delay time
        }

        props.canvas = this.canvas;
        if(props.context) props.context = this.canvas.getContext(props.context);
        else props.context = this.canvas.getContext('2d');
        this.context = props.context;
        this.ctx = this.context;
        props.ctx = this.context;

        setTimeout(()=>{if(props.animate) props.node.runAnimation();},10) //manually triggered

    }

    //after rendering
    onresize=(props)=>{
        if(this.canvas) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.canvas.style.width = this.canvas.clientWidth;
            this.canvas.style.height = this.canvas.clientHeight;
        }
    } //on window resize
    //onchanged=(props)=>{} //on props changed
    //ondelete=(props)=>{} //on element deleted. Can remove with this.delete() which runs cleanup functions
}

//window.customElements.define('custom-', Custom);

CanvasNode.addElement('canvas-node');
