import { parseFunctionFromText } from '../common/parse.utils';

//just a more typical hierarchical graph tree with back and forward prop and arbitrary 
// go-here-do-that utilities. Create an object node tree and make it do... things 
// same setup as sequencer but object/array/tag only (no functions), and can add arbitrary properties to mutate on objects
// or propagate to children/parents with utility calls that get added to the objects
//Joshua Brewster and Garrett Flynn AGPLv3.0

type OperatorType = ( //can be async
    self:Graph,  //'this' node
    origin:Graph, //origin node
    ...input:any //input arguments, e.g. output from another node
)=>any

//properties input on Graph or add, or for children
export type GraphProperties = {
    tag?:string, //generated if not specified, or use to get another node by tag instead of generating a new one
    operator?:OperatorType, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
    forward?:boolean, //pass output to child nodes
    backward?:boolean, //pass output to parent node
    children?:string|GraphProperties|Graph|(GraphProperties|Graph|string)[], //child node(s), can be tags of other nodes, properties objects like this, or Graphs, or null
    parent?:Graph|undefined, //parent graph node
    delay?:false|number, //ms delay to fire the node
    repeat?:false|number, // set repeat as an integer to repeat the input n times, cmd will be the number of times the operation has been repeated
    recursive?:false|number, //or set recursive with an integer to pass the output back in as the next input n times, cmd will be the number of times the operation has been repeated
    frame?:boolean, //true or false. If repeating or recursing, execute on requestAnimationFrame? Careful mixing this with animate:true
    animate?:boolean, //true or false, run the operation on an animationFrame loop?
    loop?:false|number, //milliseconds or false, run the operation on a loop?
    animation?: OperatorType | undefined, //if it outputs something not undefined it will trigger parent/child operators
    looper?: OperatorType | undefined, //if it outputs something not undefined it will trigger parent/child operators
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
        if( n?.children instanceof Graph ) { 
            if(!this.graph?.nodes.get(n.tag)) this.graph.nodes.set(n.tag,n);
            if(!this.nodes.get(n.tag)) this.nodes.set(n.tag,n); 
        }
        else if (Array.isArray(n.children)) {
            for(let i = 0; i < n.children.length; i++) {
                if(n.children[i].name === 'Graph') { 
                    if(!this.graph?.nodes.get(n.children[i].tag)) this.graph.nodes.set(n.children[i].tag,n.children[i]);
                    if(!this.nodes.get(n.children[i].tag)) this.nodes.set(n.children[i].tag,n.children[i]);
                    continue; 
                }
                else if(typeof n.children[i] === 'object') {
                    n.children[i] = new Graph(n.children[i],n,this.graph);
                    this.nodes.set(n.children[i].tag,n.children[i]);
                    this.convertChildrenToNodes(n.children[i]);
                } 
                else if (typeof n.children[i] === 'string') {
                    if(this.graph) {
                        n.children[i] = this.graph.get(n.children[i]); //try graph scope
                        if(!this.nodes.get(n.children[i].tag)) this.nodes.set(n.children[i].tag,n.children[i]);
                    }
                    if(!n.children[i]) n.children[i] = this.nodes.get(n.children[i]); //try local scope
                }
                
            }
        }
        else if(typeof n.children === 'object') {
            n.children = new Graph(n.children,n,this.graph);
            this.nodes.set(n.children.tag,n.children);
            this.convertChildrenToNodes(n.children);
        } 
        else if (typeof n.children === 'string') {
            if(this.graph) {
                n.children = this.graph.get(n.children); //try graph scope
                if(!this.nodes.get(n.children.tag)) this.nodes.set(n.children.tag,n.children);
            }
            if(!n.children) n.children = this.nodes.get(n.children); //try local scope
        }
        return n.children;
    }
}


  /**
   * Creates new instance of a Graph
   * The methods of this class can be referenced in the operator after setup for more complex functionality
   * 
   * ```typescript
   * const graph = new Graph({custom: 1, operator: (self, origin, input) => console.log(input, self.custom)});
   * ```
   */

