//just a more typical hierarchical graph tree with back and forward prop and arbitrary 
// go-here-do-that utilities. Create an object node tree and make it do... things 
// same setup as sequencer but object/array/tag only (no functions), and can add arbitrary properties to mutate on objects
// or propagate to children/parents with utility calls that get added to the objects
//Joshua Brewster and Garrett Flynn AGPLv3.0

//properties input on GraphNode or addNode, or for children
export type GraphNodeProperties = {
    tag?:string, //generated if not specified, or use to get another node by tag instead of generating a new one
    operator?:(
        input:any, //input, e.g. output from another node
        node:GraphNode|string,  //'this' node
        origin?:GraphNode|string, //origin node
        cmd?:string    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
    )=>any|AsyncGeneratorFunction, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
    forward?:boolean, //pass output to child nodes
    backward?:boolean, //pass output to parent node
    children?:string|GraphNodeProperties|GraphNode|(GraphNodeProperties|GraphNode|string)[], //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
    parent?:GraphNode|undefined, //parent graph node
    delay?:false|number, //ms delay to fire the node
    repeat?:false|number, // set repeat as an integer to repeat the input n times
    recursive?:false|number, //or set recursive with an integer to pass the output back in as the next input n times
    animate?:boolean, //true or false
    loop?:false|number, //milliseconds or false
    [key:string]:any //add whatever variables and utilities
}; //can specify properties of the element which can be subscribed to for changes.



/*


let tree = { //top level should be an object, children can be arrays of objects
    tag:'top',
    operator:(input,node,origin,cmd)=>{
        if(typeof input === 'object') {
            if(input?.x) node.x = input.x; 
            if(input?.y) node.y = input.y;
            if(input?.z) node.z = input.z;
            console.log('top node, input:', input);
        }
        if(cmd === 'animate') {//seizure mode
            if(document.body.style.backgroundColor === 'white') 
                document.body.backgroundColor = 'black';
            else document.body.style.backgroundColor = 'white';
        }
        return input;
    }, //input is the previous result if passed from another node. node is 'this' node, origin is the previous node if passed
    forward:true, //forward prop: returned outputs from the operator are passed to children operator(s)
    //backward:true, //backprop: returned outputs from the operator are passed to the parent operator
    x:3, //arbitrary properties available on the node variable in the operator 
    y:2,
    z:1,
    animate:true,
    delay:1000,//, //can timeout the operation
    //frame:true //can have the operation run via requestAnimationFrame (throttling)
    //repeat:3 //can repeat an operator, or use "recursive" for the same but passing the node's result back in
    children:{ //object, array, or tag. Same as the 'next' tag in Sequencer.js
        tag:'next', //tagged nodes get added to the node map by name, they must be unique! non-tagged nodes are only referenced internally e.g. in call trees
        operator:(input,node,origin,cmd)=>{
            if(origin.x) { //copy over the coordinates
                node.x = origin.x;
                node.y = origin.y;
                node.z = origin.z;
            }
            console.log('next node \n parent node:',node,'\ninput',input);
        }, // if you use a normal function operator(input,node,origin){} then you can use 'this' reference instead of 'node', while 'node' is more flexible for arrow functions etc.
        //etc..
        delay:500,
        repeat:3
    }
};


let graph = new AcyclicGraph();
graph.addNode(tree);

let res = graph.run(tree.tag,{x:4,y:5,z:6}).then(res => console.log('promise, after', res));

console.log('promise returned:',res);

each node in the tree becomes a GraphNode object

*/



//TODO: try to reduce the async stack a bit for better optimization, though in general it is advantageous matter as long as node propagation isn't 
//   relied on for absolute maximal performance concerns, those generally require custom solutions e.g. matrix math or clever indexing, but this can be used as a step toward that.

