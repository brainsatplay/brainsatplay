import { randomId } from "./utils";

export default class Graph {

    static _id = randomId()
    id: string = randomId()
    internal: Map<string, Graph> = new Map(); // Internal graphs
    external: {[x:string]:Graph} = {}; // External graphs
    parent: Graph | null;
    debug: boolean;
    value: any;


    constructor(transform?: Function | any, parent: Graph = null, debug: boolean = false){
        
        this.value = transform
        if (parent) parent.add(this)

        this.debug = debug
    }

    // --------------------- METHODS ---------------------
    init = () => { 
        window.addEventListener('resize', this.resize)
        this.oninit() // specified by user
    }

    deinit = () => { 
        window.removeEventListener('resize', this.resize)
        this.ondeinit() // specified by user
    }
    
    resize = ()  => { this.onresize() }
    
    transform: Function = (input, self) => input

    // Basic Map Functions
    get = (id:string) => this.internal.get(id)
    set = ( id?: string, target?: any ) => {
        const graph = (target instanceof Graph ) ? target : new Graph(target, this, this.debug)
        this.internal.set(id, graph)
        graph.parent = this // setting parent
        return graph

    }

    delete = (id:string) => this.internal.delete(id)

    // Subscribe to Another Graph's Output
    subscribe = (
        target?: Graph | Function, // External or Exposed Graph
    ) => {

        let graph;
        if (target instanceof Graph ) graph = target
        else if (target instanceof Function) graph = new Graph(target, this.parent, this.debug) // set parent
        else return null

        // Step #2: Register Edge
        if (!(graph.id in this.external)) this.external[graph.id] = graph

        return graph.id
    }

    unsubscribe = (id:string) => {
        delete this.external[id] // Remove edge with target graph
    }


    // Internal Graph Management
    add = (graph: Graph) => {
        console.log(graph.parent)

        // Initialize Paren t
        if (!graph.parent) {
            graph.parent = this
            this.external[graph.id] = graph
        } 
        
        // Catch Existing Parent
        else {
            if (graph.parent === this) console.error('Graph is already within this parent...')
            else console.error('Graph already has another parent...')
        }
    }

    remove = (id:string) => {
        delete this.external[id] // Remove edge with target graph
    }


    // --------------------- CALLBACKS ---------------------
    oninit: (self?:Graph) => void = () => {};
    ondeinit: (self?:Graph) => void = () => {};
    onconnect: (self?:Graph) => void = () => {};
    ondisconnect: (self?:Graph) => void = () => {};
    onresize: (self?:Graph) => void = () => {};


    // --------------------- Push Data In ---------------------
    push = async (input:any) => {
        return await this._onpush(input)
    }
    _onpush: (input:any) => void = async (input) => {

        // Step #1: Transform Inputs into Single Output
        // if (this.debug) console.log(`Input (${this.id}) : ${input}`)
        let output;
        if (this.value instanceof Function) {
            output = this.value(input, this.parent) // Parent contains all the information
        } else {
            // if (this.debug) console.log(`Previous Value (${this.id}) : ${this.value}`)
            this.value = input // set value as input if appropriate
            output = this.value
            // if (this.debug) console.log(`New Value (${this.id}) : ${this.value}`)
        }
        // if (this.debug) console.log(`Output (${this.id}) : ${output}`)

        // Step #2: Pass Output to Connected Graphs
        const keys = Object.keys(this.external)
        if (keys.length > 0) {
            const promises = keys.map(id => this.external[id].push(output))
            return await Promise.all(promises)
        } else return output
    };
}