// Managers
import { StateManager } from './ui/StateManager'
import {GraphEditor} from './utils/graphEditor/GraphEditor'
import  {plugins} from '../brainsatplay'
import { Session } from './Session'

import { GUI } from 'dat.gui'

export class GraphManager{
    constructor(session, settings = {gui: true}){
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

        // Create GUI
        this.settings.gui = false
        if (this.settings.gui === true){
            this.gui = new GUI({ autoPlace: false });
            document.body.innerHTML += `<div id="brainsatplay-plugin-gui" class='guiContainer'></div>`
            document.body.querySelector('.guiContainer').appendChild(this.gui.domElement);
            this.gui.domElement.style.display = 'none'
        }
    }

    instantiateNode(nodeInfo,session=this.session, activePorts=new Set(['default'])){
        let node = new nodeInfo.class(nodeInfo.id, session, nodeInfo.params)
        let controlsToBind = []

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
            }
        } else {
            node.ports = {}
        }

        activePorts.forEach(p => {

            // Add Ports Variable + Show If Active
            if (node.ports[p] == null) {
                node.ports[p] = {
                    defaults: {
                        output: [{}]
                    },
                    active: true
                }
            } else {
                node.ports[p].active = true
            }

            // Catch Active Ports without Default State Assigned
            if (node.states[p] == null) node.states[p] = [{}]
        })
        
        
        // Instantiate Dependencies
        let depDict = {}
        let instance;
        if (node.dependencies){
            node.dependencies.forEach(d => {
                ({instance} = this.instantiateNode(d))
                depDict[d.id] = instance
            })
        }
        node.dependencies = depDict

        return {instance: node, controls: controlsToBind}
    }

    removeNode(appId,label){
        let applet = this.applets[appId]
        let nodeInfo = applet.nodes[label]
        this.removeMatchingEdges(appId, label)
        nodeInfo.instance.deinit()
        if (nodeInfo.fragment) nodeInfo.fragment.deleteNode()
        delete this.applets[appId].nodes[label]
    }

    addNode(appId,nodeInfo){

        // Add Basic Node Information to the Graph
        if (nodeInfo.id==null) nodeInfo.id = String(Math.floor(Math.random()*1000000))
        if (nodeInfo.activePorts==null) nodeInfo.activePorts = new Set()
        
        let instance,controls;
        if (this.applets[appId].nodes[nodeInfo.id] == null){
            this.applets[appId].nodes[nodeInfo.id] = nodeInfo;
            if (nodeInfo.activePorts.size == 0){
                nodeInfo.activePorts.add('default')
            }
            ({instance, controls} = this.instantiateNode(nodeInfo,this.session, nodeInfo.activePorts))
            this.applets[appId].nodes[nodeInfo.id].instance = instance;
            this.applets[appId].controls.options.push(...controls);
        }

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
            this.registry.local[node.label] = {label: node.label, count: 0, registry: {}, gui: {}}
            for (let port in node.states){
                this.registry.local[node.label].registry[port] = {}
                this.registry.local[node.label].registry[port].state = node.states[port]
                this.registry.local[node.label].registry[port].callbacks = []
            }
        }
        if (applet.classInstances[nodeInfo.class.id] == null) applet.classInstances[nodeInfo.class.id] = {}
        applet.classInstances[nodeInfo.class.id][node.label] = []
        this.registry.local[node.label].count++

        // Add Params to GUI
        this.addToGUI(nodeInfo)

        return nodeInfo
    }

    getNode(id,name){
        return this.applets[id].nodes[name].instance
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


    addToGUI(nodeInfo){
        // Add GUI Element for Newly Created Nodes
        if (this.gui){
        let node = nodeInfo.instance

        let paramsMenu;
        
        if (node.paramOptions){
            let paramKeys = Object.keys(node.paramOptions)
            let toShow = false
            paramKeys.forEach(k => {
                if (node.paramOptions[k].show !== false){
                    toShow = true
                }
            })
            if (paramKeys.length > 0 && toShow){

            if (this.gui){
                if (!Object.keys(this.gui.__folders).includes(node.label)){

                    if (this.gui.domElement.style.display === 'none') this.gui.domElement.style.display = 'block'

                    this.gui.addFolder(node.label);
                    this.registry.local[node.label].gui[node.label] = []

                    // Capitalize Display Name
                    let splitName = node.label.split('_')
                    splitName = splitName.map(str => str[0].toUpperCase() + str.slice(1))
                    let folderName = splitName.join(' ')
                    this.gui.__folders[node.label].name = folderName
                }
                paramsMenu = this.gui.__folders[node.label]
            }
        }

        for (let param in node.paramOptions){
            if(typeof node.paramOptions[param] === 'object' && node.params[param] != null && node.paramOptions[param].show !== false){
                
                // Numbers and Text
                if (node.paramOptions[param].options == null){
                    this.registry.local[node.label].gui[node.label].push(
                        paramsMenu.add(
                            node.params, 
                            param, 
                            node.paramOptions[param].min,
                            node.paramOptions[param].max,
                            node.paramOptions[param].step)
                    );
                } 
                
                // Selector
                else if (node.paramOptions[param].options.length > 1) {
                    this.registry.local[node.label].gui[node.label].push(
                        paramsMenu.add(
                            node.params, 
                            param, 
                            node.paramOptions[param].options)
                    );
                }
            }
        }
    }
}
    }

    init(id, name, graph){

        // Set Default Values for Graph
        let streams = new Set()
        let outputs = {}
        let subscriptions = {
            session: {},
            local: {}
        }
        let controls = {options: [], manager: this.state}
        let nodes = {}
        let edges = []
        let classInstances = {}

        if (this.applets[id] == null) this.applets[id] = {nodes, edges, name,streams, outputs,subscriptions, controls, classInstances}
        
        // Add Edges
        if (Array.isArray(graph.edges)){
            graph.edges.forEach(e => {
                this.applets[id].edges.push(e)

                // Capture Active Ports
                for (let k in e){
                    let [node,port] = e[k].split(':')
                    let nodeInfo = graph.nodes.find(o=>{
                        if (o.id === node){
                            return o
                        }
                    })
                    if (nodeInfo.activePorts == null) nodeInfo.activePorts = new Set()
                    if (port) nodeInfo.activePorts.add(port)
                }
            })
        }

        let applet =  this.applets[id]
        
        // Create Nodes
        graph.nodes.forEach((nodeInfo,i) => {
            this.addNode(id,nodeInfo)
        })

        // Create Edges
        applet.edges.forEach((e,i) => {
            this.addEdge(id, e, false)
        })

        return applet
    }

    start(appId, sessionId){

        let applet =  this.applets[appId]
        applet.sessionId = sessionId ?? appId

        // Listen for Updates on Multiplayer Edges
        applet.edges.forEach((e,i) => {
            this._subscribeToBrainstorm(e, appId)

        })

        return applet
    }

    addEdge = (appId, e) => {
        let applet = this.applets[appId]
        let splitSource = e.source.split(':')
        let sourceName = splitSource[0]
        let sourcePort = splitSource[1] ?? 'default'
        let sourceInfo = applet.nodes[sourceName]
        let source = sourceInfo.instance
        let splitTarget = e.target.split(':')
        let targetName = splitTarget[0]
        let targetPort = splitTarget[1] ?? 'default'
        let target = applet.nodes[targetName].instance
        let label = this.getLabel(source,sourcePort)
        applet.classInstances[sourceInfo.class.id][source.label].push(label)

        // Pass Data from Source to Target
        let _onTriggered = (trigger) => {
            if (trigger){
                let input = source.states[sourcePort]
                input.forEach(u => {
                    u.meta.source = sourceName
                    u.meta.session = applet.sessionId
                })
                if (this.applets[appId].editor) this.applets[appId].editor.animate({label:source.label, port: sourcePort},{label:target.label, port: targetPort})
                return this.runSafe(target, targetPort, input)
            }
        }
        
        // Initialize port with Default Output
        this.state.data[label] = this.registry.local[sourceName].registry[sourcePort].state

        // Register Brainstorm State
        if (applet.nodes[targetName].instance instanceof plugins.utilities.Brainstorm) {
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
                    this.runSafe(applet.nodes[targetName].instance, 'send', output) // Refresh personal state data
                }
            }

            // Update Brainstorm State with Latest Session Data (applied in this._subscribeToBrainstorm)
            this.registry.local[sourceName].registry[sourcePort].callbacks.push((trigger) => {
                this.runSafe(applet.nodes[targetName].instance, targetPort, [{data: true, meta: {source: label, session: applet.sessionId}}]) // Update port state
                _onTriggered(trigger) // Trigger Downstream Changes
            })
        } 

        // And Listen for Local Changes
        if (applet.subscriptions.local[label] == null) applet.subscriptions.local[label] = []
        let subId = this.state.subscribeSequential(label, _onTriggered)
        applet.subscriptions.local[label].push({id: subId, target: e.target})
    }

    findStreamFunction(prop) {
        return this.session.streamObj.streamTable.find((d => {
            if (d.prop === prop) {
                return d
            }             
        }))
     }

    remove(appId, classId=null, label=null){

        console.log(appId,classId,label)

        let applet = this.applets[appId]

        if (applet) {

        let classInstances = (classId != null) ? [classId] : Object.keys(applet.classInstances)

        // Remove Listeners
        classInstances.forEach(classId => {

            let labels = (label != null) ? [label] : Object.keys(applet.classInstances[classId])

            // Increment the Registry for Each Separate Label (of a particular class)
           
            labels.forEach(label => {

                let openPorts = applet.classInstances[classId][label]

                this.registry.local[label].count--

                if (this.registry.local[label].count == 0) {

                    // Remove GUI
                    if (this.gui){
                        for (let fname in this.registry.local[label].gui){
                            let folder = this.registry.local[label].gui[fname]
                            folder.forEach(o => {
                                o.remove()
                            })

                            let guiFolder = this.gui.__folders[fname]
                            guiFolder.close();
                            this.gui.__ul.removeChild(guiFolder.domElement.parentNode);
                            delete this.gui.__folders[fname];
                        }

                        // Hide GUI When Not Required
                        if (Object.keys(this.gui.__folders).length === 0){
                            if (this.gui.domElement.style.display !== 'none') this.gui.domElement.style.display = 'none'
                        }
                    }

                    // Remove All Edges
                    delete applet.classInstances[classId][label]
                    delete this.registry.local[label]
                    
                    openPorts.forEach(p => {
                        this.session.removeStreaming(p);
                        this.session.removeStreaming(p, null, this.state, true);
                    })
                    this.session.removeStreaming(applet.sessionId);

                    // Remove Entire Node + Edges
                    this.removeNode(appId,label)
                } 
                else {
                    this.removeMatchingEdges(appId,label)
                }
            })
        })

        // // Remove Editor
        if (Object.keys(applet.nodes).length === 0 && applet.edges.length === 0){
            if (this.applets[appId].editor) this.applets[appId].editor.deinit()
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

    removeEdge = (id, structure) => {

        let applet = this.applets[id]

        applet.edges.find((e,i) => {
            if (e === structure){
                this.applets[id].edges.splice(i,1)
                return true
            }
        })

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

        applet.edges.forEach((e,i) => {
            if (e === structure){
                applet.edges.splice(i,1)
            }
        })
    }

    // Internal Methods
    _subscribeToBrainstorm(e, appId){

        let applet = this.applets[appId]
        let splitSource = e.source.split(':')
        let sourceName = splitSource[0]
        let sourcePort = splitSource[1] ?? 'default'
        let sourceInfo = applet.nodes[splitSource[0]]
        let source = sourceInfo.instance
        let splitTarget = e.target.split(':')
        let targetName = splitTarget[0]
        let targetPort = splitTarget[1] ?? 'default'
        let target = applet.nodes[targetName].instance

        if (applet.nodes[splitTarget[0]].instance instanceof plugins.utilities.Brainstorm) {

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