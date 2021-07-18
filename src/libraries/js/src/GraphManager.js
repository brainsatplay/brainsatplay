// Managers
import { StateManager } from './ui/StateManager'
import {GraphEditor} from './utils/graphEditor/GraphEditor'
import  {plugins} from '../brainsatplay'

export class GraphManager{
    constructor(session, settings = {}){
        this.session = session

        // Two Modes
        this.applets = {}
        this.nodes = {}

        // Metadata
        this.settings = settings
        this.registry = {local: {}, brainstorm: {}}

        this.props = {
            toUnsubscribe: {
                stateAdded: [],
                stateRemoved: []
            },
            sequential: true
        }

        // Manage States Locally
        this.state = new StateManager()
    }

    instantiateNode(nodeInfo,session=this.session){

        let node = new nodeInfo.class(nodeInfo.id, session, nodeInfo.params)
        let controlsToBind = []
        let toAnalyze = new Set()

        // Set Default Parameters
        for (let param in node.paramOptions){
            if (node.params[param] == null) {
                node.params[param] = node.paramOptions[param].default
            }
        }
        for (let port in node.ports){
            if (typeof node.params[port] === 'object') delete node.params[port] // Cannot params manually set with objects
            if (node.params[port] == null) node.params[port] = node.ports[port].default
        }

        // Set Params to Info Object
        nodeInfo.params = node.params

        // Add Default States
        node.states = {}

        if (node.ports != null){
            for (let port in node.ports){
                controlsToBind.push(...this.instantiateNodePort(node, port, node.params[port]))
            }
        } else {
            node.ports = {
                default:{
                    active:{in:0,out:0}, 
                    input: {type:node.ports[port]?.types.in}, 
                    output: {type:node.ports[port]?.types?.out}
                }
            }
            node.states['default'] = [{}]
        }
        
        nodeInfo.controls = controlsToBind
        if (nodeInfo.analysis == null) nodeInfo.analysis = []
        if (node.analysis) toAnalyze.add(...node.analysis)
        nodeInfo.analysis.push(...Array.from(toAnalyze))
        nodeInfo.instance = node;
        return nodeInfo
        // return {instance: node, controls: controlsToBind, analysis: toAnalyze}
    }

    removeNode(appId,label, resize=true){
        let applet = this.applets[appId]

        let toRemove = null
        let nodeInfo = applet.nodes.find((n,i) => {
            if (n.id == label){
                toRemove = i
                return true
            }
        })
        if (toRemove != null) {
            this.removeMatchingEdges(appId, label)

            this.applets[appId].controls.options.delete(...nodeInfo.controls);

            // Update Event Registry
            this.updateApp(appId)
            nodeInfo.instance.deinit()
            if (nodeInfo.fragment) nodeInfo.fragment.deleteNode()
            applet.nodes.splice(toRemove,1)
            if (resize) this._resizeAllNodeFragments(appId)
        }
    }

    _resizeAllNodeFragments = (appId) => {
        let funcs = []
        // Gather Resize Functions
        this.applets[appId].nodes.forEach(n => {if ( n.fragment && n.fragment.onresize instanceof Function) funcs.push( n.fragment.onresize)})
        
        // Repeat to Scale Everything Appropriately
        funcs.forEach(f => {setTimeout(() => {funcs.forEach(f => {f()})},1)})
        funcs.forEach(f => f()) // Catch outliers
    }

    _getRandomId(){
        return String(Math.floor(Math.random()*1000000))
    }

