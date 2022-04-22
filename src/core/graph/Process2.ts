import { parseFunctionFromText } from '../../common/parse.utils';

//just a more typical hierarchical graph tree with back and forward prop and arbitrary 
// go-here-do-that utilities. Create an object node tree and make it do... things 
// same setup as sequencer but object/array/tag only (no functions), and can add arbitrary properties to mutate on objects
// or propagate to children/parents with utility calls that get added to the objects
//Joshua Brewster and Garrett Flynn AGPLv3.0

//properties input on GraphNode or addNode, or for children
export type GraphNodeProperties = {
    tag?:string, //generated if not specified, or use to get another node by tag instead of generating a new one
    operator?:( //can be async
        input:any, //input, e.g. output from another node
        self:GraphNode|string,  //'this' node
        origin?:GraphNode|string, //origin node
        cmd?:string|number    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
    )=>any, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
    forward?:boolean, //pass output to child nodes
    backward?:boolean, //pass output to parent node
    children?:string|GraphNodeProperties|GraphNode|(GraphNodeProperties|GraphNode|string)[], //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
    parent?:GraphNode|undefined, //parent graph node
    delay?:false|number, //ms delay to fire the node
    repeat?:false|number, // set repeat as an integer to repeat the input n times, cmd will be the number of times the operation has been repeated
    recursive?:false|number, //or set recursive with an integer to pass the output back in as the next input n times, cmd will be the number of times the operation has been repeated
    animate?:boolean, //true or false
    loop?:false|number, //milliseconds or false
    animation?:( //uses operator by default unless defined otherwise can be async 
        input:any, //input, e.g. output from another node
        self:GraphNode|string,  //'this' node
        origin?:GraphNode|string, //origin node
        cmd?:string|number    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
    )=>any | undefined, //if it outputs something not undefined it will trigger parent/child operators
    looper?:( //uses operator by default unless defined otherwise (to separate functions or keep them consolidated) can be async
        input:any, //input, e.g. output from another node
        self:GraphNode|string,  //'this' node
        origin?:GraphNode|string, //origin node
        cmd?:string|number    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
    )=>any | undefined, //if it outputs something not undefined it will trigger parent/child operators
    [key:string]:any //add whatever variables and utilities
}; //can specify properties of the element which can be subscribed to for changes.



//TODO: try to reduce the async stack a bit for better optimization, though in general it is advantageous matter as long as node propagation isn't 
//   relied on for absolute maximal performance concerns, those generally require custom solutions e.g. matrix math or clever indexing, but this can be used as a step toward that.

