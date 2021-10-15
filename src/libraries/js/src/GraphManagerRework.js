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
                }
                .addPort()
                .removePort()

                .wires[]{
                    connect plugin port (outer) i/o to graph i/o (inner) if using a graph plugin
                }
                .addWire()
                .removeWire()
            } 
            .addPlugin()
            .removePlugin()

            .props {}

            .ports[] {
                define plugin (outer) i/o
            }  
            .addPort()
            .removePort()

            .wires[] { 
                connect node (inner) i/o
            }
            .addWire()
            .removeWire()
        }
        .addNode()
        .removeNode()

    .props {} //have ports get and set these porpe

    .ports[] {
        define graph (outer) i/o, mainly for nested graphs
    }
    .addPort()
    .removePort()

    .wires[] {
        connect node (inner) i/o
    }
    .addWire()
    .removeWire()
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
 */
class GraphEventManager {
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

    addEvent(name, props) {}

    subEvent(name, port) {}

    removeEvent(name, port) {}

    workerCallback = (msg) => {

    }
}

class Graph {
    constructor(name='', parentApplet) {
        this.name = name;
        this.parentApplet = parentApplet;
        this.nodes = {};
    }

    addNode = () => {}

    removeNode = () => {}

}

class Node {
    constructor(name='', parentGraph, parentApplet) {
        this.name = name;
        this.parentGraph = parentGraph;
        this.parentApplet = parentApplet;
        this.position = {x:0, y:0, z:0};
        this.ports = {};
        this.plugins = {}; //can add entire new graphs
    }

    addPort = (name='') => {
        if(!this.ports[name]) this.ports[name] = new Port(name, this);
    }

    connect = (name='',sourceNode,sourcePort,targetNode,targetPort) => {

        if(!sourceNode.wires[name] && !targetNode.wires[name]) {
            let wire = new Wire(name, this);

        }
    }

    addPlugin = (name='') => {
        if(!this.graphs[name]) this.graphs[name] = new Graph(name, this.parentApplet);
    }
 
    removePort = (name='') => {}

    removeWire = (name='') => {}

    removeGraph = (name='') => {}
}

class Plugin {
    constructor(name='', parentGraph, parentApplet) {
        this.name = name;
        this.parentGraph = parentGraph;
        this.parentApplet = parentApplet;
        this.ports = {};
        this.graphs = {}; //can add entire new graphs
    }

    addPort = (name='') => {
        if(!this.ports[name]) this.ports[name] = new Port(name, this);
    }

    connect = (name='',sourceNode,sourcePort,targetNode,targetPort) => {

        if(!sourceNode.wires[name] && !targetNode.wires[name]) {
            let wire = new Wire(name, this);

        }
    }

    addPlugin = (name='') => {
        if(!this.graphs[name]) this.graphs[name] = new Graph(name, this.parentApplet);
    }
 
    removePort = (name='') => {}

    removeWire = (name='') => {}

    removeGraph = (name='') => {}
}


class Port {
    constructor (name='', parentNode, onchange = (newValue) => {}) {
        this.name = name;
        this.parentNode = parentNode;

        this.onchange = onchange;
        this.wires = {};
        
        this.value;
    }

    connect(sourcePlugin,sourcePort,targetNode,targetPort) {

    }

    checkForUpdates() {

    }

    set = (newValue) => {
        this.value = newValue;
        this.onchange(newValue);
    }

    get = () => {
        return this.value;
    }

    onchange = (newValue) => {
        
    }
}

class Wire {
    constructor (name='', parentNode) {
        this.name = name;
        this.parentNode = parentNode;
        
        this.sourcePlugin;
        this.sourcePort;
        this.targetPlugin;
        this.targetPort;

        this.value;
    }

    set = (newValue) => {
        this.value = newValue;
        this.onchange(newValue);
    }

    get = () => {
        return this.value;
    }

    onchange = (newValue) => {

    }
}