//a graph representing a callstack of nodes which can be arranged arbitrarily with forward and backprop or propagation to wherever
export const state = {
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
                        obj.onchange(this.data[prop]);
                    });
                }
            }
        }

        return this.pushToState;
    },
    subscribeTrigger(key,onchange=(res)=>{}){
        if(key) {
            if(!this.triggers[key]) {
                this.triggers[key] = [];
            }
            let l = this.triggers[key].length;
            this.triggers[key].push({idx:l, onchange:onchange});
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


export class AcyclicGraph {
    state = state;
    nodes = new Map()
    nNodes = 0

    constructor() {}

    //convert child objects to nodes
    convertChildrenToNodes(n) {
        n.convertChildrenToNodes(n);
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

    removeTree(node) {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node) {
            function recursivelyRemove(node) {
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

    print(node,printChildren=true) {
        if(node instanceof GraphNode)
            return node.print(node,printChildren);
    }

    //reconstruct a node hierarchy (incl. stringified functions) into a GraphNode set
    reconstruct(json='{}') {
        let parsed = reconstructObject(json);
        if(parsed) this.addNode(parsed);
    }

}

//the utilities in this class can be referenced in the operator after setup for more complex functionality
//node functionality is self-contained, use a graph for organization
export class GraphNode {
tag;
parent;
children;
graph;
state = state; //shared trigger state
nodes = new Map();
ANIMATE = 'animate'; //operator is running on the animation loop (cmd = 'animate')
LOOP = 'loop'; //operator is running on a setTimeout loop (cmd = 'loop')
isLooping = false;
isAnimating = false;

constructor(properties:GraphNodeProperties={}, parentNode?, graph?) {
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
operator(input,node=this,origin,cmd){
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
        return node.run(input,node,origin)
    else return undefined;
}

//runs the node sequence
//Should create a sync version with no promises (will block but be faster)
run(input,node:GraphNode&GraphNodeProperties|any=this,origin) {
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

                //can add an animationFrame coroutine, one per node //because why not
                if(node.animate && !node.isAnimating) {
                    this.runAnimation(input,node,origin);
                }

                //can add an infinite loop coroutine, one per node, e.g. an internal subroutine
                if(typeof node.loop === 'number' && !node.isLooping) {
                    this.runLoop(input,node,origin);
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

runAnimation(input,node:GraphNode&GraphNodeProperties|any=this,origin) {
    //can add an animationFrame coroutine, one per node //because why not
    if(node.animate && !node.isAnimating) {
        node.isAnimating = true;
        let anim = async () => {
            if(node.isAnimating) {
                await node.runOp( 
                    input,
                    node,
                    origin,
                    this.ANIMATE  // if(cmd === node.ANIMATE) {  } //'animate'
                );
                requestAnimationFrame(async ()=>{await anim();});
            }
        }
        requestAnimationFrame(anim);
    }
}

runLoop(input,node:GraphNode&GraphNodeProperties|any=this,origin) {
    //can add an infinite loop coroutine, one per node, e.g. an internal subroutine
    if(typeof node.loop === 'number' && !node.isLooping) {
        node.isLooping = true;
        let loop = async () => {
            if(node.looping)  {
                await node.runOp( 
                    input,
                    node,
                    origin,
                    this.LOOP // if(cmd === node.LOOP) {  } //'loop'
                );
                setTimeout(async ()=>{await loop();},node.loop);
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
        function recursivelyRemove(node) {
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
    if(!Array.isArray(this.children) && this.children) this.children = [this.children];
    else if(Array.isArray(children)) this.children.push(...children);
    else this.children.push(children);
}

convertChildrenToNodes(n=this) {
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

subscribe(tag=this.tag,callback=(res)=>{}) {
    return this.state.subscribeTrigger(tag,callback);
}

unsubscribe(tag=this.tag,sub) {
    this.state.unsubscribeTrigger(tag,sub);
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
reconstruct(json='{}') {
    let parsed = reconstructObject(json);
    if(parsed) this.addNode(parsed);
}

}


//macro
export function reconstructNode(json='{}',parentNode,graph) {
    let reconstructed = reconstructObject(json);
    if(reconstructed) return new GraphNode(reconstructed,parentNode,graph);
    else return undefined;
}

// exports.AcyclicGraph = AcyclicGraph;
// exports.GraphNode = GraphNode;

//parse stringified object with stringified functions
export function reconstructObject(json='{}') {
    try{
        let parsed = JSON.parse(json);

        function parseObj(obj) {
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

export function parseFunctionFromText(method='') {
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
      else newFunc = eval(newFuncHead + newFuncBody + "}");
    }
  
    return newFunc;
  
  }

  

export const ProcessGraph = AcyclicGraph;
export const Process = GraphNode;


/*
More node examples (minus some added utility functions)

   let CircleCanvasNode = {
       canvas:document.querySelector('canvas'),
       ctx:document.querySelector('canvas').getContext('2d'),
        radius:20,
        triggered:false,

        operator:(
            input,
            node,
            origin,
            cmd
        )=>{ 
            
            if(!this.triggered) {
                this.radius += Math.random()-0.5;
            }

            if(cmd === 'animate') {
                this.draw();
                for(let i = 0; i < this.drawFuncs.length; i++) { //lets use other nodes to send draw functions to the canvas
                    let f = this.drawFuncs[i];
                    if(typeof f === 'function') {
                        f(input,node,origin,cmd); //pass the args in (need these if you pass arrow functions)
                    }
                }
            } else {
                if(typeof input === 'object') {
                    if(input.radius) this.radius += input.radius;
                    this.triggered = true;
                } else if (typeof input === 'number') {
                    this.radius += input;
                    this.triggered = true;
                } else if (typeof input === 'string') {
                    this.radius += parseFloat(input);
                    this.triggered = true;
                } else {
                    this.radius += Math.random()-0.5;
                    this.triggered = true;
                }
            }
        },
        draw:(input,node,origin,cmd) => {
            let canvas = this.canvas;
            let ctx = this.ctx;
            if(this.radius <= 1) this.radius = 1;
            ctx.clearRect(0,0,canvas.width,canvas.height);
            this.drawCircle(
                canvas.width*0.5,
                canvas.height*0.5,
                this.radius,
                'green',
                5,
                '#003300'
            );
        },
        drawCircle:(centerX, centerY, radius, fill='green', strokewidth=5, strokestyle='#003300') => {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = fill;
            this.ctx.fill();
            this.ctx.lineWidth = strokewidth;
            this.ctx.strokeStyle = strokestyle;
            this.ctx.stroke();
        }
        forward:true, //pass output to child nodes
        backward:false, //pass output to parent node
        children:undefined, //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
        parent:undefined, //parent graph node
        delay:false, //ms delay to fire the node
        repeat:false, // set repeat as an integer to repeat the input n times
        recursive:false, //or set recursive with an integer to pass the output back in as the next input n times
        animate:true, //true or false
        loop:undefined, //milliseconds or false
        tag:undefined, //generated if not specified, or use to get another node by tag instead of generating a new one
        input:undefined,// can set on the attribute etc
        graph:undefined, //parent AcyclicGraph instance, can set manually or via enclosing acyclic-graph div
        node:undefined, //GraphNode instance, can set manually or as a string to grab a node by tag (or use tag)
    }; //can specify properties of the element which can be subscribed to for changes.


   let SpaceNodeProps={
        bodies:{}, //the orbital body nodes we're updating
        speed:300000, //time multiplier
        lastTime:undefined,
        now:undefined,
        canvas:undefined,
        ctx:undefined,
        useCanvas:true,
        useHTML:true,
        meter_per_px: 1e9, //viewport scales according to this
        px_per_meter: 1/1e9,
        zind:0,

        stars:[],
        boids:undefined,
        nstars:undefined,
        nboids:undefined,
         
        operator:(
            input,
            node,
            origin,
            cmd
        )=>{ 

            if(cmd === 'animate') {
                this.lastTime = this.now;
                this.now = Date.now();

                let tstep;
                let tminus = (this.now - this.lastTime)*0.001;
                if(tminus > 0.1) tminus = 0.1; //prevent overly long time jumps  

                tstep = tminus*this.speed; //seconds                
               
                let bodies = this.bodies;

                let keys = Object.keys(bodies);

                for(let i = 0; i < keys.length; i++) {
                    for(let j = 0; j < keys.length; j++) {
                        if(i !== j && !bodies[keys[i]].fixed && !bodies[keys[j]].fixed) {
                            this.newtonianMechanics(bodies[keys[i]],bodies[keys[j]],tstep);
                        }
                    }
                }

                this.node.callChildren(tstep); // this will update positions

                //draw loop
                if(this.useCanvas) {
                    this.draw(input,node,origin,cmd);
                    for(let i = 0; i < this.drawFuncs.length; i++) { //lets use other nodes to send draw functions to the canvas
                        let f = this.drawFuncs[i];
                        if(typeof f === 'function') {
                            f(input,node,origin,cmd); //pass the args in (need these if you pass arrow functions)
                        }
                    }
                }

            } else {
                //e.g. input commands
                if(typeof input === 'object') {
                    
                } else if (typeof input === 'number') {
                    
                } else if (typeof input === 'string') {
                    
                } else {
                    
                }
            }
        },
        forward:true, //pass output to child nodes
        backward:false, //pass output to parent node
        children:undefined, //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
        delay:false, //ms delay to fire the node
        repeat:false, // set repeat as an integer to repeat the input n times
        recursive:false, //or set recursive with an integer to pass the output back in as the next input n times
        animate:true, //true or false
        loop:undefined, //milliseconds or false
        tag:undefined, //generated if not specified, or use to get another node by tag instead of generating a new one
        input:undefined,// can set on the attribute etc
        graph:undefined, //parent AcyclicGraph instance, can set manually or via enclosing acyclic-graph div
        node:undefined, //GraphNode instance, can set manually or as a string to grab a node by tag (or use tag)
    }; //can specify properties of the element which can be subscribed to for changes.

    //make these children of SpaceNode 
    let PhysicsBodyChildProps = {
        mass:5.972e24,              //kg  //e.g. earth's mass
        radius:6.3781e9,            //body radius (m)   //e.g. earth's radius
        distance:undefined, //distance from origin, can be used to set initial position with theta and azimuth
        theta:undefined,   //xy circular angle (0-365 deg), can set this instead of initial position
        azimuth:undefined, //z angle (0 - 180 deg), can set this instead of initial position coordinates 
        position:{x:150e9,y:0,z:0}, //center is origin (0,0,0), position represents distance from center (m)
        velocity:{x:0,y:0,z:0}, //m/s
        acceleration:{x:0,y:0,z:0}, //m/s^2
        force:{x:0,y:0,z:0},        //Newtons 
        restitution:0.01,
        vloss:0.00000000000001,                  //velocity loss multiplier (loss = 1-vloss), this causes more loss at higher speeds
        fixed:false,
        bounded:true, //bounded by parentNode clientRect
        // collidedWith:{}, //last tick 
        // prevCollidedWith:{}, //last last tick
        operator:(input,node,origin,cmd) => {
            
            let tstep;

            if(typeof input === 'object') {
                if(input.position) this.position = input.position;
                if(input.velocity) this.velocity = input.velocity;
                if(input.acceleration) this.acceleration = input.acceleration;
                if(input.force) this.force = input.force;
                if(input.tstep) tstep = input.tstep;
            } else if (typeof input === 'number') {
                tstep = input;
            } else if (typeof input === 'string') {
                tstep = parseInt(input);
            } else {
                
            }

            let f = this.force;
            let a = this.acceleration;
            let v = this.velocity;
            let p = this.position;
            
            if(tstep && this.fixed === false) {
                if(f.x) { 
                    a.x+=f.x/this.mass;
                    f.x = 0;
                }
                if(f.y) {
                    a.y+=f.y/this.mass;
                    f.y = 0;
                }
                if(f.z) {
                    a.z+=f.z/this.mass;
                    f.z = 0;
                }

                // let vxn = v.x*tstep;
                // let vyn = v.y*tstep;
                // let vzn = v.z*tstep;

                if(a.x) v.x+=a.x*tstep;//-this.vloss*vxn;
                if(a.y) v.y+=a.y*tstep;//-this.vloss*vyn;
                if(a.z) v.z+=a.z*tstep;//-this.vloss*vzn;
                if(v.x) p.x+=v.x*tstep;
                if(v.y) p.y+=v.y*tstep;
                if(v.z) p.z+=v.z*tstep;

                if(this.bounded) this.checkBoundaries(p,v);

                // this.prevCollidedWith = this.collidedWith; //prevent overlapping collisions from adding too many forces etc on.
                // this.collidedWith = {};                

                //update reference values
                this.distance = this.magnitude(this.position);
                this.azimuth = this.calcAzimuth(this.position);
                this.zenith = this.calcZenith(this.position,this.distance);

                if(this.parentNode.props?.useHTML  || !this.parentNode.props) {
                    this.div.style.left = (this.parentNode.clientWidth*0.5+this.position.x/this.parentNode.props.meter_per_px)+'px';
                    this.div.style.top = (this.parentNode.clientHeight*0.5-this.position.y/this.parentNode.props.meter_per_px)+'px';
                    let z = Math.floor(this.position.z/this.parentNode.props.meter_per_px);
                    if(this.parentNode.props.zind > z) {this.parentNode.props.zind = z;}
                    let pind = parseInt(this.parentNode.props.canvas.style.zIndex);
                    if(!pind) pind = 1;
                    this.div.style.zIndex = z + pind - this.parentNode.props.zind;
                }
            }

            return input; 

        }, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
        forward:true, //pass output to child nodes
        backward:false, //pass output to parent node
        children:undefined, //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
        parent:undefined, //parent graph node
        delay:false, //ms delay to fire the node
        repeat:false, // set repeat as an integer to repeat the input n times
        recursive:false, //or set recursive with an integer to pass the output back in as the next input n times
        animate:false, //true or false
        loop:undefined, //milliseconds or false
        tag:undefined, //generated if not specified, or use to get another node by tag instead of generating a new one
        input:undefined,// can set on the attribute etc
        graph:undefined, //parent AcyclicGraph instance, can set manually or via enclosing acyclic-graph div
        node:undefined, //GraphNode instance, can set manually or as a string to grab a node by tag (or use tag)
    }; //can specify properties of the element which can be subscribed to for changes.



*/