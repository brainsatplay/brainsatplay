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
        let subscriptions = {}

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
            let node = applet.nodes[id].instance
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
            
            
            if (node.state != null || node.stream != null){
                if (node.stream) this._addStream(node.output, appId, node.stream, uiParams.responses[node.output], uiParams.shared) // Add stream function
                else this._addData(node.output, appId, uiParams.responses[node.output], uiParams.shared) // Add data to listen to
            }

            this.registry.local[node.output].count++
        }

        // Start Graphs
        applet.edges.forEach((e,i) => {

                let source = applet.nodes[e.source].instance
                let target = applet.nodes[e.target].instance

                let callback = (input) => {
                    // Update Listener
                    let update = target.filter(input)
                }
                
                if (source.state) this.session.state.subscribe(source.output, callback)
                else console.log('source has nothing to listen to')
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
                this.session.removeStreaming(stream, applet.subscriptions[stream]);
            }
        })

        // Deinit Plugins
        console.log(this.applets[appId].nodes)
        for (let key in this.applets[appId].nodes){
            this.applets[appId].nodes[key].instance.deinit()
        }

        delete this.applets[appId]
    }

    // Internal Methods

    _addData(id, appletId, dataCallbacks, sharedCallbacks) {

        let applet = this.applets[appletId]

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
        applet.subscriptions[id] = this.session.streamAppData(id, this.registry.local[id].state, this.registry.local[id].callback)
    }

    _addStream(id, appletId, callback, dataCallbacks, sharedCallbacks){
        let applet = this.applets[appletId]
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

        applet.subscriptions[id] = this.session.state.subscribe(id, this.registry.local[id].callback)
    }

}