
import {DOMElement} from 'fragelement';

import {Graph} from '../../Graph'

let component = require('./acyclic.graph.html')
if(typeof component !== 'string') component = component.default;


//See: https://github.com/brainsatplay/domelement
export class GraphElement extends DOMElement {

    tree={}

    props={
        graph:new Graph(this.tree),
        nodes:[]
    } //can specify properties of the element which can be subscribed to for changes.
    
    input_delay=1 //onload delay to give the children nodes enough time to get ready with their slight delays to work around the DOM a bit

    //set the template string or function (which can input props to return a modified string)
    template=component;

    constructor() {
        super();

        setTimeout(
            ()=> { //timeout ensures everything is on the DOM before pairing/creating graphnode objects as each is constructed sequentially and run before the next one exists
                //get the child nodes from nested graph-node divs
                let children = Array.from(this.children);
                let top_children = [];
                if(children?.length > 0) {
                    children.forEach((n)=>{
                        if(n.props) this.props.nodes.push(n.props.node);
                        if(n.props && n.parentNode.tagName === this.tagName) top_children.push(n)
                    });
                }

                this.children_ready(children,top_children);
                
            }, 
            this.input_delay
        );
    }

    //like oncreate but once all of the child nodes should be loaded in the DOM, so you don't need to change the constructor
    children_ready(top_children=[]) {
        this.querySelector('#rungraph').onclick = () => { //test 
            //console.log('all children on graph:',all_children,', tree-top nodes: ',top_children);
            top_children.forEach((c)=>{
                c.props._run(c.props,c.props.graph,c.props.input);
            });
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

GraphElement.addElement('graph-element');
