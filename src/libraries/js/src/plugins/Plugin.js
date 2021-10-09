
export class Plugin{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session) {

        this.label = label
        this.session = session 
        this.props = { id: String(Math.floor(Math.random() * 1000000)) }
        this.ports = {}

    }

    init = () => {

    }

    deinit = () => {

    }

    addPort = (port, info) => {
        if (this.session.graph) this.session.graph.addPort(this,port, info)
    }

    addNode = (classname) => {s
        if (this.session.graph) this.session.graph.addNode(this.app, {id, class:classname})
    }

    addEdge = (structure) => {

        /* Edges can be specified in several ways: 

            1. By Labels: {source: 'eeg:atlas', target: 'neurofeedback:default'}
            2. By Classnames: {source: {name: 'EEG', port: 'atlas'}, target: {name: 'Neurofeedback', port: 'default'}}

        
        */

       if (this.session.graph) return this.session.graph.addEdge(this.app, structure)
    }

    removeEdge = (structure) => {
        // deletes and edge on the selected port of the plugin its called in 
        if (this.session.graph) return this.session.graph.removeEdge(this.app, structure)
    }

    getNodes = (node) => {

        // returns a list of nodes on the graph of the specified type
        if (this.session.graph) return this.session.graph.getNodes(this.app, node)

    }
    getEdges = (port) => {
        // requests edges from a port if its available from the graph
        if (this.session.graph) return this.session.graph.getEdges(this, port)

    }

    removePort = () => {

    }
}