export class Graph extends BaseProcess {

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
    [x:string]: any; // any additional attribute

    constructor(properties:GraphProperties={}, parentNode?, graph?) {
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
    
    // I/O scheme for this node in the graph
    private operator(self=this, origin=this, ...args){
        return args;
    }
    
    //run the operator
    private runOp(
        node=this,
        origin=this, // Options: this, this.parent, this.children[n], or an arbitrary node that is subscribed to.
        ...args
    ) {
        let result;
        if(node.operator.constructor.name === 'AsyncFunction') { //await runOp in this case or do runOp().then(res => ...)
            result = new Promise(async (resolve) => {
                let res = await node.operator(node,origin,...args);
                this.state.setState({[node.tag]:res});
                resolve(res);
            });
        }
        else {
            result = node.operator(node,origin,...args);
            this.state.setState({[node.tag]:result});
        }
        
        return result;
    }

    /**
     * Runs the graph and passes output to connected graphs
     *
     * ```typescript
     * const res = await graph.run(arg1, arg2, arg3);
     * ```
     */   

    run(...args) {
        return this._run(this,this,...args); //will be a promise
    }

    _run(node=this,origin,...args) {
        // NOTE: Should create a sync version with no promises (will block but be faster)

        if(typeof node === 'string') { //can pass the node tag instead
                let fnd;
                if(this.graph) fnd = this.graph.nodes.get(node);
                if(!fnd) fnd = this.nodes.get(node);
                node = fnd;
        }
        
        if(!node) return undefined;

        //console.log('running node ', node.tag, 'children: ', node.children);
        
        //no async/flow logic so just run and return the operator result
        if(!((node.children && node.forward) || (node.parent && node.backward) || node.repeat || node.delay || node.frame || node.recursive || node.operator.constructor.name === 'AsyncFunction')){
            let res = node.runOp(node, origin, ...args); //repeat/recurse before moving on to the parent/child
    
            //can add an animationFrame coroutine, one per node //because why not
            if(node.animate && !node.isAnimating) {
                this.runAnimation(this.animation,args,node,origin);
            }

            //can add an infinite loop coroutine, one per node, e.g. an internal subroutine
            if(node.loop && typeof node.loop === 'number' && !node.isLooping) {
                this.runLoop(this.looper,args,node,origin);
            }

            return res;
        }

    
        return new Promise(async (resolve) => {
            if(node) {
                let run = (node, tick=0, ...input) => {
                    return new Promise (async (r) => {
                        tick++;
                        let res = await node.runOp(node, origin, ...input); //executes the operator on the node in the flow logic
                        if(typeof node.repeat === 'number') {
                            while(tick < node.repeat) {
                                if(node.delay) {
                                    setTimeout(async ()=>{
                                        r(await run(node,tick, ...input));
                                    },node.delay);
                                    break;
                                } else if (node.frame && typeof requestAnimationFrame !== 'undefined') {
                                    requestAnimationFrame(async ()=>{
                                        r(await run(node,tick, ...input));
                                    });
                                    break;
                                }
                                else res = await node.runOp(node, origin, ...input);
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
                                        r(await run(node,tick, ...res));
                                    },node.delay);
                                    break;
                                } else if (node.frame && typeof requestAnimationFrame !== 'undefined') {
                                    requestAnimationFrame(async ()=>{
                                        r(await run(node,tick, ...res));
                                    });
                                    break;
                                }
                                else res = await node.runOp(node, origin, ...res);
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
    
                    let res = await run(node, undefined, ...args); //repeat/recurse before moving on to the parent/child
                    
                    //can add an animationFrame coroutine, one per node //because why not
                    if(node.animate && !node.isAnimating) {
                        this.runAnimation(this.animation,args,node,origin);
                    }
    
                    //can add an infinite loop coroutine, one per node, e.g. an internal subroutine
                    if(typeof node.loop === 'number' && !node.isLooping) {
                        this.runLoop(this.looper,args,node,origin);
                    }
    
                    if(node.backward && node.parent) {
                        await node.parent._run(node.parent, this, res);
                    }
                    if(node.children && node.forward) {
                        if(Array.isArray(node.children)) {
                            for(let i = 0; i < node.children.length; i++) {
                                await node.children[i]._run(node.children[i], this, res);
                            }
                        }
                        else await node.children._run(node.children, this, res);
                    }
    
                    return res;
                }
    
                if(node.delay) {
                    setTimeout(async ()=>{
                        resolve(await runnode());
                    },node.delay);
                } else if (node.frame && typeof requestAnimationFrame !== 'undefined') {
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
    
    runAnimation(animation:(node, origin, input)=>any=this.animation,input=[],node:Graph&GraphProperties|any=this,origin) {
        //can add an animationFrame coroutine, one per node //because why not
        this.animation = animation;
        if(!animation) this.animation = this.operator;
        if(node.animate && !node.isAnimating) {
            node.isAnimating = true;
            let anim = async () => {
                //console.log('anim')
                if(node.isAnimating) {
                    let result = this.animation( 
                        node,
                        origin,
                        ...input
                        // this.ANIMATE
                    );
                    if(result instanceof Promise) {
                        result = await result;
                    }
                    if(typeof result !== 'undefined') {
                        if(this.tag) this.state.setState({[this.tag]:result}); //if the anim returns it can trigger state
                        if(node.backward && node.parent) {
                            await node.parent._run(node.parent, this, result);
                        }
                        if(node.children && node.forward) {
                            if(Array.isArray(node.children)) {
                                for(let i = 0; i < node.children.length; i++) {
                                    await node.children[i]._run(node.children[i], this, result);
                                }
                            }
                            else await node.children._run(node.children, this, result);
                        }
                    }
                    requestAnimationFrame(anim);
                }
            }
            requestAnimationFrame(anim);
        }
    }
    
    runLoop(loop:(node, origin, input)=>any=this.looper,input=[],node:Graph&GraphProperties|any=this,origin) {
        //can add an infinite loop coroutine, one per node, e.g. an internal subroutine
        this.looper = loop;
        if(!loop) this.looper = this.operator;
        if(typeof node.loop === 'number' && !node.isLooping) {
            node.isLooping = true;
            let looping = async () => {
                if(node.looping)  {
                    let result = this.looper(node, origin, ...input);
                    if(result instanceof Promise) {
                        result = await result;
                    }
                    if(typeof result !== 'undefined') {
                        if(this.tag) this.state.setState({[this.tag]:result}); //if the loop returns it can trigger state
                        if(node.backward && node.parent) {
                            await node.parent._run(node.parent, this,  result);
                        }
                        if(node.children && node.forward) {
                            if(Array.isArray(node.children)) {
                                for(let i = 0; i < node.children.length; i++) {
                                    await node.children[i]._run(node.children[i], this, result);
                                }
                            }
                            else await node.children._run(node.children, this, result);
                        }
                    }
                    setTimeout(async ()=>{await looping();},node.loop);
                }
            }
        }
    }
    
    //this is the i/o handler, or the 'main' function for this node to propagate results. The origin is the node the data was propagated from
    setOperator(operator=function operator(node=this,origin,...input){return input;}) {
        this.operator = operator;
    }
    
    // Set Graph parent
    setParent(parent) { 
        this.parent = parent;
    }
    
    // Set Graph children
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
    
    //converts all children nodes and tag references to Graphs also
    add(node={}) {
        let converted = new Graph(node,this,this.graph); 
        this.nodes.set(converted.tag,converted);
        if(this.graph) this.graph.nodes.set(converted.tag,converted);
        return converted;
    }
    
    
    remove(node) {
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
    
    append(node, parentNode=this) {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node) parentNode.addChildren(node);
    }
    
    get(tag) {
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

    
    //Call parent node operator directly (.run calls the flow logic)
    callParent(input){
        const origin = this // NOTE: This node must be the origin
        if(typeof this.parent?.operator === 'function') return this.parent.runOp(this.parent, origin, ...input);
    }
    
    //call children operators directly (.run calls the flow logic)
    callChildren(idx, ...input){
        const origin = this // NOTE: This node must be the origin
        let result;
        if(Array.isArray(this.children)) {
            if(idx) result = this.children[idx]?.runOp(this.children[idx], origin, ...input);
            else {
                result = [];
                for(let i = 0; i < this.children.length; i++) {
                    result.push(this.children[i]?.runOp(this.children[i], origin, ...input));
                } 
            }
        } else if(this.children) {
            result = this.children.runOp(this.children, origin, ...input);
        }
        return result;
    }
    
    setProps(props={}) {
        Object.assign(this,props);
    }
    
    //subscribe an output with an arbitrary callback
    subscribe(callback:Graph|Function=(res)=>{},tag=this.tag) {
        if(callback instanceof Graph) {
            return this.subscribeNode(callback);
        } else return this.state.subscribeTrigger(tag,callback);
    }
    
    //unsub the callback
    unsubscribe(sub,tag=this.tag) {
        this.state.unsubscribeTrigger(tag,sub);
    }
    
    //subscribe a node to this node that isn't a child of this node
    subscribeNode(node:Graph) {
        if(node.tag) this.nodes.set(node.tag,node);
        return this.state.subscribeTrigger(this.tag,(res)=>{node._run(node, this, res);})
    }
    
    //recursively print a reconstructible json hierarchy of the node and the children. 
    // Start at the top/initially called nodes to print the whole hierarchy in one go
    print(node=this,printChildren=true,nodesPrinted=[]) {
    
        let dummyNode = new Graph(); //test against this for adding props
    
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
    
    //reconstruct a node hierarchy (incl. stringified functions) into a Graph set
    reconstruct(json:string|{[x:string]: any}) {
        let parsed = reconstructObject(json);
        if(parsed) return this.add(parsed);
    }
}



    // Macro for Graph
export class AcyclicGraph extends BaseProcess {
    nNodes = 0

    constructor() {
        super()
    }


    //converts all children nodes and tag references to Graphs also
    add(node:GraphProperties={}) {
        let converted = new Graph(node,undefined,this); 
        return converted;
    }

    get(tag) {
        return this.nodes.get(tag);
    }

    //Should create a sync version with no promises (will block but be faster)
    run(node,origin,input=[]) {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node)
            return node._run(node,origin,...input)
        else return undefined;
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
            }
        }
    }

    remove(node) {
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

    append(node={}, parentNode) {
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
    subscribeNode(inputNode:Graph, outputNode:Graph|string) {
        return this.state.subscribeTrigger(inputNode.tag,(res)=>{this.run(outputNode,this, ...res);}) // TODO: Check if correct node
    }

    print(node,printChildren=true) {
        if(typeof node === 'object') return node.print(node,printChildren);
    }

    //reconstruct a node hierarchy (incl. stringified functions) into a Graph set
    reconstruct(json:string|{[x:string]: any}) {
        let parsed = reconstructObject(json);
        if(parsed) return this.add(parsed);
    }

    create(operator:(self:Graph,input:any,origin:Graph,cmd:string)=>any,parentNode,props) {
        return createNode(operator,parentNode,props,this);
    }

}


//macro
export function reconstructNode(json:string|{[x:string]: any},parentNode,graph) {
    let reconstructed = reconstructObject(json);
    if(reconstructed) return new Graph(reconstructed,parentNode,graph);
    else return undefined;
}

// exports.AcyclicGraph = AcyclicGraph;
// exports.Graph = Graph;

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


export function createNode(operator:(input,self,origin,cmd)=>any,parentNode:Graph,props:GraphProperties,graph:AcyclicGraph) {
    if(typeof props === 'object') {
        (props.operator as any) = operator;
        return new Graph(props,parentNode,graph);
    }
    return new Graph({operator:operator},parentNode,graph);
}