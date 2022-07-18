//from 'fragelement' on npm by Joshua Brewster (AGPL v3.0)
export class DOMElement extends HTMLElement { 

    template = (props, self=this) => { //return a string or html node
        return `<div> Custom Fragment Props: ${JSON.stringify(props)} </div>`
    }; //override the default template string by extending the class, or use options.template if calling the base class
    props = {};
    useShadow = false; //can set to attach a shadow DOM instead (local styles)
    styles; //can set a style sheet which will toggle the shadow dom by default
  
    oncreate; //(self,props) => {}  fires on element creation (e.g. to set up logic)
    onresize; //(self,props) => {} fires on window resize
    ondelete; //(self,props) => {} fires after element is deleted
    onchanged; //(props) => {} fires when props change
    renderonchanged=false; //(self,props) => {} fires after rerendering on props change

    FRAGMENT;
    attachedShadow = false;

    obsAttributes=["props","options","onchanged","onresize","ondelete","oncreate","template"]
 
    get observedAttributes() {
        return this.obsAttributes;
    }

    get obsAttributes() {
        return this.obsAttributes;
    }

    set obsAttributes(att) {
        if(typeof att === 'string') {
            this.obsAttributes.push(att);
        } else if (Array.isArray(att)) this.obsAttributes=att;
    }

    static get tag(){return this.name.toLowerCase()+'-'} //tagName, default 'classname-'. Set as a static variable for the internal addElement to reference

    //add self or a specified class to the window which can be used via html like <custom-tag></custom-tag>
    //will default be the classname with a '-' at the end if no tag supplied
    static addElement(tag=this.tag,cls=this,extend=undefined) {
        addCustomElement(cls,tag,extend);
    }

    attributeChangedCallback(name, old, val) {
        if(name === 'onchanged') {
            let onchanged = val;
            if(typeof onchanged === 'string') onchanged = parseFunctionFromText(onchanged);
            if(typeof onchanged === 'function') { 
                this.onchanged =  onchanged;
                this.state.data.props = this.props;
                this.state.unsubscribeTrigger('props'); //remove any previous subs
                this.state.subscribeTrigger('props',this.onchanged);
                let changed = new CustomEvent('changed', {detail: { props:this.props, self:this }});
                this.state.subscribeTrigger('props',()=>{this.dispatchEvent(changed)});
            }
        }
        else if(name === 'onresize') {
            let onresize = val;
            if(typeof onresize === 'string')  onresize = parseFunctionFromText(onresize);
            if(typeof onresize === 'function') {
                if(this.ONRESIZE) {
                    try { window.removeEventListener('resize',this.ONRESIZE); } catch(err) {}
                }
                this.ONRESIZE = (ev) => { this.onresize(this.props,this); } 
                this.onresize = onresize;
                window.addEventListener('resize',this.ONRESIZE);
            }
        }
        else if(name === 'ondelete') {
            let ondelete = val;
            if(typeof ondelete === 'string') ondelete = parseFunctionFromText(ondelete);
            if(typeof ondelete === 'function') { 
                this.ondelete = () => {
                    if(this.ONRESIZE) window.removeEventListener('resize',this.ONRESIZE);
                    this.state.unsubscribeTrigger('props');
                    if(ondelete) ondelete(this.props,this);
                }
            }
        }
        else if(name === 'oncreate') { 
            let oncreate = val;
            if(typeof oncreate === 'string') oncreate = parseFunctionFromText(oncreate);
            if(typeof oncreate === 'function') { 
                this.oncreate = oncreate;
            }
        }
        else if(name === 'renderonchanged') {
            let rpc = val;
            if(typeof this.renderonchanged === 'number') this.unsubscribeTrigger(this.renderonchanged);
            if(typeof rpc === 'string') rpc = parseFunctionFromText(rpc);
            if(typeof rpc === 'function') {
                this.renderonchanged = this.state.subscribeTrigger('props', (p)=>{this.render(p); rpc(this,p);}); //rerender then call the onchanged function if provided
            }
            else if(rpc != false) this.renderonchanged = this.state.subscribeTrigger('props',this.render); //just rerender automatically if set to true instead of a function
        }
        else if(name === 'props') { //update the props, fires any onchanged stuff
            let newProps = val;
            if(typeof newProps === 'string') newProps = JSON.parse(newProps);

            Object.assign(this.props,newProps);
            this.state.setState({props:this.props});
        }
        else if(name === 'template') { //change the html template

            let template = val;

            this.template = template; //function or string;
            
            //render the new template
            this.render(this.props);
            let created = new CustomEvent('created', {detail: { props:this.props }});
            this.dispatchEvent(created);

        }
        else { //arbitrary attributes
            let parsed = val;
            if(name.includes('eval_')) { // e.g. <custom-  eval_loginput="(input)=>{console.log(input);}"></custom-> //now elm.loginput(input) should work
                name = name.split('_')
                name.shift()
                name = name.join();
                parsed = parseFunctionFromText(val);  
            }
            else if (typeof val === 'string') {
                try {
                    parsed = JSON.parse(val)
                } catch (err) {
                    parsed = val;
                }
            }
            this[name] = parsed; // set arbitrary props 
            if(name !== 'props') this.props[name] = parsed; //reflect it in the props object (to set props via attributes more easily)
            //this.props[name] = val; //set arbitrary props via attributes
        }
    }