    addNode(app,nodeInfo){
        let appId = app.props.id

        // Add Basic Node Information to the Graph
        if (nodeInfo.id==null) nodeInfo.id = this._getRandomId()        

        let found = this.applets[appId].nodes.find(n => {
            if (n.id == nodeInfo.id){
                return true
            }
        })
        if (found) nodeInfo.id = nodeInfo.id + this._getRandomId()

        this.applets[appId].nodes.push(nodeInfo);
        
        // Create Node
        nodeInfo = this.instantiateNode(nodeInfo,this.session)

        // Initialize the Node
        nodeInfo.instance.stateUpdates = {}
        nodeInfo.instance.stateUpdates.manager = this.state
        nodeInfo.instance.app = app

        let node = nodeInfo.instance
                
        // Add Node to Registry
        if (this.registry.local[node.label] == null){
            this.registry.local[node.label] = {label: node.label, count: 0, registry: {}}
            for (let port in node.states){
                this.addPortToRegistry(node,port)
            }
        }
        this.registry.local[node.label].count++

        if (nodeInfo.controls.length > 0) this.applets[appId].controls.options.add(...nodeInfo.controls);

        // Run Init Function and Instantiate Some Additional Nodes
        let ui = node.init(nodeInfo.params)

        // Grab Created UI Functions
        if (ui != null) {

            // Grab Responsive Function
            ui.responsive = node.responsive

            // Pass Empty User Dictionary as Final Setup Call (overrides plugin defaults)
            var cachedSetup = ui.setupHTML;
            ui.setupHTML = (app) => {
                cachedSetup(app)
                let defaultInput = [{}]
                for (let port in node.ports){
                    let defaults = node.ports[port].defaults
                    if (defaults){
                        if (defaults.input){
                            defaultInput = defaults.input
                            defaultInput.forEach(o => {
                                if (o.data == null)  o.data = null
                                if (o.meta == null)  o.meta = {}                           
                            })
                            node[port](defaultInput)
                        }
                    }
                }
            }

            // Add UI Components to Registries
            if (ui.HTMLtemplate instanceof Function) ui.HTMLtemplate = ui.HTMLtemplate()
            nodeInfo.ui = ui
        }


        // Update Event Registry
        this.updateApp(appId)

        return nodeInfo
    }

    updateApp(appId){
        if (this.session.updateApps){
            this.session.updateApps(appId)
        }
    }

    getNode(id,name){
        let node = this.applets[id].nodes.find(n => {
            if (n.id == name){
                return true
            }
        })
        return node.instance
    }

    updateParams(node,params) {
        for (let param in params) node.params[param] = params[param]
    }

    shallowCopy(input){

        let inputCopy = []
        input.forEach(u => {
            inputCopy.push(Object.assign({}, u))

        })
        return inputCopy
    }

    deepCopy(input){
        return JSON.parse(JSON.stringifyFast(input))
    }

    deeperCopy(input){
        let inputCopy = []

        input.forEach(u => {
            inputCopy.push(Object.assign({}, u))
            for (let key in u){
                if (u[key] != null && u[key].constructor == Object){
                    u[key] = Object.assign({}, u[key])
                }
            }
        })
        return inputCopy
    }

    getLabel(node,port){
        return (port != 'default') ? `${node.label}_${port}` : node.label
    }

    // Input Must Be An Array
    runSafe(node, port='default',input=[{}], internal=false){

        try {
            // Shallow Copy State before Repackaging
            let inputCopy = []

            let forceRun = false
            let forceUpdate = false
            // let stringify = true
            input.forEach(u => {
                if (u.forceRun) forceRun = true
                if (u.forceUpdate) forceUpdate = true
                // if (typeof u.data === 'object') stringify = false // Auto-set stringify blocking
            })

            // if (stringify) 
            inputCopy = this.deeperCopy(input)
            // else inputCopy = input
            
            for (let i = inputCopy.length - 1; i >= 0; i -= 1) {
                // Remove Users with Empty Dictionaries
                if (Object.keys(inputCopy[i]).length === 0) inputCopy.splice(i, 1)
                // Or Add Metadata
                else {
                    if (!inputCopy[i].username) inputCopy[i].username = this.session?.info?.auth?.username
                    if (!inputCopy[i].meta) inputCopy[i].meta = {}
                    if (!internal) inputCopy[i].meta.source = this.getLabel(node,port) // Add Source to Externally Triggered Updates
                }
            }
            
            let connected
            if (node.ports[port].active?.out > 0) connected = true
            if (node.ports[port].active?.in > 0) connected = true
            if (node.ports[port]?.output?.type === null) connected = true
            if (node.ports[port]?.input?.type === null) connected = true

            // Only Continue the Chain with Updated Data (or when forced) AND When Edges Exist
            if ((inputCopy.length > 0 || forceRun) && ((connected || forceUpdate))){
                let result
                if (node[port] instanceof Function) {
                    result = node[port](inputCopy)
                }
                else if (node.ports[port] && node.ports[port].onUpdate instanceof Function) {
                    result = node.ports[port].onUpdate(inputCopy) // New style
                }
                else if (node.states[port] != null) {
                    if (node.ports['default'] && node.ports['default'].onUpdate instanceof Function) {
                        result = node.ports['default'].onUpdate(inputCopy)
                    }
                    if (node.states[port] != null && node['default'] instanceof Function) {
                        result = node['default'](inputCopy) 
                    }
                }

                // Handle Promises
                if (!!result && typeof result.then === 'function'){
                    result.then((r) =>{
                        this.checkToPass(node,port,r)
                    })
                } else {
                    this.checkToPass(node,port,result)
                }
            }
        } catch (e) { console.log(e)}


        return node.states[port]
    }

