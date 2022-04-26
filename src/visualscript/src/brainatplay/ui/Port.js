// Code Editor
import {LiveEditor} from './LiveEditor'

export class Port {
    constructor (node, name, info={}) {
        
        // Default Port Metadata
        this.meta = {}
        this.info = info
        this.name = name
        this.uuid = String(Math.floor(Math.random()*1000000))

        this.node = node;

        this.edges = {
            input: new Map(),
            output: new Map()
        };      

        // METADATA
        this.latency = Array.from({length: 20}, e => 0)
        this.label = (this.name === 'default') ? this.node.name : `${this.node.name}_${this.name}`

        // UI
        this.ui = {
            label: document.createElement('div'),
            input: {},
            output: {},
            latency: document.createElement('div'),
            value: {
                code: null,
                editor: () => {if (['Function', 'HTML', 'CSS', 'GLSL'].includes(this.getType())) this.createValueEditor()},
            },
            self: {
                code: null,
                editor: () => {this.createSelfEditor()}
            },
            gui: {
                container: null,
                input: null
            }
        }

        this._createElements() // NOT ON DEMAND
    }

    _createElements = () => {
        Object.keys(this.edges).forEach(s => {
            this.ui[s] = document.createElement('div')
            this.ui[s].classList.add(`node-port-wrapper`)
            let el = document.createElement('div')

            // Listen for clicks to draw SVG edge
            el.onpointerdown = (e) => {
                if (s === 'output') this.connect({source: {port: this,node: this.node}})
                else this.connect({target: {port: this,node: this.node}})
            }

            this.ui[s].insertAdjacentElement('beforeend', el)
        })

        this.ui.label.insertAdjacentElement('beforeend', this.ui.latency)
    }


    connect(e) {
        this.node.parent.addEdge(e)
    }

    checkForUpdates() {

    }
    

    init = (info = this.info) => {

        this.info = info
        Object.assign(this, info) // backwards compatibility (< 0.0.36)

        this.onchange = info.onchange ?? info.onUpdate ?? this.onchange // backwards compatibility (< 0.0.36)
        this.value = info.data // backwards compatibility (< 0.0.36)
        
        // Autoset Output Type
        if (this.output?.type === 'auto') this.output = this._getTypeDict(this.value)

        Object.keys(this.edges).forEach(s => {
            let nodeType
            let portInfo = this[s]
            nodeType = portInfo?.type
            if (nodeType instanceof Object) nodeType = portInfo.name ?? nodeType?.name
            let el = this.ui[s].children[0]
            let isActive = el.classList.contains('active')
            el.className = "";
            el.classList.add(`node-port`)
            el.classList.add(`port-${this.name}`)
            el.classList.add(`type-${nodeType}`)
            if (isActive) el.classList.add(`active`)

            el.setAttribute('data-node', this.node.uuid)
            el.setAttribute('data-port', this.name)
        })

        this.ui.label.innerHTML = `<span>${this.name}</span>`
        this.ui.label.classList.add('node-label')
        this.ui.label.setAttribute('name', this.name)
        this.ui.latency.setAttribute('name', this.name)
        this.ui.latency.classList.add('latency-display')


        if (this.node.app.editor) {
            this.ui.gui = this.node.app.editor.createObjectEditor({[this.name]:this}, this.name)
        }
    }

    deinit = () => {

        // Remove UI
        for (let key in this.ui) if (this.ui[key].remove instanceof Function) this.ui[key].remove() 

        // Remove Edges
        this.edges.input.forEach(e => e.deinit())
        this.edges.output.forEach(e => e.deinit())
    }

    addEdge = (side, edge) => {
        this.edges[side].set(edge.uuid,edge)
        this.ui[side].children[0].classList.add('active') // Label Active Node
    }

    removeEdge = (side, id) => {
        this.edges[side].delete(id)
        if (this.edges[side].size === 0)  this.ui[side].children[0].classList.remove('active') // Label Active Node
    }