//a graph representing a callstack of nodes which can be arranged arbitrarily with forward and backprop or propagation to wherever
export const state = {
    pushToState:{},
    data:{},
    triggers:{},
    setState(updateObj){
        
        Object.assign(this.data, updateObj);

        for (const prop of Object.getOwnPropertyNames(updateObj)) {
            if (this.triggers[prop]) this.triggers[prop].forEach((obj) => obj.onchange(this.data[prop]));
        }

        return this.data;
    },
    subscribeTrigger(key,onchange:Function=()=>{}){
        if(key) {
            if(!this.triggers[key]) {
                this.triggers[key] = [];
            }
            let l = this.triggers[key].length;
            this.triggers[key].push({idx:l, onchange});
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
    subscribeTriggerOnce(key=undefined,onchange=(value)=>{}) {
        let sub;
        let changed = (value) => {
            onchange(value);
            this.unsubscribeTrigger(key,sub);
        }

        sub = this.subscribeTrigger(key,changed);
    }
}


class BaseProcess {
    tag;
    parent;
    children;
    graph;
    state = state; //shared trigger state
    nodes = new Map()
    attributes = new Set()

    constructor() {

    }

    tree = () => {
        const o = {}

        const usedTags = []

        // Drill All
        const setNode = (n, parent) => {

            if (o[n.tag]) delete o[n.tag] // Remove loose nodes

            // Add to List If Not Child
            if (!usedTags.includes(n.tag)){
                parent[n.tag] = {
                    state: n.state.data[n.tag], // Look at both signals that bubble and those that don't
                    nodes: {}
                }

                n.attributes.forEach(attr => parent[n.tag][attr] = n[attr])

                usedTags.push(n.tag)

                n.nodes.forEach((n2) => setNode(n2, parent[n.tag].nodes))
            }
        }

        // Set Node on Object
        this.nodes.forEach(n =>setNode(n, o))

        return o
    }

        
    convertChildrenToNodes(n) {
        if(n.children?.name === 'GraphNode') { 
            if(!this.graph?.nodes.get(n.tag)) this.graph.nodes.set(n.tag,n);
            if(!this.nodes.get(n.tag)) this.nodes.set(n.tag,n); 
        }
        else if (Array.isArray(n.children)) {
            for(let i = 0; i < n.children.length; i++) {
                if(n.children[i].name === 'GraphNode') { 
                    if(!this.graph?.nodes.get(n.children[i].tag)) this.graph.nodes.set(n.children[i].tag,n.children[i]);
                    if(!this.nodes.get(n.children[i].tag)) this.nodes.set(n.children[i].tag,n.children[i]);
                    continue; 
                }
                else if(typeof n.children[i] === 'object') {
                    n.children[i] = new GraphNode(n.children[i],n,this.graph);
                    this.nodes.set(n.children[i].tag,n.children[i]);
                    this.convertChildrenToNodes(n.children[i]);
                } 
                else if (typeof n.children[i] === 'string') {
                    if(this.graph) {
                        n.children[i] = this.graph.getNode(n.children[i]); //try graph scope
                        if(!this.nodes.get(n.children[i].tag)) this.nodes.set(n.children[i].tag,n.children[i]);
                    }
                    if(!n.children[i]) n.children[i] = this.nodes.get(n.children[i]); //try local scope
                }
                
            }
        }
        else if(typeof n.children === 'object') {
            n.children = new GraphNode(n.children,n,this.graph);
            this.nodes.set(n.children.tag,n.children);
            this.convertChildrenToNodes(n.children);
        } 
        else if (typeof n.children === 'string') {
            if(this.graph) {
                n.children = this.graph.getNode(n.children); //try graph scope
                if(!this.nodes.get(n.children.tag)) this.nodes.set(n.children.tag,n.children);
            }
            if(!n.children) n.children = this.nodes.get(n.children); //try local scope
        }
        return n.children;
    }
}


//the utilities in this class can be referenced in the operator after setup for more complex functionality
//node functionality is self-contained, use a graph for organization
export class GraphNode extends BaseProcess{
    attributes = new Set()
    nodes = new Map();
    ANIMATE = 'animate'; //operator is running on the animation loop (cmd = 'animate')
    LOOP = 'loop'; //operator is running on a setTimeout loop (cmd = 'loop')
    isLooping = false;
    isAnimating = false;
    looper = undefined; //loop function, uses operator if undefined (with cmd 'loop');
    animation = undefined; //animation function, uses operator if undefined (with cmd 'animate')
    forward = true; /// propagate outputs to children?
    backward = false; //propagate outputs to parents?
    
    constructor(properties:GraphNodeProperties={}, parentNode?, graph?) {
        super()
        const keys = Object.keys(this)
        const prohibited = ['tag', 'parent', 'graph', 'children', 'operator']
        for (let key in properties){
            if (!keys.includes(key) && !prohibited.includes(key)) this.attributes.add(key)
        }

        if(!properties.tag && graph) properties.tag = `node${graph.nNodes}`; //add a sequential id to find the node in the tree 
        else if(!properties.tag) properties.tag = `node${Math.floor(Math.random()*10000000000)}`; //add a random id for the top index if none supplied
        Object.assign(this,properties); //set the node's props as this
        this.parent=parentNode;
        this.graph=graph;
    
        if(graph) {
            graph.nNodes++;
            graph.nodes.set(properties.tag,this);
        }
    
        if(this.children) this.convertChildrenToNodes(this);
    }
    
    //I/O scheme for this node
    operator(input,self=this,origin,cmd){
        return input;
    }
    
    //run the operator
    async runOp(input,node=this,origin,cmd) {
        let result = await this.operator(input,node,origin,cmd);
        if(this.tag) this.state.setState({[this.tag]:result});
        return result;
    }
    
    //Should create a sync version with no promises (will block but be faster)
    runNode(node,input,origin) {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node)
            return node.run(input,node,origin);
        else return undefined;
    }
    
    //runs the node sequence
    //Should create a sync version with no promises (will block but be faster)
    run(input,node:GraphNode & GraphNodeProperties|any=this,origin) {
        if(typeof node === 'string') 
            {
                let fnd;
                if(this.graph) fnd = this.graph.nodes.get(node);
                if(!fnd) fnd = this.nodes.get(node);
                node = fnd;
                if(!node) return undefined;
            }
    
        return new Promise(async (resolve) => {
            if(node) {
                let run = (node, inp, tick=0) => {
                    return new Promise (async (r) => {
                        tick++;
                        let res = await node.runOp(inp,node,origin,tick);
                        if(typeof node.repeat === 'number') {
                            while(tick < node.repeat) {
                                if(node.delay) {
                                    setTimeout(async ()=>{
                                        r(await run(node,inp,tick));
                                    },node.delay);
                                    break;
                                } else if (node.frame && requestAnimationFrame) {
                                    requestAnimationFrame(async ()=>{
                                        r(await run(node,inp,tick));
                                    });
                                    break;
                                }
                                else res = await node.runOp(inp,node,origin,tick);
                                tick++;
                            }
                            if(tick === node.repeat) {
                                r(res);
                                return;
                            }
                        } else if(typeof node.recursive === 'number') {
                            
                            while(tick < node.recursive) {
                                if(node.delay) {
                                    setTimeout(async ()=>{
                                        r(await run(node,res,tick));
                                    },node.delay);
                                    break;
                                } else if (node.frame && requestAnimationFrame) {
                                    requestAnimationFrame(async ()=>{
                                        r(await run(node,res,tick));
                                    });
                                    break;
                                }
                                else res = await node.runOp(res,node,origin,tick);
                                tick++;
                            }
                            if(tick === node.recursive) {
                                r(res);
                                return;
                            }
                        } else {
                            r(res);
                            return;
                        }
                    });
                }
    
    
                let runnode = async () => {
    
                    let res = await run(node,input); //repeat/recurse before moving on to the parent/child
    
                    //can add an animationFrame coroutine, one per node //because why not
                    if(node.animate && !node.isAnimating) {
                        this.runAnimation(this.animation,input,node,origin);
                    }
    
                    //can add an infinite loop coroutine, one per node, e.g. an internal subroutine
                    if(typeof node.loop === 'number' && !node.isLooping) {
                        this.runLoop(this.looper,input,node,origin);
                    }
    
                    if(node.backward && node.parent) {
                        await this.runNode(node.parent,res,node);
                    }
                    if(node.children && node.forward) {
                        if(Array.isArray(node.children)) {
                            for(let i = 0; i < node.children.length; i++) {
                                await this.runNode(node.children[i],res,node);
                            }
                        }
                        else await this.runNode(node.children,res,node);
                    }
    
                    return res;
                }
    
                if(node.delay) {
                    setTimeout(async ()=>{
                        resolve(await runnode());
                    },node.delay);
                } else if (node.frame && requestAnimationFrame) {
                    requestAnimationFrame(async ()=>{
                        resolve(await runnode());
                    });
                } else {
                    resolve(await runnode());
                }
                
            }
            else resolve(undefined);
        });
    }
    
    runAnimation(animation:(input,node,origin,cmd)=>any=this.animation,input,node:GraphNode&GraphNodeProperties|any=this,origin) {
        //can add an animationFrame coroutine, one per node //because why not
        this.animation = animation;
        if(!animation) this.animation = this.operator;
        if(node.animate && !node.isAnimating) {
            node.isAnimating = true;
            let anim = async () => {
                if(node.isAnimating) {
                    let result = await this.animation( 
                        input,
                        node,
                        origin,
                        this.ANIMATE
                    );
                    if(this.tag && typeof result !== 'undefined') {
                        this.state.setState({[this.tag]:result}); //if the anim returns it can trigger state
                        if(node.backward && node.parent) {
                            await this.runNode(node.parent,result,node);
                        }
                        if(node.children && node.forward) {
                            if(Array.isArray(node.children)) {
                                for(let i = 0; i < node.children.length; i++) {
                                    await this.runNode(node.children[i],result,node);
                                }
                            }
                            else await this.runNode(node.children,result,node);
                        }
                    }
                    requestAnimationFrame(async ()=>{await anim();});
                }
            }
            requestAnimationFrame(anim);
        }
    }
    
    runLoop(loop:(input,node,origin,cmd)=>any=this.looper,input,node:GraphNode&GraphNodeProperties|any=this,origin) {
        //can add an infinite loop coroutine, one per node, e.g. an internal subroutine
        this.looper = loop;
        if(!loop) this.looper = this.operator;
        if(typeof node.loop === 'number' && !node.isLooping) {
            node.isLooping = true;
            let looping = async () => {
                if(node.looping)  {
                    let result = await this.looper(input,node,origin);
                    if(this.tag && typeof result !== 'undefined') {
                        this.state.setState({[this.tag]:result}); //if the loop returns it can trigger state
                        if(node.backward && node.parent) {
                            await this.runNode(node.parent,result,node);
                        }
                        if(node.children && node.forward) {
                            if(Array.isArray(node.children)) {
                                for(let i = 0; i < node.children.length; i++) {
                                    await this.runNode(node.children[i],result,node);
                                }
                            }
                            else await this.runNode(node.children,result,node);
                        }
                    }
                    setTimeout(async ()=>{await looping();},node.loop);
                }
            }
        }
    }
    
    //this is the i/o handler, or the 'main' function for this node to propagate results. The origin is the node the data was propagated from
    setOperator(operator=function operator(input,node=this,origin,cmd){return input;}) {
        this.operator = operator;
    }
    
    setParent(parent) { 
        this.parent = parent;
    }
    
    setChildren(children) {
        this.children = children;
    }
    
    removeTree(node) {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node) {
            const recursivelyRemove = (node) => {
                if(node.children) {
                    if(Array.isArray(node.children)) {
                        node.children.forEach((c)=>{
                            if(c.stopNode) c.stopNode();
                            if(c.tag) {
                                if(this.nodes.get(c.tag)) this.nodes.delete(c.tag);
                            }
                            this.nodes.forEach((n) => {
                                if(n.nodes.get(c.tag)) n.nodes.delete(c.tag);
                            });
                            recursivelyRemove(c);
                        })
                    }
                    else if(typeof node.children === 'object') {
                        if(node.stopNode) node.stopNode();
                        if(node.tag) {
                            if(this.nodes.get(node.tag)) this.nodes.delete(node.tag);
                        }
                        this.nodes.forEach((n) => {
                            if(n.nodes.get(node.tag)) n.nodes.delete(node.tag);
                        });
                        recursivelyRemove(node);
                    }
                }
            }
            if(node.stopNode) node.stopNode();
            if(node.tag) {
                this.nodes.delete(node.tag);
                this.nodes.forEach((n) => {
                    if(n.nodes.get(node.tag)) n.nodes.delete(node.tag);
                });
                recursivelyRemove(node);
                if(this.graph) this.graph.nodes.removeTree(node); //remove from parent graph too 
            }
        }
    }
    
    //converts all children nodes and tag references to graphnodes also
    addNode(node={}) {
        let converted = new GraphNode(node,this,this.graph); 
        this.nodes.set(converted.tag,converted);
        if(this.graph) this.graph.nodes.set(converted.tag,converted);
        return converted;
    }
    
    
    removeNode(node) {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node?.tag) this.nodes.delete(node.tag);
        if(node?.tag) {
            if(this.nodes.get(node.tag)) 
            {
                this.nodes.delete(node.tag);
                if(this.graph) this.graph.nodes.delete(node.tag);
                this.nodes.forEach((n) => {
                    if(n.nodes.get(node.tag)) n.nodes.delete(node.tag);
                });
            }
        }
    }
    
    appendNode(node, parentNode=this) {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node) parentNode.addChildren(node);
    }
    
    getNode(tag) {
        return this.nodes.get(tag);
    }
    
    //stop any loops
    stopLooping(node=this) {
        node.isLooping = false;
    }
    
    stopAnimating(node=this) {
        node.isAnimating = false;
    }
    
    stopNode(node=this) {
        node.stopAnimating(node);
        node.stopLooping(node);
    }
    
    //append child
    addChildren(children) {
        if(!this.children) this.children = [];
        if(!Array.isArray(this.children)) {
            this.children = [children];
            if(typeof children === 'object' && children.tag) {
                this.nodes.set(children.tag,children);
                if(this.graph) this.graph.nodes.set(children.tag,children);
            }
        }
        else if(Array.isArray(children)) {
            this.children.push(...children);
            children.forEach((c) => { 
                if(typeof c === 'object' && c.tag) {
                    this.nodes.set(c.tag,c);
                    if(this.graph) this.graph.nodes.set(c.tag,c);
                }
            })
        }
        else {
            this.children.push(children);
            if(typeof children === 'object' && children.tag) {
                this.nodes.set(children.tag,children);
                if(this.graph) this.graph.nodes.set(children.tag,children);
            }
        }
    }

    
    //Call parent node operator directly
    async callParent(input, origin=this, cmd){
        if(typeof this.parent?.operator === 'function') return await this.parent.runOp(input,this.parent,origin, cmd);
    }
    
    async callChildren(input, origin=this, cmd, idx){
        let result;
        if(Array.isArray(this.children)) {
            if(idx) result = await this.children[idx]?.runOp(input,this.children[idx],origin,cmd);
            else {
                result = [];
                for(let i = 0; i < this.children.length; i++) {
                    result.push(await this.children[i]?.runOp(input,this.children[i],origin,cmd));
                } 
            }
        } else if(this.children) {
            result = await this.children.runOp(input,this.children,origin,cmd);
        }
        return result;
    }
    
    setProps(props={}) {
        Object.assign(this,props);
    }
    
    //subscribe an output with an arbitrary callback
    subscribe(callback:GraphNode|Function=(res)=>{},tag=this.tag) {
        if(callback instanceof GraphNode) {
            return this.subscribeNode(callback);
        } else return this.state.subscribeTrigger(tag,callback);
    }
    
    //unsub the callback
    unsubscribe(sub,tag=this.tag) {
        this.state.unsubscribeTrigger(tag,sub);
    }
    
    //subscribe a node to this node that isn't a child of this node
    subscribeNode(node:GraphNode) {
        if(node.tag) this.nodes.set(node.tag,node);
        return this.state.subscribeTrigger(this.tag,(res)=>{this.runNode(node,res,this);})
    }
    
    //recursively print a reconstructible json hierarchy of the node and the children. 
    // Start at the top/initially called nodes to print the whole hierarchy in one go
    print(node=this,printChildren=true,nodesPrinted=[]) {
    
        let dummyNode = new GraphNode(); //test against this for adding props
    
        nodesPrinted.push(node.tag);
    
        let jsonToPrint:any = {
            tag:node.tag,
            operator:node.operator.toString()
        };
    
        if(node.parent) jsonToPrint.parent = node.parent.tag;
        //step through the children
        if(node.children) {
            if(Array.isArray(node.children)) {
                node.children = node.children.map((c) => {
                    if(typeof c === 'string') return c;
                    if(nodesPrinted.includes(c.tag)) return c.tag;   
                    else if(!printChildren) {
                        return c.tag;
                    }
                    else return c.print(c,printChildren,nodesPrinted);
                });
            } else if (typeof node.children === 'object') { 
                if(!printChildren) {
                    jsonToPrint.children = [node.children.tag];
                }
                if(nodesPrinted.includes(node.children.tag))  jsonToPrint.children = [node.children.tag];
                    else  jsonToPrint.children = [node.children.print(node.children,printChildren,nodesPrinted)];
            } else if (typeof node.children === 'string') jsonToPrint.children = [node.children];
            
        }
    
        for(const prop in node) {
            if(prop === 'parent' || prop === 'children') continue; //skip these as they are dealt with as special cases
            if(typeof (dummyNode as any)[prop] === 'undefined') {
                if(typeof node[prop] === 'function') {
                    jsonToPrint[prop] = node[prop].toString()
                } else if (typeof node[prop] === 'object') {
                    jsonToPrint[prop] = (JSON as any).stringifyWithCircularRefs(node[prop]); //circular references won't work, nested nodes already printed elsewhere in the tree will be kept as their tags
                } 
                else {
                    jsonToPrint[prop] = node[prop];
                }
            }
        }
    
        return JSON.stringify(jsonToPrint);
    
    }
    
    //reconstruct a node hierarchy (incl. stringified functions) into a GraphNode set
    reconstruct(json:string|{[x:string]: any}) {
        let parsed = reconstructObject(json);
        if(parsed) return this.addNode(parsed);
    }
}



    // Macro for GraphNode