    checkToPass(node,port,result){
        if (result && result.length > 0){
            let allEqual = true
            let forced = false
            let stringify = true

            if (node.states[port] == null) node.states[port] = []

            result.forEach((o,i) => {

                // Check if Forced Update
                if (o.forceUpdate) {
                    forced = true
                    node.states[port][i] = o
                }

                // Otherwise Check If Current State === Previous State
                if (!forced){
                    if (node.states[port]){
                        if (node.states[port].length > i){

                            let case1, case2
                            if (typeof o.data === 'object'){
                                case1 = node.states[port][i]
                                case2 = o
                                stringify = false
                            } else {
                                case1 = JSON.stringifyFast(node.states[port][i])
                                case2 = JSON.stringifyFast(o)
                            }                            

                            let thisEqual = case1 === case2

                            if (!thisEqual){
                                node.states[port][i] = o
                                allEqual = false
                            }
                        } else {
                            node.states[port].push(o)
                            allEqual = false
                        }
                    } else {
                        node.states[port] = [o]
                        allEqual = false
                    }
            }
            })

            if ((!allEqual || forced) && node.stateUpdates){
                let updateObj = {}
                let label = this.getLabel(node,port)
                updateObj[label] = {trigger:true}
                if (stringify) updateObj[label].value = JSON.parse(JSON.stringifyFast(node.states[port])) // Do not send huge objects
                node.stateUpdates.manager.setState(updateObj)
            }
        }
    }


    triggerAllActivePorts(node){
        for (let port in node.ports){
            this.runSafe(node,port, [{forceRun: true, forceUpdate: true}])
        }
    }

    init(app){
        let id = app.props.id
        let settings = app.info

        let name = settings.name
        let graph = settings.graph

        // Set Default Values for Graph
        let streams = new Set()
        let outputs = {}
        let subscriptions = {
            session: {},
            local: {}
        }
        let controls = {options: new Set(), manager: this.state}
        let nodes = []
        let edges = []

        let analysis = {default: [], dynamic: []}
        if (settings.analysis) analysis.default.push(...settings.analysis)
            

        this.applets[id] = {nodes, edges, name,streams, outputs,subscriptions, controls, analysis}

        // Create Nodes

        let setupCallbacks = []
        if (graph){
            if (Array.isArray(graph.nodes)){
                graph.nodes.forEach((nodeInfo,i) => {
                    let o = this.addNode(app,nodeInfo)
                })
            }

            // Create Edges
            if (Array.isArray(graph.edges)){
                graph.edges.forEach((edge,i) => {
                    setupCallbacks.push(this.addEdge(id, edge, false))
                })
            }
        }

        this.applets[id].setupCallbacks = setupCallbacks

        return this.applets[id]
    }

    start(appId, sessionId){

        let applet =  this.applets[appId]
        if (applet){
            if (sessionId != null) applet.sessionId = sessionId
            else applet.sessionId = appId

            applet.setupCallbacks.forEach(f => f())
            // applet.nodes.forEach(this.triggerAllActivePorts)
        }

        return applet
    }

