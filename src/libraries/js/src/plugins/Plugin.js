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

    addNode = (classname) => {
        this.session.graph.addNode(this.app, {id: classname, class: this.session.graph.allplugins[classname]})

    }

    addEdge = (edge) => {
        this.session.graph.addEdge(this.app, edge)
    }

    removePort = () => {

    }
}