    connectedCallback() {

        // set initial props
        let newProps = this.getAttribute('props');
        if(typeof newProps === 'string') newProps = JSON.parse(newProps);

        Object.assign(this.props,newProps);
        this.state.setState({props:this.props});

        //Observe arbitrary attributes
        Array.from(this.attributes).forEach((att) => {
            let name = att.name;
            //console.log(name,this.getAttribute(name),this[name])
            //get/set/observe arbitrary attributes
            let parsed = att.value;
            if(name.includes('eval_')) { // e.g. <custom-  eval_loginput="(input)=>{console.log(input);}"></custom-> //now elm.loginput(input) should work
                name = name.split('_')
                name.shift()
                name = name.join();
                parsed = parseFunctionFromText(att.value);  
            }
            else if (typeof att.value === 'string') {
                try {
                    parsed = JSON.parse(att.value)
                } catch (err) {
                    parsed = att.value;
                }
            }
            if(!this[name]) {
                Object.defineProperties(
                    this, att, {
                        value:parsed,
                        writable:true,
                        get() { return this[name]; },
                        set(val) { this.setAttribute(name, val); }
                    }
                )
            }
            this[name] = parsed;
            if(name !== 'props') this.props[name] = parsed; //set on props too (e.g. to more easily modify initial conditions without stringifying an object)
            this.obsAttributes.push(name);
            
            //console.log(this.observedAttributes);
        });

        let resizeevent = new CustomEvent('resized', {detail: { props:this.props, self:this }});
        let changed = new CustomEvent('changed', {detail: { props:this.props, self:this }});
        let deleted = new CustomEvent('deleted', {detail: { props:this.props, self:this }});
        let created = new CustomEvent('created', {detail: { props:this.props, self:this }});
        //now we can add event listeners for our custom events

        
        if(this.styles) {
            let elm = `
            <style>
                ${templateStr}
            </style>
            `;

            if(this.template.indexOf('<style')) {
                this.template.splice(this.template.indexOf('<style'+7),this.template.indexOf('</style'),templateStr);
            } else {
                if(this.template.indexOf('<head')) {
                    this.template.splice(this.template.indexOf('<head'+6),0,elm);
                } else this.template = elm + this.template;
            }

            this.useShadow = true;
        }

        this.render(this.props);
        this.dispatchEvent(created);

        this.state.subscribeTrigger('props',()=>{this.dispatchEvent(changed)});

        if(typeof this.onresize === 'function') {
            if(this.ONRESIZE) {
                try { window.removeEventListener('resize',this.ONRESIZE); } catch(err) {}
            }
            this.ONRESIZE = (ev) => { this.onresize(this,this.props); this.dispatchEvent(resizeevent); } 
            window.addEventListener('resize',this.ONRESIZE);       
        }

        if(typeof this.ondelete === 'function') {
            let ondelete = this.ondelete;
            this.ondelete = (props=this.props) => {
                if(this.ONRESIZE) window.removeEventListener('resize',this.ONRESIZE);
                this.state.unsubscribeTrigger('props');
                this.dispatchEvent(deleted);
                ondelete(this,props);
            }
        }

        if(typeof this.onchanged === 'function') {
            this.state.data.props = this.props;
            this.state.subscribeTrigger('props',this.onchanged);
        }

        if(this.renderonchanged) { //set to true or a function or a function string
            let rpc = this.renderonchanged;
            if(typeof this.renderonchanged === 'number') this.unsubscribeTrigger(this.renderonchanged);
            if(typeof rpc === 'string') rpc = parseFunctionFromText(rpc);
            if(typeof rpc === 'function') {
                this.renderonchanged = this.state.subscribeTrigger('props', (p)=>{this.render(p); rpc(this,p);}); //rerender then call the onchanged function if provided
            }
            else if(rpc !== false) this.renderonchanged = this.state.subscribeTrigger('props',this.render); //just rerender
        }


    }

