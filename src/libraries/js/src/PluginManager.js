// Managers
import { StateManager } from './ui/StateManager'

export class PluginManager{
    constructor(session) {
        this.session = session
        this.applets = {}
        this.registry = {local: {}, brainstorm: {}}
        this.state = new StateManager() // For graphs

        console.log(this.state)

        // Listen for Added/Removed States
        this.session.state.addToState('update',this.session.update, (update) => {
            if (update.added){
                // Apply Proper Stream Callback
                for (let s in this.registry.local){
                    update.buffer.forEach(k => {
                        if (this.registry.brainstorm[k] == null){
                                if (k.includes(s) && k !== s){
                                this.registry.brainstorm[k] = {count: 1, output: null, id: this.session.state.subscribe(k, this.registry.local[s].callback), callback: this.registry.local[s].callback}
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
                    }
                })
            }

            update.added = ''
            update.removed = ''
            update.buffer.clear()
        })
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
            g.edges.forEach(e => {
                edges.push(e)
            })

            // NOTE: Does this Merge Graphs?
            g.nodes.forEach(node => {
                if (nodes[node.id] == null){
                    nodes[node.id] = node
                    nodes[node.id].instance = new node.class(this.session)
                }
            })
        })

        // Declare Applet Info
        if (this.applets[id] == null) this.applets[id] = {nodes, edges, name,streams, outputs,subscriptions}
    }

    start(appId){

        let applet =  this.applets[appId]

        applet.streams = new Set()

        let uiArray = []
        let uiParams = {
            HTMLtemplate: '',
            setupHTML: [],
            responses: {},
            shared: []
        }

        let initializedNodes = []

        // Get UI Components from Nodes
        for (let id in applet.nodes){
            let node = applet.nodes[id]
            if (!initializedNodes.includes(node.id)){
                let ui = node.instance.init(node.params)
                if (ui != null) uiArray.push(ui)
                initializedNodes.push(node.id)
            }
        }

        uiArray.forEach((o) => {
            if (o.HTMLtemplate instanceof Function) o.HTMLtemplate = o.HTMLtemplate()
            uiParams.HTMLtemplate += o.HTMLtemplate
            uiParams.setupHTML.push(o.setupHTML)
            for (let key in o.responses){
                if (uiParams.responses[key] == null) uiParams.responses[key] = []
                uiParams.responses[key].push(o.responses[key])
            }
            uiParams.shared.push(o.shared)
        })

        // Initialize the Rest of the Nodes
        for (let id in applet.nodes){
            let nodeInfo =  applet.nodes[id]
            let node = nodeInfo.instance
            if (!initializedNodes.includes(id)){
                node.init() // Create internal event listeners
            }

            // Add to Registry
            if (this.registry.local[node.output] == null){
                this.registry.local[node.output] = {count: 0, state: null, callback: ()=>{}}
                this.registry.local[node.output].state = node.state
            }

            // Add to Streams
            if (node.output != null) applet.streams.add(node.output) // Keep track of streams to pass to the Intro function
            
            if (nodeInfo.stream){
                if (nodeInfo.loop) this._addStream(node.output, appId, node.update, uiParams.responses[node.output], uiParams.shared) // Add stream function
                else this._addData(node.output, appId, uiParams.responses[node.output], uiParams.shared) // Add data to listen to
            }

            this.registry.local[node.output].count++
        }

        // Start Graphs
        applet.edges.forEach((e,i) => {

                let sourceInfo = applet.nodes[e.source]
                let source = sourceInfo.instance
                let target = applet.nodes[e.target].instance

                let callback = (input) => {
                    if (target.update) target.update(input)
                }
                
                if (source.output && source.state){

                    this.state.data[source.output] = source.state

                    if (applet.subscriptions.local[source.output] == null) applet.subscriptions.local[source.output] = []

                    if (sourceInfo.loop){
                        // Check if Already Streaming
                        let found = this.session.streamObj.streamTable.find((d => {
                            if (d.prop === source.output) {
                                return d
                            }
                        }))

                        // If Already Streaming, Subscribe to Session
                        if (found){
                            applet.subscriptions.local[source.output].push(this.session.state.subscribe(source.output, callback))
                        } 
                        // Otherwise Subscribe to Local
                        else {
                            this.session.addStreamFunc(source.output, source.update, this.state)
                            applet.subscriptions.local[source.output].push(this.state.subscribe(source.output, callback))
                        }
                    } else {
                        applet.subscriptions.local[source.output].push(this.state.subscribe(source.output, callback))
                    }
                }
         })

        return {uiParams: uiParams, streams:this.applets[appId].streams}
    }

    stop(appId){
        let applet = this.applets[appId]

        // Remove Listeners
        applet.streams.forEach(stream => {
            this.registry.local[stream].count--
            if (this.registry.local[stream].count == 0) {
                delete this.registry.local[stream]
                this.session.removeStreaming(stream);
            } else {
                applet.subscriptions.session[stream].forEach(id =>{
                    this.session.removeStreaming(stream, id);
                })

                applet.subscriptions.local[stream].forEach(id =>{
                    this.session.removeStreaming(stream, id);
                })
            }
        })

        // Deinit Plugins
        for (let key in this.applets[appId].nodes){
            this.applets[appId].nodes[key].instance.deinit()
        }

        delete this.applets[appId]
    }

    // Internal Methods

    _addData(id, appletId, dataCallbacks, sharedCallbacks) {

        let applet = this.applets[appletId]
        if (applet.subscriptions.session[id] == null) applet.subscriptions.session[id] = []

        this.registry.local[id].callback = () => {
            if (this.session.state.data[id] != null){
                let propData = this.session.getBrainstormData(applet.name,[id])
                dataCallbacks.forEach(f => {
                    if (f instanceof Function) f(propData)
                })

                let allData = this.session.getBrainstormData(applet.name,applet.streams)
                sharedCallbacks.forEach(f => {
                    if (f instanceof Function) f(allData)
                })
            }
        }
        applet.subscriptions.session[id].push(this.session.streamAppData(id, this.registry.local[id].state, this.registry.local[id].callback))
    }

    _addStream(id, appletId, callback, dataCallbacks, sharedCallbacks){

        let applet = this.applets[appletId]
        if (applet.subscriptions.session[id] == null) applet.subscriptions.session[id] = []

        this.session.addStreamFunc(id, callback)

        this.registry.local[id].callback = () => {
            if (this.session.state.data[id] != null){
                let propData = this.session.getBrainstormData(applet.name,[id])
                dataCallbacks.forEach(f => {
                    if (f instanceof Function) f(propData)
                })

                let allData = this.session.getBrainstormData(applet.name,applet.streams)
                sharedCallbacks.forEach(f => {
                    if (f instanceof Function) f(allData)
                })
            }
        }

        applet.subscriptions.session[id].push(this.session.state.subscribe(id, this.registry.local[id].callback))
    }

}