export class AcyclicGraph extends BaseProcess {
    nNodes = 0

    constructor() {
        super()
    }


    //converts all children nodes and tag references to graphnodes also
    addNode(node:GraphNodeProperties={}) {
        let converted = new GraphNode(node,undefined,this); 
        return converted;
    }

    getNode(tag) {
        return this.nodes.get(tag);
    }

    //Should create a sync version with no promises (will block but be faster)
    run(node,input,origin) {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node)
            return node.run(input,node,origin)
        else return undefined;
    }

    //Should create a sync version with no promises (will block but be faster)
    runNode = this.run;

    removeTree(node) {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node) {
            const recursivelyRemove = (node) => {
                if(node.children) {
                    if(Array.isArray(node.children)) {
                        node.children.forEach((c)=>{
                            if(c.stopNode) c.stopNode();
                            if(c.tag) {
                                if(this.nodes.get(c.tag)) this.nodes.delete(c.tag);
                            }
                            this.nodes.forEach((n) => {
                                if(n.nodes.get(c.tag)) n.nodes.delete(c.tag);
                            });
                            recursivelyRemove(c);
                        })
                    }
                    else if(typeof node.children === 'object') {
                        if(node.stopNode) node.stopNode();
                        if(node.tag) {
                            if(this.nodes.get(node.tag)) this.nodes.delete(node.tag);
                        }
                        this.nodes.forEach((n) => {
                            if(n.nodes.get(node.tag)) n.nodes.delete(node.tag);
                        });
                        recursivelyRemove(node);
                    }
                }
            }
            if(node.stopNode) node.stopNode();
            if(node.tag) {
                this.nodes.delete(node.tag);
                this.nodes.forEach((n) => {
                    if(n.nodes.get(node.tag)) n.nodes.delete(node.tag);
                });
                recursivelyRemove(node);
            }
        }
    }

    removeNode(node) {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node?.tag) this.nodes.delete(node.tag);
        if(node?.tag) {
            if(this.nodes.get(node.tag)) 
            {
                this.nodes.delete(node.tag);
                //if(this.graph) this.graph.nodes.delete(node.tag);
                this.nodes.forEach((n) => {
                    if(n.nodes.get(node.tag)) n.nodes.delete(node.tag);
                });
            }
        }
    }

    appendNode(node={}, parentNode) {
        parentNode.addChildren(node);
    }

    async callParent(node, input, origin=node, cmd) {
        if(node?.parent) {
            return await node.callParent(input, node.parent, origin, cmd);
        }
    }

    async callChildren(node, input, origin=node, cmd, idx) {
        if(node?.children) {
            return await node.callChildren(input, origin, cmd, idx);
        }
    }

    subscribe(tag,callback=(res)=>{}) {
        return this.state.subscribeTrigger(tag,callback);
    }

    unsubscribe(tag,sub) {
        this.state.unsubscribeTrigger(tag,sub);
    }

    //subscribe a node to this node that isn't a child of this node
    subscribeNode(inputNode:GraphNode, outputNode:GraphNode|string) {
        return this.state.subscribeTrigger(inputNode.tag,(res)=>{this.run(outputNode,res,this);})
    }

    print(node,printChildren=true) {
        if(typeof node === 'object') return node.print(node,printChildren);
    }

    //reconstruct a node hierarchy (incl. stringified functions) into a GraphNode set
    reconstruct(json:string|{[x:string]: any}) {
        let parsed = reconstructObject(json);
        if(parsed) return this.addNode(parsed);
    }

    create(operator:(self:GraphNode,input:any,origin:GraphNode,cmd:string)=>any,parentNode,props) {
        return createNode(operator,parentNode,props,this);
    }

}