    constructor() {
        super();
    }

    delete = () => { //deletes self from the DOM
        this.remove();
        if(typeof this.ondelete === 'function') this.ondelete(this.props);
    };

    render = (props=this.props) => {

        if(typeof this.template === 'function') this.templateResult = this.template(props, this); //can pass a function
        else this.templateResult = this.template;

        //this.innerHTML = this.templateResult;

        const t = document.createElement('template');

        if(typeof this.templateResult === 'string') t.innerHTML = this.templateResult;
        else if(this.templateResult instanceof HTMLElement) {
            if(this.templateResult.parentNode) {
                this.templateResult.parentNode.removeChild(this.templateResult); //swap to the new component
            }
            t.appendChild(this.templateResult);
        }

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

        let rendered = new CustomEvent('rendered', {detail: { props:this.props, self:this }});
        this.dispatchEvent('rendered');
        
        if(this.oncreate) this.oncreate(this,props); //set scripted behaviors
    }

    state = {
        pushToState:{},
        data:{},
        triggers:{},
        setState(updateObj){
            Object.assign(this.pushToState,updateObj);

            if(Object.keys(this.triggers).length > 0) {
                // Object.assign(this.data,this.pushToState);
                for (const prop of Object.getOwnPropertyNames(this.triggers)) {
                    if(this.pushToState[prop]) {
                        this.data[prop] = this.pushToState[prop]
                        delete this.pushToState[prop];
                        this.triggers[prop].forEach((obj)=>{
                            obj.onchanged(this.data[prop]);
                        });
                    }
                }
            }

            return this.pushToState;
        },
        subscribeTrigger(key,onchanged=(res)=>{}){
            if(key) {
                if(!this.triggers[key]) {
                    this.triggers[key] = [];
                }
                let l = this.triggers[key].length;
                this.triggers[key].push({idx:l, onchanged:onchanged});
                return this.triggers[key].length-1;
            } else return undefined;
        },
        unsubscribeTrigger(key,sub){
            let idx = undefined;
            let triggers = this.triggers[key]
            if (triggers){
                if(!sub) delete this.triggers[key];
                else {
                    let obj = triggers.find((o)=>{
                        if(o.idx===sub) {return true;}
                    });
                    if(obj) triggers.splice(idx,1);
                    return true;
                }
            }
        },
        subscribeTriggerOnce(key=undefined,onchanged=(value)=>{}) {
            let sub;
            let changed = (value) => {
                onchanged(value);
                this.unsubscribeTrigger(key,sub);
            }

            sub = this.subscribeTrigger(key,changed);
        }
    }

    get props() {
        return this.props;
    } 

