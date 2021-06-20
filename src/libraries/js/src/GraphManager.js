// Managers
import { StateManager } from './ui/StateManager'
import {GraphEditor} from './utils/graphEditor/GraphEditor'
import  {plugins} from '../brainsatplay'
import { Session } from './Session'

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
            if (node.params[param] == null) node.params[param] = node.paramOptions[param].default
        }

        // Add Default States
        node.states = {}

        if (node.ports != null){
            for (let port in node.ports){
                node.states[port] = [{}]
                let defaults = node.ports[port].defaults

                if (defaults && defaults.output) {
                    try {
                        if (Array.isArray(defaults.output)) node.states[port] = defaults.output
                        else if (defaults.output.constructor == Object && 'data' in defaults.output) node.states[port] = [defaults.output]
                    } catch {
                        node.states[port] = defaults.output
                    }
                }

                // Derive Control Structure
                let firstUserDefault= node.states[port][0]
                if (
                    node instanceof plugins.inputs.Event
                    // typeof firstUserDefault.data === 'number' || typeof firstUserDefault.data === 'boolean'
                    ){
                    let controlDict = {}
                    controlDict.format = typeof firstUserDefault.data
                    controlDict.label = this.getLabel(node,port) // Display Label
                    controlDict.target = {
                        state: node.states,
                        port: port
                    }
                    controlsToBind.push(controlDict)
                }

                if (node.ports[port].analysis == null) node.ports[port].analysis = []
                if (node.ports[port].active == null) node.ports[port].active = {in:0,out:0}
            }
        } else {
            node.ports = {
                default:{active:{in:0,out:0}}
            }
            node.states['default'] = [{}]
        }
        
        // Instantiate Dependencies
        let depDict = {}
        let instance, analysis;
        if (node.dependencies){
            node.dependencies.forEach(d => {
                ({instance, analysis} = this.instantiateNode(d))
                depDict[d.id] = instance
                if (analysis.size > 0) toAnalyze.add(...Array.from(analysis))
            })
        }
        node.dependencies = depDict

        nodeInfo.controls = controlsToBind
        if (nodeInfo.analysis == null) nodeInfo.analysis = []
        nodeInfo.analysis.push(...Array.from(toAnalyze))
        return {instance: node, controls: controlsToBind, analysis: toAnalyze}
    }

    removeNode(appId,label){
        let applet = this.applets[appId]

        // NOTE: Not Removing
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
        }
    }

    _getRandomId(){
        return String(Math.floor(Math.random()*1000000))
    }

    addNode(appId,nodeInfo){

        // Add Basic Node Information to the Graph
        if (nodeInfo.id==null) nodeInfo.id = this._getRandomId()        
        let instance,controls, analysis;

        let found = this.applets[appId].nodes.find(n => {
            if (n.id == nodeInfo.id){
                return true
            }
        })
        if (found) nodeInfo.id = nodeInfo.id + this._getRandomId()

        this.applets[appId].nodes.push(nodeInfo);
        
        ({instance, controls, analysis} = this.instantiateNode(nodeInfo,this.session))
        nodeInfo.instance = instance;

        // if (this.applets[appId].nodes[nodeInfo.id].analysis == null) this.applets[appId].nodes[nodeInfo.id].analysis = []
        // this.applets[appId].nodes[nodeInfo.id].analysis.push(...analysis);
        if (controls.length > 0) this.applets[appId].controls.options.add(...controls);

        // Initialize the Node
        let applet = this.applets[appId]
        nodeInfo.instance.stateUpdates = {}
        nodeInfo.instance.stateUpdates.manager = this.state
        
            let node = nodeInfo.instance
            let ui = node.init(nodeInfo.params)
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
        
        // Add Node to Registry
        if (this.registry.local[node.label] == null){
            this.registry.local[node.label] = {label: node.label, count: 0, registry: {}}
            for (let port in node.states){
                this.registry.local[node.label].registry[port] = {}
                this.registry.local[node.label].registry[port].state = node.states[port]
                this.registry.local[node.label].registry[port].callbacks = []
            }
        }
        this.registry.local[node.label].count++


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
    runSafe(node, port='default',input=[{}]){

        // Shallow Copy State before Repackaging
        let inputCopy = []

        inputCopy = this.deeperCopy(input)

        // Add Metadata
        for (let i = inputCopy.length - 1; i >= 0; i -= 1) {
            // Remove Users with Empty Dictionaries
            if (Object.keys(inputCopy[i]) == 0) inputCopy.splice(i,1)
            // Or Add Username
            else {
                if (!inputCopy[i].username) inputCopy[i].username = this.session?.info?.auth?.username
                if (!inputCopy[i].meta) inputCopy[i].meta = {}
            }
        }

        // Only Continue the Chain with Updated Data
        if (inputCopy.length > 0){
            
            let result
            if (node[port] instanceof Function) result = node[port](inputCopy)
            else if (node.states[port] != null) result = node['default'](inputCopy) 

            // Handle Promises
            if (!!result && typeof result.then === 'function'){
                result.then((r) =>{
                    this.checkToPass(node,port,r)
                })
            } else {
                this.checkToPass(node,port,result)
            }
        }

        return node.states[port]
    }

    checkToPass(node,port,result){
        if (result && result.length > 0){
            let allEqual = true
            node.states[port].splice(result.length-1) // Remove previous states that weren't returned

            result.forEach((o,i) => {
                if (node.states[port].length > i){
                    let thisEqual = JSON.stringifyFast(node.states[port][i]) === JSON.stringifyFast(o)
                    if (!thisEqual){
                        node.states[port][i] = o
                        allEqual = false
                    }
                } else {
                    node.states[port].push(o)
                    allEqual = false
                }
            })            
            if (!allEqual && node.stateUpdates){
                let updateObj = {}
                let label = this.getLabel(node,port)
                updateObj[label] = true
                node.stateUpdates.manager.setState(updateObj)
            }
        }
    }

    init(id, settings){
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
        if (graph){
            if (Array.isArray(graph.nodes)){
                graph.nodes.forEach((nodeInfo,i) => {
                    this.addNode(id,nodeInfo)
                })
            }

            // Create Edges
            if (Array.isArray(graph.edges)){
                graph.edges.forEach((e,i) => {
                    this.addEdge(id, e, false)
                })
            }
        }

        return this.applets[id]
    }

    start(appId, sessionId){

        let applet =  this.applets[appId]
        if (applet){
            applet.sessionId = sessionId ?? appId

            // Listen for Updates on Multiplayer Edges
            applet.edges.forEach((e,i) => {
                this._subscribeToBrainstorm(e, appId)

            })
        }

        return applet
    }

    addEdge = (appId, e) => {
        let applet = this.applets[appId]

        let existingEdge = this.applets[appId].edges.find(edge => {
            if (e.source == edge.source && e.target == edge.target){
                return true
            }
        })
        
        if (existingEdge == null){ // Do not duplicate edges
            this.applets[appId].edges.push(e)

        let splitSource = e.source.split(':')
        let sourceName = splitSource[0]
        let sourcePort = splitSource[1] ?? 'default'
        let sourceInfo = applet.nodes.find(n => {
            if (n.id == sourceName) return true
        })
        let source = sourceInfo.instance
        let splitTarget = e.target.split(':')
        let targetName = splitTarget[0]
        let targetPort = splitTarget[1] ?? 'default'
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
        let _onTriggered = (trigger) => {
            if (trigger){
                let input = source.states[sourcePort]
                input.forEach(u => {
                    if (!u.meta) u.meta = {}
                    u.meta.source = sourceName
                    u.meta.session = applet.sessionId
                })
                if (this.applets[appId].editor) this.applets[appId].editor.animate({label:source.label, port: sourcePort},{label:target.label, port: targetPort})
                return this.runSafe(target, targetPort, input)
            }
        }
        
        this.state.data[label] = this.registry.local[sourceName].registry[sourcePort].state

        // Register Brainstorm State
        if (target instanceof plugins.utilities.Brainstorm) {
            applet.streams.add(label) // Keep track of streams
            
            // Replace Default Update Command and Send Local Updates to the Brainstorm
            _onTriggered = (trigger) => {
                // Get Upstream Output
                let output = source.states[sourcePort]
                if (output.length > 0){
                    output.forEach(u => {
                        u.meta.source = sourceName
                        u.meta.session = applet.sessionId
                    })
                    this.runSafe(target, 'send', output) // Refresh personal state data
                }
            }

            // Update Brainstorm State with Latest Session Data (applied in this._subscribeToBrainstorm)
            this.registry.local[sourceName].registry[sourcePort].callbacks.push((trigger) => {
                this.runSafe(target, targetPort, [{data: true, meta: {source: label, session: applet.sessionId}}]) // Update port state
                _onTriggered(trigger) // Trigger Downstream Changes
            })
        } 

        // And Listen for Local Changes
        if (applet.subscriptions.local[label] == null) applet.subscriptions.local[label] = []
        let subId = this.state.subscribeSequential(label, _onTriggered)
        applet.subscriptions.local[label].push({id: subId, target: e.target})

        if (target.ports[targetPort] == null) target.ports[targetPort] = {}
        if (target.ports[targetPort] == null) source.ports[sourcePort] = {}

        let tP = target.ports[targetPort]
        let sP = source.ports[sourcePort]
        tP.active.in++
        sP.active.out++
        if (tP.active.in && tP.active.out && tP.analysis) applet.analysis.dynamic.push(...tP.analysis)
        if (sP.active.in && sP.active.out && sP.analysis) applet.analysis.dynamic.push(...sP.analysis)

        this.updateApp(appId)
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
        applet.nodes.forEach(n => {
            if (classId == null || n.class.id === classId){

            // Increment the Registry for Each Separate Label (of a particular class)
           
            for (let port in n.instance.ports){
                if (label === null || n.instance.label === label){
                if (n.instance.ports[port].active != null && (n.instance.ports[port].active.in > 0 || n.instance.ports[port].active.out === true)){

                this.registry.local[n.instance.label].count--

                if (this.registry.local[n.instance.label].count == 0) {
                    // Remove All Edges
                    delete this.registry.local[n.instance.label]

                    this.session.removeStreaming(n.instance.label);
                    this.session.removeStreaming(n.instance.label, null, this.state, true);
                    this.session.removeStreaming(applet.sessionId);

                    // Remove Entire Node + Edges
                    this.removeNode(appId,n.instance.label)
                } 
                else {
                    this.removeMatchingEdges(appId,n.instance.label)
                }
            } else {
                this.removeNode(appId,n.instance.label)
            }
        }
    }
            }
        })

        // // Remove Editor
        if (appId && classId==null && label==null){
            // if (this.applets[appId].editor) this.applets[appId].editor.deinit()
            delete this.applets[appId]
        }
    }
    }

    removeMatchingEdges(id, label){
        let applet = this.applets[id]

        for (let i = applet.edges.length - 1; i >=0; i--) {
            let e = applet.edges[i] 
            if ((e.source.split(':')[0] == label) || (e.target.split(':')[0] == label)){
                this.removeEdge(id,e)
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

        applet.edges.find((e,i) => {
            if (e === structure){
                this.applets[appId].edges.splice(i,1)
                return true
            }
        })

        // Remove Edge Analysis Flags
        let splitSource = structure.source.split(':')
        let sourceName = splitSource[0]
        let sourcePort = splitSource[1] ?? 'default'
        let sourceInfo = applet.nodes.find(n => {
            if (n.id == sourceName) return true
        })
        let source = sourceInfo.instance
        let splitTarget = structure.target.split(':')
        let targetName = splitTarget[0]
        let targetPort = splitTarget[1] ?? 'default'
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

    // Internal Methods
    _subscribeToBrainstorm(e, appId){

        let applet = this.applets[appId]
        let splitSource = e.source.split(':')
        let sourceName = splitSource[0]
        let sourcePort = splitSource[1] ?? 'default'
        let sourceInfo = applet.nodes.find(n => {
            if (n.id == sourceName) return true
        })
        let source = sourceInfo.instance
        let splitTarget = e.target.split(':')
        let targetName = splitTarget[0]
        let targetPort = splitTarget[1] ?? 'default'
        let targetInfo = applet.nodes.find(n => {
            if (n.id == targetName) return true
        })
        let target = targetInfo.instance

        if (target instanceof plugins.utilities.Brainstorm) {

            let id = (sourcePort != 'default') ? `${ sourceInfo.instance.label}_${sourcePort}` :  sourceInfo.instance.label

            if (applet.subscriptions.session[id] == null) applet.subscriptions.session[id] = []
            
            let found = this.findStreamFunction(id)

            if (found == null) {

                let _brainstormCallback = (userData) => {
                    this.registry.local[sourceName].registry[sourcePort].callbacks.forEach((f,i) => {
                        if (f instanceof Function) f(userData)
                    })
                }

                let _localCallback = (userData) => {
                    if (this.applets[appId].editor) this.applets[appId].editor.animate({label:source.label, port: sourcePort},{label:target.label, port: targetPort})
                    _brainstormCallback(userData)
                }

                // Create Brainstorm Stream
                let subId1 = this.session.streamAppData(id, this.registry.local[sourceName].registry[sourcePort].state, applet.sessionId,_localCallback) //()=>{}) // Local changes are already listened to
                applet.subscriptions.session[id].push({id: subId1, target: null})

                // Subscribe to Changes in Session Data
                let subId2 = this.session.state.subscribeSequential(applet.sessionId, (sessionInfo) => {
                    let data = [{data: true, meta: {source: id, session: applet.sessionId}}] // Trigger Brainstorm Update
                    _brainstormCallback(data)
                })

                if (applet.subscriptions.session[applet.sessionId] == null) applet.subscriptions.session[applet.sessionId] = []
                applet.subscriptions.session[applet.sessionId].push({id: subId2, target: null})

                _localCallback() // Initialize with Your Data
            } 
        }
    }

    // Create a Node Editor
    edit(applet, parentNode = document.body, onsuccess = () => { }){
        if (this.applets[applet.props.id]){
            this.applets[applet.props.id].editor = new GraphEditor(this, applet, parentNode, onsuccess)
            return this.applets[applet.props.id].editor
        }
    }

}