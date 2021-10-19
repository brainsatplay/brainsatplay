export class Port {
    constructor (node, name, settings,
        //  onchange = (newValue) => {}
         ) {
        
        // Default Port Metadata
        this.meta = {}

        Object.assign(this, settings) // backwards compatibility (< 0.0.36)

        this.name = name
        this.id = String(Math.floor(Math.random()*1000000))

        this.node = node;

        this.onchange = settings.onchange ?? settings.onUpdate // backwards compatibility (< 0.0.36)
        this.edges = {
            input: [],
            output: []
        };        
        
        this.value = settings.data 

        // METADATA
        this.latency = Array.from({length: 20}, e => 0)


        // UI
        this.ui = {
            label: document.createElement('div'),
            input: {},
            output: {},
            latency: document.createElement('div')
        }

        let portTypes = Object.keys(this.edges)
        portTypes.forEach(s => {
            let nodeType
            let portInfo = this[s]
            nodeType = portInfo?.type
            if (nodeType instanceof Object) nodeType = portInfo.name ?? nodeType?.name
            this.ui[s] = document.createElement('div')
            this.ui[s].classList.add(`node-port-wrapper`)
            let el = document.createElement('div')
            el.classList.add(`node-port`)
            el.classList.add(`port-${this.name}`)
            el.classList.add(`type-${nodeType}`)
            el.setAttribute('data-node', this.node.id)
            el.setAttribute('data-port', this.name)
            this.ui[s].insertAdjacentElement('beforeend', el)
        })

        this.ui.label.innerHTML = `<span>${this.name}</span>`
        this.ui.label.classList.add('node-label')
        this.ui.label.setAttribute('name', this.name)

        this.ui.latency.setAttribute('name', this.name)
        this.ui.latency.classList.add('latency-display')
        this.ui.label.insertAdjacentElement('beforeend', this.ui.latency)
    }

    connect(e) {
        this.plugin.graph.addEdge(e)
    }

    checkForUpdates() {

    }

    init = () => {}

    deinit = () => {
        // Remove UI
        for (let key in this.ui){ this.ui[key].remove() }
    }

    // Only Set when Different
    set = (port=this, forceUpdate = false) => {
        return this._onchange(port);
    }

    get = () => {
        return this.value;
    }

    _onchange = (port) => {
        let tick = performance.now()

        port.data = port.value ?? port.data // backwards compatibility (< 0.0.36)
        port.value = port.data // backwards compatibility (< 0.0.36)

        let res = (this.onchange instanceof Function) ? this.onchange(port) : port // set in constructor
        let tock = performance.now()
        let latency = tock - tick
        this.latency.shift()
        this.latency.push(latency)

        // Update Edges
        if (this.value != port.value){
            this.value = this.data = port.value // backwards compatibility (< 0.0.36)

            // Run Across Edges
            this.edges.output.forEach(o => {o.update()})
        } else {
            // console.log('NO CHANGE')
        }


        return res
    }

    getLatency = () => {
        return this.latency.reduce((a,b) => a + b) / this.latency.length
    }
}