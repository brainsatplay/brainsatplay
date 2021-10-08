
export class Plugin{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session) {
        this.label = label
        this.session = session 
        this.props = { id: String(Math.floor(Math.random() * 1000000)) }
        this.ports = {}
    }

    init = () => {}

    deinit = () => {}

    addPort = (port, info) => {
        this.session.graph.addPort(this,port, info)
    }

    addNode = (classname) => {s
        this.session.graph.addNode(this.app, {id, class:classname})
    }

    addEdge = (edge) => {
        this.session.graph.addEdge(this.app, edge)
    }

    // deleteEdge(port) deletes and edge on the selected port of the plugin its called in 
    // requestNode(type) returns a list of nodes on the graph of the specified type
    // requestEdge(node) requests an edge from a port if its available from the

    removePort = () => {

    }
}