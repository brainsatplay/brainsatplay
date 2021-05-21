export class PluginManager{
    constructor(session) {
        this.session = session
        this.applets = {}
    }

    add(id, name, nodes){
        let streams = []
        let outputs = {}
        nodes = nodes.map(n => new n(this.session))
        if (this.applets[id] == null) this.applets[id] = {nodes,name,streams, outputs}
    }

    start(id, responses, shared=()=>{}){

        this.applets[id].streams = []

        this.applets[id].nodes.forEach(n => {
            this.applets[id].streams.push(n.id) // Keep track of streams to pass to the Intro function
        })

        this.applets[id].nodes.forEach(n => {
            n.init(responses[n.id], shared) // Create internal event listeners
            if (n.stream) this._addStream(n.id, id, n.stream, responses[n.id], shared) // Add stream function
            else {
                this.applets[id].outputs[n.id] = n.output
                this._addData(n.id, id, responses[n.id], shared) // Add data to listen to
            }
        })

        return this.applets[id].streams
    }

    stop(id){
        let applet = this.applets[id]
        applet.streams.forEach(stream => {
            applet.session.state.unsubscribeAll(stream);
        })
    }

    // Internal Methods

    _addData(id, appletId, dataCallback, sharedCallback) {
        let applet = this.applets[appletId]
        this.session.streamAppData(id, applet.outputs[id], () => {
            dataCallback(this.session.getBrainstormData(applet.name,[id])) // Pass all user data
            sharedCallback(this.session.getBrainstormData(applet.name,applet.streams)) // Pass all app data
        })
    }

    _addStream(id, appletId, callback, dataCallback, sharedCallback){
        let applet = this.applets[appletId]
        this.session.addStreamFunc(id, callback)
        this.session.state.subscribe(id, (data) => {
            dataCallback(this.session.getBrainstormData(applet.name,[id])) // Pass all user data
            sharedCallback(this.session.getBrainstormData(applet.name,applet.streams)) // Pass all app data
        })
    }
}