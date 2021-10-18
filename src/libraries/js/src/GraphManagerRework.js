import { StateManager } from "./ui/StateManager";
import { WorkerManager } from "./utils/workers/Workers";

/* proposed structure for runtime graphs
.Applet {
  .session {}
  .devices []
  .graphs[] { //graphs will get device data to pass to nodes when released (e.g. animation graph or a thread algorithm graph with async timings). 
        .events[] { //multithreaded events, these are just discontinuous graph i/o but allow cross-threaded nodes
            .addEvent(name,props) //will want to have multiple i/o definable as props
            .subEvent(name,port)
            .unsubEvent(name,port)
            .ports[] {
                define event inputs or outputs
            }
            .wires[] {
                connected nodes/plugins/graphs to specific ports
            }
        }
        .nodes[] { //nodes can be made of one or many plugins or just define raw functionality (e.g. logic, switches, loops)
            .plugins[] { //two plugin modes: function or nested graph with more nodes and plugins
                .oninput(in) {
                    if(nodegraph) 
                    call pluginsgraph.plugins[0].oninput(in) return {result}; //i.e. recursive graphs. Graphs may allow asynchronous actions via events
                    else if (pluginsfunction) call nodefunction(in) return {result}; //should return objects with the port names to output to.   
                }
                //graph stuff if graph
                //function stuff if function
                .props {}

                .ports[] { 
                    define plugin (outer) i/o
                    .get() //check wire to set input port
                    .set() //set output port
                }
                .addPort()
                .removePort()

       
            } 
            .addPlugin()
            .removePlugin()

            .props {}

            .ports[] {
                define plugin (outer) i/o
                .get() //check wire to set input port
                .set() //set output port
            }  
            .addPort()
            .removePort()

        }
        .addNode()
        .removeNode()

    .props {} //have ports get and set these porpe

    .ports[] {
        define graph (outer) i/o, mainly for nested graphs
        .get() //check wire to set input port
        .set() //set output port
    }
    .addPort()
    .removePort()

  }
}

Other considerations: 
 - Clear Entry and exit points. i.e. Create templates for frame loops, thread event updates, or otherwise plugins set to run on intervals
        - this creates a crystal clear flowgraph hierarchy.
 - Multithreading-native, so any plugins without DOM or other main thread-only requirements can work in worker threads
 - Clear as crystal data structures = no head scratching ONLY MOARR POWAAAA
*/

//multithreaded event manager, spawn one per thread and import a single instance elsewhere.

/**
 * How it'll work:
 * Function output --> Event Emitter Tx
 * 
 * Event Emitter Rx[] --> State sub triggers to pass output to subscribed ports.
 * 
 * So set the worker onmessage up with the event manager as well (when it's done).
 * This is going to be integral with the node/plugin system so that's what will handle wiring up event i/o
 * and enable native multithreaded graphs. 
 * Use flags, intervals, and animation loops where appropriate to avoid overrun. 
 * 
 * EX:
 * Thread 1:
 * Say ports a b and c emit events x y and z respectively at different times
 * 
 * This creates 3 events that can call postEvent separately
 * 
 * postEvent tags the output object with the event tag based on the port emitting to it
 * 
 * 
 * 
 * 
 */

export function randomId(tag = '') {
    return `${tag+Math.floor(Math.random()+Math.random()*Math.random()*10000000000000000)}`;
}


const graphState = new StateManager({},undefined,false); //shared state manager. does not loop by default

export class EventManager {
    constructor() {
        if(window) {
            if(!window.workers) { 
                window.workers = new WorkerManager();
            } //if on main thread
            else {
                let found = window.workers.workerResponses.find((foo) => {
                    if(foo.name === 'eventmanager') return true;
                });
                if(!found) {
                    window.workers.addCallback('eventmanager',this.workerCallback);
                }
            }
        } 

        this.events = new Map(); 
    }

    //subscribe a port to an event
    subEvent(eventName, port) {
        let event = this.events.get(eventName);
        if(event) return graphState.subscribeTrigger(event.id,(val)=>{port.set(val);});
        else return undefined;
    }

    unsubEvent(eventName, sub) {
        let event = this.events.get(eventName);
        if(event) graphState.unsubscribe(event.id,sub);
    }

    //add an event when a port emits a value (sets state)
    eventEmitter(eventName, port) {
        let event = {name:eventName, id:randomId('event'), port:port, sub:undefined};
        if(port) event.sub = graphState.subscribeTrigger(port.id,(val)=>{this.emit(eventName,val);});
        this.events.set(eventName,event);
        
        return event;
    }

    //remove an event
    removeEmitter(eventName) {
        let event = this.events.get(eventName);
        graphState.unsubscribeAll(event.id);
        if(event.sub) graphState.unsubscribe(event.port.id,event.sub);
        this.events.delete(eventName);
    }

    emit(eventName, val) {
        let output = val;
        if(typeof output === 'object') {
            output.event = eventName;
        }
        else {
            output = {event:eventName, output:output};
        }
        // run this in global scope of window or worker. since window.self = window, we're ok
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            postMessage(output); //thread event 
        }

        let event = this.events.get(eventName);
        graphState.setState({[event.id]:output}); //local event 
      
    }

    workerCallback = (msg) => {
        if(msg.event) {
            let event = this.events.get(msg.event);
            if(!event) {  
                event = this.eventEmitter(msg.event);
            }
            
            graphState.setState({[event.id]:msg.output});

        }
    }
}


//ports handle input and output for nodes/graphs/plugins
class Port {
    constructor (name='', type='number', parentNode, onchange = this.onchange) {
        this.name = name;
        this.id = randomId('port');
        this.parentNode = parentNode;
        this.type = type; //number, bool, function, array, object, etc
        this.sub = {port:undefined, id:undefined};
        this.onchange = onchange;
        
        this.value;
        this.updated = false;
    }