    addPortToRegistry = (node,port) => {
        this.registry.local[node.label].registry[port] = {}
        this.registry.local[node.label].registry[port].state = node.states[port]
        this.registry.local[node.label].registry[port].callbacks = []
    }

    instantiateNodePort = (node, port, params) => {

        // Grab Controls
        let controls = []

        // Set Port State
        node.states[port] = [{}]

        // Force Default Outputs to Next Node
        let defaultVal = params ?? node.ports[port].default
        if (defaultVal !== undefined) {
            let user = {data: defaultVal}
            if (node.ports[port].meta != null) user.meta = node.ports[port].meta
            node.states[port] = [user]
            node.states[port][0].forceRun = true
            node.states[port][0].forceUpdate = true
        }

        // Derive Control Structure
        let firstUserDefault= node.states[port][0]
        if (
            node instanceof plugins.controls.Event
            // typeof firstUserDefault.data === 'number' || typeof firstUserDefault.data === 'boolean'
            ){
            let controlDict = {}
            controlDict.format = typeof firstUserDefault.data
            controlDict.label = this.getLabel(node,port) // Display Label
            controlDict.target = {
                state: node.states,
                port: port
            }
            controls.push(controlDict)
        }
        if (node.ports[port].analysis == null) node.ports[port].analysis = []
        if (node.ports[port].active == null) node.ports[port].active = {in:0,out:0}
        
        if (node.ports[port].input == null) node.ports[port].input = {type: node.ports[port]?.types?.in}
        if (node.ports[port].output == null) node.ports[port].output = {type: node.ports[port]?.types?.out}

        let coerceType = (t) => {
            if (t === 'float') return 'number'
            else if (t === 'int') return'number'
            else return t
        }
        node.ports[port].input.type = coerceType(node.ports[port].input?.type)
        node.ports[port].output.type = coerceType(node.ports[port].output?.type)

        return controls
    }

    addPort = (node, port, info) => {
        if (node.states && info) { // Only if node is fully instantiated            
            let noPort = node.ports[port] == null
            if (noPort || node.ports[port].onUpdate == null){
                // Add Port to Node
                node.ports[port] = info
                this.instantiateNodePort(node,port)
                this.addPortToRegistry(node,port)

                // Add Port to Visual Editor
                if (noPort){
                    let applet = this.applets[node.app?.props?.id]
                    if (applet){
                        let editor = applet.editor

                        if (editor) editor.addPort(node,port)
                    }
                }
            }
        }
    }

    getTypeDict = (val) => {
        let typeDict = {type: val}
        if (typeDict.type != null){

            // Catch Objects
            if (typeDict.type instanceof Object) {

                // Catch Arrays
                if (Array.isArray(typeDict.type)) typeDict.type = Array

                // Catch Other Object Types
                else {
                    typeDict.type = Object
                    typeDict.name = val.name ?? typeDict.type.name
                }
            }
            else typeDict.type = typeof typeDict.type
        }
        return typeDict
    }

