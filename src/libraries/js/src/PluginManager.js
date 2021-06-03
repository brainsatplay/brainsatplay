// Managers
import { StateManager } from './ui/StateManager'
import { Session } from './Session'

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
            this.session.state.addToState('update',this.session.state.update, (update) => {

            if (update.added){

                // Attach Proper Stream Callback to New Brainstorm States
                for (let s in this.registry.local){
                    let label = this.registry.local[s].label
                    update.buffer.forEach(k => {
                        if (this.registry.brainstorm[k] == null){
                                if (k.includes(label) && k !== label){

                                // Only Defaults on the Brainstorm for Now
                                this.registry.brainstorm[k] = {count: 1, id: this.session.state.subscribe(k, this.registry.local[s].registry['default'].callback), callback: this.registry.local[s].registry['default'].callback}
                                this.registry.brainstorm[k].callback()
                            }
                        } 
                    })
                }
            }

            if (update.removed){
                update.buffer.forEach(k => 
                    {
                    if (this.registry.brainstorm[k] != null){
                        this.session.state.unsubscribe(k,this.registry.brainstorm[k].id)
                        this.registry.brainstorm[k].callback()
                        delete this.registry.brainstorm[k]
                    }
                })
            }

            update.added = ''
            update.removed = ''
            update.buffer.clear()
        })
    }
    }

    instantiateNode(nodeInfo,session=this.session, activePorts=new Set(['default'])){
        let node = new nodeInfo.class(nodeInfo.id, session, nodeInfo.params)

        // Set Default Parameters
        for (let param in node.paramOptions){
            if (node.params[param] == null) node.params[param] = node.paramOptions[param].default
        }

        // Add Default States
        node.states = {}

        if (node.ports != null){
            for (let port in node.ports){
                node.states[port] = {data: [{}], meta: {}}
                let defaults = node.ports[port].defaults
                if (defaults && defaults.output) {
                    try {
                        if (Array.isArray(defaults.output)) node.states[port].data = defaults.output
                        else if (defaults.output.constructor == Object && 'data' in defaults.output) node.states[port].data = [defaults.output]
                    } catch {
                        node.states[port].data = defaults.output
                    }
                    node.states[port].meta.label = node.states[port].data[0].meta.label
                }
            }
        }

        // Catch Active Ports without Defaults
        activePorts.forEach(p => {
            if (node.states[p] == null) node.states[p] = {data: [{}], meta: {}}
        })
        
        // Instantiate Dependencies
        let depDict = {}
        if (node.dependencies){
            node.dependencies.forEach(d => {
                depDict[d.id] = this.instantiateNode(d)
            })
        }
        node.dependencies = depDict

        return node
    }

    add(id, name, graphs){
        let streams = new Set()
        let outputs = {}
        let subscriptions = {
            session: {},
            local: {}
        }

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
                        if (activePorts[node] == null) activePorts[node] = new Set(['default'])
                        if (port) activePorts[node].add(port)
                    }
                })
            }

            g.nodes.forEach(nodeInfo => {
                if (nodes[nodeInfo.id] == null){
                    nodes[nodeInfo.id] = nodeInfo
                    nodes[nodeInfo.id].instance = this.instantiateNode(nodeInfo,this.session, activePorts[nodeInfo.id])
                }
            })
        })

        // Declare Applet Info
        if (this.applets[id] == null) this.applets[id] = {nodes, edges, name,streams, outputs,subscriptions}
    }

    getNode(id,name){
        return this.applets[id].nodes[name].instance
    }

    updateParams(node,params) {
        for (let param in params) node.params[param] = params[param]
    }

    runSafe(input, node, port='default'){

        // Do Not Mutate Input
        let inputCopy = []
        // inputCopy = JSON.parse(JSON.stringify(input)) // Deep
        if (input.constructor == Object) inputCopy = Object.assign({}, input); // Shallow
        else if (Array.isArray(input)) input.forEach(u => {
            inputCopy.push(Object.assign({}, u))
        })
        
        // Package Single User
        if (inputCopy.constructor == Object){

            if (!("data" in inputCopy)){
                inputCopy = {data: inputCopy, meta: {}, username: 'guest'} // Raw Data (not formatted)
            }

            if ("timestamp" in inputCopy){
                inputCopy = inputCopy.data
            }

            if (!Array.isArray(inputCopy)) inputCopy = [inputCopy]
            if (inputCopy[0].constructor == Object){
                inputCopy[0].username = this.session?.info?.auth?.username
                if (!"label" in inputCopy[0].meta) inputCopy[0].meta.label = (sourcePort != null) ? `${source.label}_${sourcePort}` : source.label
            }

        } else if (!Array.isArray(inputCopy)){
            inputCopy = [{data: inputCopy, meta: {}, username: 'guest'}] // Raw Data (not formatted)
        }

        // Otherwise Handle Misformatted Data

        for (let i = inputCopy.length - 1; i >= 0; i -= 1) {
            let u = inputCopy[i]
            if (u.constructor == Object && "data" in u){
                // Nested User Data
                if (Array.isArray(u.data)){
                    if (u.data[0] != null && u.data[0].constructor == Object && "username" in u.data[0]){
                        inputCopy[i] = u.data[0] // Users passed themselves within an array to the data field
                    }
                } 
                else if (u.data != null && u.data.constructor == Object && "username" in u.data){
                    inputCopy[i] = u.data // Users passed themselves to the data field
                }
            } else {
                if (inputCopy.username) inputCopy.splice(i,1) // Remove user entries without data
                else inputCopy[i] = {data: inputCopy[i], meta: {}, username: 'guest'}  // Raw Data (not formatted)
            }
        }
        let result = node[port](inputCopy)

        if (result){ // If you have a loop, this will always update. Otherwise it waits for a direct state change on a node.
            node.states[port].data = result
            node.states[port].timestamp = Date.now() // Force recognition of update
        }

        return result
    }


    addToGUI(nodeInfo){
        // Add GUI Element for Newly Created Nodes

        let node = nodeInfo.instance

        let paramsMenu;
        
        if (node.paramOptions){
            let paramKeys = Object.keys(node.paramOptions)
            if (paramKeys.length > 0 && !(paramKeys.length === 1 && node.paramOptions[paramKeys[0]].show === false)){
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

        let uiArray = []
        let uiParams = {
            HTMLtemplate: '',
            setupHTML: [],
            responsive: [],
        }

        let initializedNodes = []

        // Get UI Components from Nodes
        for (let id in applet.nodes){
            let node = applet.nodes[id]
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
                                        if (o.data == null)  o.data = [{}]
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
                    this.registry.local[node.label].registry[port].state = node.states
                    this.registry.local[node.label].registry[port].callback = () => {}
                }
            }

            if (applet.classInstances[nodeInfo.class.id] == null) applet.classInstances[nodeInfo.class.id] = [node.label] // Keep track of streams to pass to the Brainstorm
            else applet.classInstances[nodeInfo.class.id].push(node.label)

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

                // Pass Data from Source to Target
                let callback = (input) => {
                    return this.runSafe(input, target, targetPort)
                }

                // Pass Output From Brainstorm (and automatically stream this input)
                if (sourcePort == 'brainstorm') {
                    if (sourceInfo.loop) uiParams.setupHTML.push(this._addStream(sourceInfo, appId, source['default'], [callback])) // Add stream function
                    else uiParams.setupHTML.push(this._addData(sourceInfo, appId, [callback])) // Add data to listen to

                    // Add to Stream List
                    if (source.label != null) applet.streams.add(source.label) // Keep track of streams to pass to the Brainstorm
                } 

                // Otherwise Just Listen for Local Changes (on each port)
                else {
                if (source.label){

                    // Create State for Port
                    let label = (sourcePort != 'default') ? `${source.label}_${sourcePort}` : source.label

                    // Grab Default Output for Port
                    this.state.data[label] = source.states[sourcePort] // this.getDefaultState(node, sourcePort)

                    if (applet.subscriptions.local[label] == null) applet.subscriptions.local[label] = []

                    if (sourceInfo.loop){

                        // Check if Already Streaming
                        let found = this.findStreamFunction(label)

                        // If Already Streaming, Subscribe to Stream
                        if (found != null){
                            if (this.session.state[label]) applet.subscriptions.local[label].push(this.session.state.subscribe(label, callback))
                            else applet.subscriptions.local[label].push(this.state.subscribe(label, callback))
                            // let input = this.session.state.data[label]
                            // if (input == null) input = this.state.data[label]
                            // uiParams.setupHTML.push(() => callback(input))
                        } 

                        // Otherwise Create Local Stream and Subscribe Locally
                        else {
                            this.session.addStreamFunc(label, source[sourcePort], this.state, false)
                            applet.subscriptions.local[label].push(this.state.subscribe(label, callback))
                        }

                    } else {
                        applet.subscriptions.local[label].push(this.state.subscribe(label, callback))
                    }
                }
            }
        })

        return {uiParams: uiParams, streams:this.applets[appId].streams}
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
            let labels = applet.classInstances[classId]

            // Increment the Registry for Each Separate Label (of a particular class)
           
            labels.forEach(label => {
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
                    if (Object.keys(this.gui.__folders).length){
                        if (this.gui.domElement.style.display !== 'none') this.gui.domElement.style.display = 'none'
                    }

                    // Remove Streaming
                    delete this.registry.local[label]
                    this.session.removeStreaming(label);
                    this.session.removeStreaming(label, null, this.state);
                } else {
                    // Remove Subscriptions
                    let sessionSubs = applet.subscriptions.session[label]
                    let localSubs = applet.subscriptions.local[label]

                    if (sessionSubs != null){
                        applet.subscriptions.session[label].forEach(id =>{
                            this.session.removeStreaming(label, id);
                        })
                    }
                    if (localSubs != null){
                        applet.subscriptions.local[label].forEach(id => {
                            this.session.removeStreaming(label, id, this.state);
                        })
                    }
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

    _addData(nodeInfo, appletId, callbacks) {


        let applet = this.applets[appletId]
        let id = nodeInfo.instance.label

        let found = this.findStreamFunction(id)

            if (applet.subscriptions.session[id] == null) applet.subscriptions.session[id] = []

            this.registry.local[id].callback = () => {

                if (this.session.state.data[id] != null){
                    if (callbacks){
                        let propData = this.session.getBrainstormData(applet.name,[id], 'app', 'plugin')
                        callbacks.forEach(f => {
                            if (f instanceof Function) f(propData)
                        })
                    }
                }
            }

            console.log('trying')

        if (found == null) {
            applet.subscriptions.session[id].push(this.session.streamAppData(id, this.registry.local[id].states, this.registry.local[id].callback))
        } else {
            applet.subscriptions.session[id].push(this.session.state.subscribe(id, this.registry.local[id].callback))
        }

        // Pass Callback to Send Existing Session Data
        return () => {this.registry.local[id].callback(this.session.state.data[id])}
            
    }

    _addStream(nodeInfo, appletId, callback, callbacks){

        let applet = this.applets[appletId]
        let id = nodeInfo.instance.label
        if (applet.subscriptions.session[id] == null) applet.subscriptions.session[id] = []
    
        let found = this.findStreamFunction(id)

        if (found == null) {
            this.session.addStreamFunc(id, callback)
        }
        
        this.registry.local[id].callback = () => {
            if (this.session.state.data[id] != null){
                if (callbacks){
                    let propData = this.session.getBrainstormData(applet.name,[id], 'app', 'plugin')
                    callbacks.forEach(f => {
                        if (f instanceof Function) f(propData)
                    })
                }
            }
        }

        console.log('trying')

        applet.subscriptions.session[id].push(this.session.state.subscribe(id, this.registry.local[id].callback))
        
        // Pass Callback to Send Existing Stream Data
        return () => {this.registry.local[id].callback(this.session.state.data[id])}
}

}