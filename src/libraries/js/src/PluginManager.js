// Managers
import { StateManager } from './ui/StateManager'
import { Session } from './Session'
import { Brainstorm } from './plugins/utilities/Brainstorm'
import { GUI } from 'dat.gui'

export class PluginManager{
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
        if (this.settings.gui === true){
            this.gui = new GUI({ autoPlace: false });
            document.body.innerHTML += `<div id="brainsatplay-plugin-gui" class='guiContainer'></div>`
            document.body.querySelector('.guiContainer').appendChild(this.gui.domElement);
            this.gui.domElement.style.display = 'none'
        }

        // Listen to Added/Removed States in Session (if provided)
        if (session instanceof Session){

            let added = (k) => {
                // Attach Proper Stream Callback to New Brainstorm States
                for (let s in this.registry.local){
                    let label = this.registry.local[s].label
                    if (this.registry.brainstorm[k] == null){
                            if (k.includes(label) && k !== label){

                            // Only Defaults on the Brainstorm for Now
                            this.registry.brainstorm[k] = {count: 1, id: this.session.state.subscribe(k, this.registry.local[s].registry['default'].callback), callback: this.registry.local[s].registry['default'].callback}
                            this.registry.brainstorm[k].callback()
                        }
                    } 
                }
            }

            let removed = (k) => {
                if (this.registry.brainstorm[k] != null){
                    this.session.state.unsubscribe(k,this.registry.brainstorm[k].id)
                    this.registry.brainstorm[k].callback()
                    delete this.registry.brainstorm[k]
                }
            }

            this.props.toUnsubscribe['stateAdded'].push(this.session.state.subscribeSequential('stateAdded', added))
            this.props.toUnsubscribe['stateRemoved'].push(this.session.state.subscribeSequential('stateRemoved', removed))
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
                if (typeof firstUserDefault.data === 'number' || typeof firstUserDefault.data === 'boolean'){
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

    add(id, name, graphs){
        let streams = new Set()
        let outputs = {}
        let subscriptions = {
            session: {},
            local: {}
        }

        let controlsToBind = {options: [], manager: this.state}

        let nodes = {}
        let edges = []
        let activePorts = {}
        graphs.forEach(g => {

            if (Array.isArray(g.edges)){
                g.edges.forEach(e => {
                    edges.push(e)

                    // Capture Active Ports
                    for (let k in e){
                        let [node,port] = e[k].split(':')
                        if (activePorts[node] == null) activePorts[node] = new Set()
                        if (port) activePorts[node].add(port)
                    }
                })
            }

            // Auto-Assign Default Port to Empty Set
            Object.keys(activePorts).forEach(p => {
                if (activePorts[p].size == 0){
                    activePorts[p].add('default')
                }
            })

            let instance,controls;
            g.nodes.forEach(nodeInfo => {
                if (nodes[nodeInfo.id] == null){
                    nodes[nodeInfo.id] = nodeInfo;

                    ({instance, controls} = this.instantiateNode(nodeInfo,this.session, activePorts[nodeInfo.id]))
                    
                    nodes[nodeInfo.id].instance = instance;
                    controlsToBind.options.push(...controls);
                }
            })
        })

        // Declare Applet Info
        if (this.applets[id] == null) this.applets[id] = {nodes, edges, name,streams, outputs,subscriptions, controls: controlsToBind}
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
    runSafe(input, node, port='default'){

        let stateLabel = this.getLabel(node,port)

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
            else result = node['default'](inputCopy) 

            if (result && result.length > 0){
                let allEqual = true
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
                    updateObj[stateLabel] = true
                    node.stateUpdates.manager.setState(updateObj)
                }
            }
        }

        return node.states[port]
    }


    addToGUI(nodeInfo){
        // Add GUI Element for Newly Created Nodes

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
            if (!Object.keys(this.gui.__folders).includes(node.label)){

                if (this.gui.domElement.style.display === 'none') this.gui.domElement.style.display = 'block'

                this.gui.addFolder(node.label);
                this.registry.local[node.label].gui[node.label] = []

                // Capitalize Display Name
                let folderName = node.label[0].toUpperCase() + node.label.slice(1)
                this.gui.__folders[node.label].name = folderName
            }
            paramsMenu = this.gui.__folders[node.label]
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

    start(appId){

        let applet =  this.applets[appId]

        applet.streams = new Set()
        applet.classInstances = {}

        // Track Controls 
        applet.conrols = []

        // Track UI Setup Variables
        let uiArray = []
        let uiParams = {
            HTMLtemplate: '',
            setupHTML: [],
            responsive: [],
        }

        let initializedNodes = []

        // Get UI Components from Nodes
        for (let id in applet.nodes){

            // Add State Manager
            let node = applet.nodes[id]
            node.instance.stateUpdates = {}
            node.instance.stateUpdates.manager = this.state

            if (!initializedNodes.includes(node.id)){
                let ui = node.instance.init(node.params)
                if (ui != null) {

                    // Grab Responsive Function
                    ui.responsive = node.instance.responsive

                    // Pass Empty User Dictionary as Final Setup Call (overrides plugin defaults)
                    var cachedSetup = ui.setupHTML;
                    ui.setupHTML = (app) => {
                        cachedSetup(app)
                        let defaultInput = [{}]
                        for (let port in node.instance.ports){
                            let defaults = node.instance.ports[port].defaults
                            if (defaults){
                                if (defaults.input){
                                    defaultInput = defaults.input
                                    defaultInput.forEach(o => {
                                        if (o.data == null)  o.data = null
                                        if (o.meta == null)  o.meta = {}                           
                                    })
                                    node.instance[port](defaultInput)
                                }
                            }
                        }
                    }

                    // Push to UI Array
                    uiArray.push(ui)
                }
                initializedNodes.push(node.id)
            }
        }

        uiArray.forEach((o) => {
            if (o.HTMLtemplate instanceof Function) o.HTMLtemplate = o.HTMLtemplate()
            uiParams.HTMLtemplate += o.HTMLtemplate
            uiParams.setupHTML.push(o.setupHTML)
            uiParams.responsive.push(o.responsive)
        })

        // Register All Nodes
        for (let id in applet.nodes){
            let nodeInfo =  applet.nodes[id]
            let node = nodeInfo.instance

            // Add to Registry
            if (this.registry.local[node.label] == null){
                this.registry.local[node.label] = {label: node.label, count: 0, registry: {}, gui: {}}
                for (let port in node.states){
                    this.registry.local[node.label].registry[port] = {}
                    this.registry.local[node.label].registry[port].state = node.states[port]
                    this.registry.local[node.label].registry[port].callback = () => {}
                }
            }


            if (applet.classInstances[nodeInfo.class.id] == null) applet.classInstances[nodeInfo.class.id] = {}
            applet.classInstances[nodeInfo.class.id][node.label] = []

            this.registry.local[node.label].count++
            this.addToGUI(nodeInfo)
        }

        // Start Graphs
        applet.edges.forEach((e,i) => {

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
                let targetLabel = this.getLabel(target, targetPort)
                applet.classInstances[sourceInfo.class.id][source.label].push(label)

                // Pass Data from Source to Target
                let defaultCallback = (trigger) => {

                    if (trigger){

                        // if (label.includes('blink')) console.log(label, source.states[sourcePort][0].data)
                        let input = source.states[sourcePort]
                        if (targetLabel.includes('brainstorm_')){

                            // Update Session State
                            this.session.state.data[label] = input[0]

                            // Add Default Metadata
                            if (!('source' in input[0].meta)) input[0].meta.route = label
                            if (!('app' in input[0].meta)) input[0].meta.app = applet.name
                        }
                        return this.runSafe(input, target, targetPort)
                    }
                }
                

                // Initialize port with Default Output
                this.state.data[label] = source.states[sourcePort]

                // Log Output in Global State (for Brainstorm)
                if (applet.nodes[targetName].instance instanceof Brainstorm) {
                    // if (sourceInfo.loop) uiParams.setupHTML.push(this._addStream(sourceInfo, appId, sourcePort, [brainstormCallback])) // Add stream function
                    uiParams.setupHTML.push(this._addData(sourceInfo, appId, sourcePort, [defaultCallback])) // Add data to listen to

                    // Add Default State to the Global State
                    this.session.state.data[label] = this.state.data[label][0]

                    // Add to Stream List
                    applet.streams.add(label) // Keep track of streams to pass to the Brainstorm
                } 

                // // And  Listen for Local Changes
                if (applet.subscriptions.local[label] == null) applet.subscriptions.local[label] = []

                if (sourceInfo.loop){

                    // Check if Already Streaming
                    let found = this.findStreamFunction(label)

                    // If Already Streaming, Subscribe to Stream
                    if (found != null){
                        if (this.session.state[label]) applet.subscriptions.local[label].push(this.session.state.subscribeSequential(label, defaultCallback))
                        else applet.subscriptions.local[label].push(this.state.subscribeSequential(label, defaultCallback))
                    } 

                    // Otherwise Create Local Stream and Subscribe Locally
                    else {
                        this.session.addStreamFunc(label, source[sourcePort], this.state, false)
                            applet.subscriptions.local[label].push(this.state.subscribeSequential(label, defaultCallback))
                    }

                } else {
                    applet.subscriptions.local[label].push(this.state.subscribeSequential(label, defaultCallback))
                }
        })

        return {uiParams: uiParams, streams:this.applets[appId].streams, controls: this.applets[appId].controls}
    }

    findStreamFunction(prop) {
        return this.session.streamObj.streamTable.find((d => {
            if (d.prop === prop) {
                return d
            }             
        }))
     }

    stop(appId){
        let applet = this.applets[appId]

        // Remove Listeners
        Object.keys(applet.classInstances).forEach(classId => {
            let labels = Object.keys(applet.classInstances[classId])

            // Increment the Registry for Each Separate Label (of a particular class)
           
            labels.forEach(label => {

                let openPorts = applet.classInstances[classId][label]

                this.registry.local[label].count--

                if (this.registry.local[label].count == 0) {

                    // Remove GUI
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

                    // Remove Streaming
                    delete this.registry.local[label]
                    openPorts.forEach(p => {
                        this.session.removeStreaming(p);
                        this.session.removeStreaming(p, null, this.state, true);
                    })
                } else {

                    // Remove Subscriptions
                    openPorts.forEach(p => {
                        let sessionSubs = applet.subscriptions.session[p]
                        let localSubs = applet.subscriptions.local[p]

                        if (sessionSubs != null){
                            applet.subscriptions.session[p].forEach(id =>{
                                this.session.removeStreaming(p, id);
                            })
                        }

                        if (localSubs != null){
                            localSubs.forEach(id => {
                                this.session.removeStreaming(p, id, this.state, true);
                            })
                        }
                    })

                }
            })
        })

        // Deinit Plugins
        for (let key in this.applets[appId].nodes){
            this.applets[appId].nodes[key].instance.deinit()
        }

        delete this.applets[appId]
    }

    // Internal Methods

    _addData(nodeInfo, appletId, port, callbacks) {

        let applet = this.applets[appletId]
        let id = (port != 'default') ? `${ nodeInfo.instance.label}_${port}` :  nodeInfo.instance.label
        let found = this.findStreamFunction(id)

        if (applet.subscriptions.session[id] == null) applet.subscriptions.session[id] = []

        this.registry.local[id].registry[port].callback = () => {
            if (this.session.state.data[id] != null){
                if (callbacks){
                    let propData = this.session.getBrainstormData(applet.name,[id], 'app', 'plugin')
                    callbacks.forEach(f => {
                        if (f instanceof Function) f(propData)
                    })
                }
            }
        }

        if (found == null) {
            applet.subscriptions.session[id].push(this.session.streamAppData(id, this.registry.local[id].registry[port].state, this.registry.local[id].registry[port].callback))
        } else {
            applet.subscriptions.session[id].push(this.session.state.subscribe(id, this.registry.local[id].registry[port].callback))
        }

        // Pass Callback to Send Existing Session Data
        return () => {this.registry.local[id].registry[port].callback(this.session.state.data[id])}
            
    }

    _addStream(nodeInfo, appletId, port, callbacks){

        callback = nodeInfo.instance[port] 

        let applet = this.applets[appletId]
        let id = (port != 'default') ? `${ nodeInfo.instance.label}_${port}` :  nodeInfo.instance.label

        if (applet.subscriptions.session[id] == null) applet.subscriptions.session[id] = []
    
        let found = this.findStreamFunction(id)

        if (found == null) {
            this.session.addStreamFunc(id, callback)
        }
        
        this.registry.local[id].registry[port].callback = () => {
            if (this.session.state.data[id] != null){
                if (callbacks){
                    let propData = this.session.getBrainstormData(applet.name,[id], 'app', 'plugin')
                    callbacks.forEach(f => {
                        if (f instanceof Function) f(propData)
                    })
                }
            }
        }

        applet.subscriptions.session[id].push(this.session.state.subscribe(id, this.registry.local[id].registry[port].callback))
        
        // Pass Callback to Send Existing Stream Data
        return () => {this.registry.local[id].registry[port].callback(this.session.state.data[id])}
}

}