
import {addCustomElement} from 'fragelement';

import {NodeDiv} from '../graph.node'

let component = require('./circlecanvas.node.html').default;

//See: https://github.com/brainsatplay/domelement
export class CircleCanvasNode extends NodeDiv {
    props={
        radius:20,
        triggered:false,
        animation:(
            node,
            origin,
            input
        ) => {


            if(!this.props.triggered) {
                this.props.radius += Math.random()-0.5;
            }

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
             
            //} else {
                if(typeof input === 'object') {
                    if(input.radius) this.props.radius += input.radius;
                    this.props.triggered = true;
                } else if (typeof input === 'number') {
                    this.props.radius += input;
                    this.props.triggered = true;
                } else if (typeof input === 'string') {
                    this.props.radius += parseFloat(input);
                    this.props.triggered = true;
                } else {
                    this.props.radius += Math.random()-0.5;
                    this.props.triggered = true;
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

    draw(node,origin,input) {
        let canvas = this.props.canvas;
        let ctx = this.props.ctx;
        if(this.props.radius <= 1) this.props.radius = 1;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        this.drawCircle(
            canvas.width*0.5,
            canvas.height*0.5,
            this.props.radius,
            'green',
            5,
            '#003300'
        );
    }

    addDraw(f) {
        if(typeof f === 'function') this.drawFuncs.push(f);
    }

    drawFuncs = []; // draw(input,args,origin,cmd){} <--- passes operator args
        
    drawCircle(centerX, centerY, radius, fill='green', strokewidth=5, strokestyle='#003300') {
        this.props.ctx.beginPath();
        this.props.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        this.props.ctx.fillStyle = fill;
        this.props.ctx.fill();
        this.props.ctx.lineWidth = strokewidth;
        this.props.ctx.strokeStyle = strokestyle;
        this.props.ctx.stroke();
    }

    drawLine(
        from={x:0,y:0},
        to={x:1,y:1},
        strokewidth=5,
        strokestyle='#003300'
    ) {
        this.props.ctx.beginPath();
        this.props.ctx.lineWidth = strokewidth;
        this.props.ctx.strokeStyle = strokestyle;
        this.props.ctx.moveTo(from.x, from.y);
        this.props.ctx.lineTo(to.x, to.y);
        this.props.ctx.stroke();
    }
    
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

        setTimeout(()=>{if(props.animate) props.node.runAnimation();},10)  //manually triggered

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

CircleCanvasNode.addElement('circlecanvas-node');
