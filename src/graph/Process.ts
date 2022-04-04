import { randomId } from "../common/id.utils";

export default class Process {

    static _id = randomId()
    id: string = randomId()
    processes: Map<string, Process> = new Map(); // Internal processs
    targets: {[x:string]:Process} = {}; // External processs
    parent: Process | null;
    debug: boolean;
    value: any;


    constructor(operator?: Function | any, parent: Process = null, debug: boolean = false){
        
        this.value = operator
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
    
    transform: Function = (self, input) => input

    // Basic Map Functions
    get = (id:string) => this.processes.get(id)
    set = ( id?: string, target?: any ) => {
        const process = (target instanceof Process ) ? target : new Process(target, this, this.debug)
        this.processes.set(id, process)
        process.parent = this // setting parent
        return process
    }

    delete = (id:string) => this.processes.delete(id)

    // Subscribe to Another Process's Output
    subscribe = (
        target?: Process | Function, // External or Exposed Process
    ) => {

        let process;
        if (target instanceof Process ) process = target
        else if (target instanceof Function) process = new Process(target, this.parent, this.debug) // set parent
        else return null

        // Step #2: Register Edge
        if (!(process.id in this.targets)) this.targets[process.id] = process

        return process.id
    }

    unsubscribe = (id:string) => {
        delete this.targets[id] // Remove edge with target process
    }


    // Internal Process Management
    // TODO: When is this actually useful?
    add = (process: Process) => {

        // Initialize Parent
        if (!process.parent) {
            process.parent = this
            // this.targets[process.id] = process
        } 
        
        // Catch Existing Parent
        else {
            if (process.parent === this) console.error('Process is already within this parent...')
            else console.error('Process already has another parent...')
        }
    }

    remove = (id:string) => {
        delete this.targets[id] // Remove edge with target process
    }


    // --------------------- CALLBACKS ---------------------
    oninit: (self?:Process) => void = () => {};
    ondeinit: (self?:Process) => void = () => {};
    onconnect: (self?:Process) => void = () => {};
    ondisconnect: (self?:Process) => void = () => {};
    onresize: (self?:Process) => void = () => {};


    // --------------------- Push Data In ---------------------
    run = async (input:any) => {
        console.log('Running ' + this.id)
        return await this._onrun(input)
    }

    _onrun: (input:any) => void = async (input) => {

        // Step #1: Transform Inputs into Single Output
        // if (this.debug) console.log(`Input (${this.id}) : ${input}`)
        let output;
        if (this.value instanceof Function) {
            output = this.value(this.parent, input) // Parent contains all the information
        } else {
            // if (this.debug) console.log(`Previous Value (${this.id}) : ${this.value}`)
            this.value = input // set value as input if appropriate
            output = this.value
            // if (this.debug) console.log(`New Value (${this.id}) : ${this.value}`)
        }
        // if (this.debug) console.log(`Output (${this.id}) : ${output}`)

        // Step #2: Pass Output to Connected Processs
        const keys = Object.keys(this.targets)
        if (keys.length > 0) {
            const promises = keys.map(id => this.targets[id].run(output))
            return await Promise.all(promises)
        } else return output
    };


    // ------------- Helper Functions -------------

    // List the structure of the processes
    list = (el: HTMLElement) => {

        const list = document.createElement('ul')
        this.processes.forEach((process,k) => {
            const li = document.createElement('li')
            li.innerHTML = `${k} - ${process.id}`
            process.list(li)
            list.insertAdjacentElement('beforeend', li)
        })
        el.insertAdjacentElement('beforeend', list)

    }

    // Export to a JSONifiable object
    export = () => {
        const o = {
            id: this.id, 
            targets: [], 
            processes: {}, 
            value: this.value
        }

        this.processes.forEach((process,k) => o.processes[k] = process.export())
        for (let k in this.targets) {
            console.log('Export Target', k)
            o.targets.push(k)
        }

        return o
    }

    // Load a parsed JSON Process
    load = (
        o:any = {}, 
        registry =  {
            processes: {},
            targets: {}
        }
    ) => {
        
        registry.processes[o.id] = this
        registry.targets[o.id] = []

        // Instantiate Internal Processes
        if (o?.processes){
            for (let k in o.processes) {
                const p = new Process(null, this, this.debug)
                p.load(o.processes[k], registry)
                this.set(k, p)
            }
        }

        registry.targets[o.id] = o.targets

        // Link to External Targets
        registry.targets[o.id] = o.targets

        // Instantiate Links (if top)
        if (!this.parent) for (let id in registry.targets) {
            registry.targets[id].forEach(targetId => {
                registry.processes[id].subscribe(registry.processes[targetId])
            })
        }

        this.value = o.value
    }
}