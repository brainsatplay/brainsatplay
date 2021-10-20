import {Port} from "./Port"
import {Edge} from "./Edge"
import {Event} from "./Event"
import {pluginManifest} from '../plugins/pluginManifest'
import {dynamicImport} from '../utils/general/importUtils'

// A Plugin is a collection of other Plugins and Functions that execute together as specified by Edges

export class Plugin {

    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, parent) {

        // Core Registry
        this.nodes = new Map()
        this.edges = new Map()
        this.events = new Map()
        this.graphs = [] //can add entire new graphs
        this.ports = {}

        // Original Application Settings
        this.info = {}
        this._mergeInfo(info)

        // Reference to Higher Levels of the Application
        this.parent = parent;
        this.app = this.parent.app
        this.session = this.app.session

        // Global Properties
        this.props = {  }

        // Metadata
        this.id = this._random()
        this.position = {x:0, y:0, z:0}; // unused
        this.name = info.name ?? `graph_${this.id}`
        this.className = info.className ?? info.class?.name
        this.analysis = new Set()

        // UI
        this.ui = {
            parent: null, 
            latencies: {}
        }


        // Instantiate Editor Tab
        if (this.app.editor){
            this.ui.parent = this.app.editor.createGraph(this)
            if (this.ui.parent) {
                this.createUI()
            }
        }
    }

    _random = () => {
        return String(Math.floor(Math.random() * 1000000))
    }

    _mergeInfo = (info={}) => {
        if (!('nodes' in this.info)) this.info.graphs = []
        if (!('nodes' in this.info)) this.info.nodes = []
        if (!('edges' in this.info)) this.info.edges = []
        if (!('events' in this.info)) this.info.events = []

        if ('events' in info) this.info.events.push(...info.events)
        if ('edges' in info) this.info.edges.push(...info.edges)
        if ('nodes' in info) this.info.nodes.push(...info.nodes)
        if ('graphs' in info) this.info.graphs.push(...info.graphs)

        delete info.nodes
        delete info.edges
        delete info.events
        delete info.graphs

        if (Object.keys(info).length > 0) Object.assign(this, info)

    }

    // Resize All Active Node Fragments
    _resizeUI = () => {
            let funcs = []
            // Gather Resize Functions
            this.nodes.forEach(n => {if ( n.fragment && n.fragment.onresize instanceof Function) funcs.push( n.fragment.onresize)})
            // Repeat to Scale Everything Appropriately
            funcs.forEach(f => {setTimeout(() => {funcs.forEach(f => {f()})},1)})
            funcs.forEach(f => f()) // Catch outliers
    }


    init = async (o) => {

        this._mergeInfo(o)
        await Promise.all(this.info.graphs.map(async g => {await this.addNode(g)})) // informal collection of nodes and edges
        await Promise.all(this.info.nodes.map(async n => {await this.addNode(n)})) // raw nodes
        await Promise.all(this.info.edges.map(async e => {await this.addEdge(e)})) // raw edges
        await Promise.all(this.info.events.map(async ev => {await this.addEvent(ev)}))

    }

    deinit = () => {
        this.nodes.forEach(n => this.removeNode(n))
        this.edges.forEach(e => this.removeEdge(e))
        this.events.forEach(ev => this.removeEvent(ev))
    }

    configure = () => {}

    // ------------------- NODES / PLUGINS / GRAPHS -------------------

    addNode = async (o) => { 

        // Map Class Strings to Classes
        if (typeof o.class === 'string') {
            let module = await dynamicImport(pluginManifest[o.class].folderUrl) // classname
            o.class = module[o.class]
        }
        
        // Create Node based on User-Defined Plugin Class
        if (o.class?.constructor) {

            // Try To Extend Class
            o.className = o.class.name
            o.class = this.extend(o.class, Plugin)
            o.instance = new o.class(o, this)

            // Create Ports with backwards compatibility (< 0.0.36)
            let keys = Object.keys(o.instance.ports) 

            await Promise.all(keys.map(async port => {
                await o.instance.addPort(port, o.instance.ports[port])
            }))

            // Update Parameters on Port
            o.instance.updateParams(o.params)
        } 

        // Wrap Node Inside a Default Plugin
        else {
            o.instance = new Plugin(o, this) // recursion begins
        }

        this.nodes.set(o.instance.id, o.instance)

        // this.analysis.add(...Array.from(nodeInfo.analysis))

        // Check if Controls
        if (o.instance.className === 'Event'){
            this.app.controls.push(o.instance)
        }

        o.instance.debug() // instantiate debug elements in appropriate containers

        let graphDeps = o.instance.graphs // instantiate subgraphs
        if (graphDeps) {
            await Promise.all(graphDeps.map(async (g,i) => {
                g = new Plugin(g, o.instance)
                await g.init()
                o.instance.graphs[i] = g
            }))
        }

        // Initialize Node        
        await o.instance.init()

        // Configure
        if (o.instance.configure instanceof Function ) o.instance.configure(this.app.settings)

        return o
    }

    removeNode = (o) => {
        o.deinit()
        this.nodes.delete(o.id)
    }
    

    updateParams = (params) => {
        for (let param in params) {
            let port = this.getPort(param)
            if (port) {
                port.set({value: params[param]})
            }
            else {
                console.error(`A port for '${param}' does not exist on the ${this.name} node.`)
            }
        }
    }

    extend = (ChildClass, ParentClass, constructor = (_super, args) => {
        _super(...args);
     }) => {
        if (ChildClass.prototype instanceof ParentClass) return ChildClass // already extended
        else {             

            function Extended(...args){
                const _super = (...args) => {
                    let parent = new ParentClass(...args)
                    let child = new ChildClass(...args)
                    Object.assign(parent, child); // provide child references
                    Object.assign(child, parent); // provide parent methods
                    Object.assign(this, parent);
                }
                constructor.call(this, _super, args);
            }

            Object.setPrototypeOf(Extended, ParentClass);
            Object.setPrototypeOf(Extended.prototype, ParentClass.prototype);
            return Extended;
        }
     }

    // ------------------- EDGES -------------------
    addEdge = async ({source={node:'',port:''},target={node:'',port:''}}) => {

        ({source, target} = this.convertToStandardEdge(source, target));

        // NOTE: Add check for existing edge
        // if(!sourceNode.wires[name] && !targetNode.wires[name]) {
            let edge = new Edge(source, target, this)

            // Initialize Edge
           let res = await edge.init()

            if (res) this.edges.set(edge.id, edge)
            else edge.deinit()

    }

    removeEdge = (e) => {
        e.deinit()
        this.edges.delete(e.id)
    }

    convertToStandardEdge = (source, target) => { //???
        let standardStruct = {source: {}, target: {}};
        let structure = {source,target};
        let nodes, ports;
        Object.keys(standardStruct).forEach(type => {

            // Object Specification
            if (structure[type] instanceof Object) {
                nodes = this.get('nodes',structure[type].node)
                standardStruct[type].node = nodes[0]?.name ?? structure[type].node
                standardStruct[type].port = structure[type].port ?? 'default'
            } 
            
            // String Specification (old)
            else if (typeof structure[type] === 'string') {
                let structSplit = structure[type].split(':')
                standardStruct[type] = {node: structSplit[0], port: structSplit[1] ?? 'default'}
            }

            // Replace Object Specification with Active Nodes and Ports
            nodes = this.get('nodes',standardStruct[type].node, this.nodes)
            standardStruct[type].node = nodes[0]
            standardStruct[type].port = standardStruct[type].node.ports[standardStruct[type].port]

        })
        return standardStruct
    }

    // ------------------- EVENTS -------------------

    addEvent = async (ev) => {
        this.eventManager.addEvent(ev)
    }

    removeEvent = (ev) => {
        this.eventManager.removeEvent(ev)
    }

    // ------------------- PORTS -------------------

    addPort = async (name, info) => {
        let port = new Port(this, name, info)
        await port.init()
        this.ports[port.name] = port


        // UI
        if (this.ui.parent) {
            let portTypes = Object.keys(port.edges)
            portTypes.forEach(s => {
                this.ui[`${s}Ports`].insertAdjacentElement('beforeend', port.ui[s])
            })
            this.ui.portLabels.insertAdjacentElement('beforeend', port.ui.label)

            this.resizeElement()
        }

    }

    removePort = (query) => {
        let p = this.getPort(query)
        if (p) {
            p.deinit()
            delete this.ports[p.name]
        }
        this.resizeElement()
    }


    // ------------------- OOOOOOOOOOOOOOOLD -------------------


    // trigger
    update = (port, user) => {
        let thisPort = this.getPort(port)
        return thisPort.set(user)
    }

    updateAll(){
        for (let port in this.ports) this.update(port)
    }

    requestNode = async (nodeType) => {
        let nodes = this.get('nodes',nodeType)
        if (nodes.length > 0){
            return nodes[0] // return first node of specified type
        } else {
            let nodeInfo = await this.addNode(nodeType)
            return nodeInfo.instance  // returns new instance of the node
        }
    }

    //hey look it makes actual sense now
    // NOTE: not really...
    requestEdge = async (
        sourceNode,
        sourcePort,
        targetPort) => {
        let node = this.getNode(sourceNode);
        let edges = this.getEdges(node, this.app)
        let nodeInfo = await this.addEdge(source={node:sourceNode,port:sourcePort},target={node:this.name, port:targetPort});
    }


    // ----------------- Get Graph Elements -----------------
    //get list of nodes by label , class name , or id
    get = (query, val, pool=this[query]) => {
        if(pool) {

            if (pool instanceof Map) pool = Array.from(pool) // handle maps
            else if (pool.constructor == Object) {
                let arr = []
                for (let key in pool) arr.push(pool[key])
                pool = arr
            }

            let res = pool.filter(o => {

                if (Array.isArray(o)) o = o[1] // handle maps

                if (o.name === val) return true
                else if (o.class?.name === val || o.className === val) return true
                else if (o.id === val) return true
                
                // else if (port == null) return true
                // else if (e.target === str) return true
            });

            return res.map(o => {
                if (Array.isArray(o)) return o[1]
                else return o
            }) // handle maps
        } else return [];
    }

    getGraph = (val) => {
        let graphs = this.get('graphs', val, this.graphs)
        return graphs[0]
    }

    getNode = (val) => {
        let nodes = this.get('nodes', val, this.nodes)
        return nodes[0]
    }

    getPort = (name) => {
        return this.ports[name]
    }

    getEdge = () => {}

    // ----------------- UI Management -----------------

    createUI() {
        this.ui.element = document.createElement(`div`)
        this.ui.element.classList.add("brainsatplay-default-node-div")

        let element = document.createElement(`div`)
        element.classList.add("brainsatplay-display-node")

        this.ui.portManager = document.createElement(`div`)
        this.ui.portManager.classList.add("brainsatplay-port-manager")

        // Add Port Label Container
        this.ui.portLabels = document.createElement(`div`)
        this.ui.portLabels.classList.add(`node-label-container`)

        // Add Port Containers
        this.ui[`inputPorts`] = document.createElement('div')
        this.ui[`inputPorts`].classList.add(`node-port-container`)
        this.ui[`inputPorts`].classList.add(`target-ports`)
        this.ui[`outputPorts`] = document.createElement('div')
        this.ui[`outputPorts`].classList.add(`node-port-container`)
        this.ui[`outputPorts`].classList.add(`source-ports`)

        this.ui.portManager.insertAdjacentElement('beforeend', this.ui[`inputPorts`])
        this.ui.portManager.insertAdjacentElement('beforeend', this.ui[`outputPorts`])
        this.ui.portManager.insertAdjacentElement('beforeend', this.ui.portLabels)

        let nodeText = document.createElement('div')
        nodeText.classList.add('node-text')
        nodeText.innerHTML = `
            <h3>${this.className}</h3>
            <p>${this.name}<p>
        `

        element.insertAdjacentElement('beforeend', nodeText)

        element.insertAdjacentElement('beforeend', this.ui.portManager)
        this.ui.element.insertAdjacentElement('beforeend', element)

        this.app.editor.insertNode(this)

        this.resizeElement()

        return this.ui.element
    }

    resizeAllEdges = () => {
        this.edges.forEach(e => {
            e.resizeElement()
        })
    }


    resizeElement(){
        let portContainers = this.ui.element.getElementsByClassName(`node-port-container`)

        let minWidth = 100
        let minHeight = 0
        for (let container of portContainers) {
            minHeight = Math.max(minHeight, container.clientHeight)
        }
        minWidth = Math.max(minWidth, this.ui.portLabels.offsetWidth)

        if (this.ui.portManager.offsetWidth < minWidth) this.ui.portManager.style.width = `${minWidth}px`
        if (this.ui.portManager.offsetHeight < minHeight) this.ui.portManager.style.height = `${minHeight}px`
    }

    // ---------------- DEBUG HELPER ----------------
    debug = (parentNode = document.body) => {
    
        let container = parentNode.querySelector('.brainsatplay-debugger')

        if ('debug' in this.ports) {
            // if (parentNode === document.body) {
            //     this.ports.element.data.style.position = 'absolute'
            //     this.ports.element.data.style.top = 0
            //     this.ports.element.data.style.right = 0
            // }
            this.updateParams({debug: true})
            if (container) container.insertAdjacentElement('beforeend', this.ports.element.data)
        }
    }
}