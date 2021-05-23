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

    add(id, name, nodes){
        let streams = []
        let outputs = {}
        let subscriptions = {}
        nodes = nodes.map(n => new n(this.session))
        if (this.applets[id] == null) this.applets[id] = {nodes,name,streams, outputs,subscriptions}
    }

    start(id, responses, shared){

        this.applets[id].streams = []

        this.applets[id].nodes.forEach(n => {
            n.init() // Create internal event listeners
            this.applets[id].streams.push(n.id) // Keep track of streams to pass to the Intro function

            // Create Output to Listen To
            if (this.registry.local[n.id] == null){
                this.registry.local[n.id] = {count: 0, output: null, callback: ()=>{}}
                this.registry.local[n.id].output = n.output
            }

            // Add Listeners
            if (n.stream) this._addStream(n.id, id, n.stream, responses[n.id], shared) // Add stream function
            else this._addData(n.id, id, responses[n.id], shared) // Add data to listen to

            this.registry.local[n.id].count++
        })

        return this.applets[id].streams
    }

    stop(id){
        let applet = this.applets[id]
        applet.streams.forEach(stream => {
            this.registry.local[stream].count--
            if (this.registry.local[stream].count == 0) {
                delete this.registry.local[stream]
                this.session.removeStreaming(stream);
            } else {
                this.session.removeStreaming(stream, applet.subscriptions[stream]);
            }
        })
        delete this.applets[id]
    }

    // Internal Methods

    _addData(id, appletId, dataCallback, sharedCallback) {
        let applet = this.applets[appletId]

        this.registry.local[id].callback = () => {
            console.log(id + ' changed')
            if (this.session.state.data[id] != null){
                if (dataCallback instanceof Function) dataCallback(this.session.getBrainstormData(applet.name,[id])) // Pass all user data
                if (sharedCallback instanceof Function) sharedCallback(this.session.getBrainstormData(applet.name,applet.streams)) // Pass all app data
            }
        }
        applet.subscriptions[id] = this.session.streamAppData(id, this.registry.local[id].output, this.registry.local[id].callback)
    }

    _addStream(id, appletId, callback, dataCallback, sharedCallback){
        let applet = this.applets[appletId]
        this.session.addStreamFunc(id, callback)

        this.registry.local[id].callback = () => {
            if (this.session.state.data[id] != null){
                if (dataCallback instanceof Function) dataCallback(this.session.getBrainstormData(applet.name,[id])) // Pass all user data
                if (sharedCallback instanceof Function) sharedCallback(this.session.getBrainstormData(applet.name,applet.streams)) // Pass all app data
            }
        }

        applet.subscriptions[id] = this.session.state.subscribe(id, this.registry.local[id].callback)
    }
}