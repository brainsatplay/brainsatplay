import {Port} from "./Port"
import {Edge} from "./Edge"
import {Event} from "./Event"
import {pluginManifest} from '../plugins/pluginManifest'
import {dynamicImport} from '../utils/general/importUtils'

// Code Editor
import {LiveEditor} from '../ui/LiveEditor'

// Node Interaction
import * as dragUtils from '../ui/dragUtils'

// A Graph is a collection of Plugins (subgraphs) that execute together as specified by Edges

export class Graph {

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
        this.uuid = this._random()
        this.position = {x:0, y:0, z:0}; // unused
        this.name = info.name ?? `graph_${this.uuid}`
        this.className = info.className ?? info.class?.name
        this.analysis = new Set()

        // UI
        this.ui = {
            element: document.createElement('div'),
            code: document.createElement('div'),
            codeEditor: null,
            graph: document.createElement('div'),
            context: {
                scale: 1
            },
            editing: false,
            mouseDown: false,
            translation: {x: 0, y:0},
            relXParent: null, 
            relYParent: null
        }

        // Graph UI
        this.ui.graph.id = `${this.props.id}NodeViewer`
        this.ui.graph.classList.add('brainsatplay-node-viewer')
        this.ui.graph.classList.add('grid')

        this.ui.graph.addEventListener('mousedown', e => {this.ui.mouseDown = true} )
        window.addEventListener('mouseup', e => { this.ui.mouseDown = false} )
        this.ui.graph.addEventListener('wheel', this._scale)
        this.ui.graph.addEventListener('mousemove', this._pan)

        this.createUI()
        this.createCodeEditor()

