# Graphs

The Graph and GraphNode classes are an implementation of the acyclic graphs and node-based hierarchical programming. Best jargon I could come up with is that this is an "object-oriented functional programming" approach to a generalized javascript programming API. 

It handles synchronous and asynchronous programming approaches including flowgraph execution and inbuilt loops, animations, recursion, forward and backprop, and dynamic node generation with simple objects or straight functions with minimal specification and any properties and arguments you want.

If that sounds like a lot, we took this a few steps further with the higher level Service and Router implementations to enable interoperable programming and one-liner pipes through networking protocols, web workers, peer 2 peer connections. This let's you focus more on creating mroe robust, performant, and dynamic application and computation pipelines. This even includes unified end 2 end encryption pipes to simplify app security with common accepted standards like AES and SHA256 (WIP). 

To make the best use of this API it's important to have strong internal concepts of scoping, sync/async/promises, threading, and basic javascript object usage and referencing. However, it ought to make learning these concepts easier.

### Basic usage
```js

const tree = {
    add:(a=0,b=0)=>{
        return a+b;
    },
    square:(c)=>{
        return c*c;
    },
    log:(...args)=>{
        console.log('LOG:',...args);
    },
    sequence:{
        result:undefined,
        operator:(input1,input2)=>{
            this.result = [input1,input2];
            return this.result;
        },
        children:[{
            tag:'add',
            children:{
                tag:'square',
                children:[
                    'log',
                    {
                        tag:'square',
                        children:[ 'log', (self,origin,output)=>{ self.graph.get('sequence').result = output;  }]
                    }
                ]
            }
        }]
    }
}

const graph = new Graph(tree);

graph.run('sequence',21,23).then((res) => {
    console.log(res);
    console.log(graph.get('sequence').result);
});

```


### GraphNode class

These are the objects created to represent each node in the tree. They can be created without belonging to a graph. The graph simply makes it easier to instantiate and index nodes.

GraphNode properties
```ts

//operators may be any functions with any inputs, if either of the first two default arguments are not detected it will wrap the function in a node-friendly operator like below, so you can forget about this syntax in practice or use it when you need it!
type OperatorType = ( //can be async
    self:GraphNode,  //'this' node
    origin:string|GraphNode|Graph, //origin node
    ...args:any //input arguments, e.g. output from another node
)=>any|void

type GraphNodeProperties = {
    tag?:string, //generated if not specified, or use to get another node by tag instead of generating a new one
    operator?:OperatorType|((...args)=>any|void), //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
    forward?:boolean, //pass output to child nodes
    backward?:boolean, //pass output to parent node
    children?:string|GraphNodeProperties|GraphNode|(GraphNodeProperties|GraphNode|string)[], //child node(s), can be tags of other nodes, properties objects like this, or GraphNodes, or null
    parent?:GraphNode|undefined, //parent graph node
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

```

GraphNode utilities

