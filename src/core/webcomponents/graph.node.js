
import {DOMElement} from 'fragelement';

import {Graph} from '../Graph'

let component = require('./graph.node.html').default;

//See: https://github.com/brainsatplay/domelement
export class NodeDiv extends DOMElement {
    props={ //this is the graph node properties!!
        //add any props (these can be set as html properties)
        operator:(
            self, //'this' node
            origin, //origin node
            input, //input, e.g. output from another node
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
        node:undefined, //GraphNode instance, will be created or you can set manually or as a string to grab a node by tag (or use tag)
    }; //can specify properties of the element which can be subscribed to for changes.

    input_delay=100 //onload runNode delay for graph nodes to run operations on inputs, they will not recognize their children otherwise as the DOM loads

    //set the template string or function (which can input props to return a modified string)
    template=component;

    //gotta customize this a little from the default DOMElement
    render = (props=this.props) => {

        if(typeof this.template === 'function') this.templateString = this.template(props); //can pass a function
        else this.templateString = this.template;

        //this.innerHTML = this.templateString;

        const t = document.createElement('template');
        t.innerHTML = this.templateString;
        const fragment = t.content;
        if(this.fragment) { //will reappend the fragment without reappending the whole node if already rendered once
            this.removeChild(this.fragment); 
        }
        this.fragment = fragment;
        console.log(this.fragment, this.templateString, this.template)
        this.appendChild(fragment);
        
        
        //add this here which will run a routine AFTER rendering so the elements can be updated
        this.setupNode(this.props);
        if(this.props.input) { //e.g. run the node on input
            setTimeout(async()=>{
                this.props.node._run(this.props.node,this.props.graph,this.props.input); //run the inputs on the nodes once the children are loaded on the DOM so things propagate correctly
            },
            this.input_delay //makes sure children are loaded (e.g. on a DOM with a lot of loading, should add some execution delay to anticipate it as initial nodes are not aware of later-rendered nodes on the DOM)
            );
        }
        if(this.oncreate) this.oncreate(props); //set scripted behaviors
    }

    setupNode(props) {
        let parent = this.parentNode;
        if(parent.props?.operator) { //has operator, this is a graph-node (in case you extend it with a new tagName)
            if(parent.props?.node) props.parent = parent.props.node;
        }
        if(!props.graph) {   
            while(!parent.props?.nodes) { //has nodes prop, is an acyclic-graph
                // console.log(parent)
                // console.log(parent.tagName)
                if(parent.constructor.name === 'HTMLBodyElement' || parent.constructor.name === 'HTMLHeadElement' || parent.constructor.name === 'HTMLHtmlElement' || parent.constructor.name === 'HTMLDocument') {
                    //console.error("No AcyclicGraph Found")
                    break;
                }
                parent = parent.parentNode;
            }
            if(parent.props?.nodes) {
                props.graph = parent.props.graph;
                props.input_delay = parent.props.input_delay;
            }
        }
        if(this.id && !props.tag) props.tag = this.id;

        if(props.graph && !props.node && props.tag) props.node = props.graph.nodes.get(props.tag); //can try to get graph nodes by id or tag
        else if(props.graph && typeof props.node === 'string') props.node = props.graph.nodes.get(props.node); //can try to get graph nodes by id or tag
        
        if(!props.node) props.node = new Graph(props, props.parent, props.graph); //you could pass a graphnode 

        props.tag = props.node.tag;
        if(!this.id) this.id = props.tag;

        if(props.parent) {
            props.parent.addChildren(props.node);
        }
    }

    
    //DOMElement custom callbacks:
    //oncreate=(props)=>{} //after rendering
    //onresize=(props)=>{} //on window resize
    //onchanged=(props)=>{} //on props changed
    //ondelete=(props)=>{} //on element deleted. Can remove with this.delete() which runs cleanup functions
}

//window.customElements.define('custom-', Custom);

NodeDiv.addElement('graph-node');
