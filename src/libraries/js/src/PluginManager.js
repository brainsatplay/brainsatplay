export class PluginManager{
    constructor(session) {
        this.session = session
        this.applets = {}
        this.registry = {}
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
            if (this.registry[n.id] == null){
                this.registry[n.id] = {count: 0, output: null}
                this.registry[n.id].output = n.output
            }

            // Add Listeners
            if (n.stream) this._addStream(n.id, id, n.stream, responses[n.id], shared) // Add stream function
            else this._addData(n.id, id, responses[n.id], shared) // Add data to listen to

            this.registry[n.id].count++
        })

        return this.applets[id].streams
    }

    stop(id){
        let applet = this.applets[id]
        applet.streams.forEach(stream => {
            this.registry[stream].count--
            if (this.registry[stream].count == 0) {
                delete this.registry[stream]
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
        applet.subscriptions[id] = this.session.streamAppData(id, this.registry[id], () => {
            if (this.session.state.data[id] != null){
                if (dataCallback instanceof Function) dataCallback(this.session.getBrainstormData(applet.name,[id])) // Pass all user data
                if (sharedCallback instanceof Function) sharedCallback(this.session.getBrainstormData(applet.name,applet.streams)) // Pass all app data
            }
        })
    }

    _addStream(id, appletId, callback, dataCallback, sharedCallback){
        let applet = this.applets[appletId]
        this.session.addStreamFunc(id, callback)
        applet.subscriptions[id] = this.session.state.subscribe(id, (data) => {
            if (this.session.state.data[id] != null){
                if (dataCallback instanceof Function) dataCallback(this.session.getBrainstormData(applet.name,[id])) // Pass all user data
                if (sharedCallback instanceof Function) sharedCallback(this.session.getBrainstormData(applet.name,applet.streams)) // Pass all app data
            }
        })
    }
}