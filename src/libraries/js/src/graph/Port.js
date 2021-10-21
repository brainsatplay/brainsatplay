export class Port {
    constructor (node, name, settings,
        //  onchange = (newValue) => {}
         ) {
        
        // Default Port Metadata
        this.meta = {}

        Object.assign(this, settings) // backwards compatibility (< 0.0.36)

        this.name = name
        this.uuid = String(Math.floor(Math.random()*1000000))

        this.node = node;

        this.onchange = settings.onchange ?? settings.onUpdate // backwards compatibility (< 0.0.36)
        this.edges = {
            input: new Map(),
            output: new Map()
        };        
        
        this.value = settings.data 

        // Autoset Output Type
        if (this.output?.type === 'auto') this.output = this._getTypeDict(this.value)

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
            el.setAttribute('data-node', this.node.uuid)
            el.setAttribute('data-port', this.name)

            // Listen for clicks to draw SVG edge
            el.onpointerdown = (e) => {
                this.connect(this)
            }

            this.ui[s].insertAdjacentElement('beforeend', el)
        })

        this.ui.label.innerHTML = `<span>${this.name}</span>`
        this.ui.label.classList.add('node-label')
        this.ui.label.setAttribute('name', this.name)

        this.ui.latency.setAttribute('name', this.name)
        this.ui.latency.classList.add('latency-display')
        this.ui.label.insertAdjacentElement('beforeend', this.ui.latency)
    }


    connect(targetPort=this, sourcePort) {


        let e = {}
        e['target'] = {}
        e['target'].node = targetPort.node
        e['target'].port = targetPort

        if (sourcePort){
            e['source'] = {}
            e['source'].node = sourcePort.node
            e['source'].port = sourcePort
        } 

        this.node.parent.addEdge(e)

    }

    checkForUpdates() {

    }

    init = () => {}

    deinit = () => {
        // Remove UI
        for (let key in this.ui){ this.ui[key].remove() }
    }

    // Only Set when Different
    set = async (port=this, forceUpdate = false) => {

        let portCopy = this._copy(port) // avoids mutating original port object

        // Add Metadata
        if (!(portCopy.meta)) portCopy.meta = {}
        portCopy.meta.source = port // allows tracing where data has arrived from

        // Add User Data
        if (!('id' in portCopy)) portCopy.id = this.node.session?.info?.auth?.id
        if (!('username' in portCopy)) portCopy.username = this.node.session?.info?.auth?.username

        return await this._onchange(portCopy);
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

    _onchange = async (port) => {
        let tick = performance.now()

        port.data = port.value ?? port.data // backwards compatibility (< 0.0.36)
        port.value = port.data

        let res = (this.onchange instanceof Function) ? await this.onchange(port) : port // set in constructor


        let tock = performance.now()
        let latency = tock - tick
        this.latency.shift()
        this.latency.push(latency)

        if (res) await this.update(res)

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

    update = async (port) => {
        port.value = port.data // backwards compatibility (< 0.0.36) TODO: Test edge-cases

        // Check if Equal to Previous Value
        let case1,case2
        if (typeof port.value === 'object' || typeof port.value === 'function'){
            case1 = this.value
            case2 = port.value
        } else {
            case1 = JSON.stringifyFast(this.value)
            case2 = JSON.stringifyFast(port.value)
        } 
        
        let thisEqual = case1 === case2

        // Update Edges
        if (!thisEqual || port.forceUpdate){

            this.value = port.value
            this.data = port.data
            this.meta = port.meta

            // Run Across Edges
            this.edges.output.forEach(o => {o.update()})
        } else {
            // console.log('NO CHANGE')
        }
    }

    setLatency = (val) => {

        // Animate Latency
        let pct = Math.min(1,val/1)

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

    _getTypeDict = (val) => {
        let typeDict = {type: val}
        if (typeDict.type != null){

            // Catch Objects
            if (typeDict.type instanceof Object) {

                // Catch Arrays
                if (Array.isArray(typeDict.type)) typeDict.type = Array

                // Catch Other Object Types
                else {
                    typeDict.type = Object
                    typeDict.name = val.name ?? typeDict.type.name
                }
            }
            else typeDict.type = typeof typeDict.type
        }
        return typeDict
    }
}