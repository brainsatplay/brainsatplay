//another method
export function getFnParamNames(fn):string[]{ //https://stackoverflow.com/questions/9091838/get-function-parameter-names-for-interface-purposes
    var fstr = fn.toString();
    return fstr.match(/\(.*?\)/)[0].replace(/[()]/gi,'').replace(/\s/gi,'').split(',');
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
        else {
        try {newFunc = (0,eval)(newFuncHead + newFuncBody + "}");} catch {}
        }
    }

    return newFunc;

}

//just a more typical hierarchical graph tree with back and forward prop and arbitrary 
// go-here-do-that utilities. Create an object node tree and make it do... things 
// same setup as sequencer but object/array/tag only (no functions), and can add arbitrary properties to mutate on objects
// or propagate to children/parents with utility calls that get added to the objects
//Joshua Brewster and Garrett Flynn AGPLv3.0

export type OperatorType = ( //can be async
    self:GraphNode,  //'this' node
    origin:string|GraphNode|Graph, //origin node
    ...args:any //input arguments, e.g. output from another node
)=>any|void

export type Tree = {
    [key:string]: //the key becomes the node tag on the graph
        GraphNode |
        GraphNodeProperties |
        OperatorType |
        ((...args)=>any|void) |
        { aliases:string[] } & GraphNodeProperties
}

//properties input on GraphNode or add, or for children
export type GraphNodeProperties = {
    tag?:string, //generated if not specified, or use to get another node by tag instead of generating a new one
    operator?:OperatorType|((...args)=>any|void), //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
    forward?:boolean, //pass output to child nodes
    backward?:boolean, //pass output to parent node
    children?:string|GraphNodeProperties|GraphNode|(GraphNodeProperties|GraphNode|string)[], //child node(s), can be tags of other nodes, properties objects like this, or GraphNodes, or null
    parent?:GraphNode|Graph, //parent graph node
    branch?:{ //based on the operator result, automatically do something
        [label:string]:{ //apply any label for your own indexing
            if:any, //if this value
            then:string|((...operator_result:any[])=>any)|GraphNode //then do this, e.g. use a node tag, a GraphNode, or supply any function
        } //it still returns afterward but is treated like an additional flow statement :D
    },
    delay?:false|number, //ms delay to fire the node
    repeat?:false|number, // set repeat as an integer to repeat the input n times, cmd will be the number of times the operation has been repeated
    recursive?:false|number, //or set recursive with an integer to pass the output back in as the next input n times, cmd will be the number of times the operation has been repeated
    frame?:boolean, //true or false. If repeating or recursing, execute on requestAnimationFrame? Careful mixing this with animate:true
    animate?:boolean, //true or false, run the operation on an animationFrame loop?
    loop?:false|number, //milliseconds or false, run the operation on a loop?
    animation?: OperatorType, //if it outputs something not undefined it will trigger parent/child operators
    looper?: OperatorType, //if it outputs something not undefined it will trigger parent/child operators
    DEBUGNODE?:boolean // print a console.time and the result for a node by tag, run DEBUGNODES on a GraphNode or Graph to toggle debug on all attached nodes.
    [key:string]:any //add whatever variables and utilities
}; //can specify properties of the element which can be subscribed to for changes.



//TODO: try to reduce the async stack a bit for better optimization, though in general it is advantageous matter as long as node propagation isn't 
//   relied on for absolute maximal performance concerns, those generally require custom solutions e.g. matrix math or clever indexing, but this can be used as a step toward that.

//a graph representing a callstack of nodes which can be arranged arbitrarily with forward and backprop or propagation to wherever
export const state = {
    pushToState:{},
    data:{},
    triggers:{},
    setState(updateObj:{[key:string]:any}){
        Object.assign(state.data, updateObj);
        for (const prop of Object.getOwnPropertyNames(updateObj)) {
            if (state.triggers[prop]) state.triggers[prop].forEach((obj) => obj.onchange(state.data[prop]));
        }
        return state.data;
    },
    subscribeTrigger(key:string,onchange:(res:any)=>void){
        if(key) {
            if(!state.triggers[key]) {
                state.triggers[key] = [];
            }
            let l = state.triggers[key].length;
            state.triggers[key].push({idx:l, onchange});
            return state.triggers[key].length-1;
        } else return undefined;
    },
    unsubscribeTrigger(key:string,sub:number){
        let idx = undefined;
        let triggers = state.triggers[key]
        if (triggers){
            if(!sub) delete state.triggers[key];
            else {
                let obj = triggers.find((o)=>{
                    if(o.idx===sub) {return true;}
                });
                if(obj) triggers.splice(idx,1);
                return true;
            }
        }
    },
    subscribeTriggerOnce(key:string,onchange:(res:any)=>void) {
        let sub;
        
        let changed = (value) => {
            onchange(value);
            state.unsubscribeTrigger(key,sub);
        }
        sub = state.subscribeTrigger(key,changed);
    }
}


  /**
   * Creates new instance of a GraphNode
   * The methods of this class can be referenced in the operator after setup for more complex functionality
   * 
   * ```typescript
   * const graph = new GraphNode({custom: 1, operator: (self, origin, input) => console.log(input, self.custom)});
   * ```
   */

