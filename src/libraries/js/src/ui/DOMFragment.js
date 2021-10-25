import {ObjectListener} from './ObjectListener'

//By Joshua Brewster (MIT)

/* 
const htmlprops = {
  id:'template1'
};

function templateStringGen(props) { //write your html in a template string
    return `
    <div id=${props.id}>Clickme</div>
    `;
}

function onRender(props) { //setup html
    document.getElementById(props.id).onclick = () => { 
      document.getElementById(props.id).innerHTML = "Clicked!"; 
    }
}

function onchange(props) { //optional if you want to be able to auto-update the html with changes to the properties, not recommended if you only want to update single divs
  console.log('props changed!', props);
}

function ondelete(props) { //called before the node is deleted, use to clean up animation loops and event listeners
}

function onresize() { //adds a resize listener to the window, this is automatically cleaned up when you delete the node.
}

const fragment = new DOMFragment(
                        templateStringGen,
                        document.body,
                        htmlprops,
                        onRender,
                        undefined, //onchange
                        "NEVER", //"FRAMERATE" //1000
                        ondelete,
                        onresize
                      ); 
                      
//... later ...
fragment.deleteNode(); //deletes the rendered fragment if you are done with it.

*/

export class DOMFragment {
    /**
     * @ignore
     * @constructor
     * @alias DOMFragment
     * @description Create a DOM fragment.
     * @param {function} templateStringGen - Function to generate template string (or template string itself, or Element)
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
        this.props = this.renderSettings.props;
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

    }

    //called after a change in props are detected if interval is not set to "NEVER"
    onchange = (props=this.renderSettings.props) => {}

    //called after the html is rendered
    onRender = (props=this.renderSettings.props) => {}

    //called BEFORE the node is removed
    ondelete = (props=this.renderSettings.props) => {}

    onresize = undefined  //define resizing function

    //appendId is the element Id you want to append this fragment to
    appendFragment(toAppend, parentNode) {
        if (this.isElement(toAppend)) parentNode.appendChild(toAppend);
        else {
            var template = document.createElement('template');
            template.innerHTML = toAppend;
            var fragment = template.content;
            parentNode.appendChild(fragment);
        }
        return parentNode.children[parentNode.children.length-1];
    }

    isElement = (element) => {
        return element instanceof Element || element instanceof HTMLDocument;  
    }
  
    //delete selected fragment. Will delete the most recent fragment if Ids are shared.
    deleteFragment(parentNode,nodeId) {
        this.ondelete(this.renderSettings.props); //called BEFORE the node is removed
        var node = document.getElementById(nodeId);
        parentNode.removeChild(node);
    }
  
    //Remove Element Parent By Element Id (for those pesky anonymous child fragment containers)
    removeParent(elementId) {
        // Removes an element from the document
        if(typeof this.onresize === 'function') {
            this.removeNodeResizing();
        }
        this.ondelete(this.renderSettings.props);
        var element = document.getElementById(elementId);
        element.parentNode.parentNode.removeChild(element.parentNode);
    }

    renderNode(parentNode=this.parentNode){
        this.node = this.appendFragment(this.templateString,parentNode);
        this.onRender(this.renderSettings.props);
        if(typeof this.onresize === 'function') {
            this.setNodeResizing();
        }
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
            this.ondelete(this.renderSettings.props);
            thisNode = document.getElementById(node);
            thisNode.parentNode.removeChild(thisNode);
            this.node = null;
        }
        else if(typeof node === "object"){
            this.ondelete(this.renderSettings.props);
            if (node) node.parentNode.removeChild(node);
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
            let styleResult = styles();

            if (node){
                if (typeof styleResult === 'string') node.insertAdjacentHTML('afterbegin',styleResult);
                else node.insertAdjacentElement('afterbegin',styleResult);
            }
        }
    }
}
