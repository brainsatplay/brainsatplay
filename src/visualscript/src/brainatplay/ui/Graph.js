import {Port} from "./Port"
import {Edge} from "./Edge"

// Code Editor
import {LiveEditor} from './LiveEditor'

// Node Interaction
import * as dragUtils from './dragUtils'

// A Graph is a collection of Plugins (subgraphs) that execute together as specified by Edges

export class Graph {

    static id = String(Math.floor(Math.random()*1000000))

    constructor(info, parent, edit=true) {

        // Core Registry
        this.nodes = new Map()
        this.edges = new Map()
        this.events = new Map()
        this.graphs = [] //can add entire new graphs
        this.ports = {}

        // Original Application Settings
        this.info = info
        this.params = {}
        // this._mergeInfo(info)

        // Reference to Higher Levels of the Application
        this.parent = parent;
        this.app = this.parent.app

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
            element: this._createElement,
            code: this._createCodeUI,
            codeEditor: this._createCodeEditor,
            graph: this._createGraphUI,
            context: {
                scale: 1
            },
            editing: false,
            mouseDown: false,
            translation: {x: 0, y:0},
            relXParent: null, 
            relYParent: null
        }

        if (this.app.editor && !(this.parent instanceof Graph) && edit) this.app.editor.addGraph(this) // place top-level graph as a tab
    }


    init = async (
        // o = {}
    ) => {

        // this._mergeInfo(o)

        // Add Internal Graphs as Nodes
        for (const name in this.info.internal) {
            await this.addNode(this.info.internal[name])
        }
            // Connect External Graphs as Edges
        for (const name in this.info.external) await this.addEdge(this.info.external[name])
        // await Promise.all(this.info.events.map(async ev => await this.addEvent(ev))) 
    }

    deinit = () => {

        this.nodes.forEach(n => this.removeNode(n))
        this.edges.forEach(e => this.removeEdge(e))
        this.events.forEach(ev => this.removeEvent(ev))


        if (!(this.ui.element instanceof Function)) this.ui.element.remove()
        if (!(this.ui.graph instanceof Function)){
            this.ui.graph.removeEventListener('wheel', this._scale)
            this.ui.graph.removeEventListener('mousemove', this._pan)
            window.removeEventListener('resize', this.resizeAllEdges)
            this.ui.graph.remove()
        }

        // Remove Editor Tab
        let files = this.app.editor.files[this.uuid].files
        for (let type in files) {
            for (let key in files[type]){
                let el = files[type][key]
                if (!!el && !(el instanceof Function)) el.remove()
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

        info = Object.assign({}, info)
        if (!('internal' in this.info)) this.info.internal = {}
        if (!('edges' in this.info)) this.info.edges = []
        if (!('events' in this.info)) this.info.events = []

        if ('events' in info) this.info.events.push(...info.events)
        if ('edges' in info) this.info.edges.push(...info.edges)
        if ('internal' in info) Object.assign(this.info.internal, info.internal)

        Object.assign(this.ports, info.ports)

        delete info.internal
        delete info.edges
        delete info.events

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

    _init = () => {

    }

    addGraph = async (g, edit=true) => {
        g = new Graph(g, this, edit)
        await g.init()
        await Promise.all(Array.from(g.nodes).map(async arr => await this.addNode(arr[1])))
        await Promise.all(Array.from(g.edges).map(async arr => await this.addEdge(arr[1])))
        await Promise.all(Array.from(g.events).map(async arr => await this.addEvent(arr[1])))
    }

    addNode = async (o) => { 


            // If Already Instantiated
            console.log('Add node', o)
            if (o instanceof Graph){
                o = Object.assign(o.info, {instance: o})
                this.nodes.set(o.instance.uuid, o.instance) // set immediately
            } 
            
            // If Assembly Instructions
            else {

                // Map Class Strings to Classes
                if (typeof o.class === 'string') {
                    // let module = await dynamicImport(pluginManifest[o.class].folderUrl) // classname
                    // o.class = module[o.class]
                    // o.class = (this.app.editor) ? this.app.editor.classRegistry[o.class].class : this.session.projects.classRegistries.experimental[o.class].class
                }
                
                // Create Node based on User-Defined Plugin Class
                if (o.class?.constructor) {

                    // Try To Extend Class
                    let ports = Object.assign({}, o.ports)
                    o.className = o.class.name
                    let Plugin = this.extend(o.class, Graph)
                    o.instance = new Plugin(o, this)

                    // Create Ports with backwards compatibility (< 0.0.36)
                    let keys = Object.keys(o.instance.ports) 
                    await Promise.all(keys.map(async port => {
                        if (ports && ports[port])  {
                            let newPort = Object.assign(ports[port], o.instance.ports[port])
                            newPort.onUpdate = o.instance.ports[port].onUpdate // TODO: this. has to refer to the right thing (also on save)
                            await o.instance.addPort(port, ports[port]) // overwrite from settings
                        }
                        else {
                            await o.instance.addPort(port, o.instance.ports[port]) 
                        }
                    }))

                    // Update Parameters on Port
                    o.instance.updateParams(o.params)
                } 

                // Wrap Node Inside a Graph
                else {
                    o.instance = new Graph(o, this) // recursion begins
                }

                this.nodes.set(o.instance.uuid, o.instance) // set immediately

                if (this.app.editor) this.app.editor.addGraph(o.instance) // place in editor as a tab

                // this.analysis.add(...Array.from(nodeInfo.analysis))

                // Check if Controls
                if (o.instance.className === 'Event') this.app.controls.push(o.instance)

                o.instance.debug() // instantiate debug elements in appropriate containers


                // Flatten Subgraphs into Nodes, Edges, and Events
                await Promise.all(o.instance.graphs.map(async (g,i) => {
                    let activeGraph = await o.instance.addGraph(g, false)
                    o.instance.graphs[i] = activeGraph
                }))


                // Initialize Node   
                await o.instance.init()

                // Configure
                if (o.instance.configure instanceof Function ) o.instance.configure(this.app.settings)
            }

            if (this.ui.graph && !(this.ui.graph instanceof Function)) this.insertNode(o.instance) // UI
            
            return o
    }

    removeNode = (o) => {
        o.deinit()
        this.nodes.delete(o.uuid)
    }
    

    updateParams = (params) => {
        for (let param in params) {
            let port = this.getPort(param)
            if (port) port.set({value: params[param]})
            else console.error(`A port for '${param}' does not exist on the ${this.name} node.`)
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
                        let mergeMethods = ['init', 'deinit', 'responsive', 'configure']
                        mergeMethods.forEach(f => {
                            // Merge Init
                            let cM = child[f]
                            let pM = parent[f]
                            parent[f] = child[f] = (...args) => {
                                try {
                                    if (cM instanceof Function) cM(...args)
                                    if (pM instanceof Function) pM(...args)
                                } catch (e) { 
                                    throw new Error(`${child.className} cannot be constructed`);
                                }
                            }
                        })

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
            else {
                console.error(res.msg)
                edge.deinit()
            }
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
                    nodes = this.get('nodes', structure[type].node, this.info.internal)
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

        if (this.ui.graph && !(this.ui.graph instanceof Function)) this._addPortElement(port) // UI

    }

    removePort = (query) => {
        let p = this.getPort(query)
        if (p) {
            p.deinit()
            delete this.ports[p.name]
        }

        if (!(this.ui.element instanceof Function)) this.resizeElement()
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

    _createElement = () => {
        this.ui.element = document.createElement('div') // replace function

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

        // Create Existing Ports
        for (let key in this.ports) this._addPortElement(this.ports[key])

        return this.ui.element
    }

    _createGraphUI = () => {

        this.ui.graph = document.createElement('div') // replace function

        // Graph UI
        this.ui.graph.id = `${this.props.id}NodeViewer`
        this.ui.graph.classList.add('brainsatplay-node-viewer')
        this.ui.graph.classList.add('grid')

        this.ui.graph.addEventListener('mousedown', e => {this.ui.mouseDown = true} )
        window.addEventListener('mouseup', e => { this.ui.mouseDown = false} )
        this.ui.graph.addEventListener('wheel', this._scale)
        this.ui.graph.addEventListener('mousemove', this._pan)
        window.addEventListener('resize', this.resizeAllEdges)


        // Create Existing Nodes
        this.nodes.forEach(this.insertNode)

        return this.ui.graph
    }

    _addPortElement = (p) => {
        if (this.ui.portLabels){
            Object.keys(p.edges).forEach(s => {
                this.ui[`${s}Ports`].insertAdjacentElement('beforeend', p.ui[s])
            })
            this.ui.portLabels.insertAdjacentElement('beforeend', p.ui.label)
            this.resizeElement()
        }
    }

    resizeAllNodes = () => {
        this.nodes.forEach(n => {
            n.resizeElement()
        })
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
            for (let container of portContainers) minHeight = Math.max(minHeight, container.clientHeight)
            minWidth = Math.max(minWidth, this.ui.portLabels?.offsetWidth ?? 0)
        }

        if (this.ui.portManager?.offsetWidth) this.ui.portManager.style.width = `${minWidth}px`
        if (this.ui.portManager?.offsetHeight) this.ui.portManager.style.height = `${minHeight}px`
    }

    _createCodeUI = () => {
        if (this.info?.class){
            if (this.ui.code instanceof Function) this.ui.code = document.createElement('div')
            this.ui.code.id = this._random()
            this.ui.code.className = 'brainsatplay-node-code'
            this._createCodeEditor()
            return this.ui.code
        }  // otherwise no code for graphs
    }

    _createCodeEditor = () => {

            let cls = this.info?.class
            if (cls){
                let name = `${cls.name}`
                // let filename = `${name}.js`
    
            let settings = {}


            settings.language = 'javascript'
            settings.onInput = () => {
                // if (tab) tab.classList.add('edited')
            }

            settings.onSave = (cls) => {

                let editable = true; //this.session.projects.checkIfSaveable(cls) // TODO: Display somewhere on the code editor

                // Test if Editable
                if (editable){
                    let instance = new cls({id:cls.name, class: cls}, this.parent)
                    if (instance.init) instance.init()
                    if (instance.responsive) instance.responsive()
                    if (instance.configure) instance.configure()
                    if (instance.deinit) instance.deinit()

                    Object.getOwnPropertyNames( instance ).forEach(k => {
                        if (instance[k] instanceof Function || k === 'params') this[k] = instance[k]

                        if (k === 'ports'){
                            for (let port in instance.ports) {
                                console.log(this.ports[port], instance.ports[port])
                                delete instance.ports[port].onUpdate
                                this.ports[port].init(instance.ports[port])
                            }
                        }
                    })

                    // Set New Class
                    this.class = cls
                    cls.id =  this.ui.code.id // Assign a reliable id to the class
                    settings.target = cls // Update target replacing all matching nodes
                } else { console.error(`Current ${this.className} not customizeable`) }
            }

            settings.target = cls
            settings.className = name
            settings.shortcuts = {
                save: true
            }

            settings.showClose = false

            this.ui.codeEditor = new LiveEditor(settings, this.ui.code)

            return this.ui.codeEditor
        }
    }

    save = () => {
        if (this.ui.codeEditor.save instanceof Function) this.ui.codeEditor.save()
        this.nodes.forEach(n => {
            n.save()
        })
    }

    insertNode = (node) => {
        if (node.ui.element instanceof Function) node.ui.element = node.ui.element()

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
        } else if (this.app?.editor?.nextNode) {
            let rect = this.ui.graph.getBoundingClientRect()
            let position = this._mapPositionFromScale(this.app.editor.nextNode.position, rect)
            node.ui.element.style.top = `${position.x}px`
            node.ui.element.style.left = `${position.y}px`
            this.app.editor.nextNode = null
        }

        node.style = node.ui.element.style.cssText // Set initial translation


        // Reorganize Nodes in a Grid
        this._nodesToGrid()
    }

    _nodesToGrid = () => {
        
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
            
            // Auto-Grid
            if (!n.style || (!n.style.includes('top') && !n.style.includes('left'))) { 
                if (n.ui.element.style) {
                    n.ui.element.style.top = `${padding + downShift + availableSpace*row/iterator}%`
                    n.ui.element.style.left = `${padding + leftShift + availableSpace*col/iterator}%`
                }
            }

            i++
        })
    }


    _mapPositionFromScale = (position, rect) => {
        let relYPx = (position.y - rect.top)
        let relXPx = (position.x - rect.left)

        let relYPctMapped = (relYPx / rect.height) * (1/this.ui.context.scale)
        let relXPctMapped = (relXPx / rect.width) * (1/this.ui.context.scale)
        position.x = relYPctMapped * rect.height
        position.y = relXPctMapped * rect.width
        for (let key in position){
            if (isNaN(position[key])) position[key] = 0
        }
        
        return position
    }

    addNodeEvents = (node) => {
        let nodeElement = node.ui.element.children[0]

        nodeElement.onclick = () => {

            let clickedNode = this.app.ui.parent.querySelector('.clicked')
            if (clickedNode) clickedNode.classList.remove('clicked')
            nodeElement.classList.add('clicked')

            // Port GUI
            let portEditor = this.app.editor.portEditor
            portEditor.innerHTML = ''

            for (let key in node.ports){

                // Skips ports created after initialization
                if (!!node.ports[key].ui.gui.container) portEditor.insertAdjacentElement('beforeend', node.ports[key].ui.gui.container)
            
            }

            // Edit and Delete Buttons
            this.app.editor.delete.style.display = ''
            this.app.editor.delete.onclick = () => {
                this.removeNode(node)
            }

            node.editable = true; //this.session.projects.checkIfSaveable(node)

            if (node.editable){
                this.app.editor.edit.style.display = ''
                this.app.editor.edit.onclick = (e) => {
                    let files = this.app.editor.files[node.uuid].files
                    let graphtoggle = files.graph?.tab ?? files.graph?.toggle
                    let codetoggle = files.code?.tab ?? files.code?.toggle

                    if (codetoggle) codetoggle.click()
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
    export = () => {

        let graphs = this.graphs.filter(g => !!g).map(g => {
                if (g.export instanceof Function) return g.export()
                else return g
        })

        let ports = {}
        // if (
        //     this.className != 'DOM' 
        //     // && this.className != 'UI'
        // ){
            for (let key in this.ports) {
                let port = this.ports[key].export()
                if (port) ports[key] = port
            }
        // }

        let settings = {name: this.name, class: this.class}
        if (this.params) settings.params = this.params
        if (graphs.length != 0) settings.graphs = graphs
        if (this.style) settings.style = this.style
        if (Object.keys(ports).length > 0) settings.ports = ports 

        return settings
      }
  
}