    addEdge = (appId, newEdge, sendOutput=true) => {

        let applet = this.applets[appId]

        let existingEdge = this.applets[appId].edges.find(edge => {
            if (newEdge.source == edge.source && newEdge.target == edge.target){
                return true
            }
        })
        
        if (existingEdge == null){ // Do not duplicate edges

            let splitSource = newEdge.source.split(':')
            let sourceName = splitSource[0]
            let sourcePort = splitSource[1]
            if (sourcePort == null) sourcePort = 'default'

            let sourceInfo = applet.nodes.find(n => {
                if (n.id == sourceName) return true
            })
            let source = sourceInfo.instance
            let splitTarget = newEdge.target.split(':')
            let targetName = splitTarget[0]
            let targetPort = splitTarget[1]
            if (targetPort == null) targetPort = 'default'
            let targetInfo = applet.nodes.find(n => {
                if (n.id == targetName) return true
            })
            let target = targetInfo.instance
            let label = this.getLabel(source,sourcePort)

            // Initialize Ports with Default Output
            let types = ['source', 'target']
            types.forEach(t => {
                if (eval(t).states[eval(`${t}Port`)] == null) {
                    eval(t).states[eval(`${t}Port`)] = [{}]
                    let registryEntry = this.registry.local[eval(t).label].registry
                    if (registryEntry[eval(`${t}Port`)] == null){
                        registryEntry[eval(`${t}Port`)] = {}
                        registryEntry[eval(`${t}Port`)].state = eval(t).states[eval(`${t}Port`)]
                    }
                }
            })

            // Pass Data from Source to Target
            let _onTriggered = (o) => {

                if (this.applets[appId]){
                    if (o.trigger){
                        let input = o.value ?? source.states[sourcePort]
                        input.forEach(u => {
                            if (!u.meta) u.meta = {}
                            if (target instanceof plugins.networking.Brainstorm) u.meta.source = label // Push proper source
                            u.meta.session = applet.sessionId
                        })

                        if (this.applets[appId].editor) this.applets[appId].editor.animate({label:source.label, port: sourcePort},{label:target.label, port: targetPort})
                        return this.runSafe(target, targetPort, input, true)
                    }
                }
            }
            
            this.state.data[label] = this.registry.local[sourceName].registry[sourcePort].state

            // Register Brainstorm State
            if (target instanceof plugins.networking.Brainstorm) {
                applet.streams.add(label) // Keep track of streams

                // Initialize Port
                if (source.states[sourcePort][0].meta == null) source.states[sourcePort][0].meta = {}
                source.states[sourcePort][0].meta.source = label
                source.states[sourcePort][0].meta.session = applet.sessionId
                this.runSafe(target, 'default', source.states[sourcePort], true) // Register port
            } 

            // And Listen for Local Changes
            if (applet.subscriptions.local[label] == null) applet.subscriptions.local[label] = []
            let subId = this.state.subscribeSequential(label, _onTriggered)
            applet.subscriptions.local[label].push({id: subId, target: newEdge.target})

            if (target.ports[targetPort] == null) target.ports[targetPort] = {}
            if (target.ports[targetPort] == null) source.ports[sourcePort] = {}

            let tP = target.ports[targetPort]
            let sP = source.ports[sourcePort]

            if (tP.active == null) tP.active = {in: 0, out: 0}
            if (sP.active == null) sP.active = {in: 0, out: 0}
            if (tP.input == null) tP.input = {type: tP?.types?.in}
            if (tP.output == null) tP.output = {type: tP?.types?.out}
            if (sP.input == null) sP.input = {type: sP?.types?.in}
            if (sP.output == null) sP.output = {type: sP?.types?.out}

            tP.active.in++
            sP.active.out++
            if (tP.active.in && tP.active.out && tP.analysis) applet.analysis.dynamic.push(...tP.analysis)
            if (sP.active.in && sP.active.out && sP.analysis) applet.analysis.dynamic.push(...sP.analysis)




            // Push Edge into Registry
            this.applets[appId].edges.push(newEdge)

            // Update Applet
            this.updateApp(appId)

            // Send Last State to New Edge Target
            let sendFunction = () => {

                // Add Default Metadata
                let pass
                source.states[sourcePort].forEach(o => {
                    if (o.meta == null) o.meta = {}
                    o.meta.source = label
                    o.meta.session = applet.sessionId
                    if (o.forceUpdate || o.data) pass = true
                })

                if (pass) this.runSafe(target, targetPort, source.states[sourcePort], true)
            }
            if (sendOutput) {
                sendFunction()
            }
            else return sendFunction
        }
    }

    findStreamFunction(prop) {
        return this.session.streamObj.streamTable.find((d => {
            if (d.prop === prop) {
                return d
            }             
        }))
     }