    //subscribe to the output of another port
    subscribeTo(port) {
        this.sub.id = graphState.subscribeTrigger(port.id,(val)=>{this.set(val);});
    }

    unsubscribePort() {
        if(this.sub.port && this.sub.id) graphState.unsubscribe(this.sub.port.id,this.sub.id);
        this.sub.port = undefined; this.sub.id = undefined;
    }

    //set value
    set = (newValue) => {
        this.value = newValue;
        this.updated = true;
        this.onchange(newValue);
    }

    //just a value getter
    get = () => {
        this.updated = false; //set check flag to false
        return this.value;
    }

    //this will trigger event chains
    emit = (value) => {
        graphState.setState({[this.id]:value});
    }

    //you should pass the value to a plugin with this and then have 
    // the results emitted at the end of your script
    onchange = (newValue) => {
        this.emit(newValue);
    }

}


class Graph {
    constructor(name='') {
        this.name = name;
        this.id = randomId('graph');
        this.nodes = {};
        this.ports = {
            input:{},
            output:{},
            subs:{}
        };
    }

    init = () => {

    }

    addNode = (name='') => {
        if(!this.nodes[name]) this.nodes[name] = new Node(name, this);
    }

    removeNode = (name='') => {
        if(this.nodes[name]) delete this.nodes[name];
    }

    listenPort(port,onchange=(val)=>{}) {
        let sub = graphState.subscribeTrigger(port.id,onchange);
        if(!this.ports.sub[port.id]) this.ports.sub[port.id] = [];
        this.ports.sub[port.id].push(sub);
    }

    stopListeningPort(port) {
        if(this.ports.subs[port.id]){
            this.ports.subs[port.id].forEach((s) => {
                graphState.unsubscribe(port.id,s);
            });
        }
    }

    addPort = (name='', type='number', io='input') => {
        
        if(io === 'input' || io === 'i') {
            this.ports.input[name] = new Port(name,type,this);
            return this.ports.input[name];
        } else if (io === 'output' || io === 'o') { //output
            this.ports.output[name] = new Port(name,type,this); //default port onchange creates emitter
            return this.ports.output[name];
        } else { console.error('input valid io definition'); }
        
    }

    removePort = (name) => {
        if(this.ports.input[name]) delete this.ports.input[name];
        if(this.ports.output[name]) delete this.ports.output[name];
    }

}

class Node {
    constructor(name='', parentGraph) {
        this.name = name;
        this.id = randomId('node');
        this.parentGraph = parentGraph;
        this.position = {x:0, y:0, z:0};
        this.ports = {
            input:{},
            output:{},
            subs:{}
        };
        this.plugins = {
            
        }; //can add entire new graphs
    }

    init = () => {

    }

    //oninput
    execute = (input) => {
        
    }   

    addPlugin = (name='') => {
        if(!this.plugins[name])
            this.plugins[name] = new Plugin(name,this);
    }

    removePlugin = (name) => {
        if(this.plugins[name])
           delete this.plugins[name];
    }

    addPort = (name='', type='number', io='input') => {
        
        if(io === 'input' || io === 'i') {
            this.ports.input[name] = new Port(name,type,this);
            return this.ports.input[name];
        } else if (io === 'output' || io === 'o') { //output
            this.ports.output[name] = new Port(name,type,this); //default port onchange creates emitter
            return this.ports.output[name];
        } else { console.error('input valid io definition'); }
        
    }

    removePort = (name) => {
        if(this.ports.input[name]) delete this.ports.input[name];
        if(this.ports.output[name]) delete this.ports.output[name];
    }

    listenPort(port,onchange=(val)=>{}) {
        let sub = graphState.subscribeTrigger(port.id,onchange);
        if(!this.ports.sub[port.id]) this.ports.sub[port.id] = [];
        this.ports.sub[port.id].push(sub);
    }

    stopListeningPort(port) {
        if(this.ports.subs[port.id]){
            this.ports.subs[port.id].forEach((s) => {
                graphState.unsubscribe(port.id,s);
            });
        }
    }

    
}

class Plugin {
    constructor(name='', parentNode) {
        this.name = name;
        this.id = randomId('plugin');
        this.parentNode = parentNode;
        this.ports = {
            input:{},
            output:{},
            subs:{}
        };
        this.graphs = {}; //can add entire new graphs
    }

    init = () => {

    }

    //oninput
    execute = (input) => {

    } 

    addPort = (name='', type='number', io='input') => {
        
        if(io === 'input' || io === 'i') {
            this.ports.input[name] = new Port(name,type,this);
            return this.ports.input[name];
        } else if (io === 'output' || io === 'o') { //output
            this.ports.output[name] = new Port(name,type,this); //default port onchange creates emitter
            return this.ports.output[name];
        } else { console.error('input valid io definition'); }
        
    }
    
    removePort = (name) => {
        if(this.ports.input[name]) delete this.ports.input[name];
        if(this.ports.output[name]) delete this.ports.output[name];
    }

    listenPort(port,onchange=(val)=>{}) {
        let sub = graphState.subscribeTrigger(port.id,onchange);
        if(!this.ports.sub[port.id]) this.ports.sub[port.id] = [];
        this.ports.sub[port.id].push(sub);
    }

    stopListeningPort(port) {
        if(this.ports.subs[port.id]){
            this.ports.subs[port.id].forEach((s) => {
                graphState.unsubscribe(port.id,s);
            });
        }
    }

    addGraph = (name) => {
        if(!this.graphs[name]) this.graphs[name] = new Graph(name);
    }

    removeGraph = (name) => {
        if(this.graphs[name]) delete this.graphs[name];
    }

}

