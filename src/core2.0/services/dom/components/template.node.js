
import {NodeDiv} from './graph.node.js'

let component = require('./template.node.html');
if(typeof component !== 'string') component = component.default;


//See: https://github.com/brainsatplay/domelement
export class TemplateNode extends NodeDiv {
    props={ //this is the graph node properties!!
        operator:( 
            node,  //'this' node
            origin, //origin node
            ...args //input, e.g. output from another node, can be a spread array
        )=>{ console.log(input); return input; }, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
        forward:true, //pass output to child nodes
        backward:false, //pass output to parent node
        children:undefined, //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
        parent:undefined, //parent graph node
        delay:false, //ms delay to fire the node
        repeat:false, // set repeat as an integer to repeat the input n times
        recursive:false, //or set recursive with an integer to pass the output back in as the next input n times
        frame:false, //execute repeat/recursive on requestAnimationFrame?
        animate:false, //true or false
        loop:undefined, //milliseconds or false
        tag:undefined, //generated if not specified, or use to get another node by tag instead of generating a new one
        input:undefined,// can set on the attribute etc
        graph:undefined, //parent AcyclicGraph instance, can set manually or via enclosing acyclic-graph div
        node:undefined, //GraphNode instance, can set manually or as a string to grab a node by tag (or use tag)
    }; //can specify properties of the element which can be subscribed to for changes.

    //set the template string or function (which can input props to return a modified string)
    template=component;

    //this will trigger shadow dom and wrap the text with a <style></style> tag
    styles=`
        #template {
            background-color:black;
            color:white;
            font-size:32px;
        }
    ` 
    //DOMElement custom callbacks:
    oncreate=undefined;     //(props,self)=>{} when the node is created e.g. setting up buttons (props) => {}
    ondelete=undefined;     //(props,self)=>{} when the node is deleted, e.g. cleaning up events (props) => {}
    onresize=undefined;     //(props,self) => {} run on window.onresize event 
    onchanged=undefined;    //if props change, e.g. re-render? (props,self) => {}. Using past tense to not conflict with built in onchange event in most elements
    renderonchanged=false;  //(props,self) => {}  //true or a function fired after rerendering, will auto trigger rerenders when props changed
}

//window.customElements.define('custom-', Custom);

TemplateNode.addElement('template-node');
