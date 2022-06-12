
import {DOMElement} from 'fragelement';

import {GraphNode} from '../../Graph'

let component = require('./graph.node.html')
if(typeof component !== 'string') component = component.default;

//See: https://github.com/brainsatplay/domelement
export class NodeElement extends DOMElement {
    props={ //this is the graph node properties!!
        //add any props (these can be set as html properties)
        operator:(
            self, //'this' node
            origin, //origin node
            ...args //input, e.g. output from another node
        )=>{ console.log(this.tag,' input: ',args); return args; }, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
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
        graph:undefined //parent AcyclicGraph instance, can set manually or via enclosing acyclic-graph div
    }; //can specify properties of the element which can be subscribed to for changes.

    input_delay=1 //onload runNode delay for graph nodes to run operations on inputs, they will not recognize their children otherwise as the DOM loads

    //set the template string or function (which can input props to return a modified string)
    template=component;

    //gotta customize this a little from the default DOMElement
    render = (props=this.props) => {

        //console.log('rendering!')

        if(typeof this.template === 'function') this.templateString = this.template(props); //can pass a function
        else this.templateString = this.template;

        //this.innerHTML = this.templateString;

        
        const t = document.createElement('template');
        t.innerHTML = this.templateString;
        const fragment = t.content;

        if(this.FRAGMENT) { //will reappend the fragment without reappending the whole node if already rendered once
            if(this.useShadow) {
                this.shadowRoot.removeChild(this.FRAGMENT);
            }   
            else this.removeChild(this.FRAGMENT); 
        }
        if(this.useShadow) {
            if(!this.attachedShadow) this.attachShadow({mode:'open'});
            this.shadowRoot.prepend(fragment); //now you need to use the shadowRoot.querySelector etc.
            this.FRAGMENT = this.shadowRoot.childNodes[0];
        }   
        else this.prepend(fragment);
        this.FRAGMENT = this.childNodes[0];
        //this.appendChild(fragment);
        
        
        //add this here which will run a routine AFTER rendering so the elements can be updated
        this.setupNode(props);

        //console.log('Node tag: ',props.tag,', parent: ',props.parent);
        if(this.props.input) { //e.g. run the node on input
            setTimeout(async()=>{
                if(Array.isArray(this.props.input)) this.props._run(this.props,this.props.graph,...this.props.input); 
                else this.props._run(this.props,this.props.graph,this.props.input); //run the inputs on the nodes once the children are loaded on the DOM so things propagate correctly
            },
            this.input_delay //makes sure children are loaded (e.g. on a DOM with a lot of loading, should add some execution delay to anticipate it as initial nodes are not aware of later-rendered nodes on the DOM)
            );
        }
        if(this.oncreate) this.oncreate(props,this); //set scripted behaviors
    }

    setupNode(props) {
        let parent = this.parentNode;
        if(parent.props?.operator) { //has operator, this is a graph-node (in case you extend it with a new tagName)
            if(parent.props?.node) props.parent = parent.props;
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

        if(props.graph && !props && props.tag) props = props.graph.nodes.get(props.tag); //can try to get graph nodes by id or tag
        else if(props.graph && typeof props === 'string') props = props.graph.nodes.get(props); //can try to get graph nodes by id or tag
        
        if(props instanceof GraphNode) props = props;
        if(!props) props = new GraphNode(props, props.parent, props.graph); //you could pass a graphnode 

        props.tag = props.tag;
        if(!this.id) this.id = props.tag;


        if(props.parent) {
            props.parent.addChildren(props);
        }
    }

    
    //DOMElement custom callbacks:
    oncreate=undefined;     //(props,self)=>{} when the node is created e.g. setting up buttons (props) => {}
    ondelete=undefined;     //(props,self)=>{} when the node is deleted, e.g. cleaning up events (props) => {}
    onresize=undefined;     //(props,self) => {} run on window.onresize event 
    onchanged=undefined;    //if props change, e.g. re-render? (props,self) => {}. Using past tense to not conflict with built in onchange event in most elements
    renderonchanged=false;  //(props,self) => {}  //true or a function fired after rerendering, will auto trigger rerenders when props changed
}

//window.customElements.define('custom-', Custom);

NodeElement.addElement('graph-node');