```js

    //node properties you can set, create a whole tree using the children
    let props={
        operator:(
            self,  //'this' node
            origin, //origin node
            ...args    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
        )=>{ console.log(args); return args; }, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
        forward:true, //pass output to child nodes
        backward:false, //pass output to parent node
        children:undefined, //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
        parent:undefined, //parent graph node
        delay:false, //ms delay to fire the node
        repeat:false, // set repeat as an integer to repeat the input n times
        recursive:false, //or set recursive with an integer to pass the output back in as the next input n times
        frame:false, //true or false. If repeating or recursing, execute on requestAnimationFrame? Careful mixing this with animate:true
        animate:false, //true or false
        loop:undefined, //milliseconds or false
        tag:undefined, //generated if not specified, or use to get another node by tag instead of generating a new one
      }; //can specify properties of the element which can be subscribed to for changes.


let node = new GraphNode(props, parentNode, graph);

node
    .run(...args) //<--- this is the base sequencing function.  If any async or flow logic is being used by the node, it returns a promise which can be awaited to get the final result of the tree. Else it returns a synchronous operation for speed. Subscriptions to async nodes will fire after the promise resolves otherwise
   
    ._run(node=this, origin, ...args) //<--- runs the node sequence starting from the given node. If any async or flow logic is being used by the node, it returns a promise which can be awaited to get the final result of the tree. Else it returns a synchronous operation for speed.

    .runAsync(...args) //force the operation to run as a promise for cleaner chaining

    .runAnimation(input,node=this,origin) //run the operator loop on the animation loop with the given input conditions, the cmd will be 'animate' so you can put an if statement in to run animation logic in the operator

    .runLoop(input,node=this,origin) //runs a setTimeout loop according to the node.loop setting (ms)

    .setOperator(operator) //set the operator functions

    .setParent(parent) //set the parent GraphNode

    .operator(node=this, origin, ...args) //<--- runs the operator function
    
    .runOp(node=this, origin, ...args) //<--- runs the operator and sets state with the result for that tag. Returns a promise if the operator is an async function.
    

    .addChildren(children) //add child GraphNodes to this node (operation results passed on forward pass)

    .subscribe(callback=(res)=>{},tag=this.tag) //subscribe to the tagged node output, returns an int. if you pass a graphnode as a callback it will call subscribeNode
 
    .unsubscribe(sub,tag=this.tag) //unsubscribe from the tag, no sub = unsubscribe all

    .subscribeNode(node) //subscribe another node sequence (not a direct child) to this node's output via the state

    .removeTree(node) //remove a node and all associated nodes

    .add(props) //add a node using a properties object

    .append(props, parentNode=this) //append a child node with a properties object or string

    .get(tag) //get a child node of this node by tag (in tree)

    .remove(node) //remove a node reference from this node and any nodes indexed in this node

    .stopLooping() //stop the loop

    .stopAnimating() //stop the animation loop

    .stopNode() //stop both

    .convertChildrenToNodes(node=this) //convert child node properties objects/tags/etc to nodes.

    .callParent(...args) //run the parent node operation (no propagation)

    .callChildren(idx?, ...args) //call the children node(s) with the given input, won't run their forward/backward passes. Can specify children by index as well

    .setProps(props) //assign to self, will trigger the runSync checks again

    .print(node=this,printChildren=true) //recursively print a reconstrucible json hierarchy of the graph nodes, including arbitrary keys/functions, if printChildren is set to false it will only print the tags and not the whole object in the .children property of this node

    .reconstruct(json='{}') //reconstruct a jsonified node hierarchy into a functional GraphNode tree and add it to the list

```


### Acyclic Graph Utilities

```js


export type Tree = {
    [key:string]: //the key becomes the node tag on the graph
        GraphNode |
        GraphNodeProperties |
        OperatorType |
        ((...args)=>any|void) |
        { aliases:string[] } & GraphNodeProperties
}

let tree = { //you may pass an object to register a list of nodes from prototypes given here. The keys given will be the tag for the base node (parent/child prototypes need tags, else they are randomly assigned tags)
    log:(...inp)=>{
        console.log(...inp);
    },
    repeater:{
        operator:(...args) => { console.log("Reporting... ",Math.random()) },
        loop:500
    }
    animation:{
        ctx:undefined,
        width:200,
        height:200,
        operator:function anim(...args) {
            if(!this.ctx) {
                document.body.insertAdjacentHTML('beforeend',`<canvas id='square' width='${this.width}px' height='${this.height}px' style='width:${this.width}px; height:${this.height}px;'></canvas>`);
                let square = document.getElementById('square');
                this.ctx = square.getContext('2d'); 
            }
            
        }
    }
} 

//this is less useful now that the graph nodes are self contained but it can act as an index for your node trees.
let graph = new Graph(tree);

    graph

        .setTree(tree) //apply a tree object to the graph to instantiate a bunch of nodes and append the existing tree with more methods

        .addNode(node) // add a node with a properties object

        .getNode(tag) // get a node by tag, nodes added in the acyclic graph automatically get their tags set to sequential numbers if not set otherwise

        .create(operator=(self,origin,...args)=>{},parentNode,props) //create a node just using an operator, can pass props for more

        .run(node,...args) //<--- runs the node sequence starting from the given node, returns a promise that will spit out the final result from the tree if any

        .runAsync(node,...args) //force the operation to return as a promise for cleaner chaining

        ._run(node,origin,...args) //the syntax-correct run call we use internally, it's pretty useful sometimes 

        .removeTree(node) // remove a node tree by head node

        .removeNode(node) // remove a node and any references

        .appendNode(node, parentNode) // append a node to a parent node

        .callParent(node,input,origin=node,cmd) // call a parent ndoe of a given node

        .callChildren(node, input, origin=node, cmd, idx) // call the children of a given node

        .subscribe(tag, callback=(res)=>{}) //subscribe to a node tag, callbacks contain that node's operator output, returns an int sub number

        .unsubscribe(tag, sub) //unsubscribe to a node by tag, 

        .subscribeNode(inputNode,outputNode) //subscribe the outputNode to the output of the inputNode

        .print(node,printChildren=true) //recursively print a reconstrucible json hierarchy of the graph nodes, including arbitrary keys/functions, if printChildren is set to false it will only print the tags and not the whole object in the .children property of this node

        .reconstruct(json='{}') //reconstruct a jsonified node hierarchy into a functional GraphNode tree

```
