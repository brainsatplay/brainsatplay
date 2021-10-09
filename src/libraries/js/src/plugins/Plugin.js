
export class Plugin{

    static id = String(Math.floor(Math.random()*1000000))
    
    constructor(label, session) {

        this.label = label
        this.session = session 
        this.props = { id: String(Math.floor(Math.random() * 1000000)) }
        this.ports = {}
        this.init()

    }

    init = () => {
        // document.addEventListener("keydown", this._printDemo);
    }

    deinit = () => {

        // document.removeEventListener("keydown", this._printDemo);

    }

    _printDemo = () => {
        console.log(this.ports)
        // console.log(this, this.getEdges())
        // console.log(this, this.getNodes())
    }

    addPort = (port, info) => {
        if (this.session.graph) return this.session.graph.addPort(this,port, info)
    }

    // ----------------- Request Graph Elements -----------------
    requestNode = async (nodeInfo) => {
        if (this.session.graph) {
            let nodes = this.getNodes(nodeInfo.class)
            console.log(nodes)

            if (nodes.length > 0){
                return nodes[0] // return first node of specified type
            } else {
                let nodeInfo = await this.addNode(nodeInfo)
                return nodeInfo.instance  // returns new instance of the node
            }
        }
    }

    requestEdge = async (
        structure={
            source: {node: this, port: 'default'},
            target: {node: this, port: 'default'}
        }) => {
        if (this.session.graph) {
            let edges = this.getEdges(structure)
            console.log(nodes)

            if (edges.length > 0){
                return edges[0] // return first node of specified type
            } else {
                let nodeInfo = await this.addEdge(structure)
                return nodeInfo.instance // returns new instance of the node
            }
        }
    }

    // ----------------- Get Graph Elements -----------------
    getNodes = (node) => {
        return this.session.graph.getNodes(this.app.graph.nodes, node) // return list of matching nodes
    }

    getEdges = (structure) => {
        return this.session.graph.getEdges(structure, this.app.graph.nodes) // returns list of matching edges
    }


    // ----------------- Add Graph Elements -----------------
    addNode = async (nodeInfo) => {
        return await this.session.graph.addNode(this.app, nodeInfo)
    }

    addEdge = (structure) => {

        /* Edges can be specified in several ways: 

            1. By Labels: {source: 'eeg:atlas', target: 'neurofeedback:default'}
            2. By Classnames: {source: {name: 'EEG', port: 'atlas'}, target: {name: 'Neurofeedback', port: 'default'}}
        
        */

       return this.session.graph.addEdge(this.app, structure)
    }

    // ----------------- Remove Graph Elements -----------------
    removeEdge = (structure) => {
        // deletes and edge on the selected port of the plugin its called in 
        return this.session.graph.removeEdge(this.app, structure)
    }

    // ----------------- Manipulate Internal Ports -----------------
    removeEdge = (structure) => {
        // deletes and edge on the selected port of the plugin its called in 
        return this.session.graph.removeEdge(this.app, structure)
    }

    removePort = (port) => {
        return this.session.graph.removePort(this, port)
    }
}