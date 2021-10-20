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
            input: new Map(),
            output: new Map()
        };        
        
        this.value = settings.data 

        // METADATA
        this.latency = Array.from({length: 20}, e => 0)
        this.label = (this.name === 'default') ? this.node.name : `${this.node.name}_${this.name}`

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

        // Copy Input
        port = this._copy(port)

        // Add Default Metadata
        if (!(port.meta)) port.meta = {}
        port.meta.source = port

        return this._onchange(port);
    }

    get = () => {
        return this.value;
    }

    _copy(input){
        let inputCopy = []
        
        let isArray = Array.isArray(input)
        if (!isArray) input = [input]

        input.forEach(u => {
            inputCopy.push(Object.assign({}, u))
            for (let key in u){
                if (u[key] != null && u[key].constructor == Object){
                    u[key] = Object.assign({}, u[key])
                }
            }
        })

        if (!isArray) inputCopy = inputCopy[0]
        return inputCopy
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

        if (res){
            if (!(res instanceof Object)) console.error(res, this.node, this, port)
            res.value = res.data // backwards compatibility (< 0.0.36) TODO: Test edge-cases

            // Update Edges
            if (this.value != res.value){
                this.value = this.data = res.value // backwards compatibility (< 0.0.36)

                // Run Across Edges
                this.edges.output.forEach(o => {o.update()})
            } else {
                // console.log('NO CHANGE')
            }
        }

        return res
    }

    animate = (side) => {
        let el = this.ui[side].children[0]

        this.setLatency(this.getLatency())

        // Animate Port
        el.classList.add('updated')
        el.setAttribute('data-update', Date.now())
        setTimeout(()=>{
            if (el.getAttribute('data-update') < Date.now() - 450){
                el.classList.remove('updated')
            }
        }, 500)
    }

    setLatency = (val) => {

        // Animate Latency
        let pct = Math.min(1,val/.1)

        let map = [
            { pct: 0.0, color: { r: 0x39, g: 0xff, b: 0x14 } },
            { pct: 0.5, color: { r: 0xfa, g: 0xed, b: 0x27 } },
            { pct: 1.0, color: { r: 0xff, g: 0x14, b: 0x39 } } 
        ];
        
        this.ui.latency.style.width = `${pct*100}%`
        this.ui.latency.style.background = this._getColorfromMap(pct, map)
    }

    getLatency = () => {
        return this.latency.reduce((a,b) => a + b) / this.latency.length
    }

    // Animation Helper Functions
    _getColorfromMap = (pct, map) => {
        for (var i = 1; i < map.length - 1; i++) {
            if (pct < map[i].pct) {
                break;
            }
        }
        var lower = map[i - 1];
        var upper = map[i];
        var range = upper.pct - lower.pct;
        var rangePct = (pct - lower.pct) / range;
        var pctLower = 1 - rangePct;
        var pctUpper = rangePct;
        var color = {
            r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
        // or output as hex if preferred
    };
}