    set props(newProps={}) {
        this.setAttribute('props',newProps);
    }

    get template() {
        return this.template;
    } 

    set template(template) {
        this.setAttribute('template',template);
    }

    get render() {
        return this.render;
    }

    get delete() {
        return this.delete;
    }

    get state() {
        return this.state;
    }

    //past tense just so it can't conflict with onchange
    get onchanged() {
        return this.onchanged;
    } 

    set onchanged(onchanged) {
        this.setAttribute('onchanged',onchanged);
    }

    get styles() {
        return this.styles
    }

    set styles(templateStr) {
        let elm = `
        <style>
            ${templateStr}
        </style>
        `;

        if(this.template.indexOf('<style')) {
            this.template.splice(this.template.indexOf('<style'+7),this.template.indexOf('</style'),templateStr);
        } else {
            if(this.template.indexOf('<head')) {
                this.template.splice(this.template.indexOf('<head'+6),0,elm);
            } else this.template = elm + this.template;
        }

        if(this.querySelector('style')) { //get the top style 
            if(!this.useShadow) {
                this.useShadow = true;
                this.render()
            } else this.querySelector('style').innerHTML = templateStr;

        } else {
            this.useShadow = true;
            this.render();
        }
    }

    get renderonchanged() {
        return this.renderonchanged;
    }

    set renderonchanged(onchanged) {
        this.setAttribute('renderonchanged',onchanged);
    }
 
    get onresize() {
        return this.props;
    } 

    set onresize(onresize) {
        this.setAttribute('onresize',onresize);
    }

    get ondelete() {
        return this.props;
    } 

    set ondelete(ondelete) {
        this.setAttribute('ondelete',ondelete);
    }

    get oncreate() {
        return this.oncreate;
    } 

    set oncreate(oncreate) {
        this.setAttribute('oncreated',oncreate);
    }
}

//extend the DOMElement class with an new name, this name determines the element name (always lower case in the html regardless of class name cases)
export function addCustomElement(cls, tag, extend=null) {
    try {
        if(extend) {
            if(tag) window.customElements.define(tag, cls, {extends:extend});
            else window.customElements.define(cls.name.toLowerCase()+'-',cls, {extends:extend});
        }
        else {
            if(tag) window.customElements.define(tag, cls);
            else window.customElements.define(cls.name.toLowerCase()+'-',cls);
        }
    }
    catch(err) {

    }
}

export function randomId(tag='') {
    return tag+Math.floor(Math.random()*1000000000000000);
}

// Proper DOM fragment implementation which also creates customElements you can use like <so></so>. High HTML5 performance via template fragments
export function parseFunctionFromText(method) {
    //Get the text inside of a function (regular or arrow);
    let getFunctionBody = (methodString) => {
    return methodString.replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>(.+))/i, '$2$3$4');
    }

    let getFunctionHead = (methodString) => {
    let startindex = methodString.indexOf(')');
    return methodString.slice(0, methodString.indexOf('{',startindex) + 1);
    }

    let newFuncHead = getFunctionHead(method);
    let newFuncBody = getFunctionBody(method);

    let newFunc;
    try{
        if (newFuncHead.includes('function ')) {
            let varName = newFuncHead.split('(')[1].split(')')[0]
            newFunc = new Function(varName, newFuncBody);
        } else {
            if(newFuncHead.substring(0,6) === newFuncBody.substring(0,6)) {
                //newFuncBody = newFuncBody.substring(newFuncHead.length);
                let varName = newFuncHead.split('(')[1].split(')')[0]
                //console.log(varName, newFuncHead ,newFuncBody);
                newFunc = new Function(varName, newFuncBody.substring(newFuncBody.indexOf('{')+1,newFuncBody.length-1));
            }
            else {
                try {
                    newFunc = (0,eval)(newFuncHead + newFuncBody + "}");
                } catch(err) {
                    newFunc = (0,eval)(method); //try just evaluating the method
                }
            }
        }
    }
    catch (err) {}

    return newFunc;

}