export class GraphNode {

    nodes:Map<any,any> = new Map()
    attributes = new Set()

    tag:string;
    parent:GraphNode|Graph;
    children:any;
    graph:Graph;
    state = state; //shared trigger state
    isLooping = false;
    isAnimating = false;
    looper = undefined; //loop function, uses operator if undefined (with cmd 'loop');
    animation = undefined; //animation function, uses operator if undefined (with cmd 'animate')
    forward:boolean = true; /// propagate outputs to children?
    backward:boolean = false; //propagate outputs to parents?
    runSync:boolean = false;
    firstRun:boolean = true;
    DEBUGNODE:boolean = false; //prints a console.time and console.timeEnd on each runOp call

    [key:string]: any; // any additional attribute

    constructor(
        properties:GraphNodeProperties|OperatorType|((...args)=>any|void)={}, 
        parentNode?:GraphNode, 
        graph?:Graph
    ) {    

        if(typeof properties === 'function') { //pass a function instead of properties to set up a functional graph quickly
            properties = { operator:properties as any };
        }

        if(typeof properties === 'object') {

            if(properties.tag) {
                if(graph?.nodes) {
                    let hasnode = graph.nodes.get(properties.tag);
                    if(hasnode) return hasnode;
                }
                if(parentNode?.nodes) {
                    let hasnode = parentNode.nodes.get(properties.tag);
                    if(hasnode) return hasnode; 
                } //return a different node if it already exists (implying we're chaining it in a flow graph using objects)
            }

            if(properties?.operator) {

                let params = getFnParamNames(properties.operator);

                //we can pass other formatted functions in as operators and they will be wrapped to assume they don't use self/node or origin/router, but will still work in the flow graph logic calls
                if(!(params[0] == 'self' || params[0] == 'node' || params[1] == 'origin' || params[1] == 'parent' || params[1] == 'graph' || params[1] == 'router')) {
                    let fn = properties.operator;
                    //wrap the simplified operator to fit our format
                    properties.operator = (self:GraphNode,origin:string|GraphNode|Graph,...args) => {
                        return (fn as any)(...args);
                    }
                }

            }
            
            // const keys = Object.keys(this)
            // const prohibited = ['tag', 'parent', 'graph', 'children', 'operator']    
            // for (let key in properties){
            //     if (!keys.includes(key) && !prohibited.includes(key)) this.attributes.add(key)
            // }
    
            if(!properties.tag && graph) {
                properties.tag = `node${graph.nNodes}`; //add a sequential id to find the node in the tree 
            }
            else if(!properties.tag) {
                properties.tag = `node${Math.floor(Math.random()*10000000000)}`; //add a random id for the top index if none supplied
            }    

            // for(const prop in properties) {
            //     if(!(prop in this)) {
            //         Object.defineProperty(this, prop,
            //         {
            //             enumerable : true, 
            //             configurable : true, 
            //             set: function(v) {
            //                 this.firstRun = true; this[prop] = v; 
            //             } //reset firstrun if graph properties are changed so it can update flow logic potentially
            //         });
            //         this[prop] = properties[prop];
            //     }
            //     else this[prop] = properties[prop];
            // }
            Object.assign(this,properties); //set the node's props as this  

            if(!this.tag) {
                if(graph) {
                    this.tag = `node${graph.nNodes}`;
                } else {
                    this.tag = `node${Math.floor(Math.random()*10000000000)}`;
                }
            }        
            if(parentNode) this.parent=parentNode;
            if(graph) this.graph=graph;
        
            if(graph) {
                graph.nNodes++;
                graph.nodes.set(this.tag,this);
            }
        
            if(this.children) this.convertChildrenToNodes(this);
        }
        else return properties;
      
    }
    
    // I/O scheme for this node in the graph
    operator:OperatorType = (self:GraphNode=this, origin:string|GraphNode|Graph, ...args:any[]) => {
        return args as any;
    }
    
