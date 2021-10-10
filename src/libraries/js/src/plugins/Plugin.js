
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
    requestNode = async (nodeType) => {
        if (this.session.graph) {
            let nodes = this.getNodes(nodeType)
            console.log(nodes)

            if (nodes.length > 0){
                return nodes[0] // return first node of specified type
            } else {
                let nodeInfo = await this.addNode(nodeType)
                return nodeInfo.instance  // returns new instance of the node
            }
        }
    }

    //hey look it makes actual sense now
    requestEdge = async (
        sourceNode,
        sourcePort,
        targetPort) => {
        if (this.session.graph) {
            let node = this.getNode(sourceNode);
            let edges = this.getEdges(node, this.app)
            console.log(nodes)

            let nodeInfo = await this.addEdge(source={node:sourceNode,port:sourcePort},target={node:this.label, port:targetPort});
        }
    }


    // ----------------- Get Graph Elements -----------------
    //get list of nodes by label or class name
    getNodes = (nodeType) => {
        return this.session.graph.getNodes(nodeType, this.app.graph.nodes) // return list of matching nodes
    }

    //pass specific node uuid
    getNode = (uuid) => {
        return this.session.graph.getNode(uuid,this.app);
    }

    getPorts = (uuid) => {
        return this.session.graph.getNode(uuid,this.app).ports;
    }
    /* Edges can be specified in several ways: 

        1. By Labels: structure = {source: 'eeg:atlas', target: 'neurofeedback:default'}
        2. By Classnames: structure = {source: {name: 'EEG', port: 'atlas'}, target: {name: 'Neurofeedback', port: 'default'}}
    
    */

    //get a single edge on the graph based on the specified parameters
    getEdge = (source={node:'',port:''},target={node:'',port:''}) => {
        return this.session.graph.getEdge(source, target, this.app); // returns list of matching edges
    }

    //pass node class name, label or uuid
    getEdges = (targetNode) => {
        return this.session.graph.getEdges(targetNode, this.app); // returns list of matching edges
    }


    // ----------------- Add Graph Elements -----------------
    addNode = async (nodeType) => {
        return await this.session.graph.addNode(nodeType, this.app);
    }

    addEdge = (source={node:'',port:''},target={node:'',port:''}) => {
        let structure = { source:source, target:target};
       return this.session.graph.addEdge(structure,this.app);
    }

    // ----------------- Remove Graph Elements -----------------
    removeEdge = (source={node:'',port:''},target={node:'',port:''}) => {
        // deletes and edge on the selected port of the plugin its called in 
        let structure = { source:source, target:target};
        return this.session.graph.removeEdge(structure, this.app)
    }

    // ----------------- Manipulate Internal Ports -----------------
    removePort = (port) => {
        return this.session.graph.removePort(this, port)
    }
}