    // Only Set when Different
    set = async (port=this, forceUpdate = false) => {

        let portCopy = this._copy(port) // avoids mutating original port object

        // Add Metadata
        if (!(portCopy.meta)) portCopy.meta = {}
        portCopy.meta.source = port // allows tracing where data has arrived from

        // Add User Data
        // if (!('id' in portCopy)) portCopy.id = this.node.session?.info?.auth?.id
        // if (!('username' in portCopy)) portCopy.username = this.node.session?.info?.auth?.username
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

            let visible = document.body.contains(this.ui.gui.container) // in DOM
            // && (this.ui.gui.container?.offsetParent != null) // not hidden

            if (visible) this._updateGUI() // update gui readout

            this.edges.output.forEach(o => {o.update()}) // Run Across Edges

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

    _updateGUI = () => {
        // Update Editor                    
        let oldValue
        let newValue
            
        let input = this.ui.gui.input

        // Filter for Displayable Inputs
        if (input && this.node.app.editor.elementTypesToUpdate.includes(input.tagName) && input.type != 'file'){
            if (input.type === 'checkbox') {
                oldValue = input.checked
                input.checked = this.value
                newValue = input.checked
            }
            else {
                oldValue = input.value
                if (this.value != null){ // FIX
                    if (input.tagName === 'TEXTAREA') newValue = JSON.stringify(this.value, null, '\t')
                    else newValue = this.value
                    input.value = newValue
                }
            }
        }
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

    getType = () => {

        let defaultType
        if (this.output?.type === null) defaultType = this.input?.type // Input if output is null
        else if (this.output?.type === undefined) defaultType = typeof this.data // Data type if output is undefined
        else defaultType = this.output?.type // Otherwise specified output type

        if (typeof defaultType !== 'string' && defaultType?.name) defaultType = defaultType.name
        if (defaultType === 'function') defaultType = 'Function'
        defaultType = (defaultType === "object" ? this.data instanceof HTMLElement : this.data && typeof this.data === "object" && this.data !== null && this.data.nodeType === 1 && typeof this.data.nodeName==="string") ? 'Element' : defaultType
        
        return defaultType
    }

    // Create Editor
    createEditor = (name, target, key, type) => {

        if (!this.ui[name].code) this.ui[name].code = document.createElement('div')

        this.ui[name].code.style = `
            width: 75vw;
            height: 75vh;
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 1000;
            transform: translate(-50%, -50%)
        `
        
        let settings = {}
        settings.onOpen = (res) => {
            document.body.insertAdjacentElement('beforeend', this.ui[name].code)
            this.ui[name].code.style.pointerEvents = 'all'
            this.ui[name].code.style.opacity = '1'
        }

        settings.onSave = (res) => {
            if (name === 'self') this.init()
            else if (name === 'value') {
                this.info.data = res.value // make persistent
                res.forceUpdate = true
                this.set(res)
            }
        }

        settings.onClose = (res) => {
            this.ui[name].code.style.pointerEvents = 'none'
            this.ui[name].code.style.opacity = '0'
            this.ui[name].code.remove()
        }

        if (['HTML', 'CSS', 'GLSL'].includes(type)) settings.language = type.toLowerCase() 
        else settings.language = 'javascript'
        
        settings.target = target
        settings.key = key

        this.ui[name].editor = new LiveEditor(settings, this.ui[name].code)
        settings.onClose()
    }

    // Create Value Editor
    createValueEditor = () => {
        this.createEditor('value', this, 'value', this.getType())
    }

    // Create Self Editor
    createSelfEditor = () => {
        this.createEditor('self', this, 'info')
    }


    edit = (name='value') => {
        if (this.ui[name].editor instanceof Function) this.ui[name].editor() // instantiate editor
        this.ui[name].editor.onOpen()
    }

    export = () => {
        let infoCopy = Object.assign({}, this.info)
        infoCopy.data = infoCopy.value ?? infoCopy.data // backwards compatibility (< 0.0.36)
        let isElement = infoCopy.data instanceof Element || infoCopy.data instanceof HTMLDocument
        if (infoCopy.data == undefined || isElement)  delete infoCopy.data
        return infoCopy
    }

}