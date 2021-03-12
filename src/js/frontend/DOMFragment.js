import {ObjectListener} from './ObjectListener'


/* 
const htmlprops;

function templateStringGen(props) {
    return `
    <div id=`+props.id+`>Clickme</div>
    `;
}

function onRender() {
    document.getElementById(htmlprops.id).onclick = () => { document.getElementById(htmlprops.id).innerHTML = "Clicked!"; }
}

const fragment = new DOMFragment(templateStringGen,document.body,htmlprops,onRender,undefined,"NEVER"); 
//Renders a static DOM fragment to the given parent node. 
// Change propUpdateInterval to "FRAMERATE" or any millisecond value and add an 
// onchange function to have the html re-render when the props update and have an 
// additional function fire.

*/

export class DOMFragment {
    constructor(templateStringGen=this.templateStringGen, parentNode=document.body, props={}, onRender=()=>{}, onchange=()=>{}, propUpdateInterval="NEVER") {
        this.templateStringGen = templateStringGen(props);
        this.onRender = onRender;
        
        this.parentNode = parentNode;
        if(typeof parentNode === "string") {
            this.parentNode = document.getElementById(parentNode);
        }
        this.renderSettings = {
            templateStringGen: templateStringGen,
            onchange: onchange,
            props: props
        }
        this.templateString = templateStringGen(props);
        var interval = propUpdateInterval;
        if(this.renderSettings.props === {}) {interval = "NEVER";}
        this.node = null;

        this.listener = new ObjectListener();
    
        if((Object.keys(this.renderSettings.props).length > 0) && !(interval === null || interval === undefined || interval === "NEVER")) {
            console.log("making listeners for ", templateStringGen)

            const templateChange = () => {
                this.updateNode();
            }

            this.listener.addListener(
                'templateChange',
                this.renderSettings,
                'templateStringGen',
                templateChange, 
                interval
                );

            const propsChange = () => {
                this.updateNode();
                this.renderSettings.onchange();
            }

            this.listener.addListener(
                'props',
                this.renderSettings,
                'props',
                propsChange, 
                interval
            );
        }
      
        this.renderNode();
    }

    onRender = () => {}

    //appendId is the element Id you want to append this fragment to
    appendFragment(HTMLtoAppend, parentNode) {
        var template = document.createElement('template');
        template.innerHTML = HTMLtoAppend;
        var fragment = template.content;
        parentNode.appendChild(fragment);
        return parentNode.children[parentNode.children.length-1];
    }
  
    //delete selected fragment. Will delete the most recent fragment if Ids are shared.
    deleteFragment(parentNode,nodeId) {
        var node = document.getElementById(nodeId);
        parentNode.removeChild(node);
    }
  
    //Remove Element Parent By Element Id (for those pesky anonymous child fragment containers)
    removeParent(elementId) {
        // Removes an element from the document
        var element = document.getElementById(elementId);
        element.parentNode.parentNode.removeChild(element.parentNode);
    }

    renderNode(parentNode=this.parentNode){
        this.node = this.appendFragment(this.templateString,parentNode);
        this.onRender();
    }

    updateNode(parentNode=this.parentNode, node=this.node, props=this.props){
        parentNode.removeChild(node);
        this.templateString = this.renderSettings.templateStringGen(this.props);
        this.renderNode(parentNode, props);
    }

    deleteNode(node=this.node) {
        if(typeof node === "string"){
            thisNode = document.getElementById(node);
            thisNode.parentNode.removeChild(thisNode);
            this.node = null;
        }
        else if(typeof node === "object"){
            node.parentNode.removeChild(node);
            this.node = null;
        }
    }
}