    remove(appId, classId=null, label=null){

        let applet = this.applets[appId]

        if (applet) {

        for (let i = applet.nodes.length-1; i >= 0; i--){
            let n = applet.nodes[i]
            if (classId == null || n.class.id === classId){

            // Increment the Registry for Each Separate Label (of a particular class)
           
            for (let port in n.instance.ports){

                if ((label === null || n.instance.label === label) && this.registry.local[n.instance.label] != null){
                    this.registry.local[n.instance.label].count--

                if (n.instance.ports[port].active != null && (n.instance.ports[port].active.in > 0 || n.instance.ports[port].active.out > 0)){

                    // Catch Edge Removal Case
                    if (this.registry.local[n.instance.label].count == 0) {
                        delete this.registry.local[n.instance.label]
                        this.session.removeStreaming(n.instance.label);
                        this.session.removeStreaming(n.instance.label, null, this.state, true);
                        this.session.removeStreaming(applet.sessionId);
                        this.removeNode(appId,n.instance.label, false)
                    } 
                    else {
                        this.removeMatchingEdges(appId,n.instance.label)
                    }
                } else {
                    // Check Node with No Edges Removal Case
                    if (this.registry.local[n.instance.label].count == 0) delete this.registry.local[n.instance.label]
                    this.removeNode(appId,n.instance.label)
                }
            }
        }
            }
        }

        // // Remove Editor
        if (appId && classId==null && label==null) delete this.applets[appId]
    }
    }

    removeMatchingEdges(id, label){
        let applet = this.applets[id]

        for (let i = applet.edges.length - 1; i >=0; i--) {
            let edge = applet.edges[i] 
            if ((edge.source.split(':')[0] == label) || (edge.target.split(':')[0] == label)){
                this.removeEdge(id,edge)
            }
        }
    }

    removeEdge = (appId, structure) => {

        let applet = this.applets[appId]
        let stateKey = structure.source.replace(':', '_')

        let sessionSubs = applet.subscriptions.session[stateKey]
        let localSubs = applet.subscriptions.local[stateKey]

        if (sessionSubs != null){
            applet.subscriptions.session[stateKey].find(o =>{
                if (o.target === structure.target) {
                    this.session.removeStreaming(stateKey, o.id);
                    return true
                }
            })
        }
        if (localSubs != null){
            localSubs.find(o => {
                if (o.target === structure.target) {
                    this.session.removeStreaming(stateKey, o.id, this.state, true);
                    return true
                }
            })
        }

        applet.edges.find((edge,i) => {
            if (edge === structure){
                this.applets[appId].edges.splice(i,1)
                return true
            }
        })

        // Remove Edge Analysis Flags
        let splitSource = structure.source.split(':')
        let sourceName = splitSource[0]
        let sourcePort = splitSource[1]
        if (sourcePort == null) sourcePort = 'default'
        let sourceInfo = applet.nodes.find(n => {
            if (n.id == sourceName) return true
        })
        let source = sourceInfo.instance
        let splitTarget = structure.target.split(':')
        let targetName = splitTarget[0]
        let targetPort = splitTarget[1]
        if (targetPort == null) targetPort = 'default'

        let targetInfo = applet.nodes.find(n => {
            if (n.id == targetName) return true
        })
        let target = targetInfo.instance
        let tP = target.ports[targetPort]
        let sP = source.ports[sourcePort]
        tP.active.in--
        sP.active.out--

        let toRemove = []
        let toCheck = []
        if (Array.isArray(sP.analysis)) toCheck.push(...sP.analysis)
        if (Array.isArray(tP.analysis)) toCheck.push(...tP.analysis)
        this.applets[appId].analysis.dynamic.forEach((a,i) => {
            if (toCheck.includes(a)) toRemove.push(i)
        })
        toRemove.reverse().forEach(i => {
            this.applets[appId].analysis.dynamic.splice(i,1)
        })
        this.updateApp(appId)
    }

    // Create a Node Editor
    edit(applet, parentNode = document.body, onsuccess = () => {}){
        if (this.applets[applet.props.id]){
            this.applets[applet.props.id].editor = new GraphEditor(this, applet, parentNode, onsuccess)
            return this.applets[applet.props.id].editor
        }
    }

}