//macro
export function reconstructNode(json:string|{[x:string]: any},parentNode,graph) {
    let reconstructed = reconstructObject(json);
    if(reconstructed) return new GraphNode(reconstructed,parentNode,graph);
    else return undefined;
}

// exports.AcyclicGraph = AcyclicGraph;
// exports.GraphNode = GraphNode;

//parse stringified object with stringified functions
export function reconstructObject(json:string|{[x:string]: any}='{}') {
    try{

        // Allow raw object
        let parsed = (typeof json === 'string') ? JSON.parse(json) : json

        const parseObj = (obj) => {
            for(const prop in obj) {
                if(typeof obj[prop] === 'string') {
                    let funcParsed = parseFunctionFromText(obj[prop]);
                    if(typeof funcParsed === 'function') {
                        obj[prop] = funcParsed;
                    }
                } else if (typeof obj[prop] === 'object') {
                    parseObj(obj[prop]);
                }
            }
            return obj;
        }

        return parseObj(parsed);
    } catch(err) {console.error(err); return undefined;}

}


if((JSON as any).stringifyWithCircularRefs === undefined) {
    //Workaround for objects containing DOM nodes, which can't be stringified with JSON. From: https://stackoverflow.com/questions/4816099/chrome-sendrequest-error-typeerror-converting-circular-structure-to-json
    (JSON as any).stringifyWithCircularRefs = (function() {
        const refs = new Map();
        const parents = [];
        const path = ["this"];

        function clear() {
        refs.clear();
        parents.length = 0;
        path.length = 1;
        }

        function updateParents(key, value) {
            var idx = parents.length - 1;
            var prev = parents[idx];
            if(typeof prev === 'object') {
                if (prev[key] === value || idx === 0) {
                    path.push(key);
                    parents.push(value.pushed);
                } else {
                    while (idx-- >= 0) {
                        prev = parents[idx];
                        if(typeof prev === 'object') {
                            if (prev[key] === value) {
                                idx += 2;
                                parents.length = idx;
                                path.length = idx;
                                --idx;
                                parents[idx] = value;
                                path[idx] = key;
                                break;
                            }
                        }
                        idx--;
                    }
                }
            }
        }

        function checkCircular(key, value) {
        if (value != null) {
            if (typeof value === "object") {
            if (key) { updateParents(key, value); }

            let other = refs.get(value);
            if (other) {
                return '[Circular Reference]' + other;
            } else {
                refs.set(value, path.join('.'));
            }
            }
        }
        return value;
        }

        return function stringifyWithCircularRefs(obj, space) {
        try {
            parents.push(obj);
            return JSON.stringify(obj, checkCircular, space);
        } finally {
            clear();
        }
        }
    })();
}


export function createNode(operator:(input,self,origin,cmd)=>any,parentNode:GraphNode,props:GraphNodeProperties,graph:AcyclicGraph) {
    if(typeof props === 'object') {
        (props.operator as any) = operator;
        return new GraphNode(props,parentNode,graph);
    }
    return new GraphNode({operator:operator},parentNode,graph);
}



export const Graph = AcyclicGraph;
export const Process = GraphNode;