        if (this.app.editor) this.app.editor.addGraph(this) // place in editor as a tab
    }


    init = async (o) => {

        this._mergeInfo(o)
        await Promise.all(this.info.graphs.map(async g => {await this.addNode(g)})) // provided collection of nodes and edges
        await Promise.all(this.info.nodes.map(async n => {await this.addNode(n)})) // provided nodes (read in parallel)
        
        for (const e of this.info.edges) {
            await this.addEdge(e) // provided edges (read in series)
        }

        await Promise.all(this.info.events.map(async ev => {await this.addEvent(ev)}))

    }

    deinit = () => {

        this.nodes.forEach(n => this.removeNode(n))
        this.edges.forEach(e => this.removeEdge(e))
        this.events.forEach(ev => this.removeEvent(ev))

        this.ui.graph.removeEventListener('wheel', this._scale)
        this.ui.graph.removeEventListener('mousemove', this._pan)
        window.removeEventListener('keydown', this._save)

        this.ui.element.remove()
        this.ui.graph.remove()

        // Remove Editor Tab
        let files = this.app.editor.files[this.uuid].files
        for (let type in files) {
            for (let key in files[type]){
                let el = files[type][key]
                if (el) el.remove()
            }
        }


        if (this.app.editor) this.app.editor.removeGraph(this)

    }

    configure = () => {}

    _scale = (e) => {
        this.ui.context.scale += 0.01*-e.deltaY
        if (this.ui.context.scale < 0.5) this.ui.context.scale = 0.5 // clamp
        if (this.ui.context.scale > 3.0) this.ui.context.scale = 3.0 // clamp
        this._transform()
    }

    _transform = () => {
        this.ui.graph.style['transform'] = `translate(${this.ui.translation.x}px, ${this.ui.translation.y}px) scale(${this.ui.context.scale*100}%)`
    }

    _pan = (e) => {

        if (this.ui.editing === false){

            // Transform relative to Parent
            let rectParent = e.target.parentNode.getBoundingClientRect();
            let curXParent = (e.clientX - rectParent.left)/rectParent.width; //x position within the element.
            let curYParent = (e.clientY - rectParent.top)/rectParent.height;  //y position within the element.
        
            if (this.ui.mouseDown){
                let tX = (curXParent-this.ui.relXParent)*rectParent.width
                let tY = (curYParent-this.ui.relYParent)*rectParent.height

                if (!isNaN(tX) && isFinite(tX)) this.ui.translation.x += tX
                if (!isNaN(tY) && isFinite(tY)) this.ui.translation.y += tY
                this._transform()
            } 
            this.ui.relXParent = curXParent
            this.ui.relYParent = curYParent
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
        if (Object.keys(info).length > 0) Object.assign(this.info, info)

    }

    // Resize All Active Node Fragments
    _resizeUI = () => {
            let funcs = []
            // Gather Resize Functions
            this.nodes.forEach(n => {
                // if ( n.fragment && n.fragment.onresize instanceof Function) funcs.push( n.fragment.onresize)
                // else 
                if (n.responsive instanceof Function) funcs.push( n.responsive)
            })
            // Repeat to Scale Everything Appropriately
            funcs.forEach(f => {setTimeout(() => {funcs.forEach(f => {f()})},1)})
            funcs.forEach(f => f()) // Catch outliers
    }

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
            let Plugin = this.extend(o.class, Graph)
            o.instance = new Plugin(o, this)

            // Create Ports with backwards compatibility (< 0.0.36)
            let keys = Object.keys(o.instance.ports) 

            await Promise.all(keys.map(async port => {
                await o.instance.addPort(port, o.instance.ports[port])
            }))

            // Update Parameters on Port
            o.instance.updateParams(o.params)
        } 

        // Wrap Node Inside a Graph
        else {
            o.instance = new Graph(o, this) // recursion begins
        }

        this.nodes.set(o.instance.uuid, o.instance)

        // this.analysis.add(...Array.from(nodeInfo.analysis))

        // Check if Controls
        if (o.instance.className === 'Event'){
            this.app.controls.push(o.instance)
        }

        o.instance.debug() // instantiate debug elements in appropriate containers

        let graphDeps = o.instance.graphs // instantiate subgraphs
        if (graphDeps) {
            await Promise.all(graphDeps.map(async (g,i) => {
                g = new Graph(g, o.instance)
                await g.init()
                o.instance.graphs[i] = g
            }))
        }

        // Initialize Node   
        await o.instance.init()

        // Configure
        if (o.instance.configure instanceof Function ) o.instance.configure(this.app.settings)

        // Add to Graph UI
        this.insertNode(o.instance)

        return o
    }

    removeNode = (o) => {
        o.deinit()
        this.nodes.delete(o.uuid)
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

            function Plugin(...args){
                const _super = (...args) => {
                    let parent = new ParentClass(...args)
                    let child = new ChildClass(...args)

                    // Merge Init
                    let childInit = child.init
                    let parentInit = parent.init

                    parent.init = child.init = () => {
                        childInit()
                        parentInit()
                    }

                    // Merge Deinit
                    let cDeinit = child.deinit
                    let pDeinit = parent.deinit

                    parent.deinit = child.deinit = () => {
                        cDeinit()
                        pDeinit()
                    }

                    Object.assign(parent, child); // provide child references
                    Object.assign(child, parent); // provide parent methods
                    Object.assign(this, parent);
                }
                constructor.call(this, _super, args);
            }

            Object.setPrototypeOf(Plugin, ParentClass);
            Object.setPrototypeOf(Plugin.prototype, ParentClass.prototype);
            return Plugin;
        }
     }

    // ------------------- EDGES -------------------
    addEdge = async ({source={node:null,port:null},target={node:null,port:null}}) => {

        ({source, target} = this.convertToStandardEdge(source, target));

        // NOTE: Add check for existing edge
        // if(!sourceNode.wires[name] && !targetNode.wires[name]) {

            let edge = new Edge(source, target, this)

            // Initialize Edge
            let res = await edge.init()

            if (res === true) this.edges.set(edge.uuid, edge)
            else edge.deinit()
    }

    removeEdge = (e) => {
        e.deinit()
        this.edges.delete(e.uuid)
    }

    convertToStandardEdge = (source, target) => { //???
        let standardStruct = {source: {}, target: {}};
        let structure = {source,target};
        let nodes, ports;
        Object.keys(standardStruct).forEach(type => {

            // Correct
            if (structure[type].node instanceof Graph && structure[type].port instanceof Port){
                standardStruct = structure
            } else {
                // Object Specification
                if (structure[type] instanceof Object) {
                    nodes = this.get('nodes', structure[type].node)
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
                if (standardStruct[type].node) standardStruct[type].port = standardStruct[type].node.ports[standardStruct[type].port]
                else standardStruct[type].port = null
            }
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
        if (this.ui.graph) {
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

    updateAll = () => {
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
                else if (o.uuid === val) return true
                
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

    createUI = () => {
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

        this.resizeElement()

        return this.ui.element
    }

    resizeAllEdges = () => {

        this.edges.forEach(e => {
            e.resizeElement()
        })
    }


    resizeElement = () => {

        let minWidth = 100
        let minHeight = 0

        if (this.ui.element.parentNode){ // only if there is something containing this element
            let portContainers = this.ui.element.getElementsByClassName(`node-port-container`)

            for (let container of portContainers) {
                minHeight = Math.max(minHeight, container.clientHeight)
            }
            minWidth = Math.max(minWidth, this.ui.portLabels.offsetWidth)
        }

        if (this.ui.portManager.offsetWidth < minWidth) this.ui.portManager.style.width = `${minWidth}px`
        if (this.ui.portManager.offsetHeight < minHeight) this.ui.portManager.style.height = `${minHeight}px`
    }

    createCodeEditor = () => {

            let cls = this.info?.class
            if (cls){
                let name = `${cls.name}`
                let filename = `${name}.js`
    
            let settings = {}

            this.ui.code.id = this._random()
            this.ui.code.className = 'brainsatplay-node-code'

            settings.language = 'javascript'
            settings.onInput = () => {
                // if (tab) tab.classList.add('edited')
            }

            settings.onSave = (cls) => {
                let instance = new cls({id:cls.name, class: cls}, this.parent)
                // let instance = instanceInfo
                // tab.classList.remove('edited')

                    Object.getOwnPropertyNames( instance ).forEach(k => {
                        if (instance[k] instanceof Function || k === 'params'){ // Replace functions and params
                            this[k] = instance[k]
                        }

                        if (k === 'ports'){
                            for (let port in instance.ports){
                                if (this.ports[port] == null) this.ports[port] = instance.ports[port]
                                else {
                                    let keys = [
                                        'default', 
                                        'options', 
                                        'meta', 
                                        'input', 
                                        'output', 
                                        'onUpdate'
                                    ]

                                    let typeKeys = [
                                        'input', 
                                        'output',
                                    ]
                                    
                                    keys.forEach(str => {
                                        if (!typeKeys.includes(str)) this.ports[port][str] = instance.ports[port][str]
                                        else if (this.ports[port][str] != null) {
                                            this.ports[port][str]['type'] = instance.ports[port][str]['type']
                                        }
                                    })
                                }
                            }
                        }
                    })

                    // Set New Class
                    this.class = cls
                cls.id =  this.ui.code.id // Assign a reliable id to the class
                settings.target = cls // Update target replacing all matching nodes
            }

            settings.target = cls
            settings.className = name
            settings.shortcuts = {
                save: true
            }
            settings.showClose = false

            this.ui.codeEditor = new LiveEditor(settings, this.ui.code)

            window.addEventListener('keydown', this._save)
        } else delete this.ui.code // no code for graphs
    }

    // Save Whole Application
    _saveGraph = (e) => {
        // this.files[graph.name].tab.classList.remove('edited')
        this.app.updateGraph()
        this.app.session.projects.save(this.app)
        this.app.editor.lastSavedProject = this.app.info.name
    }

    // Save Class Code
    _save = (e) => {
        if (this.ui.code.offsetParent != null){
            if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
                e.preventDefault();
                this.ui.codeEditor.save()
                this._saveGraph(e)
            }
        }
    }


    insertNode = (node) => {
        this.ui.graph.insertAdjacentElement('beforeend', node.ui.element)

        let top
        let left
        if (node.style){
            top = node.style.match(/top: ([^;].+); /)
            left = node.style.match(/left: ([^;].+);\s?/)
        }

        dragUtils.dragElement(this.ui.graph, node.ui.element, this.ui.context, () => {
            node.resizeAllEdges()
        }, () => {this.ui.editing = true}, () => {
            this.ui.editing = false
            node.style = node.ui.element.style.cssText
        })
        this.addNodeEvents(node)

        // node.ui.element.querySelector('.brainsatplay-display-node').click()

        // Place Node if Location is Provided
        if (top || left){
            if (top) node.ui.element.style.top = top[1]
            if (left) node.ui.element.style.left = left[1]
        } else if (this.nextNode) {
            let rect = graphTab.container.getBoundingClientRect()
            let position = this.mapPositionFromScale(this.nextNode.position, rect)
            node.ui.element.style.top = `${position.x}px`
            node.ui.element.style.left = `${position.y}px`
            this.nextNode = null
        }

        node.style = node.ui.element.style.cssText // Set initial translation


        // Reorganize Nodes in a Grid
        let i = 0;
        let length = this.nodes.size
        this.nodes.forEach(n => {

            // Default Positioning
            let iterator = Math.ceil(Math.sqrt(length))
            let row = Math.floor(i % iterator)
            let col = Math.floor(i/iterator)

            let padding = 10
            let availableSpace = 100 - 2*padding
            let leftShift = 0.5 * availableSpace/(iterator+1)
            let downShift = 0.5 * availableSpace/(iterator+2)
            
            if (!n.style || (!n.style.includes('top') && !n.style.includes('left'))) {
                n.ui.element.style.top = `${padding + downShift + availableSpace*row/iterator}%`
                n.ui.element.style.left = `${padding + leftShift + availableSpace*col/iterator}%`
            }

            i++
        })
    }

    addNodeEvents = (node) => {
        let nodeElement = node.ui.element.children[0]

        nodeElement.onclick = () => {

            let clickedNode = this.app.ui.parent.querySelector('.clicked')
            if (clickedNode) clickedNode.classList.remove('clicked')
            nodeElement.classList.add('clicked')

            // Plugin GUI
            let selectedParams = this.app.editor.params
            selectedParams.innerHTML = ''
            let toParse = node.ports

            let inputDict = {}
            for (let key in toParse){
                let {container, input} = this.app.editor.createInput(node.ports, key, node)
                if (container) {
                    inputDict[key] = input
                    selectedParams.insertAdjacentElement('beforeend', container)
                }
            }

            this.app.editor.subscribeToChanges(inputDict,toParse, 'ports', node)

            // Edit and Delete Buttons
            this.app.editor.delete.style.display = ''
            this.app.editor.delete.onclick = () => {
                this.removeNode(node)
            }

            node.editable = this.session.projects.checkIfSaveable(node)

            if (node.editable){
                this.app.editor.edit.style.display = ''
                this.app.editor.edit.onclick = (e) => {
                    let files = this.app.editor.files[node.uuid].files
                    let graphtoggle = files.graph?.tab ?? files.graph?.toggle
                    let codetoggle = files.code?.tab ?? files.code?.toggle

                    if (codetoggle) codetoggle.click()
                    // .createFile(node, undefined, node.parent)
                }
            } else this.app.editor.edit.style.display = 'none'
        }
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

    // ---------------- EXPORT HELPER ----------------
    info = () => {
        return this.info
      }
  
}