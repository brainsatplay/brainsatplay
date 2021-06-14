import {ObjectListener} from './ObjectListener'

//By Joshua Brewster (MIT)

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

function onChange() {
  console.log('props changed!');
}

const fragment = new DOMFragment(templateStringGen,document.body,htmlprops,onRender,onChange,"NEVER"); 
//Renders a static DOM fragment to the given parent node. 
// Change propUpdateInterval to "FRAMERATE" or any millisecond value and add an 
// onchange function to have the html re-render when the props update and have an 
// additional function fire.

*/

export class DOMFragment {
    /**
     * @ignore
     * @constructor
     * @alias DOMFragment
     * @description Create a DOM fragment.
     * @param {function} templateStringGen - Function to generate template string.
     * @param {HTMLElement} parentNode HTML DOM node to append fragment into.
     * @param {callback} onRender Callback when element is rendered. Use to setup html logic via js
     * @param {callback} onchange Callback when element is changed.
     * @param {int} propUpdateInterval How often to update properties.
     * @param {callback} ondelete Called just before the node is deleted (e.g. to clean up animations)
     * @param {callback} onresize Called on window resize, leave undefined to not create resize events
     */
    constructor(templateStringGen=this.templateStringGen, parentNode=document.body, props={}, onRender=(props)=>{}, onchange=(props)=>{}, propUpdateInterval="NEVER", ondelete=(props)=>{}, onresize=undefined) {
        this.onRender = onRender;
        this.onchange = onchange;
        this.ondelete = ondelete;
        this.onresize = onresize;

        this.parentNode = parentNode;
        if(typeof parentNode === "string") {
            this.parentNode = document.getElementById(parentNode);
        }
        this.renderSettings = {
            templateStringGen: templateStringGen,
            props: props
        }
        this.templateString = ``;
        if(typeof templateStringGen === 'function') {
            this.templateString = templateStringGen(props);
        }
        else {
            this.templateString = templateStringGen;
        }
        
        var interval = propUpdateInterval;
        if(this.renderSettings.props === {}) {interval = "NEVER";}
        this.node = null;

        this.listener = undefined;
    
        if((Object.keys(this.renderSettings.props).length > 0) && !(interval === null || interval === undefined || interval === "NEVER")) {
            console.log("making listeners for ", templateStringGen);
            this.listener = new ObjectListener();

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
                this.onchange();
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

        if(typeof this.onresize === 'function') {
            this.setNodeResizing();
        }

    }

    //called after a change in props are detected if interval is not set to "NEVER"
    onchange = (props=this.renderSettings.props) => {}

    //called after the html is rendered
    onRender = (props=this.renderSettings.props) => {}

    //called BEFORE the node is removed
    ondelete = (props=this.renderSettings.props) => {}

    onresize = undefined  //define resizing function

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
        this.ondelete(); //called BEFORE the node is removed
        var node = document.getElementById(nodeId);
        parentNode.removeChild(node);
    }
  
    //Remove Element Parent By Element Id (for those pesky anonymous child fragment containers)
    removeParent(elementId) {
        // Removes an element from the document
        if(typeof this.onresize === 'function') {
            this.removeNodeResizing();
        }
        this.ondelete();
        var element = document.getElementById(elementId);
        element.parentNode.parentNode.removeChild(element.parentNode);
    }

    renderNode(parentNode=this.parentNode){
        this.node = this.appendFragment(this.templateString,parentNode);
        this.onRender(this.renderSettings.props);
    }

    setNodeResizing() {
        if(typeof this.onresize === 'function') {
            if(window.attachEvent) {
                window.attachEvent('onresize', this.onresize);
            }
            else if(window.addEventListener) {
                window.addEventListener('resize', this.onresize, true);
            }
        }
    }

    removeNodeResizing() {
        if(typeof this.onresize === 'function') {
            if(window.detachEvent) {
                window.detachEvent('onresize', this.onresize);
            }
            else if(window.removeEventListener) {
                window.removeEventListener('resize', this.onresize, true);
            }
        }
    }

    updateNode(parentNode=this.parentNode, node=this.node, props=this.props){
        parentNode.removeChild(node);
        if(typeof this.renderSettings.templateStringGen === 'function') {
            this.templateString = this.renderSettings.templateStringGen(this.props);
        }
        else {
            this.templateString = this.renderSettings.templateStringGen;
        }
        this.renderNode(parentNode, props);
    }

    deleteNode(node=this.node) {
        if(typeof this.onresize === 'function') {
            this.removeNodeResizing();
        }
        if(typeof node === "string"){
            this.ondelete();
            thisNode = document.getElementById(node);
            thisNode.parentNode.removeChild(thisNode);
            this.node = null;
        }
        else if(typeof node === "object"){
            this.ondelete();
            node.parentNode.removeChild(node);
            this.node = null;
        }
    }

    //Add a scoped stylesheet after begin
    appendStylesheet(styles="", node=this.node) {
        if(typeof styles === 'string') {
            var link = document.createElement('link');
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = styles;

            node.insertAdjacentElement('afterbegin',link);
        }
        else if (Array.isArray(styles)) {
            styles.forEach((style) => {
                var link = document.createElement('link');
                link.rel = "stylesheet";
                link.type = "text/css";
                link.href = style;

                node.insertAdjacentElement('afterbegin',link);
            });
        }
        else if (typeof styles === 'function') {
            let stylehtml = styles();
            node.insertAdjacentHTML('afterbegin',stylehtml);
        }
    }
}
