
import {addCustomElement} from 'fragelement';

import {NodeDiv} from '../graph.node'

let component = require('./button.node.html');
if(typeof component !== 'string') component = component.default;


//See: https://github.com/brainsatplay/domelement
export class ButtonNode extends NodeDiv {
    props={ //this is the graph node properties!!
        operator:(node,origin,input)=>{ 
            if(input) this.props.input = input;
            return this.props.input; 
        }, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
        forward:true, //pass output to child nodes
        backward:false, //pass output to parent node
        children:undefined, //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
        delay:false, //ms delay to fire the node
        repeat:false, // set repeat as an integer to repeat the input n times
        recursive:false, //or set recursive with an integer to pass the output back in as the next input n times
        frame:false,
        animate:false, //true or false
        loop:undefined, //milliseconds or false
        tag:undefined, //generated if not specified, or use to get another node by tag instead of generating a new one
        input:undefined,// can set on the attribute etc
        graph:undefined, //parent AcyclicGraph instance, can set manually or via enclosing acyclic-graph div
        node:undefined, //GraphNode instance, can set manually or as a string to grab a node by tag (or use tag)
    }; //can specify properties of the element which can be subscribed to for changes.

    //set the template string or function (which can input props to return a modified string)
    template=component;
    
    //DOMElement custom callbacks:
    oncreate=(props)=>{
        console.log(this.template)
        let button = this.querySelector('button');
        if (button) button.onclick = (ev) => {
            props.node.run(props.input);
        }
    } //after rendering
    //onresize=(props)=>{} //on window resize
    //onchanged=(props)=>{} //on props changed
    //ondelete=(props)=>{} //on element deleted. Can remove with this.delete() which runs cleanup functions
}

//window.customElements.define('custom-', Custom);

ButtonNode.addElement('button-node');
