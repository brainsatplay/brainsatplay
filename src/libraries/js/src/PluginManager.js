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
        this.registry = {local: {}, brainstorm: {}, devices: {}}

        // Manage States Locally
        this.state = new StateManager()

        // Create GUI
        if (this.settings.gui === true){
            this.gui = new GUI({ autoPlace: false });
            document.body.innerHTML += `<div class='guiContainer' style="position:absolute; top: 0px; right: 25px; z-index: 999;"></div>`
            document.body.querySelector('.guiContainer').appendChild(this.gui.domElement);
            this.gui.domElement.style.display = 'none'
        }

        // Listen to Added/Removed States in Session (if provided)
        if (session instanceof Session){
            this.session.state.addToState('update',this.session.state.update, (update) => {

            if (update.added){
                // Add Device Listeners
                update.buffer.forEach(k => {
                    if (k.includes('device')){

                        // Callback hardcoded for BCI Snake for Now
                        let deviceCallback = (o) => {
                            this.state.data['up'].data = (o.data === 1) ? true : false
                            this.state.data['down'].data = (o.data === 2) ? true : false
                            this.state.data['left'].data = (o.data === 3) ? true : false
                            this.state.data['right'].data = (o.data === 4) ? true : false
                        }

                        this.state.addToState(k,  this.session.state.data[k].states)
                        this.registry.devices[k] = {count: 1, id: this.state.subscribe(k, deviceCallback), callback: deviceCallback}
                    }
                })

                // Apply Proper Stream Callback
                for (let s in this.registry.local){
                    let label = this.registry.local[s].label
                    update.buffer.forEach(k => {
                        if (this.registry.brainstorm[k] == null){
                                if (k.includes(label) && k !== label){
                                this.registry.brainstorm[k] = {count: 1, id: this.session.state.subscribe(k, this.registry.local[s].callback), callback: this.registry.local[s].callback}
                                this.registry.brainstorm[k].callback()
                            }
                        } 
                    })
                }
            }

            if (update.removed){
                update.buffer.forEach(k => {
                    if (this.registry.brainstorm[k] != null){
                        this.session.state.unsubscribe(k,this.registry.brainstorm[k].id)
                        this.registry.brainstorm[k].callback()
                        delete this.registry.brainstorm[k]
                    } else if (k.includes('device')){
                        if (this.registry.devices[k] != null){
                            this.state.removeState(k)
                        }
                    }
                })
            }

            update.added = ''
            update.removed = ''
            update.buffer.clear()
        })
    }
    }

    instantiateNode(nodeInfo,session=this.session){
        let node = new nodeInfo.class(nodeInfo.id, session, nodeInfo.params)

        // Set Default Parameters
        for (let param in node.paramOptions){
            if (node.params[param] == null) node.params[param] = node.paramOptions[param].default
        }

        // Add Default State
        node.state = {data: null, meta: {}}


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
        graphs.forEach(g => {

            if (Array.isArray(g.edges)){
                g.edges.forEach(e => {
                    edges.push(e)
                })
            }

            g.nodes.forEach(nodeInfo => {
                if (nodes[nodeInfo.id] == null){
                    nodes[nodeInfo.id] = nodeInfo
                    nodes[nodeInfo.id].instance = this.instantiateNode(nodeInfo,this.session)
                }
            })
        })

        // Declare Applet Info
        if (this.applets[id] == null) this.applets[id] = {nodes, edges, name,streams, outputs,subscriptions}
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
                this.registry.local[nodeInfo.class.id].gui[node.label] = []

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
                    this.registry.local[nodeInfo.class.id].gui[node.label].push(
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
                    this.registry.local[nodeInfo.class.id].gui[node.label].push(
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
                            if (node.instance.ports[port].defaults.input) defaultInput = node.instance.ports[port].defaults.input
                            defaultInput.forEach(o => {
                                if (o.data == null)  o.data = []
                                if (o.meta == null)  o.meta = {}                           
                            })
                            node.instance[port](defaultInput)
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
            if (this.registry.local[nodeInfo.class.id] == null){
                this.registry.local[nodeInfo.class.id] = {label: node.label, count: 0, state: null, gui: {}, callback: ()=>{}}
                this.registry.local[nodeInfo.class.id].state = node.state

            }

            if (applet.classInstances[nodeInfo.class.id] == null) applet.classInstances[nodeInfo.class.id] = [node.label] // Keep track of streams to pass to the Brainstorm
            else applet.classInstances[nodeInfo.class.id].push(node.label)

            this.registry.local[nodeInfo.class.id].count++
            this.addToGUI(nodeInfo)
        }

        // Start Graphs
        applet.edges.forEach((e,i) => {

                let splitSource = e.source.split(':')
                let sourceName = splitSource[0]
                let sourcePort = splitSource[1]
                let sourceInfo = applet.nodes[sourceName]
                let source = sourceInfo.instance
                let splitTarget = e.target.split(':')
                let targetName = splitTarget[0]
                let targetPort = splitTarget[1]
                let target = applet.nodes[targetName].instance

                let callback = (input) => {

                    // Package Single User
                    if ((!Array.isArray(input) && (input.data[0] == null || (typeof input.data[0] !== 'object' || input.data[0].username == null)))){
                        input.username = this.session.info.auth.username
                        input.meta.label = source.label
                        input = [input]
                    } 
                    
                    // Unfold Appropriately
                    if (input.timestamp != null){
                            input = input.data
                    } else if (Array.isArray(input[0].data)){
                        if (typeof input[0].data[0] === 'object'){
                            if (input[0].data[0].username != null){
                                input = input.map((o) => o[0].data)
                            }
                        } 
                    } else if (input[0].data != null && typeof input[0].data === 'object' && input[0].data.username != null){
                        input = input.map((o) => o.data)
                    }

                    // }

                    // Send to Proper Port
                    let result;
                    if (targetPort != null) result = target[targetPort](input)
                    else if (target.default) result = target.default(input)
                    else console.log('no return')

                    // Update State
                    // try {
                    //     console.log(this.session.state)
                    // }

                    if (result != null && Array.isArray(result) && result.length === 1) {
                        target.state.data = result[0]
                    }
                    else target.state.data = result // Update State Externally
                    target.state.timestamp = Date.now()

                    return result
                }

                // Pass Output From Brainstorm (and automatically stream this input)
                if (sourcePort == 'brainstorm') {
                    if (sourceInfo.loop) uiParams.setupHTML.push(this._addStream(sourceInfo, appId, source.default, [callback])) // Add stream function
                    else uiParams.setupHTML.push(this._addData(sourceInfo, appId, [callback])) // Add data to listen to

                    // Add to Stream List
                    if (source.label != null) applet.streams.add(source.label) // Keep track of streams to pass to the Brainstorm
                } 

                // Otherwise Just Listen for Local Changes
                else {
                if (source.label && source.state){

                    this.state.data[source.label] = source.state

                    if (applet.subscriptions.local[source.label] == null) applet.subscriptions.local[source.label] = []

                    if (sourceInfo.loop){

                        // Check if Already Streaming
                        let found = this.findStreamFunction(source.label)

                        // If Already Streaming, Subscribe to Stream
                        if (found){
                            if (this.session.state[source.label]) applet.subscriptions.local[source.label].push(this.session.state.subscribe(source.label, callback))
                            else applet.subscriptions.local[source.label].push(this.state.subscribe(source.label, callback))
                            // console.log(this.session.state[data][source.label])
                            uiParams.setupHTML.push(() => callback(this.session.state[data][source.label]))
                        } 

                        // Otherwise Create Local Stream and Subscribe Locally
                        else {
                            this.session.addStreamFunc(source.label, source.default, this.state, false)
                            applet.subscriptions.local[source.label].push(this.state.subscribe(source.label, callback))
                        }

                    } else {
                        applet.subscriptions.local[source.label].push(this.state.subscribe(source.label, callback))
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
                this.registry.local[classId].count--
                if (this.registry.local[classId].count == 0) {

                    // Remove GUI
                    for (let fname in this.registry.local[classId].gui){
                        let folder = this.registry.local[classId].gui[fname]
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
                    delete this.registry.local[classId]
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
                        applet.subscriptions.local[label].forEach(id =>{
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

            this.registry.local[nodeInfo.class.id].callback = () => {

                if (this.session.state.data[id] != null){
                    if (callbacks){
                        let propData = this.session.getBrainstormData(applet.name,[id], 'app', 'plugin')
                        // console.log(propData, this.session.state.data)
                        callbacks.forEach(f => {
                            if (f instanceof Function) f(propData)
                        })
                    }
                }
            }


        if (found == null) {
            applet.subscriptions.session[id].push(this.session.streamAppData(id, this.registry.local[nodeInfo.class.id].state, this.registry.local[nodeInfo.class.id].callback))
        } else {
            applet.subscriptions.session[id].push(this.session.state.subscribe(id, this.registry.local[nodeInfo.class.id].callback))
        }

        // Pass Callback to Send Existing Session Data
        return () => {this.registry.local[nodeInfo.class.id].callback(this.session.state.data[id])}
            
    }

    _addStream(nodeInfo, appletId, callback, callbacks){

        let applet = this.applets[appletId]
        let id = nodeInfo.instance.label
        if (applet.subscriptions.session[id] == null) applet.subscriptions.session[id] = []
    
        let found = this.findStreamFunction(id)

        if (found == null) {
            this.session.addStreamFunc(id, callback)
        }
        
        this.registry.local[nodeInfo.class.id].callback = () => {
            if (this.session.state.data[id] != null){
                if (callbacks){
                    let propData = this.session.getBrainstormData(applet.name,[id], 'app', 'plugin')
                    callbacks.forEach(f => {
                        if (f instanceof Function) f(propData)
                    })
                }
            }
        }

        applet.subscriptions.session[id].push(this.session.state.subscribe(id, this.registry.local[nodeInfo.class.id].callback))
        
        // Pass Callback to Send Existing Stream Data
        return () => {this.registry.local[nodeInfo.class.id].callback(this.session.state.data[id])}
}

}