    //run the operator
    runOp = (
        node:GraphNode=this,
        origin:string|GraphNode|Graph=this, // Options: this, this.parent, this.children[n], or an arbitrary node that is subscribed to.
        ...args:any[]
    ) => {
        if(node.DEBUGNODE) console.time(node.tag);
        let result = node.operator(node,origin,...args);
        if(result instanceof Promise) {
            result.then((res) => {
                if(res !== undefined) this.setState({[node.tag]:res}) //return null at minimum to setState
                if(node.DEBUGNODE) {console.timeEnd(node.tag); if(result !== undefined) console.log(`${node.tag} result:`, result)};
                return res;
            })
        }
        else {
            if(result !== undefined) this.setState({[node.tag]:result}); //return null at minimum to setState
            if(node.DEBUGNODE) {console.timeEnd(node.tag); if(result !== undefined) console.log(`${node.tag} result:`, result)};
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

    run = (...args:any[]) => {
        return this._run(this,undefined,...args); //will be a promise
    }
    
    runAsync = (...args:any[]) => {
        return new Promise((res,rej) => {res(this._run(this,undefined,...args))}); //will be a promise
    }

    _run = (
        node:GraphNode=this, 
        origin?:string|GraphNode|Graph, 
        ...args:any[]
    ) => {
        // NOTE: Should create a sync version with no promises (will block but be faster)

        if(!(node instanceof GraphNode)) {
            if(!node) return undefined;
            if(Object.getPrototypeOf(node) === String.prototype) { //can pass the node tag instead
                let fnd:any = undefined;
                if(this.graph) fnd = this.graph.nodes.get(node);
                if(!fnd) fnd = this.nodes.get(node);
                node = fnd;
            }
        }
        

        //console.log('running node ', node.tag, 'children: ', node.children);
            
        //can add an animationFrame coroutine, one per node //because why not
        if(node.firstRun) {
            node.firstRun = false;
            if(
                !( 
                   (node.children && node.forward) || 
                   (node.parent && node.backward) || 
                   node.repeat || node.delay || 
                    node.frame || node.recursive ||
                    node.branch
                )
            ) node.runSync = true;

            if(node.animate && !node.isAnimating) {
                node.runAnimation(node.animation,args,node,origin);
            }

            //can add an infinite loop coroutine, one per node, e.g. an internal subroutine
            if(node.loop && typeof node.loop === 'number' && !node.isLooping) {
                node.runLoop(node.looper,args,node,origin);
            }

            if(node.loop || node.animate) 
                return;

        }
    
        //no async/flow logic so just run and return the operator result (which could still be a promise if the operator is async)
        if(node.runSync){
            let res = node.runOp(node, origin, ...args); //repeat/recurse before moving on to the parent/child
            return res;
        }

        return new Promise(async (resolve) => {
            if(node) {
                let run = (node, tick=0, ...input):Promise<any> => {
                    return new Promise (async (r) => {
                        tick++;
                        let res = await node.runOp(node, origin, ...input); //executes the operator on the node in the flow logic
                        if(node.repeat) {
                            while(tick < node.repeat) {
                                if(node.delay) {
                                    setTimeout(async ()=>{
                                        r(await run(node,tick, ...input));
                                    },node.delay);
                                    break;
                                } else if (node.frame && window?.requestAnimationFrame as any) {
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
                        } else if(node.recursive) {
                            
                            while(tick < node.recursive) {
                                if(node.delay) {
                                    setTimeout(async ()=>{
                                        r(await run(node,tick, ...res));
                                    },node.delay);
                                    break;
                                } else if (node.frame && window?.requestAnimationFrame as any) {
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
    
                    if(res !== undefined) { //if returning void let's not run the additional flow logic
                        if(node.backward && node.parent instanceof GraphNode) {
                            if(Array.isArray(res)) await this.runParent(node,...res);
                            else await this.runParent(node,res);
                        }
                        if(node.children && node.forward) {
                            if(Array.isArray(res)) await this.runChildren(node,...res);
                            else await this.runChildren(node,res);
                        }
                        if(node.branch) {
                            this.runBranch(node,res);
                        }
                    }
    
                    return res;
                }
    
                if(node.delay) {
                    setTimeout(async ()=>{
                        resolve(await runnode());
                    },node.delay);
                } else if (node.frame && window?.requestAnimationFrame as any) {
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

    runParent = async (node:GraphNode, ...args) => {
        if(node.backward && node.parent) {
            if(typeof node.parent === 'string') {
                if(node.graph && node.graph?.get(node.parent)) {
                    node.parent = node.graph;
                    if(node.parent) this.nodes.set(node.parent.tag, node.parent);
                }
                else node.parent = this.nodes.get(node.parent);
            }
            
            if(node.parent instanceof GraphNode) await node.parent._run(node.parent, this, ...args);
        }
    }

    runChildren = async (node:GraphNode, ...args) => {
        if(Array.isArray(node.children)) {
            for(let i = 0; i < node.children.length; i++) { 
                if (Object.getPrototypeOf(node.children[i]) === String.prototype) {
                    if(node.graph && node.graph?.get(node.children[i])) {
                        node.children[i] = node.graph.get(node.children[i]); //try graph scope
                        if(!node.nodes.get(node.children[i].tag)) node.nodes.set(node.children[i].tag,node.children[i]);
                    }
                    if(!node.children[i] && node.nodes.get(node.children[i])) node.children[i] = node.nodes.get(node.children[i]); //try local scope
                }
                if(node.children[i]?.runOp)
                    await node.children[i]._run(node.children[i], node, ...args);
            }
        }
        else if(node.children) {
            if (Object.getPrototypeOf(node.children) === String.prototype) {
                if(node.graph && node.graph?.get(node.children)) {
                    node.children = node.graph.get(node.children); //try graph scope
                    if(!node.nodes.get(node.children.tag)) node.nodes.set(node.children.tag,node.children);
                }
                if(!node.children && node.nodes.get(node.children)) node.children = node.nodes.get(node.children); //try local scope
            }
            if(node.children?.runOp)
                await node.children._run(node.children, node, ...args);
        }
    }

    runBranch = async (node:GraphNode, output:any) => {
        if(node.branch) {
            let keys = Object.keys(node.branch);
            await Promise.all(keys.map(async (k) => {
                    if(output instanceof Object) {
                        if(node.branch[k].if instanceof Object) node.branch[k].if = stringifyFast(node.branch[k].if);
                        if(stringifyFast(output) === node.branch[k].if) {
                            if(node.branch[k].then instanceof GraphNode) {
                                if(Array.isArray(output))  await node.branch[k].then.run(...output);
                                else await node.branch[k].then.run(output);
                            }
                            else if (typeof node.branch[k].then === 'function') {
                                if(Array.isArray(output)) await node.branch[k].then(...output)
                                else await node.branch[k].then(output);
                            } else if (typeof node.branch[k].then === 'string') {
                                if(node.graph) node.branch[k].then = node.graph.nodes.get(node.branch[k].then);
                                else node.branch[k].then = node.nodes.get(node.branch[k].then);

                                if(node.branch[k].then instanceof GraphNode) {
                                    if(Array.isArray(output))  await node.branch[k].then.run(...output);
                                    else await node.branch[k].then.run(output);
                                }
                            }
                            return true;
                        }
                    } else {
                        await node.branch[k].then(output); 
                        return true;
                    } 
            }))
        }
    }
    
    runAnimation = (
        animation:OperatorType=this.animation as any, 
        args:any[]=[], 
        node:GraphNode&GraphNodeProperties|any=this, 
        origin?:string|GraphNode|Graph
    ) => {
        //can add an animationFrame coroutine, one per node //because why not
        this.animation = animation as any;
        if(!animation) this.animation = this.operator as any;
        if(node.animate && !node.isAnimating) {
            node.isAnimating = true;
            let anim = async () => {
                //console.log('anim')
                if(node.isAnimating) {
                    if(node.DEBUGNODE) console.time(node.tag);
                    let result = (this.animation  as any)( 
                        node,
                        origin,
                        ...args
                    );
                    if(result instanceof Promise) {
                        result = await result;
                    }
                    if(node.DEBUGNODE) {console.timeEnd(node.tag); if(result !== undefined) console.log(`${node.tag} result:`, result)};
                    if(result !== undefined) {
                        if(this.tag) this.setState({[this.tag]:result}); //if the anim returns it can trigger state
                        if(node.backward && node.parent?._run) {
                            if(Array.isArray(result)) await this.runParent(node,...result);
                            else await this.runParent(node,result);
                        }
                        if(node.children && node.forward) {
                            if(Array.isArray(result)) await this.runChildren(node,...result);
                            else await this.runChildren(node,result);
                        }
                        if(node.branch) {
                            this.runBranch(node,result);
                        }
                        this.setState({[node.tag]:result});
                    }
                    requestAnimationFrame(anim);
                }
            }
            requestAnimationFrame(anim);
        }
    }
    
    runLoop = (
        loop:OperatorType=this.looper as any, 
        args:any[]=[], 
        node:GraphNode&GraphNodeProperties|any=this, 
        origin?:string|GraphNode|Graph,
        timeout:number=node.loop
    ) => {
        //can add an infinite loop coroutine, one per node, e.g. an internal subroutine
        node.looper = loop;
        if(!loop) node.looper = node.operator;
        if(typeof timeout === 'number' && !node.isLooping) {
            node.isLooping = true;
            let looping = async () => {
                if(node.isLooping)  {
                    if(node.DEBUGNODE) console.time(node.tag);
                    let result = node.looper(
                        node, 
                        origin, 
                        ...args
                    );
                    if(result instanceof Promise) {
                        result = await result;
                    }
                    if(node.DEBUGNODE) {console.timeEnd(node.tag); if(result !== undefined) console.log(`${node.tag} result:`, result)};
                    if(result !== undefined) {
                        if(node.tag) node.setState({[node.tag]:result}); //if the loop returns it can trigger state
                        if(node.backward && node.parent?._run) {
                            if(Array.isArray(result)) await this.runParent(node,...result);
                            else await this.runParent(node,result);
                        }
                        if(node.children && node.forward) {
                            if(Array.isArray(result)) await this.runChildren(node,...result);
                            else await this.runChildren(node,result);
                        }
                        if(node.branch) {
                            this.runBranch(node,result);
                        }
                        node.setState({[node.tag]:result});
                    }
                    setTimeout(async ()=>{ await looping(); }, timeout);
                }
            }
            looping(); // -.-
            //console.log('looping',timeout, loop, node.operator)
        }
    }
    
    //this is the i/o handler, or the 'main' function for this node to propagate results. The origin is the node the data was propagated from
    setOperator = (operator:OperatorType) => {
        this.operator = operator;
    }
    
    // Set GraphNode parent
    setParent = (parent:GraphNode) => { 
        this.parent = parent;
        if(this.backward) this.runSync = false;
    }
    
    // Set GraphNode children
    setChildren = (children:GraphNode|GraphNode[]) => {
        this.children = children;
        if(this.forward) this.runSync = false;
    }
    
    //converts all children nodes and tag references to GraphNodes also
    add = (node:GraphNodeProperties|OperatorType|((...args)=>any|void)={}) => {
        if(typeof node === 'function') node = { operator:node as any};
        if(!(node instanceof GraphNode)) node = new GraphNode(node,this,this.graph); 
        this.nodes.set(node.tag,node);
        if(this.graph) this.graph.nodes.set(node.tag,node);
        return node;
    }
    
    remove = (node:string|GraphNode) => {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node instanceof GraphNode) {
            this.nodes.delete(node.tag);
            if(this.graph) this.graph.nodes.delete(node.tag);
            this.nodes.forEach((n:GraphNode) => {
                if(n.nodes.get((node as GraphNode).tag)) n.nodes.delete((node as GraphNode).tag);
            }); 
        }
    }
    
    //append a node as a child to a parent node (this by default)
    append = (node:string|GraphNode, parentNode=this) => {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node instanceof GraphNode)  {
            parentNode.addChildren(node);
            if(node.forward) node.runSync = false;
        }
    }      
            
    //subscribe an output with an arbitrary callback
    subscribe = (callback:GraphNode|((res)=>void),tag:string=this.tag) => {
        if(callback instanceof GraphNode) {
            return this.subscribeNode(callback);
        } else return this.state.subscribeTrigger(tag,callback);
    }
    
    //unsub the callback
    unsubscribe = (sub:number,tag=this.tag) => {
        this.state.unsubscribeTrigger(tag,sub);
    }

    //append child
    addChildren = (children:GraphNode|GraphNodeProperties|(GraphNode|GraphNodeProperties)[]) => {
        if(!this.children) this.children = [];
        if(!Array.isArray(this.children)) {
            this.children = [children];
            if(typeof children === 'object' && (children as any).tag) {
                this.nodes.set((children as any).tag,children);
                if(this.graph) this.graph.nodes.set((children as any).tag,children);
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
        if(this.forward) this.runSync = false;
    }

    
    //Call parent node operator directly (.run calls the flow logic)
    callParent = (...args) => {
        const origin = this // NOTE: This node must be the origin
        if(typeof this.parent === 'string') {
            if(this.graph && this.graph?.get(this.parent)) {
                this.parent = this.graph;
                if(this.parent) this.nodes.set(this.parent.tag, this.parent);
            }
            else this.parent = this.nodes.get(this.parent);
        }
        if(typeof this.parent?.operator === 'function') return this.parent.runOp(this.parent, origin, ...args);
    }
    
    //call children operators directly (.run calls the flow logic)
    callChildren = (idx?:number, ...args) => {
        const origin = this // NOTE: This node must be the origin
        let result;
        if(Array.isArray(this.children)) {
            if(idx) {
                if (Object.getPrototypeOf(this.children[idx]) === String.prototype) {
                if(this.graph && this.graph.get(this.children[idx])) {
                    this.children[idx] = this.graph.get(this.children[idx]); //try graph scope
                    if(!this.nodes.get(this.children[idx].tag)) this.nodes.set(this.children[idx].tag,this.children[idx]);
                }
                if(!this.children[idx] && this.nodes.get(this.children[idx])) this.children[idx] = this.nodes.get(this.children[idx]); //try local scope
            }
            if(this.children[idx]?.runOp) 
                result = this.children[idx].runOp(this.children[idx], origin, ...args);
            }
            else {
                result = [];
                for(let i = 0; i < this.children.length; i++) {
                    if (Object.getPrototypeOf(this.children[i]) === String.prototype) {
                        if(this.graph && this.graph.get(this.children[i])) {
                            this.children[i] = this.graph.get(this.children[i]); //try graph scope
                            if(!this.nodes.get(this.children[i].tag)) this.nodes.set(this.children[i].tag,this.children[i]);
                        }
                        if(!this.children[i] && this.nodes.get(this.children[i])) this.children[i] = this.nodes.get(this.children[i]); //try local scope
                    }
                    if(this.children[i]?.runOp) result.push(this.children[i].runOp(this.children[i], origin, ...args));
                } 
            }
        } else if(this.children) {
            if (Object.getPrototypeOf(this.children) === String.prototype) {
                if(this.graph && this.graph.get(this.children)) {
                    this.children = this.graph.get(this.children); //try graph scope
                    if(!this.nodes.get(this.children.tag)) this.nodes.set(this.children.tag,this.children);
                }
                if(!this.children && this.nodes.get(this.children)) this.children = this.nodes.get(this.children); //try local scope
            }
            result = this.children.runOp(this.children, origin, ...args);
        }
        return result;
    }
    
    setProps = (props:GraphNodeProperties={}) => {
        Object.assign(this,props);
        if(
            !( 
               (this.children && this.forward) || 
               (this.parent && this.backward) || 
               this.repeat || this.delay || 
               this.frame || this.recursive
            )
        ) this.runSync = true;
    }

    removeTree = (node:GraphNode|string) => { //stop and dereference nodes to garbage collect them
        if(node)if(Object.getPrototypeOf(node) === String.prototype) node = this.nodes.get(node);
        if(node instanceof GraphNode) {
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
                    if(n.nodes.get((node as GraphNode).tag)) n.nodes.delete((node as GraphNode).tag);
                });
                recursivelyRemove(node);
                if(this.graph) this.graph.removeTree(node); //remove from parent graph too 
            }
        }
    }
         
    convertChildrenToNodes = (n:GraphNode) => {
        if( n?.children instanceof GraphNode ) { 
            if(!this.graph?.nodes.get(n.tag)) this.graph.nodes.set(n.tag,n);
            if(!this.nodes.get(n.tag)) this.nodes.set(n.tag,n); 
        }
        else if (Array.isArray(n.children)) {
            for(let i = 0; i < n.children.length; i++) {
                if(n.children[i] instanceof GraphNode) { 
                    if(!this.graph?.nodes.get(n.children[i].tag)) this.graph.nodes.set(n.children[i].tag,n.children[i]);
                    if(!this.nodes.get(n.children[i].tag)) this.nodes.set(n.children[i].tag,n.children[i]);
                    continue; 
                }
                else if(typeof n.children[i] === 'object' || typeof n.children[i] === 'function') {
                    n.children[i] = new GraphNode(n.children[i],n,this.graph);
                    this.nodes.set(n.children[i].tag,n.children[i]);
                    this.convertChildrenToNodes(n.children[i]);
                } 
                else if (typeof n.children[i] === 'string') {
                    if(this.graph && this.graph.get(n.children[i])) {
                        n.children[i] = this.graph.get(n.children[i]); //try graph scope
                        if(!this.nodes.get(n.children[i].tag)) this.nodes.set(n.children[i].tag,n.children[i]);
                    }
                    if(!n.children[i] && this.nodes.get(n.children[i])) n.children[i] = this.nodes.get(n.children[i]); //try local scope
                }
            }
        }
        else if(typeof n.children === 'object' || typeof n.children === 'function') {
            n.children = new GraphNode(n.children,n,this.graph);
            this.nodes.set(n.children.tag,n.children);
            this.convertChildrenToNodes(n.children);
        } 
        else if (typeof n.children === 'string') {
            if(this.graph && this.graph.get(n.children)) {
                n.children = this.graph.get(n.children); //try graph scope
                if(!this.nodes.get(n.children.tag)) this.nodes.set(n.children.tag,n.children);
            }
            if(!n.children && this.nodes.get(n.children)) n.children = this.nodes.get(n.children); //try local scope
        }
        return n.children;
    }

    get = (tag:string) => {
        return this.nodes.get(tag);
    }
    
    //stop any loops
    stopLooping = (node:GraphNode=this) => {
        node.isLooping = false;
    }
    
    stopAnimating = (node:GraphNode=this) => {
        node.isAnimating = false;
    }
    
    stopNode = (node:GraphNode=this) => {
        node.stopAnimating(node);
        node.stopLooping(node);
    }

    
    //subscribe a node (that isn't a forward-passed child of this node) to run after this node 
    subscribeNode = (node:GraphNode) => {
        if(node.tag) this.nodes.set(node.tag,node); //register the node on this node
        return this.state.subscribeTrigger(this.tag,(res)=>{node._run(node, this, res);})
    }
    
    //recursively print a snapshot reconstructible json hierarchy of the node and the children. 
    // Start at the top/initially called nodes to print the whole hierarchy in one go
    print = (node:string|GraphNode=this,printChildren=true,nodesPrinted:any[]=[]) => {
    
        let dummyNode = new GraphNode(); //test against this for adding props
    
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node instanceof GraphNode) {
            
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
        
    }
    
    //reconstruct a node hierarchy (incl. stringified functions) into a GraphNode set
    reconstruct = (json:string|{[x:string]: any}) => {
        let parsed = reconstructObject(json);
        if(parsed) return this.add(parsed);
    }

    setState = this.state.setState; //little simpler

    DEBUGNODES = (debugging:boolean=true) => {
        this.DEBUGNODE = debugging;
        this.nodes.forEach((n:GraphNode) => {
            if(debugging) n.DEBUGNODE = true;
            else n.DEBUGNODE = false;
        });
    }
}



// Macro set for GraphNodes
export class Graph {

    nNodes = 0
    tag:string;
    nodes:Map<any,any> = new Map();
    state=state;

    //can create preset node trees on the graph
    tree:Tree = {};

    [key:string]:any;

    constructor( tree?:Tree, tag?:string ) {
        this.tag = tag ? tag : `graph${Math.floor(Math.random()*100000000000)}`;

        if(tree || Object.keys(this.tree).length > 0) this.setTree(tree);
    }

    //converts all children nodes and tag references to GraphNodes also
    add = (node:GraphNode|GraphNodeProperties|OperatorType|((...args)=>any|void) ={}) => {
        let props = node;
        if(!(node instanceof GraphNode)) node = new GraphNode(props,undefined,this); 
        if(node.tag) this.tree[node.tag] = props; //set the head node prototype in the tree object
        return node;
    }

    setTree = (tree:Tree = this.tree) => {
        if(!tree) return;

        for(const node in tree) { //add any nodes not added yet, assuming we aren't overwriting the same tags to the tree.
            if(!this.nodes.get(node)) {
                if(typeof tree[node] === 'function') {
                    this.add({tag:node, operator:tree[node] as OperatorType|((...args)=>any|void)});
                }
                else if (typeof tree[node] === 'object' && !Array.isArray(tree[node])) {
                    if(!(tree[node] as any).tag) (tree[node] as any).tag = node;
                    let newNode = this.add(tree[node]);
                    if((tree[node] as GraphNodeProperties).aliases) {
                        (tree[node] as GraphNodeProperties).aliases.forEach((a) => {
                            this.nodes.set(a,newNode); 
                        });
                    }
                } else {
                    //we are trying to load something like a number or array in this case so lets make it a node that just returns the value
                    this.add({tag:node,operator:(self,origin,...args) => {return tree[node];}});
                }
            }
        }
    }

    get = (tag:string) => {
        return this.nodes.get(tag);
    }

    //Should create a sync version with no promises (will block but be faster)
    run = (node:string|GraphNode,...args) => {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node instanceof GraphNode)
            return node._run(node,this,...args)
        else return undefined;
    }
    
    runAsync = (node:string|GraphNode,...args) => {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node instanceof GraphNode)
            return new Promise((res,rej) => {res((node as GraphNode)._run((node as GraphNode),this,...args))})
        else return new Promise((res,rej) => {res(undefined)});
    }

    _run = (node:string|GraphNode,origin:string|GraphNode|Graph=this,...args) => {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node instanceof GraphNode)
            return node._run(node,origin,...args)
        else return undefined;
    }

    removeTree = (node:string|GraphNode) => {
        if(typeof node === 'string') node = this.nodes.get(node);
        if(node instanceof GraphNode) {
            const recursivelyRemove = (node:GraphNode) => {
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
            if((node as GraphNode).stopNode) (node as GraphNode).stopNode();
            if((node as GraphNode).tag) {
                this.nodes.delete((node as GraphNode).tag);
                this.nodes.forEach((n) => {
                    if(n.nodes.get((node as GraphNode).tag)) n.nodes.delete((node as GraphNode).tag);
                });
                recursivelyRemove(node as GraphNode);
            }
        }
    }

    remove = (node:string|GraphNode) => {
        if(typeof node === 'string') node = this.nodes.get(node);
        if((node as GraphNode)?.tag) {
            (node as GraphNode).stopNode();
            if((node as GraphNode)?.tag) this.nodes.delete((node as GraphNode).tag);
            if((node as GraphNode)?.tag) {
                if(this.nodes.get((node as GraphNode).tag)) 
                {
                    this.nodes.delete((node as GraphNode).tag);
                    //if(this.graph) this.graph.nodes.delete(node.tag);
                    this.nodes.forEach((n) => {
                        if(n.nodes.get((node as GraphNode).tag)) n.nodes.delete((node as GraphNode).tag);
                    });
                }
            }
        }
    }

    append = (node:GraphNode, parentNode:GraphNode) => {
        parentNode.addChildren(node);
    }

    callParent = async (node:GraphNode, origin:string|GraphNode|Graph=node, ...args ) => {
        if(node?.parent) {
            return await node.callParent(node,origin,...args);
        }
    }

    callChildren = async (node:GraphNode, idx?:number, ...args) => {
        if(node?.children) {
            return await node.callChildren(idx,...args);
        }
    }

    subscribe = (node:string|GraphNode,callback:(res:any)=>void) => {
        if(!callback) return;
        if(node instanceof GraphNode) {
            return node.subscribe(callback);
        }
        else if(typeof node == 'string') return this.state.subscribeTrigger(node,callback);
    }

    unsubscribe = (tag:string,sub:number) => {
        this.state.unsubscribeTrigger(tag,sub);
    }

    //subscribe a node to this node that isn't a child of this node
    subscribeNode = (inputNode:string|GraphNode, outputNode:GraphNode|string) => {
        let tag;
        if((inputNode as GraphNode)?.tag) tag = (inputNode as GraphNode).tag;
        else if (typeof inputNode === 'string') tag = inputNode;
        return this.state.subscribeTrigger(tag,(res)=>{this.run(outputNode,inputNode, ...res);}) // TODO: Check if correct node
    }

    stopNode = (node:string|GraphNode) => {
        if(typeof node === 'string') {
            node = this.nodes.get(node);
        }
        if(node instanceof GraphNode) {
            node.stopNode(); //just sets node.isAnimating and node.isLooping to false
        }
    }

    print = (node:GraphNode|undefined=undefined,printChildren=true) => {
        if(node instanceof GraphNode) return node.print(node,printChildren);
        else {
            let printed = `{`;
            this.nodes.forEach((n) => { //print all nodes if none specified
                printed+=`\n"${n.tag}:${n.print(n,printChildren)}"`  
            });
            return printed;
        }
    }

    //reconstruct a node hierarchy (incl. stringified functions) into a GraphNode set
    reconstruct = (json:string|{[x:string]: any}) => {
        let parsed = reconstructObject(json);
        if(parsed) return this.add(parsed);
    }

    create = (operator:OperatorType,parentNode:GraphNode,props:GraphNodeProperties) => {
        return createNode(operator,parentNode,props,this);
    }

    setState = this.state.setState;

    DEBUGNODES = (debugging:boolean=true) => {
        this.nodes.forEach((n:GraphNode) => {
            if(debugging) n.DEBUGNODE = true;
            else n.DEBUGNODE = false;
        });
    }
}


//macro
export function reconstructNode(json:string|{[x:string]: any},parentNode,graph) {
    let reconstructed = reconstructObject(json);
    if(reconstructed) return new GraphNode(reconstructed,parentNode,graph);
    else return undefined;
}

// exports.Graph = Graph;
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

export const stringifyWithCircularRefs = (function() {
    const refs = new Map();
    const parents:any[] = [];
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

    return function stringifyWithCircularRefs(obj, space?) {
    try {
        parents.push(obj);
        return JSON.stringify(obj, checkCircular, space);
    } finally {
        clear();
    }
    }
})();

if((JSON as any).stringifyWithCircularRefs === undefined) {
    //Workaround for objects containing DOM nodes, which can't be stringified with JSON. From: https://stackoverflow.com/questions/4816099/chrome-sendrequest-error-typeerror-converting-circular-structure-to-json
    (JSON as any).stringifyWithCircularRefs = stringifyWithCircularRefs;
}

//partial stringification for objects and removing circular references. This allows MUCH faster object equivalency comparison with three-tier depth checking
export const stringifyFast = (function() {
    const refs = new Map();
    const parents:any = [];
    const path = ["this"];

    function clear() {
        refs.clear();
        parents.length = 0;
        path.length = 1;
    }

    function updateParents(key, value) {
        var idx = parents.length - 1;
        //console.log(idx, parents[idx])
        if(parents[idx]){
            var prev = parents[idx];
            //console.log(value); 
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
                        idx++;
                    }
                }
            }
        }
    }

    function checkValues(key, value) {
        let val;
        if (value != null) {
            if (typeof value === "object") {
                //if (key) { updateParents(key, value); }
                let c = value.constructor.name;
                if (key && c === 'Object') {updateParents(key, value); }

                let other = refs.get(value);
                if (other) {
                    return '[Circular Reference]' + other;
                } else {
                    refs.set(value, path.join('.'));
                }
                if(c === "Array") { //Cut arrays down to 100 samples for referencing
                    if(value.length > 20) {
                        val = value.slice(value.length-20);
                    } else val = value;
                   // refs.set(val, path.join('.'));
                }  
                else if (c.includes("Set")) {
                    val = Array.from(value)
                }  
                else if (c !== "Object" && c !== "Number" && c !== "String" && c !== "Boolean") { //simplify classes, objects, and functions, point to nested objects for the state manager to monitor those properly
                    val = "instanceof_"+c;
                }
                else if (c === 'Object') {
                    let obj = {};
                    for(const prop in value) {
                        if (value[prop] == null){
                            obj[prop] = value[prop]; 
                        }
                        else if(Array.isArray(value[prop])) { 
                            if(value[prop].length>20)
                                obj[prop] = value[prop].slice(value[prop].length-20); 
                            else obj[prop] = value[prop];
                        } //deal with arrays in nested objects (e.g. means, slices)
                        else if (value[prop].constructor.name === 'Object') { //additional layer of recursion for 3 object-deep array checks
                            obj[prop] = {};
                            for(const p in value[prop]) {
                                if(Array.isArray(value[prop][p])) {
                                    if(value[prop][p].length>20)
                                        obj[prop][p] = value[prop][p].slice(value[prop][p].length-20); 
                                    else obj[prop][p] = value[prop][p];
                                }
                                else { 
                                    if (value[prop][p] != null){
                                        let con = value[prop][p].constructor.name;
                                        if (con.includes("Set")) {
                                            obj[prop][p] = Array.from(value[prop][p])
                                        } else if(con !== "Number" && con !== "String" && con !== "Boolean") {
                                            obj[prop][p] = "instanceof_"+con; //3-deep nested objects are cut off
                                        }  else {
                                            obj[prop][p] = value[prop][p]; 
                                        }
                                    } else {
                                        obj[prop][p] = value[prop][p]; 
                                    }
                                }
                            }
                        }
                        else { 
                            let con = value[prop].constructor.name;
                            if (con.includes("Set")) {
                                obj[prop] = Array.from(value[prop])
                            } else if(con !== "Number" && con !== "String" && con !== "Boolean") {
                                obj[prop] = "instanceof_"+con;
                            } else {
                                obj[prop] = value[prop]; 
                            }
                        }
                    }
                    //console.log(obj, value)
                    val = obj;
                    //refs.set(val, path.join('.'));
                }
                else {
                    val = value;
                }
            } else {
                val = value;
            }
        }
        //console.log(value, val)
        return val;
    }

    return function stringifyFast(obj, space?) {
        parents.push(obj);
        let res = JSON.stringify(obj, checkValues, space);
        clear();
        return res;
    }
})();

if((JSON as any).stringifyFast === undefined) {
    //Workaround for objects containing DOM nodes, which can't be stringified with JSON. From: https://stackoverflow.com/questions/4816099/chrome-sendrequest-error-typeerror-converting-circular-structure-to-json
    (JSON as any).stringifyFast = stringifyFast;
}

export function createNode(operator:OperatorType,parentNode:GraphNode,props:GraphNodeProperties,graph:Graph) {
    if(typeof props === 'object') {
        (props.operator as any) = operator;
        return new GraphNode(props,parentNode,graph);
    }
    return new GraphNode({operator:operator},parentNode,graph);
}
