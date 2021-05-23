export class PluginManager{
    constructor(session) {
        this.session = session
        this.applets = {}
        this.registry = {local: {}, brainstorm: {}}

        // Listen for Added/Removed States (Not Yours...)
        this.session.state.addToState('update',this.session.state.update, (update) => {
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

    add(id, name, pluginDict){
        let streams = []
        let outputs = {}
        let subscriptions = {}

        // Don't Distinguish between Categories (yet...)
        let plugins = {}
        for (let key in pluginDict){
            plugins[key] = pluginDict[key].map(plugin => {
                return new plugin(this.session)
            })
        }

        if (this.applets[id] == null) this.applets[id] = {plugins,name,streams, outputs,subscriptions}
    }

    start(id){

        this.applets[id].streams = []

        let uiArray = []
        let uiParams = {
            HTMLtemplate: '',
            setupHTML: [],
            responses: {},
            shared: []
        }

        this.applets[id].plugins.ui.forEach(n => {
            uiArray.push(n.init())
        })

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

        this.applets[id].plugins.processing.forEach(n => {
            n.init() // Create internal event listeners
            this.applets[id].streams.push(n.id) // Keep track of streams to pass to the Intro function
            
            // Create Output to Listen To
            if (this.registry.local[n.id] == null){
                this.registry.local[n.id] = {count: 0, output: null, callback: ()=>{}}
                this.registry.local[n.id].output = n.output
            }

            // Listen to Output
            if (n.output != null || n.stream != null){
                if (n.stream) this._addStream(n.id, id, n.stream, uiParams.responses[n.id], uiParams.shared) // Add stream function
                else this._addData(n.id, id, uiParams.responses[n.id], uiParams.shared) // Add data to listen to
            }
            
            this.registry.local[n.id].count++
        })

        return {uiParams: uiParams, streams:this.applets[id].streams}
    }

    stop(id){
        let applet = this.applets[id]

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
        for (let key in this.applets[id].plugins){
            this.applets[id].plugins[key].forEach(plugin => plugin.deinit())
        }

        delete this.applets[id]
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
        applet.subscriptions[id] = this.session.streamAppData(id, this.registry.local[id].output, this.registry.local[id].callback)
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